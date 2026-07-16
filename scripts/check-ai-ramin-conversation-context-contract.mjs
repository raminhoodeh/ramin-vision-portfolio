import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildAiRaminConversationRouteContext,
  buildQueryIntentFromIntentRoute,
  buildRoutingObservability,
  buildVisitorPrompt,
  classifyQuery,
  resolveAiRaminQueryIntent,
} from '../server/aiRaminHandler.mjs';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SERVER_PATH = path.join(ROOT_DIR, 'server/aiRaminHandler.mjs');
const UI_PATH = path.join(ROOT_DIR, 'src/sections/AiRamin.tsx');
const PACKAGE_PATH = path.join(ROOT_DIR, 'package.json');
const FIXTURES_PATH = path.join(ROOT_DIR, 'ai-ramin-section/evaluation/conversation-context-fixtures.json');

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

assertIncludes(serverSource, 'buildAiRaminConversationRouteContext', 'server conversation context builder');
assertIncludes(serverSource, 'conversation_context_fallback', 'server inherited route fallback');
assertIncludes(serverSource, 'retrievalQuery', 'server contextual retrieval query');
assertIncludes(serverSource, 'getRequestTypeForIntentRoute', 'server classifier request type promotion');
assertIncludes(serverSource, 'contextualQuery', 'server contextual query contract');
assertIncludes(serverSource, 'Previous lead story', 'server prompt previous lead story contract');
assertIncludes(serverSource, 'Previous evidence anchors', 'server prompt previous evidence anchors contract');
assertIncludes(uiSource, 'metadata: message.response', 'client history metadata');
assertIncludes(uiSource, 'evidenceCardTitles', 'client history evidence titles');
assertIncludes(packageSource, 'check:ai-ramin-conversation-context', 'package conversation context script');
assertIncludes(packageSource, 'npm run check:ai-ramin-conversation-context', 'verify conversation context script');

for (const fixture of fixtures.cases ?? []) {
  const deterministicQueryIntent = classifyQuery(fixture.prompt, fixture.requestType);
  const context = buildAiRaminConversationRouteContext({
    visitorMessage: fixture.prompt,
    history: fixture.history,
    requestType: fixture.requestType,
    deterministicQueryIntent,
  });

  assert(context.isFollowUp === fixture.expectedFollowUp, `${fixture.id}: expected follow-up ${fixture.expectedFollowUp}; got ${context.isFollowUp}`);
  assert(context.inheritedIntent === fixture.expectedInheritedIntent, `${fixture.id}: expected inherited intent ${fixture.expectedInheritedIntent}; got ${context.inheritedIntent}`);
  assert(context.inheritedQuestionType === fixture.expectedInheritedQuestionType, `${fixture.id}: expected inherited question type ${fixture.expectedInheritedQuestionType}; got ${context.inheritedQuestionType}`);
  if (Object.hasOwn(fixture, 'expectedAcceptedSuggestedNextAction')) {
    assert(
      context.acceptedSuggestedNextAction === fixture.expectedAcceptedSuggestedNextAction,
      `${fixture.id}: expected accepted suggested action ${fixture.expectedAcceptedSuggestedNextAction}; got ${context.acceptedSuggestedNextAction}`,
    );
  }
  if (fixture.expectedSuggestedActionQuestionType) {
    assert(
      context.suggestedActionQuestionType === fixture.expectedSuggestedActionQuestionType,
      `${fixture.id}: expected suggested action question type ${fixture.expectedSuggestedActionQuestionType}; got ${context.suggestedActionQuestionType}`,
    );
  }

  if (fixture.expectedFollowUp) {
    assert(context.contextualQuery.includes(fixture.prompt), `${fixture.id}: contextual query should include current prompt`);
    assert(context.contextualQuery.includes('Previous'), `${fixture.id}: contextual query should include previous context`);
  }

  for (const expectedText of fixture.expectedContextualQueryIncludes ?? []) {
    assert(
      context.contextualQuery.includes(expectedText),
      `${fixture.id}: contextual query should include "${expectedText}"`,
    );
  }

  if (fixture.expectedPromptIncludes?.length) {
    const { queryIntent } = await resolveAiRaminQueryIntent({
      visitorMessage: fixture.prompt,
      history: fixture.history,
      hiringMode: 'hiring-manager',
      requestType: fixture.requestType,
      geminiApiKey: '',
    });
    if (fixture.expectedResolvedQuestionType) {
      assert(
        queryIntent.primaryQuestionType === fixture.expectedResolvedQuestionType,
        `${fixture.id}: expected resolved question type ${fixture.expectedResolvedQuestionType}; got ${queryIntent.primaryQuestionType}`,
      );
    }
    if (fixture.expectedResolvedRequestType) {
      assert(
        queryIntent.resolvedRequestType === fixture.expectedResolvedRequestType,
        `${fixture.id}: expected resolved request type ${fixture.expectedResolvedRequestType}; got ${queryIntent.resolvedRequestType}`,
      );
    }
    if (fixture.expectedResolvedIntent) {
      assert(
        queryIntent.intentRoute?.intent === fixture.expectedResolvedIntent,
        `${fixture.id}: expected resolved intent ${fixture.expectedResolvedIntent}; got ${queryIntent.intentRoute?.intent}`,
      );
    }
    const visitorPrompt = buildVisitorPrompt(
      fixture.prompt,
      'hiring-manager',
      queryIntent.resolvedRequestType ?? fixture.requestType,
      queryIntent,
    );

    for (const expectedText of fixture.expectedPromptIncludes) {
      assert(
        visitorPrompt.includes(expectedText),
        `${fixture.id}: visitor prompt should include "${expectedText}"`,
      );
    }
  }
}

const roleQueryIntent = buildQueryIntentFromIntentRoute(
  {
    intent: 'role_fit',
    confidence: 0.95,
    suggestedTone: 'hiring',
    reason: 'role-fit follow-up regarding seniority level',
  },
  'what about for a senior PM role?',
  'general_chat',
  {
    router: 'ai_intent_classifier',
    provider: 'gemini',
    model: 'gemini-3.5-flash',
    attempted: true,
    used: true,
    intent: 'role_fit',
    confidence: 0.95,
    reason: 'role-fit follow-up regarding seniority level',
  },
);
const roleRouting = buildRoutingObservability({
  visitorMessage: 'what about for a senior PM role?',
  inferredRequestType: roleQueryIntent.resolvedRequestType,
  queryIntent: roleQueryIntent,
});

assert(roleQueryIntent.resolvedRequestType === 'role_fit', `expected classifier role_fit to promote request type; got ${roleQueryIntent.resolvedRequestType}`);
assert(roleQueryIntent.primaryQuestionType === 'role_fit', `expected classifier role_fit question type; got ${roleQueryIntent.primaryQuestionType}`);
assert(roleRouting.intentRoute?.intent === 'role_fit', `expected role_fit routing intent; got ${roleRouting.intentRoute?.intent}`);
assert(roleRouting.needsStructuredModules === true, 'role_fit route should request structured modules');

if (failures.length) {
  console.error('AI Ramin conversation context contract check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`AI Ramin conversation context contract check passed: ${fixtures.cases.length} follow-up fixtures.`);
