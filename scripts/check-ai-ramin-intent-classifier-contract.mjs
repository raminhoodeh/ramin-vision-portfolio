import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildAiRaminIntentClassifierPrompt,
  buildQueryIntentFromIntentRoute,
  buildRoutingObservability,
  normalizeAiRaminIntentClassifierPayload,
} from '../server/aiRaminHandler.mjs';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SERVER_PATH = path.join(ROOT_DIR, 'server/aiRaminHandler.mjs');
const PACKAGE_PATH = path.join(ROOT_DIR, 'package.json');
const FIXTURES_PATH = path.join(ROOT_DIR, 'ai-ramin-section/evaluation/intent-classifier-fixtures.json');

const [serverSource, packageSource, fixturesSource] = await Promise.all([
  readFile(SERVER_PATH, 'utf8'),
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

assertIncludes(serverSource, 'buildAiRaminIntentClassifierPrompt', 'server classifier prompt');
assertIncludes(serverSource, 'classifyIntentWithModel', 'server model classifier');
assertIncludes(serverSource, 'resolveAiRaminQueryIntent', 'server classifier resolver');
assertIncludes(serverSource, 'deterministic_shortcut', 'server deterministic shortcut router');
assertIncludes(serverSource, 'deterministic_fallback', 'server deterministic fallback router');
assertIncludes(serverSource, 'ai_intent_classifier', 'server AI classifier router');
assertIncludes(serverSource, 'GEMINI_INTENT_MODEL', 'server classifier model env');
assertIncludes(serverSource, 'AI_RAMIN_INTENT_CLASSIFIER_CONFIDENCE_THRESHOLD', 'server classifier threshold env');
assertIncludes(packageSource, 'check:ai-ramin-intent-classifier', 'package classifier script');
assertIncludes(packageSource, 'npm run check:ai-ramin-intent-classifier', 'verify classifier script');

const prompt = buildAiRaminIntentClassifierPrompt({
  visitorMessage: 'what about for a senior PM role?',
  history: [
    {
      role: 'user',
      content: 'I have a PM job for him at a B2B company.',
    },
  ],
  hiringMode: 'hiring-manager',
  requestType: 'general_chat',
  deterministicQueryIntent: buildQueryIntentFromIntentRoute(
    { intent: 'portfolio_overview', confidence: 0.34 },
    'what about for a senior PM role?',
    'general_chat',
  ),
});

for (const expectedPromptCue of [
  'Allowed intent values',
  'casual_chat',
  'role_fit',
  'behavioral_interview',
  'product_judgment',
  'what about for a senior PM role?',
  'For any named or unnamed company PM job, choose role_fit.',
]) {
  assert(prompt.includes(expectedPromptCue), `classifier prompt missing cue: ${expectedPromptCue}`);
}

for (const fixture of fixtures.cases ?? []) {
  const normalized = normalizeAiRaminIntentClassifierPayload(fixture.classifierPayload);
  assert(normalized, `${fixture.id}: classifier payload did not normalize`);
  assert(normalized?.intent === fixture.expectedIntent, `${fixture.id}: expected intent ${fixture.expectedIntent}; got ${normalized?.intent}`);

  const queryIntent = buildQueryIntentFromIntentRoute(fixture.classifierPayload, fixture.prompt, fixture.requestType, {
    router: 'ai_intent_classifier',
    provider: 'gemini',
    model: 'gemini-3.5-flash',
    attempted: true,
    used: true,
    intent: normalized?.intent,
    confidence: normalized?.confidence,
    reason: normalized?.reason,
  });
  const routing = buildRoutingObservability({
    visitorMessage: fixture.prompt,
    inferredRequestType: fixture.requestType,
    queryIntent,
    retrievalRan: false,
    modelCalled: false,
  });

  assert(queryIntent.primaryQuestionType === fixture.expectedQuestionType, `${fixture.id}: expected question type ${fixture.expectedQuestionType}; got ${queryIntent.primaryQuestionType}`);
  assert(routing.router === 'ai_intent_classifier', `${fixture.id}: expected ai_intent_classifier router; got ${routing.router}`);
  assert(routing.classifier?.attempted === true, `${fixture.id}: classifier attempt missing`);
  assert(routing.classifier?.used === true, `${fixture.id}: classifier used flag missing`);
  assert(routing.intentRoute?.intent === fixture.expectedIntent, `${fixture.id}: routing expected intent ${fixture.expectedIntent}; got ${routing.intentRoute?.intent}`);
  assert(routing.intentRoute?.needsRetrieval === fixture.expectedNeedsRetrieval, `${fixture.id}: needsRetrieval mismatch`);
}

if (failures.length) {
  console.error('AI Ramin intent classifier contract check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`AI Ramin intent classifier contract check passed: ${fixtures.cases.length} classifier fixtures.`);
