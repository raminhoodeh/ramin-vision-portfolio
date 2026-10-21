import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const cache = new Map();
const source = (file) => ts.createSourceFile(file, fs.readFileSync(path.join(root, file), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

function evaluate(code, localRequire = require) {
  const module = { exports: {} };
  const compiled = ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(compiled, { module, exports: module.exports, require: localRequire });
  return module.exports;
}

// Render only the new pure components: no application, browser, video or model calls.
function load(file) {
  file = path.resolve(root, file);
  if (cache.has(file)) return cache.get(file);
  const exports = evaluate(fs.readFileSync(file, 'utf8'), (name) => {
    if (name.endsWith('.css')) return {};
    if (!name.startsWith('.')) return require(name);
    const base = path.resolve(path.dirname(file), name);
    const resolved = [base, `${base}.ts`, `${base}.tsx`].find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
    assert.ok(resolved, `Cannot resolve ${name} from ${file}`);
    return load(resolved);
  });
  cache.set(file, exports);
  return exports;
}

function functionText(ast, name) {
  const declaration = ast.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === name);
  assert.ok(declaration, `Missing function ${name}`);
  return declaration.getText(ast).replace(/^export\s+/, '');
}

function variable(ast, name) {
  const declaration = ast.statements.filter(ts.isVariableStatement).flatMap((node) => [...node.declarationList.declarations]).find((node) => node.name.getText(ast) === name);
  assert.ok(declaration, `Missing variable ${name}`);
  return declaration;
}

const escape = (value) => renderToStaticMarkup(React.createElement('span', null, value)).replace(/^<span>|<\/span>$/g, '');
const { professionalStories } = load('src/data/professionalStories.ts');
const { ProfessionalStories } = load('src/sections/ProfessionalStories.tsx');
assert.equal(professionalStories.length, 2, 'Publish the two sourced professional stories');
const selection = renderToStaticMarkup(React.createElement(ProfessionalStories));
for (const story of professionalStories) {
  assert.ok(selection.includes(`href="/work/${story.slug}"`), `Discoverable ${story.slug} story`);
  const reader = renderToStaticMarkup(React.createElement(ProfessionalStories, { activeSlug: story.slug }));
  for (const field of ['title', 'period', 'highlight', 'problem', 'ownership', 'limitations']) {
    assert.ok(story[field]?.trim(), `${story.slug}: populated ${field}`);
    assert.ok(reader.includes(escape(story[field])), `${story.slug}: rendered ${field}`);
  }
  assert.ok(story.sourceRefs.length >= 2, `${story.slug}: CV and canonical provenance`);
}

const projectsAst = source('src/data/projects.ts');
let projects = variable(projectsAst, 'works').initializer;
while (ts.isAsExpression(projects) || ts.isSatisfiesExpression(projects)) projects = projects.expression;
assert.ok(ts.isArrayLiteralExpression(projects));
const projectTitles = projects.elements.map((node) => node.properties.find((item) => ts.isPropertyAssignment(item) && item.name.getText(projectsAst) === 'title').initializer.text);
const { projectBriefs, getProjectBrief } = load('src/data/projectBriefs.ts');
const { ProjectBrief } = load('src/sections/Projects/ProjectBrief.tsx');
assert.equal(projectTitles.length, 9);
assert.deepEqual(Object.keys(projectBriefs).sort(), [...projectTitles].sort(), 'All nine actual project cases have a brief');
for (const title of projectTitles) {
  const brief = getProjectBrief(title);
  const html = renderToStaticMarkup(React.createElement(ProjectBrief, { title }));
  assert.equal((html.match(/<dt>/g) ?? []).length, 5, `${title}: five decision fields`);
  for (const field of ['who', 'owned', 'decision', 'current', 'evidence']) {
    assert.ok(brief[field]?.trim(), `${title}: populated ${field}`);
    assert.ok(html.includes(escape(brief[field])), `${title}: rendered ${field}`);
  }
  assert.ok(brief.links.length, `${title}: source link`);
}
assert.ok(getProjectBrief('AI-Native Product OS'), 'The thesis reader title resolves to its project brief');

// Evaluate the real route parser with light case-study fixtures, rather than importing App.
const app = source('src/App.tsx');
const text = source('src/lib/text.ts');
const appConstants = ['THESIS_CASE_STUDY_ID', 'PRODUCT_THESIS_PATH', 'METACOGNITION_PATH', 'sectionPathByTarget', 'sectionAliases', 'projectSubsectionBySlug', 'thoughtsSubsectionBySlug', 'legacyDomIdRoutes', 'projectCaseStudyBySlug'];
const parserFunctions = ['normalizeRouteSegment', 'getRouteSegments', 'thesisRoute', 'sectionRoute', 'scrollRoute', 'caseStudyPath', 'parseSegmentsToRoute', 'isLegacyHashRoute', 'parsePortfolioLocation'];
const fixtureCode = [
  functionText(text, 'slugifyTitle'),
  `const projectCaseStudyEntries = ${JSON.stringify(projectTitles)}.map(title => ({ title, id: 'project-' + slugifyTitle(title) }));`,
  "const METACOGNITION_DEEP_DIVE_ID = 'framework-of-metacognition';",
  'const METACOGNITION_SENTINEL = { id: METACOGNITION_DEEP_DIVE_ID };',
  "const caseStudyByDeepDiveSlug = new Map([['ai-native-product-os', { id: 'writeup-ai-native-product-os' }]]);",
  ...appConstants.map((name) => `const ${variable(app, name).getText(app)};`),
  ...parserFunctions.map((name) => functionText(app, name)),
  'module.exports = { parsePortfolioLocation };',
].join('\n');
const { parsePortfolioLocation } = evaluate(fixtureCode);
const cases = [
  ['/work/side', '', { canonicalPath: '/work/side', documentPage: 'side', section: 'experience-education' }],
  ['/work/vivup', '', { canonicalPath: '/work/vivup', documentPage: 'vivup', section: 'experience-education' }],
  ['/product-method', '#method-diagram', { canonicalPath: '/product-method', documentPage: 'method' }],
  ['/talks/disx-dubai', '#worked-example', { canonicalPath: '/talks/disx-dubai', documentPage: 'disx' }],
  ['/product-thesis', '#framework', { canonicalPath: '/product-thesis', caseId: 'writeup-ai-native-product-os' }],
  ['/', '#/projects/tools', { canonicalPath: '/projects/tools', section: 'projects', scrollTargetId: 'projects-tools' }],
  ['/projects/nsso', '', { canonicalPath: '/projects/nsso', caseId: 'project-nsso' }],
  ['/thoughts/nsso', '', { canonicalPath: '/projects/nsso', caseId: 'project-nsso' }],
  ['/nsso', '', { canonicalPath: '/projects/nsso', caseId: 'project-nsso' }],
  ['/', '#projects/nsso', { canonicalPath: '/projects/nsso', caseId: 'project-nsso' }],
  ['/projects/ai-native-product-os', '', { canonicalPath: '/product-thesis', caseId: 'writeup-ai-native-product-os' }],
  ['/thoughts/framework-of-metacognition', '', { canonicalPath: '/thoughts/framework-of-metacognition', caseId: 'framework-of-metacognition' }],
  ['/', '#contact', { canonicalPath: '/contact', section: 'contact' }],
];
for (const [pathname, hash, expected] of cases) {
  const route = parsePortfolioLocation(pathname, hash);
  for (const [key, value] of Object.entries(expected)) assert.equal(key === 'caseId' ? route.caseStudy?.id : route[key], value, `${pathname}${hash}: ${key}`);
}

console.log(`Next-priority checks passed: two professional story readers, all nine project briefs, and ${cases.length} actual-parser route/anchor cases. Browser layout and destination access are separate checks.`);
