import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

// Exercise the actual renderers, not a parallel copy of the page text. Browser
// layout, destination permissions and video playback remain separate checks.
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' });
let checks = 0;
const check = (value, message) => { assert.ok(value, message); checks++; };
const render = async (file, name, props = {}) => {
  const module = await server.ssrLoadModule(file);
  return renderToStaticMarkup(React.createElement(module[name], props));
};
function checkDocument(html, label) {
  check((html.match(/<h1\b/g) ?? []).length === 1, `${label}: one primary heading`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  check(new Set(ids).size === ids.length, `${label}: unique anchors`);
  for (const [, href] of html.matchAll(/\bhref="([^"]+)"/g)) {
    check(/^(?:\/[^/]|\/$|#|https:\/\/)/.test(href), `${label}: intentional public/fragment/secure link`);
    check(!/undefined|javascript:|\[object/.test(href), `${label}: no malformed destination`);
  }
}
try {
  const learning = await server.ssrLoadModule('/src/data/courseLearning.ts');
  for (const framework of Object.keys(learning.courseLearning)) {
    const html = await render('/src/sections/TeachingWriting/CourseLearningDetails.tsx', 'CourseLearningDetails', { framework });
    check((html.match(/<details>/g) ?? []).length === 2, `${framework}: preview and exercise are available`);
    check((html.match(/<li>/g) ?? []).length === 5, `${framework}: three outcomes and two actual platform previews`);
    check(/<summary>[^<]+<\/summary>/.test(html), `${framework}: native keyboard-operable disclosure`);
    check(html.includes('platform assignments may differ') && html.includes('written introduction'), `${framework}: portfolio preview is distinguished from platform content`);
    const sampleHref = learning.courseLearning[framework].sampleHref.replaceAll('&', '&amp;');
    check(html.includes(`href="${sampleHref}"`), `${framework}: the sample artifact has a real route`);
  }
  const overview = await render('/src/sections/TeachingWriting/ThoughtsOverview.tsx', 'ThoughtsOverview', { caseStudies: [], onOpen() {} });
  checkDocument(overview, 'Teaching overview');
  const anchors = ['thoughts-courses', 'thoughts-disx', 'thoughts-method', 'thoughts-talks', 'thoughts-foundations'];
  const positions = anchors.map((id) => overview.indexOf(`id="${id}"`));
  check(positions.every((position) => position >= 0) && positions.every((position, index) => index === 0 || position > positions[index - 1]), 'Current courses, DISx and method precede earlier talks and personal foundations');
  const evidence = await server.ssrLoadModule('/src/data/teachingEvidence.ts');
  check(overview.indexOf(`<h4>${evidence.aiProductCourseEvidence.udemy.title}`) < overview.indexOf(`<h4>${evidence.productCourseEvidence.title}`), 'AI course leads the course selection');
  check(overview.includes(evidence.aiProductCourseEvidence.coursera.provider) && overview.includes('Coursera'), 'Coursera provider is rendered');
  check((overview.match(/class="teaching-learning-details"/g) ?? []).length === 2, 'Both actual course cards show their learning detail');
  const about = await render('/src/sections/TeachingWriting/AboutWritingPage.tsx', 'AboutWritingPage');
  checkDocument(about, 'About and writing');
  check((about.match(/class="about-writing-page__book"/g) ?? []).length === 2, 'Both books are visible without selecting a cover');
  check((about.match(/<blockquote>/g) ?? []).length === 2, 'Both books have short readable excerpts');
  check(about.includes('Read the supplied manuscript') && about.includes('Listen to the supplied audiobook'), 'Reading and audio destinations are exposed');
  check(/href="https:\/\/www\.amazon\.co\.uk\/[^\"]+"[^>]*>View the paperback on Amazon/.test(about), 'Amazon label points to Amazon');
  check(/href="https:\/\/author\.vision\/"[^>]*>Visit the author site/.test(about), 'Author-site label accurately describes its destination');
  const metacognition = await render('/src/sections/TeachingWriting/MetacognitionDeepDive.tsx', 'MetacognitionReadingCopy');
  checkDocument(metacognition, 'Metacognition reading copy');
  check(metacognition.includes('market conditions') && metacognition.includes('vision itself'), 'The personal framework permits revision at higher levels');
  check(!metacognition.includes('the break is never at layer seven') && !metacognition.includes('the entire field, across religion'), 'Universal diagnostic and philosophy claims are removed');
  const talk = await render('/src/sections/DisxTalkPage.tsx', 'DisxTalkPage');
  checkDocument(talk, 'DISx');
  check(talk.includes('not a recording transcription') && talk.includes('hypothetical simulation'), 'The talk identifies prepared script and hypothetical example');
  check(talk.includes('not guarantees of correctness'), 'Model age and temperature are not treated as reliability proof');
  console.log(`Teaching content: ${checks} runtime rendering checks passed. Public video playback, learner testimonials, book-store access and conference media remain source/browser checks.`);
} finally { await server.close(); }
