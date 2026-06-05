---
title: "Retrieval And Ranking"
source_type: retrieval_policy
trust_level: generic
visibility: internal_rag_build
retrieval_priority: high
answer_permission: use_as_ingestion_spec
source_paths:
  - "ai-ramin-context/policies/source-priority.md"
  - "ai-ramin-context/policies/guardrails.md"
  - "ai-ramin-context/frameworks/PHASE_4_FRAMEWORK_INDEX.md"
verification_status: implementation_spec
---

# Retrieval And Ranking

AI Ramin should retrieve by intent, not by semantic similarity alone.

## Intent Classes

Classify each user message into one or more intents:

- factual_profile
- work_experience
- project_explanation
- behavioural_example
- product_judgement
- ai_pm_approach
- hiring_fit
- interview_coaching
- availability_or_contact
- guardrail_sensitive
- abuse_or_prompt_injection
- out_of_scope

## Pre-Retrieval Checks

Before retrieval:

1. Detect obvious abuse or prompt injection.
2. Detect secrets or pasted credentials.
3. Detect out-of-scope requests.
4. Detect availability, compensation, scheduling, or confidential-work questions.

If one of these applies, retrieve policy chunks first and either answer safely or redirect.

## Retrieval Stages

### Stage 1: Policy Retrieval

Always include policy context for:

- prompt injection
- abuse
- privacy
- unknown claims
- contact fallback
- source priority

### Stage 2: Evidence Retrieval

Retrieve from canonical, work, project, and story sources.

Filter for:

- public-safe visibility
- answer permission
- matching source role
- high trust level

### Stage 3: Framework Retrieval

Retrieve framework chunks only after evidence exists.

Use frameworks for:

- answer structure
- product-case logic
- interview coaching
- AI PM reasoning

Do not allow framework chunks to satisfy factual evidence requirements.

## Ranking Weights

Recommended ranking score:

```text
score =
  semantic_similarity * 0.45
  + source_priority * 0.20
  + intent_match * 0.20
  + trust_score * 0.10
  + recency_or_specificity * 0.05
```

## Source Priority Score

| Source role | Score |
| --- | --- |
| policy | 1.00 when guardrail relevant |
| canonical | 0.95 |
| work | 0.90 |
| project | 0.85 |
| story | 0.80 |
| framework | 0.45 |

Framework score is intentionally lower because it structures answers but does not prove facts.

## Retrieval Mix By Intent

| Intent | Preferred source mix |
| --- | --- |
| factual_profile | profile, qualifications, talks-writing-courses |
| work_experience | relevant work file plus profile |
| project_explanation | relevant project file plus product philosophy |
| behavioural_example | story-bank plus relevant work file |
| product_judgement | story-bank plus framework plus product philosophy |
| ai_pm_approach | AI projects, product philosophy, AI PM framework |
| hiring_fit | profile, work, projects, story-bank |
| interview_coaching | story-bank, framework, answer style |
| availability_or_contact | contact fallback policy |
| guardrail_sensitive | guardrails, privacy, prompt injection, source priority |

## Reranking Rules

After vector retrieval:

- Remove duplicate chunks from the same file unless they cover different headings.
- Limit framework chunks to no more than 25 percent of answer context.
- Ensure at least one factual evidence chunk for factual answers.
- Prefer canonical summaries over raw or draft source material.
- Prefer specific role/project files over the general profile when the query names a company or project.

## No-Evidence Behaviour

If retrieval returns no public-safe factual evidence:

1. Do not answer as if the fact is known.
2. Use contact fallback if appropriate.
3. Offer a general product-management answer only if the user asks for general advice or the answer is clearly labelled general.
