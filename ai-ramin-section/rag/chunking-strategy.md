---
title: "RAG Chunking Strategy"
source_type: ingestion_policy
trust_level: generic
visibility: internal_rag_build
retrieval_priority: high
answer_permission: use_as_ingestion_spec
source_paths:
  - "ai-ramin-context/frameworks/ai-product-management.md"
  - "ai-ramin-context/policies/source-priority.md"
verification_status: implementation_spec
---

# RAG Chunking Strategy

Chunking should preserve meaning and source role. AI Ramin needs source-safe chunks more than maximum recall.

## Chunking Principles

- Preserve YAML frontmatter as metadata, not body text.
- Split on Markdown headings before token limits.
- Keep one idea per chunk where possible.
- Do not mix personal evidence with generic frameworks.
- Do not mix policy instructions with factual Ramin evidence.
- Keep story cards mostly intact.
- Keep policy activation messages with their relevant guardrail.

## Recommended Chunk Sizes

| Source role | Target size | Overlap | Notes |
| --- | --- | --- | --- |
| policy | 250 to 500 tokens | 50 tokens | Keep rules and activation messages together. |
| canonical | 350 to 700 tokens | 75 tokens | Preserve factual sections and proof areas. |
| work | 350 to 700 tokens | 75 tokens | Keep role, responsibilities, outcomes, boundaries together. |
| project | 400 to 800 tokens | 100 tokens | Preserve problem, architecture, tradeoffs, and proof. |
| story | 500 to 900 tokens | 100 tokens | Keep full example when possible. |
| framework | 300 to 650 tokens | 75 tokens | Keep structure tables or lists intact. |

## Heading-Aware Splitting

Preferred splitting:

1. Split by H1.
2. Split by H2.
3. Split by H3 if a section exceeds target size.
4. Split long bullet sections only at bullet boundaries.
5. Add overlap from the previous section only when it does not introduce a different source role or claim type.

## Story Bank Chunking

Story files should usually produce one or two chunks:

- metadata and retrieval intent
- full story body, tradeoff, result, and answer boundary

Do not split a behavioural story so far that situation, action, and result land in different retrieval results.

## Policy Chunking

Each guardrail should be its own chunk when possible.

Policy chunks should include:

- guardrail title
- rule
- activation message
- safe answer pattern

## Framework Chunking

Framework chunks should be retrieved only after personal evidence.

Keep framework names and usage conditions together so the model does not apply the wrong structure.

## Token Estimation

Approximate tokens as:

```text
ceil(character_count / 4)
```

This is sufficient for ingestion validation. Runtime code can replace it with tokenizer-specific counts later.

## Bad Chunking Patterns

Avoid:

- one giant chunk per file
- tiny chunks that lose context
- combining raw source exports with canonical summaries
- combining contradictory metrics in one chunk without status metadata
- embedding frontmatter as natural-language content
- indexing image base64 or exported visual artifacts
