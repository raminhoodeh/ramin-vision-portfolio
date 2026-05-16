# 01 Hero

## Purpose

Introduce Ramin immediately as the subject of the site and create a clear route into the Thesis.

## Public Anchor

- `hero`

## Navigation Spec

- Bottom nav label: `Intro`
- Nav target: `hero`
- Icon: `intro`
- Current implementation: selected through `BottomNavigation` in `src/App.tsx`, which passes icon + label data into `LiquidGlassJsNavShell`.
- On selection, `activeSection` becomes `hero`, the hash becomes `#hero`, and `ActivePortfolioSection` mounts only `Hero`.
- Active state expands the `Intro` glass pill.

## Source Data

- `portfolioContent.hero`

## Required Content Fields

- `name`
- `role`
- `headline`
- `profilePicture`
- `pmOsThesisCta`

## Required UX

- The section must show the name clearly and legibly.
- The role line must preserve the intended rotating-word treatment: Product `[Manager | Engineer | Teacher]` and Fiction Author.
- The role line must not sit inside a pill.
- The rotating word must be visually aligned with the surrounding words and must not be larger than the rest of the line.
- The headline must be directly readable and not hidden behind effects.
- The profile picture must be present in the hero content or intentionally marked as deferred in the implementation tracker.
- The Thesis CTA must link to the PM OS Thesis destination.

## Visual Rules

- Keep the cinematic shader/glass atmosphere.
- Avoid faded primary identity text; the name must have enough contrast to read.
- Role and loading-screen text should use a dark silver tone rather than harsh black.
- Do not add generic resume copy or unrelated hero stats.

## Implementation Checklist

- [ ] Hero reads from `portfolioContent.hero`.
- [ ] Name, role, headline, profile picture, and Thesis CTA are all represented.
- [ ] Rotating role text is sized and aligned correctly.
- [ ] Thesis CTA points to the supplied Thesis link.
- [ ] No legacy hero copy has returned.

## Acceptance Test

On first load, the user can identify who the site is for, what Ramin does, and where to open the Thesis without scrolling.
