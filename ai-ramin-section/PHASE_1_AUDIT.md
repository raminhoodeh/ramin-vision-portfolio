# Phase 1 Audit: AI Ramin Context

Date: 2026-05-20

This audit classifies the current `ai-ramin-context/` folder before restructuring it into a retrieval-ready knowledge base for the AI Ramin chatbot.

## Current Inventory

| File | Role | Retrieval Decision |
| --- | --- | --- |
| `PM Experience & Interview Prep 2a86fe2ecf3780d68f85f0edd9085933.md` | Main Ramin-specific evidence source | Restructure before ingestion |
| `Interview Questions and Answers 2aa6fe2ecf37809490a2fcbd613f7a3b.md` | Mixed AI PM frameworks and Ramin interview drafts | Split into story bank and frameworks |
| `How to answer product manager interview questions.md` | Generic PM answer examples and structure | Distill into answer strategy only |
| `Product Manager Interview on Behavioural .md` | Large behavioural interview guide | Archive raw, distill principles |
| `Product Manager Interview Guide.md` | Large PM interview/product case guide | Archive raw, distill principles |
| `Cover Letter Structure 3396fe2ecf3780e08b72c8b61793e234.md` | Writing and cover letter policy | Convert into answer-style policy |
| `CV Resumé 3376fe2ecf3780d4bdeadc4f35cff841.md` | Resume-positioning note | Convert into low-priority resume policy |
| `.DS_Store` | macOS metadata | Exclude |

## Main Finding

The folder currently combines three different knowledge types:

1. **Personal evidence**: Ramin's actual work, product experience, metrics, teams, tools, philosophy, qualifications, talks, writing, and career story.
2. **Interview strategy**: PM interview techniques, behavioural answer structures, AI PM interview patterns, product case frameworks, estimation, pricing, strategy, and tradeoffs.
3. **Voice and policy material**: cover letter style, human writing rules, resume positioning, and future guardrail instructions.

These should not be embedded into the chatbot as one flat context blob. AI Ramin needs a layered retrieval system where personal evidence is treated as source of truth, frameworks are used only to shape reasoning, and policy files control tone and safety.

## Source Classification

### Highest-Value Personal Source

`PM Experience & Interview Prep 2a86fe2ecf3780d68f85f0edd9085933.md`

This is the main source for:

- Ramin's profile and product positioning
- Product Innovation Process
- AI-native product strategy direction
- work at Urgentem, Ordnance Survey, Deity AI, GroupM, Vivup, ERM, Tesla, Cox Automotive, and Side.inc
- product philosophy
- team and stakeholder style
- company-type communication patterns
- backlog tools
- tech stacks
- GTM approaches
- revenue models
- ESG regulation exposure
- specific product tradeoffs and impact claims

Decision: split into canonical profile, product philosophy, work-experience files, qualification/talk/course files, and story-bank candidates.

### Mixed Personal and Strategy Source

`Interview Questions and Answers 2aa6fe2ecf37809490a2fcbd613f7a3b.md`

This file contains both:

- AI PM interview framework material
- Ramin-specific draft answers for Tell Me About Yourself, weakness, proud accomplishment, failure, prioritisation, conflict, career goals, and feedback

Decision: extract verified Ramin stories into `story-bank/`; extract AI PM frameworks into `frameworks/`; keep company-specific application drafts private unless explicitly needed.

### Generic Framework Sources

`How to answer product manager interview questions.md`

Useful for answer structure and PM interview categories. It should inform answer style but not be used as factual evidence.

`Product Manager Interview on Behavioural .md`

Useful for behavioural interview strategy, preparation principles, common mistakes, and narrative structure. It is too broad and too generic for direct retrieval.

`Product Manager Interview Guide.md`

Useful for assumption testing, estimation, strategy, product improvement, launch, design, pricing, and tradeoff framing. It contains large embedded artifacts and external article material. It should be distilled into compact framework cards.

### Policy Sources

`Cover Letter Structure 3396fe2ecf3780e08b72c8b61793e234.md`

Useful for AI Ramin's output style: specific, clear, human, evidence-led, and not overly generic.

`CV Resumé 3376fe2ecf3780d4bdeadc4f35cff841.md`

Useful as a small resume-positioning policy only.

## Retrieval Risks

1. **Generic content could be mistaken for Ramin's experience**

The interview guides contain example answers and external case material. If ingested raw, the chatbot may incorrectly attribute those examples to Ramin.

2. **Raw export artifacts will pollute retrieval**

The two large interview guide files contain embedded image/export artifacts. These create irrelevant retrieval hits and increase token cost.

3. **Private interview-prep drafts may sound too role-specific**

Some answers are written for specific company applications. They should not appear to general website visitors unless the user is explicitly asking for interview preparation.

4. **Frameworks may overpower evidence**

Hiring managers need proof from Ramin's actual work, not generic product management advice. Retrieval should prioritise canonical personal context first.

5. **Unverified metrics need explicit status**

Metrics such as portfolio AUM, savings, student counts, usage, pricing, and revenue model details should be marked as verified, draft, or public-safe before being used in generated answers.

6. **The chatbot needs uncertainty behaviour**

If no canonical source supports an answer, AI Ramin should say it does not have enough context and route the user to the Contact section.

## Phase 1 Decisions

- Do not ingest the raw folder directly.
- Do not move or delete original files yet.
- Treat `PM Experience & Interview Prep` as the primary source of truth after cleanup.
- Treat interview guides as internal framework archives.
- Treat cover letter and resume files as style/policy material.
- Exclude `.DS_Store`.
- Create `raw-archive/` as the destination for originals once Phase 2 canonical files exist.
- Use `00_manifest.yml` as the source classification registry for future ingestion.

## Phase 2 Preparation

Phase 2 should create the following clean folder structure:

```txt
ai-ramin-context/
  canonical/
    profile.md
    product-philosophy.md
    work-experiences/
    projects/
    qualifications.md
    talks-writing-courses.md
  story-bank/
    behavioural/
    product-judgement/
    leadership/
  frameworks/
    interview-answering-strategies.md
    product-management-answer-structures.md
    ai-product-management.md
    product-sense.md
    strategy.md
    execution.md
    tradeoffs.md
  policies/
    guardrails.md
    answer-style.md
    source-priority.md
    contact-fallback.md
  raw-archive/
```

## Phase 2 Extraction Priority

1. Build `canonical/profile.md`.
2. Build one canonical work-experience file per company/project.
3. Extract Ramin-specific behavioural stories from `Interview Questions and Answers`.
4. Distill STAR, CAR, PAR, SOAR, product case framing, execution framing, tradeoff framing, and AI PM framing.
5. Distill guardrails and answer-style policies.
6. Only after canonical files exist, move original exports into `raw-archive/original-notion-exports/` or leave them in place but exclude them from retrieval via manifest.

## Initial RAG Policy From Audit

For website responses, retrieval should use this source order:

```txt
1. canonical personal context
2. work-experience and project case studies
3. story-bank entries
4. answer strategy/framework cards
5. answer-style and guardrail policies
```

It should never use raw interview examples as evidence about Ramin.
