import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFile, readdir, readFile, mkdir, writeFile, mkdtemp, rm, symlink } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildMaintenance } from './build-site.mjs';
import { maintenanceAssets, maintenanceEnabled, maintenanceHeaders, maintenanceRoutes, maintenanceResponse } from '../site/maintenance.mjs';
import { homepageBio } from '../site/maintenanceDocument.mjs';
import { publicPages, routeAliases, sectionPathAliases } from '../src/seo/routes.mjs';
import { assertMaintenanceContacts, checkMaintenanceContactPolicy } from './assert-maintenance-contacts.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
assert.equal(maintenanceEnabled, true, 'This verification is for the locked public site.');
const bio = homepageBio(root);
const html = await readFile(path.join(root, 'dist/index.html'), 'utf8');
assert.ok(html.indexOf(bio.name) < html.indexOf('id="construction-notice"'));
assert.ok(html.indexOf(bio.experience) < html.indexOf('id="construction-notice"'), 'Notice is beneath the name and existing bio');
assert.match(html, />Under construction<|>Under construction<\/h2>|<\/span>Under construction<\/h2>/);
const rejectedContactFixtures = checkMaintenanceContactPolicy();
const visualBundle = await readFile(path.join(root, 'dist/_maintenance/background.js'));
const visualIntegrity = `sha384-${createHash('sha384').update(visualBundle).digest('base64')}`;
assertMaintenanceContacts(html, { requireVisual: true, expectedIntegrity: visualIntegrity });
assert.match(html, /noindex, nofollow, noarchive, nosnippet/);
assert.ok(html.includes('<meta name="portfolio-availability" content="maintenance" />'), 'A built page identifies itself as the reviewed maintenance document');
const expectedFiles = ['index.html', 'robots.txt', ...Object.values(maintenanceAssets).map(({ file }) => file)].sort();
async function outputFiles(directory) {
  return (await readdir(directory, { recursive: true, withFileTypes: true })).filter((entry) => entry.isFile())
    .map((entry) => path.relative(directory, path.join(entry.parentPath ?? entry.path, entry.name))).sort();
}
assert.deepEqual(await outputFiles(path.join(root, 'dist')), expectedFiles);
assert.deepEqual((await readdir(path.join(root, '.vercel/output'))).sort(), ['config.json', 'static']);
assert.deepEqual(await outputFiles(path.join(root, '.vercel/output/static')), expectedFiles);
for (const asset of Object.values(maintenanceAssets)) {
  const bytes = await readFile(path.join(root, 'dist', asset.file));
  assert.ok(bytes.length > 0, `Decorative artifact is present: ${asset.file}`);
  assert.deepEqual(await readFile(path.join(root, '.vercel/output/static', asset.file)), bytes, `Deployment artifact matches: ${asset.file}`);
  if (asset.contentType === 'font/woff2') assert.equal(bytes.subarray(0, 4).toString(), 'wOF2', `Actual WOFF2 font: ${asset.file}`);
}
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
  assert.deepEqual(await outputFiles(path.join(fixture, 'dist')), expectedFiles);
  assert.deepEqual((await readdir(path.join(fixture, '.vercel/output'))).sort(), ['config.json', 'static']);
} finally { await rm(fixture, { recursive: true, force: true }); }

// Exercise the actual guard in a fresh server rooted at an isolated fixture.
// A pre-maintenance dist/index.html must never be served just because it exists.
// The real generated artifacts are untouched, and a new process avoids the
// guard's intentional per-process HTML cache masking this regression.
async function assertStaleDocumentClosed(candidate, label) {
  const staleRoot = await mkdtemp(path.join(os.tmpdir(), 'portfolio-stale-maintenance-'));
  let staleChild;
  try {
    for (const directory of ['site', 'server', 'src/data', 'dist']) await mkdir(path.join(staleRoot, directory), { recursive: true });
    for (const file of ['server/siteMaintenance.mjs', 'site/maintenance.mjs', 'site/maintenanceDocument.mjs', 'src/data/homepage.ts']) {
      await copyFile(path.join(root, file), path.join(staleRoot, file));
    }
    await symlink(path.join(root, 'node_modules'), path.join(staleRoot, 'node_modules'), 'dir');
    await writeFile(path.join(staleRoot, 'dist/index.html'), candidate);
    await writeFile(path.join(staleRoot, 'guard-server.mjs'), `import http from 'node:http';
import { blockWhileMaintenance } from './server/siteMaintenance.mjs';
const server = http.createServer((req, res) => { if (!blockWhileMaintenance(req, res)) res.end('UNLOCKED_PROVIDER_HANDLER_SENTINEL'); });
server.listen(0, '127.0.0.1', () => console.log('http://127.0.0.1:' + server.address().port));
`);
    staleChild = spawn(process.execPath, ['guard-server.mjs'], { cwd: staleRoot, stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    staleChild.stderr.on('data', (chunk) => { stderr += chunk; });
    const origin = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(`Stale-build guard fixture failed to start: ${stderr}`)), 15_000);
      staleChild.on('exit', (code) => { clearTimeout(timeout); reject(new Error(`Stale-build guard fixture exited ${code}: ${stderr}`)); });
      staleChild.stdout.on('data', (chunk) => {
        const match = String(chunk).match(/http:\/\/127\.0\.0\.1:\d+/);
        if (match) { clearTimeout(timeout); resolve(match[0]); }
      });
    });
    for (const pathname of ['/', '/cv', '/api/ai-ramin', '/_maintenance/background.js']) {
      const response = await fetch(origin + pathname);
      assert.equal(response.status, pathname === '/' ? 200 : 503, `${label}: ${pathname} stays closed`);
      const body = await response.text();
      assert.match(body, /Under construction/);
      assert.doesNotMatch(body, /OLD_UNLOCKED_PORTFOLIO_SENTINEL|UNLOCKED_PROVIDER_HANDLER_SENTINEL/, `${label}: stale app/provider content cannot leak`);
      assertMaintenanceContacts(body);
    }
  } finally {
    staleChild?.kill('SIGTERM');
    await rm(staleRoot, { recursive: true, force: true });
  }
}
await assertStaleDocumentClosed('<!doctype html><html><body><p>Under construction</p><main>OLD_UNLOCKED_PORTFOLIO_SENTINEL</main><script src="/assets/old.js"></script></body></html>', 'Old unlocked document without maintenance marker');
await assertStaleDocumentClosed('<!doctype html><html><head><meta name="portfolio-availability" content="maintenance" /></head><body>OLD_UNLOCKED_PORTFOLIO_SENTINEL</body></html>', 'Incomplete marked document without construction notice');

const paths = [...new Set([
  ...publicPages.map((page) => page.path).filter((value) => value !== '/'),
  ...Object.keys(routeAliases), ...Object.keys(sectionPathAliases),
  '/cv', '/cv/', '/CV', '/%63v', '/cv.html', '/resume.pdf', '/presentation', '/presentation/', '/index.html', '/404.html',
  '/api/ai-ramin', '/api/ai-ramin/feedback', '/api/visitor-journey', '/api/mass-social-wisdom/export', '/api/mass-social-wisdom/runs/fixture/process',
  '/assets/index-BwZku-Pg.js', '/.vite/manifest.json', '/social/home.png', '/initial-content.css', '/sitemap.xml', '/src/main.tsx', '/docs/portfolio-claims.json',
  '/projects?maintenance=false', '/projects.html', '/thoughts/books.html', '/anything-unlisted',
  '/_maintenance/', '/_maintenance/background.js.map', '/_maintenance/other.js', '/_maintenance/main.js',
  '/_maintenance/inter-latin.woff2/extra', '/_maintenance/hdr/city.hdr', '/_maintenance/backgroundXjs',
  '/_maintenance/%6fther.js', '/_maintenance/BACKGROUND.js',
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
  assert.equal(home.headers.get('content-security-policy'), maintenanceHeaders['Content-Security-Policy']);
  assert.equal((await fetch(`${origin}/robots.txt`)).status, 200);
  for (const [pathname, asset] of Object.entries(maintenanceAssets)) {
    const response = await fetch(origin + pathname);
    assert.equal(response.status, 200, `Reviewed decorative asset: ${pathname}`);
    assert.equal(response.headers.get('content-type'), asset.contentType);
    assert.equal(response.headers.get('content-security-policy'), maintenanceHeaders['Content-Security-Policy']);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), await readFile(path.join(root, 'dist', asset.file)));
    const head = await fetch(origin + pathname, { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']) {
      assert.equal(maintenanceResponse(pathname, method).status, 503);
      const blocked = await fetch(origin + pathname, { method });
      assert.equal(blocked.status, 503, `No asset mutation/fallthrough: ${method} ${pathname}`);
      assert.equal(await blocked.text(), html);
    }
  }
  // Even an allowlisted filename fails closed when absent. No app/static
  // fallback may turn a missing decorative artifact into a normal route.
  const missingAsset = Object.values(maintenanceAssets).find(({ contentType }) => contentType === 'font/woff2');
  const missingPath = path.join(root, 'dist', missingAsset.file);
  const missingBytes = await readFile(missingPath);
  try {
    await rm(missingPath);
    const missing = await fetch(origin + '/' + missingAsset.file);
    assert.equal(missing.status, 503);
    assert.equal(await missing.text(), html);
  } finally { await writeFile(missingPath, missingBytes); }
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
  console.log(`Maintenance passed: homepage plus exact three decorative artifacts, matching SRI, original local fonts, exact three-contact allowlist, ${rejectedContactFixtures} rejected contact/payload fixtures, stale artifact removal and two fresh-process stale-document denial regressions, ${paths.length} edge/server blocked paths, read-only assets and missing-file denial, all API methods, no CV/portfolio navigation/application payload.`);
} finally { child.kill('SIGTERM'); }
