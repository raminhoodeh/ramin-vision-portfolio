import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { publicPages, routeAliases, sectionPathAliases } from '../src/seo/routes.mjs';
import { assertMaintenanceContacts } from './assert-maintenance-contacts.mjs';
import { maintenanceAssets, maintenanceHeaders } from '../site/maintenance.mjs';

const expectedAssets = Object.fromEntries(await Promise.all(Object.entries(maintenanceAssets).map(async ([pathname, asset]) => {
  const bytes = await readFile(new URL(`../dist/${asset.file}`, import.meta.url));
  return [pathname, { ...asset, sha384: createHash('sha384').update(bytes).digest('base64'), bytes: bytes.length }];
})));
const visualIntegrity = `sha384-${expectedAssets['/_maintenance/background.js'].sha384}`;

const { values } = parseArgs({ options: { output: { type: 'string' } } });
const paths = [...new Set([
  ...publicPages.map((page) => page.path).filter((value) => value !== '/'), ...Object.keys(routeAliases), ...Object.keys(sectionPathAliases),
  '/cv', '/cv/', '/CV', '/%63v', '/cv.html', '/resume.pdf', '/presentation', '/presentation/', '/index.html', '/404.html',
  '/api/ai-ramin', '/api/ai-ramin/feedback', '/api/visitor-journey', '/api/mass-social-wisdom/export', '/api/mass-social-wisdom/runs/fixture/process',
  '/assets/index-BwZku-Pg.js', '/.vite/manifest.json', '/social/home.png', '/initial-content.css', '/sitemap.xml', '/src/main.tsx', '/docs/portfolio-claims.json',
  '/projects?maintenance=false', '/projects.html', '/thoughts/books.html', '/anything-unlisted',
  '/_maintenance/', '/_maintenance/background.js.map', '/_maintenance/other.js', '/_maintenance/main.js',
  '/_maintenance/inter-latin.woff2/extra', '/_maintenance/hdr/city.hdr', '/_maintenance/backgroundXjs',
  '/_maintenance/%6fther.js', '/_maintenance/BACKGROUND.js',
])];
const jobs = [];
for (const host of ['https://ramin.vision', 'https://www.ramin.vision']) {
  jobs.push({ host, path: '/', status: 200 }, { host, path: '/?maintenance=false', status: 200 }, { host, path: '/robots.txt', status: 200, robots: true });
  for (const path of paths) jobs.push({ host, path, status: 503 });
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']) jobs.push({ host, path: '/api/ai-ramin', method, status: 503 });
  for (const [path, asset] of Object.entries(expectedAssets)) {
    jobs.push({ host, path, status: 200, asset }, { host, path, method: 'HEAD', status: 200, asset });
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']) jobs.push({ host, path, method, status: 503 });
  }
}
let index = 0;
const results = [];
async function worker() {
  while (index < jobs.length) {
    const job = jobs[index++];
    const failures = [];
    try {
      const response = await fetch(job.host + job.path, { method: job.method ?? 'GET', redirect: 'manual' });
      const bytes = Buffer.from(await response.arrayBuffer());
      const body = job.asset ? '' : bytes.toString();
      // Vercel completes OPTIONS at the platform with an empty 204. It still
      // receives our maintenance headers, exposes no resource and invokes no
      // API function (the inspected deployment contains no functions at all).
      const platformPreflight = job.method === 'OPTIONS' && response.status === 204;
      // Vercel denies this absent source-map path before the terminal page
      // route. Accept only the observed blank text denial for this exact URL;
      // a 403 elsewhere or any source-map/body content still fails validation.
      const platformSourceMapDenial = job.path === '/_maintenance/background.js.map'
        && response.status === 403 && bytes.length <= 1 && body.trim() === ''
        && response.headers.get('content-type') === 'text/plain';
      if (!platformPreflight && !platformSourceMapDenial && response.status !== job.status) failures.push(`status ${response.status} expected ${job.status}`);
      if (response.headers.get('location')) failures.push('unexpected redirect');
      if (response.headers.get('x-portfolio-availability') !== 'maintenance') failures.push('missing maintenance header');
      if (!response.headers.get('cache-control')?.includes('no-store')) failures.push('cacheable response');
      if (!response.headers.get('x-robots-tag')?.includes('noindex')) failures.push('missing noindex');
      if (response.headers.get('x-content-type-options') !== 'nosniff') failures.push('missing nosniff');
      if (response.headers.get('content-security-policy') !== maintenanceHeaders['Content-Security-Policy']) failures.push('unexpected CSP');
      if (platformPreflight || job.method === 'HEAD') {
        if (bytes.length) failures.push('HEAD/preflight must have no body');
      } else if (platformSourceMapDenial) {
        // No maintenance HTML is expected from this platform-level denial.
      } else if (job.asset) {
        if (response.headers.get('content-type') !== job.asset.contentType) failures.push('unexpected asset content type');
        if (bytes.length !== job.asset.bytes || createHash('sha384').update(bytes).digest('base64') !== job.asset.sha384) failures.push('asset differs from reviewed build');
      } else if (job.robots) {
        if (body !== 'User-agent: *\nDisallow: /\n') failures.push('robots');
      } else {
        if (!body.includes('Under construction') || !body.includes('Ramin Hoodeh')) failures.push('missing maintenance content');
        try { assertMaintenanceContacts(body, { requireVisual: true, expectedIntegrity: visualIntegrity }); }
        catch (error) { failures.push(`Maintenance contact/payload policy: ${error.message}`); }
      }
      results.push({ url: job.host + job.path, method: job.method ?? 'GET', status: response.status, platformPreflight, platformSourceMapDenial, failures });
    } catch (error) { results.push({ url: job.host + job.path, failures: [error.message] }); }
  }
}
await Promise.all(Array.from({ length: 8 }, worker));
const failed = results.filter((entry) => entry.failures.length);
const report = { checked: results.length, passed: results.length - failed.length, failed, emptyPlatformPreflights: results.filter((entry) => entry.platformPreflight).length, platformSourceMapDenials: results.filter((entry) => entry.platformSourceMapDenial).length, checkedAt: new Date().toISOString() };
if (values.output) await writeFile(values.output, JSON.stringify({ report, results }, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
assert.equal(failed.length, 0, 'Public pages, document/asset paths and APIs must stay locked.');
