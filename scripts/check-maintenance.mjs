import assert from 'node:assert/strict';
import { readdir, readFile, mkdir, writeFile, mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildMaintenance } from './build-site.mjs';
import { maintenanceEnabled, maintenanceRoutes, maintenanceResponse } from '../site/maintenance.mjs';
import { homepageBio } from '../site/maintenanceDocument.mjs';
import { publicPages, routeAliases, sectionPathAliases } from '../src/seo/routes.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
assert.equal(maintenanceEnabled, true, 'This verification is for the locked public site.');
const bio = homepageBio(root);
const html = await readFile(path.join(root, 'dist/index.html'), 'utf8');
assert.ok(html.indexOf(bio.name) < html.indexOf('id="construction-notice"'));
assert.ok(html.indexOf(bio.experience) < html.indexOf('id="construction-notice"'), 'Notice is beneath the name and existing bio');
assert.match(html, />Under construction<|>Under construction<\/h2>|<\/span>Under construction<\/h2>/);
assert.doesNotMatch(html, /<(?:a|script|iframe|form|button|nav)\b|\b(?:src|href)\s*=|\/cv|drive\.google|docs\.google|View CV|Read my CV/i, 'No navigation, application code or CV access in public HTML');
assert.match(html, /noindex, nofollow, noarchive, nosnippet/);
assert.deepEqual((await readdir(path.join(root, 'dist'))).sort(), ['index.html', 'robots.txt']);
assert.deepEqual((await readdir(path.join(root, '.vercel/output'))).sort(), ['config.json', 'static']);
assert.deepEqual((await readdir(path.join(root, '.vercel/output/static'))).sort(), ['index.html', 'robots.txt']);
const config = JSON.parse(await readFile(path.join(root, '.vercel/output/config.json'), 'utf8'));
assert.deepEqual(config, { version: 3, routes: maintenanceRoutes() });
assert.ok(!config.routes.some((route) => route.handle || route.check || route.continue), 'No filesystem/API bypass before denial');
assert.equal(config.routes.find((route) => new RegExp(route.src).test('/robots.txt'))?.dest, '/robots.txt');

// A build over a dirty generated directory must remove previously public
// readers, chunks, manifests and serverless functions rather than hide links.
const fixture = await mkdtemp(path.join(os.tmpdir(), 'portfolio-maintenance-'));
try {
  await mkdir(path.join(fixture, 'dist/assets'), { recursive: true });
  await writeFile(path.join(fixture, 'dist/projects.html'), 'old private page');
  await writeFile(path.join(fixture, 'dist/assets/old.js'), 'old application');
  await mkdir(path.join(fixture, '.vercel/output/functions/api.func'), { recursive: true });
  await writeFile(path.join(fixture, '.vercel/output/functions/api.func/index.js'), 'old function');
  await buildMaintenance(fixture);
  assert.deepEqual((await readdir(path.join(fixture, 'dist'))).sort(), ['index.html', 'robots.txt']);
  assert.deepEqual((await readdir(path.join(fixture, '.vercel/output'))).sort(), ['config.json', 'static']);
} finally { await rm(fixture, { recursive: true, force: true }); }

const paths = [...new Set([
  ...publicPages.map((page) => page.path).filter((value) => value !== '/'),
  ...Object.keys(routeAliases), ...Object.keys(sectionPathAliases),
  '/cv', '/cv/', '/CV', '/%63v', '/cv.html', '/resume.pdf', '/presentation', '/presentation/', '/index.html', '/404.html',
  '/api/ai-ramin', '/api/ai-ramin/feedback', '/api/visitor-journey', '/api/mass-social-wisdom/export', '/api/mass-social-wisdom/runs/fixture/process',
  '/assets/index-BwZku-Pg.js', '/.vite/manifest.json', '/social/home.png', '/initial-content.css', '/sitemap.xml', '/src/main.tsx', '/docs/portfolio-claims.json',
  '/projects?maintenance=false', '/projects.html', '/thoughts/books.html', '/anything-unlisted',
])];
for (const pathname of paths) {
  const route = config.routes.find((route) => (!route.methods || route.methods.includes('GET')) && new RegExp(route.src).test(new URL(pathname, 'https://example.com').pathname));
  assert.equal(route?.status, 503, `Terminal edge denial: ${pathname}`);
}
assert.equal(maintenanceResponse('/', 'POST').status, 503);

const child = spawn(process.execPath, ['server.mjs'], { cwd: root, env: { ...process.env, PORT: '0' }, stdio: ['ignore', 'pipe', 'pipe'] });
let errors = '';
child.stderr.on('data', (chunk) => { errors += chunk; });
try {
  const origin = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Local maintenance server did not start: ${errors}`)), 15_000);
    child.on('exit', (code) => { clearTimeout(timeout); reject(new Error(`Server exited ${code}: ${errors}`)); });
    child.stdout.on('data', (chunk) => {
      const match = String(chunk).match(/http:\/\/127\.0\.0\.1:\d+/);
      if (match) { clearTimeout(timeout); resolve(match[0]); }
    });
  });
  const home = await fetch(origin);
  assert.equal(home.status, 200);
  assert.equal(await home.text(), html);
  assert.equal(home.headers.get('x-portfolio-availability'), 'maintenance');
  assert.equal((await fetch(`${origin}/robots.txt`)).status, 200);
  for (const pathname of paths) {
    const response = await fetch(origin + pathname, { redirect: 'manual' });
    assert.equal(response.status, 503, `Server denial: ${pathname}`);
    assert.equal(response.headers.get('location'), null, `No document/legacy redirect: ${pathname}`);
    assert.match(response.headers.get('cache-control'), /no-store/);
    assert.match(response.headers.get('x-robots-tag'), /noindex/);
    assert.equal(await response.text(), html, `Only maintenance content: ${pathname}`);
  }
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']) {
    const response = await fetch(`${origin}/api/ai-ramin`, { method, redirect: 'manual' });
    assert.equal(response.status, 503, `API blocked for ${method}`);
    if (method === 'HEAD') assert.equal(await response.text(), '');
  }
  console.log(`Maintenance passed: homepage-only output, stale artifact removal, ${paths.length} edge/server blocked paths, all API methods, no CV/navigation/application payload.`);
} finally { child.kill('SIGTERM'); }
