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
  - "src/data/projects.ts"
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
- an Add Film interface for names and years, plus an admin metadata editor for correcting uncertain matches

AI-assisted enrichment runs when records are added or maintained. Browsing the completed catalogue does not require an LLM response for every film. The portfolio write-up's 337 films, 319 trailer keys, and 13 shelves are a catalogue snapshot rather than a guaranteed current count.

## Product Judgement

The key product decision was to override generic TMDB genres with an opinionated aesthetic taxonomy. The product is about personal taste, not just standard film categorisation.

## Tradeoffs

- Vision OCR can fail on stylised posters.
- Duplicate title handling needs stronger idempotency.
- The admin layer is suitable for a single-owner personal project but not a multi-user product.

Add Film and the metadata editor already exist. Shared contributor roles, recommendation notes, correction history, and better measurement of enrichment failures and manual correction time remain next steps. Current secret handling has not been independently audited by this portfolio update; do not infer either a live exposure or a completed security repair from older write-up language.

## What This Proves

- Taste-led product design.
- AI enrichment pipelines.
- Multi-API orchestration.
- Curation systems.
- Product judgement around taxonomy and user experience.

## Retrieval Guidance

Use this file for questions about personal projects, film curation, taste, metadata enrichment, recommendation systems, or AI-assisted creative tooling.
