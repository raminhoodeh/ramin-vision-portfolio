# Portfolio Section Specs

These files are the tracking specs for the final public portfolio structure. They are intentionally separate from implementation files so design and build work can be checked against a stable hierarchy.

The currently refreshed implementation specs are Navigation, Experience & Education, Personal Projects, Teaching/Speaking/Writing, and AI Ramin. The Hero, Contact CTA, and Bonus specs are intentionally not refreshed in this pass.

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
- The same bottom nav element is rendered across every page.
- The bar is short at rest and expands on hover, focus, or active pointer interaction.
- Labels are hidden at rest and revealed in the expanded state.
- Only the selected item has an inner highlighted glass pill.
- Inactive items do not gain inner-pill highlighting on hover.
- The nav sits low against the stage, with a small visible gap below it.
- Navigation changes the active section and mounts only that section in the main portfolio stage.
- The URL hash reflects the selected normal section.
- `AI Ramin` opens the chatbot modal from the bottom bar and is not a normal scroll section.

## Current Implementation Components

- `experience-education` mounts `ExperienceEducationSection`.
- `projects` mounts `CaseStudyGrid`.
- `teaching-speaking-writing` mounts `TeachingWritingShelf`.
- `AI Ramin` opens `AiRaminModal` from the shared bottom nav.
- `hero`, `contact`, and `bonus` are documented in their own specs but were not updated in this documentation pass.

## Preview Rule

The canonical local preview is:

```txt
http://127.0.0.1:4182/
```

The active Codex preview during the current implementation work has used:

```txt
http://127.0.0.1:4183/
```

Do not start an extra dev server if the chosen preview port is already occupied. Reuse or stop the old server before starting another one.

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
