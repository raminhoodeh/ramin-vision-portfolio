# Portfolio Section Specs

These files are the tracking specs for the final public portfolio structure. They are intentionally separate from implementation files so design and build work can be checked against a stable hierarchy.

## Locked Public Structure

0. [Navigation](./00-navigation.md)
1. [Hero](./01-hero.md)
2. [Experience & Education](./02-experience-education.md)
3. [Personal Projects: Tools & Selfware](./03-personal-projects.md)
4. [Teaching, Speaking & Writing](./04-teaching-speaking-writing.md)
5. [Contact CTA](./05-contact-cta.md)
6. [Bonus Section](./06-bonus-section.md)
7. [AI Ramin Chatbot](./07-ai-ramin-chatbot.md)

## Source Of Truth

- Content should come from `src/data/portfolio.ts`.
- Public UI should follow the hierarchy above.
- Public navigation should follow [00 Navigation](./00-navigation.md).
- Do not reintroduce old standalone sections such as separate `Work`, separate `Qualifications`, `Thoughts`, or `Ramin.AI` as a normal scroll section.
- AI Ramin is a bottom-nav launcher and modal, not a standard page section.
- Missing real content must use intentional placeholders, not invented proof.

## Current Navigation Implementation

- Public navigation is a bottom SwiftUI-style liquid-glass bar.
- Display labels are `Intro`, `Work`, `Projects`, `Thoughts`, `Contact`, `Bonus`, and `AI Ramin`.
- Active items expand horizontally around the icon.
- Labels sit underneath each icon, outside the inner glass pill.
- Desktop inactive labels are visible without needing selection.
- Navigation changes the active section and mounts only that section in the main portfolio stage.
- The URL hash reflects the selected normal section.
- `AI Ramin` opens the chatbot modal from the bottom bar and is not a normal scroll section.

## Preview Rule

The canonical local preview is:

```txt
http://127.0.0.1:4182/
```

Do not start an extra dev server if port `4182` is already occupied. Stop the old server first, then restart the canonical one.

## Placeholder Policy

Use these explicit placeholder styles where content has not been supplied:

```ts
placeholder('Logo needed')
placeholder('Video needed')
placeholder('Link needed')
placeholder('Review needed')
placeholder('Detail needed')
```

Do not invent logos, grades, reviews, videos, spreadsheet links, Google Meet links, partner bios, or live links.
