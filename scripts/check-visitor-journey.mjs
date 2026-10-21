import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Readable } from 'node:stream';
import vm from 'node:vm';
import ts from 'typescript';
import * as schema from '../src/analytics/visitorJourneySchema.mjs';
import * as routes from '../src/seo/routes.mjs';
import { createVisitorJourneyHandler } from '../server/visitorJourneyHandler.mjs';

let checks = 0;
function check(value, message) { assert.ok(value, message); checks += 1; }
const good = { schemaVersion: 1, event: 'cv_open', surface: 'home', target: 'cv', audience: 'qa' };
check(schema.validateJourneyPayload(good), 'finite payload accepted');
for (const bad of [{ ...good, prompt: 'private' }, { ...good, target: '/private?q=secret' }, { ...good, surface: 'private' }, { ...good, event: '__proto__' }, { ...good, audience: 'someone' }, null, []]) {
  check(!schema.validateJourneyPayload(bad), 'unknown/free-text fields rejected');
}

const logs = [];
const handler = createVisitorJourneyHandler({ log: (line) => logs.push(JSON.parse(line)), now: () => new Date('2026-10-22T08:00:00Z') });
async function request(body = good, headers = {}, method = 'POST', handle = handler) {
  const req = Readable.from([typeof body === 'string' ? body : JSON.stringify(body)]);
  Object.assign(req, { method, headers: { origin: 'https://www.ramin.vision', 'content-type': 'application/json', ...headers } });
  const response = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, end(body) { this.body = body; } };
  await handle(req, response);
  return response;
}
check((await request()).statusCode === 204, 'valid event accepted');
check(logs.length === 1 && logs[0].type === 'portfolio_journey' && logs[0].day === '2026-10-22', 'bounded daily log envelope');
check(Object.keys(logs[0]).sort().join() === 'audience,day,event,schemaVersion,surface,target,type', 'no identifiers or request metadata in logs');
for (const [body, headers, method, status] of [
  [good, {}, 'GET', 405], [good, { origin: 'https://attacker.example' }, 'POST', 403],
  [good, { origin: undefined }, 'POST', 403], [good, { 'content-type': 'text/plain' }, 'POST', 415],
  ['{', {}, 'POST', 400], [{ ...good, jobDescription: 'private' }, {}, 'POST', 400],
  ['x'.repeat(513), {}, 'POST', 413],
  [good, { dnt: '1' }, 'POST', 204], [good, { 'sec-gpc': '1' }, 'POST', 204],
]) check((await request(body, headers, method)).statusCode === status, `request boundary ${status}`);
check(logs.length === 1, 'invalid and opted-out requests never logged');
const deploymentLogs = [];
const production = createVisitorJourneyHandler({ environment: 'production', log: (line) => deploymentLogs.push(JSON.parse(line)) });
check((await request({ ...good, audience: 'visitor' }, {}, 'POST', production)).statusCode === 204 && deploymentLogs[0].audience === 'visitor', 'production preserves visitor category');
const preview = createVisitorJourneyHandler({ environment: 'preview', deploymentUrl: 'portfolio-test.vercel.app', log: (line) => deploymentLogs.push(JSON.parse(line)) });
check((await request({ ...good, audience: 'visitor' }, { origin: 'https://portfolio-test.vercel.app' }, 'POST', preview)).statusCode === 204 && deploymentLogs.at(-1).audience === 'qa', 'trusted deployment preview is always QA');
check((await request(good, { origin: 'https://another.vercel.app' }, 'POST', preview)).statusCode === 403, 'arbitrary preview origins remain rejected');
check((await request(good, { origin: 'http://127.0.0.1:4182' }, 'POST', production)).statusCode === 403, 'production rejects localhost origins');

function clientFixture({ storageThrows = false, storageWriteThrows = storageThrows } = {}) {
  const listeners = new Map();
  const requests = [];
  const storage = new Map();
  const navigator = { doNotTrack: null, globalPrivacyControl: false, webdriver: false };
  const window = { location: { pathname: '/', search: '?journey=qa', href: 'https://www.ramin.vision/?journey=qa', origin: 'https://www.ramin.vision' }, dispatchEvent() {} };
  const document = { addEventListener: (name, cb) => listeners.set(name, cb), removeEventListener: (name) => listeners.delete(name) };
  class Element { constructor(href) { this.href = href; } closest() { return this; } }
  const module = { exports: {} };
  const source = readFileSync(new URL('../src/lib/visitorJourney.ts', import.meta.url), 'utf8').replaceAll('import.meta.env.DEV', 'false');
  const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(compiled, { module, exports: module.exports, require: (name) => name.includes('Schema') ? schema : routes, navigator, window, document, Element, URL, URLSearchParams, Event,
    localStorage: { getItem: (key) => { if (storageThrows) throw Error(); return storage.get(key); }, setItem: (key, value) => { if (storageWriteThrows) throw Error(); storage.set(key, value); }, removeItem: (key) => { if (storageWriteThrows) throw Error(); storage.delete(key); } },
    fetch: async (url, options) => { requests.push({ url, options, payload: JSON.parse(options.body) }); throw Error('offline'); },
  });
  return { api: module.exports, navigator, requests, listeners, window, storage, click: (href) => listeners.get('click')({ button: 0, target: new Element(href) }) };
}
const client = clientFixture();
const uninstall = client.api.installVisitorJourney();
client.api.recordJourneyPage('/?secret=private');
client.api.recordJourneyPage('/');
check(client.requests.length === 1, 'same canonical page deduplicated; query excluded');
for (const page of routes.publicPages) {
  client.api.recordJourneyPage(page.path);
}
check(client.requests.filter((r) => r.payload.event === 'case_open').length === 13, 'all nine products, two professional cases and two readers tracked');
for (const href of ['/cv?private=jd', '/presentation', 'https://www.udemy.com/course/example/', 'https://www.coursera.org/learn/example', 'mailto:test@example.com', 'https://github.com/raminhoodeh/example', 'https://www.linkedin.com/posts/example', 'https://nsso.me/', 'https://www.amazon.co.uk/example']) {
  client.click(href);
}
check(client.requests.some((r) => r.payload.event === 'cv_open'), 'CV click captured before external navigation');
check(client.requests.some((r) => r.payload.event === 'course_open' && r.payload.target === 'coursera'), 'course platform category');
check(client.requests.some((r) => r.payload.event === 'evidence_follow' && r.payload.target === 'repository'), 'evidence category');
client.click('https://calendar.app.google/example-booking-fixture');
check(client.requests.at(-1).payload.event === 'contact_open' && client.requests.at(-1).payload.target === 'booking', 'Google booking link is a contact action');
check(client.requests.every((r) => schema.validateJourneyPayload(r.payload) && r.payload.audience === 'qa'), 'no raw links/text in browser events; QA tagged');
check(client.requests.every((r) => r.options.credentials === 'omit' && r.options.referrerPolicy === 'no-referrer' && r.options.keepalive), 'no cookies/referrers and navigation-safe delivery');
let count = client.requests.length;
client.api.setJourneyMeasurementEnabled(false);
client.api.recordJourneyEvent('cv_open', 'cv');
check(client.requests.length === count && client.storage.size === 1, 'opt out stores only preference and stops events');
client.api.setJourneyMeasurementEnabled(true);
check(client.storage.size === 0, 'opt back in removes preference without identifier');
for (const signal of ['doNotTrack', 'globalPrivacyControl', 'webdriver']) {
  client.navigator[signal] = signal === 'doNotTrack' ? '1' : true;
  client.api.recordJourneyEvent('cv_open', 'cv');
  check(client.requests.length === count, `${signal} suppresses measurement`);
  client.navigator[signal] = signal === 'doNotTrack' ? null : false;
}
client.api.recordJourneyEvent('cv_open', 'PRIVATE');
check(client.requests.length === count, 'bad caller category dropped');
for (let i = 0; i < 200; i += 1) client.api.recordJourneyEvent('cv_open', 'cv');
check(client.requests.length === 150, 'bounded events per tab');
uninstall();
check(client.listeners.size === 0, 'listener cleanup');
const restricted = clientFixture({ storageThrows: true });
restricted.api.setJourneyMeasurementEnabled(false);
restricted.api.recordJourneyEvent('cv_open', 'cv');
check(restricted.requests.length === 0, 'blocked storage keeps in-memory opt out');
const readOnly = clientFixture({ storageWriteThrows: true });
readOnly.api.setJourneyMeasurementEnabled(false);
readOnly.api.recordJourneyEvent('cv_open', 'cv');
check(!readOnly.api.journeyMeasurementEnabled() && readOnly.requests.length === 0, 'quota/write failure cannot override an in-memory opt out');
await Promise.resolve();
console.log(`Visitor journey: ${checks} checks passed (offline; no visitor data or AI calls).`);
