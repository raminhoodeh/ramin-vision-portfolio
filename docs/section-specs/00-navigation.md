# 00 Navigation

## Purpose

Document the current shared bottom navigation so future work keeps one consistent liquid-glass control across every portfolio page.

## Current Display Labels

The public bottom navigation displays these labels:

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

`src/App.tsx` owns the display-level navigation array:

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

`AI Ramin` opens a modal. It is not a normal page section and must stay out of structural `navLinks`.

## Structural Source Data

`src/data/portfolio.ts` remains the source of truth for public page sections:

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

The bottom nav intentionally uses shorter display labels so the control can stay compact.

## Current Implementation Files

- `src/App.tsx`: `BottomNavigation`, `bottomNavigationLinks`, `handleBottomNavigation`, `activeSection`, `ActivePortfolioSection`
- `src/data/portfolio.ts`: structural `navLinks`
- `src/components/LiquidGlassJsNavShellReadable.tsx`: raw liquid-glass JS bridge, WebGL patches, icon insertion, adaptive refresh loop, active-state handling
- `src/index.css`: bottom-bar size, placement, hover expansion, active-only inner-pill treatment, responsive sizing

## Current UX Model

- The site uses a fixed viewport portfolio stage, not a long-page scrollspy.
- Only the selected public section is mounted in the main stage.
- Clicking a normal section item sets `activeSection`, replaces the URL hash, closes AI Ramin if it is open, and resets the stage scroll to the top.
- `hashchange` updates `activeSection` when a supported hash is entered manually.
- `AnimatePresence` transitions between mounted sections.
- Clicking `AI Ramin` opens the chatbot modal and visually activates the `AI Ramin` nav item while the modal remains open.
- Closing AI Ramin returns the bottom nav active state to the currently mounted page section.

## Current Bottom Bar Behavior

`BottomNavigation` renders one fixed `<nav className="portfolio-bottom-navigation">` on every page and passes all visible items into `LiquidGlassJsNavShell`.

Current shell props:

```tsx
<LiquidGlassJsNavShell
  navLinks={items}
  active={active}
  onNavigate={onNavigate}
  orientation="bottom"
  showLogo={false}
  showCta={false}
  navLabel="Portfolio navigation"
/>
```

## Size And Placement

The same element, dimensions, and positioning apply across all active sections:

- Fixed bottom placement through `.portfolio-bottom-navigation`
- Horizontal centering with `left: 50%` and `transform: translateX(-50%)`
- Bottom offset: `calc(env(safe-area-inset-bottom) + 0.25rem)`
- Rest width: `24.85rem`
- Maximum expanded width: `43.9875rem`
- Rest tab width: `3.05rem`
- Expanded tab width: `5.7rem`
- Rest tab height: `2.28rem`
- Expanded tab height: `3.46rem`
- Rest shell padding: `0.26rem 0.34rem`
- Expanded shell padding: `0.42rem 0.46rem`

The bar is intentionally slightly low, with a small visible gap under it, so it sits near the lower edge of the main white container without blocking too much content.

## Rest And Hover States

- At rest, the bar is short and compact.
- Resting icons are smaller than expanded icons.
- Labels are hidden at rest to keep the nav visually short.
- Hover, keyboard focus within the nav, active pointer interaction, or the internal expanded state enlarges the shell and reveals labels.
- Hovering off the nav returns it to the compact rest state.
- Expansion happens on the shared outer liquid-glass shell; individual inactive tabs do not become highlighted just because they are hovered.

## Active Item Behavior

- Only the selected item gets an inner liquid-glass pill.
- Inactive items show the icon and, when expanded, the label without a highlighted inner surface.
- Inactive tabs keep their nested button canvas hidden, with no `::before` or `::after` highlight.
- The active tab shows its nested WebGL canvas, border, subtle rim, and controlled fill.
- `AI Ramin` becomes the selected item only while the modal is open.
- Selecting any normal section closes the AI Ramin modal and returns the selected state to that section.

## Liquid Glass Engine

Navigation uses the real liquid-glass JS source from:

```txt
react libraries/liquid-glass-js-main/container.js
react libraries/liquid-glass-js-main/button.js
```

`LiquidGlassJsNavShellReadable.tsx` evaluates the library once and patches it for this portfolio:

- Requests WebGL with `alpha: true`
- Uses `powerPreference: 'high-performance'`
- Uses `desynchronized: true`
- Keeps `preserveDrawingBuffer: true` so texture capture remains stable
- Injects `u_time` into the shader program
- Adds animated ripple, caustic, and fine-grain movement inside the glass
- Tracks debug metrics through `window.__portfolioLiquidGlassNav`

Current glass control values:

```ts
{
  edgeIntensity: 0.01,
  rimIntensity: 0.052,
  baseIntensity: 0.006,
  edgeDistance: 0.15,
  rimDistance: 0.85,
  baseDistance: 0.1,
  cornerBoost: 0.018,
  rippleEffect: 0.075,
  blurRadius: 5.5,
  tintOpacity: 0.16,
  warp: false,
}
```

Current bottom construction:

- Container type: `pill`
- Container tint opacity: `0.38`
- Bottom button tint opacity: `0.3`
- Active button tint opacity: at least `0.46`
- Refresh mode: `adaptive-raf`
- Active texture refresh target: `24fps`
- Idle texture refresh target: `6fps`
- Floating idle refresh target: `4fps`
- Nested button render loop: `requestAnimationFrame`
- Maximum glass DPR: `1.65`

The refresh loop runs faster during hover, interaction, resize, scroll, or recent visual movement, then idles down when the page settles. Visibility changes pause or resume the loop.

## Navigation Rules

- Keep one shared bottom nav element across every page.
- Do not reintroduce the old top navbar as the primary public nav.
- Do not reintroduce a left rail as the primary public nav.
- Keep AI Ramin inside the bottom nav as a modal trigger.
- Do not mount AI Ramin as a normal section.
- Do not split `Experience & Education` into separate top-level Work and Qualifications sections.
- Use `Thoughts` only as the short bottom-nav display label for `teaching-speaking-writing`.
- If nav sizing, glass controls, or active-state behavior changes, update this file and the per-section navigation specs.

## Implementation Checklist

- [ ] Bottom nav displays `Intro`, `Work`, `Projects`, `Thoughts`, `Contact`, `Bonus`, and `AI Ramin`.
- [ ] The same bottom nav element appears on every page.
- [ ] The bar is compact at rest and expands on hover/focus/interaction.
- [ ] Icons are smaller at rest than in the expanded state.
- [ ] Labels are hidden at rest and revealed in the expanded state.
- [ ] Only the selected item has an inner highlighted glass pill.
- [ ] Inactive item hover does not create a persistent inner-pill highlight.
- [ ] The bar sits low with a small visible gap below it.
- [ ] Bottom nav uses `LiquidGlassJsNavShell` with `orientation="bottom"`.
- [ ] Bottom nav uses source from `react libraries/liquid-glass-js-main`.
- [ ] AI Ramin opens the chatbot modal and is absent from structural `navLinks`.
- [ ] Normal navigation changes `activeSection`, updates the URL hash, and mounts only the selected section.
