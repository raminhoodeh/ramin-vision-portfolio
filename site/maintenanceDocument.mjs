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
  for (const field of ['name', 'role', 'intro', 'experience']) {
    const property = value.properties.find((entry) => ts.isPropertyAssignment(entry) && entry.name.getText(source) === field);
    if (!property || !ts.isStringLiteralLike(property.initializer)) throw new Error(`Homepage ${field} must remain an explicit reviewed string.`);
    bio[field] = property.initializer.text;
  }
  return bio;
}

// The enhanced markup comes from the original Hero/GlassImprintCta at build
// time. A missing build still produces a useful closed maintenance response.
export function maintenanceDocument(bio, { heroName, contacts, styles = '', visualIntegrity } = {}) {
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
  <title>${escape(bio.name)} — Under construction</title>
  <meta name="description" content="${escape(bio.name)} — ${escape(bio.role)}. Website under construction." />
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
              <h1 class="homepage-hero__role"><span class="sr-only">${escape(bio.name)}, </span>${escape(bio.role)}</h1>
              <h2 class="homepage-hero__intro">${escape(bio.intro)}</h2>
              <p class="homepage-hero__experience">${escape(bio.experience)}</p>
              <section class="notice" aria-labelledby="construction-notice">
                <h2 id="construction-notice"><span class="notice-dot" aria-hidden="true"></span>Under construction</h2>
                <p>Following the recent PHP security disclosures, I’ve temporarily locked down my website as a precaution.</p>
                <p>I’m preparing to restore it on more secure infrastructure, with particular care around the advanced AI features built into the site. Access will return once that work is complete.</p>
              </section>
              <section class="contact" aria-label="Contact Ramin Hoodeh">
                <p class="contact-heading">You can still reach me.</p>
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
