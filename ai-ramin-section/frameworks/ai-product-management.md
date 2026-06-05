---
title: "AI Product Management"
source_type: generic_framework
trust_level: generic
visibility: internal_framework_only
retrieval_priority: high
answer_permission: use_as_framework_only
source_paths:
  - "ai-ramin-context/Interview Questions and Answers 2aa6fe2ecf37809490a2fcbd613f7a3b.md"
  - "ai-ramin-context/canonical/profile.md"
  - "ai-ramin-context/canonical/product-philosophy.md"
verification_status: distilled_generic_framework
---

# AI Product Management

Use this file to shape AI PM answers. Do not use it as evidence about Ramin unless canonical personal files are also retrieved.

## AI PM Answer Shape

A strong AI PM answer should cover:

1. User job and product context.
2. AI capability needed.
3. Context, data, and retrieval requirements.
4. UX trust and transparency.
5. Model quality, uncertainty, and failure modes.
6. Evals and success metrics.
7. Guardrails, privacy, and abuse prevention.
8. Cost, latency, reliability, and operational ownership.
9. Launch criteria and monitoring.

## AI Product Sense

AI product sense requires more than asking "can a model do this."

Evaluate:

- whether AI creates a better user outcome than a deterministic workflow
- whether uncertainty is acceptable in the user context
- where human review or user confirmation is needed
- whether the product needs generation, retrieval, classification, ranking, reasoning, or orchestration
- what the system should do when it is unsure
- whether the experience earns trust over repeated use

## AI Product Execution

Execution answers should separate product, model, data, and UX causes.

Useful diagnostic categories:

- retrieval miss
- weak source material
- poor prompt or orchestration
- model capability gap
- latency or cost issue
- unsafe or overconfident output
- confusing UX or missing feedback loop
- poor eval coverage

## AI Metrics

AI Ramin should think in metric layers:

- user outcome: task completion, decision quality, saved time, confidence
- model quality: factuality, relevance, coherence, calibration
- retrieval quality: source hit rate, source coverage, stale-source rate
- safety: inappropriate answer rate, over-refusal rate, unsafe answer rate
- reliability: latency, tool-call success, error rate
- cost: cost per successful task, usage per user, gross margin impact
- learning: thumbs up or down, corrections, escalation rate

## Safety And Ethics

Use this structure for AI risk questions:

1. Identify the harm category.
2. Estimate severity, likelihood, and reversibility.
3. Find root cause: data, retrieval, prompt, model, UX, policy, or user behaviour.
4. Add layered defences: policy, prompt, retrieval filters, evals, UI friction, human review, logging.
5. Define safety metrics and review cadence.
6. Explain what the system does when it does not know.

## RAG Reasoning

For AI Ramin specifically, a good RAG answer should consider:

- corpus quality before model quality
- source priority and public-safe visibility
- chunk granularity by role, project, story, framework, and policy
- metadata filters for source type, trust level, visibility, and answer permission
- retrieval evaluation using real hiring-manager questions
- citation or evidence labels where useful
- fallback when retrieval returns weak evidence

## Public-Safe Boundary

When discussing Ramin's current or recent AI work, use only public-safe context.

Avoid private company detail, internal architecture, sensitive metrics, unreleased roadmap detail, or claims that have not been verified in canonical files.
