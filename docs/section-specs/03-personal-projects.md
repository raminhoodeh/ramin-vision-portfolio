# 03 Personal Projects: Tools & Selfware

## Purpose

Show Ramin's selfware, tools, and AI-Native Product OS as hands-on evidence of product judgement, AI architecture, and shipped systems.

## Public Anchor

- `projects`

## Navigation Spec

- Bottom nav label: `Projects`
- Nav target: `projects`
- Icon: `projects`
- Current implementation: selected through the shared bottom glass `BottomNavigation`.
- On selection, `activeSection` becomes `projects`, the hash becomes `#projects`, and `ActivePortfolioSection` mounts `CaseStudyGrid`.
- Selfware, Tools, the Architecture section, and individual case-study readers are internal to this section and are not top-level nav items.

## Current Implementation Files

- `src/App.tsx`: mounts `CaseStudyGrid` for `projects` and owns the shared `CaseStudyOverlay`.
- `src/sections/Projects/index.tsx`: Projects page layout, cinematic hero, featured build, selfware stack, tools bay, Architecture section, and project reader wiring.
- `src/sections/Projects/CaseStudyOverlay.tsx`: shared project and tool deep-dive reader.
- `src/sections/Projects/types.ts`: project reader helpers, act navigation data, and project/deep-dive mappings.
- `src/data/content.ts`: normalized selfware/tool entries used by `portfolioContent.personalProjects`.
- `src/data/projects.ts`: deep-dive source copy for project and architecture write-ups.
- `src/data/portfolio.ts`: exported data facade consumed by the section.

## Current Component Model

The current section is built from these primary components:

- `CaseStudyGrid`
- `ProjectCinematicHero`
- `FeaturedProject`
- `SelfwareStickyStack`
- `ToolsOperationsBay`
- `ArchitectureKernel`
- `CaseStudyOverlay`

`ArchitectureKernel` is no longer an expandable details panel. It is a full Projects act with its own visual thesis, process comparison, loop diagram, triangle stack, layer proof matrix, and thesis CTA.

## Source Data

- `portfolioContent.personalProjects.selfware`
- `portfolioContent.personalProjects.tools`
- `portfolioContent.personalProjects.architectureAcrossTools`
- `deepDives`
- `projectCaseStudies`
- `toolsAndSystems`

Project reader entries are normalized through helpers in `src/sections/Projects/types.ts` and opened through the shared `CaseStudyOverlay`.

## Current Section UX

- The section uses `id="projects"` and a full-bleed cinematic dark canvas.
- A left act rail tracks `Intro`, `Selfware`, `Tools`, and `Architecture`.
- The hero introduces Selfware, Tools, and Architecture as one connected system.
- The underpinned-by row sits at the start of the next act rather than inside the hero copy stack.
- `FeaturedProject` currently highlights Dreamsea with an iPhone mockup and iOS App framing.
- `SelfwareStickyStack` renders the selfware product cards.
- `ToolsOperationsBay` renders the tool/system cards.
- `ArchitectureKernel` closes the page with the AI-Native Product OS explanation.

## Selfware Items

The current implementation renders exactly five Selfware projects:

- nsso
- Qadam
- Dreamsea
- 24Seven Concierge
- RazinFlix

Dreamsea is also allowed to appear once as the Featured Build because the featured slot is a spotlight, not the canonical list.

## Tools Items

The current implementation renders exactly three Tools projects:

- Mass Social Wisdom Agent
- AI Costs Dashboard
- RAG Pipeline

AI-Native Product OS is now treated as the architecture thesis and deep-dive CTA, not as a fourth tool card.

## Project Card UX

- Project cards should lead with coherent product descriptions, not isolated "Problem Solved" fragments.
- The visual media should carry type/status chips as overlays instead of repeating them above the title.
- The five inner architecture cards are Model, Context, Orchestration, Governance, and Human.
- Inner card copy should describe the actual layer implementation for that product or tool:
  - Model: the model or model class used.
  - Context: the real product/user/source context supplied.
  - Orchestration: how AI execution is wired into calls, jobs, tools, loops, or structured outputs.
  - Governance: guardrails, evals, permissions, observability, cost limits, and failure handling.
  - Human: the product taste, strategic judgement, and human decision boundary.
- Inner cards should remain equal-size within each product/tool card.

## Architecture Section

`ArchitectureKernel` is the bottom act of Projects and explains that all selfware and tools use the same AI-Native Product OS.

Required subsections:

- Intro stats: systems mapped, selfware products, tools, and stack layers.
- Old-to-new process comparison: `Idea -> Design -> Concept -> Alpha/Beta -> Live` versus the AI-native loop.
- Operating loop: Talk, Decide, Build, Observe, Iterate.
- Five-layer triangle: Model, Context, Orchestration, Governance, Human.
- Layer proof matrix: shows how every product/tool expresses each layer.
- Thesis CTA: opens the AI-Native Product OS reader and links to the AI Product course.

The layer proof matrix must support these filters:

- All
- Product
- Tool

Filtered tool views should use filled columns, not preserve an empty all-systems column. Filter buttons must expose `aria-pressed`, `aria-controls`, and stable `data-architecture-proof-filter` attributes.

## Case Study Overlay

`CaseStudyOverlay` is the shared reader for project write-ups and deep dives.

Current behavior:

- Opens from project, tool, featured-build, and Architecture CTA controls.
- Locks body scroll while open.
- Closes through the close button or Escape key.
- Uses hero media and deliberate fallbacks when missing.
- Renders chips, narrative sections, source links, assets, and related entries when supplied.
- Dreamsea and 24Seven Concierge use the mobile-app deep-dive treatment with the iPhone mockup dominant on the left.

## AI Native Product OS Write-up Requirements

The AI Native Product OS reader should preserve these distinct ideas:

- The old deterministic product process is a five-stage linear path.
- The AI-native process is a loop: Talk, Decide, Build, Observe, Iterate.
- The stack has five layers: Model, Context, Orchestration, Governance, Human.
- The same five-layer architecture should be demonstrated through every selfware product and tool.
- The homepage Architecture section should stay concise and visual; deeper theory belongs in the reader and Thoughts/course surfaces.

## Required UX Rules

- Selfware and Tools must remain visibly separate acts.
- The Architecture section must read as the underlying operating system, not as a normal project card.
- The page should not duplicate the same label/body text inside the layer cards.
- The fixed bottom navigation must not obscure the final Architecture CTA at the bottom of the section.
- The left act rail must stay usable and must not create horizontal overflow.
- Missing screenshots, GIFs, partner bios, live links, GitHub links, or full write-ups must use intentional placeholders.

## Implementation Checklist

- [x] `ActivePortfolioSection` mounts `CaseStudyGrid` for `projects`.
- [x] All five Selfware items appear in the selfware act.
- [x] All three Tools items appear in the tools act.
- [x] Dreamsea is the featured build.
- [x] AI-Native Product OS is represented as the Architecture act and thesis CTA.
- [x] Architecture layers remain Model, Context, Orchestration, Governance, and Human.
- [x] The Architecture section includes the old/new process comparison, loop diagram, triangle stack, proof matrix, and CTA.
- [x] Layer proof filters work for All, Product, and Tool.
- [x] Every available project write-up opens in the shared case-study overlay.
- [x] The preview QA contract follows the current component boundaries: `BottomNavigation` for nav, `Bonus.tsx` for Bonus rock.

## Acceptance Test

The section should feel like a portfolio of working systems first, then reveal the repeatable AI-Native Product OS underneath them. A hiring manager should be able to scan what was built, inspect the architecture layers, and understand that the projects and tools are not isolated demos but repeated expressions of the same product architecture.

## Verification Gates

- `npm run verify`
- `npm run check:preview`
- Browser check at `http://127.0.0.1:4182/#projects` for:
  - no horizontal overflow
  - working Architecture proof filters
  - CTA clearance above the bottom nav
  - visible old/new process, loop, triangle, and proof matrix
