#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const files = {
  packageJson: 'package.json',
  reviewScript: 'scripts/review-ai-ramin-live-answers.mjs',
  reportSchema: 'ai-ramin-section/evaluation/latest-live-review-report.schema.json',
  readme: 'ai-ramin-section/evaluation/README.md',
  spec: 'docs/section-specs/07-ai-ramin-chatbot.md',
  handoff: 'ai-ramin-section/AI-RAMIN-final-fixes.md',
  gitignore: '.gitignore',
};

const entries = await Promise.all(
  Object.entries(files).map(async ([key, relativePath]) => [
    key,
    await readFile(path.join(ROOT_DIR, relativePath), 'utf8'),
  ]),
);
const sourceByKey = Object.fromEntries(entries);
const failures = [];

function assertIncludes(key, needle, label) {
  if (!sourceByKey[key].includes(needle)) {
    failures.push(`${label} missing ${needle}`);
  }
}

assertIncludes('packageJson', '"review:ai-ramin-live"', 'package scripts');
assertIncludes('packageJson', '"check:ai-ramin-live-review-report"', 'package scripts');
assertIncludes('packageJson', 'check:ai-ramin-live-review-report', 'verify pipeline');
assertIncludes('reviewScript', 'latest-live-review-report.json', 'live review report output');
assertIncludes('reviewScript', 'deterministic_followups', 'live review deterministic followups');
assertIncludes('reviewScript', 'review_queue', 'live review queue');
assertIncludes('reviewScript', '--no-write-report', 'live review no-write mode');
assertIncludes('reportSchema', '"AI Ramin Live Review Report"', 'live review report schema');
assertIncludes('reportSchema', '"deterministic_followups"', 'live review report schema followups');
assertIncludes('readme', 'review:ai-ramin-live', 'live review report runbook');
assertIncludes('spec', 'live-review report', 'AI Ramin spec live-review report documentation');
assertIncludes('handoff', 'review:ai-ramin-live', 'AI Ramin handoff live-review report command');
assertIncludes('gitignore', 'ai-ramin-section/evaluation/latest-live-review-report.json', 'local live-review report gitignore rule');

function reviewCase(id, family, capture) {
  return {
    id,
    family,
    prompt: `Fixture prompt for ${id}`,
    hiringMode: 'hiring-manager',
    requestType: 'general_chat',
    expectedQuestionType: family === 'routing' ? 'role_fit' : 'strongest_product_proof',
    reviewFocus: 'Fixture case used by the live-review report contract.',
    expectedBehavior: {
      must: ['Answer directly.', 'Use concrete evidence.'],
      mustNot: ['Leak internal metadata.', 'Refuse unnecessarily.'],
    },
    capture,
  };
}

function fixtureReviewSet() {
  return {
    schemaVersion: 1,
    description: 'Fixture live-answer review set for report contract testing.',
    reviewScale: {
      0: 'Failing: unsafe, unsupported, generic, malformed, or not answering the question.',
      1: 'Weak: technically answers but is vague, over-cautious, poorly formatted, or missing evidence.',
      2: 'Acceptable: useful and grounded, with only minor tone, structure, or specificity issues.',
      3: 'Strong: direct, natural, concrete, well formatted, and clearly separates evidence from inference.',
    },
    qualityRubric: [
      'Answers the visitor question first.',
      'Sounds like AI Ramin.',
      'Uses concrete portfolio evidence.',
      'Keeps the visible answer complete.',
      'Separates proof from inference.',
      'Does not invent unsupported facts.',
    ],
    cases: [
      reviewCase('fixture-pending', 'pending', {
        status: 'pending',
        capturedAt: '',
        model: '',
        answerExcerpt: '',
        score: null,
        issues: [],
        notes: '',
      }),
      reviewCase('fixture-unscored', 'quality', {
        status: 'captured',
        capturedAt: '2026-06-15T12:00:00.000Z',
        model: 'gemini-2.5-flash',
        answerExcerpt: 'Ramin is strong at product systems work.',
        score: null,
        issues: [],
        notes: 'Auto-captured by fixture.',
      }),
      reviewCase('fixture-weak-routing', 'routing', {
        status: 'captured',
        capturedAt: '2026-06-15T12:01:00.000Z',
        model: 'gemini-2.5-flash',
        answerExcerpt: 'I do not have enough context to answer this role-fit question.',
        score: 1,
        issues: ['expected_question_type_mismatch:portfolio_overview', 'over_cautious_with_sufficient_evidence'],
        notes: 'Reviewer marked this weak because it routed to the wrong answer shape and over-refused despite available evidence.',
      }),
      reviewCase('fixture-strong', 'quality', {
        status: 'captured',
        capturedAt: '2026-06-15T12:02:00.000Z',
        model: 'gemini-2.5-flash',
        answerExcerpt: 'Ramin is strongest at turning complex systems into trusted product surfaces with concrete evidence.',
        score: 3,
        issues: [],
        notes: 'Reviewer marked this strong because it was direct, grounded, and well formatted.',
      }),
    ],
  };
}

function runReview(reviewSetPath, reportPath, extraArgs = []) {
  return spawnSync(
    process.execPath,
    [
      path.join(ROOT_DIR, files.reviewScript),
      `--review-set=${reviewSetPath}`,
      `--report=${reportPath}`,
      '--json',
      ...extraArgs,
    ],
    {
      cwd: ROOT_DIR,
      encoding: 'utf8',
    },
  );
}

const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'ai-ramin-live-review-report-'));

try {
  const reviewSetPath = path.join(tmpDir, 'live-answer-review-set.json');
  const reportPath = path.join(tmpDir, 'latest-live-review-report.json');
  await writeFile(reviewSetPath, `${JSON.stringify(fixtureReviewSet(), null, 2)}\n`, 'utf8');

  const result = runReview(reviewSetPath, reportPath);
  if (result.status !== 0) {
    failures.push(`live review report fixture run failed: ${result.stderr || result.stdout}`);
  } else {
    const report = JSON.parse(result.stdout);
    if (report.summary.total_case_count !== 4) failures.push('live review report total case count mismatch');
    if (report.summary.selected_case_count !== 4) failures.push('live review report selected case count mismatch');
    if (report.summary.captured_count !== 3) failures.push('live review report captured count mismatch');
    if (report.summary.scored_count !== 2) failures.push('live review report scored count mismatch');
    if (report.summary.unscored_captured_count !== 1) failures.push('live review report did not count unscored captures');
    if (report.summary.weak_or_failing_count !== 1) failures.push('live review report did not count weak/failing answers');
    if (report.summary.status !== 'pending_manual_scores') failures.push('live review report status did not prioritize missing manual scores');
    if (!report.review_queue.some((item) => item.id === 'fixture-unscored' && item.labels.includes('missing_manual_score'))) {
      failures.push('live review report did not queue the unscored captured answer');
    }
    if (!report.review_queue.some((item) => item.id === 'fixture-weak-routing' && item.labels.includes('routing_mismatch'))) {
      failures.push('live review report did not label the routing mismatch');
    }
    if (!report.deterministic_followups.some((item) => item.live_review_case_id === 'fixture-weak-routing')) {
      failures.push('live review report did not produce a deterministic follow-up for the routing failure');
    }
    if (!report.next_actions.some((action) => action.includes('Manually score captured answers'))) {
      failures.push('live review report did not recommend manual scoring');
    }

    const writtenReport = JSON.parse(await readFile(reportPath, 'utf8'));
    if (writtenReport.summary.selected_case_count !== report.summary.selected_case_count) {
      failures.push('live review report did not write the same report it printed');
    }
  }

  const filteredReportPath = path.join(tmpDir, 'filtered-report.json');
  const filtered = runReview(reviewSetPath, filteredReportPath, ['--family=quality', '--status=scored', '--no-write-report']);
  if (filtered.status !== 0) {
    failures.push(`live review filtered report failed: ${filtered.stderr || filtered.stdout}`);
  } else {
    const report = JSON.parse(filtered.stdout);
    if (report.summary.selected_case_count !== 1) failures.push('live review report filters did not select the one scored quality case');
    if (report.summary.strong_count !== 1) failures.push('live review report filters did not preserve strong score count');
  }

  try {
    await readFile(filteredReportPath, 'utf8');
    failures.push('live review --no-write-report still wrote a report file');
  } catch {
    // Expected: --no-write-report leaves no report artifact behind.
  }
} finally {
  await rm(tmpDir, { recursive: true, force: true });
}

if (failures.length) {
  console.error('AI Ramin live review report contract check failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('AI Ramin live review report contract check passed.');
