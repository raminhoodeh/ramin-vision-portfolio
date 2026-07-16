import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  applyAnswerQualityGate,
  buildAiRaminConversationRouteContext,
  buildQueryIntentFromIntentRoute,
  buildRoutingObservability,
  buildVisitorPrompt,
  classifyQuery,
  getIntentClassifierAcceptanceThreshold,
  normalizeAiRaminIntentClassifierPayload,
  resolveAiRaminQueryIntent,
  shouldAcceptIntentClassifierRoute,
} from '../server/aiRaminHandler.mjs';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURES_PATH = path.join(ROOT_DIR, 'ai-ramin-section/evaluation/regression-suite-fixtures.json');
const PACKAGE_PATH = path.join(ROOT_DIR, 'package.json');
const DOCS_PATH = path.join(ROOT_DIR, 'docs/section-specs/07-ai-ramin-chatbot.md');

const [fixturesSource, packageSource, docsSource] = await Promise.all([
  readFile(FIXTURES_PATH, 'utf8'),
  readFile(PACKAGE_PATH, 'utf8'),
  readFile(DOCS_PATH, 'utf8'),
]);

const fixtures = JSON.parse(fixturesSource);
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function assertIncludes(source, needle, label) {
  assert(source.includes(needle), `${label} missing ${needle}`);
}

function normalizeText(value) {
  return String(value ?? '').toLowerCase();
}

function qualityGateText(result) {
  return [
    result.sections.short_answer,
    ...(Array.isArray(result.sections.verified_proof) ? result.sections.verified_proof : []),
    ...(Array.isArray(result.sections.inferred_fit) ? result.sections.inferred_fit : []),
    ...(Array.isArray(result.sections.confidential_boundary) ? result.sections.confidential_boundary : []),
    ...(Array.isArray(result.sections.open_questions) ? result.sections.open_questions : []),
    result.sections.suggested_next_action,
  ].join(' ');
}

function buildQueryIntentForFixture(fixture, extras = {}) {
  const deterministicQueryIntent = classifyQuery(fixture.prompt, fixture.requestType);
  if (!fixture.classifierPayload) {
    return {
      deterministicQueryIntent,
      queryIntent: {
        ...deterministicQueryIntent,
        ...extras,
      },
    };
  }

  const normalized = normalizeAiRaminIntentClassifierPayload(fixture.classifierPayload);
  assert(normalized, `${fixture.id}: classifier payload did not normalize`);
  const acceptanceThreshold = getIntentClassifierAcceptanceThreshold(
    normalized,
    deterministicQueryIntent,
    fixture.defaultThreshold,
  );
  const accepted = shouldAcceptIntentClassifierRoute(normalized, deterministicQueryIntent, fixture.defaultThreshold);
  assert(accepted === true, `${fixture.id}: expected classifier route to be accepted`);

  return {
    deterministicQueryIntent,
    queryIntent: buildQueryIntentFromIntentRoute(
      fixture.classifierPayload,
      fixture.prompt,
      fixture.requestType,
      {
        router: 'ai_intent_classifier',
        provider: 'gemini',
        model: 'gemini-3.5-flash',
        attempted: true,
        used: true,
        intent: normalized?.intent,
        confidence: normalized?.confidence,
        acceptanceThreshold,
        reason: normalized?.reason,
      },
      extras,
    ),
  };
}

function checkIntentRouteFixture(fixture) {
  const { queryIntent } = buildQueryIntentForFixture(fixture);
  const routing = buildRoutingObservability({
    visitorMessage: fixture.prompt,
    inferredRequestType: queryIntent.resolvedRequestType ?? fixture.requestType,
    queryIntent,
    retrievalRan: fixture.expectedNeedsRetrieval,
    modelCalled: fixture.expectedNeedsRetrieval,
    contextChunkCount: fixture.expectedNeedsRetrieval ? 1 : 0,
    evidenceCardCount: fixture.expectedNeedsRetrieval ? 1 : 0,
  });
  const visitorPrompt = buildVisitorPrompt(
    fixture.prompt,
    'hiring-manager',
    queryIntent.resolvedRequestType ?? fixture.requestType,
    queryIntent,
  );

  assert(routing.intentRoute?.intent === fixture.expectedIntent, `${fixture.id}: expected intent ${fixture.expectedIntent}; got ${routing.intentRoute?.intent}`);
  assert(routing.primaryQuestionType === fixture.expectedQuestionType, `${fixture.id}: expected question type ${fixture.expectedQuestionType}; got ${routing.primaryQuestionType}`);
  assert(routing.intentRoute?.suggestedTone === fixture.expectedTone, `${fixture.id}: expected tone ${fixture.expectedTone}; got ${routing.intentRoute?.suggestedTone}`);
  assert(routing.needsRetrieval === fixture.expectedNeedsRetrieval, `${fixture.id}: needsRetrieval mismatch`);
  assert(routing.needsStructuredModules === fixture.expectedNeedsStructuredModules, `${fixture.id}: structured module mismatch`);
  assert(
    routing.presentationPolicy?.showEvidenceDisclosure === fixture.expectedShowEvidenceDisclosure,
    `${fixture.id}: evidence disclosure mismatch`,
  );
  assert(
    routing.fallthroughToPortfolioOverview === fixture.expectedFallthroughToPortfolioOverview,
    `${fixture.id}: portfolio overview fallthrough mismatch`,
  );

  for (const expectedText of fixture.expectedPromptIncludes ?? []) {
    assert(visitorPrompt.includes(expectedText), `${fixture.id}: visitor prompt missing "${expectedText}"`);
  }
  for (const absentText of fixture.expectedPromptExcludes ?? []) {
    assert(!visitorPrompt.includes(absentText), `${fixture.id}: visitor prompt should not include "${absentText}"`);
  }
}

async function checkConversationFollowUpFixture(fixture) {
  const deterministicQueryIntent = classifyQuery(fixture.prompt, fixture.requestType);
  const context = buildAiRaminConversationRouteContext({
    visitorMessage: fixture.prompt,
    history: fixture.history,
    requestType: fixture.requestType,
    deterministicQueryIntent,
  });

  assert(context.isFollowUp === fixture.expectedFollowUp, `${fixture.id}: expected follow-up ${fixture.expectedFollowUp}; got ${context.isFollowUp}`);
  assert(context.inheritedIntent === fixture.expectedInheritedIntent, `${fixture.id}: expected inherited intent ${fixture.expectedInheritedIntent}; got ${context.inheritedIntent}`);
  assert(
    context.inheritedQuestionType === fixture.expectedInheritedQuestionType,
    `${fixture.id}: expected inherited question type ${fixture.expectedInheritedQuestionType}; got ${context.inheritedQuestionType}`,
  );
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

  for (const expectedText of fixture.expectedContextualQueryIncludes ?? []) {
    assert(context.contextualQuery.includes(expectedText), `${fixture.id}: contextual query missing "${expectedText}"`);
  }

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
  for (const expectedText of fixture.expectedPromptIncludes ?? []) {
    assert(visitorPrompt.includes(expectedText), `${fixture.id}: visitor prompt missing "${expectedText}"`);
  }
}

function checkQualityGateFixture(fixture) {
  const { queryIntent } = buildQueryIntentForFixture(fixture);
  const evidenceCards = fixture.evidenceCards ?? [];
  const qualityGate = applyAnswerQualityGate(
    fixture.fixtureSections,
    fixture.prompt,
    queryIntent.resolvedRequestType ?? fixture.requestType,
    {
      sources: evidenceCards.map((card) => card.source_path).filter(Boolean),
      chunks: [],
      answerableEvidenceCount: fixture.answerableEvidenceCount ?? evidenceCards.length,
      queryIntent,
      selectedStory: null,
    },
    evidenceCards,
  );
  const answerText = normalizeText(qualityGateText(qualityGate));

  assert(qualityGate.applied === true, `${fixture.id}: expected quality gate to apply`);
  assert(
    qualityGate.strategy === fixture.expectedQualityGateStrategy,
    `${fixture.id}: expected strategy ${fixture.expectedQualityGateStrategy}; got ${qualityGate.strategy}`,
  );

  for (const expectedIssue of fixture.expectedQualityGateIssues ?? []) {
    assert(qualityGate.issues.includes(expectedIssue), `${fixture.id}: missing quality issue ${expectedIssue}`);
  }
  for (const expectedKeyword of fixture.expectedRecoveredKeywords ?? []) {
    assert(answerText.includes(normalizeText(expectedKeyword)), `${fixture.id}: recovered answer missing "${expectedKeyword}"`);
  }
  for (const absentKeyword of fixture.expectedAbsentKeywords ?? []) {
    assert(!answerText.includes(normalizeText(absentKeyword)), `${fixture.id}: recovered answer still includes "${absentKeyword}"`);
  }
  for (const expectedShortAnswerText of fixture.expectedShortAnswerIncludes ?? []) {
    assert(
      qualityGate.sections.short_answer.includes(expectedShortAnswerText),
      `${fixture.id}: short_answer missing exact text ${JSON.stringify(expectedShortAnswerText)}`,
    );
  }
  for (const absentShortAnswerText of fixture.expectedShortAnswerExcludes ?? []) {
    assert(
      !qualityGate.sections.short_answer.includes(absentShortAnswerText),
      `${fixture.id}: short_answer should not include exact text ${JSON.stringify(absentShortAnswerText)}`,
    );
  }
  for (const expectedSuggestedActionText of fixture.expectedSuggestedNextActionIncludes ?? []) {
    assert(
      qualityGate.sections.suggested_next_action.includes(expectedSuggestedActionText),
      `${fixture.id}: suggested_next_action missing exact text ${JSON.stringify(expectedSuggestedActionText)}`,
    );
  }
  for (const absentSuggestedActionText of fixture.expectedSuggestedNextActionExcludes ?? []) {
    assert(
      !qualityGate.sections.suggested_next_action.includes(absentSuggestedActionText),
      `${fixture.id}: suggested_next_action should not include exact text ${JSON.stringify(absentSuggestedActionText)}`,
    );
  }
}

assertIncludes(packageSource, 'check:ai-ramin-regression', 'package regression script');
assertIncludes(packageSource, 'npm run check:ai-ramin-regression', 'verify regression script');
assertIncludes(docsSource, 'Stage 8: Evals And Regression Suite', 'AI Ramin docs');
assertIncludes(docsSource, 'check:ai-ramin-regression', 'AI Ramin docs regression script');

const seenIds = new Set();
const families = new Set();

for (const fixture of fixtures.cases ?? []) {
  assert(!seenIds.has(fixture.id), `duplicate fixture id: ${fixture.id}`);
  seenIds.add(fixture.id);
  families.add(fixture.family);

  if (fixture.kind === 'intent_route') {
    checkIntentRouteFixture(fixture);
  } else if (fixture.kind === 'conversation_followup') {
    await checkConversationFollowUpFixture(fixture);
  } else if (fixture.kind === 'quality_gate') {
    checkQualityGateFixture(fixture);
  } else {
    failures.push(`${fixture.id}: unknown regression fixture kind ${fixture.kind}`);
  }
}

for (const requiredFamily of fixtures.requiredFamilies ?? []) {
  assert(families.has(requiredFamily), `missing required regression family: ${requiredFamily}`);
}

if (failures.length) {
  console.error('AI Ramin regression suite check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`AI Ramin regression suite check passed: ${(fixtures.cases ?? []).length} fixtures across ${families.size} families.`);
