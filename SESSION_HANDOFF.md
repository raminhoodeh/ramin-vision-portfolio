# Portfolio Website Handoff

## Current Goal

Recreate a portfolio landing page inspired by `https://hashgraphvc.com/`, but customized as a personal portfolio. The current direction is:

- Keep the site mostly light, clean, silver, and fresh.
- Keep the animated ShaderGradient background visible outside the main site container.
- Put the whole portfolio inside a frosted/glass-like framed container.
- Avoid making the site feel dark, depressing, or overly 3D/tacky.
- Park heavy 3D objects for later; possibly add only one or two tasteful 3D/glass elements near the end.

## Current Local App

Workspace:

```txt
/Users/raminhoodeh/Desktop/website
```

Dev server has been running at:

```txt
http://127.0.0.1:3002/
```

Main stack:

- React
- Vite
- TypeScript
- Tailwind CSS v4
- GSAP
- Framer Motion
- hls.js still installed, but the current hero/footer no longer use the HLS background video
- ShaderGradient via `@shadergradient/react`
- Three / React Three Fiber dependencies for ShaderGradient

## Important Design Decisions

The user showed a GIF where the whole portfolio sits inside its own framed container, with the animated background outside it.

The latest intended balance is:

- Use the original darker blue ShaderGradient background from the user’s provided snippet.
- Do not make the entire site dark.
- Keep the portfolio content in a light frosted stage, so the content remains readable and fresh.
- The ShaderGradient should still be visible around the outside of the site container and subtly through the frosted shell.

The previous mistake was making the shader itself too pale, which made the background disappear. That was corrected by restoring the original ShaderGradient values.

## Key Files

App structure:

```txt
src/App.tsx
src/main.tsx
src/index.css
src/data/portfolio.ts
```

Components:

```txt
src/components/ShaderGradientBackground.tsx
src/components/LoadingScreen.tsx
src/components/LiquidGlassNavShell.tsx
src/components/LiquidGlassJsNavShell.tsx
src/components/HlsVideo.tsx
```

Local reference libraries:

```txt
react libraries/liquid-glass-js-main/
shadergradient-main/packages/shadergradient
react libraries/shadergradient-main/
```

Parked 3D notes:

```txt
parked-3d-notes.md
```

## Current ShaderGradient State

`src/components/ShaderGradientBackground.tsx` currently restores the user’s original shader direction:

- black base
- `color1="#63bdf9"`
- `color2="#5a769d"`
- `color3="#fafdff"`
- `grain="on"`
- `brightness={1.2}`
- same camera / rotation / density / strength values from the user’s snippet

It is wrapped as a fixed full-page background behind the app.

Some export-only props from the original snippet are intentionally not passed to `ShaderGradient` because they are not runtime props for `@shadergradient/react`, for example:

- `axesHelper`
- `bgColor1`
- `bgColor2`
- `destination`
- `embedMode`
- `format`
- `frameRate`
- `gizmoHelper`

`pixelDensity` and `fov` are applied to `ShaderGradientCanvas`.

## Current Portfolio Container

The main portfolio stage is in `src/App.tsx` around the page content:

```tsx
<div className="relative z-10 p-3 sm:p-6 lg:p-12">
  <div className="portfolio-stage ...">
    ...
  </div>
</div>
```

The `.portfolio-stage` CSS is in `src/index.css`. It is currently a frosted light shell:

- semi-transparent white/blue gradient
- border with white translucency
- dark/blue shadow for separation from the shader background
- `backdrop-filter: blur(...) saturate(...)`
- pseudo-element overlay for top sheen and blue tint

## Liquid Glass Nav Work In Progress

The user asked to test:

```txt
react libraries/liquid-glass-js-main
```

on the top nav first, now that the HLS background video is gone.

Reference page:

```txt
https://dashersw.github.io/liquid-glass-js/
```

Important finding:

- The local `liquid-glass-js-main` library uses WebGL for the glass effect.
- Its default capture path relies on `html2canvas`.
- `html2canvas` previously failed against this app because Tailwind v4 generated modern `oklab` / `color-mix` CSS.
- So the current approach is to use the local `Container` class, but patch/override its page capture to sample the live ShaderGradient canvas (`#gradientCanvas`) directly instead of using `html2canvas`.

Files involved:

```txt
src/components/LiquidGlassJsNavShell.tsx
src/index.css
src/App.tsx
```

`src/components/LiquidGlassJsNavShell.tsx` was just added. It:

- imports the local library source as raw text:

```ts
import containerSource from '../../react libraries/liquid-glass-js-main/container.js?raw';
```

- evaluates the local `Container` class in the browser
- patches `Container.prototype.capturePageSnapshot`
- draws `#gradientCanvas` into a viewport-sized canvas
- sets that as `Container.pageSnapshot`
- renders the nav children through a React portal into the local library’s generated glass element

`src/App.tsx` was changed to import and use:

```ts
import { LiquidGlassJsNavShell } from './components/LiquidGlassJsNavShell';
```

instead of the previous custom:

```ts
LiquidGlassNavShell
```

Important: this Liquid Glass JS swap was interrupted before a build/browser QA was completed. The next session should immediately verify it.

## Previous Custom Glass Nav

There is an older custom implementation:

```txt
src/components/LiquidGlassNavShell.tsx
```

This custom component directly sampled:

```txt
[data-glass-media], #gradientCanvas
```

and used its own WebGL shader. It worked reasonably, but the user specifically asked to retest the actual `liquid-glass-js-main` library.

Do not delete the old custom component yet. It is a fallback if the local library proves too brittle.

## Next Steps

1. Run:

```bash
npm run build
```

2. If TypeScript/Vite errors appear, first check:

```txt
src/components/LiquidGlassJsNavShell.tsx
```

Likely risk areas:

- raw import typing
- the path with a space: `../../react libraries/...`
- `new Function(...)`
- type definitions around `Container`

3. Open:

```txt
http://127.0.0.1:3002/
```

4. Visually inspect the nav:

- Does the nav render at all?
- Does the nav glass show distorted ShaderGradient behind it?
- Does the nav remain readable?
- Does it update while the ShaderGradient animates?
- Does it avoid console errors?

5. If the nav is blank or stale:

- Confirm the ShaderGradient canvas exists:

```js
document.querySelector('#gradientCanvas')
```

- Confirm the library instance exists:

```js
window.Container?.instances
```

6. If `html2canvas` errors reappear, that means the local library’s original capture path is still being called. The patch in `LiquidGlassJsNavShell.tsx` needs to run before `new Container(...)`.

7. If the real library is too brittle, switch `App.tsx` back to:

```ts
import { LiquidGlassNavShell } from './components/LiquidGlassNavShell';
```

and use:

```tsx
<LiquidGlassNavShell>...</LiquidGlassNavShell>
```

The custom implementation already avoids `html2canvas`.

## Verification Already Done Before Interruption

Before the Liquid Glass JS swap:

- `npm run build` passed.
- The ShaderGradient rendered correctly.
- The light frosted portfolio container displayed correctly.
- The original shader background was visible around the container again.

Known build warning:

```txt
Some chunks are larger than 500 kB after minification
```

This is expected because ShaderGradient pulls in Three / React Three Fiber.

## User Preference Notes

- User wants honesty and practical judgment.
- User does not want the site to look dark/depressing.
- User also does not want “light mode” interpreted so literally that the dramatic background disappears.
- The right visual target is premium, fresh, silver, glassy, and dimensional.
- Avoid random/tacky 3D.
- Test changes visually before declaring them done.

