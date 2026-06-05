---
title: "RazinFlix"
source_type: project_case_study
trust_level: canonical_candidate
visibility: public_portfolio_safe
retrieval_priority: medium
answer_permission: factual_answer
source_paths:
  - "projects-section/RazinFlix - Portfolio-Write-up.md"
  - "src/data/portfolio.ts"
public_links:
  - "https://nsso.me/film/razinflix"
verification_status: public_link_review_needed
---

# RazinFlix

## Summary

RazinFlix is a personal film canon and streaming-style curation system. It turns a personal film list into an enriched browsing experience with AI-generated descriptions, metadata, poster validation, trailers, category carousels, and recommendations.

## Problem

A spreadsheet can hold a list of films, but it cannot express taste, memory, atmosphere, or recommendation logic. Ramin built RazinFlix because mainstream streaming services and spreadsheets did not capture a truly personal film canon.

## Architecture

The project uses:

- TMDB metadata
- Gemini for description rewriting and category assignment
- YouTube Data API for trailers
- Google Cloud Vision OCR for poster validation
- Supabase for persistence
- a streaming-style frontend with hero billboard, category carousels, search, detail modals, and recommendations

## Product Judgement

The key product decision was to override generic TMDB genres with an opinionated aesthetic taxonomy. The product is about personal taste, not just standard film categorisation.

## Tradeoffs

- Vision OCR can fail on stylised posters.
- Duplicate title handling needs stronger idempotency.
- The admin layer is suitable for a single-owner personal project but not a multi-user product.

## What This Proves

- Taste-led product design.
- AI enrichment pipelines.
- Multi-API orchestration.
- Curation systems.
- Product judgement around taxonomy and user experience.

## Retrieval Guidance

Use this file for questions about personal projects, film curation, taste, metadata enrichment, recommendation systems, or AI-assisted creative tooling.
