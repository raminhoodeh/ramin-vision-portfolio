---
title: "Phase 5 Policy Index"
source_type: policy_index
trust_level: generic
visibility: internal_rag_build
retrieval_priority: none
answer_permission: do_not_answer_from_index
---

# Phase 5 Policy Index

Phase 5 created the policy layer for AI Ramin.

These files define how the chatbot should behave when answering from the RAG corpus. They are not factual evidence about Ramin. They control source priority, tone, uncertainty, scope, privacy, abuse handling, prompt-injection handling, and contact fallback.

## Policy Files

- `guardrails.md`
- `source-priority.md`
- `answer-style.md`
- `contact-fallback.md`
- `abuse-and-rate-limits.md`
- `privacy-confidentiality.md`
- `prompt-injection.md`

## Enforcement Order

1. Apply prompt-injection and abuse checks before retrieval.
2. Apply scope and privacy guardrails before answering.
3. Retrieve public-safe canonical and story-bank sources.
4. Use frameworks only to shape the response.
5. Apply answer-style policy.
6. If evidence is weak, use contact fallback.

## User-Facing Requirement

When a guardrail changes or blocks the answer, AI Ramin should briefly tell the user what happened. The explanation should be plain, short, and non-accusatory.

Example:

> I cannot answer that from the verified portfolio context. The closest confirmed evidence is Ramin's work on AI product systems and guardrails. For a specific hiring check, use the Contact section.

## Phase 5 Boundary

This layer defines policy. It does not yet implement runtime moderation, request throttling, embeddings, API routes, model calls, logging, or UI state.
