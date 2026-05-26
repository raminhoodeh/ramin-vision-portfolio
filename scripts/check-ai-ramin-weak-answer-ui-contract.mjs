import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const fileMap = {
  ui: 'src/sections/AiRamin.tsx',
  css: 'src/index.css',
  server: 'server/aiRaminHandler.mjs',
  evaluator: 'scripts/evaluate-ai-ramin.mjs',
  evalCases: 'ai-ramin-section/evaluation/eval-cases.json',
  packageJson: 'package.json',
  spec: 'docs/section-specs/07-ai-ramin-chatbot.md',
};

const sourceEntries = await Promise.all(
  Object.entries(fileMap).map(async ([key, relativePath]) => {
    const source = await readFile(path.join(ROOT_DIR, relativePath), 'utf8');
    return [key, source];
  }),
);

const source = Object.fromEntries(sourceEntries);
const failures = [];

function assert(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function assertIncludes(key, needle, label) {
  assert(source[key].includes(needle), `${label} missing ${needle}`);
}

function assertOrder(key, firstNeedle, secondNeedle, label) {
  const firstIndex = source[key].indexOf(firstNeedle);
  const secondIndex = source[key].indexOf(secondNeedle);
  assert(firstIndex >= 0 && secondIndex > firstIndex, `${label} order is wrong`);
}

const requiredQualityIssues = [
  'raw_json_short_answer',
  'local_source_path_leak',
  'internal_metadata_leak',
  'duplicated_next_action_label',
  'generic_casual_bio_answer',
  'generic_behavioral_answer',
  'behavioral_story_missing',
  'over_cautious_with_sufficient_evidence',
];

const evalSuite = JSON.parse(source.evalCases);
const requiredEvalIssues = new Set(evalSuite.qualityGate?.requiredAnswerQualityIssues ?? []);
const expectedFixtureIssues = new Set();
const fixtureCases = [];

for (const testCase of evalSuite.cases ?? []) {
  if (testCase.qualityGateFixtureShortAnswer || testCase.qualityGateFixtureSections) {
    fixtureCases.push(testCase.id);
  }

  for (const issue of testCase.expectedQualityGateIssues ?? []) {
    expectedFixtureIssues.add(issue);
  }
}

for (const issue of requiredQualityIssues) {
  assert(requiredEvalIssues.has(issue), `eval quality gate does not require ${issue}`);
  assert(expectedFixtureIssues.has(issue), `no fixture expects quality issue ${issue}`);
}

assert(fixtureCases.length >= 4, 'quality gate regression needs at least four fixture cases');

assertIncludes('server', 'applyAnswerQualityGate', 'server quality gate');
assertIncludes('server', 'qualityGateApplied', 'server source metadata');
assertIncludes('server', 'qualityGateIssues', 'server source metadata');
assertIncludes('server', 'qualityGateStrategy', 'server source metadata');
assertIncludes('server', 'qualityGateResetModelPayload', 'server source metadata');
assertIncludes('server', 'over_cautious_with_sufficient_evidence', 'server over-caution recovery');
assertIncludes('server', 'generic_casual_bio_answer', 'server casual bio recovery');
assertIncludes('server', 'behavioral_story_missing', 'server behavioral recovery');

assertIncludes('evaluator', 'qualityGateResult', 'evaluator quality gate result');
assertIncludes('evaluator', 'expectedQualityGateIssues', 'evaluator fixture assertions');
assertIncludes('evaluator', 'requiredAnswerQualityIssues', 'evaluator coverage gate');
assertIncludes('evaluator', 'expectedQualityGateRecoveredKeywords', 'evaluator recovered keyword assertions');
assertIncludes('evaluator', 'expectedQualityGateAbsentKeywords', 'evaluator absent keyword assertions');

assertIncludes('ui', 'const weakAnswerQualityIssues = new Set', 'weak-answer issue set');
assertIncludes('ui', 'function getAiRaminAnswerPresentation', 'answer presentation helper');
assertIncludes('ui', 'sourceMetadata?.qualityGateIssues', 'quality gate metadata usage');
assertIncludes('ui', 'sourceMetadata?.qualityGateResetModelPayload', 'quality gate reset usage');
assertIncludes('ui', 'getAiRaminMinimalWeakAnswerCtas', 'minimal weak-answer CTAs');
assertIncludes('ui', 'presentation.shouldShowStructuredModules', 'weak-answer module suppression');
assertIncludes('ui', 'presentation.shouldShowEvidenceDisclosure', 'evidence disclosure gate');
assertIncludes('ui', 'ai-ramin-message-row-weak-answer', 'weak-answer row class');
assertIncludes(
  'ui',
  '<AiRaminInlineEvidenceDisclosure response={response} presentation={presentation} />',
  'evidence disclosure presentation prop',
);
assertOrder(
  'ui',
  'presentation.shouldShowStructuredModules',
  '<AiRaminInlineRoleFitModule response={response} />',
  'structured modules must be gated before rendering',
);

assertIncludes('css', '.ai-ramin-soft-cta-row.is-minimal', 'minimal CTA CSS');
assertIncludes('css', '.ai-ramin-inline-modules.is-simplified', 'simplified module CSS');
assertIncludes('css', '.ai-ramin-evidence-disclosure.is-simplified', 'simplified evidence CSS');
assertIncludes('css', '.ai-ramin-message-row-weak-answer', 'weak-answer feedback CSS');

assertIncludes('packageJson', '"check:ai-ramin-weak-ui"', 'package script');
assertIncludes('packageJson', 'npm run check:ai-ramin-weak-ui', 'main verify pipeline');
assertIncludes('spec', 'Answer Quality Recovery Stage 9', 'stage 9 regression spec');
assertIncludes('spec', 'check:ai-ramin-weak-ui', 'stage 9 regression spec script reference');

if (failures.length) {
  console.error('AI Ramin weak-answer UI regression check failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('AI Ramin weak-answer UI regression check passed.');
