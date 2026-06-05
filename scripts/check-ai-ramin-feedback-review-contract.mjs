import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const files = {
  packageJson: 'package.json',
  reviewScript: 'scripts/review-ai-ramin-feedback.mjs',
  reportSchema: 'ai-ramin-section/evaluation/latest-feedback-review.schema.json',
  readme: 'ai-ramin-section/evaluation/README.md',
  spec: 'docs/section-specs/07-ai-ramin-chatbot.md',
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

assertIncludes('packageJson', '"review:ai-ramin-feedback"', 'package scripts');
assertIncludes('packageJson', '"check:ai-ramin-review"', 'package scripts');
assertIncludes('reviewScript', 'live-feedback.jsonl', 'feedback review script');
assertIncludes('reviewScript', 'latest-feedback-review.json', 'feedback review output');
assertIncludes('reviewScript', '--feedback-log=', 'feedback review fixture input option');
assertIncludes('reviewScript', '--report=', 'feedback review fixture report option');
assertIncludes('reviewScript', 'eval_case_candidates', 'feedback review eval candidates');
assertIncludes('reviewScript', 'recurring_issues', 'feedback review recurring issues');
assertIncludes('reviewScript', 'requiredContractSections', 'feedback review eval-case shape');
assertIncludes('reportSchema', '"AI Ramin Feedback Review Report"', 'feedback review report schema');
assertIncludes('reportSchema', '"eval_case_candidates"', 'feedback review schema eval candidates');
assertIncludes('readme', 'review:ai-ramin-feedback', 'feedback review runbook');
assertIncludes('spec', 'Stage 9', 'AI Ramin spec Stage 9 documentation');
assertIncludes('gitignore', 'ai-ramin-section/evaluation/latest-feedback-review.json', 'local review report gitignore rule');

if (failures.length) {
  console.error('AI Ramin feedback review contract check failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'ai-ramin-feedback-review-'));

try {
  const fixturePath = path.join(tmpDir, 'feedback.jsonl');
  const reportPath = path.join(tmpDir, 'report.json');
  const fixtureRecords = [
    {
      id: 'review-fixture-1',
      created_at: '2026-05-25T10:00:00.000Z',
      feedback: 'needs_review',
      review_priority: 'high',
      request_type: 'role_fit',
      hiring_mode: 'hiring-manager',
      answer_shape: {
        primary_question_type: 'role_fit',
        answer_technique_id: 'bar_riser',
        answer_frame_id: 'proof_first_ledger',
        soft_ctas: ['Draft brief', 'Interview questions'],
      },
      evidence: {
        answerable_evidence_count: 0,
        context_truncated: false,
      },
      note: 'Needs verified proof and a source.',
      user_prompt_preview: 'Can Ramin handle a B2B SaaS product lead role?',
      answer_preview: 'Ramin can probably do this.',
    },
    {
      id: 'review-fixture-2',
      created_at: '2026-05-25T10:01:00.000Z',
      feedback: 'needs_review',
      review_priority: 'medium',
      request_type: 'role_fit',
      hiring_mode: 'hiring-manager',
      answer_shape: {
        primary_question_type: 'role_fit',
        answer_technique_id: 'bar_riser',
        answer_frame_id: 'proof_first_ledger',
        soft_ctas: ['Draft brief', 'Interview questions'],
      },
      evidence: {
        answerable_evidence_count: 0,
        context_truncated: false,
      },
      note: 'No evidence or verified proof for the claim.',
      user_prompt_preview: 'Is Ramin strong enough for enterprise SaaS discovery?',
      answer_preview: 'Yes, he is strong.',
    },
    {
      id: 'review-fixture-3',
      created_at: '2026-05-25T10:02:00.000Z',
      feedback: 'helpful',
      review_priority: 'low',
      request_type: 'general_chat',
      hiring_mode: 'hiring-manager',
      answer_shape: {
        primary_question_type: 'portfolio_overview',
        answer_technique_id: 'contextualize',
        answer_frame_id: 'orient_prove_translate',
        soft_ctas: ['View evidence'],
      },
      evidence: {
        answerable_evidence_count: 2,
        context_truncated: false,
      },
      user_prompt_preview: 'What is this portfolio?',
      answer_preview: 'This is a source-grounded portfolio chat.',
    },
  ];

  await writeFile(fixturePath, `${fixtureRecords.map((record) => JSON.stringify(record)).join('\n')}\n`, 'utf8');

  const result = spawnSync(
    process.execPath,
    [
      path.join(ROOT_DIR, files.reviewScript),
      `--feedback-log=${fixturePath}`,
      `--report=${reportPath}`,
      '--feedback=needs_review',
      '--json',
    ],
    {
      cwd: ROOT_DIR,
      encoding: 'utf8',
    },
  );

  if (result.status !== 0) {
    failures.push(`feedback review fixture run failed: ${result.stderr || result.stdout}`);
  } else {
    const report = JSON.parse(result.stdout);
    if (report.summary.selected_records !== 2) failures.push('feedback review filter did not select two needs_review records');
    if (report.review_queue.length !== 2) failures.push('feedback review queue did not include two needs_review records');
    if (!report.review_queue[0].labels.includes('insufficient_evidence')) {
      failures.push('feedback review did not label insufficient evidence');
    }
    if (!report.recurring_issues.length) failures.push('feedback review did not group recurring issues');
    if (report.eval_case_candidates.length < 2) failures.push('feedback review did not create eval-case candidates');
    if (!report.eval_case_candidates[0].requiredContractSections?.includes('verified_proof')) {
      failures.push('feedback review eval candidates did not require verified proof');
    }

    const writtenReport = JSON.parse(await readFile(reportPath, 'utf8'));
    if (writtenReport.summary.selected_records !== report.summary.selected_records) {
      failures.push('feedback review did not write the same report it printed');
    }
  }
} finally {
  await rm(tmpDir, { recursive: true, force: true });
}

if (failures.length) {
  console.error('AI Ramin feedback review contract check failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('AI Ramin feedback review contract check passed.');
