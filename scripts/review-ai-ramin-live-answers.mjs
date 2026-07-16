#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_REVIEW_SET_PATH = path.join(ROOT_DIR, 'ai-ramin-section/evaluation/live-answer-review-set.json');
const DEFAULT_REPORT_PATH = path.join(ROOT_DIR, 'ai-ramin-section/evaluation/latest-live-review-report.json');
const STRICT_MIN_AVERAGE_SCORE = 2.5;
const PRIORITY_WEIGHT = {
  high: 3,
  medium: 2,
  low: 1,
};
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
  npm run review:ai-ramin-live -- [options]

Options:
  --review-set=<path>    Live answer review set. Default: ai-ramin-section/evaluation/live-answer-review-set.json
  --report=<path>        Report output path. Default: ai-ramin-section/evaluation/latest-live-review-report.json
  --family=<name[,name]> Include only matching case families. Can be repeated.
  --status=<status>      Include all, pending, captured, failed, scored, unscored, weak, acceptable, or strong. Default: all
  --no-write-report      Print without writing the report file.
  --json                 Print machine-readable JSON.
  --help                 Show this message.
`);
}

function parseCsv(value) {
  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function resolveCliPath(value) {
  return path.isAbsolute(value) ? value : path.join(ROOT_DIR, value);
}

function normalizePath(filePath) {
  return path.relative(ROOT_DIR, filePath).split(path.sep).join('/');
}

function parseArgs(argv) {
  const options = {
    reviewSetPath: DEFAULT_REVIEW_SET_PATH,
    reportPath: DEFAULT_REPORT_PATH,
    families: [],
    status: 'all',
    writeReport: true,
    json: false,
    help: false,
  };

  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--json') options.json = true;
    else if (arg === '--no-write-report') options.writeReport = false;
    else if (arg.startsWith('--review-set=')) options.reviewSetPath = resolveCliPath(arg.slice('--review-set='.length));
    else if (arg.startsWith('--report=')) options.reportPath = resolveCliPath(arg.slice('--report='.length));
    else if (arg.startsWith('--family=')) options.families.push(...parseCsv(arg.slice('--family='.length)));
    else if (arg.startsWith('--status=')) options.status = arg.slice('--status='.length).trim();
    else throw new Error(`Unknown option: ${arg}`);
  }

  return options;
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

function countBy(items, getter) {
  const counts = {};
  for (const item of items) {
    const key = getter(item) || 'unknown';
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])));
}

function summarizeScores(cases) {
  const captured = cases.filter((item) => normalizeStatus(item.capture) === 'captured');
  const failed = cases.filter((item) => normalizeStatus(item.capture) === 'failed');
  const pending = cases.filter((item) => normalizeStatus(item.capture) === 'pending');
  const scored = captured.filter((item) => isValidScore(item.capture?.score));
  const weakOrFailing = scored.filter((item) => item.capture.score <= 1);
  const acceptable = scored.filter((item) => item.capture.score === 2);
  const strong = scored.filter((item) => item.capture.score === 3);
  const totalScore = scored.reduce((sum, item) => sum + item.capture.score, 0);

  return {
    case_count: cases.length,
    captured_count: captured.length,
    failed_count: failed.length,
    pending_count: pending.length,
    scored_count: scored.length,
    unscored_captured_count: captured.length - scored.length,
    weak_or_failing_count: weakOrFailing.length,
    acceptable_count: acceptable.length,
    strong_count: strong.length,
    average_score: scored.length ? Number((totalScore / scored.length).toFixed(2)) : null,
  };
}

function caseMatchesStatus(item, status) {
  const captureStatus = normalizeStatus(item.capture);
  const score = item.capture?.score;

  if (status === 'all') return true;
  if (status === 'pending') return captureStatus === 'pending';
  if (status === 'captured') return captureStatus === 'captured';
  if (status === 'failed') return captureStatus === 'failed';
  if (status === 'scored') return captureStatus === 'captured' && isValidScore(score);
  if (status === 'unscored') return captureStatus === 'captured' && !isValidScore(score);
  if (status === 'weak') return captureStatus === 'captured' && isValidScore(score) && score <= 1;
  if (status === 'acceptable') return captureStatus === 'captured' && score === 2;
  if (status === 'strong') return captureStatus === 'captured' && score === 3;
  throw new Error(`Unknown --status value: ${status}`);
}

function applyFilters(cases, options) {
  const familyFilter = new Set(options.families);
  return cases.filter((item) => {
    if (familyFilter.size && !familyFilter.has(item.family)) return false;
    return caseMatchesStatus(item, options.status);
  });
}

function labelIssue(issue) {
  if (/^expected_question_type_mismatch/.test(issue)) return 'routing_mismatch';
  if (/^over_cautious_with_sufficient_evidence$/.test(issue)) return 'over_cautious_answer';
  if (/^generic_/.test(issue)) return 'generic_answer';
  if (/^behavioral_story_missing$/.test(issue)) return 'missing_story';
  if (/^duplicated_next_action_label$/.test(issue)) return 'next_action_problem';
  if (/^raw_json_short_answer$/.test(issue)) return 'formatting_or_payload_leak';
  if (/^local_source_path_leak$/.test(issue) || /^internal_metadata_leak$/.test(issue)) return 'metadata_leak';
  if (/^empty_answer$/.test(issue)) return 'empty_answer';
  if (/^http_/.test(issue) || /^capture_exception$/.test(issue)) return 'capture_failure';
  return 'review_needed';
}

function actionsForLabels(labels) {
  const actions = new Set();

  if (labels.includes('capture_failed') || labels.includes('capture_failure')) {
    actions.add('Re-run capture for this case before scoring it.');
  }
  if (labels.includes('missing_manual_score')) {
    actions.add('Score the captured answer using the 0-3 reviewScale.');
  }
  if (labels.includes('weak_live_answer')) {
    actions.add('Decide whether the weakness is prompt behavior, answer-frame logic, retrieval, or source coverage.');
    actions.add('Re-capture this case after the smallest behavior or source fix.');
  }
  if (labels.includes('routing_mismatch')) {
    actions.add('Promote the route mismatch into eval-cases.json or a routing contract fixture.');
  }
  if (labels.includes('formatting_or_payload_leak') || labels.includes('metadata_leak')) {
    actions.add('Promote the leak into a deterministic quality-gate or markdown-normalization fixture.');
  }
  if (labels.includes('over_cautious_answer') || labels.includes('generic_answer') || labels.includes('missing_story')) {
    actions.add('Promote the behavior into a regression fixture if it can be reproduced deterministically.');
  }
  if (labels.includes('next_action_problem')) {
    actions.add('Review answer-frame soft CTAs and suggested_next_action generation.');
  }
  if (labels.includes('acceptable_with_issues')) {
    actions.add('Either resolve the issue tag or lower the manual score before strict review.');
  }
  if (labels.includes('strong_with_unresolved_issues')) {
    actions.add('Clear unresolved issue tags or lower the score before strict review.');
  }
  if (labels.includes('severe_issue')) {
    actions.add('Do not treat this answer as acceptable until the severe issue is fixed and re-captured.');
  }

  if (!actions.size) actions.add('Inspect this case manually and decide whether it needs a source, prompt, routing, or UI fixture.');
  return Array.from(actions);
}

function classifyCase(item) {
  const capture = item.capture ?? {};
  const status = normalizeStatus(capture);
  const issues = Array.isArray(capture.issues) ? capture.issues.filter(Boolean) : [];
  const labels = new Set();
  let priority = 'low';

  if (status === 'failed') {
    labels.add('capture_failed');
    priority = 'high';
  }

  if (status === 'captured' && !isValidScore(capture.score)) {
    labels.add('missing_manual_score');
    priority = 'medium';
  }

  if (status === 'captured' && isValidScore(capture.score)) {
    if (capture.score <= 1) {
      labels.add('weak_live_answer');
      priority = 'high';
    } else if (capture.score === 2 && issues.length) {
      labels.add('acceptable_with_issues');
      priority = 'medium';
    } else if (capture.score === 3 && issues.length) {
      labels.add('strong_with_unresolved_issues');
      priority = 'high';
    }
  }

  for (const issue of issues) labels.add(labelIssue(issue));
  if (hasSevereIssue(issues)) {
    labels.add('severe_issue');
    priority = 'high';
  }

  const normalizedLabels = Array.from(labels).sort();
  return {
    actionable: normalizedLabels.length > 0,
    priority,
    labels: normalizedLabels,
    recommended_actions: actionsForLabels(normalizedLabels),
  };
}

function buildReviewQueue(cases) {
  return cases
    .map((item) => {
      const classification = classifyCase(item);
      if (!classification.actionable) return null;
      const capture = item.capture ?? {};
      return {
        id: item.id,
        family: item.family,
        prompt: item.prompt,
        expected_question_type: item.expectedQuestionType,
        review_focus: item.reviewFocus ?? '',
        capture: {
          status: normalizeStatus(capture),
          captured_at: capture.capturedAt ?? '',
          model: capture.model ?? '',
          score: capture.score ?? null,
          issues: Array.isArray(capture.issues) ? capture.issues : [],
          answer_excerpt: capture.answerExcerpt ?? '',
          notes: capture.notes ?? '',
        },
        priority: classification.priority,
        labels: classification.labels,
        recommended_actions: classification.recommended_actions,
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const priorityDelta = (PRIORITY_WEIGHT[b.priority] ?? 0) - (PRIORITY_WEIGHT[a.priority] ?? 0);
      if (priorityDelta) return priorityDelta;
      return String(a.id).localeCompare(String(b.id));
    });
}

function buildFamilySummaries(cases) {
  const families = new Map();

  for (const item of cases) {
    const family = item.family || 'unknown';
    const group = families.get(family) ?? [];
    group.push(item);
    families.set(family, group);
  }

  return Object.fromEntries(
    Array.from(families.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([family, items]) => [family, summarizeScores(items)]),
  );
}

function buildDeterministicFollowups(reviewQueue) {
  const deterministicLabels = new Set([
    'routing_mismatch',
    'formatting_or_payload_leak',
    'metadata_leak',
    'over_cautious_answer',
    'generic_answer',
    'missing_story',
    'next_action_problem',
    'empty_answer',
  ]);

  return reviewQueue
    .filter((item) => item.labels.some((label) => deterministicLabels.has(label)))
    .map((item) => ({
      id: `live-review-${item.id}`,
      live_review_case_id: item.id,
      family: item.family,
      expected_question_type: item.expected_question_type,
      labels: item.labels.filter((label) => deterministicLabels.has(label)),
      recommended_artifact: item.labels.includes('routing_mismatch')
        ? 'eval-cases.json or routing contract fixture'
        : 'regression, prompt, quality-gate, or markdown fixture',
      prompt: item.prompt,
      reason: 'Live review found behavior that should be protected by a deterministic fixture if reproducible.',
    }));
}

function buildStatus(summary) {
  if (!summary.captured_count) return 'pending_live_capture';
  if (summary.failed_count) return 'capture_failures';
  if (summary.unscored_captured_count) return 'pending_manual_scores';
  if (summary.weak_or_failing_count) return 'needs_answer_quality_fixes';
  if (summary.pending_count) return 'partial_live_review_passed';
  if (summary.average_score !== null && summary.average_score >= STRICT_MIN_AVERAGE_SCORE) return 'strict_review_ready';
  return 'below_live_quality_threshold';
}

function buildNextActions(summary, reviewQueue, deterministicFollowups) {
  const actions = [];

  if (!summary.captured_count) {
    actions.push('Configure GEMINI_API_KEY or GOOGLE_API_KEY, run npm run preflight:ai-ramin-live, then capture live answers.');
  }
  if (summary.failed_count) {
    actions.push('Re-run failed captures before scoring live-review quality.');
  }
  if (summary.unscored_captured_count) {
    actions.push('Manually score captured answers using the 0-3 reviewScale.');
  }
  if (summary.weak_or_failing_count) {
    actions.push('Fix or document weak/failing answers, then re-capture those cases.');
  }
  if (deterministicFollowups.length) {
    actions.push('Promote reproducible live-review failures into eval cases or contract fixtures.');
  }
  if (reviewQueue.some((item) => item.labels.includes('acceptable_with_issues') || item.labels.includes('strong_with_unresolved_issues'))) {
    actions.push('Resolve score/issue inconsistencies before strict live-review signoff.');
  }
  if (
    summary.case_count > 0 &&
    summary.pending_count === 0 &&
    summary.failed_count === 0 &&
    summary.unscored_captured_count === 0 &&
    summary.weak_or_failing_count === 0 &&
    summary.average_score !== null &&
    summary.average_score >= STRICT_MIN_AVERAGE_SCORE
  ) {
    actions.push('Run npm run check:ai-ramin-live-review -- --strict before treating the live pass as complete.');
  }
  actions.push('Run npm run verify:ai-ramin after AI Ramin behavior or corpus changes.');

  return actions;
}

function buildReport(reviewSet, options) {
  const allCases = Array.isArray(reviewSet.cases) ? reviewSet.cases : [];
  const selectedCases = applyFilters(allCases, options);
  const summary = {
    status: buildStatus(summarizeScores(allCases)),
    total_case_count: allCases.length,
    selected_case_count: selectedCases.length,
    ...summarizeScores(selectedCases),
    all_cases: summarizeScores(allCases),
    by_capture_status: countBy(selectedCases, (item) => normalizeStatus(item.capture)),
    by_family: countBy(selectedCases, (item) => item.family),
    by_question_type: countBy(selectedCases, (item) => item.expectedQuestionType),
    by_score: countBy(
      selectedCases.filter((item) => isValidScore(item.capture?.score)),
      (item) => String(item.capture.score),
    ),
  };
  const reviewQueue = buildReviewQueue(selectedCases);
  const issueLabels = reviewQueue.flatMap((item) => item.labels);
  const deterministicFollowups = buildDeterministicFollowups(reviewQueue);

  return {
    schemaVersion: 1,
    generated_at: new Date().toISOString(),
    source_path: normalizePath(options.reviewSetPath),
    filters: {
      family: options.families.length ? options.families : 'all',
      status: options.status,
    },
    summary: {
      ...summary,
      by_issue_label: countBy(issueLabels, (label) => label),
      by_family_detail: buildFamilySummaries(selectedCases),
    },
    review_queue: reviewQueue,
    deterministic_followups: deterministicFollowups,
    next_actions: buildNextActions(summary.all_cases, reviewQueue, deterministicFollowups),
  };
}

function printTextReport(report) {
  const lines = [
    'AI Ramin Live Review Report',
    '',
    `Status: ${report.summary.status}`,
    `Cases: ${report.summary.selected_case_count}/${report.summary.total_case_count} selected`,
    `Capture: ${report.summary.captured_count} captured, ${report.summary.scored_count} scored, ${report.summary.pending_count} pending, ${report.summary.failed_count} failed`,
    `Scores: ${report.summary.strong_count} strong, ${report.summary.acceptable_count} acceptable, ${report.summary.weak_or_failing_count} weak/failing, average ${report.summary.average_score ?? 'n/a'}`,
    `Review queue: ${report.review_queue.length} item(s)`,
    `Deterministic follow-ups: ${report.deterministic_followups.length} item(s)`,
  ];

  if (report.review_queue.length) {
    lines.push('', 'Review queue:');
    for (const item of report.review_queue.slice(0, 10)) {
      lines.push(`- [${item.priority}] ${item.id}: ${item.labels.join(', ')}`);
    }
  }

  lines.push('', 'Next actions:');
  report.next_actions.forEach((action) => lines.push(`- ${action}`));

  return lines.join('\n');
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printUsage();
    return;
  }

  const reviewSet = JSON.parse(await readFile(options.reviewSetPath, 'utf8'));
  const report = buildReport(reviewSet, options);

  if (options.writeReport) {
    await mkdir(path.dirname(options.reportPath), { recursive: true });
    await writeFile(options.reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  }

  if (options.json) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(printTextReport(report));
    if (options.writeReport) console.log(`\nWrote ${normalizePath(options.reportPath)}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
