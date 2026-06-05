---
title: "24Seven Concierge"
source_type: project_case_study
trust_level: canonical_candidate
visibility: public_portfolio_safe
retrieval_priority: high
answer_permission: factual_answer
source_paths:
  - "projects-section/24Seven - Portfolio Write-up.md"
  - "src/data/portfolio.ts"
public_links:
  - "https://apps.apple.com/us/app/24seven-concierge/id6663954162"
---

# 24Seven Concierge

## Summary

24Seven Concierge is a live iOS travel/luxury concierge app that uses Gemini to plan against a Shopify product catalog and hand off booking requests to a human concierge over WhatsApp.

## Problem

Luxury travel inventory may exist in Shopify, but discovery and booking workflows can be fragmented. Users need to coordinate yachts, villas, cars, events, and destinations without manually browsing separate collections and then repeating everything to a human concierge.

## Architecture

The project uses:

- Expo React Native
- Expo Router
- Shopify Storefront API
- Gemini 2.5 Flash for conversational planning
- Gemini 2.0 Flash for booking messages
- TanStack React Query
- Zustand filesystem persistence
- Lodgify embedded calendar
- WhatsApp handoff

The system injects a compressed Shopify catalog into the model context and asks Gemini to return structured itinerary-style output with recommended product handles.

## Product Judgement

Ramin chose full catalog injection instead of vector RAG because the catalog was small enough and multi-criteria travel planning needs cross-collection reasoning. Retrieval optimised for a single similarity query could miss combinations that matter together.

## Tradeoffs

- Full catalog injection is simple and reliable now, but grows expensive and slow as inventory scales.
- No server-side session management means less observability and no backend conversation data flywheel.
- No formal eval suite for hallucinated products, date conflicts, or malformed JSON.
- Dubai expansion used a client-side mock layer to unblock visible market expansion before full Shopify onboarding.

## What This Proves

- Catalog-grounded AI planning.
- Mobile AI product design.
- Human handoff product strategy.
- Practical tradeoffs around RAG versus full-context injection.
- AI concierge governance gaps identified clearly.

## Retrieval Guidance

Use this file for questions about AI concierge products, mobile AI, travel, Shopify, catalog-grounded planning, human handoff, and AI product tradeoffs.
