#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REVIEW_SET_PATH = path.join(ROOT_DIR, 'ai-ramin-section/evaluation/live-answer-review-set.json');
const DEFAULT_ENDPOINT = 'http://127.0.0.1:4182/api/ai-ramin';
const DEFAULT_TIMEOUT_MS = 90_000;
const EXCERPT_CHAR_LIMIT = 1_200;

function printUsage() {
  console.log(`Usage:
  npm run capture:ai-ramin-live -- [options]

Options:
  --endpoint=<url>       AI Ramin endpoint. Default: ${DEFAULT_ENDPOINT}
  --case=<id[,id]>       Capture only specific case ids. Can be repeated.
  --family=<name>        Capture only a case family. Can be repeated.
  --limit=<number>       Capture the first N selected cases.
  --timeout-ms=<number>  Per-case request timeout. Default: ${DEFAULT_TIMEOUT_MS}
  --include-debug-trace  Ask the endpoint to include debug trace metadata.
  --force                Re-capture cases that already have a manual score.
  --no-write             Do not update live-answer-review-set.json.
  --preflight            Validate review-set shape, key availability, and endpoint reachability without capturing.
  --dry-run              Validate and print selected cases without calling the endpoint.
  --no-key-ok            Allow dry-run/check mode without GEMINI_API_KEY or GOOGLE_API_KEY.
  --help                 Show this message.
`);
}

function parseCsv(value) {
  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseArgs(argv) {
  const options = {
    endpoint: DEFAULT_ENDPOINT,
    caseIds: [],
    families: [],
    limit: 0,
    timeoutMs: DEFAULT_TIMEOUT_MS,
    includeDebugTrace: false,
    force: false,
    noWrite: false,
    preflight: false,
    dryRun: false,
    noKeyOk: false,
    help: false,
  };

  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--include-debug-trace') options.includeDebugTrace = true;
    else if (arg === '--force') options.force = true;
    else if (arg === '--no-write') options.noWrite = true;
    else if (arg === '--preflight') options.preflight = true;
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--no-key-ok') options.noKeyOk = true;
    else if (arg.startsWith('--endpoint=')) options.endpoint = arg.slice('--endpoint='.length).trim();
    else if (arg.startsWith('--case=')) options.caseIds.push(...parseCsv(arg.slice('--case='.length)));
    else if (arg.startsWith('--family=')) options.families.push(...parseCsv(arg.slice('--family='.length)));
    else if (arg.startsWith('--limit=')) options.limit = Math.max(0, Number.parseInt(arg.slice('--limit='.length), 10) || 0);
    else if (arg.startsWith('--timeout-ms=')) {
      options.timeoutMs = Math.max(1_000, Number.parseInt(arg.slice('--timeout-ms='.length), 10) || DEFAULT_TIMEOUT_MS);
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return options;
}

function parseDotEnvValue(line) {
  const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
  if (!match) return null;
  let value = match[2].trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return [match[1], value];
}

async function readDotEnv(filePath) {
  if (!existsSync(filePath)) return {};
  const source = await readFile(filePath, 'utf8');
  const output = {};
  for (const line of source.split(/\r?\n/)) {
    const parsed = parseDotEnvValue(line);
    if (parsed) output[parsed[0]] = parsed[1];
  }
  return output;
}

async function hasGeminiApiKey() {
  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) return true;
  const envLocal = await readDotEnv(path.join(ROOT_DIR, '.env.local'));
  const env = await readDotEnv(path.join(ROOT_DIR, '.env'));
  return Boolean(envLocal.GEMINI_API_KEY || envLocal.GOOGLE_API_KEY || env.GEMINI_API_KEY || env.GOOGLE_API_KEY);
}

function truncateText(value, limit = EXCERPT_CHAR_LIMIT) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  return text.length > limit ? `${text.slice(0, limit - 1)}...` : text;
}

function assertReviewSetShape(reviewSet) {
  const failures = [];
  if (!reviewSet || typeof reviewSet !== 'object') failures.push('review set must be an object');
  if (reviewSet.schemaVersion !== 1) failures.push('schemaVersion must be 1');
  if (!Array.isArray(reviewSet.cases)) failures.push('cases must be an array');

  const seenIds = new Set();
  for (const [index, item] of (reviewSet.cases ?? []).entries()) {
    const label = item?.id || `case[${index}]`;
    if (!item || typeof item !== 'object') {
      failures.push(`${label}: case must be an object`);
      continue;
    }
    if (!item.id || typeof item.id !== 'string') failures.push(`${label}: id is required`);
    if (seenIds.has(item.id)) failures.push(`${label}: duplicate id`);
    seenIds.add(item.id);
    if (!item.prompt || typeof item.prompt !== 'string') failures.push(`${label}: prompt is required`);
    if (!item.family || typeof item.family !== 'string') failures.push(`${label}: family is required`);
    if (!item.hiringMode || typeof item.hiringMode !== 'string') failures.push(`${label}: hiringMode is required`);
    if (!item.requestType || typeof item.requestType !== 'string') failures.push(`${label}: requestType is required`);
    if (!item.expectedQuestionType || typeof item.expectedQuestionType !== 'string') {
      failures.push(`${label}: expectedQuestionType is required`);
    }
    if (item.history !== undefined && !Array.isArray(item.history)) failures.push(`${label}: history must be an array when present`);
    if (!item.capture || typeof item.capture !== 'object') failures.push(`${label}: capture object is required`);
  }

  return failures;
}

function selectCases(cases, options) {
  const caseIdFilter = new Set(options.caseIds);
  const familyFilter = new Set(options.families);
  let selected = cases.filter((item) => {
    if (caseIdFilter.size && !caseIdFilter.has(item.id)) return false;
    if (familyFilter.size && !familyFilter.has(item.family)) return false;
    return true;
  });

  if (options.limit > 0) selected = selected.slice(0, options.limit);
  return selected;
}

function buildRequestBody(item, options) {
  return {
    message: item.prompt,
    hiringMode: item.hiringMode,
    requestType: item.requestType === 'general_chat' ? undefined : item.requestType,
    history: item.history,
    includeDebugTrace: options.includeDebugTrace,
  };
}

async function postCase(endpoint, body, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => null);
    return {
      ok: response.ok,
      status: response.status,
      payload,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function buildCapture(item, response) {
  const payload = response.payload ?? {};
  const sourceMetadata = payload.sourceMetadata ?? {};
  const answerShape = sourceMetadata.answerShape ?? {};
  const actualQuestionType =
    answerShape.primaryQuestionType ||
    sourceMetadata.intentRoute?.sourceQuestionType ||
    '';
  const issues = new Set(Array.isArray(sourceMetadata.qualityGateIssues) ? sourceMetadata.qualityGateIssues : []);

  if (!response.ok) issues.add(`http_${response.status}`);
  if (item.expectedQuestionType && actualQuestionType && actualQuestionType !== item.expectedQuestionType) {
    issues.add(`expected_question_type_mismatch:${actualQuestionType}`);
  }
  if (!payload.answer && !payload.error) issues.add('empty_answer');

  const notes = response.ok
    ? [
        'Auto-captured by scripts/capture-ai-ramin-live-answers.mjs.',
        actualQuestionType ? `questionType=${actualQuestionType}` : '',
        payload.requestType ? `requestType=${payload.requestType}` : '',
        payload.model ? `model=${payload.model}` : '',
        Number.isFinite(sourceMetadata.evidenceCardCount) ? `evidenceCards=${sourceMetadata.evidenceCardCount}` : '',
        sourceMetadata.qualityGateApplied ? `qualityGate=${sourceMetadata.qualityGateStrategy || 'applied'}` : 'qualityGate=none',
        sourceMetadata.recoveryApplied ? `recovery=${sourceMetadata.recoveryStrategy || 'applied'}` : '',
        sourceMetadata.answerReprompt ? `answerReprompt=${sourceMetadata.answerReprompt}` : '',
      ].filter(Boolean).join(' ')
    : `Capture failed with HTTP ${response.status}: ${payload.error || 'unknown error'}`;

  return {
    status: response.ok ? 'captured' : 'failed',
    capturedAt: new Date().toISOString(),
    model: payload.model || '',
    answerExcerpt: truncateText(payload.answer || payload.error || ''),
    score: null,
    issues: Array.from(issues).sort(),
    notes,
  };
}

function shouldSkipCase(item, options) {
  const capture = item.capture ?? {};
  return !options.force && capture.status === 'captured' && capture.score !== null && capture.score !== undefined;
}

async function runPreflight(options, reviewSet, selected, keyAvailable) {
  const failures = [];
  const notes = [];
  const missingKeyMessage = 'GEMINI_API_KEY or GOOGLE_API_KEY was not detected in the environment, .env.local, or .env.';

  if (keyAvailable) {
    notes.push('Gemini or Google API key detected locally.');
  } else if (options.noKeyOk) {
    notes.push(`Live capture remains blocked: ${missingKeyMessage}`);
  } else {
    failures.push(missingKeyMessage);
  }

  try {
    const response = await postCase(
      options.endpoint,
      {
        message: 'hey',
        hiringMode: 'hiring-manager',
        includeDebugTrace: false,
      },
      Math.min(options.timeoutMs, 10_000),
    );
    const payload = response.payload ?? {};
    if (!response.ok) {
      failures.push(`Endpoint check failed with HTTP ${response.status}: ${payload.error || 'unknown error'}`);
    } else if (!payload.answer) {
      failures.push('Endpoint check returned no answer for deterministic greeting.');
    } else {
      notes.push(`Endpoint reachable at ${options.endpoint}; deterministic greeting returned model=${payload.model || 'unknown'}.`);
    }
  } catch (error) {
    failures.push(`Endpoint check failed: ${error instanceof Error ? error.message : 'unknown error'}`);
  }

  if (failures.length) {
    console.error('AI Ramin live capture preflight failed:');
    for (const failure of failures) console.error(`- ${failure}`);
    if (notes.length) {
      console.error('Notes:');
      for (const note of notes) console.error(`- ${note}`);
    }
    process.exit(keyAvailable ? 1 : 2);
  }

  console.log(
    `AI Ramin live capture preflight ${keyAvailable ? 'passed' : 'passed with blocker'}: ${selected.length}/${reviewSet.cases.length} cases selected.`,
  );
  for (const note of notes) console.log(`- ${note}`);
  if (!keyAvailable) {
    console.log('- Actual capture requires GEMINI_API_KEY or GOOGLE_API_KEY before running npm run capture:ai-ramin-live.');
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printUsage();
    return;
  }

  const reviewSet = JSON.parse(await readFile(REVIEW_SET_PATH, 'utf8'));
  const shapeFailures = assertReviewSetShape(reviewSet);
  if (shapeFailures.length) {
    console.error('AI Ramin live-answer review set is invalid:');
    for (const failure of shapeFailures) console.error(`- ${failure}`);
    process.exit(1);
  }

  const selected = selectCases(reviewSet.cases, options);
  if (!selected.length) {
    console.error('No live-answer review cases matched the supplied filters.');
    process.exit(1);
  }

  const keyAvailable = await hasGeminiApiKey();
  if (options.preflight) {
    await runPreflight(options, reviewSet, selected, keyAvailable);
    return;
  }

  if (options.dryRun) {
    console.log(`AI Ramin live capture dry run passed: ${selected.length}/${reviewSet.cases.length} cases selected.`);
    if (!keyAvailable && !options.noKeyOk) {
      console.log('Gemini key was not detected locally; actual capture will be blocked until GEMINI_API_KEY or GOOGLE_API_KEY is configured.');
    }
    for (const item of selected) console.log(`- ${item.id} (${item.family}, ${item.expectedQuestionType})`);
    return;
  }

  if (!keyAvailable && !options.noKeyOk) {
    console.error('AI Ramin live capture blocked: GEMINI_API_KEY or GOOGLE_API_KEY was not detected in the environment, .env.local, or .env.');
    process.exit(2);
  }

  const updatedCases = reviewSet.cases.map((item) => ({ ...item, capture: { ...(item.capture ?? {}) } }));
  const caseById = new Map(updatedCases.map((item) => [item.id, item]));
  const summary = { captured: 0, failed: 0, skipped: 0 };

  for (const item of selected) {
    const target = caseById.get(item.id);
    if (shouldSkipCase(target, options)) {
      summary.skipped += 1;
      console.log(`skip ${item.id}: already captured and manually scored`);
      continue;
    }

    const body = buildRequestBody(item, options);
    console.log(`capture ${item.id} -> ${options.endpoint}`);
    try {
      const response = await postCase(options.endpoint, body, options.timeoutMs);
      target.capture = buildCapture(item, response);
      if (response.ok) summary.captured += 1;
      else summary.failed += 1;
    } catch (error) {
      summary.failed += 1;
      target.capture = {
        status: 'failed',
        capturedAt: new Date().toISOString(),
        model: '',
        answerExcerpt: '',
        score: null,
        issues: ['capture_exception'],
        notes: error instanceof Error ? error.message : 'Unknown capture exception.',
      };
    }
  }

  const output = {
    ...reviewSet,
    status: summary.failed ? 'capture_has_failures' : 'captured_pending_manual_scores',
    captureBlockedBy: '',
    lastCapturedAt: new Date().toISOString(),
    cases: updatedCases,
  };

  if (!options.noWrite) {
    await writeFile(REVIEW_SET_PATH, `${JSON.stringify(output, null, 2)}\n`);
  }

  console.log(
    `AI Ramin live capture complete: ${summary.captured} captured, ${summary.failed} failed, ${summary.skipped} skipped${options.noWrite ? ' (not written)' : ''}.`,
  );
  if (summary.failed) process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
