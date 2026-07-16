#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_ENDPOINT = 'http://127.0.0.1:4182/api/ai-ramin';
const DEFAULT_TIMEOUT_MS = 4_000;

const PATHS = {
  corpus: 'ai-ramin-section/generated/ai-ramin-corpus.json',
  evalCases: 'ai-ramin-section/evaluation/eval-cases.json',
  liveReviewSet: 'ai-ramin-section/evaluation/live-answer-review-set.json',
  feedbackLog: 'ai-ramin-section/evaluation/live-feedback.jsonl',
  feedbackReview: 'ai-ramin-section/evaluation/latest-feedback-review.json',
  promotionPlan: 'ai-ramin-section/evaluation/latest-eval-case-promotion-plan.json',
  liveReviewReport: 'ai-ramin-section/evaluation/latest-live-review-report.json',
  evaluationReport: 'ai-ramin-section/evaluation/latest-evaluation-report.json',
};

function parseArgs(argv) {
  const options = {
    endpoint: DEFAULT_ENDPOINT,
    timeoutMs: DEFAULT_TIMEOUT_MS,
    checkEndpoint: true,
    json: false,
  };

  for (const arg of argv) {
    if (arg === '--json') options.json = true;
    else if (arg === '--no-endpoint-check') options.checkEndpoint = false;
    else if (arg.startsWith('--endpoint=')) options.endpoint = arg.slice('--endpoint='.length).trim();
    else if (arg.startsWith('--timeout-ms=')) {
      options.timeoutMs = Math.max(1_000, Number.parseInt(arg.slice('--timeout-ms='.length), 10) || DEFAULT_TIMEOUT_MS);
    } else if (arg === '--help' || arg === '-h') {
      printUsage();
      process.exit(0);
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return options;
}

function printUsage() {
  console.log(`Usage:
  npm run status:ai-ramin -- [options]

Options:
  --endpoint=<url>       AI Ramin endpoint. Default: ${DEFAULT_ENDPOINT}
  --timeout-ms=<number>  Endpoint check timeout. Default: ${DEFAULT_TIMEOUT_MS}
  --no-endpoint-check    Skip local endpoint probing.
  --json                 Print machine-readable JSON.
  --help                 Show this message.
`);
}

function resolvePath(relativePath) {
  return path.join(ROOT_DIR, relativePath);
}

function fileStatus(relativePath) {
  const fullPath = resolvePath(relativePath);
  return {
    path: relativePath,
    exists: existsSync(fullPath),
  };
}

async function readJson(relativePath, fallback = null) {
  const fullPath = resolvePath(relativePath);
  if (!existsSync(fullPath)) return fallback;
  return JSON.parse(await readFile(fullPath, 'utf8'));
}

async function readText(relativePath) {
  const fullPath = resolvePath(relativePath);
  if (!existsSync(fullPath)) return '';
  return readFile(fullPath, 'utf8');
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

async function readDotEnv(relativePath) {
  const source = await readText(relativePath);
  const output = {};
  for (const line of source.split(/\r?\n/)) {
    const parsed = parseDotEnvValue(line);
    if (parsed) output[parsed[0]] = parsed[1];
  }
  return output;
}

async function getKeyStatus() {
  const envLocal = await readDotEnv('.env.local');
  const env = await readDotEnv('.env');
  const sources = [];

  if (process.env.GEMINI_API_KEY) sources.push('process.env.GEMINI_API_KEY');
  if (process.env.GOOGLE_API_KEY) sources.push('process.env.GOOGLE_API_KEY');
  if (envLocal.GEMINI_API_KEY) sources.push('.env.local:GEMINI_API_KEY');
  if (envLocal.GOOGLE_API_KEY) sources.push('.env.local:GOOGLE_API_KEY');
  if (env.GEMINI_API_KEY) sources.push('.env:GEMINI_API_KEY');
  if (env.GOOGLE_API_KEY) sources.push('.env:GOOGLE_API_KEY');

  return {
    available: sources.length > 0,
    sources,
  };
}

function summarizeLiveReviewSet(reviewSet) {
  const cases = Array.isArray(reviewSet?.cases) ? reviewSet.cases : [];
  const captured = cases.filter((item) => item.capture?.status === 'captured');
  const failed = cases.filter((item) => item.capture?.status === 'failed');
  const pending = cases.filter((item) => !item.capture?.status || item.capture.status === 'pending');
  const scored = cases.filter((item) => Number.isInteger(item.capture?.score));
  const weakOrFailing = scored.filter((item) => item.capture.score <= 1);
  const acceptable = scored.filter((item) => item.capture.score === 2);
  const strong = scored.filter((item) => item.capture.score === 3);
  const totalScore = scored.reduce((sum, item) => sum + item.capture.score, 0);
  const byFamily = {};
  for (const item of cases) {
    const family = item.family || 'unknown';
    byFamily[family] = (byFamily[family] ?? 0) + 1;
  }

  return {
    schemaVersion: reviewSet?.schemaVersion ?? null,
    status: reviewSet?.status ?? 'unknown',
    captureBlockedBy: reviewSet?.captureBlockedBy ?? '',
    caseCount: cases.length,
    capturedCount: captured.length,
    failedCount: failed.length,
    pendingCount: pending.length,
    scoredCount: scored.length,
    unscoredCapturedCount: captured.length - scored.length,
    weakOrFailingCount: weakOrFailing.length,
    acceptableCount: acceptable.length,
    strongCount: strong.length,
    averageScore: scored.length ? Number((totalScore / scored.length).toFixed(2)) : null,
    byFamily,
  };
}

function summarizeEvalSuite(evalSuite) {
  const cases = Array.isArray(evalSuite?.cases) ? evalSuite.cases : [];
  const categories = new Set(cases.map((item) => item.category).filter(Boolean));
  const questionTypes = new Set(cases.map((item) => item.expectedQuestionType).filter(Boolean));
  return {
    schemaVersion: evalSuite?.schemaVersion ?? null,
    caseCount: cases.length,
    categoryCount: categories.size,
    questionTypeCount: questionTypes.size,
    qualityGate: evalSuite?.qualityGate ?? {},
  };
}

function summarizeCorpus(corpus) {
  return {
    schemaVersion: corpus?.schema_version ?? null,
    generatedAt: corpus?.generated_at ?? '',
    stats: corpus?.stats ?? {},
  };
}

async function lineCount(relativePath) {
  const source = await readText(relativePath);
  if (!source.trim()) return 0;
  return source.split(/\r?\n/).filter((line) => line.trim()).length;
}

async function checkEndpoint(endpoint, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'hey',
        hiringMode: 'hiring-manager',
        includeDebugTrace: false,
      }),
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => null);
    return {
      checked: true,
      reachable: response.ok,
      status: response.status,
      model: payload?.model ?? '',
      requestType: payload?.requestType ?? '',
      answerFrameId: payload?.answerFrame?.id ?? payload?.sourceMetadata?.answerShape?.answerFrameId ?? '',
      error: response.ok ? '' : payload?.error ?? 'Endpoint returned an error.',
    };
  } catch (error) {
    return {
      checked: true,
      reachable: false,
      status: 0,
      model: '',
      requestType: '',
      answerFrameId: '',
      error: error instanceof Error ? error.message : 'Endpoint check failed.',
    };
  } finally {
    clearTimeout(timeout);
  }
}

function buildRecommendedNextActions(report) {
  const actions = ['Run npm run verify:ai-ramin after AI Ramin changes.'];

  if (!report.endpoint.checked) {
    actions.push('Run npm run status:ai-ramin without --no-endpoint-check when a local server is available.');
  } else if (!report.endpoint.reachable) {
    actions.push('Start the local server with npm run dev before live preflight or capture.');
  }

  if (!report.key.available) {
    actions.push('Configure GEMINI_API_KEY or GOOGLE_API_KEY before model-backed live capture.');
  } else if (report.endpoint.reachable) {
    actions.push('Run npm run preflight:ai-ramin-live, then npm run capture:ai-ramin-live for model-backed review.');
  }

  if (report.liveReview.pendingCount || report.liveReview.failedCount) {
    actions.push('Review ai-ramin-section/evaluation/live-answer-review-set.json after live capture and manually score captured answers.');
  }

  if (report.liveReview.capturedCount) {
    actions.push('Run npm run check:ai-ramin-live-review to validate captured answer scores and issue notes.');
  }

  if (report.liveReview.scoredCount === report.liveReview.caseCount && report.liveReview.caseCount > 0) {
    actions.push('Run npm run check:ai-ramin-live-review -- --strict before treating live answer review as complete.');
  }

  if (report.liveReview.scoredCount > 0 && !report.localFiles.liveReviewReport.exists) {
    actions.push('Run npm run review:ai-ramin-live to summarize scored live-answer review results.');
  }

  if (report.localFiles.feedbackLog.lineCount > 0) {
    actions.push('Run npm run review:ai-ramin-feedback to triage local visitor feedback.');
  }

  return actions;
}

function printTextReport(report) {
  const lines = [
    'AI Ramin Status',
    '',
    `Corpus: ${report.corpus.stats.chunks ?? 0} chunks from ${report.corpus.stats.source_files_ingested ?? 0} files (${report.corpus.generatedAt || 'not generated'})`,
    `Eval suite: ${report.evalSuite.caseCount} cases, ${report.evalSuite.categoryCount} categories, ${report.evalSuite.questionTypeCount} question types`,
    `Live review: ${report.liveReview.caseCount} cases, ${report.liveReview.capturedCount} captured, ${report.liveReview.scoredCount} scored, ${report.liveReview.pendingCount} pending, ${report.liveReview.failedCount} failed`,
    `Live scores: ${report.liveReview.strongCount} strong, ${report.liveReview.acceptableCount} acceptable, ${report.liveReview.weakOrFailingCount} weak/failing, average ${report.liveReview.averageScore ?? 'n/a'}`,
    `Key: ${report.key.available ? `present (${report.key.sources.join(', ')})` : 'missing'}`,
  ];

  if (report.endpoint.checked) {
    lines.push(
      `Endpoint: ${report.endpoint.reachable ? 'reachable' : 'unreachable'} ${report.endpoint.status || ''}`.trim(),
    );
    if (report.endpoint.model) lines.push(`Endpoint model: ${report.endpoint.model}`);
    if (report.endpoint.error) lines.push(`Endpoint error: ${report.endpoint.error}`);
  } else {
    lines.push('Endpoint: not checked');
  }

  lines.push('', 'Local generated files:');
  for (const [key, item] of Object.entries(report.localFiles)) {
    const detail = item.lineCount !== undefined ? `, ${item.lineCount} record(s)` : '';
    lines.push(`- ${key}: ${item.exists ? 'present' : 'missing'} (${item.path}${detail})`);
  }

  lines.push('', 'Recommended next actions:');
  report.nextActions.forEach((action) => lines.push(`- ${action}`));

  return lines.join('\n');
}

async function buildReport(options) {
  const [corpus, evalSuite, liveReviewSet, key] = await Promise.all([
    readJson(PATHS.corpus, {}),
    readJson(PATHS.evalCases, {}),
    readJson(PATHS.liveReviewSet, {}),
    getKeyStatus(),
  ]);

  const endpoint = options.checkEndpoint
    ? await checkEndpoint(options.endpoint, options.timeoutMs)
    : { checked: false, reachable: false, status: 0, model: '', requestType: '', answerFrameId: '', error: '' };

  const localFiles = {
    evaluationReport: fileStatus(PATHS.evaluationReport),
    feedbackLog: {
      ...fileStatus(PATHS.feedbackLog),
      lineCount: await lineCount(PATHS.feedbackLog),
    },
    feedbackReview: fileStatus(PATHS.feedbackReview),
    promotionPlan: fileStatus(PATHS.promotionPlan),
    liveReviewReport: fileStatus(PATHS.liveReviewReport),
  };

  const report = {
    generatedAt: new Date().toISOString(),
    corpus: summarizeCorpus(corpus),
    evalSuite: summarizeEvalSuite(evalSuite),
    liveReview: summarizeLiveReviewSet(liveReviewSet),
    key,
    endpoint,
    localFiles,
    nextActions: [],
  };

  report.nextActions = buildRecommendedNextActions(report);
  return report;
}

const options = parseArgs(process.argv.slice(2));
const report = await buildReport(options);

if (options.json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(printTextReport(report));
}
