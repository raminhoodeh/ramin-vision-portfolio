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
const readSource = (file) => ts.createSourceFile(file, fs.readFileSync(path.join(root, file), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const workSource = readSource('src/sections/ExperienceEducation.tsx');
const placeholderSource = readSource('src/lib/placeholder.ts');

function readFunction(source, name) {
  const declaration = source.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === name);
  assert.ok(declaration, `Missing ${name}`);
  return declaration.getText(source).replace(/^export\s+/, '');
}

// Exercise the actual detail renderer without loading video/WebGL modules.
const module = { exports: {} };
const compiled = ts.transpileModule([
  readFunction(placeholderSource, 'isPlaceholderValue'),
  readFunction(placeholderSource, 'publicWorkValue'),
  ...['publicWorkItems', 'getWorkPublicDetails', 'WorkListBlock', 'WorkPublicDetails'].map((name) => readFunction(workSource, name)),
  'module.exports = { getWorkPublicDetails, WorkPublicDetails };',
].join('\n'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
vm.runInNewContext(compiled, { module, exports: module.exports, require });
const { getWorkPublicDetails, WorkPublicDetails } = module.exports;

const contentSource = readSource('src/data/content.ts');
const property = (node, name) => node.properties.find((item) => ts.isPropertyAssignment(item) && item.name.getText(contentSource).replace(/['"]/g, '') === name)?.initializer;
function literal(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(literal);
  if (ts.isObjectLiteralExpression(node)) return Object.fromEntries(node.properties.map((item) => [item.name.getText(contentSource), literal(item.initializer)]));
  throw new Error(`Expected literal work data, got ${node.getText(contentSource)}`);
}

function workEntry(companyName) {
  let found;
  function visit(node) {
    if (ts.isObjectLiteralExpression(node) && property(node, 'companyName')?.text === companyName) found = node;
    ts.forEachChild(node, visit);
  }
  visit(contentSource);
  assert.ok(found, `Missing ${companyName} fixture`);
  return Object.fromEntries(['mainAchievements', 'productDetails', 'processesIntroducedManagerial', 'productsWorkedOn', 'links'].map((name) => [name, literal(property(found, name))]));
}

const side = workEntry('SIDE');
assert.ok(side.mainAchievements.length > 3, 'SIDE must cover the previously hidden fourth result');
for (const compact of [false, true]) {
  const markup = renderToStaticMarkup(React.createElement(WorkPublicDetails, { entry: side, compact }));
  side.mainAchievements.forEach((achievement) => assert.ok(markup.includes(achievement), `Missing result: ${achievement}`));
}

const bayut = workEntry('Bayut');
const bayutMarkup = renderToStaticMarkup(React.createElement(WorkPublicDetails, { entry: bayut }));
assert.ok(bayutMarkup.includes('Public remit'));
assert.ok(bayutMarkup.includes(bayut.productDetails[0].description));
assert.ok(!/confidential/i.test(bayutMarkup), 'Confidential placeholders must not be rendered');
const restricted = { ...bayut, mainAchievements: ['[Confidential] Restricted achievement'], productDetails: [{ description: '[Confidential] Restricted product' }], processesIntroducedManagerial: ['Confidential'] };
const restrictedMarkup = renderToStaticMarkup(React.createElement(WorkPublicDetails, { entry: restricted }));
assert.ok(!/Restricted|Confidential/.test(restrictedMarkup), 'A confidential prefix must not be stripped to reveal its contents');

const groupm = workEntry('WPP Media');
const groupmMarkup = renderToStaticMarkup(React.createElement(WorkPublicDetails, { entry: groupm, compact: true }));
groupm.links.forEach((link) => assert.ok(groupmMarkup.includes(`href="${link.url.replaceAll('&', '&amp;')}"`), `Missing public link: ${link.label}`));
const filteredLinks = getWorkPublicDetails({ ...groupm, links: [...groupm.links, { label: 'Unsafe', url: 'javascript:alert(1)', status: 'ready' }, { label: 'Draft', url: 'https://example.com/draft', status: 'missing' }] }).links;
assert.equal(filteredLinks.length, groupm.links.length, 'Only published HTTP(S) links should be exposed');

console.log('Priority-one Work UI passed: complete results in both layouts, safe public remit, confidential-content exclusion, and published proof links.');
