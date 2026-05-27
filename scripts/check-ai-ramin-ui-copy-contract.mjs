import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const AI_RAMIN_SECTION_PATH = path.join(ROOT_DIR, 'src/sections/AiRamin.tsx');
const SERVER_HANDLER_PATH = path.join(ROOT_DIR, 'server/aiRaminHandler.mjs');
const EVAL_CASES_PATH = path.join(ROOT_DIR, 'ai-ramin-section/evaluation/eval-cases.json');
const [source, serverSource, evalCasesSource] = await Promise.all([
  readFile(AI_RAMIN_SECTION_PATH, 'utf8'),
  readFile(SERVER_HANDLER_PATH, 'utf8'),
  readFile(EVAL_CASES_PATH, 'utf8'),
]);
const failures = [];

function assertIncludes(needle, label) {
  if (!source.includes(needle)) {
    failures.push(`${label} missing ${needle}`);
  }
}

function assertExcludes(needle, label) {
  if (source.includes(needle)) {
    failures.push(`${label} still contains ${needle}`);
  }
}

assertIncludes('function getAiRaminEvidenceDisclosureKicker', 'evidence disclosure label helper');
assertIncludes('formatAiRaminSourceCount', 'source count formatting');
assertIncludes('proof points', 'surfaced proof label');
assertIncludes('proof in source trail', 'source-backed fallback label');
assertIncludes('proof not surfaced', 'empty proof fallback label');
assertIncludes('sourceMetadata?.answerableEvidenceCount', 'answerable source metadata usage');
assertIncludes("card.confidence === 'verified'", 'verified evidence-card confidence usage');
assertIncludes("card.confidence === 'local-primary'", 'local-primary evidence-card confidence usage');
assertIncludes('https?:\\/\\/[^\\s<>)]+', 'bare URL auto-linking');
assertIncludes('renderAiRaminInlineMarkdown(item', 'inline evidence item markdown rendering');
assertIncludes('AiRaminInlineEvidenceDisclosure response={response}', 'single evidence disclosure module');
assertIncludes('**Suggested next action:**', 'client suggested next action colon');
assertIncludes('function getAiRaminAnswerPresentation', 'weak-answer presentation helper');
assertIncludes('qualityGateIssues', 'quality gate metadata usage');
assertIncludes('qualityGateResetModelPayload', 'quality gate reset metadata usage');
assertIncludes('getAiRaminMinimalWeakAnswerCtas', 'minimal weak-answer CTA helper');
assertIncludes('ai-ramin-message-row-weak-answer', 'weak-answer message row class');
assertIncludes('presentation.shouldShowStructuredModules', 'weak-answer structured module suppression');
assertIncludes('isAiRaminConversationOpenResponse', 'conversation-open UI suppression helper');
assertIncludes('routing?.primaryQuestionType', 'routing metadata question type usage');
assertIncludes('getAiRaminIntentRoute', 'intent route metadata helper');
assertIncludes('getAiRaminPresentationPolicy', 'route presentation policy helper');
assertIncludes('route confidence', 'debug drawer routing confidence label');

if (!serverSource.includes('**Suggested next action:**')) {
  failures.push('server suggested next action colon missing **Suggested next action:**');
}
if (!serverSource.includes('conversation_open') || !serverSource.includes('sendConversationOpenResponse')) {
  failures.push('server conversation-open deterministic response missing');
}
if (!serverSource.includes('buildRoutingObservability') || !serverSource.includes('fallthroughToPortfolioOverview')) {
  failures.push('server routing observability metadata missing');
}
if (!serverSource.includes('buildAiRaminIntentRouteContract') || !serverSource.includes('intentRoute: routing.intentRoute')) {
  failures.push('server intent route contract metadata missing');
}
if (!evalCasesSource.includes('"conversation-open-greeting"')) {
  failures.push('greeting eval case missing');
}
if (!evalCasesSource.includes('"conversation-open-status-check"')) {
  failures.push('status-check eval case missing');
}

assertExcludes('0 verified', 'AI Ramin UI copy');
assertExcludes('evidence · ${proofCount} verified', 'old evidence disclosure label');
assertExcludes('verified`', 'old bare verified-count template');
assertExcludes('AiRaminInlineEvidenceLookupModule', 'separate evidence lookup dropdown');
assertExcludes('<AiRaminInlineEvidenceDisclosure response={response} defaultOpen=', 'auto-open evidence disclosure');

if (source.includes('show_evidence') || serverSource.includes('show_evidence') || evalCasesSource.includes('show_evidence')) {
  failures.push('show_evidence soft CTA contract should not be used; evidence belongs in the inline disclosure');
}

if (failures.length) {
  console.error('AI Ramin UI copy contract check failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('AI Ramin UI copy contract check passed.');
