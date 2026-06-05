import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HANDLER_PATH = path.join(ROOT_DIR, 'server/aiRaminHandler.mjs');

const handlerSource = await readFile(HANDLER_PATH, 'utf8');

const requiredSnippets = [
  'function buildPromptContractRules',
  'PROMPT CONTRACT - output obligations:',
  'short_answer must be natural conversational Markdown',
  'It must never be raw JSON',
  'Do not expose local implementation details such as .md paths',
  'Do not lead with a generic Ramin biography',
  'suggested_next_action must be only the action sentence',
  'BEHAVIORAL CONTRACT:',
  'short_answer must be story-led',
  'Use one lead story, not a portfolio overview',
  'Do not answer a behavioral question with "Ramin Hoodeh is an AI Product Manager',
  'PRODUCT JUDGMENT CONTRACT:',
  'Separate directly supported portfolio proof from inferred fit',
  'STRONGEST PRODUCT CONTRACT:',
  'Give a best-supported ranking from the retrieved evidence',
  'EVIDENCE LOOKUP CONTRACT:',
  'Return human-readable proof, not local file paths or source metadata',
  'HIRING BRIEF CONTRACT:',
  'Contract reminder:',
  'Use the deterministic lead story as the answer spine',
  'do not expose local source paths or metadata',
];

const failures = requiredSnippets.filter((snippet) => !handlerSource.includes(snippet));

if (failures.length) {
  console.error('AI Ramin prompt contract check failed:');
  for (const failure of failures) {
    console.error(`- Missing prompt contract snippet: ${failure}`);
  }
  process.exit(1);
}

console.log('AI Ramin prompt contract check passed.');
