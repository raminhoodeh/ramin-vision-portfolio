import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import net from 'node:net';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import { CANONICAL_ORIGIN, getPageMetadata, getStructuredData, serializeStructuredData, publicPages, routeAliases, sectionPathAliases } from '../src/seo/routes.mjs';

const probe = net.createServer();
probe.listen(0, '127.0.0.1'); await once(probe, 'listening');
const port = probe.address().port; await new Promise((resolve) => probe.close(resolve));
const child = spawn(process.execPath, ['server.mjs'], { env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
let logs = ''; child.stdout.on('data', (chunk) => { logs += chunk; }); child.stderr.on('data', (chunk) => { logs += chunk; });
const base = `http://127.0.0.1:${port}`;
const escape = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const request = (route, options = {}) => new Promise((resolve, reject) => {
  const outgoing = http.request(base + route, { method: options.method ?? 'GET', headers: options.headers ?? {} }, (incoming) => {
    const chunks = [];
    incoming.on('data', (chunk) => chunks.push(chunk));
    incoming.on('end', () => resolve(new Response([204, 205, 304].includes(incoming.statusCode) ? null : Buffer.concat(chunks), { status: incoming.statusCode, headers: incoming.headers })));
  });
  outgoing.on('error', reject); outgoing.end(options.body);
});
try {
  for (let attempt = 0; attempt < 100 && !logs.includes('Portfolio server running'); attempt++) {
    if (child.exitCode !== null) throw new Error(logs);
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.ok(logs.includes('Portfolio server running'), 'server started');
  const hostileText = { text: '</script><img src=x onerror=alert(1)>&\u2028\u2029' };
  const safeJson = serializeStructuredData(hostileText);
  assert.ok(!safeJson.includes('<') && !safeJson.includes('>') && !safeJson.includes('&'));
  assert.deepEqual(JSON.parse(safeJson), hostileText);
  assert.equal(publicPages.length, new Set(publicPages.map((page) => page.path)).size);
  for (const page of publicPages) {
    const expected = getPageMetadata(page.path);
    const response = await request(page.path); const html = await response.text();
    assert.equal(response.status, 200, page.path);
    assert.match(response.headers.get('content-type'), /text\/html/);
    const headHtml = html.match(/<head>([\s\S]*?)<\/head>/i)?.[1] ?? '';
    assert.equal([...headHtml.matchAll(/<title>/g)].length, 1, `unique title ${page.path}`);
    assert.equal([...headHtml.matchAll(/rel="canonical"/g)].length, 1, `unique canonical ${page.path}`);
    assert.ok(html.includes(`href="${expected.canonical}"`), `canonical ${page.path}`);
    assert.ok(html.includes(`<title>${escape(expected.title)}</title>`), `route title ${page.path}`);
    assert.ok(html.includes(`name="description" content="${escape(expected.description)}"`), `route description ${page.path}`);
    for (const key of ['og:title', 'og:description', 'og:image', 'twitter:title', 'twitter:description', 'twitter:image']) assert.ok(html.includes(`="${key}"`), `${key} ${page.path}`);
    for (const key of ['description', 'robots', 'og:title', 'og:description', 'og:image', 'og:image:alt', 'og:image:width', 'og:image:height', 'twitter:title', 'twitter:description', 'twitter:image', 'twitter:image:alt']) {
      assert.equal([...headHtml.matchAll(new RegExp(`(?:name|property)="${key}"`, 'g'))].length, 1, `unique ${key} ${page.path}`);
    }
    assert.ok(headHtml.includes(`property="og:image:alt" content="${escape(expected.title)}"`));
    assert.ok(headHtml.includes(`name="twitter:image:alt" content="${escape(expected.title)}"`));
    const graphScripts = [...headHtml.matchAll(/<script id="portfolio-structured-data" type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    assert.equal(graphScripts.length, 1, `one JSON-LD graph ${page.path}`);
    const structured = JSON.parse(graphScripts[0][1]);
    assert.deepEqual(structured, getStructuredData(page.path));
    assert.deepEqual(structured['@graph'].map((entry) => entry['@type']), ['Person', 'WebSite', 'WebPage']);
    const [person, website, webpage] = structured['@graph'];
    assert.equal(person.name, 'Ramin Hoodeh'); assert.equal(person.jobTitle, 'AI Product Manager');
    assert.equal(webpage.url, expected.canonical); assert.equal(webpage.name, expected.title); assert.equal(webpage.description, expected.description);
    assert.equal(webpage.isPartOf['@id'], website['@id']); assert.equal(webpage.about['@id'], person['@id']);
    assert.ok(html.includes(expected.image), `preview ${page.path}`);
    assert.ok(html.includes('id="portfolio-initial"'), `initial content ${page.path}`);
    assert.equal([...html.matchAll(/id="portfolio-initial"/g)].length, 1, `one initial document ${page.path}`);
    const initial = html.split('id="portfolio-initial">')[1].split('<div id="root"')[0];
    assert.ok(initial.replace(/<[^>]*>/g, '').trim().length > 150, `useful first HTML ${page.path}`);
    assert.match(initial, /<h1\b/);
    assert.equal([...initial.matchAll(/<h1\b/g)].length, 1, `one page heading ${page.path}`);
    assert.ok(!/\[confidential\]|\[object Object\]/i.test(initial), `public-safe readable fields ${page.path}`);
    assert.ok(!/src="\/(?:src|thoughts-section|projects-section)\//.test(initial), `built image URLs ${page.path}`);
    const image = await request(new URL(expected.image).pathname); assert.equal(image.status, 200);
    assert.match(image.headers.get('content-type'), /image\/png/);
    const dimensions = await sharp(Buffer.from(await image.arrayBuffer())).metadata();
    assert.equal(dimensions.width, 1200); assert.equal(dimensions.height, 630);
    const headResponse = await request(page.path, { method: 'HEAD' }); assert.equal(headResponse.status, 200); assert.equal(await headResponse.text(), '');
  }
  const robots = await request('/robots.txt'); assert.equal(robots.status, 200); assert.match(robots.headers.get('content-type'), /text\/plain/); assert.ok((await robots.text()).includes(`Sitemap: ${CANONICAL_ORIGIN}/sitemap.xml`));
  const initialStyle = await (await request('/initial-content.css')).text();
  assert.ok(initialStyle.includes('overflow:auto!important'));
  assert.ok(initialStyle.includes('height:auto!important'));
  assert.ok(initialStyle.includes('.initial-document *{background:transparent!important;background-image:none!important;color:#26384d!important;opacity:1!important;box-shadow:none!important;text-shadow:none!important}'));
  const luminance = (hex) => {
    const channels = hex.match(/\w\w/g).map((part) => parseInt(part, 16) / 255).map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };
  const contrast = (foreground, background) => {
    const values = [luminance(foreground), luminance(background)].sort((a,b) => b-a);
    return (values[0] + 0.05) / (values[1] + 0.05);
  };
  assert.ok(contrast('26384d', 'edf3f7') >= 7, 'initial reading text contrast');
  assert.ok(contrast('28577f', 'edf3f7') >= 4.5, 'initial link contrast');
  const sitemap = await request('/sitemap.xml'); assert.equal(sitemap.status, 200); assert.match(sitemap.headers.get('content-type'), /application\/xml/); const xml = await sitemap.text();
  assert.equal([...xml.matchAll(/<loc>/g)].length, publicPages.length);
  for (const page of publicPages) assert.ok(xml.includes(`<loc>${CANONICAL_ORIGIN}${page.path}</loc>`));
  for (const route of ['/this-page-does-not-exist', '/projects/unknown-case', '/work/unknown-story', '/assets/missing.js']) {
    const response = await request(route); assert.equal(response.status, 404, route); const errorHtml = await response.text(); assert.ok(errorHtml.includes('noindex'));
    assert.ok(!errorHtml.includes('portfolio-structured-data') && !errorHtml.includes('rel="canonical"'));
  }
  const api = await request('/api/not-a-real-endpoint'); assert.equal(api.status, 404); assert.ok(!(await api.text()).includes('<html'));
  const apiMethod = await request('/api/ai-ramin', { headers: { host: 'ramin.vision' } }); assert.equal(apiMethod.status, 405); assert.ok(!(await apiMethod.text()).includes('<html'));
  const journeyMethod = await request('/api/visitor-journey'); assert.equal(journeyMethod.status, 405);
  const journeyPayload = { schemaVersion: 1, event: 'cv_open', surface: 'home', target: 'cv', audience: 'qa' };
  const journeyOptions = { method: 'POST', headers: { origin: CANONICAL_ORIGIN, 'content-type': 'application/json' }, body: JSON.stringify(journeyPayload) };
  assert.equal((await request('/api/visitor-journey', journeyOptions)).status, 204, 'measurement endpoint wired into Node hosting');
  assert.equal((await request('/api/visitor-journey', { ...journeyOptions, body: JSON.stringify({ ...journeyPayload, prompt: 'rejected-fixture' }) })).status, 400, 'extra text rejected over HTTP');
  const config = JSON.parse(await readFile('vercel.json', 'utf8'));
  for (const route of ['/cv', '/cv/', '/presentation', '/presentation/']) {
    const response = await request(route, { headers: { host: 'ramin.vision' } }); assert.equal(response.status, 307, route);
    assert.equal(response.headers.get('location'), config.redirects.find((rule) => rule.source === route).destination);
  }
  const apex = await request('/product-method?source=test', { headers: { host: 'ramin.vision' } }); assert.equal(apex.status, 308); assert.equal(apex.headers.get('location'), `${CANONICAL_ORIGIN}/product-method?source=test`);
  for (const [alias, target] of Object.entries(routeAliases).filter(([from,to]) => from !== to)) {
    const response = await request(alias); assert.equal(response.status, 308, alias); assert.equal(response.headers.get('location'), target);
    assert.ok(config.redirects.some((rule) => rule.source === alias && rule.destination === target && rule.permanent === true));
  }
  for (const [alias, target] of Object.entries(sectionPathAliases)) {
    const response = await request(alias); assert.equal(response.status, 200, `section intent ${alias}`);
    assert.ok((await response.text()).includes(`href="${CANONICAL_ORIGIN}${target}"`));
    assert.ok(config.rewrites.some((rule) => rule.source === alias && rule.destination === target));
  }
  assert.equal(config.cleanUrls, true); assert.ok(!Object.hasOwn(config, 'trailingSlash'), 'Global slash redirects must not override the explicit CV/presentation 307s'); assert.ok(config.rewrites.every((rule) => rule.source in sectionPathAliases));
  console.log(`Public HTTP checks passed: ${publicPages.length} readable routes, previews, canonical metadata, discovery, aliases, preserved 307s, apex 308 and real 404s.`);
} finally { child.kill('SIGTERM'); }
