import { getPublicPage } from '../seo/routes.mjs';
import { validateJourneyPayload, type JourneyEvent, type JourneySurface } from '../analytics/visitorJourneySchema.mjs';

const PREFERENCE_KEY = 'portfolio-journey-disabled';
export const JOURNEY_PREFERENCE_EVENT = 'portfolio-journey-preference';
let disabled = false;
let preferenceOverride: boolean | undefined;
let audience: 'visitor' | 'qa' = 'visitor';
let sent = 0;
let lastPage = '';

export function journeyMeasurementEnabled() {
  if (typeof navigator === 'undefined') return false;
  try { disabled = preferenceOverride ?? (localStorage.getItem(PREFERENCE_KEY) === '1'); } catch { /* In-memory preference still works. */ }
  return !disabled && navigator.doNotTrack !== '1'
    && !(navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl;
}
export function setJourneyMeasurementEnabled(enabled: boolean) {
  disabled = !enabled;
  try {
    if (disabled) localStorage.setItem(PREFERENCE_KEY, '1'); else localStorage.removeItem(PREFERENCE_KEY);
    preferenceOverride = undefined;
  } catch { preferenceOverride = disabled; }
  window.dispatchEvent(new Event(JOURNEY_PREFERENCE_EVENT));
}

export function journeySurface(path: string): JourneySurface {
  const page = getPublicPage(path);
  if (!page) return 'other';
  if (page.kind === 'home') return 'home';
  if (['experience', 'story'].includes(page.kind)) return 'work';
  if (page.kind === 'case') return 'case';
  if (page.kind === 'disx' || page.kind === 'talks') return 'talk';
  if (page.kind === 'about' || page.kind === 'books') return 'about';
  if (page.kind === 'resources') return 'resources';
  if (['thoughts', 'courses', 'books', 'metacognition'].includes(page.kind)) return 'teaching';
  if (page.path === '/ai-ramin') return 'ai';
  if (['projects', 'contact', 'bonus', 'method', 'thesis'].includes(page.kind)) return page.kind as JourneySurface;
  return 'other';
}

export function recordJourneyEvent(event: JourneyEvent, target: string, surface = journeySurface(window.location.pathname)) {
  if (!journeyMeasurementEnabled() || navigator.webdriver || sent >= 150) return;
  const payload = { schemaVersion: 1 as const, event, surface, target, audience };
  if (!validateJourneyPayload(payload)) return;
  sent += 1;
  // No queue, cookies, identity, referrer, URL, draft or conversation is sent.
  void fetch('/api/visitor-journey', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    credentials: 'omit', referrerPolicy: 'no-referrer', keepalive: true,
  }).catch(() => { /* Measurement never blocks a visitor task. */ });
}

export function recordJourneyPage(path: string) {
  const page = getPublicPage(path);
  const canonical = page?.path ?? 'other';
  if (canonical === lastPage) return;
  lastPage = canonical;
  const surface = journeySurface(path);
  recordJourneyEvent('page_view', surface, surface);
  if (page?.kind === 'case') recordJourneyEvent('case_open', canonical.split('/').pop()!, surface);
  if (page?.kind === 'story') recordJourneyEvent('case_open', page.key!, surface);
  if (page?.kind === 'thesis') recordJourneyEvent('case_open', 'product-thesis', surface);
  if (page?.kind === 'metacognition') recordJourneyEvent('case_open', 'metacognition', surface);
  if (page?.kind === 'disx') recordJourneyEvent('talk_open', 'disx', surface);
}

export function installVisitorJourney() {
  if (new URLSearchParams(window.location.search).get('journey') === 'qa' || import.meta.env.DEV) audience = 'qa';
  const onClick = (event: MouseEvent) => {
    if (event.button !== 0) return;
    const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
    if (!anchor) return;
    let url: URL;
    try { url = new URL(anchor.href, window.location.href); } catch { return; }
    if (url.protocol === 'mailto:') { recordJourneyEvent('contact_open', 'email'); return; }
    if (!['http:', 'https:'].includes(url.protocol)) return;
    const host = url.hostname.toLowerCase();
    const internal = url.origin === window.location.origin || ['ramin.vision', 'www.ramin.vision'].includes(host);
    if (internal) {
      if (/^\/cv\/?$/.test(url.pathname)) recordJourneyEvent('cv_open', 'cv');
      if (/^\/presentation\/?$/.test(url.pathname)) recordJourneyEvent('evidence_follow', 'presentation');
      return;
    }
    if (/(^|\.)udemy\.com$/.test(host)) recordJourneyEvent('course_open', 'udemy');
    else if (/(^|\.)coursera\.org$/.test(host)) recordJourneyEvent('course_open', 'coursera');
    else if (/(^|\.)linkedin\.com$/.test(host) && !url.pathname.includes('/posts/') && !url.pathname.includes('/feed/')) recordJourneyEvent('contact_open', 'linkedin');
    else if (['wa.me', 'wa.link', 'api.whatsapp.com'].includes(host)) recordJourneyEvent('contact_open', 'whatsapp');
    else if (/(^|\.)calendly\.com$/.test(host) || host === 'calendar.app.google') recordJourneyEvent('contact_open', 'booking');
    else if (/(^|\.)ted\.com$/.test(host)) recordJourneyEvent('talk_open', 'tedx');
    else recordJourneyEvent('evidence_follow', host === 'github.com' ? 'repository'
      : /(^|\.)amazon\./.test(host) ? 'book'
        : ['apps.apple.com', 'nsso.me', 'www.nsso.me', 'qadam.trade', 'www.qadam.trade'].includes(host) ? 'product' : 'source');
  };
  document.addEventListener('click', onClick, true);
  return () => document.removeEventListener('click', onClick, true);
}
