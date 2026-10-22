import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

function rule(source, selector, after = 0) {
  const start = source.indexOf(`${selector} {`, after);
  assert.ok(start >= 0, `Original design rule missing: ${selector}`);
  let depth = 0;
  for (let index = source.indexOf('{', start); index < source.length; index++) {
    if (source[index] === '{') depth++;
    if (source[index] === '}' && --depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`Original design rule incomplete: ${selector}`);
}

function range(source, from, to) {
  const start = source.indexOf(from), end = source.indexOf(to, start);
  assert.ok(start >= 0 && end > start, `Original design range missing: ${from}`);
  return source.slice(start, end);
}

/** Keep the authored material, type, name and hero rules verbatim from the site. */
export function originalMaintenanceStyles(root) {
  const css = readFileSync(path.join(root, 'src/index.css'), 'utf8');
  const hero = readFileSync(path.join(root, 'src/sections/homeHighlights.css'), 'utf8');
  const mobile = css.indexOf('@media (max-width: 640px)');
  const licenses = ['Inter-OFL.txt', 'Instrument-Serif-OFL.txt'].map((name) => readFileSync(path.join(root, 'site/visual-assets', name), 'utf8')).join('\n');
  return `/* Original font licenses, redistributed with the unmodified WOFF2 files.\n${licenses.replaceAll('*/', '* /')}\n*/
@font-face{font-family:'Inter';font-style:normal;font-weight:100 900;font-display:swap;src:url('/_maintenance/inter-latin.woff2') format('woff2')}
@font-face{font-family:'Instrument Serif';font-style:italic;font-weight:400;font-display:swap;src:url('/_maintenance/instrument-serif-italic-latin.woff2') format('woff2')}
:root{--font-body:'Inter',sans-serif;--font-display:'Instrument Serif',serif;color-scheme:light}
*{box-sizing:border-box}html,body{margin:0;width:100%;min-height:100%;font-family:var(--font-body);color:#23364a}html{background:#edf3f7}body{height:100dvh;overflow:hidden;background:#f8fafc}h1,h2,p{margin:0}
.fixed{position:fixed}.absolute{position:absolute}.inset-0{inset:0}.z-0{z-index:0}.overflow-hidden{overflow:hidden}.bg-black{background-color:#000}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
#maintenance-background{position:fixed;inset:0;z-index:0;pointer-events:none}
${rule(css, '.shader-gradient-surface')}
${range(css, '.hero-name-cutout-layer {', '.hero-thesis-glass-button {')}
${range(css, '.hero-thesis-glass-button {', '.hero-thesis-glass-button--thesis .hero-thesis-glass-label {')}
${rule(css, '.tahoe-glass-filter-defs')}
${rule(css, '.portfolio-stage')}
${rule(css, '.portfolio-stage::before')}
${hero.slice(0, hero.indexOf('.home-highlights,'))}
@media(max-width:640px){${['.hero-name-cutout-layer-desktop', '.hero-name-cutout-layer-mobile', '.hero-name-cutout-mask-text-mobile'].map((selector) => rule(css, selector, mobile)).join('\n')}}
${hero.slice(hero.indexOf('@media (max-width: 640px)'))}
.maintenance-shell{position:fixed;inset:0;z-index:10;padding:12px}
.portfolio-frame{position:relative;width:100%;max-width:1426px;height:100%;margin:auto}
.portfolio-stage{position:relative;width:100%;height:100%;overflow-x:hidden;overflow-y:auto;border-radius:24px;background-color:rgba(247,251,255,.72);scrollbar-width:thin;scrollbar-color:#637e9355 transparent}
#portfolio-main{position:relative;z-index:10;min-height:100%;outline:none}
.homepage-hero{min-height:calc(100dvh - 26px);padding-block:48px 36px}
.section-marker{position:fixed;top:36px;left:24px;z-index:30;pointer-events:none;color:#7c8999;font-size:12px;font-weight:400;letter-spacing:.34em;text-transform:uppercase}
.notice{max-width:640px;margin:30px auto 0;padding:24px 16px 0;border-top:1px solid #ffffff80}
.notice h2{display:inline-flex;align-items:center;gap:10px;color:#42566d;font-size:.78rem;font-weight:600;line-height:1.4;letter-spacing:.04em}
.notice-dot{width:6px;height:6px;border-radius:50%;background:#987349;box-shadow:0 0 0 4px #98734914}
.notice p{max-width:600px;margin:13px auto 0;color:#42566d;font-size:.875rem;line-height:1.7;text-wrap:pretty}
.contact{margin:24px auto 0}.contact-heading{margin-bottom:15px;color:#52667b;font-size:.76rem;line-height:1.5}
.contact-links{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:14px}
.contact-links .hero-thesis-glass-button{width:180px;height:56px;flex:none}
.email-address{margin:16px 0 0;color:#52667b;font-size:.75rem;line-height:1.5;overflow-wrap:anywhere}
.hero-thesis-glass-button:focus-visible{outline:2px solid #2a5f84;outline-offset:4px}
@media(min-width:640px){.maintenance-shell{padding:20px}.portfolio-stage{border-radius:34px}.homepage-hero{min-height:calc(100dvh - 42px)}.section-marker{left:32px}}
@media(min-width:768px){.section-marker{left:48px;top:40px}}
@media(min-width:1024px){.maintenance-shell{padding:16px}.homepage-hero{min-height:calc(100dvh - 34px)}.section-marker{left:64px}}
@media(max-width:640px){.homepage-hero{padding:48px 20px 32px}.notice{margin-top:24px;padding:22px 0 0}.notice p{font-size:.84rem}.contact-links{max-width:280px;gap:12px;margin:auto}.contact-links .hero-thesis-glass-button{width:100%}.homepage-hero__experience{max-width:26rem}.email-address{margin-top:16px}}
@media(prefers-reduced-motion:reduce){.shader-gradient-surface,.hero-thesis-glass-button{transition:none}.hero-thesis-glass-button:hover,.hero-thesis-glass-button:active{transform:none}}
@media(forced-colors:active){.hero-thesis-glass-button{border:1px solid ButtonText}.hero-thesis-glass-lens{display:none}.hero-name-cutout-surface{fill:CanvasText}}
`;
}
