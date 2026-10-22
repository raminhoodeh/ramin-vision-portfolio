import { readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const escape = (text) => text.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

// Read the existing name and bio without executing/importing the portfolio or
// copying its course links, source context, application code or media.
export function homepageBio(root) {
  const source = ts.createSourceFile('homepage.ts', readFileSync(path.join(root, 'src/data/homepage.ts'), 'utf8'), ts.ScriptTarget.Latest, true);
  const declaration = source.statements.filter(ts.isVariableStatement).flatMap((statement) => [...statement.declarationList.declarations])
    .find((entry) => entry.name.getText(source) === 'homepagePositioning');
  let value = declaration?.initializer;
  while (value && (ts.isAsExpression(value) || ts.isSatisfiesExpression(value) || ts.isParenthesizedExpression(value))) value = value.expression;
  if (!value || !ts.isObjectLiteralExpression(value)) throw new Error('Cannot read the approved homepage bio.');
  const bio = {};
  for (const field of ['name', 'role', 'specialism', 'moneyMovement', 'intro', 'experience', 'strengthCommercial', 'strengthCommercialDetail', 'strengthBuilding', 'strengthBuildingDetail', 'strengthTeaching', 'strengthTeachingDetail']) {
    const property = value.properties.find((entry) => ts.isPropertyAssignment(entry) && entry.name.getText(source) === field);
    if (!property || !ts.isStringLiteralLike(property.initializer)) throw new Error(`Homepage ${field} must remain an explicit reviewed string.`);
    bio[field] = property.initializer.text;
  }
  return bio;
}

// The enhanced markup comes from the original Hero/GlassImprintCta at build
// time. A missing build still produces a useful closed maintenance response.
export function maintenanceDocument(bio, { heroName, contacts, proofs, styles = '', visualIntegrity } = {}) {
  const fallbackName = `<div class="homepage-hero__name fallback-name" aria-hidden="true">${escape(bio.name)}</div>`;
  const fallbackContacts = `<div class="contact-links" role="group" aria-label="Contact options">
    <a class="hero-thesis-glass-button" href="mailto:raminhoodeh@gmail.com">Email</a>
    <a class="hero-thesis-glass-button" href="https://www.linkedin.com/in/raminhoodeh" target="_blank" rel="noopener noreferrer">LinkedIn</a>
    <a class="hero-thesis-glass-button" href="https://wa.link/7g31wi" target="_blank" rel="noopener noreferrer">WhatsApp</a>
  </div>`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escape(bio.name)} | Under construction</title>
  <meta name="description" content="${escape(bio.name)}, ${escape(bio.role)} | ${escape(bio.specialism)}. Website under construction." />
  <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
  <meta name="color-scheme" content="light" />
  <meta name="portfolio-availability" content="maintenance" />
  <style>${styles || `body{margin:0;background:#acbbc4;color:#23364a;font-family:Arial,sans-serif}main{padding:40px;max-width:900px;margin:auto}.fallback-name{font-size:3rem;font-style:italic}a{display:inline-block;padding:16px;color:inherit}`}</style>
  ${visualIntegrity ? `<script defer src="/_maintenance/background.js" integrity="${escape(visualIntegrity)}" crossorigin="anonymous"></script>` : ''}
</head>
<body>
  <div class="fixed inset-0 z-0 shader-gradient-surface" aria-hidden="true"></div>
  <div id="maintenance-background" aria-hidden="true"></div>
  <div class="maintenance-shell">
    <p class="section-marker" aria-hidden="true">01 / Home</p>
    <div class="portfolio-frame">
      <div class="portfolio-stage">
        <main id="portfolio-main">
          <section id="hero" class="homepage-hero">
            <div class="homepage-hero__content">
              ${heroName || fallbackName}
              <h1 class="homepage-hero__role"><span class="sr-only">${escape(bio.name)}, </span><span>${escape(bio.role)}</span><span class="homepage-hero__specialism"><span aria-hidden="true">| </span><span class="sr-only">, </span>${escape(bio.specialism)}</span></h1>
              <h2 class="homepage-hero__money">${escape(bio.moneyMovement)}</h2>
              <p class="homepage-hero__intro">${escape(bio.intro)}</p>
              ${proofs || `<dl class="homepage-hero__strengths" aria-label="Three connected strengths">
                <div><dt>${escape(bio.strengthCommercial)}</dt><dd>${escape(bio.strengthCommercialDetail)}</dd></div>
                <div><dt><a href="https://nsso.me/" target="_blank" rel="noopener noreferrer">nsso</a> · <a href="https://apps.apple.com/us/app/dreamsea/id6761101193" target="_blank" rel="noopener noreferrer">Dreamsea</a> · <a href="https://apps.apple.com/us/app/24seven-concierge/id6663954162" target="_blank" rel="noopener noreferrer">24Seven</a></dt><dd>${escape(bio.strengthBuildingDetail)}</dd></div>
                <div><dt>${escape(bio.strengthTeaching)}</dt><dd>Creator · <a href="https://www.coursera.org/learn/ai-product-management/" target="_blank" rel="noopener noreferrer">Coursera</a> · <a href="https://www.udemy.com/course/from-product-manager-to-ai-product-manager/" target="_blank" rel="noopener noreferrer">Udemy</a></dd></div>
              </dl>`}
              <section class="notice" aria-labelledby="construction-notice">
                <h2 id="construction-notice"><span class="notice-dot" aria-hidden="true"></span>Under construction</h2>
                <p>Temporarily closed as a precaution following the recent PHP security disclosures. I’m preparing more secure infrastructure for the site and its embedded AI features.</p>
              </section>
              <section class="contact" aria-label="Contact Ramin Hoodeh">
                ${contacts || fallbackContacts}
                <p class="email-address">raminhoodeh@gmail.com</p>
              </section>
            </div>
          </section>
        </main>
      </div>
    </div>
  </div>
</body>
</html>
`;
}
