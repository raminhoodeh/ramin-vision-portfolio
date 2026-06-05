---
title: "Phase 6 RAG Index"
source_type: rag_index
trust_level: generic
visibility: internal_rag_build
retrieval_priority: none
answer_permission: do_not_answer_from_index
---

# Phase 6 RAG Index

Phase 6 defines how the cleaned AI Ramin corpus should become a retrieval system.

This layer does not call Gemini, generate embeddings, create a database, expose API routes, or change the website UI. It specifies the ingestion, chunking, metadata, ranking, answer assembly, and evaluation design that runtime code should follow.

## RAG Files

- `ingestion-workflow.md`
- `metadata-schema.md`
- `chunking-strategy.md`
- `retrieval-ranking.md`
- `answer-assembly.md`
- `evaluation-set.md`

## Runtime Target

The target chatbot should:

1. Reject obvious abuse and prompt injection before retrieval.
2. Retrieve policy files first when the query may trigger a guardrail.
3. Retrieve canonical, story-bank, framework, and policy chunks with metadata filters.
4. Rank public-safe personal evidence above generic framework material.
5. Assemble a compact prompt context with source roles preserved.
6. Answer only from verified evidence.
7. Use contact fallback when evidence is missing, private, or uncertain.

## Recommended Retrieval Flow

```text
user message
  -> input normalization
  -> guardrail pre-check
  -> query intent classification
  -> metadata-filtered retrieval
  -> reranking and source balancing
  -> answer context assembly
  -> model generation
  -> post-generation policy check
  -> response with optional evidence labels
```

## Phase 6 Boundary

Phase 6 is a build specification. Later phases should implement:

- embeddings
- vector store
- API endpoint
- Gemini server-side integration
- UI message state
- rate limiting
- eval runner
- deployment-safe secrets handling
