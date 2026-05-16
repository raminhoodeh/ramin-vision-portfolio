# Ramin Vision Portfolio Handoff

## Canonical Repository

```txt
https://github.com/raminhoodeh/ramin-vision-portfolio
```

This repository is now the canonical working copy for continuing the portfolio on another laptop or in another Codex session.

## Local Setup

```bash
npm install
npm run verify
npm run dev
```

Preview URL:

```txt
http://127.0.0.1:4182/
```

If `npm run dev` fails with `Port 4182 is already in use`, stop the old server first:

```bash
lsof -nP -iTCP:4182 -sTCP:LISTEN
kill <PID>
npm run dev
```

Do not start duplicate dev servers on random ports. Use `4182` as the single preview port unless the user explicitly asks otherwise.

## Current Product Structure

The website should follow the agreed structure:

1. Hero
2. Experience & Education
3. Personal Projects
4. Teaching, Speaking & Writing
5. Contact CTA
6. Bonus Section
7. AI Ramin Chatbot modal

Section specs live in:

```txt
docs/section-specs/
```

Use those files as the source of truth before changing a section.

## Current Design State

- The site is a light/silver portfolio experience with an animated shader background.
- The bottom navigation is the active navigation direction.
- The old top nav and left rail experiments should not be revived unless explicitly requested.
- Keep the WebGL and 3D assets. They are needed for the Bonus rock phase.

Important assets/code to preserve:

```txt
react libraries/liquid-glass-js-main/
gl/
src/components/LiquidGlassJsNavShellReadable.tsx
src/components/ShaderGradientBackground.tsx
```

## Bottom Liquid Glass Navigation

The bottom nav uses the local WebGL liquid-glass library from:

```txt
react libraries/liquid-glass-js-main/
```

It is wired through:

```txt
src/components/LiquidGlassJsNavShellReadable.tsx
src/index.css
src/App.tsx
```

Current navigation labels:

```txt
Intro
Work
Projects
Thoughts
Contact
Bonus
AI Ramin
```

Current behavior:

- Inactive items show only dark icon + dark label.
- Inactive inner pills should have no visible border, fill, canvas, shadow, or blur.
- Selected item shows the inner liquid-glass pill.
- Selected label stays dark/black for readability.
- Labels are inside each inner pill, below the icon.
- Text descenders must not clip. Current fix uses visible overflow, more line height, and bottom padding on `.glass-button-text`.

Current WebGL control values are based on the Liquid Glass JS demo:

```txt
edgeIntensity: 0.01
rimIntensity: 0.05
baseIntensity: 0.01
edgeDistance: 0.15
rimDistance: 0.8
baseDistance: 0.1
cornerBoost: 0.02
rippleEffect: 0.1
blurRadius: 5
tintOpacity: 0.2
warp: false
```

Do not replace the liquid-glass implementation with CSS-only blur. CSS should support the WebGL effect, not mask it.

## Current Verification Status

The latest checks passed:

```bash
npm run verify
```

This runs:

```bash
npm run check:content
npm run build
```

The Vite build currently emits a chunk-size warning because of Three.js / shader dependencies. That warning is not fatal.

## Important Cautions For Future Sessions

- Do not remove `react libraries/liquid-glass-js-main/`.
- Do not remove `gl/`.
- Do not reintroduce top nav / left rail unless the user asks.
- Do not create new preview URLs casually.
- Before previewing, check whether port `4182` is already in use.
- If GitHub work is needed, use the canonical repo above.
- If a token was pasted in chat, treat it as exposed and tell the user to revoke it. Do not echo or use it.

## Suggested Next Work

1. Continue visual QA of the bottom liquid-glass nav at `http://127.0.0.1:4182/`.
2. Clean up legacy navigation/component experiments once the bottom nav is approved.
3. Continue section implementation strictly from `docs/section-specs/`.
4. Build the Bonus Section later using the preserved 3D/WebGL rock assets.
