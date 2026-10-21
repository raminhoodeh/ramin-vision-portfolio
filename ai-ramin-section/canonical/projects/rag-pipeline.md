---
title: "RAG Pipeline"
source_type: project_case_study
trust_level: canonical_candidate
visibility: public_portfolio_safe
retrieval_priority: high
answer_permission: factual_answer
source_paths:
  - "src/data/projects.ts"
public_links:
  - "https://github.com/raminhoodeh/unified-rag-pipeline"
---

# RAG Pipeline

Unified RAG Pipeline is a standalone Python package for heading-aware chunking, embeddings, namespace-scoped vector retrieval, exact-duplicate ingestion handling, and cited context packing.

## Implemented behaviour and proof boundary

The offline path uses deterministic HashingEmbedder embeddings and a SQLite vector store. A Gemini embedder and Supabase/pgvector store are available integration paths. The current retrieval layer ranks vector similarity; reranking, MMR diversity, hybrid keyword/vector search, and retrieval-quality evaluation remain planned.

Namespaces scope selected corpora, content hashes prevent exact chunk duplicates within a namespace, and context packs retain source tags under an approximate token budget. These controls do not establish source truth, tenant authorization, or whether generated answers follow the supplied citations.

The offline demo uses Dreamsea, shared, and 24Seven example namespaces. It demonstrates package structure and scoping, not deployment across those private products or a measured improvement in answer quality. The case-study records a local 14-test run for structural behaviours such as chunking, embeddings, idempotency, namespace selection, and context budgets.

The usage-reporting hook can connect embedding spend to a sink such as AI Costs Dashboard. This is an integration option between standalone tools, not proof that both are deployed across every project.

## Retrieval guidance

Use for reusable context infrastructure, retrieval design, source traceability, and tradeoffs. Distinguish implemented vector retrieval from planned reranking and quality evaluation, and structural tests from measured production retrieval quality.
