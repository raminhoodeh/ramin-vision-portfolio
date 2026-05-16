# 00 Navigation

## Purpose

Define the current bottom navigation implementation so future design work does not drift back to the old top navbar or left rail.

## Current Display Labels

The public navigation displays these labels:

```txt
Intro
Work
Projects
Thoughts
Contact
Bonus
AI Ramin
```

## Current Target Mapping

The display labels map onto the locked site structure like this:

```ts
[
  { label: 'Intro', target: 'hero', icon: 'intro' },
  { label: 'Work', target: 'experience-education', icon: 'work' },
  { label: 'Projects', target: 'projects', icon: 'projects' },
  { label: 'Thoughts', target: 'teaching-speaking-writing', icon: 'thoughts' },
  { label: 'Contact', target: 'contact', icon: 'contact' },
  { label: 'Bonus', target: 'bonus', icon: 'bonus' },
  { label: 'AI Ramin', target: 'ai-ramin', icon: 'ai' },
]
```

`AI Ramin` opens the chatbot modal. It does not mount a normal page section and is not part of `navLinks` in `src/data/portfolio.ts`.

## Source Data

`navLinks` in `src/data/portfolio.ts` remains the structural source for public page sections:

```ts
[
  { label: 'Hero', target: 'hero' },
  { label: 'Experience & Education', target: 'experience-education' },
  { label: 'Projects', target: 'projects' },
  { label: 'Teaching, Speaking & Writing', target: 'teaching-speaking-writing' },
  { label: 'Contact', target: 'contact' },
  { label: 'Bonus', target: 'bonus' },
]
```

The bottom nav uses shorter display labels for the SwiftUI-style liquid-glass treatment.

## Current Implementation Files

- `src/App.tsx`: `BottomNavigation`, `bottomNavigationLinks`, `handleBottomNavigation`, `activeSection`, `ActivePortfolioSection`
- `src/data/portfolio.ts`: structural `navLinks`
- `src/components/LiquidGlassJsNavShellReadable.tsx`: real liquid-glass JS bridge, bottom orientation, icon insertion, and active-state handling
- `src/index.css`: bottom bar positioning, active expansion, icon/text styling, responsive sizing

## Current UX Model

- The site uses a section-switching portfolio stage.
- Only the active public section is mounted in the main stage.
- Clicking a section navigation item sets `activeSection`.
- The URL hash is replaced with the active target, for example `#projects`.
- The page scrolls back to the top after section navigation.
- `hashchange` updates `activeSection` when the hash changes manually.
- `AnimatePresence` transitions between mounted sections.
- Clicking `AI Ramin` opens the chatbot modal and visually activates the `AI Ramin` nav item while the modal is open.

This is not a traditional long-page scrollspy implementation.

## Current Bottom Bar Behavior

The visible public navigator is `BottomNavigation` in `src/App.tsx`.

It renders:

- A fixed `<nav>` with class `portfolio-bottom-navigation`.
- `LiquidGlassJsNavShell` with:
  - `orientation="bottom"`
  - `showLogo={false}`
  - `showCta={false}`
  - `navLabel="Portfolio navigation"`
  - icon + label data for all seven display items

## Active Item Behavior

- Bottom nav items use equal-width inner glass pills.
- Active item keeps the same width as every other item.
- Bottom nav maximum width is `43.9875rem`; each equal tab slot is `5.7rem` wide with enough height for icon + label breathing room.
- Inner pill surface, border, and opaque fill appear only on the selected item; inactive items show only icon and label.
- Selected inner pill uses the WebGL liquid-glass button canvas with the demo control values: edge `0.01`, rim `0.05`, base `0.01`, distances `0.15 / 0.8 / 0.1`, corner `0.02`, ripple `0.1`, blur `5`, tint `0.2`.
- CSS fill on the selected inner pill must stay minimal so refraction remains visible.
- Labels sit inside each inner glass pill, underneath the icon.
- Icons and labels share the same dark foreground color in active and inactive states, use no text/icon shadow, and labels use regular/medium weight rather than bold.
- Bottom labels use the real liquid-glass button text element; `data-nav-label` remains available as metadata.
- Desktop inactive items also show their underneath label without selection.
- Narrow mobile items may collapse to icon-first behavior to fit the viewport.
- `AI Ramin` becomes the active nav item while the chatbot modal is open.
- Selecting any normal section closes the AI Ramin modal and returns to section navigation.

## Liquid Glass Implementation

Navigation uses the real liquid-glass JS implementation through `LiquidGlassJsNavShellReadable.tsx`.

The file imports raw source from:

```txt
react libraries/liquid-glass-js-main/container.js
react libraries/liquid-glass-js-main/button.js
```

It evaluates the library once, patches the engine for the portfolio, and creates a WebGL-backed container/button system.

Current glass controls:

```ts
{
  edgeIntensity: 0.026,
  rimIntensity: 0.072,
  baseIntensity: 0.006,
  edgeDistance: 0.18,
  rimDistance: 0.68,
  baseDistance: 0.08,
  cornerBoost: 0.014,
  rippleEffect: 0.085,
  blurRadius: 4.8,
  tintOpacity: 0.16,
  warp: false,
}
```

Current bottom nav construction:

- Container type: `pill`
- Container border radius: `36`
- Container tint opacity: `0.11`
- Button type: `pill`
- Button size: `14`
- Button tint opacity: `0.34`
- Button warp: `false`
- Active button tint increases by `0.1`, capped at `0.62`
- Icons are inserted as inline SVG elements inside each real liquid-glass button.
- The generated button text is hidden inside the inner pill; visible labels use the `data-nav-label` pseudo-label underneath the icon.
- The WebGL button sizes refresh immediately and again after the active-width transition so the shader matches the expanded pill shape.
- The selected bottom-nav button suppresses its nested child canvas to avoid stale circular texture artifacts during active expansion; the parent bar remains WebGL-backed.
- Inner pills use a stronger translucent fill so labels remain readable over the animated background.

Snapshot refresh:

- `SNAPSHOT_REFRESH_MS = 420`
- Texture refresh runs on interval, resize, scroll, and visibility return.

## Navigation Rules

- Do not reintroduce the old horizontal top navbar as the primary public nav.
- Do not reintroduce the left rail as the primary public nav.
- Keep AI Ramin inside the bottom navigation as the modal trigger.
- Do not mount AI Ramin as a normal section.
- Do not split `Experience & Education` into separate top-level Work and Qualifications sections.
- Use `Thoughts` only as the short bottom-nav display label for `teaching-speaking-writing`.
- If the nav implementation changes, update this file and the per-section Navigation Spec blocks in the section files.

## Implementation Checklist

- [ ] Bottom nav displays `Intro`, `Work`, `Projects`, `Thoughts`, `Contact`, `Bonus`, and `AI Ramin`.
- [ ] Each item has an icon.
- [ ] Active item expands around the icon.
- [ ] Labels sit underneath icons, outside the inner glass pill.
- [ ] Desktop inactive labels are visible without selection.
- [ ] Bottom nav uses `LiquidGlassJsNavShell` with `orientation="bottom"`.
- [ ] Bottom nav uses source from `react libraries/liquid-glass-js-main`.
- [ ] AI Ramin opens the chatbot modal.
- [ ] AI Ramin is absent from structural `navLinks`.
- [ ] Navigation changes `activeSection` and mounts only the selected section.
- [ ] URL hash updates to the active section target for normal sections.
