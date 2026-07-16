#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_REVIEW_SET_PATH = 'ai-ramin-section/evaluation/live-answer-review-set.json';
const STRICT_MIN_AVERAGE_SCORE = 2.5;
const VALID_CAPTURE_STATUSES = new Set(['pending', 'captured', 'failed']);
const VALID_SCORES = new Set([0, 1, 2, 3]);
const SEVERE_ISSUE_PATTERNS = [
  /^http_/,
  /^capture_exception$/,
  /^empty_answer$/,
  /^raw_json_short_answer$/,
  /^local_source_path_leak$/,
  /^internal_metadata_leak$/,
];

function printUsage() {
  console.log(`Usage:
  npm run check:ai-ramin-live-review -- [options]

Options:
  --review-set=<path>  Review set to validate. Default: ${DEFAULT_REVIEW_SET_PATH}
  --strict             Require every case to be captured, scored, non-failed, and above the live-review threshold.
  --json               Print machine-readable JSON.
  --help               Show this message.
`);
}

function parseArgs(argv) {
  const options = {
    reviewSetPath: DEFAULT_REVIEW_SET_PATH,
    strict: false,
    json: false,
    help: false,
  };

  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--strict') options.strict = true;
    else if (arg === '--json') options.json = true;
    else if (arg.startsWith('--review-set=')) options.reviewSetPath = arg.slice('--review-set='.length).trim();
    else throw new Error(`Unknown option: ${arg}`);
  }

  return options;
}

function resolveInputPath(inputPath) {
  return path.isAbsolute(inputPath) ? inputPath : path.join(ROOT_DIR, inputPath);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function hasText(value, minLength = 1) {
  return typeof value === 'string' && value.trim().length >= minLength;
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string' && item.trim());
}

function isIsoTimestamp(value) {
  if (!hasText(value)) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
}

function normalizeStatus(capture) {
  return capture?.status || 'pending';
}

function isValidScore(value) {
  return Number.isInteger(value) && VALID_SCORES.has(value);
}

function hasSevereIssue(issues) {
  return issues.some((issue) => SEVERE_ISSUE_PATTERNS.some((pattern) => pattern.test(issue)));
}

function summarizeCases(cases) {
  const captured = cases.filter((item) => normalizeStatus(item.capture) === 'captured');
  const failed = cases.filter((item) => normalizeStatus(item.capture) === 'failed');
  const pending = cases.filter((item) => normalizeStatus(item.capture) === 'pending');
  const scored = captured.filter((item) => isValidScore(item.capture?.score));
  const weakOrFailing = scored.filter((item) => item.capture.score <= 1);
  const acceptable = scored.filter((item) => item.capture.score === 2);
  const strong = scored.filter((item) => item.capture.score === 3);
  const totalScore = scored.reduce((sum, item) => sum + item.capture.score, 0);

  return {
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
  };
}

function validateExpectedBehavior(item, label, failures, warnings) {
  const expected = item.expectedBehavior;
  if (!isPlainObject(expected)) {
    failures.push(`${label}: expectedBehavior object is required`);
    return;
  }

  if (!isStringArray(expected.must) || !expected.must.length) {
    failures.push(`${label}: expectedBehavior.must must be a non-empty string array`);
  }
  if (!isStringArray(expected.mustNot) || !expected.mustNot.length) {
    failures.push(`${label}: expectedBehavior.mustNot must be a non-empty string array`);
  }
  if (expected.should !== undefined && !isStringArray(expected.should)) {
    failures.push(`${label}: expectedBehavior.should must be a string array when present`);
  }

  if ((expected.must?.length ?? 0) < 2) {
    warnings.push(`${label}: expectedBehavior.must has fewer than two review anchors`);
  }
}

function validateCapture(item, label, failures, warnings) {
  const capture = item.capture;
  if (!isPlainObject(capture)) {
    failures.push(`${label}: capture object is required`);
    return;
  }

  const status = normalizeStatus(capture);
  if (!VALID_CAPTURE_STATUSES.has(status)) {
    failures.push(`${label}: capture.status must be pending, captured, or failed`);
    return;
  }

  if (!Array.isArray(capture.issues) || !capture.issues.every((issue) => typeof issue === 'string' && issue.trim())) {
    failures.push(`${label}: capture.issues must be an array of strings`);
  }

  if (status === 'pending') {
    if (capture.score !== null && capture.score !== undefined) {
      failures.push(`${label}: pending captures must not have a score`);
    }
    if (hasText(capture.answerExcerpt)) {
      warnings.push(`${label}: pending capture still has an answer excerpt`);
    }
    return;
  }

  if (!isIsoTimestamp(capture.capturedAt)) {
    failures.push(`${label}: ${status} capture must include an ISO capturedAt timestamp`);
  }

  if (status === 'failed') {
    failures.push(`${label}: capture failed and must be re-run or reset before live review is complete`);
    if (!capture.issues.length) failures.push(`${label}: failed captures must include at least one issue`);
    if (!hasText(capture.notes, 12)) failures.push(`${label}: failed captures must include failure notes`);
    if (capture.score !== null && capture.score !== undefined) {
      failures.push(`${label}: failed captures should not be manually scored; re-capture first`);
    }
    return;
  }

  if (!hasText(capture.model)) failures.push(`${label}: captured answers must include model`);
  if (!hasText(capture.answerExcerpt, 10)) failures.push(`${label}: captured answers must include a useful answerExcerpt`);
  if (!hasText(capture.notes, 12)) failures.push(`${label}: captured answers must include capture or reviewer notes`);

  if (!isValidScore(capture.score)) {
    failures.push(`${label}: captured answers must be manually scored 0, 1, 2, or 3`);
    return;
  }

  if (capture.score <= 1) {
    if (!capture.issues.length) {
      failures.push(`${label}: weak/failing scores must include at least one actionable issue`);
    }
    if (!hasText(capture.notes, 30)) {
      failures.push(`${label}: weak/failing scores must include review notes explaining the problem`);
    }
  }

  if (capture.score === 3 && capture.issues.length) {
    failures.push(`${label}: score 3 means strong; clear capture.issues or lower the score`);
  }

  if (capture.score >= 2 && hasSevereIssue(capture.issues)) {
    failures.push(`${label}: acceptable/strong scores cannot keep severe issues such as HTTP failures, empty answers, JSON leaks, or source-path leaks`);
  }
}

function validateReviewSet(reviewSet, options) {
  const failures = [];
  const warnings = [];

  if (!isPlainObject(reviewSet)) {
    return {
      failures: ['review set must be a JSON object'],
      warnings,
      summary: summarizeCases([]),
    };
  }

  if (reviewSet.schemaVersion !== 1) failures.push('schemaVersion must be 1');
  if (!hasText(reviewSet.description, 20)) warnings.push('description should explain the review-set purpose');
  if (!isPlainObject(reviewSet.reviewScale)) {
    failures.push('reviewScale object is required');
  } else {
    for (const score of ['0', '1', '2', '3']) {
      if (!hasText(reviewSet.reviewScale[score], 12)) failures.push(`reviewScale.${score} must describe that score`);
    }
  }

  if (!isStringArray(reviewSet.qualityRubric) || reviewSet.qualityRubric.length < 6) {
    failures.push('qualityRubric must include at least six string rules');
  }

  const cases = Array.isArray(reviewSet.cases) ? reviewSet.cases : [];
  if (!Array.isArray(reviewSet.cases)) failures.push('cases must be an array');
  if (!cases.length) failures.push('cases must not be empty');

  const seenIds = new Set();
  for (const [index, item] of cases.entries()) {
    const label = item?.id || `case[${index}]`;
    if (!isPlainObject(item)) {
      failures.push(`${label}: case must be an object`);
      continue;
    }

    if (!hasText(item.id)) failures.push(`${label}: id is required`);
    else if (seenIds.has(item.id)) failures.push(`${label}: duplicate id`);
    seenIds.add(item.id);
    if (!hasText(item.family)) failures.push(`${label}: family is required`);
    if (!hasText(item.prompt)) failures.push(`${label}: prompt is required`);
    if (!hasText(item.hiringMode)) failures.push(`${label}: hiringMode is required`);
    if (!hasText(item.requestType)) failures.push(`${label}: requestType is required`);
    if (!hasText(item.expectedQuestionType)) failures.push(`${label}: expectedQuestionType is required`);
    if (!hasText(item.reviewFocus, 20)) warnings.push(`${label}: reviewFocus should be specific enough for a human reviewer`);
    if (item.history !== undefined && !Array.isArray(item.history)) failures.push(`${label}: history must be an array when present`);

    validateExpectedBehavior(item, label, failures, warnings);
    validateCapture(item, label, failures, warnings);
  }

  const summary = summarizeCases(cases);

  if (options.strict) {
    if (summary.pendingCount) failures.push(`strict review requires zero pending cases; found ${summary.pendingCount}`);
    if (summary.failedCount) failures.push(`strict review requires zero failed captures; found ${summary.failedCount}`);
    if (summary.unscoredCapturedCount) {
      failures.push(`strict review requires every captured answer to be scored; found ${summary.unscoredCapturedCount} unscored`);
    }
    if (summary.weakOrFailingCount) {
      failures.push(`strict review requires zero weak/failing scores; found ${summary.weakOrFailingCount}`);
    }
    if (summary.averageScore === null) {
      failures.push('strict review requires at least one scored live answer');
    } else if (summary.averageScore < STRICT_MIN_AVERAGE_SCORE) {
      failures.push(`strict review average score must be at least ${STRICT_MIN_AVERAGE_SCORE}; found ${summary.averageScore}`);
    }
  } else if (!summary.capturedCount) {
    warnings.push('no captured live answers found; this is valid for offline verification, but strict live review has not run yet');
  }

  return {
    failures,
    warnings,
    summary,
  };
}

function printTextReport(report) {
  const lines = [
    report.failures.length ? 'AI Ramin live review check failed.' : 'AI Ramin live review check passed.',
    '',
    `Review set: ${report.reviewSetPath}`,
    `Mode: ${report.strict ? 'strict' : 'standard'}`,
    `Cases: ${report.summary.caseCount} total, ${report.summary.capturedCount} captured, ${report.summary.scoredCount} scored, ${report.summary.pendingCount} pending, ${report.summary.failedCount} failed`,
    `Scores: ${report.summary.strongCount} strong, ${report.summary.acceptableCount} acceptable, ${report.summary.weakOrFailingCount} weak/failing, average ${report.summary.averageScore ?? 'n/a'}`,
  ];

  if (report.failures.length) {
    lines.push('', 'Failures:');
    for (const failure of report.failures) lines.push(`- ${failure}`);
  }

  if (report.warnings.length) {
    lines.push('', 'Warnings:');
    for (const warning of report.warnings) lines.push(`- ${warning}`);
  }

  return lines.join('\n');
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printUsage();
    return;
  }

  const fullPath = resolveInputPath(options.reviewSetPath);
  const reviewSet = JSON.parse(await readFile(fullPath, 'utf8'));
  const result = validateReviewSet(reviewSet, options);
  const report = {
    generatedAt: new Date().toISOString(),
    reviewSetPath: path.relative(ROOT_DIR, fullPath) || fullPath,
    strict: options.strict,
    ...result,
  };

  if (options.json) console.log(JSON.stringify(report, null, 2));
  else console.log(printTextReport(report));

  if (report.failures.length) process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
