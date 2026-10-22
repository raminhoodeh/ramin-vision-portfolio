import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';
import { maintenanceEnabled } from '../site/maintenance.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function wrappers(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? wrappers(filename) : entry.name.endsWith('.mjs') ? [filename] : [];
  });
}
function response() {
  const headers = new Map();
  return {
    statusCode: 200, ended: 0, body: undefined, headers,
    setHeader(name, value) { headers.set(name.toLowerCase(), String(value)); },
    end(body) { this.ended++; this.body = body; },
  };
}

const files = wrappers(path.join(root, 'api')).sort();
assert.ok(files.length > 0, 'Discover deployed API wrappers');
let coreCalls = 0;
let actualResponses = 0;
let networkCalls = 0;
const originalFetch = globalThis.fetch;
globalThis.fetch = async () => { networkCalls++; throw new Error('The maintenance check must never call a provider'); };
try {
  for (const filename of files) {
    const relative = path.relative(root, filename);
    const code = fs.readFileSync(filename, 'utf8');
    const ast = ts.createSourceFile(filename, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    const imports = ast.statements.filter(ts.isImportDeclaration);
    const guardImport = imports.find((node) => path.resolve(path.dirname(filename), node.moduleSpecifier.text) === path.join(root, 'server/siteMaintenance.mjs'));
    assert.ok(guardImport, `${relative}: use the shared availability policy`);
    const module = { exports: {} };
    let blocked = true;
    const calls = [];
    const token = Promise.resolve({ fixture: relative });
    const require = (name) => {
      if (path.resolve(path.dirname(filename), name) === path.join(root, 'server/siteMaintenance.mjs')) {
        return { blockWhileMaintenance(req, res) { calls.push('guard'); if (!blocked) return false; res.statusCode = 503; res.end('Maintenance'); return true; } };
      }
      const declaration = imports.find((node) => node.moduleSpecifier.text === name);
      assert.ok(declaration && ts.isNamedImports(declaration.importClause?.namedBindings), `${relative}: explicit core handler dependency`);
      return Object.fromEntries(declaration.importClause.namedBindings.elements.map((element) => [element.propertyName?.text ?? element.name.text, (req, res) => {
        calls.push('core'); coreCalls++; calls.push(req, res); return token;
      }]));
    };
    const compiled = ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    vm.runInNewContext(compiled, { module, exports: module.exports, require }, { filename: relative });
    const handler = module.exports.default;
    assert.equal(typeof handler, 'function', `${relative}: deployed entry exports a handler`);
    const request = { method: 'POST', url: '/api/fixture' };
    const blockedResponse = response();
    assert.equal(handler(request, blockedResponse), undefined);
    assert.equal(blockedResponse.statusCode, 503);
    assert.equal(blockedResponse.ended, 1);
    assert.deepEqual(calls, ['guard'], `${relative}: maintenance stops before the core handler`);
    calls.length = 0;
    blocked = false;
    const openResponse = response();
    assert.equal(handler(request, openResponse), token, `${relative}: reopening preserves the core return value/promise`);
    assert.deepEqual(calls, ['guard', 'core', request, openResponse], `${relative}: pass the original request and response once`);
    assert.equal(openResponse.ended, 0, `${relative}: wrapper does not end a core-owned response`);

    // Import and invoke the real wrapper/helper without credentials or provider
    // requests. Core modules remain untouched so their offline fixtures work.
    if (maintenanceEnabled) {
      const actual = (await import(pathToFileURL(filename).href)).default;
      const apiPath = `/${relative.replaceAll(path.sep, '/').replace(/\.mjs$/, '').replace('[...path]', 'runs/fixture').replace('[runId]', 'fixture')}`;
      for (const method of ['GET', 'HEAD', 'POST', 'OPTIONS']) {
        const req = { method, url: `${apiPath}?maintenance-check=1`, headers: {} };
        Object.defineProperty(req, 'body', { get() { throw new Error(`${relative}: maintenance must not read the request body`); } });
        req[Symbol.asyncIterator] = () => { throw new Error(`${relative}: maintenance must not consume a request stream`); };
        const res = response();
        await actual(req, res);
        assert.equal(res.statusCode, 503, `${relative} ${method}: real availability policy blocks API traffic`);
        assert.equal(res.ended, 1);
        assert.equal(res.headers.get('x-portfolio-availability'), 'maintenance');
        assert.ok(res.headers.get('cache-control')?.includes('no-store'));
        assert.ok(res.headers.get('x-robots-tag')?.includes('noindex'));
        assert.equal(res.headers.get('retry-after'), '86400');
        if (method === 'HEAD') assert.equal(res.body, undefined);
        else assert.ok(typeof res.body === 'string' && res.body.length > 0, `${relative}: useful maintenance response`);
        actualResponses++;
      }
    }
  }
} finally {
  globalThis.fetch = originalFetch;
}
assert.equal(coreCalls, files.length, 'Only the explicit guard-off fixture calls a core double');
assert.equal(networkCalls, 0, 'No real provider/network requests');
console.log(`API maintenance passed: ${files.length} discovered wrappers; ${actualResponses} real maintenance responses; guard-off request/response/promise pass-through; no provider calls.${maintenanceEnabled ? '' : ' Real 503 checks skipped because the site is reopened.'}`);
