# 03 Personal Projects: Tools & Selfware

## Purpose

Show Ramin's personal products, tools, agents, and selfware as hands-on evidence of AI-native product thinking.

## Public Anchor

- `projects`

## Navigation Spec

- Bottom nav label: `Projects`
- Nav target: `projects`
- Icon: `projects`
- Current implementation: selected through the shared bottom liquid-glass `BottomNavigation`.
- On selection, `activeSection` becomes `projects`, the hash becomes `#projects`, and `ActivePortfolioSection` mounts only `CaseStudyGrid`.
- Selfware, Tools, Architecture Across Tools, and individual case studies are internal to this section and are not top-level nav items.

## Current Implementation Files

- `src/App.tsx`: mounts `CaseStudyGrid` for `projects` and owns the shared `CaseStudyOverlay`
- `src/components/CaseStudyGrid.tsx`: projects section layout, project groups, cards, architecture panel, overlay reader
- `src/data/portfolio.ts`: selfware, tools, architecture layers, and writing case-study data
- `src/assets/project-assets.ts`: project asset lookup and fallback behavior

## Current Component Model

The current section is built from these primary components:

- `CaseStudyGrid`
- `ProjectGroup`
- `PersonalProjectCard`
- `ArchitectureAcrossToolsPanel`
- `CaseStudyOverlay`

## Source Data

- `portfolioContent.personalProjects.selfware`
- `portfolioContent.personalProjects.tools`
- `portfolioContent.personalProjects.architectureAcrossTools`
- `portfolioContent.teachingSpeakingWriting.writing.caseStudies`
- `deepDives`

Project reader entries are normalized through the case-study helpers in `CaseStudyGrid.tsx`, including `toProjectCaseStudyEntry` and `toDeepDiveCaseStudyEntry`.

## Current Section UX

- The section uses `id="projects"` and `py-12 md:py-16` spacing.
- Content is constrained to a wide portfolio layout with a sticky left rail and larger right content column.
- The left rail uses a strong liquid-glass panel with:
  - `03 / Projects`
  - `Personal Projects tools and selfware`
  - A short summary
  - Counts for total projects, Selfware, and Tools
  - A shared architecture note
- The right column renders Selfware first, Tools second, then the expandable architecture panel.
- Each project card can open the shared case-study overlay when a matching reader entry exists.
- Missing images, links, partner details, and write-ups use intentional placeholder states.

## Selfware Items

The current implementation renders exactly five Selfware projects:

- Qadam
- Dreamsea
- nsso
- RazinFlix
- 24Seven Concierge

## Tools Items

The current implementation renders exactly four Tools projects:

- AI Native Product OS
- Mass Social Wisdom Agent
- AI Costs Dashboard
- RAG Pipeline

## Required Project Fields

Each project should support:

- `projectName`
- `mainPictureOrGif`
- `secondaryPicture`
- `briefDescription`
- `type`
- `technicalStack`
- `problem`
- `architecture`
- `whyThisApproach`
- `tradeoffs`
- `whatIWouldImprove`
- `liveLink`
- `githubLink`
- `fullWriteUpLink`

Selfware projects should additionally support:

- `domainExpertisePartnerPicture`
- `domainExpertisePartnerShortBio`

## Project Group UX

- `ProjectGroup` renders each category as a liquid-glass panel.
- Each group shows a category eyebrow, title, description, and item count.
- Cards preserve a consistent case-study preview structure across Selfware and Tools.
- The category grouping is visual only; it does not create new public routes or nav targets.

## Architecture Across Tools

`ArchitectureAcrossToolsPanel` renders as an expandable `<details>` panel inside Projects.

Required layers:

- Model
- Context
- Orchestration
- Governance
- Human

The panel must stay distinct from the project grid. It explains the shared architecture pattern across the tools rather than acting as a project card.

## Case Study Overlay

`CaseStudyOverlay` is the shared reader for project write-ups and deep dives.

Current behavior:

- Opens from cards through `onOpenCaseStudy`
- Locks body scroll while open
- Closes through the backdrop, close button, or Escape key
- Uses hero media when available and deliberate fallbacks when missing
- Renders chips, summary structure, content sections, links, assets, and related entries when supplied

## AI Native Product OS Write-up Requirements

The AI Native Product OS write-up should preserve these distinct fields:

- One-sentence `problem`
- One-sentence `architecture`
- One-sentence `whyThisApproach`
- One-sentence `tradeoffs`
- One-sentence `whatIWouldImprove`
- `liveLink`
- `githubLink`
- `fullWriteUpLink`
- Separate `workflowDiagram`
- Separate `layerLensesOverview`

The Workflow Diagram and Layer Lenses overview are separate surfaces and must not be collapsed into one generic content block.

## Required UX Rules

- Selfware and Tools must remain visibly separate sub-categories.
- All project cards must retain the expanded case-study/read-up structure.
- Case studies should use the same overlay UX structure wherever they are opened.
- Missing screenshots, GIFs, partner bios, live links, GitHub links, or full write-ups must use intentional placeholders.

## Implementation Checklist

- [ ] `ActivePortfolioSection` mounts `CaseStudyGrid` for `projects`.
- [ ] All five Selfware items appear exactly once.
- [ ] All four Tools items appear exactly once.
- [ ] Architecture Across Tools is expandable and separate from the project grid.
- [ ] Architecture layers remain Model, Context, Orchestration, Governance, and Human.
- [ ] AI Native Product OS separates Workflow Diagram from Layer Lenses.
- [ ] Every available project write-up opens in the shared case-study overlay.
- [ ] Existing card/read-up structure is preserved.

## Acceptance Test

The section should make the personal projects feel like a portfolio of working systems, while the expandable architecture panel explains the shared product and systems pattern behind them.
