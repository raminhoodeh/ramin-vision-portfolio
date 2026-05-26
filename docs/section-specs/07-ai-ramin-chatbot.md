# 07 AI Ramin Chatbot

## Purpose

AI Ramin is the interactive AI Product Manager CV for Ramin Hoodeh. It should help hiring managers, recruiters, founders, AI product leads, investors, and curious visitors evaluate Ramin faster than a static portfolio can.

The upgraded experience should make four things obvious:

- What Ramin has actually done.
- Which proof is verified versus inferred.
- How Ramin thinks through AI product problems.
- Where confidentiality or missing evidence prevents a stronger claim.

This is not a general-purpose chatbot. It is a source-grounded portfolio assistant for AI Product Manager evaluation.

## Phase 1 Product Contract

Phase 1 defines the product surface and answer contract only. It does not require the full redesigned UI, role-fit analyzer, product simulator, evidence rail, or hiring-brief generator to be built yet.

The locked upgraded AI Ramin experiences are:

1. Hiring mode selector
2. Role-fit analyzer
3. Evidence-backed answers
4. Verified proof versus inference separation
5. Product judgment simulator
6. Shareable hiring brief

The previously discussed "Ask about this" buttons across the wider site are intentionally excluded from this upgrade. AI Ramin should become a stronger dedicated page before adding cross-site prompt entry points.

## Current Public Surface

- Bottom navigation item: `AI Ramin`
- Nav target: `ai-ramin`
- Display label: `AI Ramin`
- Icon: `ai`
- Current implementation mounts `AiRaminSection` as an active portfolio section.
- URL hash can resolve to `#ai-ramin`.
- The page contains a chat thread, example prompts, textarea composer, avatar, and a build-logic panel.
- The frontend posts visitor messages to `/api/ai-ramin`.

## Current Implementation Files

- `src/App.tsx`: active section routing, `ai-ramin` section selection, bottom nav handoff.
- `src/components/BottomNavigation.tsx`: bottom nav item definition for `AI Ramin`.
- `src/sections/AiRamin.tsx`: AI Ramin page UI, chat thread, examples, composer, build-logic panel, API call.
- `src/data/ai-ramin.ts`: product contract, prototype content, example prompts, source boundaries, response rules.
- `src/data/content.ts`: `portfolioContent.aiRaminChatbot` legacy copy used by the page header and input labels.
- `server/aiRaminHandler.mjs`: `/api/ai-ramin` backend, corpus retrieval, Gemini request, answer response.
- `scripts/build-ai-ramin-corpus.mjs`: corpus generation from curated AI Ramin source files.
- `scripts/evaluate-ai-ramin.mjs`: offline retrieval, contract, guardrail, and evidence coverage evaluator.
- `scripts/check-ai-ramin-interview-routing.mjs`: offline drift guard for question types, answer techniques, answer frames, soft CTAs, and eval-case coverage.
- `scripts/check-ai-ramin-feedback-contract.mjs`: offline contract guard for answer feedback UI, endpoint routing, local feedback schema, and local-log ignore rules.
- `ai-ramin-section/generated/ai-ramin-corpus.json`: generated source-grounded answer corpus.
- `ai-ramin-section/evaluation/eval-cases.json`: curated Phase 8 evaluation prompt suite.
- `ai-ramin-section/evaluation/README.md`: evaluation runbook, failure triage, and corpus-improvement workflow.
- `ai-ramin-section/evaluation/failure-log.schema.json`: local failure-log JSONL schema.
- `ai-ramin-section/evaluation/live-feedback.schema.json`: local visitor-feedback JSONL schema.
- `src/index.css`: AI Ramin layout and visual styling.

## Source Data

AI Ramin should draw product copy and rules from:

- `aiRaminPrototype` in `src/data/ai-ramin.ts`
- `portfolioContent.aiRaminChatbot` in `src/data/content.ts`
- curated canonical, story-bank, framework, and policy files under `ai-ramin-section/`
- generated corpus at `ai-ramin-section/generated/ai-ramin-corpus.json`

Raw archive files, unreviewed notes, and scrape dumps are not answer sources unless later converted into approved canonical, story, framework, or policy files.

## Core Positioning

AI Ramin should be positioned as:

> A source-grounded AI Product Manager portfolio assistant that helps visitors evaluate Ramin's proof, role fit, product judgment, and AI-native operating style.

The page should not lead with model novelty. It should lead with hiring usefulness and proof quality.

## Visitor Modes

The upgraded experience should support these hiring modes:

- `Recruiter`: concise screening, role-match summary, strongest proof, gaps to clarify.
- `Hiring Manager`: deeper examples, delivery evidence, risk judgment, first 90-day view.
- `Founder`: speed, ownership, ambiguity, judgment under limited resources, builder signal.
- `AI Product Lead`: Model, Context, Orchestration, Governance, Human depth; evals, guardrails, RAG, agents, MCP, cost and risk.
- `Investor`: product taste, market thinking, founder-like signal, systems thinking, proof of independent shipping.
- `Curious Visitor`: plain-English explanation of Ramin, projects, writing, and how the portfolio fits together.

Each mode should change answer emphasis, not evidence truth. A mode can reframe an answer, but it cannot invent stronger proof.

## Request Types

AI Ramin should eventually route requests into these types:

- `general_chat`: normal portfolio question.
- `role_fit`: visitor pastes a job description or hiring need.
- `product_judgment`: visitor gives an AI product scenario.
- `evidence_lookup`: visitor asks what Ramin has actually shipped or proven.
- `hiring_brief`: visitor asks for a concise shareable summary after a chat or role-fit analysis.

## Universal Answer Contract

Every AI Ramin answer should be shaped into these sections, even if the first UI renders them as normal prose:

```ts
type AiRaminAnswerContract = {
  short_answer: string;
  verified_proof: string[];
  inferred_fit: string[];
  confidential_boundary: string[];
  open_questions: string[];
  evidence_cards: AiRaminEvidenceCard[];
  suggested_next_action: string;
};
```

Section rules:

- `short_answer`: answer the visitor directly in one to three sentences.
- `verified_proof`: list claims supported by approved corpus or public proof.
- `inferred_fit`: explain reasonable fit or implications from the evidence without presenting them as fact.
- `confidential_boundary`: name what cannot be exposed, claimed, or inferred.
- `open_questions`: ask only for information that materially improves the answer.
- `evidence_cards`: attach proof cards from retrieved work, project, writing, course, talk, or policy sources.
- `suggested_next_action`: guide the visitor to role-fit analysis, product simulator, hiring brief, project reader, or contact.

## Evidence Card Contract

Evidence cards should be generated from retrieved context, not from model imagination.

```ts
type AiRaminEvidenceCard = {
  title: string;
  type: 'work' | 'project' | 'writing' | 'course' | 'talk' | 'policy' | 'framework';
  summary: string;
  source_path?: string;
  public_url?: string;
  confidence: 'verified' | 'local-primary' | 'inferred' | 'needs-review';
};
```

Evidence card rules:

- Use `verified` when the proof is public or explicitly approved.
- Use `local-primary` when the claim is supported by curated local portfolio files but may still need public-facing review.
- Use `inferred` only for fit or implications, not factual claims.
- Use `needs-review` when a useful claim exists but should not be shown as final proof.
- Never show raw confidential source text in the UI.

## Role-Fit Analyzer Contract

For pasted job descriptions, the answer should include:

- role summary
- strongest matching work evidence
- strongest matching project evidence
- AI Product Manager strengths
- likely gaps or questions to clarify
- first 90-day operating approach
- suggested interview questions
- contact or hiring-brief CTA

Role-fit answers should explicitly avoid overstating confidential Bayut, SIDE, client, or unreleased feature details.

## Product Judgment Simulator Contract

For AI product scenarios, the answer should use the AI-Native Product OS:

- Model
- Context
- Orchestration
- Governance
- Human

The simulator output should include:

- recommended MVP path
- riskiest assumptions
- eval and guardrail plan
- key tradeoffs
- what Ramin would ask next

This should prove product judgment through structure, specificity, and tradeoff awareness, not by claiming experience that is not in the corpus.

## Shareable Hiring Brief Contract

The hiring brief should be concise enough for an internal recruiter or hiring manager note.

Brief sections:

- Why Ramin fits this role
- Most relevant proof
- Relevant projects
- AI Product Manager strengths
- Risks or questions to clarify
- Suggested interview focus
- Contact

Initial implementation can be copy-to-clipboard Markdown. PDF export or hosted share links are later enhancements.

## Guardrails

AI Ramin must:

- Use approved portfolio context as source of truth.
- Separate verified proof from inference.
- Say when evidence is insufficient.
- Avoid generic "passionate and experienced" filler.
- Avoid pretending to be Ramin.
- Avoid invented metrics, dates, roles, credentials, availability, links, or confidential detail.
- Treat framework files as answer structure, not as evidence about Ramin.
- Treat policy files as higher priority than all retrieved evidence.
- Redirect contact, availability, compensation, reference, or sensitive hiring requests to the Contact section when exact context is missing.

## Success Criteria

The upgraded AI Ramin page succeeds when:

- A hiring manager can understand Ramin's AI PM relevance faster than reading the whole site.
- A recruiter can paste a job description and get a truthful, evidence-backed fit summary.
- An AI product leader can see how Ramin thinks about models, context, orchestration, governance, and human judgment.
- A visitor can distinguish verified proof from inferred fit.
- The assistant makes Ramin look sharper without inflating claims.

## Phase 1 Acceptance Checklist

- [x] The upgraded six-experience contract is documented.
- [x] The universal answer contract is defined.
- [x] Evidence card rules are defined.
- [x] Role-fit analyzer, product simulator, and hiring brief contracts are defined.
- [x] The stale modal-only spec is replaced with the current AI Ramin page architecture.
- [x] Structured API response is implemented.
- [x] Hiring mode selector is implemented in the UI.
- [x] Evidence cards are rendered in the UI.
- [x] Role-fit analyzer flow is implemented.
- [x] Product judgment simulator flow is implemented.
- [x] Shareable hiring brief flow is implemented.

## Phase 2 API Contract

`/api/ai-ramin` now preserves the legacy `answer` field for the current chat UI and also returns structured data for the upgraded page.

Response shape:

```ts
type AiRaminStructuredResponse = {
  answer: string;
  mode: 'recruiter' | 'hiring-manager' | 'founder' | 'ai-product-lead' | 'investor' | 'curious-visitor';
  requestType: 'general_chat' | 'role_fit' | 'product_judgment' | 'evidence_lookup' | 'hiring_brief';
  sections: {
    short_answer: string;
    verified_proof: string[];
    inferred_fit: string[];
    confidential_boundary: string[];
    open_questions: string[];
    suggested_next_action: string;
  };
  evidenceCards: AiRaminEvidenceCard[];
  evidenceLookupAnalysis?: null | {
    query_summary: string;
    strongest_verified_proof: string[];
    supporting_evidence: string[];
    public_links: string[];
    source_filters: string[];
    confidence_notes: string[];
    missing_evidence: string[];
    suggested_next_actions: string[];
  };
  briefSeed: null | {
    mode: string;
    requestType: string;
    headline?: string;
    whyRaminFits: string;
    mostRelevantProof: string[];
    relevantProjects?: string[];
    inferredStrengths: string[];
    risksOrQuestions: string[];
    evidenceCardTitles: string[];
    selectedProofAnchors?: string[];
    suggestedInterviewFocus: string[];
    contactCta: string;
  };
  model: string;
  sourceMetadata: {
    contextSources: string[];
    contextChunkCount: number;
    contextTruncated: boolean;
    corpusStats: Record<string, unknown>;
    evidenceCardCount: number;
  };
};
```

Backend behavior:

- Accepts optional `mode` or `hiringMode` and normalizes invalid values to `hiring-manager`.
- Accepts optional `requestType`; otherwise infers request type from the visitor message.
- Asks the model for structured JSON sections.
- Builds the visible Markdown `answer` from normalized sections so the current UI continues to work.
- Builds evidence cards deterministically from retrieved corpus chunks.
- Adds public source links to generated corpus chunks when frontmatter provides `public_links`.
- Creates `briefSeed` for `role_fit` and `hiring_brief` requests.
- Keeps legacy `contextSources`, `contextChunkCount`, and `contextTruncated` fields for compatibility.

## Phase 2 Acceptance Checklist

- [x] API returns `mode` and `requestType`.
- [x] API returns normalized `sections`.
- [x] API returns deterministic `evidenceCards`.
- [x] API returns `sourceMetadata`.
- [x] API returns `briefSeed` for role-fit and hiring-brief paths.
- [x] Existing chat UI can still render `answer`.

## Phase 3 Page Shell

The AI Ramin page now has a three-part product surface:

- left control rail for visitor lens and request type
- center chat surface with suggestions and composer context
- right proof rail for answer contract, evidence cards, confidence labels, source metadata, and hiring-brief readiness

Implemented UI behavior:

- Visitor modes are visible as selectable controls.
- Request types are visible as selectable controls.
- Request-type buttons can seed the composer with task-specific prompt templates.
- Composer displays the active visitor lens and request type.
- Frontend sends `hiringMode` and non-default `requestType` to `/api/ai-ramin`.
- Latest structured response is stored client-side.
- Proof rail renders:
  - returned mode and request type
  - answer-contract section population
  - verified proof
  - inferred fit
  - confidential boundaries
  - deterministic evidence cards
  - context chunk/card metadata
  - hiring-brief seed readiness
- Existing chat answer rendering remains backward-compatible through the `answer` field.

Phase 3 deliberately does not yet create separate dedicated role-fit, simulator, or brief-builder workflows. Those are next phases that can use the controls and proof rail now in place.

## Phase 3 Acceptance Checklist

- [x] AI Ramin is visibly framed as an AI Product Manager CV surface.
- [x] Hiring modes are selectable on the page.
- [x] Request types are selectable on the page.
- [x] Composer is aware of selected mode and request type.
- [x] Structured response metadata has a dedicated proof/confidence panel.
- [x] Evidence cards have confidence labels and source paths/links.
- [x] Layout has responsive rules for desktop, tablet, and mobile.

## Phase 4 Role-Fit Analyzer

Phase 4 turns the `role_fit` request type into a dedicated analyzer flow inside the AI Ramin page.

Implemented UI behavior:

- Selecting Role-fit analyzer opens a purpose-built role/context paste area.
- The role-fit analyzer submits a dedicated `role_fit` request instead of relying on the generic composer template.
- The generic suggestion tray is hidden while role-fit mode is active.
- The role-fit analyzer tracks pasted-character count and prevents empty analysis requests.
- Returned role-fit analysis renders as:
  - role summary
  - strongest matching work evidence
  - strongest matching project evidence
  - AI Product Manager strengths
  - likely gaps or questions
  - first-90-day operating approach
  - suggested interview focus
  - hiring-brief handoff
- The handoff can trigger a `hiring_brief` request seeded from the role-fit analysis.

Implemented API behavior:

- Role-fit requests may now include `role_fit_analysis` in the model JSON output.
- The server normalizes `role_fit_analysis` into `roleFitAnalysis` for the frontend.
- The server falls back to structured answer sections and deterministic evidence cards when a role-fit subsection is missing.
- Role-fit requests allow longer visitor input for pasted job descriptions.
- Role-fit generation has a larger output token budget than normal chat.

## Phase 4 Acceptance Checklist

- [x] Role-fit mode has a dedicated paste area.
- [x] Role-fit submissions use the `role_fit` request type.
- [x] Role-fit output is rendered outside the generic chat transcript.
- [x] Work evidence and project evidence are separated.
- [x] First-90-day plan and interview focus are explicit output sections.
- [x] Hiring-brief handoff is available from the completed role-fit result.

## Phase 5 Product Judgment Simulator

Phase 5 turns the `product_judgment` request type into a dedicated simulator inside the AI Ramin page.

Implemented UI behavior:

- Selecting Product judgment simulator opens a purpose-built scenario paste area.
- The simulator submits a dedicated `product_judgment` request instead of relying on the generic composer template.
- The generic suggestion tray is hidden while simulator mode is active.
- The simulator tracks pasted-character count and prevents empty simulation requests.
- Returned product judgment analysis renders as:
  - scenario summary
  - Model layer
  - Context layer
  - Orchestration layer
  - Governance layer
  - Human layer
  - recommended MVP path
  - riskiest assumptions
  - eval and guardrail plan
  - key tradeoffs
  - next questions

Implemented API behavior:

- Product judgment requests may now include `product_judgment_analysis` in the model JSON output.
- The server normalizes `product_judgment_analysis` into `productJudgmentAnalysis` for the frontend.
- The server falls back to structured answer sections when a product judgment subsection is missing.
- Product judgment generation has a larger output token budget than normal chat.

## Phase 5 Acceptance Checklist

- [x] Product judgment mode has a dedicated scenario area.
- [x] Product judgment submissions use the `product_judgment` request type.
- [x] Product judgment output is rendered outside the generic chat transcript.
- [x] Model, Context, Orchestration, Governance, and Human layers are explicit output sections.
- [x] MVP path, riskiest assumptions, eval/guardrails, tradeoffs, and next questions are explicit output sections.

## Phase 6 Shareable Hiring Brief Builder

Phase 6 turns the `hiring_brief` request type into a dedicated builder inside the AI Ramin page.

Implemented UI behavior:

- Selecting Hiring brief opens a purpose-built hiring-context paste area.
- The hiring-brief builder submits a dedicated `hiring_brief` request instead of relying on the generic composer template.
- The generic suggestion tray is hidden while hiring-brief mode is active.
- Empty brief requests are blocked until the visitor pastes context or pulls in the latest AI Ramin analysis.
- The Role-fit analyzer handoff opens the hiring-brief builder with the latest role-fit context.
- Returned hiring brief output renders as:
  - brief headline
  - why Ramin fits
  - most relevant proof
  - relevant projects
  - AI Product Manager strengths
  - risks or questions
  - suggested interview focus
  - selected proof anchors
  - contact CTA
- A copy-ready Markdown version can be copied from the brief preview.

Implemented API behavior:

- Hiring-brief requests may now include `hiring_brief` in the model JSON output.
- The server normalizes `hiring_brief` into the existing `briefSeed` response object.
- Deterministic evidence card titles remain the default source for selected proof anchors.
- The server falls back to structured answer sections and retrieved evidence cards when a brief subsection is missing.
- Hiring-brief generation has a larger output token budget than normal chat.

## Phase 6 Acceptance Checklist

- [x] Hiring-brief mode has a dedicated paste area.
- [x] Hiring-brief submissions use the `hiring_brief` request type.
- [x] Hiring-brief output is rendered outside the generic chat transcript.
- [x] Brief preview includes a copy-ready structure.
- [x] Selected proof anchors are tied to retrieved evidence cards.
- [x] Risks/questions, interview focus, and contact CTA are explicit output sections.

## Phase 7 Evidence Proof Explorer

Phase 7 turns the `evidence_lookup` request type into a dedicated proof explorer inside the AI Ramin page.

Implemented UI behavior:

- Selecting Evidence lookup opens a purpose-built capability/project/domain search area.
- The proof explorer submits a dedicated `evidence_lookup` request instead of relying on the generic composer template.
- The generic suggestion tray is hidden while evidence-lookup mode is active.
- Empty proof searches are blocked until the visitor enters a capability, project, domain, or role requirement.
- Visitors can filter the proof surface by source type:
  - all
  - work
  - project
  - writing
  - course
  - talk
  - policy
  - framework
- Returned evidence lookup output renders as:
  - query summary
  - strongest verified proof
  - supporting evidence
  - public links
  - source filters
  - confidence notes
  - missing evidence
  - suggested next actions
  - deterministic evidence cards with confidence labels
  - public-link handoff when a retrieved proof card has a public URL

Implemented API behavior:

- Evidence lookup requests may now include `evidence_lookup_analysis` in the model JSON output.
- The server normalizes `evidence_lookup_analysis` into `evidenceLookupAnalysis` for the frontend.
- Public links are exposed to the model through retrieved source metadata when present.
- The server falls back to structured answer sections and deterministic evidence cards when an evidence subsection is missing.
- Evidence lookup generation has a larger output token budget than normal chat.

## Phase 7 Acceptance Checklist

- [x] Evidence lookup mode has a dedicated proof search area.
- [x] Evidence lookup submissions use the `evidence_lookup` request type.
- [x] Evidence lookup output is rendered outside the generic chat transcript.
- [x] Source filters are visible and affect the proof-card surface.
- [x] Evidence cards show confidence labels and source paths.
- [x] Public proof cards expose a public-link handoff.
- [x] Missing evidence and confidence notes are explicit output sections.

## Phase 8 Evaluation And Hardening Loop

Phase 8 adds an offline evaluation loop so AI Ramin can be hardened before live answer review.

Implemented evaluation behavior:

- `npm run check:ai-ramin-eval` runs the deterministic AI Ramin evaluation suite.
- `npm run check:ai-ramin-routing` verifies interview routing and CTA contract consistency between server logic, evaluator logic, and eval cases.
- `npm run check:ai-ramin-feedback` verifies answer-feedback wiring and local review-log contract.
- `npm run check:ai-ramin-review` verifies the local feedback-review workflow, report shape, and eval-case candidate contract.
- `npm run review:ai-ramin-feedback` turns local feedback records into a triage report.
- `npm run evaluate:ai-ramin` writes a local report and appends failures to the local failure log when failures exist.
- Evaluation cases live in `ai-ramin-section/evaluation/eval-cases.json`.
- The evaluator checks:
  - valid request type and hiring mode
  - expected source roles
  - expected source file coverage
  - expected keyword coverage in retrieved context
  - minimum answerable public-safe evidence coverage
  - required answer-contract sections
  - policy retrieval for guardrail cases
- The quality gate currently requires:
  - 100 percent pass rate
  - average score of at least 85
  - zero failed cases
- The evaluator does not call Gemini. It tests retrieval and source-contract health before model wording is generated.
- The routing checker does not call Gemini. It prevents the server and offline evaluator from silently drifting after changes to question types, answer techniques, answer frames, or soft CTAs.
- The feedback contract checker does not call Gemini. It verifies the feedback affordance, API route, JSONL schema, and local log ignore rule.
- The feedback review contract checker does not call Gemini. It verifies the local triage workflow, generated report schema, recurring-issue grouping, and eval-case candidate output.

Implemented hardening workflow:

- `ai-ramin-section/evaluation/README.md` documents the runbook, quality gate, failure triage, and corpus-improvement loop.
- `ai-ramin-section/evaluation/failure-log.schema.json` defines the failure-log record shape.
- `ai-ramin-section/evaluation/live-feedback.schema.json` defines the visitor-feedback record shape.
- `ai-ramin-section/evaluation/latest-feedback-review.schema.json` defines the generated feedback-review report shape.
- `ai-ramin-section/evaluation/latest-evaluation-report.json` is generated locally and ignored by git.
- `ai-ramin-section/evaluation/failure-log.jsonl` is generated locally and ignored by git.
- `ai-ramin-section/evaluation/live-feedback.jsonl` is generated locally and ignored by git.
- `ai-ramin-section/evaluation/latest-feedback-review.json` is generated locally and ignored by git.
- `npm run verify` now includes the AI Ramin eval gate after corpus validation and before the production build.
- `npm run verify` now includes the AI Ramin routing gate after the eval gate and before the production build.
- `npm run verify` now includes the AI Ramin feedback contract gate after the routing gate and before the production build.
- `npm run verify` now includes the AI Ramin feedback-review contract gate after the feedback gate and before the production build.

## Phase 8 Acceptance Checklist

- [x] Curated AI Ramin prompt tests are stored as structured data.
- [x] Evaluation runner checks retrieval, guardrail, evidence, and answer-contract expectations.
- [x] Failure-mode logging has a JSONL schema and local append path.
- [x] Corpus-improvement workflow is documented.
- [x] AI Ramin eval gate is available as an npm script.
- [x] AI Ramin interview-routing drift gate is available as an npm script.
- [x] AI Ramin answer-feedback contract gate is available as an npm script.
- [x] AI Ramin feedback-review contract gate is available as an npm script.
- [x] Main verification pipeline includes the AI Ramin eval gate.
- [x] Main verification pipeline includes the interview-routing gate.
- [x] Main verification pipeline includes the feedback contract gate.
- [x] Main verification pipeline includes the feedback-review contract gate.

## Interview Answering Integration Stage 7

Stage 7 hardens the interview-answering integration so it does not become prompt-only behavior.

Implemented behavior:

- `server/aiRaminHandler.mjs` remains the live routing source for question type, answer technique, answer frame, retrieval profile, answer-shape metadata, and soft CTAs.
- `scripts/evaluate-ai-ramin.mjs` mirrors that routing for deterministic offline testing.
- `scripts/check-ai-ramin-interview-routing.mjs` checks the mirror against the server and checks that eval cases stay aligned with the live routing contract.
- The routing check requires every question type to have at least one eval case.
- The routing check catches soft CTA drift, so "Draft brief", "Interview questions", "MVP plan", "Show risks", "Stronger proof", and related follow-up actions stay tied to the right answer shape.
- Debug-only answer-shape metadata remains hidden from normal visitors and appears only through the dev/debug drawer.

## Stage 7 Acceptance Checklist

- [x] Server answer frames, evaluator answer frames, and eval-case expectations are checked for drift.
- [x] Soft CTA routing is checked deterministically.
- [x] Every question type has eval coverage.
- [x] The routing check is available through `npm run check:ai-ramin-routing`.
- [x] The main `npm run verify` pipeline includes the routing check.

## Interview Answering Integration Stage 8

Stage 8 adds a lightweight answer-feedback and review loop without adding a new visible panel.

Implemented behavior:

- Each non-intro assistant answer can be marked `Yes` or `Needs work` from a subtle inline feedback row.
- `Needs work` opens a small optional note field so the reviewer can state what was missing or off.
- Feedback is sent to `/api/ai-ramin/feedback`.
- The Vite dev server and production Node server both expose the feedback endpoint.
- The server writes local JSONL review records to `ai-ramin-section/evaluation/live-feedback.jsonl`.
- Feedback records include request type, lens, model, answer shape, evidence counts, prompt preview, answer preview, optional note, and review priority.
- The generated local feedback log is ignored by git.
- `scripts/check-ai-ramin-feedback-contract.mjs` verifies the feedback wiring and schema contract.

## Stage 8 Acceptance Checklist

- [x] Visitor-facing answer feedback is available inside the chat transcript.
- [x] Feedback stays subtle and does not introduce another panel.
- [x] Negative feedback can include a short note.
- [x] Feedback POSTs to a server endpoint.
- [x] Local review records are written as JSONL.
- [x] The local feedback log is ignored by git.
- [x] The feedback contract check is available through `npm run check:ai-ramin-feedback`.
- [x] The main `npm run verify` pipeline includes the feedback contract check.

## Interview Answering Integration Stage 9

Stage 9 turns raw feedback records into a local review workflow so weak answers can be triaged without opening JSONL by hand.

Implemented behavior:

- `npm run review:ai-ramin-feedback` reads `ai-ramin-section/evaluation/live-feedback.jsonl`.
- The review report is written to `ai-ramin-section/evaluation/latest-feedback-review.json`.
- The review report summarizes feedback by feedback type, review priority, request type, answer frame, and likely issue label.
- Needs-review records are sorted into a review queue with likely issue labels and recommended actions.
- Recurring issues are grouped by request type, answer frame, and primary label.
- High-priority or recurring needs-review feedback becomes `eval_case_candidates` for manual promotion into `eval-cases.json`.
- Filters are available for feedback type, priority, request type, and answer frame.
- `scripts/check-ai-ramin-feedback-review-contract.mjs` verifies the review workflow contract.
- Generated review reports are ignored by git.

## Stage 9 Acceptance Checklist

- [x] Feedback can be reviewed without opening raw JSONL manually.
- [x] Feedback can be filtered by feedback type, priority, request type, and answer frame.
- [x] Needs-review records get likely issue labels and recommended actions.
- [x] Recurring issues are grouped.
- [x] Eval-case candidates are generated for high-priority or recurring feedback.
- [x] Review report schema exists.
- [x] Review report output is ignored by git.
- [x] The review workflow is available through `npm run review:ai-ramin-feedback`.
- [x] The review contract check is available through `npm run check:ai-ramin-review`.
- [x] Main verify includes the review contract check.

## Answer Quality Recovery Stage 9

This Stage 9 regression pass protects the newer answer-quality and weak-answer recovery work from quietly regressing.

Implemented behavior:

- `scripts/check-ai-ramin-weak-answer-ui-contract.mjs` verifies that server quality-gate metadata is emitted, evaluated, and consumed by the UI.
- The regression check confirms every required answer-quality issue has an eval fixture, including over-cautious answers, raw JSON leakage, local source leakage, internal metadata leakage, duplicated next-action labels, generic behavioral answers, and missing behavioral stories.
- The UI contract verifies that weak answers suppress the role-fit, product-judgment, and hiring-brief modules while keeping a single evidence disclosure available when useful.
- Minimal weak-answer CTAs are locked to the softer recovery path instead of the normal chip-heavy path.
- Simplified weak-answer CSS is covered by the contract check.
- The regression check is included in the main `npm run verify` pipeline through `npm run check:ai-ramin-weak-ui`.

## Answer Quality Stage 9 Acceptance Checklist

- [x] Weak answers are identifiable from quality-gate metadata.
- [x] Weak answers do not render the full structured module stack.
- [x] Weak answers keep evidence available when a source trail exists.
- [x] Weak-answer CTAs stay minimal.
- [x] Required answer-quality issues are represented in eval fixtures.
- [x] The regression check is available through `npm run check:ai-ramin-weak-ui`.
- [x] Main verify includes the weak-answer regression check.

## Stage 8: Evals And Regression Suite

This Stage 8 pass adds a combined regression gate for the failure modes that appeared during manual AI Ramin testing.

Implemented behavior:

- `ai-ramin-section/evaluation/regression-suite-fixtures.json` stores deterministic regression cases for casual routing, professional routing, conversation follow-ups, and answer-quality recovery.
- `scripts/check-ai-ramin-regression-suite.mjs` runs the combined regression suite without calling Gemini.
- The regression suite verifies that casual openers such as `hey` and `hows it going` stay in `conversation_open`, do not retrieve evidence, and do not fall through to portfolio overview.
- The suite verifies that role-fit and strongest-product questions for any company route to evidence-backed professional answer shapes.
- The suite verifies that first-90-days and enterprise follow-ups inherit previous intent and carry prior evidence anchors into the prompt.
- The suite verifies that generic biography answers to casual greetings are recovered into lightweight chat copy.
- The suite verifies that over-cautious first-90-days answers recover into a diagnostic ramp plan with evals and guardrails.
- `npm run check:ai-ramin-regression` is included in `npm run verify`.

## Stage 8 Acceptance Checklist

- [x] Casual/professional separation has regression fixtures.
- [x] Conversation continuity has regression fixtures.
- [x] Over-cautious answer recovery has regression fixtures.
- [x] Generic biography responses to casual greetings are quality-gated.
- [x] The regression suite runs offline without model calls.
- [x] The regression suite is available through `npm run check:ai-ramin-regression`.
- [x] Main verify includes the regression suite.

## Next Phase

Phase 10 should add a small local review surface or promotion workflow that helps move approved eval-case candidates into `eval-cases.json` with human confirmation.
