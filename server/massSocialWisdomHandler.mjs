import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from 'docx';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOCAL_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), 'ramin-portfolio')
  : path.join(ROOT_DIR, '.local');
const USAGE_FILE = path.join(LOCAL_DIR, 'mass-social-wisdom-usage.json');

const SOCIAVAULT_BASE = 'https://api.sociavault.com/v1/scrape';
const AI_GATEWAY_BASE_URL = 'https://ai-gateway.vercel.sh/v1';
const DEFAULT_AI_GATEWAY_MODEL = 'google/gemini-2.5-flash';

const DAILY_SUBMISSION_LIMIT = 20;
const DAILY_TRANSCRIPTION_LIMIT = 200;
const MAX_URLS_PER_SUBMISSION = 10;

const CATEGORIES = [
  'Health & Wellbeing',
  'AI or Technology Advice',
  'Finance or Trading Advice or Tools',
  'Film or Movies or TV Shows',
  'Personal Branding or UGC or Social Media Tips',
  'Conspiracy Theories or Esoteric',
  'Romantic Relationships',
  'Other',
];

const STAGES = ['Inspect', 'Route', 'Transcribe', 'Compose', 'Self-Assess', 'Categorise', 'Sort', 'Export'];
const URL_RE = /https?:\/\/(?:[-\w]+\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?/gi;
const jobs = new Map();
const TRANSCRIPT_TIMEOUT_MS_BY_SOURCE = {
  instagram: 55_000,
  youtube: 80_000,
  tiktok: 55_000,
  twitter: 55_000,
};

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

function getSociaVaultApiKey() {
  loadLocalEnv();
  return process.env.SOCIAVAULT_API_KEY || '';
}

function getGeminiApiKey() {
  loadLocalEnv();
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
}

function getGeminiModel() {
  loadLocalEnv();
  return process.env.GEMINI_MODEL || 'gemini-2.5-flash';
}

function getAiGatewayApiKey() {
  loadLocalEnv();
  return process.env.AI_GATEWAY_API_KEY || '';
}

function getAiGatewayModel() {
  loadLocalEnv();
  const rawModel = String(process.env.AI_GATEWAY_MODEL || process.env.GEMINI_MODEL || '').trim();
  if (!rawModel) return DEFAULT_AI_GATEWAY_MODEL;
  const cleanModel = rawModel.replace(/^models\//, '');
  if (cleanModel.includes('/')) return cleanModel;
  return cleanModel.startsWith('gemini-') ? `google/${cleanModel}` : cleanModel;
}

async function aiGatewayComposeJson(prompt) {
  const aiGatewayApiKey = getAiGatewayApiKey();
  if (!aiGatewayApiKey) return null;

  const model = getAiGatewayModel();
  const response = await fetch(`${AI_GATEWAY_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${aiGatewayApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 6_000,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`AI Gateway ${response.status}: ${JSON.stringify(payload).slice(0, 260)}`);
  }

  const rawText = String(payload?.choices?.[0]?.message?.content || '');
  return { parsed: parseGeminiJson(rawText), model };
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, text) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(text);
}

async function readJsonBody(req, maxBytes = 80_000) {
  const chunks = [];
  let totalBytes = 0;

  for await (const chunk of req) {
    totalBytes += chunk.length;
    if (totalBytes > maxBytes) throw new Error('Request body too large.');
    chunks.push(chunk);
  }

  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

async function readUsage() {
  try {
    const parsed = JSON.parse(await readFile(USAGE_FILE, 'utf8'));
    if (parsed.date === todayKey()) {
      return {
        date: parsed.date,
        submissions: Number(parsed.submissions) || 0,
        transcriptions: Number(parsed.transcriptions) || 0,
      };
    }
  } catch {
    // Missing or invalid local usage file should reset gracefully.
  }

  return { date: todayKey(), submissions: 0, transcriptions: 0 };
}

async function writeUsage(usage) {
  await mkdir(LOCAL_DIR, { recursive: true });
  await writeFile(USAGE_FILE, JSON.stringify(usage, null, 2));
}

async function getQuotaState() {
  const usage = await readUsage();
  return {
    date: usage.date,
    submissionsUsed: usage.submissions,
    submissionsLimit: DAILY_SUBMISSION_LIMIT,
    submissionsRemaining: Math.max(0, DAILY_SUBMISSION_LIMIT - usage.submissions),
    transcriptionsUsed: usage.transcriptions,
    transcriptionsLimit: DAILY_TRANSCRIPTION_LIMIT,
    transcriptionsRemaining: Math.max(0, DAILY_TRANSCRIPTION_LIMIT - usage.transcriptions),
    maxUrlsPerSubmission: MAX_URLS_PER_SUBMISSION,
  };
}

async function reserveQuota(transcriptionCount) {
  const usage = await readUsage();

  if (usage.submissions + 1 > DAILY_SUBMISSION_LIMIT) {
    return {
      ok: false,
      message: `Daily submission cap reached. This public demo allows ${DAILY_SUBMISSION_LIMIT} runs per day.`,
      quota: await getQuotaState(),
    };
  }

  if (usage.transcriptions + transcriptionCount > DAILY_TRANSCRIPTION_LIMIT) {
    return {
      ok: false,
      message: `Daily transcription cap reached. This public demo allows ${DAILY_TRANSCRIPTION_LIMIT} URL transcriptions per day.`,
      quota: await getQuotaState(),
    };
  }

  const nextUsage = {
    date: usage.date,
    submissions: usage.submissions + 1,
    transcriptions: usage.transcriptions + transcriptionCount,
  };
  await writeUsage(nextUsage);

  return { ok: true, quota: await getQuotaState() };
}

function extractUrls(text) {
  const matches = String(text || '').match(URL_RE) || [];
  const seen = new Set();

  return matches
    .map((url) => url.replace(/[.,;)"']+$/g, '').trim())
    .filter(Boolean)
    .map(normaliseUrl)
    .filter((url) => {
      const key = url.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function normaliseUrl(rawUrl) {
  try {
    const url = new URL(rawUrl.trim());
    url.hash = '';

    if (url.hostname.includes('instagram.com')) {
      if (url.pathname.startsWith('/accounts/login')) {
        const nextUrl = url.searchParams.get('next');
        if (nextUrl) return normaliseUrl(decodeURIComponent(nextUrl));
      }
      url.pathname = url.pathname.replace('/reels/', '/reel/');
      url.search = '';
      return url.toString();
    }

    if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
      url.hostname = url.hostname.replace('m.youtube.com', 'www.youtube.com');
      if (url.hostname.includes('youtube.com') && url.pathname === '/watch') {
        const videoId = url.searchParams.get('v');
        url.search = videoId ? `?v=${videoId}` : '';
      } else {
        url.search = '';
      }
      return url.toString();
    }

    if (url.hostname.includes('tiktok.com')) {
      url.search = '';
      return url.toString();
    }

    if (url.hostname.includes('x.com') || url.hostname.includes('twitter.com')) {
      url.search = '';
      url.pathname = url.pathname.replace(/(\/status\/[^/]+)\/video\/\d+\/?$/i, '$1');
      return url.toString();
    }

    return url.toString();
  } catch {
    return rawUrl.trim();
  }
}

function classifyUrl(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname.toLowerCase();

    if (host.includes('youtube.com') || host.includes('youtu.be')) return 'youtube';
    if (host.includes('tiktok.com') && pathname.includes('/video/')) return 'tiktok';
    if (host.includes('instagram.com') && (pathname.includes('/reel/') || pathname.includes('/p/'))) return 'instagram';
    if ((host === 'x.com' || host.endsWith('.x.com') || host.includes('twitter.com')) && pathname.includes('/status/')) {
      return 'twitter';
    }
    return 'unsupported';
  } catch {
    return 'unsupported';
  }
}

function getSociaVaultEndpoint(sourceType) {
  if (sourceType === 'youtube') return 'youtube/video/transcript';
  if (sourceType === 'instagram') return 'instagram/transcript';
  if (sourceType === 'tiktok') return 'tiktok/transcript';
  if (sourceType === 'twitter') return 'twitter/tweet/transcript';
  return null;
}

function getSourceLabel(sourceType) {
  if (sourceType === 'youtube') return 'YouTube';
  if (sourceType === 'instagram') return 'Instagram';
  if (sourceType === 'tiktok') return 'TikTok';
  if (sourceType === 'twitter') return 'X / Twitter';
  return 'Unsupported source';
}

function pushLog(job, message) {
  job.log.push({
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    message,
  });
}

function setStage(job, stage) {
  job.stage = stage;
  pushLog(job, `${stage} · ${stage === 'Export' ? 'Preparing output package.' : 'Stage active.'}`);
}

function getTranscriptTimeoutMs(sourceType) {
  return TRANSCRIPT_TIMEOUT_MS_BY_SOURCE[sourceType] || 45_000;
}

function formatTimeout(timeoutMs) {
  return `${Math.round(timeoutMs / 1000)}s`;
}

function formatSociaVaultError(status, text) {
  try {
    const payload = JSON.parse(text);
    if (payload?.error) return `SociaVault ${status}: ${payload.error}`;
  } catch {
    // Non-JSON API errors should still be surfaced below.
  }

  return `SociaVault ${status}: ${text.slice(0, 260)}`;
}

async function sociaVaultGet(endpoint, params, timeoutMs = 120_000) {
  const apiKey = getSociaVaultApiKey();
  if (!apiKey) throw new Error('SOCIAVAULT_API_KEY is not configured.');

  const url = new URL(`${SOCIAVAULT_BASE}/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        'X-API-Key': apiKey,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(formatSociaVaultError(response.status, text));
    }

    return text ? JSON.parse(text) : {};
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error(`SociaVault request timed out after ${formatTimeout(timeoutMs)}.`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function cleanTranscriptText(value) {
  return String(value || '')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => {
      if (!line || line === 'WEBVTT') return false;
      if (/^\d+$/.test(line)) return false;
      if (/^\d{1,2}:\d{2}:\d{2}[.,]\d{3}\s+-->\s+\d{1,2}:\d{2}:\d{2}[.,]\d{3}/.test(line)) return false;
      return true;
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function collectTranscriptStrings(value, keyHint = '') {
  if (!value) return [];

  if (typeof value === 'string') {
    return /transcript|transcripts|text|caption/i.test(keyHint) ? [value] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectTranscriptStrings(item, keyHint));
  }

  if (typeof value === 'object') {
    return Object.entries(value).flatMap(([key, nested]) => {
      if (/^(transcript|transcripts|text|caption|captions|subtitles)$/i.test(key)) {
        if (typeof nested === 'string') return [nested];
        return collectTranscriptStrings(nested, key);
      }
      return collectTranscriptStrings(nested, key);
    });
  }

  return [];
}

function extractTranscriptText(data) {
  const candidates = collectTranscriptStrings(data)
    .map(cleanTranscriptText)
    .filter((text) => text.length > 24);

  if (!candidates.length) return '';
  return [...new Set(candidates)].join('\n\n');
}

function categoryFromKeywords(text) {
  const lower = text.toLowerCase();
  if (/\b(polymarket|kalshi|trading|stock|forex|crypto|bitcoin|options|market|investing)\b/.test(lower)) {
    return 'Finance or Trading Advice or Tools';
  }
  if (/\b(ai|llm|gemini|openai|claude|prompt|agent|automation|software|developer|coding)\b/.test(lower)) {
    return 'AI or Technology Advice';
  }
  if (/\b(health|sleep|fitness|nutrition|training|zone 2|heart rate|metabolic)\b/.test(lower)) {
    return 'Health & Wellbeing';
  }
  if (/\b(film|movie|cinema|tv|series|director)\b/.test(lower)) {
    return 'Film or Movies or TV Shows';
  }
  if (/\b(brand|creator|ugc|content|followers|audience|social media)\b/.test(lower)) {
    return 'Personal Branding or UGC or Social Media Tips';
  }
  if (/\b(dating|relationship|love|girlfriend|boyfriend|romance|rizz|marriage)\b/.test(lower)) {
    return 'Romantic Relationships';
  }
  if (/\b(conspiracy|esoteric|symbolism|occult|hidden)\b/.test(lower)) {
    return 'Conspiracy Theories or Esoteric';
  }
  return 'Other';
}

function truncateForModel(text, maxChars = 30_000) {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}\n\n[Transcript truncated for processing.]`;
}

function removeSpeechFillers(text) {
  return String(text || '')
    .replace(/\b(?:um+|uh+|er+|erm+|ah+|hmm+)\b[,\s]*/gi, '')
    .replace(/\b(?:you know|i mean|sort of|kind of)\b[,\s]*/gi, '')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function splitSentences(paragraph) {
  return String(paragraph || '')
    .match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g)
    ?.map((sentence) => sentence.trim())
    .filter(Boolean) || [];
}

function chunkWords(text, maxWords = 90) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const chunks = [];

  for (let index = 0; index < words.length; index += maxWords) {
    chunks.push(words.slice(index, index + maxWords).join(' '));
  }

  return chunks;
}

function paragraphiseProse(text) {
  const prose = String(text || '').replace(/\s+/g, ' ').trim();
  if (!prose) return [];

  const sentences = splitSentences(prose);
  if (sentences.length < 2) {
    return prose.length > 720 ? chunkWords(prose) : [prose];
  }

  const paragraphs = [];
  let current = [];
  let currentLength = 0;

  for (const sentence of sentences) {
    current.push(sentence);
    currentLength += sentence.length;

    if (current.length >= 4 || currentLength >= 520) {
      paragraphs.push(current.join(' '));
      current = [];
      currentLength = 0;
    }
  }

  if (current.length) paragraphs.push(current.join(' '));
  return paragraphs;
}

function paragraphiseTranscript(text) {
  const lines = String(text || '')
    .replace(/\n{3,}/g, '\n\n')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const blocks = [];
  let proseBuffer = [];
  let bulletBuffer = [];

  const flushProse = () => {
    if (!proseBuffer.length) return;
    blocks.push(...paragraphiseProse(proseBuffer.join(' ')));
    proseBuffer = [];
  };

  const flushBullets = () => {
    if (!bulletBuffer.length) return;
    blocks.push(bulletBuffer.join('\n'));
    bulletBuffer = [];
  };

  for (const line of lines) {
    const normalisedLine = line.replace(/^\s*[•*]\s+/, '- ');
    if (/^-\s+\S/.test(normalisedLine)) {
      flushProse();
      bulletBuffer.push(normalisedLine);
    } else {
      flushBullets();
      proseBuffer.push(normalisedLine);
    }
  }

  flushProse();
  flushBullets();

  return blocks.join('\n\n');
}

function formatComposedTranscription(text) {
  const cleaned = removeSpeechFillers(text)
    .replace(/\r/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s*[•*]\s+/gm, '- ')
    .trim();

  return paragraphiseTranscript(cleaned);
}

function cleanStructuredParagraph(text) {
  return removeSpeechFillers(text)
    .replace(/\r/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s*[•*]\s+/gm, '- ')
    .trim();
}

function splitParagraphBlocks(text) {
  return paragraphiseTranscript(cleanStructuredParagraph(text))
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
}

function buildFallbackSections(text, sourceType) {
  const blocks = splitParagraphBlocks(text);
  if (!blocks.length) {
    return [{
      heading: `${getSourceLabel(sourceType)} notes`,
      paragraphs: ['No readable transcription content was returned.'],
    }];
  }

  if (blocks.length <= 3) {
    return [{
      heading: 'Key ideas',
      paragraphs: blocks,
    }];
  }

  const headings = ['Main argument', 'Supporting detail', 'Practical takeaways'];
  const chunkSize = Math.ceil(blocks.length / headings.length);

  return headings.map((heading, index) => ({
    heading,
    paragraphs: blocks.slice(index * chunkSize, (index + 1) * chunkSize),
  })).filter((section) => section.paragraphs.length > 0);
}

function normaliseSections(rawSections, fallbackText, sourceType) {
  if (!Array.isArray(rawSections)) return buildFallbackSections(fallbackText, sourceType);

  const sections = rawSections.map((section) => {
    const heading = String(section?.heading || section?.title || 'Key ideas')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 96);
    const rawParagraphs = Array.isArray(section?.paragraphs)
      ? section.paragraphs
      : [section?.body || section?.text || section?.content || ''];
    const paragraphs = rawParagraphs
      .flatMap((paragraph) => splitParagraphBlocks(paragraph))
      .filter((paragraph) => paragraph.length > 0);

    return {
      heading: heading || 'Key ideas',
      paragraphs,
    };
  }).filter((section) => section.paragraphs.length > 0);

  return sections.length ? sections : buildFallbackSections(fallbackText, sourceType);
}

function sectionsToTranscription(sections) {
  return sections
    .map((section) => {
      const heading = section.heading ? `${section.heading}\n\n` : '';
      return `${heading}${section.paragraphs.join('\n\n')}`.trim();
    })
    .filter(Boolean)
    .join('\n\n');
}

function calculateContentDepthScore({ transcript, transcription, sections }) {
  const sourceLength = cleanTranscriptText(transcript).length;
  const outputLength = cleanTranscriptText(transcription).length;
  const effectiveLength = Math.max(sourceLength, outputLength);
  const sectionCount = Array.isArray(sections) ? sections.length : 0;
  const paragraphCount = Array.isArray(sections)
    ? sections.reduce((total, section) => total + (Array.isArray(section.paragraphs) ? section.paragraphs.length : 0), 0)
    : 0;

  let score = 1;
  if (effectiveLength >= 6_000) score = 5;
  else if (effectiveLength >= 1_800) score = 4;
  else if (effectiveLength >= 450) score = 3;
  else if (effectiveLength >= 180) score = 2;

  if (sectionCount >= 3 && paragraphCount >= 6 && effectiveLength >= 1_200) score = Math.max(score, 4);
  if (sectionCount >= 5 && paragraphCount >= 10 && effectiveLength >= 4_000) score = 5;

  return Math.min(5, Math.max(1, score));
}

function normaliseComposition(parsed, transcript, sourceType, modelUsed) {
  const fallbackText = parsed?.transcription || transcript;
  const sections = normaliseSections(parsed?.sections, fallbackText, sourceType);
  const transcription = sectionsToTranscription(sections);
  const allowedCategory = CATEGORIES.includes(parsed?.category)
    ? parsed.category
    : categoryFromKeywords(transcription || transcript);

  return {
    title: String(parsed?.title || `${getSourceLabel(sourceType)} transcription`).slice(0, 120),
    transcription,
    sections,
    category: allowedCategory,
    qualityScore: calculateContentDepthScore({ transcript, transcription, sections }),
    modelUsed,
  };
}

function parseGeminiJson(text) {
  const trimmed = String(text || '').trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Gemini did not return JSON.');
    return JSON.parse(match[0]);
  }
}

async function geminiCompose({ transcript, url, sourceType }) {
  const geminiApiKey = getGeminiApiKey();
  const geminiModel = getGeminiModel();
  const hasAiGatewayApiKey = Boolean(getAiGatewayApiKey());

  const fallbackComposition = (modelUsed = 'raw-transcript-fallback') => {
    const sections = buildFallbackSections(transcript, sourceType);
    const transcription = sectionsToTranscription(sections);

    return {
      title: `${getSourceLabel(sourceType)} transcription`,
      transcription,
      sections,
      category: categoryFromKeywords(transcription || transcript),
      qualityScore: calculateContentDepthScore({ transcript, transcription, sections }),
      modelUsed,
    };
  };

  if (!geminiApiKey && !hasAiGatewayApiKey) {
    return fallbackComposition();
  }

  const prompt = `You are the Mass Social Wisdom Agent embedded in an AI product manager portfolio.

Your task: combine the raw extracted transcript into a cohesive personal-knowledge-base entry.

Follow the original Mass Social Wisdom Agent behaviour:
- Preserve all meaningful details, anecdotes, examples, claims, names, numbers, steps, and practical advice.
- Do not aggressively summarise. Keep the output detailed and faithful to the source.
- Fix grammar, capitalisation, punctuation, filler words, false starts, and messy transcript phrasing.
- Write in natural, flowing prose.
- Organise long content by real topic changes using section headings. Do not invent topics.
- For short clips, use one section. For medium clips, use 2-3 sections. For long talks, use 3-6 sections.

Formatting rules:
- Each section heading should be specific, 2-7 words, and describe the topic of that section.
- Each paragraph must be a complete natural paragraph, usually 2-4 sentences.
- Never insert a paragraph break inside a sentence.
- Never create one-line fragments as paragraphs.
- Use bullet-style paragraphs only for genuine lists, frameworks, steps, or grouped advice.
- Do not include timestamps, stage notes, apologies, markdown tables, or commentary about being an AI.

Choose exactly one category from this list:
${CATEGORIES.map((category) => `- ${category}`).join('\n')}

Return strict JSON with exactly these keys:
{
  "title": "short descriptive title",
  "category": "one allowed category",
  "sections": [
    {
      "heading": "specific topic heading",
      "paragraphs": [
        "complete natural paragraph with no arbitrary line breaks",
        "another complete paragraph if needed"
      ]
    }
  ]
}

Source type: ${getSourceLabel(sourceType)}
Source URL: ${url}

Raw transcript:
${truncateForModel(transcript)}`;

  if (hasAiGatewayApiKey) {
    try {
      const { parsed, model } = await aiGatewayComposeJson(prompt);
      return normaliseComposition(parsed, transcript, sourceType, model);
    } catch (error) {
      if (!geminiApiKey) {
        return fallbackComposition('raw-transcript-fallback-after-ai-gateway-error');
      }
    }
  }

  if (!geminiApiKey) {
    return fallbackComposition();
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent?key=${encodeURIComponent(geminiApiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      }),
    },
  );

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Gemini ${response.status}: ${JSON.stringify(payload).slice(0, 260)}`);
  }

  const rawText = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('\n') || '';
  const parsed = parseGeminiJson(rawText);
  return normaliseComposition(parsed, transcript, sourceType, geminiModel);
}

async function processSingleUrl(job, url, index, total) {
  const sourceType = classifyUrl(url);
  const endpoint = getSociaVaultEndpoint(sourceType);

  pushLog(job, `Route · ${index + 1}/${total} · ${getSourceLabel(sourceType)} · ${url}`);

  if (!endpoint) {
    throw new Error('Unsupported URL. This demo currently accepts YouTube, Instagram post/reel, TikTok video, and X/Twitter video URLs.');
  }

  setStage(job, 'Transcribe');
  const params = sourceType === 'tiktok'
    ? { url, language: 'en', use_ai_as_fallback: false }
    : { url };
  const timeoutMs = getTranscriptTimeoutMs(sourceType);
  pushLog(job, `Transcribe · Request sent to SociaVault with ${formatTimeout(timeoutMs)} timeout.`);
  const transcriptPayload = await sociaVaultGet(endpoint, params, timeoutMs);
  const transcript = extractTranscriptText(transcriptPayload);

  if (!transcript) {
    throw new Error('No transcript text was returned for this URL.');
  }

  pushLog(job, `Transcribe · ${cleanTranscriptText(transcript).length.toLocaleString()} characters received.`);
  setStage(job, 'Compose');
  const composed = await geminiCompose({ transcript, url, sourceType });
  setStage(job, 'Self-Assess');
  pushLog(job, `Self-Assess · Content depth ${composed.qualityScore}/5.`);
  setStage(job, 'Categorise');
  pushLog(job, `Categorise · ${composed.category}.`);

  const item = {
    id: crypto.randomUUID(),
    url,
    sourceType,
    sourceLabel: getSourceLabel(sourceType),
    title: composed.title,
    category: composed.category,
    qualityScore: composed.qualityScore,
    transcription: composed.transcription,
    sections: composed.sections,
    modelUsed: composed.modelUsed,
  };

  job.liveItems.push(item);
  pushLog(job, `Done · Output card created for ${getSourceLabel(sourceType)} source.`);
}

function sortItems(items) {
  return [...items].sort((a, b) => {
    const categoryDelta = CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category);
    if (categoryDelta !== 0) return categoryDelta;
    return a.title.localeCompare(b.title);
  });
}

async function runJob(jobId) {
  const job = jobs.get(jobId);
  if (!job) return;

  try {
    setStage(job, 'Inspect');
    pushLog(job, `Inspect · ${job.urls.length} URL${job.urls.length === 1 ? '' : 's'} accepted for this run.`);
    setStage(job, 'Route');

    for (let index = 0; index < job.urls.length; index += 1) {
      if (job.stopRequested) {
        pushLog(job, 'Stop · Stop requested. Saving completed items.');
        break;
      }

      const url = job.urls[index];
      try {
        await processSingleUrl(job, url, index, job.urls.length);
      } catch (error) {
        job.failedUrls.push({ url, message: error.message });
        pushLog(job, `Failed · ${url} · ${error.message}`);
      }
    }

    if (!job.liveItems.length && job.failedUrls.length) {
      job.status = 'error';
      job.error = 'No transcriptions could be created for this run.';
      job.completedAt = new Date().toISOString();
      pushLog(job, `Error · ${job.error}`);
      return;
    }

    setStage(job, 'Sort');
    job.liveItems = sortItems(job.liveItems);
    setStage(job, 'Export');
    job.status = job.stopRequested ? 'stopped' : 'done';
    job.completedAt = new Date().toISOString();
    pushLog(job, `Export · ${job.liveItems.length} item${job.liveItems.length === 1 ? '' : 's'} ready for .docx download.`);
  } catch (error) {
    job.status = 'error';
    job.error = error.message;
    job.completedAt = new Date().toISOString();
    pushLog(job, `Error · ${error.message}`);
  }
}

function serialiseJob(job) {
  return {
    id: job.id,
    status: job.status,
    stage: job.stage,
    createdAt: job.createdAt,
    completedAt: job.completedAt,
    urls: job.urls,
    liveItems: job.liveItems,
    log: job.log,
    failedUrls: job.failedUrls,
    error: job.error,
    stages: STAGES,
    resultReady: job.liveItems.length > 0,
    quota: job.quota,
  };
}

function createJob(urls, quota, { autoRun = true } = {}) {
  const id = crypto.randomUUID();
  const job = {
    id,
    urls,
    status: 'running',
    stage: 'Queued',
    createdAt: new Date().toISOString(),
    completedAt: null,
    liveItems: [],
    failedUrls: [],
    log: [],
    stopRequested: false,
    error: null,
    quota,
  };

  jobs.set(id, job);
  if (autoRun) {
    queueMicrotask(() => {
      void runJob(id);
    });
  }

  return job;
}

function groupedItemsForDoc(items) {
  return CATEGORIES.map((category) => ({
    category,
    items: items.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);
}

function createDocParagraph(text, options = {}) {
  return new Paragraph({
    children: [new TextRun({ text, ...options.run })],
    spacing: { before: 0, after: 170, line: 320, ...options.spacing },
    ...options.paragraph,
  });
}

function createDocMetaParagraph(label, value) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true, color: '5F6F82', size: 19 }),
      new TextRun({ text: value, color: '5F6F82', size: 19 }),
    ],
    spacing: { before: 0, after: 65, line: 260 },
  });
}

function appendDocParagraphBlock(children, block) {
  const lines = String(block || '').split(/\n/).map((line) => line.trim()).filter(Boolean);
  const isBulletBlock = lines.length > 0 && lines.every((line) => /^-\s+\S/.test(line));

  if (isBulletBlock) {
    for (const line of lines) {
      children.push(new Paragraph({
        children: [new TextRun({ text: line.replace(/^-\s+/, ''), size: 22, color: '1F2937' })],
        bullet: { level: 0 },
        spacing: { before: 0, after: 95, line: 300 },
      }));
    }
    return;
  }

  for (const paragraph of paragraphiseProse(lines.join(' '))) {
    children.push(createDocParagraph(paragraph, {
      run: { size: 22, color: '1F2937' },
      spacing: { after: 180, line: 330 },
    }));
  }
}

function appendTranscriptionSections(children, item) {
  const sections = normaliseSections(item.sections, item.transcription || '', item.sourceType);

  for (const section of sections) {
    children.push(new Paragraph({
      children: [new TextRun({ text: section.heading, bold: true, size: 22, color: '334155' })],
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 140, after: 80 },
    }));

    for (const paragraph of section.paragraphs) {
      appendDocParagraphBlock(children, paragraph);
    }
  }
}

async function createDocxBuffer(job) {
  const children = [
    new Paragraph({
      children: [new TextRun({ text: 'Mass Social Wisdom Agent Export', bold: true, size: 36, color: '111827' })],
      heading: HeadingLevel.TITLE,
      spacing: { before: 0, after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Generated ${new Date().toLocaleString('en-GB')} · ${job.liveItems.length} organised transcription${job.liveItems.length === 1 ? '' : 's'}`,
          italics: true,
          color: '64748B',
          size: 20,
        }),
      ],
      spacing: { before: 0, after: 260 },
    }),
  ];

  for (const group of groupedItemsForDoc(job.liveItems)) {
    children.push(new Paragraph({
      children: [new TextRun({ text: group.category, bold: true, size: 28, color: '26384F' })],
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 140 },
    }));

    for (const item of group.items) {
      children.push(new Paragraph({
        children: [new TextRun({ text: item.title, bold: true, size: 25, color: '111827' })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 120, after: 90 },
      }));
      children.push(createDocMetaParagraph('Source', item.url));
      children.push(createDocMetaParagraph('Content depth', `${item.qualityScore}/5 · ${item.sourceLabel}${item.modelUsed ? ` · ${item.modelUsed}` : ''}`));
      children.push(new Paragraph({ spacing: { before: 0, after: 80 } }));
      appendTranscriptionSections(children, item);
      children.push(new Paragraph({ spacing: { before: 80, after: 120 } }));
    }
  }

  const document = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 900,
            right: 900,
            bottom: 900,
            left: 900,
          },
        },
      },
      children,
    }],
  });

  return Packer.toBuffer(document);
}

async function handleCreateJob(req, res) {
  if (!getSociaVaultApiKey()) {
    sendJson(res, 503, {
      error: 'SOCIAVAULT_API_KEY is not configured on the portfolio server.',
      detail: 'Add SOCIAVAULT_API_KEY to .env to enable live transcription. GEMINI_API_KEY is optional but recommended for composed, categorised output.',
      quota: await getQuotaState(),
    });
    return;
  }

  const body = await readJsonBody(req);
  const urls = extractUrls(body.urlsText || body.urls_text || '');

  if (!urls.length) {
    sendJson(res, 400, { error: 'Paste at least one valid URL.' });
    return;
  }

  if (urls.length > MAX_URLS_PER_SUBMISSION) {
    sendJson(res, 400, {
      error: `This public demo accepts up to ${MAX_URLS_PER_SUBMISSION} URLs per run.`,
      urlsFound: urls.length,
      quota: await getQuotaState(),
    });
    return;
  }

  const supportedUrls = urls.filter((url) => classifyUrl(url) !== 'unsupported');
  if (!supportedUrls.length) {
    sendJson(res, 400, {
      error: 'No supported URLs found. Use YouTube, Instagram post/reel, TikTok video, or X/Twitter video URLs.',
      urls,
    });
    return;
  }

  const reservation = await reserveQuota(supportedUrls.length);
  if (!reservation.ok) {
    sendJson(res, 429, { error: reservation.message, quota: reservation.quota });
    return;
  }

  const shouldRunSynchronously = Boolean(process.env.VERCEL || process.env.MASS_SOCIAL_SYNC_JOBS === '1');
  const job = createJob(supportedUrls, reservation.quota, { autoRun: !shouldRunSynchronously });

  if (shouldRunSynchronously) {
    await runJob(job.id);
  }

  sendJson(res, shouldRunSynchronously ? 200 : 202, {
    jobId: job.id,
    urlCount: supportedUrls.length,
    skippedCount: urls.length - supportedUrls.length,
    quota: reservation.quota,
    job: shouldRunSynchronously ? serialiseJob(job) : undefined,
  });
}

async function handleCreateClientRun(req, res) {
  if (!getSociaVaultApiKey()) {
    sendJson(res, 503, {
      error: 'SOCIAVAULT_API_KEY is not configured on the portfolio server.',
      detail: 'Add SOCIAVAULT_API_KEY to the Vercel project environment to enable live transcription.',
      quota: await getQuotaState(),
    });
    return;
  }

  const body = await readJsonBody(req);
  const urls = extractUrls(body.urlsText || body.urls_text || '');

  if (!urls.length) {
    sendJson(res, 400, { error: 'Paste at least one valid URL.' });
    return;
  }

  if (urls.length > MAX_URLS_PER_SUBMISSION) {
    sendJson(res, 400, {
      error: `This public demo accepts up to ${MAX_URLS_PER_SUBMISSION} URLs per run.`,
      urlsFound: urls.length,
      quota: await getQuotaState(),
    });
    return;
  }

  const supportedUrls = urls.filter((url) => classifyUrl(url) !== 'unsupported');
  if (!supportedUrls.length) {
    sendJson(res, 400, {
      error: 'No supported URLs found. Use YouTube, Instagram post/reel, TikTok video, or X/Twitter video URLs.',
      urls,
    });
    return;
  }

  const reservation = await reserveQuota(supportedUrls.length);
  if (!reservation.ok) {
    sendJson(res, 429, { error: reservation.message, quota: reservation.quota });
    return;
  }

  const runId = crypto.randomUUID();
  sendJson(res, 200, {
    runId,
    urls: supportedUrls,
    urlCount: supportedUrls.length,
    skippedCount: urls.length - supportedUrls.length,
    quota: reservation.quota,
  });
}

async function handleProcessClientRunUrl(req, res, runId) {
  if (!getSociaVaultApiKey()) {
    sendJson(res, 503, { error: 'SOCIAVAULT_API_KEY is not configured on the portfolio server.' });
    return;
  }

  const body = await readJsonBody(req);
  const url = normaliseUrl(String(body.url || ''));
  const index = Math.max(0, Number(body.index) || 0);
  const total = Math.max(1, Number(body.total) || 1);
  const job = {
    id: runId || crypto.randomUUID(),
    urls: [url],
    status: 'running',
    stage: 'Queued',
    createdAt: new Date().toISOString(),
    completedAt: null,
    liveItems: [],
    failedUrls: [],
    log: [],
    stopRequested: false,
    error: null,
    quota: await getQuotaState(),
  };

  try {
    await processSingleUrl(job, url, index, total);
    job.status = 'done';
    job.completedAt = new Date().toISOString();
  } catch (error) {
    job.status = 'error';
    job.error = error.message;
    job.completedAt = new Date().toISOString();
    job.failedUrls.push({ url, message: error.message });
    pushLog(job, `Failed · ${url} · ${error.message}`);
  }

  sendJson(res, 200, {
    runId: job.id,
    item: job.liveItems[0] || null,
    failed: job.failedUrls[0] || null,
    log: job.log,
    quota: job.quota,
  });
}

async function handleExportItems(req, res) {
  const body = await readJsonBody(req, 500_000);
  const items = Array.isArray(body.items) ? body.items.slice(0, MAX_URLS_PER_SUBMISSION) : [];

  if (!items.length) {
    sendJson(res, 400, { error: 'No exported items were supplied.' });
    return;
  }

  const job = {
    id: crypto.randomUUID(),
    liveItems: items.map((item) => {
      const sourceType = String(item.sourceType || 'unknown');
      const sections = normaliseSections(item.sections, item.transcription || '', sourceType);
      const transcription = sectionsToTranscription(sections);

      return {
        id: String(item.id || crypto.randomUUID()),
        url: String(item.url || ''),
        sourceType,
        sourceLabel: String(item.sourceLabel || 'Source'),
        title: String(item.title || 'Untitled transcription').slice(0, 160),
        category: CATEGORIES.includes(item.category) ? item.category : 'Other',
        qualityScore: calculateContentDepthScore({ transcript: item.transcription || '', transcription, sections }),
        transcription,
        sections,
        modelUsed: String(item.modelUsed || ''),
      };
    }),
  };

  const buffer = await createDocxBuffer(job);
  const filename = `mass-social-wisdom-${job.id.slice(0, 8)}.docx`;
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.end(buffer);
}

async function handleGetJob(jobId, res) {
  const job = jobs.get(jobId);
  if (!job) {
    sendJson(res, 404, { error: 'Unknown transcription job.' });
    return;
  }

  sendJson(res, 200, serialiseJob(job));
}

async function handleStopJob(jobId, res) {
  const job = jobs.get(jobId);
  if (!job) {
    sendJson(res, 404, { error: 'Unknown transcription job.' });
    return;
  }

  job.stopRequested = true;
  pushLog(job, 'Stop · Request received. Current URL will finish before stopping.');
  sendJson(res, 200, { ok: true });
}

async function handleDownload(jobId, res) {
  const job = jobs.get(jobId);
  if (!job || !job.liveItems.length) {
    sendJson(res, 404, { error: 'No exported items are available for this job.' });
    return;
  }

  const buffer = await createDocxBuffer(job);
  const filename = `mass-social-wisdom-${job.id.slice(0, 8)}.docx`;
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.end(buffer);
}

export async function handleMassSocialWisdomRequest(req, res) {
  const requestUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = requestUrl.pathname.startsWith('/api/mass-social-wisdom')
    ? requestUrl.pathname.slice('/api/mass-social-wisdom'.length) || '/'
    : requestUrl.pathname;

  if (req.method === 'GET' && (pathname === '/' || pathname === '/quota')) {
    sendJson(res, 200, await getQuotaState());
    return;
  }

  if (req.method === 'POST' && pathname === '/jobs') {
    await handleCreateJob(req, res);
    return;
  }

  if (req.method === 'POST' && pathname === '/runs') {
    await handleCreateClientRun(req, res);
    return;
  }

  const processRunMatch = pathname.match(/^\/runs\/([^/]+)\/process$/);
  if (req.method === 'POST' && processRunMatch) {
    await handleProcessClientRunUrl(req, res, processRunMatch[1]);
    return;
  }

  if (req.method === 'POST' && pathname === '/export') {
    await handleExportItems(req, res);
    return;
  }

  const jobMatch = pathname.match(/^\/jobs\/([^/]+)$/);
  if (req.method === 'GET' && jobMatch) {
    await handleGetJob(jobMatch[1], res);
    return;
  }

  const stopMatch = pathname.match(/^\/jobs\/([^/]+)\/stop$/);
  if (req.method === 'POST' && stopMatch) {
    await handleStopJob(stopMatch[1], res);
    return;
  }

  const downloadMatch = pathname.match(/^\/jobs\/([^/]+)\/download$/);
  if (req.method === 'GET' && downloadMatch) {
    await handleDownload(downloadMatch[1], res);
    return;
  }

  sendText(res, 404, 'Mass Social Wisdom endpoint not found.');
}
