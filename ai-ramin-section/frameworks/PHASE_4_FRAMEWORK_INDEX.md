---
title: "Phase 4 Framework Index"
source_type: framework_index
trust_level: generic
visibility: internal_rag_build
retrieval_priority: none
answer_permission: do_not_answer_from_index
---

# Phase 4 Framework Index

Phase 4 created the framework layer for AI Ramin.

These files are not evidence about Ramin. They are internal answer-shaping tools that help the chatbot structure hiring-manager answers, product judgement answers, product case answers, AI PM answers, and interview-coaching responses.

## Framework Files

- `interview-answering-strategies.md`
- `interview-question-philosophy.md`
- `product-management-answer-structures.md`
- `ai-product-management.md`
- `product-sense.md`
- `strategy.md`
- `execution.md`
- `tradeoffs.md`
- `assumption-testing.md`
- `pricing-metrics-estimation.md`

## Retrieval Policy

Use these files after retrieving canonical personal context and story-bank evidence.

If framework files are retrieved without personal evidence, the chatbot should not answer as though it knows a fact about Ramin. It should say that the available context is insufficient and, where useful, offer to answer using general product-management principles.

Do not expose framework names such as STAR, CAR, SOAR, PAR, or "rule of three" unless the user asks for interview coaching, answer structure, or preparation advice.

## Recommended Retrieval Order

1. Guardrail and source policy.
2. Canonical profile, work, project, qualification, or talk files.
3. Story-bank examples, if the user asks for proof or behavioural examples.
4. Framework files to shape the answer.
5. Contact fallback when evidence is missing, sensitive, or unverifiable.

## Phase 4 Boundary

This layer does not yet implement chunking, embeddings, runtime retrieval, Gemini integration, abuse controls, or source-citation UX. It prepares the cleaned strategy corpus those later phases can use.
