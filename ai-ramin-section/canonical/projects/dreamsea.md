---
title: "Dreamsea"
source_type: project_case_study
trust_level: canonical_candidate
visibility: public_portfolio_safe
retrieval_priority: high
answer_permission: factual_answer
source_paths:
  - "projects-section/Dreamsea - Portfolio Write-up.md"
  - "src/data/portfolio.ts"
public_links:
  - "https://apps.apple.com/us/app/dreamsea/id6761101193"
---

# Dreamsea

## Summary

Dreamsea is a live iOS app for voice-first dream journaling, dream interpretation, and multimodal AI generation.

It uses Gemini for audio transcription, text generation, and Imagen-style dream imagery, with Supabase as the backend.

## Problem

Dreams are fragile immediately after waking. Notes apps require too much cognition, and typing can destroy the half-awake state where the dream is still accessible. Even when a dream is captured, most tools do not help interpret it through a coherent philosophical or psychological framework.

## Architecture

Dreamsea includes:

- SwiftUI iOS app
- AVFoundation voice recording
- WidgetKit lock-screen entry point
- Gemini audio-to-text transcription
- parallel generation of dream title, subtitle, interpretations, symbols, and image
- curated Dream Wiki context
- Jungian, Persian, Egyptian, and Japanese interpretive traditions
- Supabase Postgres, Storage, and Edge Functions
- StoreKit 2 subscription
- prompt/wiki CMS for a non-technical domain expert co-founder

## Product Judgement

Ramin rejected a simple static symbol-RAG approach because the product problem is not retrieval. It is philosophical translation. Interpretation quality depends on reasoning within a coherent tradition, not just retrieving matching symbols.

## Tradeoffs

- Sequential transcription before analysis improves accuracy but adds waiting time.
- Audio is deleted from cloud storage after transcription, improving privacy but limiting future audio-based analysis.
- Social sharing is deferred to preserve private trust.
- Prompt quality currently lacks a formal automated eval suite.

## What This Proves

- Multimodal AI product design.
- Privacy-aware AI architecture.
- Domain-specific context injection.
- Human-in-the-loop domain editing.
- Consumer AI app product judgement.

## Retrieval Guidance

Use this file for questions about multimodal AI, consumer AI apps, privacy, Gemini, dream interpretation, context design, and domain-expert workflows.
