import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const files = {
  packageJson: 'package.json',
  promotionScript: 'scripts/promote-ai-ramin-eval-candidates.mjs',
  reviewScript: 'scripts/review-ai-ramin-feedback.mjs',
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

assertIncludes('packageJson', '"promote:ai-ramin-eval-candidates"', 'package scripts');
assertIncludes('packageJson', '"check:ai-ramin-eval-promotion"', 'package scripts');
assertIncludes('packageJson', 'check:ai-ramin-eval-promotion', 'verify pipeline');
assertIncludes('promotionScript', 'latest-feedback-review.json', 'promotion script feedback-review input');
assertIncludes('promotionScript', 'latest-eval-case-promotion-plan.json', 'promotion script local plan output');
assertIncludes('promotionScript', '--approve', 'promotion script human approval flag');
assertIncludes('promotionScript', '--candidate=', 'promotion script candidate selection flag');
assertIncludes('promotionScript', 'ANSWER_TECHNIQUE_BY_QUESTION_TYPE', 'promotion script routing normalization');
assertIncludes('promotionScript', 'Refusing to write without human selection', 'promotion script write guard');
assertIncludes('readme', 'promote:ai-ramin-eval-candidates', 'promotion runbook');
assertIncludes('spec', 'Stage 10', 'AI Ramin spec Stage 10 documentation');
assertIncludes('gitignore', 'ai-ramin-section/evaluation/latest-eval-case-promotion-plan.json', 'promotion plan gitignore rule');

if (failures.length) {
  console.error('AI Ramin eval promotion contract check failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'ai-ramin-eval-promotion-'));

try {
  const feedbackPath = path.join(tmpDir, 'feedback.jsonl');
  const reviewPath = path.join(tmpDir, 'review.json');
  const evalCasesPath = path.join(tmpDir, 'eval-cases.json');
  const promotionPlanPath = path.join(tmpDir, 'promotion-plan.json');
  const fixtureRecords = [
    {
      id: 'promotion-fixture-1',
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
  ];
  const evalSuite = {
    schemaVersion: 2,
    qualityGate: {
      minimumCaseCount: 0,
    },
    cases: [
      {
        id: 'existing-conversation-open',
        category: 'conversation',
        requestType: 'general_chat',
        expectedQuestionType: 'conversation_open',
        expectedAnswerTechnique: 'lightweight_chat_open',
        expectedAnswerFrame: 'chat_open_invitation',
        expectedSoftCtas: [],
        hiringMode: 'hiring-manager',
        prompt: 'hey',
        requiredContractSections: ['short_answer'],
      },
    ],
  };

  await writeFile(feedbackPath, `${fixtureRecords.map((record) => JSON.stringify(record)).join('\n')}\n`, 'utf8');
  await writeFile(evalCasesPath, `${JSON.stringify(evalSuite, null, 2)}\n`, 'utf8');

  const reviewResult = spawnSync(
    process.execPath,
    [
      path.join(ROOT_DIR, files.reviewScript),
      `--feedback-log=${feedbackPath}`,
      `--report=${reviewPath}`,
      '--feedback=needs_review',
      '--json',
    ],
    {
      cwd: ROOT_DIR,
      encoding: 'utf8',
    },
  );

  if (reviewResult.status !== 0) {
    failures.push(`feedback review fixture run failed: ${reviewResult.stderr || reviewResult.stdout}`);
  } else {
    const review = JSON.parse(reviewResult.stdout);
    const candidateId = review.eval_case_candidates?.[0]?.id;
    if (!candidateId) {
      failures.push('feedback review did not produce an eval-case candidate for promotion');
    } else {
      const dryRunResult = spawnSync(
        process.execPath,
        [
          path.join(ROOT_DIR, files.promotionScript),
          `--review=${reviewPath}`,
          `--eval-cases=${evalCasesPath}`,
          `--report=${promotionPlanPath}`,
          `--candidate=${candidateId}`,
          '--json',
        ],
        {
          cwd: ROOT_DIR,
          encoding: 'utf8',
        },
      );

      if (dryRunResult.status !== 0) {
        failures.push(`promotion dry run failed: ${dryRunResult.stderr || dryRunResult.stdout}`);
      } else {
        const dryRun = JSON.parse(dryRunResult.stdout);
        const promotedCase = dryRun.promotable_cases?.[0]?.case;
        if (dryRun.summary.promotable_count !== 1) failures.push('promotion dry run did not find one promotable case');
        if (promotedCase?.expectedAnswerTechnique !== 'car_fit_validation') {
          failures.push('promotion did not normalize stale answer technique to live role_fit contract');
        }
        if (promotedCase?.expectedAnswerFrame !== 'fit_evidence_validation') {
          failures.push('promotion did not normalize stale answer frame to live role_fit contract');
        }
        if (!promotedCase?.expectedSoftCtas?.includes('draft_hiring_brief')) {
          failures.push('promotion did not normalize role_fit soft CTAs to ids');
        }
        if (promotedCase?.expectedSoftCtas?.includes('Draft brief')) {
          failures.push('promotion leaked UI CTA labels into eval-case expectations');
        }

        const afterDryRunSuite = JSON.parse(await readFile(evalCasesPath, 'utf8'));
        if (afterDryRunSuite.cases.length !== 1) {
          failures.push('promotion dry run wrote to eval-cases.json');
        }

        const writtenPlan = JSON.parse(await readFile(promotionPlanPath, 'utf8'));
        if (writtenPlan.summary.promotable_count !== dryRun.summary.promotable_count) {
          failures.push('promotion plan output does not match dry-run stdout');
        }
      }

      const approveResult = spawnSync(
        process.execPath,
        [
          path.join(ROOT_DIR, files.promotionScript),
          `--review=${reviewPath}`,
          `--eval-cases=${evalCasesPath}`,
          `--candidate=${candidateId}`,
          '--approve',
          '--no-write-report',
          '--json',
        ],
        {
          cwd: ROOT_DIR,
          encoding: 'utf8',
        },
      );

      if (approveResult.status !== 0) {
        failures.push(`promotion approve run failed: ${approveResult.stderr || approveResult.stdout}`);
      } else {
        const approvedSuite = JSON.parse(await readFile(evalCasesPath, 'utf8'));
        if (approvedSuite.cases.length !== 2) failures.push('promotion approve did not append one eval case');
        if (approvedSuite.cases[1]?.feedbackReview?.feedbackId !== 'promotion-fixture-1') {
          failures.push('promoted eval case did not retain feedbackReview provenance');
        }
      }

      const duplicateResult = spawnSync(
        process.execPath,
        [
          path.join(ROOT_DIR, files.promotionScript),
          `--review=${reviewPath}`,
          `--eval-cases=${evalCasesPath}`,
          `--candidate=${candidateId}`,
          '--approve',
          '--no-write-report',
          '--json',
        ],
        {
          cwd: ROOT_DIR,
          encoding: 'utf8',
        },
      );

      if (duplicateResult.status !== 0) {
        failures.push(`duplicate promotion run failed unexpectedly: ${duplicateResult.stderr || duplicateResult.stdout}`);
      } else {
        const duplicate = JSON.parse(duplicateResult.stdout);
        const duplicateSuite = JSON.parse(await readFile(evalCasesPath, 'utf8'));
        if (duplicate.summary.skipped_count !== 1) failures.push('duplicate promotion was not skipped');
        if (duplicateSuite.cases.length !== 2) failures.push('duplicate promotion appended another eval case');
      }
    }
  }

  const unsafeApproveResult = spawnSync(
    process.execPath,
    [
      path.join(ROOT_DIR, files.promotionScript),
      `--review=${reviewPath}`,
      `--eval-cases=${evalCasesPath}`,
      '--approve',
      '--no-write-report',
      '--json',
    ],
    {
      cwd: ROOT_DIR,
      encoding: 'utf8',
    },
  );

  if (unsafeApproveResult.status === 0) {
    failures.push('promotion approve without --candidate or --all did not fail');
  }
} finally {
  await rm(tmpDir, { recursive: true, force: true });
}

if (failures.length) {
  console.error('AI Ramin eval promotion contract check failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('AI Ramin eval promotion contract check passed.');
