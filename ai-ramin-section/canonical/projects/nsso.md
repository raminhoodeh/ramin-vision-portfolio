---
title: "nsso"
source_type: project_case_study
trust_level: canonical_candidate
visibility: public_portfolio_safe
retrieval_priority: high
answer_permission: factual_answer
source_paths:
  - "projects-section/nsso - Portfolio Write-Up.md"
  - "src/data/portfolio.ts"
public_links:
  - "https://nsso.me/"
  - "https://nsso.me/ramin"
---

# nsso

## Summary

nsso is Ramin's flagship personal identity product. It is a unified professional identity surface with structured profile data, storefronts, product listings, contact methods, and an agentic AI profile coach called Deity.

## Problem

Professional identity online is fragmented across LinkedIn, websites, link pages, payment links, portfolios, and messaging channels. nsso treats this as an identity operating-system problem, not just a presentation problem.

This is especially relevant for creatives, creative founders, public-facing builders, and independent professionals whose work does not fit neatly into a single resume, link-in-bio page, or portfolio category. The product gives those users a way to organise professional proof, creative identity, products, writing, projects, and contact routes in one coherent public surface.

Ramin's work on nsso is relevant evidence that he has worked directly with creative self-presentation problems: helping people explain what they make, turn fragmented projects into a coherent public identity, and present creative/professional proof without flattening it into a conventional CV.

This context is especially strong because Ramin is himself a creative as well as a product manager: he is a fiction author, writer, teacher, and builder who has had to solve his own public-identity problem across product work, writing, teaching, and independent projects.

## Architecture

The product includes:

- public profile pages at `nsso.me/[username]`
- structured CV fields for experiences, qualifications, and projects
- storefront and monetisation surfaces
- product listings and sales pages
- PayPal and Polar payment support
- referral earnings programme
- profile completeness scoring
- Deity AI profile coach
- RAG over a curated knowledge base
- Gemini embeddings and Gemini chat
- Supabase Postgres, pgvector, Supabase Storage, and tool calling

## Deity Agent

Deity reads the user's live profile context and can propose profile changes through tool calls. Changes are shown in Review Mode before writing to Supabase. Guest sessions disable tools.

This is strong evidence for AI product governance: the product allows AI-assisted mutation but keeps the human in control.

## Tradeoffs

- Intent arbitration is heuristic and needs a classifier.
- Tool-call parsing needs automated regression coverage.
- Ingestion idempotency needs improvement.
- The sales page CRO schema is a reasonable prior, not yet validated by A/B testing.

## What This Proves

- AI profile coaching.
- RAG and profile-aware retrieval.
- Tool calling with review mode.
- User-owned professional identity.
- AI governance inside a real product surface.
- Product discovery around fragmented identity, creative self-presentation, and public-facing professional proof.
- Product thinking for creatives whose needs combine identity, proof, narrative, monetisation, and audience trust.

## Retrieval Guidance

Use this file for questions about AI agents, profile context, RAG, tool calls, professional identity, review mode, AI governance, creator/creative user needs, creatives, creative self-presentation, or examples of Ramin building AI products from a user-context and product-discovery starting point.
