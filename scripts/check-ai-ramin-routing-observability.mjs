import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildRoutingObservability,
  classifyQuery,
} from '../server/aiRaminHandler.mjs';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURES_PATH = path.join(ROOT_DIR, 'ai-ramin-section/evaluation/routing-observability-fixtures.json');
const fixtures = JSON.parse(await readFile(FIXTURES_PATH, 'utf8'));
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

for (const fixture of fixtures.cases ?? []) {
  const requestType = fixture.requestType ?? 'general_chat';
  const queryIntent = classifyQuery(fixture.prompt, requestType);
  const routing = buildRoutingObservability({
    visitorMessage: fixture.prompt,
    explicitRequestType: fixture.explicitRequestType,
    inferredRequestType: requestType,
    queryIntent,
    retrievalRan: queryIntent.primaryQuestionType !== 'conversation_open',
    modelCalled: queryIntent.primaryQuestionType !== 'conversation_open',
    contextChunkCount: queryIntent.primaryQuestionType === 'conversation_open' ? 0 : 1,
    evidenceCardCount: queryIntent.primaryQuestionType === 'conversation_open' ? 0 : 1,
  });

  assert(routing.schemaVersion === 1, `${fixture.id}: missing routing schema version`);
  assert(routing.router === 'deterministic_rules', `${fixture.id}: unexpected router ${routing.router}`);
  assert(typeof routing.messagePreview === 'string' && routing.messagePreview.length > 0, `${fixture.id}: missing message preview`);
  assert(typeof routing.confidence === 'number', `${fixture.id}: missing route confidence`);
  assert(typeof routing.reason === 'string' && routing.reason.length > 0, `${fixture.id}: missing route reason`);
  assert(
    routing.primaryQuestionType === fixture.expectedQuestionType,
    `${fixture.id}: expected ${fixture.expectedQuestionType}; got ${routing.primaryQuestionType}`,
  );
  assert(
    routing.needsRetrieval === fixture.expectedNeedsRetrieval,
    `${fixture.id}: expected needsRetrieval ${fixture.expectedNeedsRetrieval}; got ${routing.needsRetrieval}`,
  );
  assert(
    routing.presentationPolicy?.showEvidenceDisclosure === fixture.expectedShowEvidenceDisclosure,
    `${fixture.id}: expected evidence disclosure ${fixture.expectedShowEvidenceDisclosure}; got ${routing.presentationPolicy?.showEvidenceDisclosure}`,
  );
  assert(
    routing.fallthroughToPortfolioOverview === fixture.expectedFallthroughToPortfolioOverview,
    `${fixture.id}: expected fallthrough ${fixture.expectedFallthroughToPortfolioOverview}; got ${routing.fallthroughToPortfolioOverview}`,
  );
}

if (failures.length) {
  console.error('AI Ramin routing observability check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`AI Ramin routing observability check passed: ${(fixtures.cases ?? []).length} fixtures.`);
