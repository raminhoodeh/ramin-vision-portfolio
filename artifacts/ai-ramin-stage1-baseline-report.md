# AI Ramin Stage 1 Baseline Report

Date: 2026-05-23
Workspace: `/Users/raminhoodeh/Desktop/website`

## Scope

Stage 1 is a baseline and safety check before simplifying the AI Ramin page into a chat-first experience. No product behavior was intentionally changed.

## Baseline Artifacts

- Desktop screenshot: `artifacts/ai-ramin-stage1-baseline-desktop.png`
- Mobile screenshot: `artifacts/ai-ramin-stage1-baseline-mobile.png`

Screenshot dimensions:

- Desktop: 1440 x 1000
- Mobile: 390 x 844

## Verification Results

Passing checks:

- `npm run check:content`
- `npm run check:ai-ramin-corpus`
- `npm run check:ai-ramin-eval`
- `npm run build`
- `npm run check:rock-assets`

AI Ramin-specific baseline:

- Corpus check passed with 64 chunks from 50 files.
- Evaluation passed 14/14 with average score 100.
- Production build completed successfully.

Known non-AI blocker:

- `npm run verify` currently fails at `npm run check:performance-guardrails`.
- The failure is about Bonus rock renderer/preload performance requirements, not AI Ramin chat behavior.

## Current UI Baseline

Desktop first viewport currently exposes:

- Header/avatar/title.
- Portfolio Intelligence build-logic button.
- Left visitor lens rail.
- Left request type rail.
- Center intro copy.
- Center prompt suggestions.
- Composer context chips.
- Composer.
- Right evaluation state card.
- Right answer contract card.
- Right proof rail card.

Mobile first viewport currently starts inside the stacked control rail, pushing the actual chat experience lower on the page.

Baseline conclusion:

- The backend and structured AI Ramin contracts are healthy.
- The visual surface confirms the issue: too many controls, cards, chips, labels, and proof/debug surfaces are visible before the user has asked anything.
- Stage 2 should therefore focus on presentation/layout only and preserve the API contract.

## Logic-Critical Areas To Preserve

- `server/aiRaminHandler.mjs`
  - `normalizeStructuredSections`
  - `normalizeRoleFitAnalysis`
  - `normalizeProductJudgmentAnalysis`
  - `normalizeEvidenceLookupAnalysis`
  - `buildHiringBriefSeed`
  - `buildSystemInstruction`
  - `handleAiRaminRequest`

- `src/sections/AiRamin.tsx`
  - `AiRaminStructuredResponse` type shape
  - message submission flow around `selectedMode`, `selectedRequestType`, and API payloads
  - response rendering support for `roleFitAnalysis`, `productJudgmentAnalysis`, `evidenceLookupAnalysis`, and `briefSeed`
  - `buildHiringBriefMarkdown`

## Presentation-Heavy Areas For Stage 2

These are candidates to hide, collapse, or move into progressive disclosure:

- `AiRaminModeSelector`
- `AiRaminRequestTypeSelector`
- `AiRaminProofPanel`
- `AiRaminConsiderationsPanel`
- dedicated role-fit/product/evidence/brief page panels
- CSS around `.ai-ramin-workspace`, `.ai-ramin-control-panel`, `.ai-ramin-proof-panel`, and large dedicated workflow panels

## Stage 2 Readiness

Recommended next step:

Refactor the page shell into one central chat-first layout while preserving the existing backend response shape and frontend state. Request type and proof surfaces should be hidden from the default viewport, not deleted from the system.
