# Projects Phase 8 QA Report

Date: 2026-05-19
Preview: `http://127.0.0.1:4183/#projects`

## Summary

Phase 8 passed after two small polish fixes:

- The Projects act rail now stays collapsed after click/focus and only expands on hover, so it no longer covers the Architecture kernel after navigation.
- The visible case-study `Close` button now owns `aria-label="Close case study"`; the backdrop has a separate label.

## Desktop Captures

| View | Result | Screenshot |
| --- | --- | --- |
| Hero / Atlas | 1440px viewport, no horizontal overflow, desktop act rail visible and collapsed. | `artifacts/projects-phase8-desktop-hero.png` |
| Architecture kernel | Architecture top aligned at viewport start, rail active state updates to Architecture, rail remains collapsed. | `artifacts/projects-phase8-desktop-architecture.png` |
| Reader overlay | Qadam case study opens, visible close control is uniquely labelled, close removes overlay. | `artifacts/projects-phase8-reader-overlay.png` |

## Mobile Captures

| View | Result | Screenshot |
| --- | --- | --- |
| Hero | 390px viewport, no horizontal overflow, act rail hidden, hero text/buttons fit. | `artifacts/projects-phase8-mobile-hero.png` |
| Selfware card | `Enter atlas` lands on the first product card, no horizontal overflow. | `artifacts/projects-phase8-mobile-selfware.png` |
| Architecture | `See architecture` lands on the Architecture section, no horizontal overflow. | `artifacts/projects-phase8-mobile-architecture.png` |

## Measurements

- Desktop hero: stage width `1440 / 1440`, body width `1440`, rail width `53.5938px`.
- Desktop architecture: section top `0.117px`, active rail `03 Architecture`, rail width `53.5938px`.
- Mobile hero: stage width `390 / 390`, project width `390 / 390`, rail display `none`.
- Mobile selfware: section top `0.125px`, stage width `390 / 390`.
- Mobile architecture: section top `-0.046875px`, stage width `390 / 390`, body width `390`.
- Reader overlay: `Open reader` controls found `7`; visible labelled close control found `1`; after close, close controls found `0`.

## Verification

- `npm run check:content` passed.
- `npm run build` passed.
- `npm run check:rock-assets` passed.
- `npm run check:performance-guardrails` passed.
- `npm run verify` passed.
- `PREVIEW_URL=http://127.0.0.1:4183/ npm run check:preview` passed.

Known warning: Vite still reports large chunks after minification; this is the existing bundle-size warning from Three/shader chunks, not introduced by Phase 8.
