# Portfolio Implementation Plan

## Current Authority Note

The current locked public structure is maintained in `docs/section-specs/`. If this document conflicts with those section specs, the section specs win. In particular, the current structure is:

1. Hero
2. Experience & Education
3. Personal Projects: Tools & Selfware
4. Teaching, Speaking & Writing
5. Contact CTA
6. Bonus Section
7. AI Ramin Chatbot

This document is the full modular implementation plan for Ramin Hoodeh's portfolio. It is written so a fresh Codex session can continue the work without needing the original chat history.

## 1. Product Direction

The site should be a cinematic, liquid-glass personal portfolio for Ramin Hoodeh. It should not read like a normal resume website or generic landing page. It should behave like a proof system: a beautiful scannable homepage that opens into deep, carefully structured sections.

The site should use this locked section architecture:

1. `00 Hero`
2. `01 Work`
3. `02 Projects`
4. `03 Qualifications`
5. `04 Thoughts`
6. `05 Ramin.AI`

The homepage should remain visually cinematic and concise. The depth should live in expandable readers, project case studies, timeline blocks, credential stacks, media shelves, proof cards, source links, and asset slots.

## 2. Core Identity And Copy

Use these exact global facts:

- Full name: Ramin Hoodeh
- Hero label: `PORTFOLIO '26`
- Loading screen words: `Judgement`, `Taste`, `Clarity`
- Rotating hero roles: `Manager`, `Engineer`, `Teacher`
- Hero sentence: `A Product [rotating role] and Fiction Author`
- Hero subcopy: `I use AI to research, design, and build AI-native features every single day.`
- Footer prompt: `Have a role in mind?`
- Footer line: `Let's create beautiful things that the world really needs.`
- Footer marquee: `JUDGEMENT - TASTE - CLARITY - EMPATHY - VISION` repeated
- Use `RH` monogram unless Ramin supplies a real personal logo

Important personal paragraph to preserve in the site:

> I design trust, cost efficiency, and defensibility into the product from day one, validating a real use case at each step. Check out my personal projects that I use as a vehicle to teach myself and others the powerful tools and processes of the future.

Current placement: the `SectionGatewayGrid` intro copy in `src/App.tsx`.

## 3. Design Direction

Keep the existing shader/glass background and liquid-glass nav. Do not redesign the homepage from scratch.

Use Bloom as a reference only for expanded deep dives:

- Left: long glass reading/work column, suitable for essay copy, case studies, timelines, or structured write-ups.
- Right: smaller glass cards for section navigation, metadata, proof chips, source links, asset slots, and related content.

Do not use the Bloom copy, brand, plant imagery, video background, or flower design. Use the layout idea: a long reading column plus a card-based support column.

Design principles:

- Homepage: cinematic, scannable, restrained.
- Deep dives: more dense, readable, and proof-rich.
- Missing assets: designed as intentional "asset slots", never broken images.
- Cards: use glass treatment, not generic solid cards.
- Avoid template-like filler such as "visual playground" or decorative image grids with no portfolio purpose.
- Avoid fake metrics.
- Avoid confidential Bayut or Side.inc details beyond the approved resume wording.
- Keep Ramin's own wording from project write-ups as the primary voice.
- Treat public scrapes as proof and asset leads, not as the portfolio voice.

## 4. Source Files To Read First

At the start of a new session, read these files:

1. `CODEX_SESSION_HANDOVER.md`
2. `PORTFOLIO_IMPLEMENTATION_PLAN.md`
3. `src/App.tsx`
4. `src/data/portfolio.ts`
5. `src/index.css`
6. `src/components/LiquidGlassJsNavShell.tsx`
7. `portfolio-content-enrichment.md`
8. `portfolio-asset-intake.md`
9. `overall-structure-context.md`
10. `ramin-hoodeh-exp-context.md`
11. `Project Write-ups/*.md` as needed for the section being implemented

Do not try to read every scrape file unless needed. Use `portfolio-content-enrichment.md` and `portfolio-source-registry.md` as summaries.

## 5. Current Implementation State

The current implementation has already completed Phase -1 and Phase 0.

### Completed Phase -1: Context Enrichment

Created:

- `portfolio-source-registry.md`
- `portfolio-content-enrichment.md`

Scraped public proof for:

- Dreamsea App Store
- 24Seven Concierge App Store
- Qadam
- Mass Social Wisdom Agent GitHub
- Udemy product course
- TEDx talk
- Amazon book page
- Green.org / GroupM sustainability proof
- Mi3 carbon calculator proof
- Microsoft Ordnance Survey connector proof
- nsso public pages

Raw scrape files live under `.firecrawl/`.

### Completed Phase 0: Portfolio Content System

Current main data file:

- `src/data/portfolio.ts`

Current typed content groups:

- `portfolioGateways`
- `deepDives`
- `projectCaseStudies`
- `experienceEntries`
- `toolsAndSystems`
- `credentials`
- `teachingWritingItems`
- `assetRequests`
- `stats`
- `socialLinks`

Current main UI file:

- `src/App.tsx`

Current reusable components:

- `SectionGatewayGrid`
- `DeepDiveOverlay`
- `AssetSlotCard`
- `CaseStudyGrid`
- `WorkCaseStudyOverlay`
- `ToolsSystemsPanel`
- `TeachingWritingShelf`
- `ExperienceTimeline`
- `CredentialStack`
- `Stats`
- `Contact`

Current homepage render order:

1. `Hero`
2. `SectionGatewayGrid`
3. `CaseStudyGrid`
4. `ToolsSystemsPanel`
5. `TeachingWritingShelf`
6. `Stats`
7. `Contact`

Current section architecture:

1. `00 Hero`
2. `01 Work`
3. `02 Projects`
   - `Apps`
   - `Web Apps`
   - `Tools`
4. `03 Qualifications`
5. `04 Thoughts`
   - `Teaching`
   - `Speaking`
   - `Writing`
6. `05 Ramin.AI`

Created:

- `portfolio-asset-intake.md`
- `CODEX_SESSION_HANDOVER.md`
- `PORTFOLIO_IMPLEMENTATION_PLAN.md`

Verification from prior session:

- `npm run build` passed.
- There is a Vite large chunk warning. It is known and not currently blocking.
- Local server was tested at `http://127.0.0.1:3004/`.

## 6. Development Rules For Future Codex Sessions

Use this workflow:

1. Read the relevant current files.
2. Work in one phase at a time.
3. Make targeted edits using `apply_patch`.
4. Run `npm run build`.
5. If doing visual work, run Vite and inspect the local page.
6. Update this plan or the handover if the structure changes materially.

Commands:

```bash
npm run build
```

```bash
npx vite --host 127.0.0.1 --port 3004
```

If port `3004` is busy, use another free port.

Do not assume this workspace is a git repository. `git diff` may not work.

## 7. Master Phasing Strategy

The implementation must remain modular. Do not implement every section deeply in one pass. Each phase should spend enough attention on one section or surface to make it high-quality.

Recommended order:

1. Phase 1: Thesis / AI-Native Product OS deep dive
2. Phase 2: Projects case studies
3. Phase 3: Work and Qualifications
4. Phase 4: Thoughts
5. Phase 5: Tools & Systems
6. Phase 6: Ramin.AI prototype panel
7. Phase 7: Visual polish, responsive QA, and performance pass

Each phase should end with:

- Content review
- Build verification
- Mobile and desktop visual sanity check
- Updated asset intake checklist if new gaps appear

## 8. Phase 1: Thesis / AI-Native Product OS Deep Dive

### Goal

Make the `AI-Native Product OS` deep dive the first fully polished section. It should feel like the intellectual centre of the portfolio.

### Target Files

- `src/data/portfolio.ts`
- `src/App.tsx`
- `src/index.css` only if additional reusable styles are needed

### Content To Preserve

Use and expand these copy seeds:

- "The operating system broke."
- "For over a decade, product teams ran a linear pipeline - Idea -> Design -> Concept -> Alpha/Beta -> Live - because the material was deterministic."
- "Then the physics changed."
- "Large language models are not deterministic. They are probabilistic."
- "The Loop is measured in hours, not quarters."
- "The model is rented. Your context is owned."
- "Delegation without comprehension is abdication."

### Reader Structure

Inside `DeepDiveOverlay`, create thesis-specific rendering when:

```ts
item.slug === 'ai-native-product-os'
```

The layout should still use the same overlay shell, but the thesis should receive special content modules.

Left column:

1. The operating system broke
2. The deterministic product era
3. Then the physics changed
4. The 5-layer stack
5. The AI-native loop
6. What this changes about the Product Manager role
7. Governance is not a bolt-on
8. The standard

Right column:

- Reading map
- Best for
- Core stack
- Loop
- Proof links
- Asset slots
- Related proof
- Mini diagram cards

### Suggested Visual Modules

Create small diagram-like glass components:

1. `StackDiagramCard`
   - Layers:
     - Model
     - Context
     - Orchestration
     - Governance
     - Human
   - Emphasis: Model is capability; context is defensibility.

2. `LoopDiagramCard`
   - Steps:
     - Talk
     - Decide
     - Build
     - Observe
     - Iterate
   - Emphasis: measured in hours, not quarters.

3. `DefensibilityCard`
   - Text:
     - `The model is rented.`
     - `Your context is owned.`
   - Explanation: durable AI products are built around proprietary context, workflows, constraints, and trust.

4. `GovernanceCard`
   - Items:
     - Evals
     - Guardrails
     - Refusal
     - Cost controls
     - Human review
   - Emphasis: governance should be designed into the product from day one.

### Acceptance Criteria

- Thesis opens from the first gateway.
- The overlay feels like a polished long-form reader.
- Left column is readable and not cramped.
- Right column has useful cards, not filler.
- Thesis can stand alone as a complete essay.
- All missing visuals are represented by designed asset slots.
- `npm run build` passes.

## 9. Phase 2: Projects Case Studies

### Goal

Make the project section feel like a portfolio of real built systems, not just a grid of pretty thumbnails.

### Target Files

- `src/data/portfolio.ts`
- `src/App.tsx`
- `portfolio-asset-intake.md`

### Projects

Primary projects:

1. nsso
2. Dreamsea
3. Qadam
4. 24Seven Concierge
5. RazinFlix
6. Mass Social Wisdom Agent

Optional later projects:

- AI Costs Dashboard
- RAG Pipeline
- Deity AI, if separated from nsso

### Case Study Template

Every project should expand into:

1. Problem
2. Architecture
3. Why this approach
4. Tradeoffs
5. Demo / proof
6. What I would improve

This template already exists in `WorkCaseStudyOverlay`.

### Project Wording To Preserve

nsso:

- Opening: "Professional identity online is a fragmentation problem masquerading as a presentation problem."
- Position as the flagship product.
- Explain public profile, storefront, Deity AI coach, RAG context, direct profile mutation review flow, and profile completeness scoring.
- Proof links:
  - `https://nsso.me/`
  - `https://nsso.me/ramin`

Dreamsea:

- Opening: "Every morning I'd wake from a vivid dream and immediately lose it..."
- Position as an AI dream journaling and interpretation app.
- Include voice capture, Gemini transcription, AI watercolor image generation, Jungian/Persian/Egyptian/Japanese interpretive frameworks, Dream Wiki, monthly themes, and privacy-first architecture.
- Proof:
  - App Store listing
  - Developer: Ramin Hoodeh
  - Category: Health & Fitness
  - Version proof: 2.5 at scrape time
  - Privacy proof: data not collected at scrape time

Qadam:

- Opening: "Financial markets are information-processing machines - but they process information reactively."
- Position as catalyst-driven macro intelligence.
- Include physical-world signals before market consensus, five intelligence pipelines, local LLM triage, frontier LLM strategy, weekly quantum pattern recognition, Python orchestrator, and paper proof phase.
- Proof:
  - `http://qadam.trade`
  - Public landing page says early access from July 23, 2026.
  - Public page line: hedge fund team inside your laptop, 500+ live data feeds across five pipelines.

24Seven Concierge:

- Opening: "Luxury travel operators had built their service inventory in Shopify - the operational backbone was already there - but the discovery layer was entirely broken."
- Position as AI-assisted luxury itinerary planning over Shopify inventory.
- Include Gemini, structured product recommendations, WhatsApp human concierge handoff, Dubai expansion, and calendar booking.
- Proof:
  - App Store listing
  - Developer: Ramin Hoodeh
  - Category: Travel
  - Version proof: 1.2.4 at scrape time
  - Version notes mention Dubai, AI Concierge Chatbot, calendar booking system.

RazinFlix:

- Opening: "I had been maintaining a personal film library as a spreadsheet for years..."
- Position as personal streaming/curation selfware.
- Include TMDB, Gemini description/category, YouTube trailer search, Google Vision poster validation, Supabase persistence, Netflix-like frontend, and recommendation engine.
- Proof:
  - `https://nsso.me/film/razinflix`

Mass Social Wisdom Agent:

- Opening: "The knowledge I was accumulating across Instagram Reels, YouTube breakdowns, and screenshot-heavy carousel posts had no coherent home."
- Position as autonomous multimodal extraction workflow.
- Preserve value proposition: it extracts knowledge, not just links.
- Include Inspect -> Route -> Compose -> Self-Assess -> Categorise -> Sort -> Export.
- Proof:
  - `https://github.com/raminhoodeh/mass-social-wisdom-agent`
  - README confirms Flask, Gemini 2.5 Flash, SociaVault API, demo GIF, dual URL/image input, `.docx` export.

### Visual Treatment

Homepage:

- Keep project cards scannable.
- Add asset-slot badges if no real screenshot/logo exists.
- Do not rely forever on generic Unsplash images.

Overlay:

- Add a right-side mini proof stack:
  - public proof
  - technical layer
  - trust/governance layer
  - next asset needed
- Consider adding project-specific "architecture chips" inside the overlay.

### Asset Requests To Update

For each project, request:

- Logo
- Hero screenshot
- Demo URL
- Repo URL
- Video walkthrough
- One-line description
- Problem statement
- Proof/status
- Confidentiality notes

### Acceptance Criteria

- Each project opens into a useful case study.
- Each project keeps Ramin's wording close.
- No project feels like generic portfolio filler.
- Missing screenshots are intentional asset slots.
- `npm run build` passes.

## 10. Phase 3: Work And Qualifications

### Goal

Make Ramin's qualifications and product experience visible, credible, and structured without turning the homepage into a resume dump.

### Target Files

- `src/data/portfolio.ts`
- `src/App.tsx`
- `portfolio-asset-intake.md`

### Work Structure

The `experienceEntries` array already exists.

Each role should include:

- Company/domain
- Role/date
- One strongest outcome
- What it proves about Ramin
- Public proof link if available
- Confidentiality note if needed

### Resume Wording To Preserve

Bayut:

- Confidential AI-native features in property search, recommendations, and conversational AI
- model selection
- eval suite design
- guardrail implementation
- MCP integration
- AI-Native Product OS embedded with the wider Product team

Side.inc:

- Replaced multiple internal ERP products with AI-coded in-house alternatives
- reduced ERP operational costs by 20% over 4 months
- decreased idea-to-feature time by 90%
- point of contact for employees exploring AI or automation tools
- Windsurf
- Microsoft Enterprise Copilot

Perkbox Vivup:

- app UX improvements
- Google Play Store rating up 0.6
- iPhone App Store rating up 1.2
- monetisation increased customer lifetime value by 19%
- Order Guidance Wizard decreased checkout abandonment by 1/3

GroupM:

- Product Innovation Process
- carbon calculator
- EY methodology
- 300+ dataset variables
- £1billion+ media investment measured in 2022

Cox Automotive:

- Feature Scoring Framework
- auction product
- stakeholder feedback cycles halved

Ordnance Survey:

- twelve discovery workshops
- sustainability applications of geospatial data
- 3 product concepts validated
- first geospatial API on Microsoft's Power Platform
- asset valuation carbon impacts
- increased geospatial data utilization

Urgentem:

- climate risk analytics platform
- Element6
- £900 million in AUM context
- Demo-to-Buy conversion up 30%
- churn down 25%

Deity AI:

- AI conversation mediator chatbot
- chat retention up over 50% in first 3 months

ERM:

- European Commission research paper
- product lifecycle assessment of double-sided solar panels
- satellite data use cases
- RepRisk revenue improvement

Tesla:

- Tesla / SpaceX marketing campaign
- Owners Orientation attendance more than doubled
- 120% sales target performance
- first Tesla Powerwall to a residential customer in the UK

### Qualifications Structure

The `credentials` array already exists.

Group qualifications into:

- AI
- Education
- Leadership

Current credentials:

- IBM AI Engineering Professional Certificate, 2026
- Google Professional Machine Learning Engineer, 2026
- Google Generative AI Leader Certification, 2026
- Anthropic MCP Protocols: Advanced Topics, 2026
- MBTi Leadership Development Programme, 2024
- MSc Environmental Technology with Distinction, Imperial College London, 2017
- BA Business and Marketing with 1st Class Honours, University of Northampton, 2016

### Visual Treatment

Experience:

- Timeline with role cards.
- Keep outcomes readable.
- Do not overload each role.
- Add "public-safe wording" marker.

Qualifications:

- Credential stack, not a footnote.
- Use group columns or stacked glass cards.
- Later replace text badges with real credential badges.

### Acceptance Criteria

- Qualifications are no longer buried.
- Experience feels credible and modern.
- Confidential roles remain safely worded.
- Public proof links are attached where possible.
- `npm run build` passes.

## 11. Phase 4: Thoughts

### Goal

Make the public thought layer feel substantial: Ramin teaches, speaks, writes fiction, and turns frameworks into shareable work.

### Target Files

- `src/data/portfolio.ts`
- `src/App.tsx`
- `portfolio-asset-intake.md`

### Items

Current `teachingWritingItems` should include:

1. The Fastest Path to Product Management
2. AI Product Manager Course
3. TEDx talk
4. The Proposition: Purpose
5. Framework of Metacognition

Potential additions:

- University talk
- Framework of Reality course
- AI-Native Product OS course detail
- Essays from `overall-structure-context.md`

### Public Proof

Udemy:

- 4.8 rating
- 4,871 students
- 162 ratings/reviews
- created by Ramin Hoodeh
- last updated 6/2025

TEDx:

- Title: `Existentially viewing your existential crisis`
- TEDxImperialCollege
- June 2018
- 42,969 plays at scrape time

Book:

- `The Proposition: Purpose`
- Paperback
- 6 Dec 2021
- 385 pages
- ISBN-10 1527286185
- ISBN-13 978-1527286184
- 5.0 rating with 14 ratings at scrape time

### Copy Positioning

Teaching:

- The AI PM course should be positioned as the packaged version of the AI-Native Product OS.
- The existing Udemy product course proves the ability to teach product thinking to a broad audience.

Speaking:

- TEDx carries the broader worldview: cosmic perspective, mindfulness, meaning, and making large ideas feel human.

Writing:

- The Proposition belongs as fiction and as evidence of sustained metaphysical inquiry, world-building, and long-form creative discipline.
- Keep wording close to spiritual fiction, metaphysical enquiry, philosophy, consciousness, nature of reality, and story.

Metacognition:

- The Framework of Metacognition can become a signature essay.
- It bridges Manager, Engineer, Teacher, and Author.

### Visual Treatment

- Media shelf with cards.
- Use thumbnails when available.
- If thumbnails are missing, show asset slots:
  - course thumbnail
  - TEDx thumbnail
  - book cover
  - essay draft

### Acceptance Criteria

- Public thought section does not feel secondary.
- Each item has proof, link, or asset slot.
- The section connects teaching/writing back to product judgement.
- `npm run build` passes.

## 12. Phase 5: Tools & Systems

### Goal

Make architecture visible as a content type. This should not be just another project grid.

### Target Files

- `src/data/portfolio.ts`
- `src/App.tsx`
- `portfolio-asset-intake.md`

### Systems To Represent

Current `toolsAndSystems`:

1. AI-Native Product OS
2. Deity profile coach
3. Dreamsea generation pipeline
4. 24Seven catalog concierge
5. Mass Social Wisdom Agent

Potential additions:

- AI Costs Dashboard
- RAG Pipeline
- Eval suite examples
- Guardrail pattern examples
- MCP/plain-English data querying examples

### Required Layers

Show the systems through these layers:

- Model layer: Gemini, local LLMs, frontier LLMs
- Context layer: RAG, wiki injection, profile context, catalog injection
- Orchestration layer: tool calls, pipelines, async jobs, workflow stages
- Governance layer: evals, guardrails, privacy, cost controls, review mode
- Human layer: judgement, taste, decision quality, review boundaries

### Visual Treatment

- Architecture cards
- Diagram slots
- Workflow cards
- Possibly simple inline diagram components
- Avoid decorative non-functional imagery

### Missing Content

Need from Ramin:

- AI Costs Dashboard write-up
- RAG Pipeline write-up or screenshots
- Any Figma/Notion diagrams already created
- Workflow videos or Looms
- Source links for public tools

### Acceptance Criteria

- Tools section clearly differs from project section.
- It shows reusable thinking and architecture.
- It makes governance, evals, context, and cost visible.
- Missing diagrams appear as intentional asset slots.
- `npm run build` passes.

## 13. Phase 6: Ramin.AI Prototype

### Goal

Create a polished static prototype panel for Ramin.AI, without pretending a live chatbot exists before it does.

### Target Files

- `src/data/portfolio.ts`
- `src/App.tsx`
- possibly a later API/backend file, but not in the first static phase

### Positioning

Ramin.AI is a future interactive layer where a reader can paste a role, project, or product problem and see the approach Ramin would bring.

It must be source-grounded and guarded.

### Initial Version

Do not build a real model integration yet unless specifically requested.

Build:

- coming-soon/prototype panel
- example prompts
- allowed source chips
- disallowed claim chips
- response tone chips
- future input UI
- source boundary explanation

### Allowed Sources

Initial allowed knowledge should be curated local portfolio files:

- `ramin-hoodeh-exp-context.md`
- `overall-structure-context.md`
- `Project Write-ups/*.md`
- `portfolio-content-enrichment.md`
- `portfolio-source-registry.md`
- final approved site copy

Do not use raw scrape dumps as direct memory. They are evidence and asset leads, not voice.

### Guardrails

Ramin.AI must not:

- inflate claims
- invent metrics
- expose confidential Bayut or Side.inc details
- make unverified claims
- overstate implementation status
- present a static prototype as live

### Acceptance Criteria

- Ramin.AI gateway opens into a useful prototype explanation.
- It is visually polished.
- It makes source boundaries clear.
- It does not imply live functionality if no live model exists.
- `npm run build` passes.

## 14. Phase 7: Polish, Responsive QA, Performance

### Goal

Make the site feel complete and usable across desktop and mobile.

### Target Files

- `src/App.tsx`
- `src/index.css`
- `src/components/LiquidGlassJsNavShell.tsx`
- `src/components/ShaderGradientBackground.tsx`
- `index.html`

### QA Checklist

Desktop:

- Nav floats and remains readable.
- Background motion/refraction is visible behind nav.
- All seven gateways are visible.
- Thesis opens and closes smoothly.
- Project case studies open and close smoothly.
- No body scroll lock bugs after closing overlays.
- Footer marquee is not too fast.
- Glass effects are visible but not noisy.

Mobile:

- Hero text fits.
- Nav does not become unusable.
- Gateways stack cleanly.
- Deep dive overlay is readable.
- Right-side cards stack under the reader.
- Buttons fit without text overflow.
- No horizontal scroll.

Content:

- No starter-template copy.
- No broken images.
- No generic placeholder copy.
- Missing assets are intentional asset slots.
- Qualifications visible.
- Public proof links open in new tabs.

Build:

- `npm run build` passes.
- Known chunk warning is acceptable for now.

### Performance Follow-ups

Potential improvements:

- Code split heavy shader / three dependencies.
- Lazy-load overlays.
- Lazy-load images.
- Replace generic Unsplash placeholders with actual assets.
- Reduce bundle size once visual/content structure is stable.

## 15. Asset Intake Plan

The asset checklist lives in:

- `portfolio-asset-intake.md`

Keep updating it as implementation reveals missing assets.

Global needs:

- preferred profile image
- personal logo or confirmation to use `RH`
- final social links
- final email
- global confidentiality notes

Thesis needs:

- AI-Native Product OS diagram
- 5-layer stack diagram
- AI loop diagram
- Notion/source links
- preferred final thesis wording

Experience needs:

- company logos
- public-safe metric approvals
- confidential exclusions
- product screenshots where allowed

Projects need:

- logos
- screenshots
- demo URLs
- repo URLs
- Loom/product videos
- one-line descriptions
- problem statements
- proof/status
- confidentiality notes

Tools need:

- architecture diagrams
- workflow screenshots
- cost dashboard screenshot or anonymised chart
- source links

Qualifications need:

- certificate images
- verification links
- institution logos or text-only approval

Teaching/Writing needs:

- course thumbnails
- course links
- TEDx thumbnail
- book cover
- Amazon link
- essay drafts

Ramin.AI needs:

- allowed knowledge sources
- disallowed claims
- sensitive areas
- response tone
- example prompts
- model/provider preference later

## 16. Final Acceptance Criteria For Whole Site

The site is done when:

- The homepage clearly shows all seven content gateways.
- Each gateway has a meaningful expanded state.
- Thesis is a polished complete reader.
- Projects have real case-study structure.
- Product experience is credible and public-safe.
- Qualifications are visible and well-grouped.
- Teaching, speaking, writing, and fiction feel like part of the same person.
- Tools and systems show architecture, not decoration.
- Ramin.AI is presented honestly as prototype or live, depending on implementation status.
- The background and nav glass effects feel intentional.
- The site works on mobile.
- No broken images or starter copy remain.
- `npm run build` passes.

## 17. Recommended Next Prompt For Fresh Codex

Use this prompt to continue:

```text
Please read CODEX_SESSION_HANDOVER.md, PORTFOLIO_IMPLEMENTATION_PLAN.md, src/App.tsx, src/data/portfolio.ts, portfolio-content-enrichment.md, and portfolio-asset-intake.md. Then implement Phase 1 only: polish the AI-Native Product OS thesis deep dive. Keep the homepage structure intact, preserve Ramin's wording, use the existing liquid glass/shader design language, add thesis-specific stack/loop/governance visual cards, and run npm run build when finished.
```
