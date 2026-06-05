import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SERVER_PATH = path.join(ROOT_DIR, 'server/aiRaminHandler.mjs');
const EVALUATOR_PATH = path.join(ROOT_DIR, 'scripts/evaluate-ai-ramin.mjs');
const CASES_PATH = path.join(ROOT_DIR, 'ai-ramin-section/evaluation/eval-cases.json');

const VALID_SOFT_CTAS = new Set([
  'show_evidence',
  'analyze_role_fit',
  'draft_hiring_brief',
  'generate_interview_questions',
  'compare_projects',
  'turn_into_mvp_plan',
  'show_risks',
  'use_in_hiring_brief',
]);

function findDeclarationBlock(source, declarationName) {
  const marker = `const ${declarationName} =`;
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error(`Could not find ${declarationName}.`);
  }

  const start = source.indexOf('{', markerIndex);
  if (start === -1) {
    throw new Error(`Could not find ${declarationName} object body.`);
  }

  let depth = 0;
  let quote = '';
  let escaped = false;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (quote) {
      if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = '';
      }
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }

    if (char === '{') {
      depth += 1;
      continue;
    }

    if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return source.slice(start, index + 1);
      }
    }
  }

  throw new Error(`Could not close ${declarationName} object body.`);
}

function parseSimpleMapping(source, declarationName) {
  const block = findDeclarationBlock(source, declarationName);
  const mapping = new Map();
  const entryPattern = /([a-z0-9_]+):\s*'([^']+)'/gi;
  let match;

  while ((match = entryPattern.exec(block))) {
    mapping.set(match[1], match[2]);
  }

  return mapping;
}

function parseServerTechniqueIds(source) {
  const block = findDeclarationBlock(source, 'ANSWER_TECHNIQUE_CONFIG');
  const mapping = new Map();
  const entryPattern = /\n\s{2}([a-z0-9_]+):\s*{\s*id:\s*'([^']+)'/gi;
  let match;

  while ((match = entryPattern.exec(block))) {
    mapping.set(match[1], match[2]);
  }

  return mapping;
}

function parseSoftCtas(value) {
  return value
    .split(',')
    .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
}

function parseServerFrames(source) {
  const block = findDeclarationBlock(source, 'ANSWER_FRAME_CONFIG');
  const mapping = new Map();
  const entryPattern =
    /\n\s{2}([a-z0-9_]+):\s*{[\s\S]*?id:\s*'([^']+)'[\s\S]*?answerFamily:\s*'([^']+)'[\s\S]*?softCtas:\s*\[([^\]]*)\]/gi;
  let match;

  while ((match = entryPattern.exec(block))) {
    mapping.set(match[1], {
      id: match[2],
      answerFamily: match[3],
      softCtas: parseSoftCtas(match[4]),
    });
  }

  return mapping;
}

function parseEvaluatorSoftCtas(source) {
  const block = findDeclarationBlock(source, 'SOFT_CTAS_BY_QUESTION_TYPE');
  const mapping = new Map();
  const entryPattern = /([a-z0-9_]+):\s*\[([^\]]*)\]/gi;
  let match;

  while ((match = entryPattern.exec(block))) {
    mapping.set(match[1], parseSoftCtas(match[2]));
  }

  return mapping;
}

function sameArray(left, right) {
  return left.length === right.length && left.every((item, index) => item === right[index]);
}

function assert(condition, message, failures) {
  if (!condition) failures.push(message);
}

const [serverSource, evaluatorSource, evalSuite] = await Promise.all([
  readFile(SERVER_PATH, 'utf8'),
  readFile(EVALUATOR_PATH, 'utf8'),
  readFile(CASES_PATH, 'utf8').then((raw) => JSON.parse(raw)),
]);

const failures = [];
const serverTechniques = parseServerTechniqueIds(serverSource);
const serverFrames = parseServerFrames(serverSource);
const evaluatorTechniques = parseSimpleMapping(evaluatorSource, 'ANSWER_TECHNIQUE_BY_QUESTION_TYPE');
const evaluatorFrames = parseSimpleMapping(evaluatorSource, 'ANSWER_FRAME_BY_QUESTION_TYPE');
const evaluatorSoftCtas = parseEvaluatorSoftCtas(evaluatorSource);
const cases = Array.isArray(evalSuite.cases) ? evalSuite.cases : [];
const caseTypes = new Map();

for (const questionType of serverTechniques.keys()) {
  const frame = serverFrames.get(questionType);
  assert(frame, `Missing server answer frame for ${questionType}.`, failures);
  assert(
    evaluatorTechniques.get(questionType) === serverTechniques.get(questionType),
    `Evaluator answer technique drift for ${questionType}.`,
    failures,
  );
  assert(
    evaluatorFrames.get(questionType) === frame?.id,
    `Evaluator answer frame drift for ${questionType}.`,
    failures,
  );
  assert(
    sameArray(evaluatorSoftCtas.get(questionType) ?? [], frame?.softCtas ?? []),
    `Evaluator soft CTA drift for ${questionType}.`,
    failures,
  );

  for (const softCta of frame?.softCtas ?? []) {
    assert(VALID_SOFT_CTAS.has(softCta), `Unknown soft CTA ${softCta} for ${questionType}.`, failures);
  }
}

for (const testCase of cases) {
  if (!testCase.expectedQuestionType) continue;

  const expectedType = testCase.expectedQuestionType;
  caseTypes.set(expectedType, (caseTypes.get(expectedType) ?? 0) + 1);
  const serverTechnique = serverTechniques.get(expectedType);
  const serverFrame = serverFrames.get(expectedType);

  assert(serverTechnique, `${testCase.id} references unknown question type ${expectedType}.`, failures);
  assert(
    testCase.expectedAnswerTechnique === serverTechnique,
    `${testCase.id} expectedAnswerTechnique does not match server routing for ${expectedType}.`,
    failures,
  );
  assert(
    testCase.expectedAnswerFrame === serverFrame?.id,
    `${testCase.id} expectedAnswerFrame does not match server routing for ${expectedType}.`,
    failures,
  );

  for (const expectedSoftCta of testCase.expectedSoftCtas ?? []) {
    assert(
      serverFrame?.softCtas.includes(expectedSoftCta),
      `${testCase.id} expects soft CTA ${expectedSoftCta}, but ${expectedType} does not expose it.`,
      failures,
    );
  }
}

for (const questionType of serverTechniques.keys()) {
  assert(caseTypes.has(questionType), `No eval case covers question type ${questionType}.`, failures);
}

if (failures.length) {
  console.error('AI Ramin interview routing check failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  `AI Ramin interview routing check passed: ${serverFrames.size} answer frames, ${cases.length} eval cases, ${caseTypes.size} covered question types.`,
);
