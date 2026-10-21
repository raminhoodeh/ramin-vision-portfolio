import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { formatJourneyReport, runJourneyReport, summarizeJourneyLog } from './report-visitor-journey.mjs';

const event = (changes = {}) => ({ type: 'portfolio_journey', schemaVersion: 1, event: 'page_view', surface: 'home', target: 'home', audience: 'visitor', day: '2026-10-22', ...changes });
const input = (...events) => events.map((entry) => JSON.stringify(entry)).join('\n');

test('counts valid JSONL actions, categories, targets and observed UTC days', () => {
  const result = summarizeJourneyLog(input(event(), event({ event: 'cv_open', target: 'cv' }), event({ event: 'course_open', surface: 'teaching', target: 'udemy', day: '2026-10-23' })));
  assert.equal(result.visitor.records, 3);
  assert.equal(result.visitor.actions.cv_open, 1);
  assert.equal(result.visitor.surfaces.teaching, 1);
  assert.equal(result.visitor.targets.course_open.udemy, 1);
  assert.deepEqual(result.visitor.days, { '2026-10-22': 2, '2026-10-23': 1 });
});

test('reads JSON arrays and nested Vercel message strings without double-counting one envelope', () => {
  const first = event(); const second = event({ event: 'case_open', surface: 'case', target: 'qadam' });
  const result = summarizeJourneyLog(JSON.stringify({ result: { logs: [
    { type: 'stdout', message: JSON.stringify(first), jsonPayload: first, id: 'hosting-wrapper-not-an-event-id' },
    { message: JSON.stringify({ message: JSON.stringify(second) }) },
  ] } }));
  assert.equal(result.visitor.records, 2);
  assert.equal(result.quality.acceptedRecords, 2);
});

test('keeps QA activity separate and does not treat QA-only exports as a visitor baseline', () => {
  const result = summarizeJourneyLog(input(event({ audience: 'qa' }), event({ audience: 'qa', event: 'contact_open', surface: 'contact', target: 'email' })));
  assert.equal(result.visitor.records, 0); assert.equal(result.qa.records, 2);
  const markdown = formatJourneyReport(result);
  assert.match(markdown, /No valid visitor events/);
  assert.match(markdown, /no visitor baseline/);
  assert.match(markdown, /QA activity \(excluded from visitor baseline\)/);
  assert.ok(!markdown.includes('Unique visitors:'));
});

test('strictly rejects extra fields, wrong categories, wrong event targets and missing audience', () => {
  const missingAudience = event(); delete missingAudience.audience;
  const records = [
    event({ url: 'https://private.example/secret' }), event({ schemaVersion: 2 }),
    event({ event: 'unknown' }), event({ surface: 'unknown' }), event({ event: 'cv_open', target: 'udemy' }),
    event({ audience: 'staff' }), missingAudience,
  ];
  const result = summarizeJourneyLog(input(...records));
  assert.equal(result.visitor.records, 0); assert.equal(result.qa.records, 0);
  assert.equal(result.quality.rejectedJourneyRecords, records.length);
  assert.equal(result.quality.rejectionReasons.envelope_fields, 2);
  assert.equal(result.quality.rejectionReasons.invalid_payload, 5);
});

test('validates actual calendar dates, including leap days, without accepting timestamps', () => {
  const result = summarizeJourneyLog(input(event({ day: '2024-02-29' }), event({ day: '2025-02-29' }), event({ day: '2026-02-30' }), event({ day: '2026-10-22T12:00:00Z' })));
  assert.equal(result.visitor.records, 1);
  assert.equal(result.quality.rejectionReasons.invalid_day, 3);
});

test('counts duplicate records rather than inventing a deduplication or person identity', () => {
  const result = summarizeJourneyLog(input(event(), event()));
  assert.equal(result.visitor.records, 2);
  assert.match(formatJourneyReport(result), /Identical records are counted separately/);
});

test('empty, malformed and unrelated input are reported without printing raw input', () => {
  const empty = formatJourneyReport(summarizeJourneyLog(''));
  assert.match(empty, /not evidence that nobody visited/);
  const secret = 'PRIVATE_PROMPT_DO_NOT_PRINT';
  const result = summarizeJourneyLog(`not-json-${secret}\n${JSON.stringify({ message: secret })}\n${JSON.stringify(event({ prompt: secret }))}`);
  assert.equal(result.quality.malformedJsonRecords, 1);
  assert.equal(result.quality.unrelatedRecords, 1);
  assert.equal(result.quality.rejectedJourneyRecords, 1);
  assert.ok(!formatJourneyReport(result).includes(secret));
});

test('limits excessive nesting instead of following arbitrary log payloads indefinitely', () => {
  let wrapped = event(); for (let index = 0; index < 30; index++) wrapped = { message: wrapped };
  const result = summarizeJourneyLog(JSON.stringify(wrapped));
  assert.equal(result.visitor.records, 0); assert.equal(result.quality.nestingLimit, 1);
});

test('CLI requires an explicit export, provides help and supports an optional Markdown output', async () => {
  await assert.rejects(runJourneyReport([]), /explicit --input/);
  await assert.rejects(runJourneyReport(['--input', 'x', '--unknown', 'y']), /Use --input/);
  assert.match((await runJourneyReport(['--help'])).help, /JSON\/JSONL/);
  const directory = await mkdtemp(path.join(tmpdir(), 'portfolio-journey-report-'));
  try {
    const source = path.join(directory, 'export.json'); const output = path.join(directory, 'review.md');
    await writeFile(source, JSON.stringify([event()]));
    assert.deepEqual(await runJourneyReport(['--input', source, '--output', output]), { written: true });
    const report = await readFile(output, 'utf8'); assert.match(report, /Accepted records: \*\*1\*\*/);
    assert.ok(!report.includes(directory));
    const response = await runJourneyReport(['--input', source]); assert.match(response.markdown, /portfolio|Portfolio/);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('CLI reads stdin and makes a no-events baseline explicit', () => {
  const result = spawnSync(process.execPath, ['scripts/report-visitor-journey.mjs', '--input', '-'], { input: '', encoding: 'utf8' });
  assert.equal(result.status, 0); assert.match(result.stdout, /No valid visitor events/); assert.equal(result.stderr, '');
});
