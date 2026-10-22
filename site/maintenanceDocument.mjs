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
    body{margin:0;min-height:100svh;padding:clamp(16px,3vw,40px);display:grid;place-items:center;background:radial-gradient(ellipse at 15% 10%,#ffffff 0,transparent 60%),radial-gradient(ellipse at 90% 85%,#cddfea 0,transparent 60%)}
    main{width:min(100%,1100px);min-height:min(740px,calc(100svh - 80px));display:flex;align-items:center;justify-content:center;padding:clamp(36px,7vw,92px) clamp(24px,5vw,72px);border:1px solid #ffffff;border-radius:clamp(24px,3vw,42px);background:linear-gradient(145deg,#ffffffa8,#f4f9fc85);box-shadow:0 24px 80px #304e6512,inset 0 1px 0 #ffffff;text-align:center}
    .intro{width:100%;max-width:780px;margin:auto}
    h1{margin:0;color:#29455e;font-family:Georgia,'Times New Roman',serif;font-size:clamp(2.8rem,8vw,6.5rem);font-weight:400;letter-spacing:-.055em;line-height:1.08;text-wrap:balance;text-shadow:0 1px 0 #ffffff}
    .role{margin:24px 0 0;color:#425a70;font-size:clamp(.95rem,1.4vw,1.15rem);font-weight:600;letter-spacing:.02em}
    .bio{max-width:620px;margin:20px auto 0;font-size:clamp(1.15rem,2.2vw,1.65rem);line-height:1.4;letter-spacing:-.025em;text-wrap:balance}
    .experience{max-width:590px;margin:16px auto 0;color:#52687d;font-size:.95rem;line-height:1.75;text-wrap:pretty}
    .notice{max-width:470px;margin:40px auto 0;padding-top:30px;border-top:1px solid #bccedb}
    h2{display:inline-flex;align-items:center;gap:10px;margin:0;padding:10px 17px;border:1px solid #c4d3dd;border-radius:999px;background:#ffffffb8;color:#334e65;font-size:.88rem;font-weight:600;line-height:1.4}
    .dot{width:7px;height:7px;border-radius:50%;background:#ad7431;box-shadow:0 0 0 4px #b4823912}
    .notice p{margin:14px 0 0;color:#52687d;font-size:.9rem;line-height:1.7}
    @media(max-width:480px){body{padding:12px}main{min-height:calc(100svh - 24px);padding:44px 24px}.role{margin-top:20px}.experience{font-size:.9rem}.notice{margin-top:30px;padding-top:26px}}
  </style>
</head>
<body>
  <main>
    <div class="intro">
      <h1>${escape(bio.name)}</h1>
      <p class="role">${escape(bio.role)}</p>
      <p class="bio">${escape(bio.intro)}</p>
      <p class="experience">${escape(bio.experience)}</p>
      <section class="notice" aria-labelledby="construction-notice">
        <h2 id="construction-notice"><span class="dot" aria-hidden="true"></span>Under construction</h2>
        <p>I’m updating this website. Please check back soon.</p>
      </section>
    </div>
  </main>
</body>
</html>
`;
}
