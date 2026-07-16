import { readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UI_PATH = path.join(ROOT_DIR, 'src/sections/AiRamin.tsx');
const FIXTURES_PATH = path.join(ROOT_DIR, 'ai-ramin-section/evaluation/markdown-normalization-fixtures.json');

const [uiSource, fixtureSource] = await Promise.all([
  readFile(UI_PATH, 'utf8'),
  readFile(FIXTURES_PATH, 'utf8'),
]);

const fixtures = JSON.parse(fixtureSource);
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function extractFunctionSource(source, functionName) {
  const start = source.indexOf(`function ${functionName}`);
  if (start < 0) return '';

  const braceStart = source.indexOf('{', start);
  if (braceStart < 0) return '';

  let depth = 0;
  for (let index = braceStart; index < source.length; index += 1) {
    const char = source[index];
    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;
    if (depth === 0) {
      return source.slice(start, index + 1);
    }
  }

  return '';
}

const rawFunctionSource = extractFunctionSource(uiSource, 'normalizeAiRaminMarkdownContent');
assert(Boolean(rawFunctionSource), 'normalizeAiRaminMarkdownContent function could not be extracted');

const runnableFunctionSource = rawFunctionSource
  .replace('function normalizeAiRaminMarkdownContent(content: string)', 'function normalizeAiRaminMarkdownContent(content)');

function normalize(input) {
  const context = { input, output: '' };
  vm.runInNewContext(
    `${runnableFunctionSource}\noutput = normalizeAiRaminMarkdownContent(input);`,
    context,
    { timeout: 1000 },
  );
  return context.output;
}

const seenIds = new Set();

for (const testCase of fixtures.cases ?? []) {
  assert(testCase.id && !seenIds.has(testCase.id), `duplicate or missing fixture id: ${testCase.id}`);
  seenIds.add(testCase.id);

  const output = normalize(testCase.input);

  for (const expectedText of testCase.expectedIncludes ?? []) {
    assert(
      output.includes(expectedText),
      `${testCase.id}: normalized output missing ${JSON.stringify(expectedText)}. Output: ${JSON.stringify(output)}`,
    );
  }

  for (const absentText of testCase.expectedExcludes ?? []) {
    assert(
      !output.includes(absentText),
      `${testCase.id}: normalized output should not include ${JSON.stringify(absentText)}. Output: ${JSON.stringify(output)}`,
    );
  }
}

assert((fixtures.cases ?? []).length >= 5, 'expected at least five markdown normalization fixtures');

if (failures.length) {
  console.error('AI Ramin markdown normalization check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`AI Ramin markdown normalization check passed: ${(fixtures.cases ?? []).length} fixtures.`);
