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
  - "src/data/projects.ts"
  - "src/sections/Projects/types.ts"
public_links:
  - "https://github.com/raminhoodeh/mass-social-wisdom-agent"
---

# Mass Social Wisdom Agent

## Summary

Mass Social Wisdom Agent is a multimodal extraction pipeline that turns messy links, videos, screenshots, and carousel posts into structured knowledge documents.

## Problem

Ramin was collecting knowledge across Instagram Reels, YouTube videos, screenshots, and social posts. Bookmark managers preserved links, but did not extract meaning or organise content into a useful structure.

## Architecture

The system runs a seven-stage single-model pipeline, rather than independent agents with separate authority:

1. Inspect.
2. Route.
3. Compose.
4. Self-Assess.
5. Categorise.
6. Sort.
7. Export.

It uses:

- Google Gemini 2.5 Flash for OCR, composition, self-scoring, categorisation, and similarity sorting
- SociaVault API for Instagram and YouTube transcripts and metadata
- Flask 3.0
- Python threading
- Python-docx
- Pillow
- live log streaming in the UI
- structured DOCX output for Notion import

The model's self-score guides retry selection. It is uncalibrated against human judgments and is not independent evidence of summary accuracy. URL normalisation, request delays, bounded retries, and failed-source records help processing; formal quality evaluation remains planned.

## Live and Mock Evidence

The portfolio demo sends live API requests subject to availability and visitor quotas. The repository's `mock_demo_server.py` separately replays prepared logs and results without API keys. Mock output and the README animation illustrate interaction and export; they do not establish fresh retrieval or measured quality.

The extraction tool and public RAG package are separate components. An exported document can be reviewed and imported into Notion or another ingestion workflow; this does not establish a deployed integration into every private product.

## Product Judgement

Ramin rejected a RAG-first approach because the use case is curation, not retrieval. The user wants a structured knowledge document after each extraction session, not another corpus to search later.

## Tradeoffs

- In-memory job tracking is simple but not durable across server restarts.
- Rate limiting uses hardcoded sleeps instead of a queue.
- The self-assessment loop lacks formal eval coverage.
- Categorisation is bounded by fixed categories and lacks multi-label classification.
- A request queue with bounded concurrency is planned; no percentage speed improvement has been measured here.

## What This Proves

- Staged workflow design.
- Multimodal content extraction.
- Practical use of Gemini for multiple reasoning tasks.
- Honest assessment of evaluation and governance gaps.
- Product judgement around output format and user workflow.

## Retrieval Guidance

Use this file for questions about agents, automation, knowledge extraction, multimodal AI, social media workflows, Notion import, eval gaps, or workflow orchestration.
