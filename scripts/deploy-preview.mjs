import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';
import { maintenanceEnabled } from '../site/maintenance.mjs';
import { portfolioPreview } from '../src/seo/routes.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const scope = 'ramin-hoodehs-projects';
const projectId = 'prj_VEfpTQXkdwjueYNuwjlV4ROmPyAx';
const command = (binary, args) => execFileSync(binary, args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();
const project = () => JSON.parse(command('vercel', ['api', `/v9/projects/${projectId}`, '--scope', scope, '--raw']));
assert.equal(portfolioPreview, true, 'Use this command only in the isolated preview fork.');
assert.equal(maintenanceEnabled, false, 'The preview must render the full site.');
assert.notEqual(process.env.VERCEL_ENV, 'production', 'This command cannot publish to Production.');
assert.equal(command('git', ['branch', '--show-current']), 'codex/site-preview', 'Deploy from codex/site-preview.');
assert.equal(command('git', ['status', '--porcelain']), '', 'Commit the reviewed preview changes before deploying.');
const link = JSON.parse(readFileSync(new URL('../.vercel/project.json', import.meta.url), 'utf8'));
assert.equal(link.projectId, projectId, 'Link this checkout to the existing portfolio Vercel project.');
const before = project();
assert.ok(['all_except_custom_domains', 'all'].includes(before.ssoProtection?.deploymentType), 'Vercel Authentication must protect generated preview URLs before uploading.');
const productionId = before.targets?.production?.id;
assert.ok(productionId, 'The existing production deployment must be identified.');
command(process.execPath, ['scripts/check-maintenance-config.mjs']);
const commit = command('git', ['rev-parse', 'HEAD']);
const result = spawnSync('vercel', [
  'deploy', '--target=preview', '--yes', '--scope', scope,
  '--meta', 'githubDeployment=1', '--meta', 'githubCommitRef=codex/site-preview',
  '--meta', `githubCommitSha=${commit}`,
], { cwd: root, stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status ?? 1);
const after = project();
assert.equal(after.targets?.production?.id, productionId, 'Production must stay on the existing maintenance deployment.');
console.log('Protected Preview deployed. The production deployment is unchanged.');
