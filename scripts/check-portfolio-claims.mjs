import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { isDeepStrictEqual } from 'node:util';
import ts from 'typescript';

const root = fileURLToPath(new URL('../', import.meta.url));
const registryPath = path.join(root, 'docs/portfolio-claims.json');
const day = 86_400_000;
const requiredIds = ['course-product-udemy', 'course-ai-udemy', 'course-ai-coursera', 'work-bayut', 'work-side', 'work-vivup', 'work-groupm', 'work-cox', 'work-ordnance-survey', 'work-urgentem', 'work-deity', 'work-erm', 'work-tesla', 'resource-access', 'framework-product-os', 'framework-metacognition', 'framework-pip', 'talk-disx', 'book-proposition', 'book-meaning-of-life', 'ai-ramin'];

export function authorMaintenanceDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dubai', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const value = (type) => parts.find((part) => part.type === type).value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}

function dateValue(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN;
  const parsed = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(parsed) && new Date(parsed).toISOString().slice(0, 10) === value ? parsed : NaN;
}

function unwrap(node) {
  while (node && (ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isParenthesizedExpression(node))) node = node.expression;
  return node;
}

// Only static values are read. Never execute source modules, application effects,
// API handlers, model calls or author-supplied prose as code.
function literal(node) {
  node = unwrap(node);
  if (!node) return undefined;
  if (ts.isStringLiteralLike(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(literal);
  if (ts.isObjectLiteralExpression(node)) return Object.fromEntries(node.properties.filter(ts.isPropertyAssignment).map((property) => [
    ts.isIdentifier(property.name) || ts.isStringLiteralLike(property.name) ? property.name.text : property.name.getText(), literal(property.initializer),
  ]));
  return undefined;
}

export function readDeclaration(file, declaration, read = (name) => readFileSync(path.join(root, name), 'utf8')) {
  const source = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  if (source.parseDiagnostics.length) throw new Error(`Cannot parse ${file}`);
  const found = source.statements.filter(ts.isVariableStatement).flatMap((statement) => [...statement.declarationList.declarations])
    .find((entry) => ts.isIdentifier(entry.name) && entry.name.text === declaration);
  if (!found) throw new Error(`Missing declaration ${declaration} in ${file}`);
  return literal(found.initializer);
}

function select(value, binding) {
  if (binding.where) {
    if (!Array.isArray(value)) throw new Error('where requires an array');
    const matches = value.filter((entry) => entry?.[binding.where.field] === binding.where.value);
    if (matches.length !== 1) throw new Error(`Expected one ${binding.where.field}=${binding.where.value}, found ${matches.length}`);
    value = matches[0];
  }
  for (const key of binding.path ?? []) value = value?.[key];
  if (binding.pick) value = Object.fromEntries(binding.pick.map((key) => [key, value?.[key]]));
  const unresolved = (item) => item === undefined || item !== null && typeof item === 'object' && Object.values(item).some(unresolved);
  if (unresolved(value)) throw new Error('Binding contains an absent or non-literal field; select only concrete reviewed values');
  return value;
}

export function validateRegistry(registry, { asOf, overrides = new Map() } = {}) {
  const errors = [];
  let checks = 0;
  const check = (condition, message) => { checks += 1; if (!condition) errors.push(message); };
  const read = (file) => overrides.has(file) ? overrides.get(file) : readFileSync(path.join(root, file), 'utf8');
  const fileExists = (file) => typeof file === 'string' && !path.isAbsolute(file) && !file.split('/').includes('..') &&
    (overrides.has(file) ? typeof overrides.get(file) === 'string' : existsSync(path.join(root, file)) && statSync(path.join(root, file)).isFile());
  check(Number.isFinite(dateValue(asOf)), '--as-of must be a real YYYY-MM-DD date');
  check(registry.version === 1 && registry.visibility === 'internal-maintenance', 'Registry version and internal visibility are required');
  check(typeof registry.datePolicy === 'string' && registry.datePolicy.includes('sourceCheckedOn'), 'Explain local reconciliation versus sourceCheckedOn');
  check(Array.isArray(registry.claims) && registry.claims.length > 0, 'Claims must be populated');
  const claims = Array.isArray(registry.claims) ? registry.claims : [];
  const ids = new Set();
  const stale = [];
  const declarations = new Map();
  const declared = (file, name) => {
    const key = `${file}:${name}`;
    if (!declarations.has(key)) declarations.set(key, readDeclaration(file, name, read));
    return declarations.get(key);
  };
  for (const claim of claims) {
    const label = claim.id ?? '(missing id)';
    check(typeof claim.id === 'string' && !ids.has(claim.id), `${label}: unique stable id required`);
    ids.add(claim.id);
    for (const key of ['entity', 'kind', 'scope', 'period', 'attribution', 'implementationStatus', 'evidenceStatus']) {
      check(typeof claim[key] === 'string' && claim[key].trim().length > 0, `${label}: ${key} required`);
    }
    check(typeof claim.publication?.status === 'string' && typeof claim.publication?.basis === 'string' && claim.publication?.exclusions?.length > 0,
      `${label}: publication basis and exclusions required; do not imply employer permission`);
    check(typeof claim.source?.note === 'string' && claim.source?.files?.length > 0, `${label}: source provenance required`);
    for (const file of claim.source?.files ?? []) check(fileExists(file), `${label}: missing/unsafe source file ${file}`);
    const checked = dateValue(claim.lastChecked);
    const review = dateValue(claim.reviewAfter);
    const sourceChecked = claim.source?.sourceCheckedOn === null ? null : dateValue(claim.source?.sourceCheckedOn);
    check(Number.isFinite(checked) && checked <= dateValue(asOf), `${label}: lastChecked must be a valid local review date, not after --as-of`);
    check(claim.checkedScope === 'local-reconciliation', `${label}: lastChecked must be labelled local-reconciliation`);
    check(Number.isInteger(claim.cadenceDays) && claim.cadenceDays > 0 && review - checked === claim.cadenceDays * day,
      `${label}: reviewAfter must equal lastChecked + cadenceDays`);
    check(sourceChecked === null || Number.isFinite(sourceChecked) && sourceChecked <= checked,
      `${label}: sourceCheckedOn must be null or an actual source observation no later than local review`);
    if (Number.isFinite(review) && dateValue(asOf) >= review) {
      stale.push({ id: claim.id, reviewAfter: claim.reviewAfter, sourceCheckedOn: claim.source?.sourceCheckedOn });
      check(false, `${label}: review due ${claim.reviewAfter}; local reconciliation is not an external refresh`);
    }
    check(claim.surfaceRefs?.length > 0, `${label}: actual surface references required`);
    for (const reference of claim.surfaceRefs ?? []) {
      check(fileExists(reference.file), `${label}: missing/unsafe surface ${reference.file}`);
      if (reference.symbol && fileExists(reference.file)) {
        const source = ts.createSourceFile(reference.file, read(reference.file), ts.ScriptTarget.Latest, true, reference.file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
        let found = false;
        const visit = (node) => { if (ts.isIdentifier(node) && node.text === reference.symbol) found = true; ts.forEachChild(node, visit); };
        visit(source);
        check(found, `${label}: surface symbol ${reference.symbol} no longer exists in ${reference.file}`);
      }
    }
    check(claim.bindings?.length > 0, `${label}: at least one actual source-value binding required`);
    for (const binding of claim.bindings ?? []) {
      check(fileExists(binding.file), `${label}: missing/unsafe binding file ${binding.file}`);
      if (!fileExists(binding.file)) continue;
      try {
        const actual = select(declared(binding.file, binding.declaration), binding);
        check(actual !== undefined && isDeepStrictEqual(actual, binding.equals), `${label}: value drift in ${binding.file}#${binding.declaration} ${JSON.stringify(binding.where ?? binding.path ?? [])}`);
      } catch (error) { check(false, `${label}: ${error.message}`); }
    }
    for (const boundary of claim.boundaries ?? []) {
      check(fileExists(boundary.file), `${label}: missing boundary file ${boundary.file}`);
      if (!fileExists(boundary.file)) continue;
      const content = read(boundary.file);
      for (const pattern of boundary.required ?? []) {
        try { check(new RegExp(pattern, 'i').test(content), `${label}: missing evidence boundary /${pattern}/ in ${boundary.file}`); }
        catch { check(false, `${label}: invalid boundary pattern ${pattern}`); }
      }
      for (const pattern of boundary.forbidden ?? []) {
        try { check(!new RegExp(pattern, 'i').test(content), `${label}: prohibited claim /${pattern}/ in ${boundary.file}`); }
        catch { check(false, `${label}: invalid boundary pattern ${pattern}`); }
      }
    }
    for (const href of claim.publicLinks ?? []) {
      check(typeof href === 'string' && (href.startsWith('/') && !href.startsWith('//') || /^https:\/\/[^\s]+$/.test(href)), `${label}: invalid public destination ${href}`);
    }
    if (claim.kind === 'course') {
      const evidence = claim.bindings?.[0]?.equals;
      check(claim.source?.sourceCheckedOn === evidence?.checkedOn, `${label}: sourceCheckedOn must preserve platform checkedOn`);
      if (evidence?.platform === 'Coursera') check(!['students', 'rating', 'ratings', 'badges'].some((key) => key in evidence), `${label}: Coursera must not inherit Udemy metrics/badges`);
    }
  }
  for (const id of requiredIds) check(ids.has(id), `Missing important entity record ${id}`);
  try {
    const projects = declared('src/data/projects.ts', 'works').map((entry) => entry.title).sort();
    const registered = claims.filter((claim) => claim.kind === 'project').map((claim) => claim.entity).sort();
    check(JSON.stringify(projects) === JSON.stringify(registered), 'Project claim records must cover every actual case exactly once');
  } catch (error) { check(false, error.message); }
  check(claims.filter((claim) => claim.kind === 'course').length === 3, 'Keep three separate platform-specific course records');
  return { ok: errors.length === 0, asOf, records: claims.length, checks, stale, errors };
}

function selfTest(registry, asOf) {
  let fixtures = 0;
  const reject = (name, change, options, message) => {
    const altered = structuredClone(registry); change(altered);
    const result = validateRegistry(altered, { asOf, ...options });
    assert.ok(!result.ok && result.errors.some((error) => error.includes(message)), `Negative fixture failed: ${name}`);
    fixtures += 1;
  };
  reject('course metric drift', (copy) => { copy.claims.find((claim) => claim.id === 'course-ai-udemy').bindings[0].equals.students = '999,999'; }, {}, 'value drift');
  reject('cross-platform metric transfer', (copy) => { copy.claims.find((claim) => claim.id === 'course-ai-coursera').bindings[0].equals.rating = '4.6'; }, {}, 'Coursera must not inherit');
  reject('source observation cannot silently refresh', (copy) => { copy.claims.find((claim) => claim.id === 'course-product-udemy').source.sourceCheckedOn = '2026-10-21'; }, {}, 'preserve platform checkedOn');
  reject('missing project coverage', (copy) => { copy.claims = copy.claims.filter((claim) => claim.entity !== 'Qadam'); }, {}, 'every actual case');
  reject('missing source', () => {}, { overrides: new Map([['src/data/teachingEvidence.ts', null]]) }, 'missing/unsafe source');
  reject('unsafe surface path', (copy) => { copy.claims[0].surfaceRefs[0].file = '../private-note.md'; }, {}, 'missing/unsafe surface');
  reject('fictional deployment replaces demo boundary', () => {}, { overrides: new Map([['ai-ramin-section/canonical/projects/qadam.md', 'Qadam is a live-capital trading product with verified returns.']]) }, 'missing evidence boundary');
  reject('positive live-capital claim added beside caveats', () => {}, { overrides: new Map([['ai-ramin-section/canonical/projects/qadam.md', readFileSync(path.join(root, 'ai-ramin-section/canonical/projects/qadam.md'), 'utf8') + '\nLive capital is enabled.']]) }, 'prohibited claim');
  reject('impossible date', (copy) => { copy.claims[0].lastChecked = '2026-02-30'; }, {}, 'valid local review date');
  reject('stale review', () => {}, { asOf: '2099-01-01' }, 'review due');
  reject('missing important entity', (copy) => { copy.claims = copy.claims.filter((claim) => claim.id !== 'work-bayut'); }, {}, 'Missing important entity record work-bayut');
  reject('nonexistent field cannot match an empty object', (copy) => { const target = copy.claims.find((claim) => claim.id === 'talk-disx').bindings[1]; target.pick = ['fieldThatDoesNotExist']; target.equals = {}; }, {}, 'absent or non-literal field');
  const dueOn = registry.claims.map((claim) => claim.reviewAfter).sort()[0];
  assert.ok(validateRegistry(registry, { asOf: dueOn }).stale.length > 0, 'The review date itself is due');
  fixtures += 1;
  assert.equal(authorMaintenanceDate(new Date('2026-10-21T21:30:00Z')), '2026-10-22', 'Maintenance dates follow the author timezone, not UTC log dates');
  assert.equal(authorMaintenanceDate(new Date('2026-10-21T19:59:59Z')), '2026-10-21');
  fixtures += 2;
  const reordered = structuredClone(registry);
  const binding = reordered.claims.find((claim) => claim.id === 'course-ai-udemy').bindings[0];
  binding.equals = Object.fromEntries(Object.entries(binding.equals).reverse());
  assert.ok(validateRegistry(reordered, { asOf }).ok, 'Object key order is not claim drift');
  fixtures += 1;
  return fixtures;
}

function run() {
  const args = process.argv.slice(2);
  const valueAfter = (name) => args.find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1) ?? args[args.indexOf(name) + 1];
  const hasAsOf = args.some((arg) => arg === '--as-of' || arg.startsWith('--as-of='));
  const asOf = hasAsOf ? valueAfter('--as-of') : authorMaintenanceDate();
  const allowed = new Set(['--as-of', '--json', '--self-test']);
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--as-of') { i += 1; continue; }
    if (!allowed.has(args[i]) && !args[i].startsWith('--as-of=')) throw new Error(`Unknown option ${args[i]}`);
  }
  const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
  const report = validateRegistry(registry, { asOf });
  if (report.ok) {
    // Retain the existing detailed implementation/canonical boundary gate.
    try { execFileSync(process.execPath, [path.join(root, 'scripts/check-project-claims.mjs')], { cwd: root, stdio: 'pipe' }); }
    catch (error) { report.ok = false; report.errors.push(`Linked project boundary check failed: ${error.stdout?.toString().trim() || error.stderr?.toString().trim() || error.message}`); }
  }
  if (report.ok && args.includes('--self-test')) report.negativeFixtures = selfTest(registry, asOf);
  if (args.includes('--json')) console.log(JSON.stringify(report, null, 2));
  else if (report.ok) console.log(`Portfolio claims passed: ${report.records} entity records, ${report.checks} checks, ${report.negativeFixtures ?? 0} negative/date fixtures; as of ${asOf}. Local/source review dates remain separate. Linked project boundary checks passed. No live destinations or model answers were tested.`);
  else { console.error(`Portfolio claims failed as of ${asOf}:`); report.errors.forEach((error) => console.error(`- ${error}`)); }
  if (!report.ok) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { run(); } catch (error) { console.error(`Portfolio claims: ${error.message}`); process.exitCode = 1; }
}
