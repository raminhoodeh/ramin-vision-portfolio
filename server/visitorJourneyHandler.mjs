import { validateJourneyPayload } from '../src/analytics/visitorJourneySchema.mjs';

export function createVisitorJourneyHandler({ log = console.log, now = () => new Date(), environment = process.env.VERCEL_ENV, deploymentUrl = process.env.VERCEL_URL } = {}) {
  return async function handleVisitorJourneyRequest(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    const send = (code, body) => { res.statusCode = code; res.end(body ? JSON.stringify(body) : undefined); };
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); send(405, { error: 'Use POST.' }); return; }
    // No CORS access. Require the browser's same-origin fetch origin, with local preview support.
    const origin = req.headers.origin;
    const allowed = ['https://www.ramin.vision', 'https://ramin.vision'];
    const local = environment !== 'production' && /^http:\/\/127\.0\.0\.1:\d+$/.test(origin || '');
    const preview = environment !== 'production' && deploymentUrl && origin === `https://${deploymentUrl}`;
    if (!allowed.includes(origin) && !local && !preview) { send(403, { error: 'Origin not allowed.' }); return; }
    if (req.headers.dnt === '1' || req.headers['sec-gpc'] === '1') { send(204); return; }
    if (!(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) { send(415, { error: 'Use JSON.' }); return; }
    let raw = '';
    try {
      for await (const part of req) {
        raw += part.toString();
        if (Buffer.byteLength(raw) > 512) { send(413, { error: 'Payload too large.' }); return; }
      }
      const payload = JSON.parse(raw);
      if (!validateJourneyPayload(payload)) { send(400, { error: 'Invalid event.' }); return; }
      // QA is separated from visitor counts; previews are always QA.
      const audience = environment === 'production' ? payload.audience : 'qa';
      log(JSON.stringify({ type: 'portfolio_journey', ...payload, audience, day: now().toISOString().slice(0, 10) }));
      send(204);
    } catch { send(400, { error: 'Invalid JSON.' }); }
  };
}
export const handleVisitorJourneyRequest = createVisitorJourneyHandler();
