import { useEffect, useState } from 'react';
import { JOURNEY_PREFERENCE_EVENT, journeyMeasurementEnabled, setJourneyMeasurementEnabled } from '../lib/visitorJourney';

export function JourneyPrivacy() {
  const [enabled, setEnabled] = useState(journeyMeasurementEnabled);
  const privacySignal = typeof navigator !== 'undefined' && (navigator.doNotTrack === '1' || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl);
  useEffect(() => {
    const update = () => setEnabled(journeyMeasurementEnabled());
    window.addEventListener(JOURNEY_PREFERENCE_EVENT, update);
    window.addEventListener('storage', update);
    return () => { window.removeEventListener(JOURNEY_PREFERENCE_EVENT, update); window.removeEventListener('storage', update); };
  }, []);
  return <details id="privacy" className="mt-8 max-w-xl text-sm leading-relaxed text-text-primary">
    <summary className="cursor-pointer rounded px-3 py-2 underline underline-offset-4">Privacy and usage counts</summary>
    <div className="rounded-2xl border border-stroke bg-white/60 p-4 text-left">
      <p>I count broad actions such as opening a case, course, CV or contact option to improve this portfolio. These usage events contain no visitor identifiers, cookies, page URLs, referrers, conversation text or job descriptions. They appear in the site’s hosting logs for a limited period. The hosting service may separately retain request metadata.</p>
      <p className="mt-2">AI Ramin sends your questions to its AI service separately. Optional answer feedback follows the disclosure beside that action.</p>
      <label className="mt-3 flex items-start gap-2"><input type="checkbox" checked={enabled} disabled={Boolean(privacySignal)} onChange={(event) => setJourneyMeasurementEnabled(event.target.checked)} className="mt-1" />Allow basic usage counts on this browser</label>
      <p className="mt-2 text-xs">{privacySignal ? 'Your browser privacy signal has disabled these counts.' : 'Turning this off saves only your preference on this browser. No tracking ID is created.'}</p>
    </div>
  </details>;
}
