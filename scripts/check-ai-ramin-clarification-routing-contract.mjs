import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildQueryIntentFromIntentRoute,
  buildRoutingObservability,
  classifyQuery,
} from '../server/aiRaminHandler.mjs';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SERVER_PATH = path.join(ROOT_DIR, 'server/aiRaminHandler.mjs');
const UI_PATH = path.join(ROOT_DIR, 'src/sections/AiRamin.tsx');
const PACKAGE_PATH = path.join(ROOT_DIR, 'package.json');
const FIXTURES_PATH = path.join(ROOT_DIR, 'ai-ramin-section/evaluation/clarification-routing-fixtures.json');

const [serverSource, uiSource, packageSource, fixturesSource] = await Promise.all([
  readFile(SERVER_PATH, 'utf8'),
  readFile(UI_PATH, 'utf8'),
  readFile(PACKAGE_PATH, 'utf8'),
  readFile(FIXTURES_PATH, 'utf8'),
]);
const fixtures = JSON.parse(fixturesSource);
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function assertIncludes(source, needle, label) {
  assert(source.includes(needle), `${label} missing ${needle}`);
}

assertIncludes(serverSource, "clarification_needed: 'Ask one concise clarifying question", 'server question instruction');
assertIncludes(serverSource, "id: 'clarifying_question'", 'server answer technique');
assertIncludes(serverSource, "id: 'clarification_prompt'", 'server answer frame');
assertIncludes(serverSource, 'buildClarificationNeededSections', 'server deterministic clarification response');
assertIncludes(serverSource, 'deterministic_clarification', 'server deterministic clarification shortcut');
assertIncludes(serverSource, "queryIntent.primaryQuestionType === 'clarification_needed'", 'server lightweight clarification branch');
assertIncludes(uiSource, "intent === 'clarification_needed'", 'client conversation presentation');
assertIncludes(packageSource, 'check:ai-ramin-clarification-routing', 'package clarification script');
assertIncludes(packageSource, 'npm run check:ai-ramin-clarification-routing', 'verify clarification script');

for (const fixture of fixtures.cases ?? []) {
  const queryIntent = fixture.classifierPayload
    ? buildQueryIntentFromIntentRoute(fixture.classifierPayload, fixture.prompt, fixture.requestType, {
        router: 'ai_intent_classifier',
        provider: 'gemini',
        model: 'gemini-3.5-flash',
        attempted: true,
        used: true,
        intent: fixture.expectedIntent,
        confidence: fixture.classifierPayload.confidence,
        reason: fixture.classifierPayload.reason,
      })
    : classifyQuery(fixture.prompt, fixture.requestType);
  const routing = buildRoutingObservability({
    visitorMessage: fixture.prompt,
    inferredRequestType: fixture.requestType,
    queryIntent,
  });

  assert(queryIntent.primaryQuestionType === fixture.expectedQuestionType, `${fixture.id}: expected ${fixture.expectedQuestionType}; got ${queryIntent.primaryQuestionType}`);
  assert(routing.intentRoute?.intent === fixture.expectedIntent, `${fixture.id}: expected intent ${fixture.expectedIntent}; got ${routing.intentRoute?.intent}`);
  assert(routing.intentRoute?.needsRetrieval === fixture.expectedNeedsRetrieval, `${fixture.id}: needsRetrieval mismatch`);
  assert(routing.presentationPolicy?.showEvidenceDisclosure === fixture.expectedShowEvidenceDisclosure, `${fixture.id}: evidence disclosure mismatch`);
  assert(routing.presentationPolicy?.showSuggestions === fixture.expectedShowSuggestions, `${fixture.id}: suggestions policy mismatch`);
}

if (failures.length) {
  console.error('AI Ramin clarification routing contract check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`AI Ramin clarification routing contract check passed: ${fixtures.cases.length} fixtures.`);
