# 03 Personal Projects: Tools & Selfware

## Purpose

Show Ramin's personal products, tools, agents, and selfware as hands-on evidence of AI-native product thinking.

## Public Anchor

- `projects`

## Navigation Spec

- Bottom nav label: `Projects`
- Nav target: `projects`
- Icon: `projects`
- Current implementation: selected through the bottom liquid-glass `BottomNavigation` bar.
- On selection, `activeSection` becomes `projects`, the hash becomes `#projects`, and `ActivePortfolioSection` mounts only `ProjectsSection`.
- Sub-categories such as Selfware, Tools, and Architecture Across Tools are internal to this section and are not top-level nav items.

## Source Data

- `portfolioContent.personalProjects.selfware`
- `portfolioContent.personalProjects.tools`
- `portfolioContent.personalProjects.architectureAcrossTools`
- `portfolioContent.teachingSpeakingWriting.writing.caseStudies`

## Selfware Items

Include exactly:

- Qadam
- Dreamsea
- nsso
- RazinFlix
- 24Seven Concierge

## Tools Items

Include exactly:

- AI Native Product OS
- Mass Social Wisdom Agent
- AI Costs Dashboard
- RAG Pipeline

## Required Project Fields

Each project must support:

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

Selfware projects must additionally support:

- `domainExpertisePartnerPicture`
- `domainExpertisePartnerShortBio`

## Architecture Across Tools Subsection

Keep this as its own expandable subsection inside Projects:

> Each tool is a different expression of the same architecture.

Required layers:

- Model
- Context
- Orchestration
- Governance
- Human

## AI Native Product OS Write-up Requirements

The AI Native Product OS write-up must support:

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

The Workflow Diagram and Layer Lenses overview are distinct surfaces and must not be collapsed into one generic content block.

## Required UX

- Selfware and Tools must be visibly separate sub-categories.
- All project cards must retain the existing expanded card/read-up structure the user liked.
- Case studies should use the same UX structure for every project write-up.
- Missing screenshots, GIFs, partner bios, live links, or GitHub links must use intentional placeholders.

## Implementation Checklist

- [ ] All five Selfware items appear exactly once.
- [ ] All four Tools items appear exactly once.
- [ ] Architecture Across Tools is expandable and separate from the project grid.
- [ ] AI Native Product OS has Workflow Diagram and Layer Lenses as separate surfaces.
- [ ] Every project write-up follows the same case study UX structure.
- [ ] Existing expanded card structure is preserved.

## Acceptance Test

The section makes the personal projects feel like a portfolio of working systems, while the expandable architecture subsection explains the shared intellectual pattern behind them.
