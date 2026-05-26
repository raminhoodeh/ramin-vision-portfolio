import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildQueryIntentFromIntentRoute,
  buildRoutingObservability,
  classifyQuery,
  getIntentClassifierAcceptanceThreshold,
  normalizeAiRaminIntentClassifierPayload,
  shouldAcceptIntentClassifierRoute,
} from '../server/aiRaminHandler.mjs';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SERVER_PATH = path.join(ROOT_DIR, 'server/aiRaminHandler.mjs');
const UI_PATH = path.join(ROOT_DIR, 'src/sections/AiRamin.tsx');
const PACKAGE_PATH = path.join(ROOT_DIR, 'package.json');
const FIXTURES_PATH = path.join(ROOT_DIR, 'ai-ramin-section/evaluation/semantic-confidence-fixtures.json');

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

function sameNumber(actual, expected) {
  return Math.abs(Number(actual) - Number(expected)) < 0.00001;
}

assertIncludes(serverSource, 'getIntentClassifierAcceptanceThreshold', 'server acceptance threshold helper');
assertIncludes(serverSource, 'shouldAcceptIntentClassifierRoute', 'server acceptance decision helper');
assertIncludes(serverSource, 'classifier_confidence_below_threshold_${acceptanceThreshold}', 'server calibrated fallback reason');
assertIncludes(serverSource, 'acceptanceThreshold', 'server routing observability');
assertIncludes(uiSource, 'acceptanceThreshold?: number | null', 'client routing trace type');
assertIncludes(uiSource, 'acceptance threshold', 'client debug drawer threshold label');
assertIncludes(packageSource, 'check:ai-ramin-semantic-confidence', 'package semantic confidence script');
assertIncludes(packageSource, 'npm run check:ai-ramin-semantic-confidence', 'verify semantic confidence script');

for (const fixture of fixtures.cases ?? []) {
  const deterministicQueryIntent = classifyQuery(fixture.prompt, fixture.requestType);
  assert(
    deterministicQueryIntent.primaryQuestionType === fixture.expectedDeterministicQuestionType,
    `${fixture.id}: expected deterministic ${fixture.expectedDeterministicQuestionType}; got ${deterministicQueryIntent.primaryQuestionType}`,
  );

  const normalizedRoute = normalizeAiRaminIntentClassifierPayload(fixture.classifierPayload);
  assert(normalizedRoute, `${fixture.id}: classifier payload did not normalize`);

  const acceptanceThreshold = getIntentClassifierAcceptanceThreshold(
    normalizedRoute,
    deterministicQueryIntent,
    fixture.defaultThreshold,
  );
  assert(
    sameNumber(acceptanceThreshold, fixture.expectedAcceptanceThreshold),
    `${fixture.id}: expected threshold ${fixture.expectedAcceptanceThreshold}; got ${acceptanceThreshold}`,
  );

  const accepted = shouldAcceptIntentClassifierRoute(normalizedRoute, deterministicQueryIntent, fixture.defaultThreshold);
  assert(accepted === fixture.expectedAccepted, `${fixture.id}: expected accepted ${fixture.expectedAccepted}; got ${accepted}`);

  if (!accepted) continue;

  const queryIntent = buildQueryIntentFromIntentRoute(fixture.classifierPayload, fixture.prompt, fixture.requestType, {
    router: 'ai_intent_classifier',
    provider: 'gemini',
    model: 'gemini-3.5-flash',
    attempted: true,
    used: true,
    intent: normalizedRoute.intent,
    confidence: normalizedRoute.confidence,
    acceptanceThreshold,
    reason: normalizedRoute.reason,
  });
  const routing = buildRoutingObservability({
    visitorMessage: fixture.prompt,
    inferredRequestType: fixture.requestType,
    queryIntent,
    retrievalRan: fixture.expectedNeedsRetrieval,
    modelCalled: fixture.expectedNeedsRetrieval,
    contextChunkCount: fixture.expectedNeedsRetrieval ? 1 : 0,
    evidenceCardCount: fixture.expectedNeedsRetrieval ? 1 : 0,
  });

  assert(routing.router === 'ai_intent_classifier', `${fixture.id}: expected ai_intent_classifier; got ${routing.router}`);
  assert(
    routing.primaryQuestionType === fixture.expectedQuestionType,
    `${fixture.id}: expected question type ${fixture.expectedQuestionType}; got ${routing.primaryQuestionType}`,
  );
  assert(routing.needsRetrieval === fixture.expectedNeedsRetrieval, `${fixture.id}: needsRetrieval mismatch`);
  assert(
    sameNumber(routing.classifier?.acceptanceThreshold, fixture.expectedAcceptanceThreshold),
    `${fixture.id}: routing missing calibrated acceptance threshold`,
  );
  assert(routing.fallthroughToPortfolioOverview === false, `${fixture.id}: accepted semantic route fell through to portfolio overview`);
}

if (failures.length) {
  console.error('AI Ramin semantic confidence contract check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`AI Ramin semantic confidence contract check passed: ${(fixtures.cases ?? []).length} fixtures.`);
