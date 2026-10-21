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
  - "src/data/projects.ts"
public_links:
  - "https://apps.apple.com/us/app/dreamsea/id6761101193"
---

# Dreamsea

## Summary

Dreamsea is a live iOS app for voice-first dream journaling, dream interpretation, and multimodal AI generation.

It uses Gemini for audio transcription and text generation, with a separate image-generation step. The implementation combines on-device persistence with cloud services, including Supabase backend components.

## Problem

Dreams are fragile immediately after waking. Notes apps require too much cognition, and typing can destroy the half-awake state where the dream is still accessible. Even when a dream is captured, most tools do not help interpret it through a coherent philosophical or psychological framework.

## Architecture

Dreamsea includes:

- SwiftUI iOS app
- AVFoundation voice recording
- WidgetKit lock-screen entry point
- Gemini audio-to-text transcription
- staged generation of dream title, subtitle, interpretations, symbols, and image, with saved progress and resumption of unfinished work
- curated Dream Wiki context
- Jungian, Persian, Egyptian, and Japanese interpretive traditions
- Supabase Postgres, Storage, and Edge Functions
- Core Data persistence for dream records and local AVFoundation capture
- StoreKit 2 subscription
- prompt/wiki CMS for a non-technical domain expert co-founder

## Product Judgement

Ramin rejected a simple static symbol-RAG approach because the product problem is not retrieval. It is philosophical translation. Interpretation quality depends on reasoning within a coherent tradition, not just retrieving matching symbols.

## Tradeoffs

- Transcription precedes interpretation, adding waiting time before the later generation steps.
- Local-first persistence does not mean offline processing: audio and text are sent to AI services for generation. Local deletion control is documented; a cloud-audio deletion guarantee is not established by this portfolio evidence.
- Social sharing is deferred to preserve private trust.
- Prompt quality currently lacks a formal automated eval suite.

The proposed roughly 50-example output evaluation, CMS preview panel, transcription-provider comparison, and encrypted sync remain planned. The public App Store release establishes availability, not clinical efficacy or measured interpretation quality.

## What This Proves

- Multimodal AI product design.
- Privacy-aware AI architecture.
- Domain-specific context injection.
- Human-in-the-loop domain editing.
- Consumer AI app product judgement.

## Retrieval Guidance

Use this file for questions about multimodal AI, consumer AI apps, privacy, Gemini, dream interpretation, context design, and domain-expert workflows.
