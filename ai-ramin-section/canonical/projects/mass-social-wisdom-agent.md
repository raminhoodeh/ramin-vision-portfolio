---
title: "Mass Social Wisdom Agent"
source_type: project_case_study
trust_level: canonical_candidate
visibility: public_portfolio_safe
retrieval_priority: high
answer_permission: factual_answer
source_paths:
  - "projects-section/Mass Social Wisdom Agent - Portfolio Write-up.md"
  - "src/data/portfolio.ts"
public_links:
  - "https://github.com/raminhoodeh/mass-social-wisdom-agent"
---

# Mass Social Wisdom Agent

## Summary

Mass Social Wisdom Agent is a multimodal extraction pipeline that turns messy links, videos, screenshots, and carousel posts into structured knowledge documents.

## Problem

Ramin was collecting knowledge across Instagram Reels, YouTube videos, screenshots, and social posts. Bookmark managers preserved links, but did not extract meaning or organise content into a useful structure.

## Architecture

The system runs a seven-stage autonomous pipeline:

1. Inspect.
2. Route.
3. Compose.
4. Self-Assess.
5. Categorise.
6. Sort.
7. Export.

It uses:

- Google Gemini 2.5 Flash for OCR, composition, quality scoring, categorisation, and similarity sorting
- SociaVault API for Instagram and YouTube transcripts and metadata
- Flask 3.0
- Python threading
- Python-docx
- Pillow
- live log streaming in the UI
- structured DOCX output for Notion import

## Product Judgement

Ramin rejected a RAG-first approach because the use case is curation, not retrieval. The user wants a structured knowledge document after each extraction session, not another corpus to search later.

## Tradeoffs

- In-memory job tracking is simple but not durable across server restarts.
- Rate limiting uses hardcoded sleeps instead of a queue.
- The self-assessment loop lacks formal eval coverage.
- Categorisation is bounded by fixed categories and lacks multi-label classification.

## What This Proves

- Autonomous workflow design.
- Multimodal content extraction.
- Practical use of Gemini for multiple reasoning tasks.
- Honest assessment of evaluation and governance gaps.
- Product judgement around output format and user workflow.

## Retrieval Guidance

Use this file for questions about agents, automation, knowledge extraction, multimodal AI, social media workflows, Notion import, eval gaps, or workflow orchestration.
