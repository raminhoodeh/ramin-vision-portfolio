import { existsSync, readFileSync } from 'node:fs';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_MODEL = 'gemini-3.5-flash';
const DEFAULT_CONTEXT_CHAR_LIMIT = 600_000;
const DEFAULT_FILE_CHAR_LIMIT = 140_000;
const MAX_HISTORY_MESSAGES = 10;
const MAX_HISTORY_MESSAGE_CHARS = 3_000;
const MAX_VISITOR_MESSAGE_CHARS = 4_000;

const CONTEXT_PATHS = [
  'ramin-hoodeh-exp-context.md',
  'portfolio-content-enrichment.md',
  'portfolio-source-registry.md',
  'updated-portfolio-data-structure-template.md',
  'general-thoughts',
  'projects-section',
  'thoughts-section/talks',
  'thoughts-section/courses',
  'thoughts-section/books',
  'thoughts-section/case-study-write-ups/Framework of Metacognition.md',
  'thoughts-section/case-study-write-ups/framework-of-reality-info.md',
  'thoughts-section/case-study-write-ups/framework-of-reality-full-text.md',
];

const EXCLUDED_CONTEXT_FILE_PATTERNS = [
  /Projects Write-up-Structure-to-follow\.md$/i,
];

let cachedContext = null;
let envLoaded = false;

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;

  const separator = trimmed.indexOf('=');
  if (separator === -1) return null;

  const key = trimmed.slice(0, separator).trim();
  let value = trimmed.slice(separator + 1).trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return key ? [key, value] : null;
}

function loadLocalEnv() {
  if (envLoaded) return;
  envLoaded = true;

  for (const fileName of ['.env.local', '.env']) {
    const filePath = path.join(ROOT_DIR, fileName);
    if (!existsSync(filePath)) continue;

    const file = readFileSync(filePath, 'utf8');
    for (const line of file.split(/\r?\n/)) {
      const parsed = parseEnvLine(line);
      if (!parsed) continue;

      const [key, value] = parsed;
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  }
}

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normaliseMarkdown(markdown) {
  return markdown
    .replace(/\r\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
}

function truncate(text, limit) {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit)}\n\n[Content truncated at ${limit.toLocaleString()} characters.]`;
}

async function collectMarkdownFiles(entryPath) {
  const fullPath = path.join(ROOT_DIR, entryPath);

  try {
    const entryStat = await stat(fullPath);

    if (entryStat.isFile()) {
      return fullPath.endsWith('.md') ? [fullPath] : [];
    }

    if (!entryStat.isDirectory()) return [];
  } catch {
    return [];
  }

  const children = await readdir(fullPath, { withFileTypes: true });
  const files = await Promise.all(
    children.map(async (child) => {
      const childPath = path.join(entryPath, child.name);
      if (child.isDirectory()) return collectMarkdownFiles(childPath);
      if (!child.isFile() || !child.name.endsWith('.md')) return [];
      return [path.join(ROOT_DIR, childPath)];
    }),
  );

  return files.flat();
}

function isExcludedContextFile(filePath) {
  const relativePath = path.relative(ROOT_DIR, filePath);
  return EXCLUDED_CONTEXT_FILE_PATTERNS.some((pattern) => pattern.test(relativePath));
}

async function loadPortfolioContext() {
  if (cachedContext) return cachedContext;

  const contextCharLimit = toNumber(process.env.AI_RAMIN_CONTEXT_CHARS, DEFAULT_CONTEXT_CHAR_LIMIT);
  const fileCharLimit = toNumber(process.env.AI_RAMIN_FILE_CHARS, DEFAULT_FILE_CHAR_LIMIT);
  const seen = new Set();
  const contextChunks = [];
  const sources = [];
  let remaining = contextCharLimit;

  for (const entryPath of CONTEXT_PATHS) {
    const files = await collectMarkdownFiles(entryPath);
    files.sort((a, b) => a.localeCompare(b));

    for (const filePath of files) {
      if (remaining <= 0) break;
      if (isExcludedContextFile(filePath)) continue;

      const relativePath = path.relative(ROOT_DIR, filePath);
      if (seen.has(relativePath)) continue;
      seen.add(relativePath);

      const rawMarkdown = await readFile(filePath, 'utf8');
      const markdown = truncate(normaliseMarkdown(rawMarkdown), Math.min(fileCharLimit, remaining));
      const chunk = `# Source: ${relativePath}\n\n${markdown}`;

      contextChunks.push(chunk);
      sources.push(relativePath);
      remaining -= chunk.length + 4;
    }
  }

  cachedContext = {
    text: contextChunks.join('\n\n---\n\n'),
    sources,
    truncated: remaining <= 0,
  };

  return cachedContext;
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 80_000) {
        reject(new Error('Request body is too large.'));
        req.destroy();
      }
    });

    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function toGeminiHistory(messages) {
  if (!Array.isArray(messages)) return [];

  return messages
    .filter((message) => message && (message.role === 'user' || message.role === 'assistant'))
    .slice(-MAX_HISTORY_MESSAGES)
    .map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [
        {
          text: String(message.content ?? '').slice(0, MAX_HISTORY_MESSAGE_CHARS),
        },
      ],
    }))
    .filter((message) => message.parts[0].text.trim());
}

function extractGeminiText(payload) {
  return payload?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .filter(Boolean)
    .join('\n')
    .trim();
}

function getGeminiModelPath() {
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  return model.startsWith('models/') ? model : `models/${model}`;
}

function buildSystemInstruction() {
  return [
    "You are AI Ramin, Ramin Hoodeh's portfolio copilot embedded in his website.",
    'Answer visitors using the supplied portfolio context, which contains Ramin’s work history, projects, writing, talks, courses, and product philosophy.',
    'Default to speaking about Ramin in third person. If the visitor asks for first-person copy, clearly draft it in Ramin’s voice.',
    'Be direct, specific, and useful. Avoid generic portfolio filler.',
    'Prefer concrete evidence: company names, project names, product surfaces, talks, written work, domains, and artifacts from the context.',
    'Do not invent dates, metrics, employers, client names, credentials, outcomes, or current availability. If the context does not contain a fact, say that you do not have that detail.',
    'For hiring, collaboration, or product questions, answer with the likely approach and the supporting proof from the portfolio context.',
    'Keep responses concise enough for a website chat: usually 2-5 short paragraphs or bullets. Use a short “Relevant proof” list when it helps.',
  ].join('\n');
}

export async function handleAiRaminRequest(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Use POST for AI Ramin chat requests.' });
    return;
  }

  loadLocalEnv();

  if (!process.env.GEMINI_API_KEY) {
    sendJson(res, 500, {
      error: 'Gemini API key is not configured. Add GEMINI_API_KEY to .env.local and restart the dev server.',
    });
    return;
  }

  let payload;
  try {
    const body = await readRequestBody(req);
    payload = JSON.parse(body || '{}');
  } catch {
    sendJson(res, 400, { error: 'Invalid JSON request body.' });
    return;
  }

  const visitorMessage = String(payload.message ?? '').trim().slice(0, MAX_VISITOR_MESSAGE_CHARS);
  if (!visitorMessage) {
    sendJson(res, 400, { error: 'Message is required.' });
    return;
  }

  const portfolioContext = await loadPortfolioContext();
  const modelPath = getGeminiModelPath();
  const geminiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: buildSystemInstruction() }],
        },
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Use this portfolio context as the source of truth for this conversation.\n\n${portfolioContext.text}`,
              },
            ],
          },
          {
            role: 'model',
            parts: [
              {
                text: 'Understood. I will answer using this portfolio context and avoid unsupported claims.',
              },
            ],
          },
          ...toGeminiHistory(payload.history),
          {
            role: 'user',
            parts: [{ text: visitorMessage }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 1_100,
          responseMimeType: 'text/plain',
        },
      }),
    },
  );

  const responsePayload = await geminiResponse.json().catch(() => null);

  if (!geminiResponse.ok) {
    sendJson(res, geminiResponse.status, {
      error: responsePayload?.error?.message || 'Gemini request failed.',
    });
    return;
  }

  const answer = extractGeminiText(responsePayload);
  if (!answer) {
    sendJson(res, 502, { error: 'Gemini returned an empty response.' });
    return;
  }

  sendJson(res, 200, {
    answer,
    model: modelPath.replace(/^models\//, ''),
    contextSources: portfolioContext.sources,
    contextTruncated: portfolioContext.truncated,
  });
}
