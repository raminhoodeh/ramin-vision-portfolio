import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { publicPages, routeAliases, sectionPathAliases } from '../src/seo/routes.mjs';

const { values } = parseArgs({ options: { output: { type: 'string' } } });
const paths = [...new Set([
  ...publicPages.map((page) => page.path).filter((value) => value !== '/'), ...Object.keys(routeAliases), ...Object.keys(sectionPathAliases),
  '/cv', '/cv/', '/CV', '/%63v', '/cv.html', '/resume.pdf', '/presentation', '/presentation/', '/index.html', '/404.html',
  '/api/ai-ramin', '/api/ai-ramin/feedback', '/api/visitor-journey', '/api/mass-social-wisdom/export', '/api/mass-social-wisdom/runs/fixture/process',
  '/assets/index-BwZku-Pg.js', '/.vite/manifest.json', '/social/home.png', '/initial-content.css', '/sitemap.xml', '/src/main.tsx', '/docs/portfolio-claims.json',
  '/projects?maintenance=false', '/projects.html', '/thoughts/books.html', '/anything-unlisted',
])];
const jobs = [];
for (const host of ['https://ramin.vision', 'https://www.ramin.vision']) {
  jobs.push({ host, path: '/', status: 200 }, { host, path: '/?maintenance=false', status: 200 }, { host, path: '/robots.txt', status: 200, robots: true });
  for (const path of paths) jobs.push({ host, path, status: 503 });
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']) jobs.push({ host, path: '/api/ai-ramin', method, status: 503 });
}
let index = 0;
const results = [];
async function worker() {
  while (index < jobs.length) {
    const job = jobs[index++];
    const failures = [];
    try {
      const response = await fetch(job.host + job.path, { method: job.method ?? 'GET', redirect: 'manual' });
      const body = await response.text();
      // Vercel completes OPTIONS at the platform with an empty 204. It still
      // receives our maintenance headers, exposes no resource and invokes no
      // API function (the inspected deployment contains no functions at all).
      const platformPreflight = job.method === 'OPTIONS' && response.status === 204;
      if (!platformPreflight && response.status !== job.status) failures.push(`status ${response.status} expected ${job.status}`);
      if (response.headers.get('location')) failures.push('unexpected redirect');
      if (response.headers.get('x-portfolio-availability') !== 'maintenance') failures.push('missing maintenance header');
      if (!response.headers.get('cache-control')?.includes('no-store')) failures.push('cacheable response');
      if (!response.headers.get('x-robots-tag')?.includes('noindex')) failures.push('missing noindex');
      if (platformPreflight || job.method === 'HEAD') {
        if (body) failures.push('HEAD/preflight must have no body');
      } else if (job.robots) {
        if (body !== 'User-agent: *\nDisallow: /\n') failures.push('robots');
      } else {
        if (!body.includes('Under construction') || !body.includes('Ramin Hoodeh')) failures.push('missing maintenance content');
        if (/<(a|script|nav|button|iframe|form)\b|drive\.google|docs\.google|View CV|Read my CV/i.test(body)) failures.push('public navigation/code/CV leaked');
      }
      results.push({ url: job.host + job.path, method: job.method ?? 'GET', status: response.status, platformPreflight, failures });
    } catch (error) { results.push({ url: job.host + job.path, failures: [error.message] }); }
  }
}
await Promise.all(Array.from({ length: 8 }, worker));
const failed = results.filter((entry) => entry.failures.length);
const report = { checked: results.length, passed: results.length - failed.length, failed, emptyPlatformPreflights: results.filter((entry) => entry.platformPreflight).length, checkedAt: new Date().toISOString() };
if (values.output) await writeFile(values.output, JSON.stringify({ report, results }, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
assert.equal(failed.length, 0, 'Public pages, document/asset paths and APIs must stay locked.');
