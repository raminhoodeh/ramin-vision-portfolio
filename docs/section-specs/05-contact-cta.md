# 05 Contact CTA

## Purpose

End the main portfolio with a direct, memorable invitation to start a role or project conversation.

## Public Anchor

- `contact`

## Navigation Spec

- Bottom nav label: `Contact`
- Nav target: `contact`
- Icon: `contact`
- Current implementation: selected through the bottom liquid-glass `BottomNavigation` bar.
- On selection, `activeSection` becomes `contact`, the hash becomes `#contact`, and `ActivePortfolioSection` mounts only `ContactCtaSection`.
- Any CTA shortcut should route to this target rather than creating a separate contact/footer nav item.

## Source Data

- `portfolioContent.contactCta`

## Required Content

Artistic hero text:

```txt
CLARITY . JUDGEMENT . TASTE . EMPATHY . VISION
```

Hook:

```txt
Do you have a role in mind?
```

Headline:

```txt
Let's create beautiful things that the world really needs
```

CTA options:

- Email, with the full email visible in the label
- WhatsApp, using a deep link

## Required UX

- The section must be visually strong enough to feel like an intentional closing CTA.
- Email and WhatsApp must be clear action choices.
- The artistic hero text must not be misspelled as `CLARTY`.
- Do not add extra social/link clutter unless it is intentionally part of the final CTA spec.

## Implementation Checklist

- [ ] Contact section reads from `portfolioContent.contactCta`.
- [ ] Artistic hero text uses `CLARITY`.
- [ ] Email CTA shows the full email address.
- [ ] WhatsApp CTA uses a supplied deep link or an intentional placeholder.
- [ ] No old footer copy conflicts with the CTA.

## Acceptance Test

The user reaches the section and immediately understands how to contact Ramin and why the invitation matters.
