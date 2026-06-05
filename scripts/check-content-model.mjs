import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const portfolioPath = join(root, 'src/data/portfolio.ts');
const navPath = join(root, 'src/data/nav.ts');
const contentPath = join(root, 'src/data/content.ts');
const projectsPath = join(root, 'src/data/projects.ts');
const teachingPath = join(root, 'src/data/teaching.ts');
const experiencePath = join(root, 'src/data/experience.ts');
const aiRaminPath = join(root, 'src/data/ai-ramin.ts');
const appPath = join(root, 'src/App.tsx');
const experienceSectionPath = join(root, 'src/sections/ExperienceEducation.tsx');
const bonusSectionPath = join(root, 'src/sections/Bonus.tsx');
const liquidGlassPath = join(root, 'react libraries/liquid-glass-js-main');
const rockModelPath = join(root, 'gl/global/rocks.glb');

const portfolio = [
  portfolioPath,
  navPath,
  contentPath,
  projectsPath,
  teachingPath,
  experiencePath,
  aiRaminPath,
]
  .filter((filePath) => existsSync(filePath))
  .map((filePath) => readFileSync(filePath, 'utf8'))
  .join('\n\n');
const app = readFileSync(appPath, 'utf8');
const experienceSection = readFileSync(experienceSectionPath, 'utf8');
const bonusSection = readFileSync(bonusSectionPath, 'utf8');

const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function assertIncludes(source, value, label = value) {
  assert(source.includes(value), `Missing ${label}`);
}

const navBlock = portfolio.match(/export const navLinks = \[([\s\S]*?)\] as const/)?.[1] ?? '';
const expectedNav = [
  ["Hero", "hero"],
  ["Experience & Education", "experience-education"],
  ["Projects", "projects"],
  ["Teaching, Speaking & Writing", "teaching-speaking-writing"],
  ["Contact", "contact"],
  ["Bonus", "bonus"],
  ["AI Ramin", "ai-ramin"],
];

assert(navBlock, 'Could not find navLinks block');
assert(!navBlock.includes("target: 'work'"), 'navLinks must not contain separate Work target');
assert(!navBlock.includes("target: 'qualifications'"), 'navLinks must not contain separate Qualifications target');
expectedNav.forEach(([label, target]) => {
  assertIncludes(navBlock, `{ label: '${label}', target: '${target}' }`, `nav item ${label}`);
});

assert(!app.includes("case 'work'"), 'ActivePortfolioSection must not contain separate work route');
assert(!app.includes("case 'qualifications'"), 'ActivePortfolioSection must not contain separate qualifications route');
assertIncludes(app, "case 'experience-education'", 'Experience & Education route');
assertIncludes(app, "case 'ai-ramin'", 'AI Ramin route');
assertIncludes(experienceSection, 'function ExperienceEducationSection', 'ExperienceEducationSection component');

[
  'productManagementWorkExperiences',
  'personalProjects',
  'qualifications',
  'teachingSpeakingWriting',
  'contactCta',
  'bonus',
  'aiRaminChatbot',
].forEach((key) => assertIncludes(portfolio, `${key}:`, `portfolioContent.${key}`));

[
  'Bayut',
  'SIDE',
  'Perkbox',
  'GroupM',
  'Cox Auto',
  'Ordnance Survey',
  'Deity AI',
  'ERM',
  'Tesla',
  'Imperial College',
  'University of Northampton',
  'AI Engineer Certification',
  'Professional Machine Learning Engineer',
  'Generative AI Leader',
  'MCP Advanced Topics',
  'MBTi Leadership Development Programme',
  'Qadam',
  'Dreamsea',
  'nsso',
  'RazinFlix',
  '24Seven Concierge',
  'AI Native Product OS',
  'Mass Social Wisdom Agent',
  'AI Costs Dashboard',
  'RAG Pipeline',
  'Transitioning to AI Product Management',
  'Full Product Development Process',
  'Existentially Viewing your Existential Crisis',
  'My Life Story',
  'The Proposition',
  'The Meaning of Life',
  'Framework of Metacognition',
  'Framework of Reality',
  'CLARITY . JUDGEMENT . TASTE . EMPATHY . VISION',
].forEach((name) => assertIncludes(portfolio, name, `required content item: ${name}`));

assert(existsSync(liquidGlassPath), 'liquid-glass-js-main must remain available');
assert(existsSync(rockModelPath), '3D rock model must remain available');
assertIncludes(bonusSection, "import('three')", 'lazy Three.js import for bonus rock');
assertIncludes(bonusSection, "import('three/examples/jsm/loaders/GLTFLoader.js')", 'lazy GLTFLoader import for bonus rock');
assertIncludes(bonusSection, 'new THREE.WebGLRenderer', 'WebGLRenderer usage for bonus rock');

if (failures.length) {
  console.error(`Content model check failed with ${failures.length} issue(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Content model check passed.');
