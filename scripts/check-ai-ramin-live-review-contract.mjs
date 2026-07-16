#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const files = {
  packageJson: 'package.json',
  reviewCheckScript: 'scripts/check-ai-ramin-live-review.mjs',
  readme: 'ai-ramin-section/evaluation/README.md',
  spec: 'docs/section-specs/07-ai-ramin-chatbot.md',
  handoff: 'ai-ramin-section/AI-RAMIN-final-fixes.md',
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

assertIncludes('packageJson', '"check:ai-ramin-live-review"', 'package scripts');
assertIncludes('packageJson', '"check:ai-ramin-live-review-contract"', 'package scripts');
assertIncludes('packageJson', 'check:ai-ramin-live-review', 'verify pipeline');
assertIncludes('reviewCheckScript', 'STRICT_MIN_AVERAGE_SCORE', 'live review checker strict threshold');
assertIncludes('reviewCheckScript', 'weak/failing scores must include at least one actionable issue', 'live review checker weak-score guard');
assertIncludes('reviewCheckScript', 'captured answers must be manually scored 0, 1, 2, or 3', 'live review checker score guard');
assertIncludes('readme', 'check:ai-ramin-live-review', 'live review runbook');
assertIncludes('readme', 'check:ai-ramin-live-review -- --strict', 'strict live review runbook');
assertIncludes('spec', 'live-review checker', 'AI Ramin spec live-review documentation');
assertIncludes('handoff', 'check:ai-ramin-live-review', 'AI Ramin handoff live-review command');

function baseReviewSet(capture) {
  return {
    schemaVersion: 1,
    description: 'Fixture live-answer review set for AI Ramin validator contract testing.',
    status: 'fixture',
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
      {
        id: 'fixture-live-case',
        family: 'fixture',
        prompt: 'What is Ramin best at in product?',
        hiringMode: 'hiring-manager',
        requestType: 'general_chat',
        expectedQuestionType: 'strongest_product_proof',
        reviewFocus: 'Checks that the fixture answer can be manually reviewed against the live-review rubric.',
        expectedBehavior: {
          must: [
            'Give a direct product judgment.',
            'Use concrete proof.',
          ],
          mustNot: [
            'Refuse to answer.',
            'Leak internal metadata.',
          ],
        },
        capture,
      },
    ],
  };
}

function runChecker(reviewSetPath, extraArgs = []) {
  return spawnSync(
    process.execPath,
    [
      path.join(ROOT_DIR, files.reviewCheckScript),
      `--review-set=${reviewSetPath}`,
      '--json',
      ...extraArgs,
    ],
    {
      cwd: ROOT_DIR,
      encoding: 'utf8',
    },
  );
}

async function writeFixture(tmpDir, name, reviewSet) {
  const fixturePath = path.join(tmpDir, `${name}.json`);
  await writeFile(fixturePath, `${JSON.stringify(reviewSet, null, 2)}\n`, 'utf8');
  return fixturePath;
}

function assertStatus(label, result, expectedStatus) {
  if (result.status !== expectedStatus) {
    failures.push(`${label} expected exit ${expectedStatus}, got ${result.status}: ${result.stderr || result.stdout}`);
  }
}

const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'ai-ramin-live-review-contract-'));

try {
  const pendingPath = await writeFixture(
    tmpDir,
    'pending',
    baseReviewSet({
      status: 'pending',
      capturedAt: '',
      model: '',
      answerExcerpt: '',
      score: null,
      issues: [],
      notes: '',
    }),
  );

  const strongPath = await writeFixture(
    tmpDir,
    'strong',
    baseReviewSet({
      status: 'captured',
      capturedAt: '2026-06-15T12:00:00.000Z',
      model: 'gemini-2.5-flash',
      answerExcerpt: 'Ramin is strongest at turning ambiguous, complex product systems into trusted decision surfaces.',
      score: 3,
      issues: [],
      notes: 'Auto-captured by fixture. Reviewer confirmed this is a strong grounded answer.',
    }),
  );

  const unscoredPath = await writeFixture(
    tmpDir,
    'unscored',
    baseReviewSet({
      status: 'captured',
      capturedAt: '2026-06-15T12:00:00.000Z',
      model: 'gemini-2.5-flash',
      answerExcerpt: 'Ramin is strongest at product systems work.',
      score: null,
      issues: [],
      notes: 'Auto-captured by fixture.',
    }),
  );

  const weakNoIssuesPath = await writeFixture(
    tmpDir,
    'weak-no-issues',
    baseReviewSet({
      status: 'captured',
      capturedAt: '2026-06-15T12:00:00.000Z',
      model: 'gemini-2.5-flash',
      answerExcerpt: 'Ramin is a product manager.',
      score: 1,
      issues: [],
      notes: 'This answer is too thin and needs review.',
    }),
  );

  const severeIssuePath = await writeFixture(
    tmpDir,
    'severe-issue',
    baseReviewSet({
      status: 'captured',
      capturedAt: '2026-06-15T12:00:00.000Z',
      model: 'gemini-2.5-flash',
      answerExcerpt: '{"short_answer":"Ramin is a product manager."}',
      score: 2,
      issues: ['raw_json_short_answer'],
      notes: 'Fixture keeps a severe issue while claiming the answer is acceptable.',
    }),
  );

  assertStatus('pending standard review', runChecker(pendingPath), 0);
  assertStatus('pending strict review', runChecker(pendingPath, ['--strict']), 1);
  assertStatus('strong standard review', runChecker(strongPath), 0);
  assertStatus('strong strict review', runChecker(strongPath, ['--strict']), 0);
  assertStatus('unscored captured review', runChecker(unscoredPath), 1);
  assertStatus('weak score without issue review', runChecker(weakNoIssuesPath), 1);
  assertStatus('acceptable score with severe issue review', runChecker(severeIssuePath), 1);
} finally {
  await rm(tmpDir, { recursive: true, force: true });
}

if (failures.length) {
  console.error('AI Ramin live review contract check failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('AI Ramin live review contract check passed.');
