import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const files = {
  serverHandler: 'server/aiRaminHandler.mjs',
  viteConfig: 'vite.config.js',
  productionServer: 'server.mjs',
  aiRaminSection: 'src/sections/AiRamin.tsx',
  schema: 'ai-ramin-section/evaluation/live-feedback.schema.json',
  gitignore: '.gitignore',
};

const entries = await Promise.all(
  Object.entries(files).map(async ([key, relativePath]) => [
    key,
    await readFile(path.join(ROOT_DIR, relativePath), 'utf8'),
  ]),
);
const sourceByKey = Object.fromEntries(entries);
const failures = [];

function assertIncludes(key, needle, label) {
  if (!sourceByKey[key].includes(needle)) {
    failures.push(`${label} missing ${needle}`);
  }
}

assertIncludes('serverHandler', 'handleAiRaminFeedbackRequest', 'server feedback handler');
assertIncludes('serverHandler', 'live-feedback.jsonl', 'server feedback log path');
assertIncludes('serverHandler', 'review_priority', 'server review-priority record');
assertIncludes('viteConfig', '/api/ai-ramin/feedback', 'Vite feedback route');
assertIncludes('productionServer', '/api/ai-ramin/feedback', 'production feedback route');
assertIncludes('aiRaminSection', 'AiRaminAnswerFeedback', 'feedback UI component');
assertIncludes('aiRaminSection', '/api/ai-ramin/feedback', 'feedback UI API call');
assertIncludes('aiRaminSection', 'Needs work', 'feedback UI negative affordance');
assertIncludes('schema', '"AI Ramin Live Feedback Log Entry"', 'feedback schema title');
assertIncludes('schema', '"needs_review"', 'feedback schema needs-review enum');
assertIncludes('gitignore', 'ai-ramin-section/evaluation/live-feedback.jsonl', 'local feedback log gitignore rule');

if (failures.length) {
  console.error('AI Ramin feedback contract check failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('AI Ramin feedback contract check passed.');
