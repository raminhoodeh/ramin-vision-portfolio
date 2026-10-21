import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JOURNEY_EVENTS, JOURNEY_SURFACES, JOURNEY_TARGETS, validateJourneyPayload } from '../src/analytics/visitorJourneySchema.mjs';

const envelopeKeys = ['type', 'schemaVersion', 'event', 'surface', 'target', 'audience', 'day'];
const wrapperKeys = ['logs', 'entries', 'records', 'events', 'data', 'result', 'results', 'body', 'payload', 'jsonPayload'];

function emptyAudience() {
  return {
    records: 0,
    actions: Object.fromEntries(JOURNEY_EVENTS.map((event) => [event, 0])),
    surfaces: Object.fromEntries(JOURNEY_SURFACES.map((surface) => [surface, 0])),
    targets: Object.fromEntries(JOURNEY_EVENTS.map((event) => [event, Object.fromEntries(JOURNEY_TARGETS[event].map((target) => [target, 0]))])),
    days: {},
  };
}

function validDay(day) {
  if (typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  const date = new Date(`${day}T00:00:00.000Z`);
  return Number.isFinite(date.valueOf()) && date.toISOString().slice(0, 10) === day;
}

function rejectReason(value) {
  if (Object.keys(value).length !== envelopeKeys.length || !envelopeKeys.every((key) => Object.hasOwn(value, key))) return 'envelope_fields';
  if (!validDay(value.day)) return 'invalid_day';
  const { schemaVersion, event, surface, target, audience } = value;
  return validateJourneyPayload({ schemaVersion, event, surface, target, audience }) ? null : 'invalid_payload';
}

/** Counts accepted log records. It deliberately does not deduplicate, infer sessions or retain input text. */
export function summarizeJourneyLog(input) {
  if (typeof input !== 'string') throw new TypeError('Expected the contents of a JSON or JSONL export.');
  const summary = {
    visitor: emptyAudience(), qa: emptyAudience(),
    quality: { acceptedRecords: 0, rejectedJourneyRecords: 0, malformedJsonRecords: 0, unrelatedRecords: 0, nestingLimit: 0, rejectionReasons: {} },
  };

  function inspect(value, depth = 0) {
    if (depth > 20) { summary.quality.nestingLimit++; return; }
    if (Array.isArray(value)) { value.forEach((entry) => inspect(entry, depth + 1)); return; }
    if (typeof value === 'string') {
      const text = value.trim();
      if (!text) return;
      if (!text.startsWith('{') && !text.startsWith('[')) { summary.quality.unrelatedRecords++; return; }
      parseText(text, depth + 1); return;
    }
    if (!value || typeof value !== 'object') { summary.quality.unrelatedRecords++; return; }
    if (value.type === 'portfolio_journey') {
      const reason = rejectReason(value);
      if (reason) {
        summary.quality.rejectedJourneyRecords++;
        summary.quality.rejectionReasons[reason] = (summary.quality.rejectionReasons[reason] ?? 0) + 1;
        return;
      }
      const group = summary[value.audience];
      group.records++;
      group.actions[value.event]++;
      group.surfaces[value.surface]++;
      group.targets[value.event][value.target]++;
      group.days[value.day] = (group.days[value.day] ?? 0) + 1;
      summary.quality.acceptedRecords++;
      return;
    }
    // A hosting envelope can expose the same log in several representations. Prefer its
    // message when present, so that one envelope is not counted twice through two fields.
    if (Object.hasOwn(value, 'message')) { inspect(value.message, depth + 1); return; }
    let wrapped = false;
    for (const key of wrapperKeys) {
      if (Object.hasOwn(value, key)) { inspect(value[key], depth + 1); wrapped = true; }
    }
    if (!wrapped) summary.quality.unrelatedRecords++;
  }

  function parseText(text, depth = 0) {
    let parsed;
    try { parsed = JSON.parse(text); }
    catch {
      const lines = text.split(/\r?\n/).filter((line) => line.trim());
      if (lines.length <= 1) { summary.quality.malformedJsonRecords++; return; }
      for (const line of lines) {
        let entry;
        try { entry = JSON.parse(line); }
        catch { summary.quality.malformedJsonRecords++; continue; }
        inspect(entry, depth);
      }
      return;
    }
    inspect(parsed, depth);
  }

  const text = input.replace(/^\uFEFF/, '').trim();
  if (text) parseText(text);
  return summary;
}

function table(headers, rows) {
  return [`| ${headers.join(' | ')} |`, `| ${headers.map(() => '---').join(' | ')} |`, ...rows.map((row) => `| ${row.join(' | ')} |`)].join('\n');
}

function audienceReport(title, group) {
  const days = Object.keys(group.days).sort();
  const lines = [`## ${title}`, '', `Accepted records: **${group.records}**.`, ''];
  if (!group.records) {
    lines.push(title === 'Visitor activity'
      ? 'No valid visitor events were found in this export. There is no visitor baseline here. This is not evidence that nobody visited: collection may be new, unavailable, incomplete or outside the retained/exported window.'
      : 'No valid QA events were found in this export. This does not establish that no testing occurred.');
    return lines.join('\n');
  }
  lines.push(`Observed server-assigned UTC event days: **${days[0]}** to **${days.at(-1)}** (${days.length} day${days.length === 1 ? '' : 's'} with accepted records). This is not a guarantee of complete coverage between those dates.`, '', '### Recorded actions', '',
    table(['Event', 'Records'], Object.entries(group.actions).map(([event, count]) => [event, count])), '', '### Route categories', '',
    table(['Surface', 'Records'], Object.entries(group.surfaces).filter(([, count]) => count > 0)), '', '### Action targets', '',
    table(['Event', 'Target', 'Records'], Object.entries(group.targets).flatMap(([event, targets]) => Object.entries(targets).filter(([, count]) => count > 0).map(([target, count]) => [event, target, count]))), '', '### Records by server day', '',
    table(['UTC day', 'Records'], days.map((day) => [day, group.days[day]])));
  return lines.join('\n');
}

export function formatJourneyReport(summary) {
  const quality = summary.quality;
  return [
    '# Portfolio visitor activity review', '',
    'Counts below describe accepted log records, not people, sessions or a complete visitor journey. QA records are separate and excluded from the visitor baseline.', '',
    audienceReport('Visitor activity', summary.visitor), '',
    audienceReport('QA activity (excluded from visitor baseline)', summary.qa), '',
    '## Export and validation limits', '',
    table(['Input handling', 'Records'], [
      ['Accepted visitor and QA records', quality.acceptedRecords],
      ['Rejected apparent journey records', quality.rejectedJourneyRecords],
      ['Malformed JSON/JSONL records', quality.malformedJsonRecords],
      ['Unrelated records ignored', quality.unrelatedRecords],
      ['Nesting-limit stops', quality.nestingLimit],
    ]), '',
    ...(Object.keys(quality.rejectionReasons).length ? [table(['Rejection category', 'Records'], Object.entries(quality.rejectionReasons)), ''] : []),
    '- Hosting-log retention, the requested time window, pagination and export limits can omit records. Reaching an export limit may indicate truncation; this report cannot infer unseen pages of logs.',
    '- Identical records are counted separately. Retries, robots, unmarked testing and overlapping exports can affect totals; this schema cannot reliably distinguish them.',
    '- No identifiers or session linkage are available. Do not calculate unique visitors, person-level funnels, repeat visits or conversion rates from these counts.',
    '- An evidence, CV, course or contact action does not prove that its destination loaded or that an enquiry, application or purchase occurred.',
    '- AI request/result records do not contain answer text or prove answer quality. The live generated-answer review remains separate; the current Gemini issue is outside this report.',
    '- No raw log lines, URLs, prompts, job descriptions or visitor identifiers are reproduced here. The report does not delete the input export or change the host’s retention.', '',
    '## Manual review notes', '',
    '- Export window and limit/pagination checked: **not recorded in this report**.',
    '- Human usability review: **not recorded in this report**.',
    '- Substantive enquiries reviewed: **unknown**. Contact-action counts are not a substitute.',
    '- Next manual review date and decision: **to be recorded by the reviewer**.', '',
  ].join('\n');
}

export async function runJourneyReport(args = process.argv.slice(2)) {
  if (args.includes('--help') || args.includes('-h')) {
    return { help: 'Usage: node scripts/report-visitor-journey.mjs --input <export.json|export.jsonl|-> [--output <report.md>]\nReads strict portfolio_journey records from JSON/JSONL hosting-log exports. QA is reported separately. No unique-user or conversion estimates.\n' };
  }
  const options = {};
  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index];
    if (!['--input', '--output'].includes(flag) || !args[index + 1] || options[flag]) throw new Error('Use --input <file|-> and optionally --output <file>.');
    options[flag] = args[index + 1];
  }
  if (!options['--input']) throw new Error('An explicit --input export is required. Use --help for usage.');
  let input;
  try {
    if (options['--input'] === '-') {
      const chunks = []; for await (const chunk of process.stdin) chunks.push(chunk);
      input = Buffer.concat(chunks).toString('utf8');
    } else input = await readFile(options['--input'], 'utf8');
  } catch { throw new Error('Unable to read the supplied export. No input content has been printed.'); }
  const markdown = formatJourneyReport(summarizeJourneyLog(input));
  if (options['--output']) {
    try { await mkdir(path.dirname(path.resolve(options['--output'])), { recursive: true }); await writeFile(options['--output'], markdown); }
    catch { throw new Error('Unable to write the requested report.'); }
    return { written: true };
  }
  return { markdown };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runJourneyReport().then((result) => process.stdout.write(result.help ?? result.markdown ?? 'Visitor activity report written.\n')).catch((error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
}
