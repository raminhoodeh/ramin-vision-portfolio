import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REVIEW_REPORT_PATH = path.join(ROOT_DIR, 'ai-ramin-section/evaluation/latest-feedback-review.json');
const EVAL_CASES_PATH = path.join(ROOT_DIR, 'ai-ramin-section/evaluation/eval-cases.json');
const PROMOTION_PLAN_PATH = path.join(ROOT_DIR, 'ai-ramin-section/evaluation/latest-eval-case-promotion-plan.json');

const REQUEST_TYPES = new Set([
  'general_chat',
  'role_fit',
  'product_judgment',
  'evidence_lookup',
  'hiring_brief',
]);

const QUESTION_TYPES = new Set([
  'conversation_open',
  'portfolio_overview',
  'factual_capability',
  'role_fit',
  'behavioral_example',
  'product_judgment',
  'tradeoff_or_prioritisation',
  'weakness_or_gap',
  'first_90_days',
  'interview_coaching',
  'hiring_brief',
  'strongest_product_proof',
  'evidence_lookup',
  'guardrail_boundary',
  'clarification_needed',
]);

const HIRING_MODES = new Set([
  'recruiter',
  'hiring-manager',
  'founder',
  'ai-product-lead',
  'investor',
  'curious-visitor',
]);

const ANSWER_SECTIONS = new Set([
  'short_answer',
  'verified_proof',
  'inferred_fit',
  'confidential_boundary',
  'open_questions',
  'suggested_next_action',
]);

const ANSWER_TECHNIQUE_BY_QUESTION_TYPE = {
  conversation_open: 'lightweight_chat_open',
  portfolio_overview: 'rule_of_three_orientation',
  factual_capability: 'direct_proof_boundary',
  role_fit: 'car_fit_validation',
  behavioral_example: 'star_soar_story',
  product_judgment: 'product_judgment_stack',
  tradeoff_or_prioritisation: 'spar_tradeoff',
  weakness_or_gap: 'boundary_mitigation_validation',
  first_90_days: 'diagnose_align_ship_measure',
  interview_coaching: 'explicit_interview_framework',
  hiring_brief: 'copy_ready_hiring_brief',
  strongest_product_proof: 'rank_prove_translate',
  evidence_lookup: 'proof_ledger',
  guardrail_boundary: 'policy_boundary_redirect',
  clarification_needed: 'clarifying_question',
};

const ANSWER_FRAME_BY_QUESTION_TYPE = {
  conversation_open: 'chat_open_invitation',
  portfolio_overview: 'orient_prove_translate',
  factual_capability: 'direct_claim_proof_boundary',
  role_fit: 'fit_evidence_validation',
  behavioral_example: 'memorable_story_arc',
  product_judgment: 'judgement_tradeoff_proof',
  tradeoff_or_prioritisation: 'tradeoff_decision_arc',
  weakness_or_gap: 'candid_gap_mitigation',
  first_90_days: 'diagnostic_ramp_plan',
  interview_coaching: 'explicit_coaching_scaffold',
  hiring_brief: 'hiring_recall_brief',
  strongest_product_proof: 'ranked_product_proof',
  evidence_lookup: 'proof_first_ledger',
  guardrail_boundary: 'boundary_redirect',
  clarification_needed: 'clarification_prompt',
};

const SOFT_CTAS_BY_QUESTION_TYPE = {
  conversation_open: [],
  portfolio_overview: ['analyze_role_fit', 'compare_projects'],
  factual_capability: ['analyze_role_fit'],
  role_fit: ['draft_hiring_brief', 'generate_interview_questions'],
  behavioral_example: ['generate_interview_questions'],
  product_judgment: ['turn_into_mvp_plan', 'show_risks', 'compare_projects'],
  tradeoff_or_prioritisation: ['show_risks', 'compare_projects'],
  weakness_or_gap: ['generate_interview_questions'],
  first_90_days: ['draft_hiring_brief', 'generate_interview_questions'],
  interview_coaching: ['generate_interview_questions'],
  hiring_brief: ['generate_interview_questions'],
  strongest_product_proof: ['analyze_role_fit', 'compare_projects'],
  evidence_lookup: ['use_in_hiring_brief'],
  guardrail_boundary: ['analyze_role_fit', 'compare_projects'],
  clarification_needed: [],
};

const REQUEST_TYPE_BY_QUESTION_TYPE = {
  conversation_open: 'general_chat',
  portfolio_overview: 'general_chat',
  factual_capability: 'general_chat',
  role_fit: 'role_fit',
  behavioral_example: 'general_chat',
  product_judgment: 'product_judgment',
  tradeoff_or_prioritisation: 'product_judgment',
  weakness_or_gap: 'general_chat',
  first_90_days: 'role_fit',
  interview_coaching: 'general_chat',
  hiring_brief: 'hiring_brief',
  strongest_product_proof: 'general_chat',
  evidence_lookup: 'evidence_lookup',
  guardrail_boundary: 'general_chat',
  clarification_needed: 'general_chat',
};

function parseArgs(argv) {
  const options = {
    reviewPath: REVIEW_REPORT_PATH,
    evalCasesPath: EVAL_CASES_PATH,
    reportPath: PROMOTION_PLAN_PATH,
    selectedCandidateIds: [],
    all: false,
    approve: false,
    writeReport: true,
    json: false,
  };

  for (const arg of argv) {
    if (arg === '--all') options.all = true;
    if (arg === '--approve') options.approve = true;
    if (arg === '--dry-run') options.approve = false;
    if (arg === '--no-write-report') options.writeReport = false;
    if (arg === '--json') options.json = true;
    if (arg.startsWith('--candidate=')) options.selectedCandidateIds.push(arg.slice('--candidate='.length));
    if (arg.startsWith('--review=')) options.reviewPath = resolveCliPath(arg.slice('--review='.length));
    if (arg.startsWith('--eval-cases=')) options.evalCasesPath = resolveCliPath(arg.slice('--eval-cases='.length));
    if (arg.startsWith('--report=')) options.reportPath = resolveCliPath(arg.slice('--report='.length));
  }

  return options;
}

function resolveCliPath(value) {
  return path.isAbsolute(value) ? value : path.join(ROOT_DIR, value);
}

function normalizePath(filePath) {
  return path.relative(ROOT_DIR, filePath).split(path.sep).join('/');
}

async function readJson(filePath, label) {
  if (!existsSync(filePath)) {
    throw new Error(`${label} not found at ${normalizePath(filePath)}.`);
  }

  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function slugify(value, fallback = 'candidate') {
  return String(value ?? fallback)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72) || fallback;
}

function uniqueValues(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function getSelectedCandidates(candidates, options) {
  if (options.all || !options.selectedCandidateIds.length) {
    return {
      selected: candidates,
      missingIds: [],
    };
  }

  const byId = new Map(candidates.map((candidate) => [candidate.id, candidate]));
  return {
    selected: options.selectedCandidateIds.map((id) => byId.get(id)).filter(Boolean),
    missingIds: options.selectedCandidateIds.filter((id) => !byId.has(id)),
  };
}

function normalizeEvalCandidate(candidate, existingCaseIds, existingCaseFingerprints) {
  const errors = [];
  const warnings = [];
  const rawId = candidate?.id;
  const id = slugify(rawId, 'feedback-candidate');

  if (!rawId || typeof rawId !== 'string') {
    warnings.push(`candidate id was missing and normalized to ${id}`);
  } else if (id !== rawId) {
    warnings.push(`candidate id ${rawId} was normalized to ${id}`);
  }

  const prompt = String(candidate?.prompt ?? '').trim();
  if (!prompt) errors.push('prompt is required');

  const expectedQuestionType = String(candidate?.expectedQuestionType ?? '').trim();
  if (!QUESTION_TYPES.has(expectedQuestionType)) {
    errors.push(`invalid expectedQuestionType: ${expectedQuestionType || 'missing'}`);
  }

  const fallbackRequestType = REQUEST_TYPE_BY_QUESTION_TYPE[expectedQuestionType] ?? 'general_chat';
  let requestType = candidate?.requestType;
  if (!REQUEST_TYPES.has(requestType)) {
    warnings.push(`requestType ${requestType || 'missing'} was normalized to ${fallbackRequestType}`);
    requestType = fallbackRequestType;
  }

  let hiringMode = candidate?.hiringMode;
  if (!HIRING_MODES.has(hiringMode)) {
    warnings.push(`hiringMode ${hiringMode || 'missing'} was normalized to hiring-manager`);
    hiringMode = 'hiring-manager';
  }

  const expectedAnswerTechnique = ANSWER_TECHNIQUE_BY_QUESTION_TYPE[expectedQuestionType];
  if (candidate?.expectedAnswerTechnique && candidate.expectedAnswerTechnique !== expectedAnswerTechnique) {
    warnings.push(
      `expectedAnswerTechnique ${candidate.expectedAnswerTechnique} was normalized to ${expectedAnswerTechnique}`,
    );
  }

  const expectedAnswerFrame = ANSWER_FRAME_BY_QUESTION_TYPE[expectedQuestionType];
  if (candidate?.expectedAnswerFrame && candidate.expectedAnswerFrame !== expectedAnswerFrame) {
    warnings.push(`expectedAnswerFrame ${candidate.expectedAnswerFrame} was normalized to ${expectedAnswerFrame}`);
  }

  const invalidSections = [];
  const requiredContractSections = uniqueValues(
    (Array.isArray(candidate?.requiredContractSections) ? candidate.requiredContractSections : [])
      .filter((section) => {
        const valid = ANSWER_SECTIONS.has(section);
        if (!valid) invalidSections.push(section);
        return valid;
      }),
  );
  if (invalidSections.length) warnings.push(`invalid requiredContractSections removed: ${invalidSections.join(', ')}`);
  if (!requiredContractSections.length) {
    warnings.push('requiredContractSections was empty and normalized to short_answer');
    requiredContractSections.push('short_answer');
  }

  if (existingCaseIds.has(id)) {
    errors.push(`eval case id already exists: ${id}`);
  }

  const fingerprint = `${requestType}|${expectedQuestionType}|${hiringMode}|${prompt.toLowerCase()}`;
  if (existingCaseFingerprints.has(fingerprint)) {
    errors.push('an eval case with the same request type, question type, hiring mode, and prompt already exists');
  }

  const feedbackReview = candidate?.feedbackReview && typeof candidate.feedbackReview === 'object'
    ? candidate.feedbackReview
    : {};
  const labels = Array.isArray(feedbackReview.labels) ? feedbackReview.labels : [];

  const normalizedCase = {
    id,
    category: typeof candidate?.category === 'string' && candidate.category
      ? candidate.category
      : `feedback_${slugify(labels[0], 'review')}`,
    requestType,
    expectedQuestionType,
    expectedAnswerTechnique,
    expectedAnswerFrame,
    expectedSoftCtas: SOFT_CTAS_BY_QUESTION_TYPE[expectedQuestionType] ?? [],
    hiringMode,
    prompt,
    requiredContractSections,
    feedbackReview,
    promotionReview: {
      source: 'feedback_review_eval_case_candidate',
      sourceCandidateId: rawId ?? id,
      sourceFeedbackId: feedbackReview.feedbackId ?? null,
      reason: feedbackReview.reason ?? 'manual_promotion',
    },
  };

  return {
    sourceCandidateId: rawId ?? id,
    case: normalizedCase,
    errors,
    warnings,
  };
}

function buildExistingCaseIndexes(evalSuite) {
  const existingCaseIds = new Set();
  const existingCaseFingerprints = new Set();

  for (const testCase of evalSuite.cases ?? []) {
    if (testCase.id) existingCaseIds.add(testCase.id);
    if (testCase.prompt && testCase.requestType && testCase.expectedQuestionType && testCase.hiringMode) {
      existingCaseFingerprints.add(
        [
          testCase.requestType,
          testCase.expectedQuestionType,
          testCase.hiringMode,
          String(testCase.prompt).toLowerCase(),
        ].join('|'),
      );
    }
  }

  return { existingCaseIds, existingCaseFingerprints };
}

function buildPromotionReport(reviewReport, evalSuite, options) {
  const candidates = Array.isArray(reviewReport.eval_case_candidates)
    ? reviewReport.eval_case_candidates
    : [];
  const { selected, missingIds } = getSelectedCandidates(candidates, options);
  const { existingCaseIds, existingCaseFingerprints } = buildExistingCaseIndexes(evalSuite);
  const normalized = selected.map((candidate) =>
    normalizeEvalCandidate(candidate, existingCaseIds, existingCaseFingerprints),
  );
  const promotable = normalized.filter((item) => !item.errors.length);
  const skipped = normalized.filter((item) => item.errors.length);

  return {
    schemaVersion: 1,
    generated_at: new Date().toISOString(),
    mode: options.approve ? 'approve' : 'dry_run',
    source_path: normalizePath(options.reviewPath),
    target_path: normalizePath(options.evalCasesPath),
    selection: {
      all: options.all,
      candidate_ids: options.selectedCandidateIds,
      missing_candidate_ids: missingIds,
    },
    summary: {
      source_candidate_count: candidates.length,
      selected_candidate_count: selected.length,
      promotable_count: promotable.length,
      skipped_count: skipped.length,
      approved_write: options.approve,
    },
    promotable_cases: promotable,
    skipped_candidates: [
      ...skipped,
      ...missingIds.map((id) => ({
        sourceCandidateId: id,
        case: null,
        errors: [`candidate id not found: ${id}`],
        warnings: [],
      })),
    ],
    next_actions: options.approve
      ? [
          'Run npm run check:ai-ramin-eval.',
          'Run npm run check:ai-ramin-routing.',
          'If a promoted case fails, fix the source coverage or candidate expectations before weakening the case.',
        ]
      : [
          'Review promotable_cases before approving.',
          'Run this script again with --approve and either --candidate=<id> or --all to append cases.',
          'After approval, run npm run check:ai-ramin-eval and npm run check:ai-ramin-routing.',
        ],
  };
}

function printTextSummary(report, options) {
  const lines = [
    `AI Ramin eval promotion ${report.mode}: ${report.summary.promotable_count}/${report.summary.selected_candidate_count} selected candidates promotable.`,
  ];

  if (report.selection.missing_candidate_ids.length) {
    lines.push(`Missing candidate ids: ${report.selection.missing_candidate_ids.join(', ')}`);
  }

  if (report.promotable_cases.length) {
    lines.push('', 'Promotable cases:');
    report.promotable_cases.slice(0, 10).forEach((item) => {
      lines.push(`- ${item.case.id}: ${item.case.expectedQuestionType} / ${item.case.expectedAnswerFrame}`);
      item.warnings.forEach((warning) => lines.push(`  warning: ${warning}`));
    });
  }

  if (report.skipped_candidates.length) {
    lines.push('', 'Skipped candidates:');
    report.skipped_candidates.slice(0, 10).forEach((item) => {
      lines.push(`- ${item.sourceCandidateId}: ${item.errors.join('; ')}`);
    });
  }

  if (!options.approve) {
    lines.push('', 'No eval cases were written. Use --approve with --candidate=<id> or --all after manual review.');
  } else if (report.summary.promotable_count) {
    lines.push('', `Wrote ${report.summary.promotable_count} eval case(s) to ${report.target_path}.`);
  } else {
    lines.push('', 'No eval cases were written because there were no promotable candidates.');
  }

  if (options.writeReport) {
    lines.push(`Promotion plan written to ${normalizePath(options.reportPath)}.`);
  }

  return lines.join('\n');
}

const options = parseArgs(process.argv.slice(2));

if (options.approve && !options.all && !options.selectedCandidateIds.length) {
  throw new Error('Refusing to write without human selection. Use --approve with --candidate=<id> or --all.');
}

const reviewReport = await readJson(options.reviewPath, 'Feedback review report');
const evalSuite = await readJson(options.evalCasesPath, 'Eval case suite');

if (!Array.isArray(evalSuite.cases)) {
  throw new Error('Eval case suite must contain a cases array.');
}

const promotionReport = buildPromotionReport(reviewReport, evalSuite, options);

if (options.approve && promotionReport.summary.promotable_count) {
  const updatedSuite = {
    ...evalSuite,
    cases: [
      ...evalSuite.cases,
      ...promotionReport.promotable_cases.map((item) => item.case),
    ],
  };
  await writeFile(options.evalCasesPath, `${JSON.stringify(updatedSuite, null, 2)}\n`, 'utf8');
}

if (options.writeReport) {
  await mkdir(path.dirname(options.reportPath), { recursive: true });
  await writeFile(options.reportPath, `${JSON.stringify(promotionReport, null, 2)}\n`, 'utf8');
}

if (options.json) {
  console.log(JSON.stringify(promotionReport, null, 2));
} else {
  console.log(printTextSummary(promotionReport, options));
}
