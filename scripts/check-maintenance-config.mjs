import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { maintenanceEnabled, maintenanceRoutes } from '../site/maintenance.mjs';
import { portfolioPreview } from '../src/seo/routes.mjs';

const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
if (maintenanceEnabled) {
  assert.equal(config.framework, null);
  assert.equal(config.buildCommand, 'npm run build');
  assert.deepEqual(config.routes, maintenanceRoutes());
  for (const key of ['redirects', 'rewrites', 'cleanUrls', 'trailingSlash', 'functions']) assert.ok(!(key in config), `Maintenance routing cannot retain ${key}`);
  assert.ok(readFileSync(new URL('../.vercelignore', import.meta.url), 'utf8').split('\n').includes('api/'), 'Source deployments must not discover API functions while locked');
  console.log('Maintenance configuration passed: root-only page, terminal 503 catchall, no document redirects or API build inputs.');
} else {
  if (portfolioPreview) {
    assert.notEqual(process.env.VERCEL_ENV, 'production', 'The private preview branch cannot build for Production. Review release settings first.');
    assert.equal(config.framework, 'vite');
    assert.equal(config.outputDirectory, 'dist');
    assert.ok(!config.routes, 'Preview must use full portfolio routing');
    assert.ok(!config.redirects.some((rule) => /^\/cv\/?$/i.test(rule.source)), 'CV redirects stay removed');
    assert.ok(!config.redirects.some((rule) => rule.has?.some((condition) => condition.type === 'host')), 'Preview navigation stays on the preview host');
    assert.ok(config.headers.some((rule) => rule.source === '/:path*' && rule.headers.some((header) => header.key === 'X-Robots-Tag' && header.value.includes('noindex'))));
    assert.ok(!readFileSync(new URL('../.vercelignore', import.meta.url), 'utf8').split('\n').includes('api/'), 'Preview builds include the API wrappers');
    console.log('Private preview configuration passed: full routing, noindex, no CV access and production build guard.');
  }
  const { spawnSync } = await import('node:child_process');
  const result = spawnSync('npm', ['run', 'check:portfolio-claims'], { stdio: 'inherit' });
  process.exitCode = result.status ?? 1;
}
