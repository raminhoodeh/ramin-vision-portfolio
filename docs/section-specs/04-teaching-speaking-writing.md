# 04 Teaching, Speaking & Writing

## Purpose

Group Ramin's public thought leadership, courses, talks, books, articles, Thesis, and case studies into one consistent intellectual-output section.

## Public Anchor

- `teaching-speaking-writing`

## Navigation Spec

- Bottom nav label: `Thoughts`
- Nav target: `teaching-speaking-writing`
- Icon: `thoughts`
- Current implementation: selected through the bottom liquid-glass `BottomNavigation` bar.
- On selection, `activeSection` becomes `teaching-speaking-writing`, the hash becomes `#teaching-speaking-writing`, and `ActivePortfolioSection` mounts only `TeachingSpeakingWritingSection`.
- `Thoughts` is allowed only as the short bottom-nav display label; the underlying section remains `Teaching, Speaking & Writing`.
- Teaching, Speaking, Books, Articles, AI-Native Product OS, and Case Studies are internal sub-categories, not separate top-level nav targets.

## Source Data

- `portfolioContent.teachingSpeakingWriting.teaching`
- `portfolioContent.teachingSpeakingWriting.speaking`
- `portfolioContent.teachingSpeakingWriting.writing`

## Teaching Items

Include exactly:

- Transitioning to AI Product Management
- Full Product Development Process

Each teaching item must support:

- `courseTitle`
- `courseDescription`
- `courseModules`
- `courseTrailer`
- `courseLink`
- `tag`

Allowed tags:

- `Highest-Rated`
- `New`

## Speaking Items

Include exactly:

- Existentially Viewing your Existential Crisis
- My Life Story

Each speaking item must support:

- `talkTitle`
- `invitedBy`
- `talkDescription`
- `youtubeEmbeddedLink`

## Writing Sub-Categories

Writing must be split into exactly these sub-categories:

- Books
- Articles
- AI-Native Product OS
- Case Studies

## Books

Include exactly:

- The Proposition
- The Meaning of Life

Each book item must support:

- `bookName`
- `bookType`
- `bookImage`
- `purchaseLink`
- `bookDescriptionOrBlurb`

The Proposition must additionally support:

- `bookVideo`
- `previewLink`

The Meaning of Life must additionally support:

- `summaryLink`
- `fullText`

## Articles

Include exactly:

- Framework of Metacognition
- Framework of Reality

Each article item must support:

- `articleTitle`
- `articleContent`
- `articleSubHeadings`
- `articleDiagram`

The Framework of Metacognition write-up should preserve the existing five-horizontal-stages approach.

## AI-Native Product OS

This writing sub-category must support:

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

## Case Studies

Case Studies must include all project write-ups:

- Qadam
- Dreamsea
- nsso
- RazinFlix
- 24Seven Concierge
- AI Native Product OS
- Mass Social Wisdom Agent
- AI Costs Dashboard
- RAG Pipeline

## Required UX

- Teaching, Speaking, and Writing live in one public section.
- Each sub-category must have its own consistent form factor.
- Case studies must share the same UX structure as the project write-ups.
- Article layouts should be readable and structured, not decorative filler.
- Missing links, trailers, embedded videos, diagrams, and full texts must use placeholders.

## Implementation Checklist

- [ ] Teaching includes exactly two courses.
- [ ] Speaking includes exactly two talks.
- [ ] Writing includes Books, Articles, AI-Native Product OS, and Case Studies.
- [ ] The Proposition and The Meaning of Life have their conditional fields.
- [ ] Framework of Metacognition preserves the five-stage horizontal structure.
- [ ] AI-Native Product OS separates Workflow Diagram from Layer Lenses.
- [ ] Case Studies includes every selfware and tool project write-up.

## Acceptance Test

The section should make the reader understand that teaching, speaking, writing, and case studies are different public expressions of the same body of thought.
