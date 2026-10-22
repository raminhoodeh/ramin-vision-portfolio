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

export function maintenanceDocument(bio) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escape(bio.name)} — Under construction</title>
  <meta name="description" content="${escape(bio.name)} — ${escape(bio.role)}. Website under construction." />
  <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
  <meta name="color-scheme" content="light" />
  <style>
    *{box-sizing:border-box}
    html{min-height:100%;background:#eaf1f6;color:#23384d;font-family:Arial,Helvetica,sans-serif}
    body{margin:0;min-height:100svh;padding:clamp(16px,2.5vw,32px);display:grid;place-items:center;background:radial-gradient(ellipse at 15% 10%,#ffffff 0,transparent 60%),radial-gradient(ellipse at 90% 85%,#cddfea 0,transparent 60%)}
    main{width:min(100%,1100px);min-height:min(740px,calc(100svh - 64px));display:flex;align-items:center;justify-content:center;padding:clamp(32px,4vw,52px) clamp(24px,5vw,72px);border:1px solid #ffffff;border-radius:clamp(24px,3vw,42px);background:linear-gradient(145deg,#ffffffa8,#f4f9fc85);box-shadow:0 24px 80px #304e6512,inset 0 1px 0 #ffffff;text-align:center}
    .intro{width:100%;max-width:780px;margin:auto}
    h1{margin:0;color:#29455e;font-family:Georgia,'Times New Roman',serif;font-size:clamp(2.8rem,8vw,6.5rem);font-weight:400;letter-spacing:-.055em;line-height:1.08;text-wrap:balance;text-shadow:0 1px 0 #ffffff}
    .role{margin:18px 0 0;color:#425a70;font-size:clamp(.95rem,1.4vw,1.15rem);font-weight:600;letter-spacing:.02em}
    .bio{max-width:620px;margin:16px auto 0;font-size:clamp(1.15rem,2.2vw,1.65rem);line-height:1.4;letter-spacing:-.025em;text-wrap:balance}
    .experience{max-width:590px;margin:12px auto 0;color:#52687d;font-size:.95rem;line-height:1.65;text-wrap:pretty}
    .notice{max-width:580px;margin:30px auto 0;padding-top:24px;border-top:1px solid #bccedb}
    h2{display:inline-flex;align-items:center;gap:10px;margin:0;padding:10px 17px;border:1px solid #c4d3dd;border-radius:999px;background:#ffffffb8;color:#334e65;font-size:.88rem;font-weight:600;line-height:1.4}
    .dot{width:7px;height:7px;border-radius:50%;background:#ad7431;box-shadow:0 0 0 4px #b4823912}
    .notice p{margin:14px 0 0;color:#425a70;font-size:.93rem;line-height:1.65;text-wrap:pretty}
    .contact{margin-top:26px}
    .contact-heading{margin:0 0 14px;color:#425a70;font-size:.88rem}
    .contact-links{display:flex;flex-wrap:wrap;justify-content:center;gap:12px}
    .tahoe-contact{position:relative;isolation:isolate;display:inline-flex;min-width:146px;min-height:56px;align-items:center;justify-content:center;overflow:hidden;padding:16px 24px;border:0;border-radius:999px;background:transparent;color:#23384d;text-decoration:none;transform:translateZ(0);transition:transform 220ms cubic-bezier(.14,1,.34,1),filter 220ms ease}
    .tahoe-contact:hover{filter:brightness(1.04) saturate(1.04);transform:translateY(-1px) scale(1.025)}
    .tahoe-contact:active{transform:scale(.97)}
    .tahoe-contact:focus-visible{outline:3px solid #41779d;outline-offset:4px}
    .glass-lens{position:absolute;inset:0;z-index:1;border-radius:inherit;pointer-events:none;background:radial-gradient(circle at 24% 10%,#ffffff70,transparent 38%),linear-gradient(145deg,#ffffff4d,#f7fcff14 52%,#529ce21a),#f5fbff26;-webkit-backdrop-filter:blur(7px) saturate(1.55);backdrop-filter:blur(7px) saturate(1.55);-webkit-backdrop-filter:blur(7px) url(#maintenance-glass) saturate(1.55);backdrop-filter:blur(7px) url(#maintenance-glass) saturate(1.55);box-shadow:inset 0 0 0 1px #ffffff80,inset 1.8px 3px 0 -2px #ffffffeb,inset -2px -2px 0 -2px #ffffffb8,inset -3px -8px 1px -6px #ffffff75,inset -.3px -1px 4px #000f2217,inset -1.5px 2.5px 0 -2px #000a1c21,0 7px 16px #000d2117}
    .glass-lens::before,.glass-lens::after{position:absolute;border-radius:inherit;pointer-events:none;content:''}
    .glass-lens::before{inset:1px;padding:1px;background:linear-gradient(180deg,#ffffffc9,transparent 36%,#5db5f821 76%,#ffffff8f),linear-gradient(90deg,#ffffff61,transparent 17%,transparent 82%,#74caff52);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude}
    .glass-lens::after{inset:2px 22%;background:linear-gradient(90deg,transparent,#ffffff80,transparent);filter:blur(5px);opacity:.34}
    .glass-label{position:relative;z-index:2;display:inline-flex;align-items:center;gap:10px;font-size:.95rem;font-weight:600;line-height:1.25;text-shadow:0 1px 1px #ffffffa6}
    .glass-label svg{width:19px;height:19px;flex:none;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
    .glass-filter{position:absolute;width:0;height:0;overflow:hidden;pointer-events:none}
    .email-address{margin:16px 0 0;color:#425a70;font-size:.88rem;line-height:1.5;overflow-wrap:anywhere}
    @media(prefers-reduced-motion:reduce){.tahoe-contact{transition:none}.tahoe-contact:hover,.tahoe-contact:active{transform:none}}
    @media(forced-colors:active){.tahoe-contact{border:1px solid ButtonText}.glass-lens{display:none}}
    @media(max-width:480px){body{padding:12px}main{min-height:calc(100svh - 24px);padding:36px 22px}.role{margin-top:18px}.experience{font-size:.9rem}.notice{margin-top:26px;padding-top:24px}.contact-links{display:grid;grid-template-columns:1fr;gap:12px;max-width:280px;margin:auto}.tahoe-contact{width:100%}}
  </style>
</head>
<body>
  <svg class="glass-filter" aria-hidden="true" focusable="false">
    <defs>
      <filter id="maintenance-glass" primitiveUnits="objectBoundingBox">
        <feTurbulence type="fractalNoise" baseFrequency="0.018 0.044" numOctaves="2" seed="23" result="grain" />
        <feColorMatrix in="grain" type="matrix" values="0.16 0 0 0 0.42 0 0.16 0 0 0.42 0 0 0.16 0 0.42 0 0 0 1 0" result="map" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="0.01" result="blur" />
        <feDisplacementMap in="blur" in2="map" scale="0.18" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  </svg>
  <main>
    <div class="intro">
      <h1>${escape(bio.name)}</h1>
      <p class="role">${escape(bio.role)}</p>
      <p class="bio">${escape(bio.intro)}</p>
      <p class="experience">${escape(bio.experience)}</p>
      <section class="notice" aria-labelledby="construction-notice">
        <h2 id="construction-notice"><span class="dot" aria-hidden="true"></span>Under construction</h2>
        <p>Following the recent PHP security disclosures, I’ve temporarily locked down my website as a precaution.</p>
        <p>I’m preparing to restore it on more secure infrastructure, with particular care around the advanced AI features built into the site. Access will return once that work is complete.</p>
      </section>
      <section class="contact" aria-label="Contact Ramin Hoodeh">
        <p class="contact-heading">You can still reach me.</p>
        <div class="contact-links" role="group" aria-label="Contact options">
          <a class="tahoe-contact" href="mailto:raminhoodeh@gmail.com" aria-label="Email Ramin Hoodeh at raminhoodeh@gmail.com">
            <span class="glass-lens" aria-hidden="true"></span>
            <span class="glass-label"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></svg>Email</span>
          </a>
          <a class="tahoe-contact" href="https://www.linkedin.com/in/raminhoodeh" target="_blank" rel="noopener noreferrer" aria-label="Ramin Hoodeh on LinkedIn (opens in a new tab)">
            <span class="glass-lens" aria-hidden="true"></span>
            <span class="glass-label"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M7.5 10v7M7.5 7v.1M11.5 17v-7m0 3a3 3 0 0 1 6 0v4" /></svg>LinkedIn</span>
          </a>
          <a class="tahoe-contact" href="https://wa.link/7g31wi" target="_blank" rel="noopener noreferrer" aria-label="Contact Ramin Hoodeh on WhatsApp (opens in a new tab)">
            <span class="glass-lens" aria-hidden="true"></span>
            <span class="glass-label"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M21 11.5a9 9 0 0 1-13.3 7.9L3 21l1.6-4.7A9 9 0 1 1 21 11.5Z" /><path d="M8 7.5c0 4.5 4 8.5 8.5 8.5l1-2-3-1-1 1a7.5 7.5 0 0 1-4-4l1-1-1-3-1.5 1.5Z" /></svg>WhatsApp</span>
          </a>
        </div>
        <p class="email-address">raminhoodeh@gmail.com</p>
      </section>
    </div>
  </main>
</body>
</html>
`;
}
