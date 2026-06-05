---
title: "Product Tradeoff - 24Seven Catalog Injection vs RAG"
source_type: story_bank
story_type: ai_product_tradeoff
structure: Tradeoff
trust_level: canonical_candidate
visibility: public_portfolio_safe
retrieval_priority: medium
answer_permission: adapt_as_story
entities:
  - 24Seven Concierge
question_intents:
  - ai_product_judgement
  - rag_tradeoff
  - product_architecture
  - ai_concierge
source_paths:
  - "ai-ramin-context/canonical/projects/24seven-concierge.md"
  - "projects-section/24Seven - Portfolio Write-up.md"
---

# Product Tradeoff - 24Seven Catalog Injection vs RAG

## Use This Story For

- "How does Ramin decide whether to use RAG?"
- "Can Ramin make pragmatic AI architecture decisions?"
- "How does Ramin think about AI concierge products?"

## Public-Safe Story

For 24Seven Concierge, Ramin chose full compressed Shopify catalog injection instead of vector RAG. The catalog was small enough that injecting it directly gave Gemini complete visibility over the available products. That mattered because luxury travel planning is often multi-constraint and cross-category.

A retrieval system might find the most semantically similar products, but miss combinations that only become relevant together, such as a yacht, villa, and car across the same trip.

## Tradeoff Structure

### Option A

Use vector RAG to retrieve a top-k subset of products.

### Option B

Inject the compressed catalog directly into the model context.

### Decision

Use direct catalog injection for v1 because the catalog size made it simpler and more reliable.

### Cost

As inventory grows, prompt length, latency, and cost become problems.

### Benefit

The model can reason across the whole catalog and recommend product combinations rather than isolated matches.

## What It Proves

- RAG is not treated as default architecture.
- Ramin can choose simpler systems when they better fit the scale.
- AI product architecture is tied to user workflow, not hype.

## Avoid

- Do not claim this approach scales indefinitely.
- Do not imply RAG is bad. The story is about choosing the right architecture for the catalog size and use case.
