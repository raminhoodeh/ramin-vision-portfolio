// Editorial regression checks: validate the boundary between implemented,
// demonstrated, and planned claims. This does not validate the external products.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import ts from 'typescript';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const failures = [];
let checks = 0;
const assert = (condition, message) => {
  checks += 1;
  if (!condition) failures.push(message);
};

function unwrap(node) {
  while (node && (ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isParenthesizedExpression(node))) {
    node = node.expression;
  }
  return node;
}

function literal(node) {
  node = unwrap(node);
  if (!node) return undefined;
  if (ts.isStringLiteralLike(node)) return node.text;
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(literal);
  if (ts.isObjectLiteralExpression(node)) {
    return Object.fromEntries(node.properties.filter(ts.isPropertyAssignment).map((property) => [
      ts.isIdentifier(property.name) || ts.isStringLiteralLike(property.name) ? property.name.text : property.name.getText(),
      literal(property.initializer),
    ]));
  }
  return undefined;
}

function declaration(path, name) {
  const source = ts.createSourceFile(path, read(path), ts.ScriptTarget.Latest, true, path.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const syntaxErrors = source.parseDiagnostics;
  assert(syntaxErrors.length === 0, `${path} must parse as TypeScript`);
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    const found = statement.declarationList.declarations.find((entry) => ts.isIdentifier(entry.name) && entry.name.text === name);
    if (found) return literal(found.initializer);
  }
  throw new Error(`Missing ${name} in ${path}`);
}

const works = declaration('src/data/projects.ts', 'works');
const cards = declaration('src/sections/Projects/projectCopy.ts', 'projectDescriptions');
const stacks = declaration('src/sections/Projects/index.tsx', 'implementationArchitectureSummaries');
const readers = read('src/sections/Projects/types.ts');
const thesis = read('src/sections/Projects/ThesisDeepDive.tsx');
const index = read('src/sections/Projects/index.tsx');
const gallery = read('src/sections/Projects/CaseStudyOverlay.tsx');
const demo = read('src/sections/Projects/MassSocialWisdomDemo.tsx');
const expected = ['nsso', 'Dreamsea', 'Qadam', '24Seven Concierge', 'RazinFlix', 'AI-Native Product Manager OS', 'Mass Social Wisdom Agent', 'AI Costs Dashboard', 'RAG Pipeline'];
const byName = new Map(works.map((entry) => [entry.title, entry]));
const text = (value) => JSON.stringify(value);
assert(byName.size === expected.length && works.length === expected.length, 'Keep exactly nine distinct product/tool cases');

for (const name of expected) {
  const work = byName.get(name);
  assert(Boolean(work), `Missing case: ${name}`);
  if (!work) continue;
  for (const section of ['problem', 'architecture', 'approach', 'tradeoffs', 'proof', 'improve']) {
    assert(Array.isArray(work[section]) && work[section].every((paragraph) => typeof paragraph === 'string' && paragraph.length > 0), `${name}: ${section} must remain populated`);
  }
  assert(typeof cards[name] === 'string' && typeof stacks[name] === 'string', `${name}: card and stack summaries must remain available`);
}

const qadam = text(byName.get('Qadam'));
assert(!/20\s*(?:%|percent)|self-improving/i.test(qadam), 'Qadam must not claim the unsubstantiated return or demonstrated self-improvement');
assert(/experimental/i.test(qadam) && /classical baseline/i.test(qadam) && /unproven/i.test(qadam), 'Qadam quantum review must remain experimental with no demonstrated advantage');
assert(/configured/i.test(qadam) && /freshness/i.test(qadam), 'Qadam source inventory must distinguish configuration from fresh coverage');

const concierge = text(byName.get('24Seven Concierge'));
assert(!/roughly 500 products|enforcing that through instruction alone|hard constraints rather than suggestions|good enough to prove/i.test(concierge), '24Seven must not turn prompt instructions or a product count into validated guarantees');
assert(/human concierge confirming bookings/i.test(concierge) && /formal evaluation suite/i.test(concierge), '24Seven must retain the bounded launch and deferred evaluation status');
assert(/proposed suite|remain planned/i.test(concierge) && /deterministic validation/i.test(concierge), '24Seven must distinguish planned evals and handle validation from current parsing');

const nsso = text(byName.get('nsso'));
assert(/Intros/.test(nsso) && /teaching/.test(nsso) && /separate scope/.test(nsso), 'nsso teaching evidence must not imply runtime-wide eval coverage');
assert(!/Above 0\.75|below 0\.25/.test(nsso), 'nsso must not present speculative classifier thresholds as calibrated');

const dreamsea = text(byName.get('Dreamsea'));
assert(/on-device persistence/i.test(dreamsea) && /cloud processing/i.test(dreamsea), 'Dreamsea must describe device persistence and cloud generation together');
assert(!/avoids account data collection|limited to immediate interpretation|cloud.audio deletion|WisprFlow|Gemini Flash 3\.5/i.test(dreamsea), 'Dreamsea must avoid unsupported privacy/provider guarantees');

const razinflix = byName.get('RazinFlix');
assert(/admin editor/i.test(text(razinflix.architecture)) && /already handle/i.test(text(razinflix.improve)), 'RazinFlix must acknowledge existing Add Film and metadata editing');
assert(!/next meaningful improvement is a small curator dashboard|not yet the shared maintenance|React\/Vite|hard-coded secret/i.test(text(razinflix)), 'RazinFlix must not repeat stale implementation/gap claims');
assert(/snapshot/i.test(text(razinflix.chips)), 'RazinFlix catalogue counts must be labelled as a snapshot');

const os = byName.get('AI-Native Product Manager OS');
assert(/release candidate/.test(text(os.architecture)) && /repository structure and packaging/.test(text(os.proof)), 'PM OS release and validator evidence must retain their structural scope');
assert(/automated smoke tests per runtime/.test(text(os.improve)), 'PM OS runtime smoke tests must remain a future improvement');

const mass = text(byName.get('Mass Social Wisdom Agent'));
assert(!/multi-agent/i.test(byName.get('Mass Social Wisdom Agent').tag), 'Mass Social must be labelled as a staged pipeline');
assert(/uncalibrated/i.test(mass) && /prepared results/i.test(mass), 'Mass Social must identify self-score limits and replay evidence');
assert(/live API requests/.test(readers) && /replays prepared/.test(readers), 'The selected Mass Social reader must distinguish live requests from repository replay');
assert(!/already feeds my Notion|60 to 70 percent|keep the output accurate/.test(readers), 'Mass Social must not claim unverified integration, speedup, or accuracy');
assert(/Model self-score/.test(demo) && !/· Depth \{item\.qualityScore\}/.test(demo), 'Mass Social output must label model scores without implying measured quality');

const costs = byName.get('AI Costs Dashboard');
for (const [surface, value] of [['case', text(costs)], ['card', cards['AI Costs Dashboard']], ['stack', stacks['AI Costs Dashboard']]]) {
  assert(/standalone/i.test(value) && /fallback/i.test(value), `AI Costs ${surface}: standalone scope and fallback must be explicit`);
  assert(!/enforcing budgets|eval-gated Router|detect anomalies|anomaly alerts/i.test(value), `AI Costs ${surface}: avoid unimplemented hard gates or anomaly detection`);
}
assert(/seeded examples/i.test(text(costs.proof)), 'AI Costs must label demo usage and eval scores as seeded');
assert(/most expensive candidate/i.test(text(costs.architecture)) && /best-scoring candidate/i.test(text(costs.architecture)), 'AI Costs must disclose both missing-score and below-threshold fallbacks');

const rag = byName.get('RAG Pipeline');
for (const [surface, value] of [['card', cards['RAG Pipeline']], ['stack', stacks['RAG Pipeline']]]) {
  assert(/standalone/i.test(value) && /remain planned/i.test(value), `RAG ${surface}: keep standalone scope and planned features distinct`);
  assert(!/source verification|re-ranking, verification/i.test(value), `RAG ${surface}: citations must not be called verification`);
}
assert(/vector-only/.test(text(rag.tradeoffs)) && /first improvement is reranking/.test(text(rag.improve)), 'RAG detailed case must retain vector-only current scope and future reranking');
assert(/exact chunk duplicates/.test(text(rag.architecture)) && /do not verify source truth/.test(text(rag.architecture)), 'RAG must bound deduplication and source-tag claims');
assert(/Reranking remains planned/.test(gallery), 'RAG gallery must not imply implemented reranking');
assert(!/across every product; one source|across all apps and features|The back-end infrastructure the apps run on/.test(thesis), 'Thesis must not present standalone tools as deployed infrastructure across all apps');
assert(!/All selfware and tools built using the same underlying|The stack behind every build/.test(index), 'Project comparison must be framed as a lens, not identical implementation');

const canonical = (slug) => read(`ai-ramin-section/canonical/projects/${slug}.md`);
assert(/historical snapshot values/.test(canonical('qadam')) && /not current/.test(canonical('qadam')), 'Canonical Qadam snapshot must remain explicitly historical');
assert(/separate scope/.test(canonical('nsso')), 'Canonical nsso must retain the teaching/runtime distinction');
assert(!/^- Audio is deleted from cloud storage/m.test(canonical('dreamsea')), 'Canonical Dreamsea must not guarantee unverified cloud deletion');
assert(/remain planned/.test(canonical('24seven-concierge')) && /prompt instructions alone do not prove/.test(canonical('24seven-concierge')), 'Canonical 24Seven must retain bounded controls and future eval status');
assert(/uncalibrated/.test(canonical('mass-social-wisdom-agent')) && /live API requests/.test(canonical('mass-social-wisdom-agent')), 'Canonical Mass Social must retain score and demo-mode boundaries');
assert(/already exist/.test(canonical('razinflix')), 'Canonical RazinFlix must retain current admin capability');

if (failures.length) {
  console.error(`Project claim consistency check failed (${failures.length}/${checks}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Project claim consistency check passed: ${checks} checks across nine cases, presentation copy, and canonical sources. External product behaviour was not exercised.`);
