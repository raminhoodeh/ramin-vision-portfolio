# Homepage glass carousel

Implemented on the private `codex/site-preview` branch. The public production site stays under construction. Only the three homepage product previews change; the commercial outcome cards remain a grid. All product labels, descriptions, case-study URLs and public product URLs still come from `homepageProducts`.

## Interaction and content

`GlassCarousel.tsx` keeps the three cards as real, stable HTML. Previous/next buttons, direct product selectors and a concise live announcement provide keyboard and screen-reader navigation. The focused stage also supports Left/Right and Home/End. Case links work in one click, and the existing reader return restores the selected card and opener focus.

Desktop copy remains selectable; drag the exposed glass surface or decorative glyph to move the carousel. Touch can swipe across non-link card content. A horizontal gesture captures the pointer only after the direction is clear; vertical gestures remain native page scrolling. Drag completion suppresses the synthetic click. There is no automatic rotation.

The CSS fallback presents all three readable cards and native links without the renderer. Reduced motion, Save-Data, 2G/slow-2G, devices reporting 2GB or less, failed loading, unavailable WebGL2 and context loss use this fallback. A 3G connection or 4GB device can use the renderer when the section enters view.

## Glass and rendering

The optional `createGlassScene.ts` module uses the site's existing Three r172 runtime and native physical transmission material. There is one canvas for all three rounded, beveled panes, a bundled studio environment and an opaque procedural backdrop that the glass can actually refract. Soft projected floor shading is an artistic lighting treatment, not a photon caustics simulation. HTML elsewhere on the page is not sampled by the glass shader.

A 1400px camera perspective matches the CSS perspective. `layout.ts` supplies the same positions and angles to HTML and WebGL, while the controller shares measured card dimensions and expands surfaces for overflowing copy. Lighting and geometry change during drag/selection, then settle. The loop stops when idle, offscreen or when the document is hidden. DPR is capped at 1.5; the shared Three transmission buffer uses a 0.8 resolution scale. No external HDR or new runtime package is downloaded.

The scene is dynamically imported near visibility, after the homepage is usable. It never gates `PortfolioAppReady` or the independently readable first HTML. Resize observers, intersection observers, listeners, pointer capture, frames, geometries, materials, environment targets and the WebGL context are cleaned up when the component is disposed. Matching Three type declarations were added as a development dependency.

## Verification

- Full `npm run verify:portfolio` passed, including 27 built readable routes, aliases, metadata, Preview indexing controls, CV removal, claims, offline AI checks, accessibility and performance guards.
- The initial dependency graph keeps the renderer and Three deferred. Initial JavaScript changed from 533,462 to 542,991 bytes (gzip estimate 177,363 to 180,512), with the 3D renderer loaded separately.
- Browser checks passed for arrow and keyboard wraparound, desktop dragging, native text selection, a Dreamsea case open/close with selected-card/focus restoration, and mobile layout/controls/dragging at actual 390×844. All three cards had zero content overflow and the page had no horizontal overflow. A live resize feedback issue found during QA was corrected before release.
- The repo-wide TypeScript check remains non-clean: 39 diagnostics are outside the carousel files; the new carousel files have no diagnostics.
- Gemini account repair and provider-backed AI generation remain deferred. No generation or real feedback was submitted.

Run `npm run check:glass-carousel` for deterministic interaction, lifecycle, fallback and SSR coverage, and `npm run verify:preview` before future Preview deployments. Use `npm run deploy:preview` only after committing reviewed changes; it preserves the existing Production target and requires Vercel Authentication protection. Release remains a separate action when Ramin requests it.

The final deterministic suite has **43 passing behavioural checks**, including realistic size feedback; lazy loading and preference restrictions; idle/offscreen/hidden scheduling; import/create/dispose races; synchronous resize/render failures; primary-pointer ownership; drag cancellation and capture loss; native side-card link ownership; browser shortcut preservation; and actual SSR/native component controls. Side-card case navigation and opener focus were also verified in the browser after the final input corrections.
