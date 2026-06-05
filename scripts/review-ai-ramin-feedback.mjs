import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FEEDBACK_LOG_PATH = path.join(ROOT_DIR, 'ai-ramin-section/evaluation/live-feedback.jsonl');
const REVIEW_REPORT_PATH = path.join(ROOT_DIR, 'ai-ramin-section/evaluation/latest-feedback-review.json');
const DEFAULT_RECURRING_THRESHOLD = 2;

const PRIORITY_WEIGHT = {
  high: 3,
  medium: 2,
  low: 1,
};

const REQUIRED_SECTIONS_BY_ISSUE = {
  insufficient_evidence: ['short_answer', 'verified_proof', 'open_questions'],
  boundary_unclear: ['short_answer', 'confidential_boundary', 'open_questions'],
  unsupported_claim: ['short_answer', 'verified_proof', 'confidential_boundary'],
  irrelevant_answer: ['short_answer', 'open_questions'],
  formatting_problem: ['short_answer'],
  weak_next_action: ['short_answer', 'open_questions'],
  missing_detail: ['short_answer', 'verified_proof', 'open_questions'],
  unknown: ['short_answer', 'open_questions'],
};

function parseArgs(argv) {
  const options = {
    feedbackLogPath: FEEDBACK_LOG_PATH,
    reportPath: REVIEW_REPORT_PATH,
    feedback: 'all',
    priority: 'all',
    requestType: 'all',
    answerFrame: 'all',
    writeReport: true,
    json: false,
    recurringThreshold: DEFAULT_RECURRING_THRESHOLD,
  };

  for (const arg of argv) {
    if (arg === '--no-write-report') options.writeReport = false;
    if (arg === '--json') options.json = true;
    if (arg.startsWith('--feedback-log=')) options.feedbackLogPath = resolveCliPath(arg.slice('--feedback-log='.length));
    if (arg.startsWith('--report=')) options.reportPath = resolveCliPath(arg.slice('--report='.length));
    if (arg.startsWith('--feedback=')) options.feedback = arg.slice('--feedback='.length);
    if (arg.startsWith('--priority=')) options.priority = arg.slice('--priority='.length);
    if (arg.startsWith('--request-type=')) options.requestType = arg.slice('--request-type='.length);
    if (arg.startsWith('--answer-frame=')) options.answerFrame = arg.slice('--answer-frame='.length);
    if (arg.startsWith('--recurring-threshold=')) {
      const parsed = Number(arg.slice('--recurring-threshold='.length));
      if (Number.isInteger(parsed) && parsed > 0) options.recurringThreshold = parsed;
    }
  }

  return options;
}

function resolveCliPath(value) {
  return path.isAbsolute(value) ? value : path.join(ROOT_DIR, value);
}

function normalizePath(filePath) {
  return path.relative(ROOT_DIR, filePath).split(path.sep).join('/');
}

async function readJsonl(filePath) {
  if (!existsSync(filePath)) return { records: [], parseErrors: [] };

  const raw = await readFile(filePath, 'utf8');
  const records = [];
  const parseErrors = [];

  raw.split(/\r?\n/).forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    try {
      records.push(JSON.parse(trimmed));
    } catch (error) {
      parseErrors.push({
        line: index + 1,
        error: error instanceof Error ? error.message : 'Invalid JSON',
      });
    }
  });

  return { records, parseErrors };
}

function countBy(records, getter) {
  const counts = {};
  for (const record of records) {
    const key = getter(record) || 'unknown';
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])));
}

function applyFilters(records, options) {
  return records.filter((record) => {
    if (options.feedback !== 'all' && record.feedback !== options.feedback) return false;
    if (options.priority !== 'all' && record.review_priority !== options.priority) return false;
    if (options.requestType !== 'all' && record.request_type !== options.requestType) return false;
    if (options.answerFrame !== 'all' && record.answer_shape?.answer_frame_id !== options.answerFrame) return false;
    return true;
  });
}

function includesAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

function labelFeedbackIssue(record) {
  const labels = new Set();
  const note = String(record.note ?? '').toLowerCase();
  const prompt = String(record.user_prompt_preview ?? '').toLowerCase();
  const answer = String(record.answer_preview ?? '').toLowerCase();
  const joined = `${note} ${prompt} ${answer}`;
  const evidence = record.evidence ?? {};

  if (
    record.feedback === 'needs_review' &&
    (Number(evidence.answerable_evidence_count ?? 0) < 1 ||
      includesAny(joined, [/proof/, /evidence/, /source/, /verified/, /citation/, /substantiat/]))
  ) {
    labels.add('insufficient_evidence');
  }

  if (evidence.context_truncated || includesAny(joined, [/boundary/, /confidential/, /private/, /unsupported/, /not confirm/])) {
    labels.add('boundary_unclear');
  }

  if (includesAny(joined, [/invent/, /made up/, /hallucinat/, /unsupported claim/, /not true/, /incorrect/])) {
    labels.add('unsupported_claim');
  }

  if (includesAny(joined, [/irrelevant/, /wrong question/, /did not answer/, /off topic/, /missed the point/])) {
    labels.add('irrelevant_answer');
  }

  if (includesAny(joined, [/format/, /markdown/, /json/, /bullet/, /readability/, /too long/, /too verbose/])) {
    labels.add('formatting_problem');
  }

  if (includesAny(joined, [/next action/, /cta/, /follow up/, /what now/, /not useful/])) {
    labels.add('weak_next_action');
  }

  if (record.feedback === 'needs_review' && !labels.size) {
    labels.add('missing_detail');
  }

  if (!labels.size) labels.add('unknown');
  return Array.from(labels).sort();
}

function recommendedActionsForLabels(labels) {
  const actions = new Set();

  if (labels.includes('insufficient_evidence')) {
    actions.add('Check source coverage, public_safe status, answer_permission, and retrieval priority.');
    actions.add('Add or strengthen an eval case that expects verified proof for this prompt.');
  }
  if (labels.includes('boundary_unclear')) {
    actions.add('Review confidential_boundary and open_questions behavior for this question type.');
  }
  if (labels.includes('unsupported_claim')) {
    actions.add('Add a guardrail or retrieval eval preventing unsupported claims.');
  }
  if (labels.includes('irrelevant_answer')) {
    actions.add('Review question classification and answer-frame routing.');
  }
  if (labels.includes('formatting_problem')) {
    actions.add('Review answer markdown normalization and structured-section rendering.');
  }
  if (labels.includes('weak_next_action')) {
    actions.add('Review answer-frame soft CTAs and suggested_next_action wording.');
  }
  if (labels.includes('missing_detail') || labels.includes('unknown')) {
    actions.add('Inspect the answer manually and decide whether to add a source, prompt rule, or eval case.');
  }

  return Array.from(actions);
}

function buildReviewQueue(records) {
  return records
    .filter((record) => record.feedback === 'needs_review')
    .map((record) => {
      const labels = labelFeedbackIssue(record);
      return {
        id: record.id,
        created_at: record.created_at,
        feedback: record.feedback,
        review_priority: record.review_priority ?? 'low',
        request_type: record.request_type ?? 'unknown',
        hiring_mode: record.hiring_mode ?? 'unknown',
        answer_shape: record.answer_shape ?? {},
        evidence: record.evidence ?? {},
        labels,
        recommended_actions: recommendedActionsForLabels(labels),
        note: record.note ?? '',
        user_prompt_preview: record.user_prompt_preview ?? '',
        answer_preview: record.answer_preview ?? '',
      };
    })
    .sort((a, b) => {
      const priorityDelta = (PRIORITY_WEIGHT[b.review_priority] ?? 0) - (PRIORITY_WEIGHT[a.review_priority] ?? 0);
      if (priorityDelta) return priorityDelta;
      return String(b.created_at ?? '').localeCompare(String(a.created_at ?? ''));
    });
}

function recurringIssueKey(item) {
  return [
    item.request_type ?? 'unknown',
    item.answer_shape?.answer_frame_id ?? 'unknown_frame',
    item.labels[0] ?? 'unknown',
  ].join('|');
}

function buildRecurringIssues(reviewQueue, recurringThreshold) {
  const groups = new Map();

  for (const item of reviewQueue) {
    const key = recurringIssueKey(item);
    const group = groups.get(key) ?? {
      key,
      request_type: item.request_type,
      answer_frame_id: item.answer_shape?.answer_frame_id ?? 'unknown_frame',
      primary_label: item.labels[0] ?? 'unknown',
      count: 0,
      feedback_ids: [],
      sample_prompts: [],
      recommended_actions: new Set(),
    };

    group.count += 1;
    group.feedback_ids.push(item.id);
    if (item.user_prompt_preview && group.sample_prompts.length < 3) group.sample_prompts.push(item.user_prompt_preview);
    item.recommended_actions.forEach((action) => group.recommended_actions.add(action));
    groups.set(key, group);
  }

  return Array.from(groups.values())
    .filter((group) => group.count >= recurringThreshold)
    .map((group) => ({
      ...group,
      recommended_actions: Array.from(group.recommended_actions),
    }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

function requiredSectionsForLabels(labels) {
  const sections = new Set();
  labels.forEach((label) => {
    (REQUIRED_SECTIONS_BY_ISSUE[label] ?? REQUIRED_SECTIONS_BY_ISSUE.unknown).forEach((section) => sections.add(section));
  });
  return Array.from(sections);
}

function slugify(value) {
  return String(value ?? 'feedback')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 52) || 'feedback';
}

function buildEvalCaseCandidate(item, index, reason) {
  const questionType = item.answer_shape?.primary_question_type || 'portfolio_overview';
  const answerFrame = item.answer_shape?.answer_frame_id || undefined;
  const answerTechnique = item.answer_shape?.answer_technique_id || undefined;
  const prompt = item.user_prompt_preview || item.note || 'Add prompt from feedback review.';
  const labels = item.labels?.length ? item.labels : ['unknown'];

  return {
    id: `feedback-${slugify(questionType)}-${slugify(labels[0])}-${index + 1}`,
    category: `feedback_${labels[0]}`,
    requestType: item.request_type || 'general_chat',
    expectedQuestionType: questionType,
    ...(answerTechnique ? { expectedAnswerTechnique: answerTechnique } : {}),
    ...(answerFrame ? { expectedAnswerFrame: answerFrame } : {}),
    hiringMode: item.hiring_mode || 'hiring-manager',
    prompt,
    requiredContractSections: requiredSectionsForLabels(labels),
    expectedSoftCtas: Array.isArray(item.answer_shape?.soft_ctas)
      ? item.answer_shape.soft_ctas.slice(0, 2)
      : [],
    feedbackReview: {
      reason,
      feedbackId: item.id,
      labels,
      note: item.note || '',
    },
  };
}

function buildEvalCaseCandidates(reviewQueue, recurringIssues) {
  const recurringFeedbackIds = new Set(recurringIssues.flatMap((issue) => issue.feedback_ids));
  const candidates = [];

  reviewQueue.forEach((item) => {
    if (recurringFeedbackIds.has(item.id) || item.review_priority === 'high') {
      candidates.push(
        buildEvalCaseCandidate(
          item,
          candidates.length,
          recurringFeedbackIds.has(item.id) ? 'recurring_feedback_pattern' : 'high_priority_feedback',
        ),
      );
    }
  });

  return candidates.slice(0, 12);
}

function buildReport(records, selectedRecords, parseErrors, options) {
  const reviewQueue = buildReviewQueue(selectedRecords);
  const recurringIssues = buildRecurringIssues(reviewQueue, options.recurringThreshold);
  const evalCaseCandidates = buildEvalCaseCandidates(reviewQueue, recurringIssues);
  const issueLabelCounts = {};

  reviewQueue.forEach((item) => {
    item.labels.forEach((label) => {
      issueLabelCounts[label] = (issueLabelCounts[label] ?? 0) + 1;
    });
  });

  return {
    schemaVersion: 1,
    generated_at: new Date().toISOString(),
    source_path: normalizePath(options.feedbackLogPath),
    filters: {
      feedback: options.feedback,
      priority: options.priority,
      request_type: options.requestType,
      answer_frame: options.answerFrame,
      recurring_threshold: options.recurringThreshold,
    },
    summary: {
      total_records: records.length,
      selected_records: selectedRecords.length,
      needs_review_records: selectedRecords.filter((record) => record.feedback === 'needs_review').length,
      helpful_records: selectedRecords.filter((record) => record.feedback === 'helpful').length,
      parse_error_count: parseErrors.length,
      by_feedback: countBy(selectedRecords, (record) => record.feedback),
      by_review_priority: countBy(selectedRecords, (record) => record.review_priority),
      by_request_type: countBy(selectedRecords, (record) => record.request_type),
      by_answer_frame: countBy(selectedRecords, (record) => record.answer_shape?.answer_frame_id),
      by_issue_label: Object.fromEntries(Object.entries(issueLabelCounts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))),
    },
    parse_errors: parseErrors,
    review_queue: reviewQueue,
    recurring_issues: recurringIssues,
    eval_case_candidates: evalCaseCandidates,
    next_actions: [
      'Review high-priority needs_review records first.',
      'Promote recurring eval_case_candidates into ai-ramin-section/evaluation/eval-cases.json after manual review.',
      'If the issue is source coverage, update canonical/story/framework/policy source files before changing prompts.',
      'Run npm run check:ai-ramin-corpus, npm run check:ai-ramin-eval, and npm run check:ai-ramin-routing after adding eval cases.',
    ],
  };
}

function printTextSummary(report) {
  const lines = [
    `AI Ramin feedback review: ${report.summary.selected_records}/${report.summary.total_records} records selected.`,
    `Needs review: ${report.summary.needs_review_records}. Helpful: ${report.summary.helpful_records}.`,
    `Recurring issues: ${report.recurring_issues.length}. Eval candidates: ${report.eval_case_candidates.length}.`,
  ];

  if (report.review_queue.length) {
    lines.push('', 'Top review items:');
    report.review_queue.slice(0, 5).forEach((item) => {
      lines.push(
        `- ${item.review_priority} ${item.request_type} ${item.answer_shape?.answer_frame_id ?? 'unknown_frame'}: ${item.labels.join(', ')} (${item.id})`,
      );
    });
  }

  if (report.recurring_issues.length) {
    lines.push('', 'Recurring issues:');
    report.recurring_issues.slice(0, 5).forEach((issue) => {
      lines.push(`- ${issue.count}x ${issue.request_type}/${issue.answer_frame_id}: ${issue.primary_label}`);
    });
  }

  return lines.join('\n');
}

const options = parseArgs(process.argv.slice(2));
const { records, parseErrors } = await readJsonl(options.feedbackLogPath);
const selectedRecords = applyFilters(records, options);
const report = buildReport(records, selectedRecords, parseErrors, options);

if (options.writeReport) {
  await mkdir(path.dirname(options.reportPath), { recursive: true });
  await writeFile(options.reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

if (options.json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(printTextSummary(report));
  if (options.writeReport) {
    console.log(`Report written to ${normalizePath(options.reportPath)}.`);
  }
}
