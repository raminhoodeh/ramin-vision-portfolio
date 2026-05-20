# 04 Teaching, Speaking & Writing

## Purpose

Group Ramin's public thought leadership, courses, talks, books, articles, thesis material, and case studies into one consistent intellectual-output section.

## Public Anchor

- `teaching-speaking-writing`

## Navigation Spec

- Bottom nav label: `Thoughts`
- Nav target: `teaching-speaking-writing`
- Icon: `thoughts`
- Current implementation: selected through the shared bottom liquid-glass `BottomNavigation`.
- On selection, `activeSection` becomes `teaching-speaking-writing`, the hash becomes `#teaching-speaking-writing`, and `ActivePortfolioSection` mounts only `TeachingWritingShelf`.
- `Thoughts` is only the short bottom-nav display label; the underlying section remains `Teaching, Speaking & Writing`.
- Teaching, Speaking, Books, Articles, AI-Native Product OS, and Case Studies are internal sub-categories, not separate top-level nav targets.

## Current Implementation Files

- `src/App.tsx`: mounts `TeachingWritingShelf` for `teaching-speaking-writing` and passes the shared reader open handler
- `src/components/TeachingWritingShelf.tsx`: thought section layout, rails, cards, diagrams, writing rows
- `src/data/portfolio.ts`: teaching, speaking, writing, thesis, article, and case-study content

## Current Component Model

The current section is built from these primary components:

- `TeachingWritingShelf`
- `ThoughtRail`
- `ThoughtGroup`
- `TeachingCard`
- `SpeakingCard`
- `BookCard`
- `ArticleCard`
- `AiNativeProductOsWriting`
- `WritingCaseStudyRow`
- `WorkflowDiagram`

## Source Data

- `portfolioContent.teachingSpeakingWriting.teaching`
- `portfolioContent.teachingSpeakingWriting.speaking`
- `portfolioContent.teachingSpeakingWriting.writing.books`
- `portfolioContent.teachingSpeakingWriting.writing.articles`
- `portfolioContent.teachingSpeakingWriting.writing.aiNativeProductOs`
- `portfolioContent.teachingSpeakingWriting.writing.caseStudies`

## Current Section UX

- The section uses `id="teaching-speaking-writing"`.
- Content is constrained to a wide portfolio layout with a sticky left rail and larger right content column.
- The left rail uses a strong liquid-glass panel with:
  - `04 / Thoughts`
  - `Teaching, Speaking and writing`
  - A summary
  - Stats for Teaching, Speaking, Writing, and Open slots
  - A section logic note
- The right column groups Teaching, Speaking, Books, Articles, AI-Native Product OS, and Case Studies into repeatable thought panels.
- Reader-capable items open the same case-study overlay used by the Projects section.
- Missing trailers, links, images, diagrams, and full texts use intentional placeholder states.

## Teaching Items

The current implementation renders exactly two courses:

- Transitioning to AI Product Management
- Full Product Development Process

Each teaching item should support:

- `courseTitle`
- `courseDescription`
- `courseModules`
- `courseTrailer`
- `courseLink`
- `tag`

Current allowed tags:

- `Highest-Rated`
- `New`

## Speaking Items

The current implementation renders exactly two talks:

- Existentially Viewing your Existential Crisis
- My Life Story

Each speaking item should support:

- `talkTitle`
- `invitedBy`
- `talkDescription`
- `youtubeEmbeddedLink`

## Writing Sub-Categories

Writing is currently split into exactly these sub-categories:

- Books
- Articles
- AI-Native Product OS
- Case Studies

## Books

The current implementation renders exactly two books:

- The Proposition
- The Meaning of Life

Each book item should support:

- `bookName`
- `bookType`
- `bookImage`
- `purchaseLink`
- `bookDescriptionOrBlurb`

The Proposition additionally supports:

- `bookVideo`
- `previewLink`

The Meaning of Life additionally supports:

- `summaryLink`
- `fullText`

## Articles

The current implementation renders exactly two articles:

- Framework of Metacognition
- Framework of Reality

Each article item should support:

- `articleTitle`
- `articleContent`
- `articleSubHeadings`
- `articleDiagram`

The Framework of Metacognition write-up should preserve the five-horizontal-stages structure through `horizontalStages`.

## AI-Native Product OS

The AI-Native Product OS writing block should preserve these distinct fields:

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

The `WorkflowDiagram` visual and layer-lens overview must remain separate surfaces.

## Case Studies

The current case-study writing rows are generated from all project write-ups:

- Qadam
- Dreamsea
- nsso
- RazinFlix
- 24Seven Concierge
- AI Native Product OS
- Mass Social Wisdom Agent
- AI Costs Dashboard
- RAG Pipeline

Rows with a matching reader entry open the shared case-study overlay; rows without one show a clear `Reader needed` state.

## Required UX Rules

- Teaching, Speaking, and Writing live in one public section.
- Each sub-category must have its own consistent form factor.
- Case studies must share the same reader structure as project write-ups.
- Article layouts should be readable and structured, not decorative filler.
- Missing links, trailers, embedded videos, diagrams, and full texts must use placeholders.

## Implementation Checklist

- [ ] `ActivePortfolioSection` mounts `TeachingWritingShelf`.
- [ ] Teaching includes exactly two courses.
- [ ] Speaking includes exactly two talks.
- [ ] Writing includes Books, Articles, AI-Native Product OS, and Case Studies.
- [ ] The Proposition and The Meaning of Life preserve their conditional fields.
- [ ] Framework of Metacognition preserves the five-stage horizontal structure.
- [ ] AI-Native Product OS separates Workflow Diagram from Layer Lenses.
- [ ] Case Studies includes every selfware and tool project write-up.
- [ ] Reader-capable items open the shared case-study overlay.

## Acceptance Test

The section should make teaching, speaking, writing, and case studies feel like different public expressions of the same body of product and AI-native thought.
