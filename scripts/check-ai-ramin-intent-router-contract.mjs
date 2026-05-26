import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AI_RAMIN_INTENT_ROUTE_IDS,
  AI_RAMIN_SUGGESTED_TONES,
  buildQueryIntentFromIntentRoute,
  buildRoutingObservability,
  classifyQuery,
  normalizeAiRaminIntentClassifierPayload,
} from '../server/aiRaminHandler.mjs';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UI_PATH = path.join(ROOT_DIR, 'src/sections/AiRamin.tsx');
const SERVER_PATH = path.join(ROOT_DIR, 'server/aiRaminHandler.mjs');
const PACKAGE_PATH = path.join(ROOT_DIR, 'package.json');
const FIXTURES_PATH = path.join(ROOT_DIR, 'ai-ramin-section/evaluation/routing-observability-fixtures.json');
const [uiSource, serverSource, packageSource, fixturesSource] = await Promise.all([
  readFile(UI_PATH, 'utf8'),
  readFile(SERVER_PATH, 'utf8'),
  readFile(PACKAGE_PATH, 'utf8'),
  readFile(FIXTURES_PATH, 'utf8'),
]);
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function assertIncludes(source, needle, label) {
  assert(source.includes(needle), `${label} missing ${needle}`);
}

const requiredIntentIds = [
  'casual_chat',
  'portfolio_overview',
  'role_fit',
  'product_judgment',
  'evidence_lookup',
  'behavioral_interview',
  'hiring_brief',
  'interview_coaching',
  'guardrail_boundary',
  'clarification_needed',
];

const requiredTones = ['casual', 'professional', 'hiring', 'analytical'];

for (const intentId of requiredIntentIds) {
  assert(AI_RAMIN_INTENT_ROUTE_IDS.includes(intentId), `intent route id missing from contract: ${intentId}`);
}

for (const tone of requiredTones) {
  assert(AI_RAMIN_SUGGESTED_TONES.includes(tone), `suggested tone missing from contract: ${tone}`);
}

const fixtures = JSON.parse(fixturesSource);
for (const fixture of fixtures.cases ?? []) {
  const requestType = fixture.requestType ?? 'general_chat';
  const classifierRoute = fixture.classifierPayload
    ? normalizeAiRaminIntentClassifierPayload(fixture.classifierPayload)
    : null;
  const queryIntent = classifierRoute
    ? buildQueryIntentFromIntentRoute(fixture.classifierPayload, fixture.prompt, requestType, {
        router: fixture.expectedRouter ?? 'ai_intent_classifier',
        provider: 'gemini',
        model: 'gemini-3.5-flash',
        attempted: true,
        used: true,
        intent: classifierRoute.intent,
        confidence: classifierRoute.confidence,
        reason: classifierRoute.reason,
      })
    : classifyQuery(fixture.prompt, requestType);
  const routing = buildRoutingObservability({
    visitorMessage: fixture.prompt,
    explicitRequestType: fixture.explicitRequestType,
    inferredRequestType: requestType,
    queryIntent,
  });
  const contract = routing.intentRoute;

  assert(requiredIntentIds.includes(contract.intent), `${fixture.id}: unknown intent ${contract.intent}`);
  assert(requiredTones.includes(contract.suggestedTone), `${fixture.id}: unknown tone ${contract.suggestedTone}`);
  assert(typeof contract.confidence === 'number' && contract.confidence >= 0 && contract.confidence <= 1, `${fixture.id}: invalid confidence`);
  assert(typeof contract.isSubstantive === 'boolean', `${fixture.id}: isSubstantive must be boolean`);
  assert(typeof contract.needsEvidence === 'boolean', `${fixture.id}: needsEvidence must be boolean`);
  assert(typeof contract.needsRetrieval === 'boolean', `${fixture.id}: needsRetrieval must be boolean`);
  assert(typeof contract.needsStructuredModules === 'boolean', `${fixture.id}: needsStructuredModules must be boolean`);
  assert(typeof contract.reason === 'string' && contract.reason.length > 0, `${fixture.id}: reason is required`);
  assert(contract.intent === fixture.expectedIntent, `${fixture.id}: expected ${fixture.expectedIntent}; got ${contract.intent}`);
}

assertIncludes(serverSource, 'buildAiRaminIntentRouteContract', 'server intent route builder');
assertIncludes(serverSource, 'AI_RAMIN_INTENT_ROUTE_IDS', 'server intent id export');
assertIncludes(serverSource, 'AI_RAMIN_SUGGESTED_TONES', 'server tone export');
assertIncludes(serverSource, 'sourceMetadata: {', 'server response source metadata');
assertIncludes(serverSource, 'intentRoute: routing.intentRoute', 'server source metadata intent route');
assertIncludes(uiSource, 'type AiRaminIntentRoute', 'client intent route type');
assertIncludes(uiSource, 'getAiRaminIntentRoute', 'client intent route helper');
assertIncludes(uiSource, 'getAiRaminPresentationPolicy', 'client presentation policy helper');
assertIncludes(uiSource, 'shouldShowAiRaminFeedback', 'client feedback policy helper');
assertIncludes(packageSource, 'check:ai-ramin-intent-contract', 'package intent contract script');
assertIncludes(packageSource, 'npm run check:ai-ramin-intent-contract', 'verify intent contract script');

if (failures.length) {
  console.error('AI Ramin intent router contract check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`AI Ramin intent router contract check passed: ${requiredIntentIds.length} intents, ${requiredTones.length} tones.`);
