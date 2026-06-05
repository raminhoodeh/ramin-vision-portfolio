import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT_PATH = path.join(ROOT_DIR, 'ai-ramin-section/generated/ai-ramin-corpus.json');
const CHECK_ONLY = process.argv.includes('--check');

const SOURCE_DIRECTORIES = [
  'ai-ramin-section/canonical',
  'ai-ramin-section/inferred',
  'ai-ramin-section/story-bank',
  'ai-ramin-section/frameworks',
  'ai-ramin-section/policies',
];

const REQUIRED_FRONTMATTER_FIELDS = [
  'title',
  'source_type',
  'trust_level',
  'visibility',
  'retrieval_priority',
  'answer_permission',
];

const SOURCE_ROLE_BY_TYPE = new Map([
  ['canonical_personal_context', 'canonical'],
  ['work_experience', 'work'],
  ['project_case_study', 'project'],
  ['inferred_story', 'inferred'],
  ['hypothetical_application', 'inferred'],
  ['story_bank', 'story'],
  ['generic_framework', 'framework'],
  ['answer_strategy', 'framework'],
  ['voice_policy', 'policy'],
  ['guardrail_policy', 'policy'],
  ['source_policy', 'policy'],
  ['contact_policy', 'policy'],
  ['abuse_policy', 'policy'],
  ['privacy_policy', 'policy'],
]);

const SOURCE_ROLE_CONFIG = {
  policy: { targetTokens: 450, maxTokens: 650, overlapTokens: 50 },
  canonical: { targetTokens: 600, maxTokens: 850, overlapTokens: 75 },
  work: { targetTokens: 650, maxTokens: 900, overlapTokens: 75 },
  project: { targetTokens: 700, maxTokens: 950, overlapTokens: 100 },
  inferred: { targetTokens: 650, maxTokens: 900, overlapTokens: 75 },
  story: { targetTokens: 800, maxTokens: 1_050, overlapTokens: 100 },
  framework: { targetTokens: 550, maxTokens: 750, overlapTokens: 75 },
};

const ANSWER_PERMISSIONS = new Set([
  'factual_answer',
  'factual_answer_with_confidentiality_boundary',
  'factual_answer_with_non_financial_advice_boundary',
  'adapt_as_story',
]);

const STOP_WORDS = new Set([
  'about',
  'above',
  'after',
  'again',
  'against',
  'also',
  'answer',
  'because',
  'before',
  'being',
  'between',
  'could',
  'from',
  'have',
  'into',
  'only',
  'ramin',
  'should',
  'that',
  'their',
  'there',
  'these',
  'this',
  'through',
  'using',
  'what',
  'when',
  'where',
  'which',
  'with',
  'would',
]);

function normalizePath(filePath) {
  return filePath.split(path.sep).join('/');
}

function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

function stripQuotes(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseFrontmatter(markdown, relativePath) {
  if (!markdown.startsWith('---\n')) {
    throw new Error(`${relativePath} is missing YAML frontmatter.`);
  }

  const frontmatterEnd = markdown.indexOf('\n---\n', 4);
  if (frontmatterEnd === -1) {
    throw new Error(`${relativePath} has unclosed YAML frontmatter.`);
  }

  const frontmatter = markdown.slice(4, frontmatterEnd);
  const body = markdown.slice(frontmatterEnd + 5);
  const metadata = {};
  let activeArrayKey = null;

  for (const line of frontmatter.split('\n')) {
    const keyMatch = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/);
    if (keyMatch) {
      const [, key, rawValue] = keyMatch;
      const value = rawValue.trim();
      if (!value) {
        metadata[key] = [];
        activeArrayKey = key;
      } else {
        metadata[key] = stripQuotes(value);
        activeArrayKey = null;
      }
      continue;
    }

    const arrayMatch = line.match(/^\s*-\s+(.+)$/);
    if (arrayMatch && activeArrayKey) {
      metadata[activeArrayKey].push(stripQuotes(arrayMatch[1]));
    }
  }

  for (const field of REQUIRED_FRONTMATTER_FIELDS) {
    if (!metadata[field]) {
      throw new Error(`${relativePath} is missing required frontmatter field: ${field}`);
    }
  }

  return { metadata, body };
}

async function collectMarkdownFiles(relativeDirectory) {
  const absoluteDirectory = path.join(ROOT_DIR, relativeDirectory);
  const entries = await readdir(absoluteDirectory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectMarkdownFiles(relativePath)));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(relativePath);
    }
  }

  return files;
}

function normalizeMarkdown(markdown) {
  return markdown
    .replace(/\r\n/g, '\n')
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
}

function getHeadingSegments(markdown) {
  const lines = markdown.split('\n');
  const segments = [];
  const headingStack = [];
  let currentLines = [];
  let currentHeadingPath = [];

  function flush() {
    const text = currentLines.join('\n').trim();
    if (text) {
      segments.push({
        headingPath: currentHeadingPath,
        text,
      });
    }
  }

  for (const line of lines) {
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flush();
      const level = heading[1].length;
      headingStack[level - 1] = heading[2].trim();
      headingStack.length = level;
      currentHeadingPath = headingStack.filter(Boolean);
      currentLines = [line];
    } else {
      currentLines.push(line);
    }
  }

  flush();
  return segments.length ? segments : [{ headingPath: [], text: markdown }];
}

function splitLargeSegment(segment, config) {
  const maxChars = config.maxTokens * 4;
  const overlapChars = config.overlapTokens * 4;
  const text = segment.text.trim();
  if (text.length <= maxChars) return [segment];

  const paragraphs = text.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const chunks = [];
  let current = '';

  for (const paragraph of paragraphs) {
    const next = current ? `${current}\n\n${paragraph}` : paragraph;
    if (next.length > maxChars && current) {
      chunks.push({ headingPath: segment.headingPath, text: current.trim() });
      const overlap = current.slice(Math.max(0, current.length - overlapChars));
      current = overlap ? `${overlap}\n\n${paragraph}` : paragraph;
    } else {
      current = next;
    }
  }

  if (current.trim()) {
    chunks.push({ headingPath: segment.headingPath, text: current.trim() });
  }

  return chunks;
}

function chunkMarkdown(body, sourceRole) {
  const config = SOURCE_ROLE_CONFIG[sourceRole] ?? SOURCE_ROLE_CONFIG.canonical;
  const targetChars = config.targetTokens * 4;
  const segments = getHeadingSegments(body).flatMap((segment) => splitLargeSegment(segment, config));
  const chunks = [];
  let currentText = '';
  let currentHeadingPath = [];

  function flush() {
    const text = currentText.trim();
    if (text) {
      chunks.push({ headingPath: currentHeadingPath, text });
    }
  }

  for (const segment of segments) {
    if (!currentText) {
      currentText = segment.text;
      currentHeadingPath = segment.headingPath;
      continue;
    }

    const next = `${currentText}\n\n${segment.text}`;
    if (next.length > targetChars) {
      flush();
      currentText = segment.text;
      currentHeadingPath = segment.headingPath;
    } else {
      currentText = next;
    }
  }

  flush();
  return chunks;
}

function getSourceRole(sourceType) {
  return SOURCE_ROLE_BY_TYPE.get(sourceType) ?? null;
}

function isPublicSafe(metadata, sourceRole) {
  if (sourceRole === 'framework' || sourceRole === 'policy') return false;
  const visibility = String(metadata.visibility ?? '');
  return visibility.includes('public') && !visibility.includes('internal');
}

function canAnswerFrom(metadata) {
  return ANSWER_PERMISSIONS.has(String(metadata.answer_permission));
}

function canSupportInference(metadata, sourceRole) {
  return sourceRole === 'inferred' || String(metadata.answer_permission ?? '') === 'inferred_fit_only';
}

function metadataArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  const normalized = String(value ?? '').trim();
  return normalized ? [normalized] : [];
}

function requiresContactFallback(metadata) {
  const permission = String(metadata.answer_permission ?? '');
  const visibility = String(metadata.visibility ?? '');
  return (
    permission.includes('confidentiality') ||
    permission.includes('financial_advice') ||
    visibility.includes('confidentiality') ||
    visibility.includes('caution')
  );
}

function containsMetric(text) {
  return /(?:\b(?:GBP|USD|AED)\s?\d|\u00a3\s?\d|\$\s?\d|\b\d[\d,.]*\s?(?:%|million|billion|AUM|users|clients|companies|portfolios|months|years|x\b|Q[1-4]))/i.test(
    text,
  );
}

function metricVerificationStatus(metadata, hasMetric) {
  if (!hasMetric) return 'none';
  const status = String(metadata.verification_status ?? '').toLowerCase();
  if (!status) return 'unknown';
  if (status.includes('confirmed')) return 'confirmed';
  if (status.includes('metric')) return metadata.verification_status;
  if (status.includes('review')) return metadata.verification_status;
  return 'unknown';
}

function extractKeywords(text) {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));

  const counts = new Map();
  for (const token of tokens) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 24)
    .map(([token]) => token);
}

function createChunkId(relativePath, chunkIndex, headingPath, text) {
  const hash = createHash('sha256')
    .update(`${relativePath}\n${chunkIndex}\n${headingPath.join(' > ')}\n${text}`)
    .digest('hex')
    .slice(0, 16);
  return `airamin_${hash}`;
}

function sortChunks(chunks) {
  const priorityScore = { highest: 4, high: 3, medium: 2, low: 1, none: 0 };
  const roleScore = { policy: 7, canonical: 6, work: 5, project: 4, story: 3, inferred: 2, framework: 1 };
  return chunks.sort((a, b) => {
    const priorityDelta =
      (priorityScore[b.retrieval_priority] ?? 0) - (priorityScore[a.retrieval_priority] ?? 0);
    if (priorityDelta) return priorityDelta;
    const roleDelta = (roleScore[b.source_role] ?? 0) - (roleScore[a.source_role] ?? 0);
    if (roleDelta) return roleDelta;
    return a.file_path.localeCompare(b.file_path) || a.chunk_index - b.chunk_index;
  });
}

async function buildCorpus() {
  const files = (await Promise.all(SOURCE_DIRECTORIES.map(collectMarkdownFiles)))
    .flat()
    .map(normalizePath)
    .sort();

  const chunks = [];
  const skippedFiles = [];

  for (const relativePath of files) {
    const markdown = await readFile(path.join(ROOT_DIR, relativePath), 'utf8');
    const { metadata, body } = parseFrontmatter(markdown, relativePath);
    const sourceRole = getSourceRole(metadata.source_type);

    if (!sourceRole) {
      skippedFiles.push({ file_path: relativePath, reason: `unsupported source_type ${metadata.source_type}` });
      continue;
    }

    if (
      metadata.answer_permission === 'do_not_answer_from_index' ||
      metadata.trust_level === 'exclude' ||
      metadata.retrieval_priority === 'none'
    ) {
      skippedFiles.push({ file_path: relativePath, reason: 'non-answer index or excluded source' });
      continue;
    }

    const normalizedBody = normalizeMarkdown(body);
    if (!normalizedBody) {
      skippedFiles.push({ file_path: relativePath, reason: 'empty body' });
      continue;
    }

    const fileChunks = chunkMarkdown(normalizedBody, sourceRole);
    fileChunks.forEach((chunk, chunkIndex) => {
      const hasMetric = containsMetric(chunk.text);
      const headingPath = chunk.headingPath.length ? chunk.headingPath : [metadata.title];
      const questionIntents = metadataArray(metadata.question_intents);
      const entities = metadataArray(metadata.entities);
      const sourcePaths = metadataArray(metadata.source_paths);
      const storyType = String(metadata.story_type ?? '').trim();
      const metadataKeywordText = [
        metadata.title,
        storyType,
        questionIntents.join(' '),
        entities.join(' '),
        headingPath.join(' '),
        chunk.text,
      ].join(' ');

      chunks.push({
        chunk_id: createChunkId(relativePath, chunkIndex, headingPath, chunk.text),
        file_path: relativePath,
        title: metadata.title,
        heading_path: headingPath,
        chunk_index: chunkIndex,
        source_type: metadata.source_type,
        source_role: sourceRole,
        trust_level: metadata.trust_level,
        visibility: metadata.visibility,
        retrieval_priority: metadata.retrieval_priority,
        answer_permission: metadata.answer_permission,
        claim_status: metadata.claim_status ?? 'verified_or_user_confirmed',
        source_kind: metadata.source_kind ?? sourceRole,
        based_on: Array.isArray(metadata.based_on) ? metadata.based_on : [],
        forbidden_use: Array.isArray(metadata.forbidden_use) ? metadata.forbidden_use : [],
        public_links: Array.isArray(metadata.public_links) ? metadata.public_links : [],
        source_paths: sourcePaths,
        story_type: storyType || undefined,
        question_intents: questionIntents,
        entities,
        public_safe: isPublicSafe(metadata, sourceRole),
        can_answer_from: canAnswerFrom(metadata),
        can_support_inference: canSupportInference(metadata, sourceRole),
        requires_contact_fallback: requiresContactFallback(metadata),
        contains_metric: hasMetric,
        metric_verification_status: metricVerificationStatus(metadata, hasMetric),
        verification_status: metadata.verification_status ?? 'unknown',
        token_estimate: estimateTokens(chunk.text),
        keywords: extractKeywords(metadataKeywordText),
        text: chunk.text,
      });
    });
  }

  sortChunks(chunks);

  const statsByRole = chunks.reduce((accumulator, chunk) => {
    accumulator[chunk.source_role] = (accumulator[chunk.source_role] ?? 0) + 1;
    return accumulator;
  }, {});

  return {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    source_directories: SOURCE_DIRECTORIES,
    stats: {
      source_files_discovered: files.length,
      source_files_ingested: new Set(chunks.map((chunk) => chunk.file_path)).size,
      source_files_skipped: skippedFiles.length,
      chunks: chunks.length,
      chunks_by_role: statsByRole,
    },
    skipped_files: skippedFiles,
    chunks,
  };
}

function validateCorpus(corpus) {
  if (!corpus.chunks.length) {
    throw new Error('Corpus contains no chunks.');
  }

  const answerableEvidence = corpus.chunks.filter(
    (chunk) => chunk.can_answer_from && chunk.public_safe && chunk.source_role !== 'framework',
  );
  if (answerableEvidence.length < 10) {
    throw new Error('Corpus has too few public-safe answerable evidence chunks.');
  }

  const policyChunks = corpus.chunks.filter((chunk) => chunk.source_role === 'policy');
  if (policyChunks.length < 5) {
    throw new Error('Corpus has too few policy chunks.');
  }

  const storyChunksMissingMetadata = corpus.chunks.filter(
    (chunk) =>
      chunk.source_role === 'story' &&
      (!chunk.story_type || !Array.isArray(chunk.question_intents) || !Array.isArray(chunk.entities)),
  );
  if (storyChunksMissingMetadata.length) {
    throw new Error(
      `Story chunks are missing story-aware metadata: ${storyChunksMissingMetadata
        .slice(0, 5)
        .map((chunk) => chunk.file_path)
        .join(', ')}`,
    );
  }
}

const corpus = await buildCorpus();
validateCorpus(corpus);

if (CHECK_ONLY) {
  console.log(
    `AI Ramin corpus check passed: ${corpus.stats.chunks} chunks from ${corpus.stats.source_files_ingested} files.`,
  );
} else {
  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(corpus, null, 2)}\n`);
  console.log(
    `AI Ramin corpus built: ${normalizePath(path.relative(ROOT_DIR, OUTPUT_PATH))} (${corpus.stats.chunks} chunks).`,
  );
}
