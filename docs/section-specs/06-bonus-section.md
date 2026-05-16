# 06 Bonus Section

## Purpose

Reward the user for reaching the end of the site with an interactive, memorable reveal using the preserved 3D/WebGL rock assets.

## Public Anchor

- `bonus`

## Navigation Spec

- Bottom nav label: `Bonus`
- Nav target: `bonus`
- Icon: `bonus`
- Current implementation: selected through the bottom liquid-glass `BottomNavigation` bar.
- On selection, `activeSection` becomes `bonus`, the hash becomes `#bonus`, and `ActivePortfolioSection` mounts only `BonusSection`.
- The WebGL rock remains inside this section; it should not be moved into navigation or the AI Ramin modal.

## Source Data

- `portfolioContent.bonus`

## Required Content

Hook:

```txt
Congratulations, you've reached the bonus section!
```

Body:

```txt
As a reward for making it this far, click the magical rock 3 times to reveal 4 incredible gifts...
```

Required 3D element:

- The 3D WebGL exploding rock element from the original Ventures scrape
- Triggered after 3 clicks

Required gifts:

- 100% coupon code for new AI PM Course: `AIPMFUTURE`
- 30 minute AI Product consultation, with Google Meet link
- Lifetime membership to Dreamsea, with instructions: download and enter `iloverazin` as the username to activate the secret lifetime access
- AI Tools Database, an organised list of over 350 AI tools categorised by use case, with spreadsheet link

## 3D/WebGL Preservation Rule

Do not delete or simplify the 3D/WebGL data needed for this section. The rock phase depends on preserved assets and engine code, including the `gl` assets and Three.js loader/rendering path.

## Required UX

- The rock interaction must be understandable without over-explaining it.
- The rock should visibly react to clicks and explode/reveal after the third click.
- Gifts should remain hidden until the reveal state.
- Missing Google Meet or spreadsheet links must use intentional placeholders.
- The bonus section must remain a real section, not a modal-only experience.

## Implementation Checklist

- [ ] Bonus section reads from `portfolioContent.bonus`.
- [ ] Rock appears as a WebGL/3D element.
- [ ] Three-click trigger is implemented.
- [ ] Gift reveal state is implemented.
- [ ] All four gifts appear after reveal.
- [ ] WebGL assets and loaders remain preserved.

## Acceptance Test

After three clicks, the user sees the rock reveal four concrete gifts and the interaction feels like a deliberate reward rather than a decorative gimmick.
