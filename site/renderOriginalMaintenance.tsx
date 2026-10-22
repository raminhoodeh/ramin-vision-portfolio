import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { Hero } from '../src/sections/Hero';
import { GlassImprintCta } from '../src/components/GlassImprintCta';
import { HomepageProofs } from '../src/components/HomepageProofs';

/** Render only the approved decorative name and contact controls from their original components. */
export function renderOriginalMaintenance() {
  const hero = renderToStaticMarkup(<Hero ready={false} onOpenThesis={() => {}} />, {
    identifierPrefix: 'maintenance-hero-',
  });
  const names = [...hero.matchAll(/<div\b[^>]*\bclass="[^"]*\bhomepage-hero__name\b[^"]*"[^>]*>[\s\S]*?<\/div>/g)];
  assert.equal(names.length, 1, 'The original Hero must contain exactly one decorative name wrapper.');
  const heroName = names[0][0];
  assert.equal([...heroName.matchAll(/<div\b/g)].length, 1, 'The original name wrapper cannot contain nested divs.');
  assert.equal([...heroName.matchAll(/<svg\b/g)].length, 2, 'The original name must retain its desktop and mobile SVGs.');
  assert.equal([...heroName.matchAll(/<\/svg>/g)].length, 2, 'Both original name SVGs must be complete.');
  assert.doesNotMatch(heroName, /<(?:a|button|nav|script|iframe)\b/i, 'Only the decorative name can leave the Hero render.');

  const contacts = renderToStaticMarkup(
    <div className="contact-links" role="group" aria-label="Contact options">
      <GlassImprintCta
        label="Email"
        ariaLabel="Email Ramin Hoodeh at raminhoodeh@gmail.com"
        href="mailto:raminhoodeh@gmail.com"
      />
      <GlassImprintCta
        label="LinkedIn"
        ariaLabel="Ramin Hoodeh on LinkedIn (opens in a new tab)"
        href="https://www.linkedin.com/in/raminhoodeh"
        target="_blank"
        rel="noopener noreferrer"
      />
      <GlassImprintCta
        label="WhatsApp"
        ariaLabel="Contact Ramin Hoodeh on WhatsApp (opens in a new tab)"
        href="https://wa.link/7g31wi"
        target="_blank"
        rel="noopener noreferrer"
      />
    </div>,
    { identifierPrefix: 'maintenance-contact-' },
  );
  const filterIds = [...contacts.matchAll(/<filter\b[^>]*\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(filterIds.length, 3, 'Each original glass contact must have its own distortion filter.');
  assert.equal(new Set(filterIds).size, 3, 'Original glass contact filter IDs must remain unique.');
  assert.equal([...contacts.matchAll(/<a\b/g)].length, 3, 'Only the three approved contact anchors may be rendered.');

  const proofs = renderToStaticMarkup(<HomepageProofs />, { identifierPrefix: 'maintenance-proof-' });
  return { heroName, contacts, proofs };
}
