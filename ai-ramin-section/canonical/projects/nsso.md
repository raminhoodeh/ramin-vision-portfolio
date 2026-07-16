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

nsso is Ramin's flagship personal identity product: Shopify, but the product is you. It is one owned identity surface where profile, proof, projects, products, links, and Deity AI turn self-presentation into self-clarification.

## Problem

nsso began from the question people are asked whenever they meet someone new: "so, what do you do?" Most people answer with a title, employer, or category, compressing years of work and identity into one sentence.

That compression is increasingly costly because careers now include side projects, hobbies can become work, and employers care more about what people have built outside a job title. The full picture of a person is valuable, but hard to show.

Identity is usually fragmented across LinkedIn, Instagram, portfolios, link-in-bio pages, payment links, and contact channels. Each surface shows one angle, but none of them show how the parts connect.

The product opportunity is a unified profile where building the page becomes self-clarification: the user can see how their skills, story, proof, projects, products, and offers fit together.

## Architecture

The product includes:

- public profile pages at `nsso.me/[username]`
- structured CV fields for experiences, qualifications, and projects
- links, contact methods, and profile media
- products and services
- hosted sales pages
- PayPal and Polar payment support
- referral earnings programme
- profile completeness scoring
- Deity AI profile coach
- profile-aware RAG over a curated knowledge base
- Gemini 2.0 Flash chat/tool calls
- Gemini Embedding 001 for 768-dimensional query/profile embeddings
- Supabase Postgres, pgvector, Supabase Storage, and tool calling

## Deity Agent

Deity is the model/orchestration layer. It reads the user's live profile context: name, headline, bio, work experiences, qualifications, projects, products, links, and contact methods.

For knowledge requests, nsso creates both a query embedding and a profile embedding, then runs retrieval through a Supabase RPC over a curated pgvector knowledge corpus. Retrieved chunks are re-ranked by a weighted combination of query similarity and profile similarity, so two users asking the same question can receive differently ordered guidance.

For profile-building requests, Deity uses streaming function calling. It can emit structured tool calls such as `update_bio`, `add_experience`, and `add_project`. The server converts those tool calls into Review Mode confirmation cards showing the field, current value, and proposed value before any Supabase write occurs.

Dual-mode intent arbitration keeps knowledge retrieval and profile mutation on separate paths: knowledge requests withhold write tools and run RAG; profile-editing requests receive tool schemas and can produce reviewable actions.

## Governance

nsso deals with public identity, money, and AI-generated self-presentation, so governance is part of the product architecture.

- Guest sessions never receive mutation tool declarations.
- Review Mode keeps the user in control before profile changes commit.
- Deity should not invent credentials, companies, job titles, projects, or achievements absent from the live profile.
- PayPal HTML embeds are parsed, sanitised, checked for unsafe scripts, and validated against a PayPal allowlist.
- The UI shows embed security states such as scanning, secure, or unsafe before saving.

## Tradeoffs

- nsso has no social feed, followers, or engagement mechanics. That reduces growth loops but protects identity accuracy from performance incentives.
- Review Mode adds friction, but the friction is deliberate because public identity changes are high-trust.
- Gemini Flash keeps chat responsive and affordable, but a larger-context model would support deeper cross-corpus synthesis.
- The profile structure is fixed rather than fully user-defined, because Links, Experiences, Qualifications, Projects, and Products & Services reflect a product point of view on professional identity.
- Intent arbitration is still fragile and needs a classifier.
- The sales-page CRO schema is a reasonable prior, not yet validated by A/B testing.

## What This Proves

- AI profile coaching.
- Profile-aware RAG and retrieval re-ranking.
- Tool calling with Review Mode.
- User-owned professional identity.
- AI governance inside a real product surface.
- Product discovery around fragmented identity, creative self-presentation, public-facing proof, and monetisation.
- Product judgment around when AI should propose an action but leave final representation to the human.

## Retrieval Guidance

Use this file for questions about AI agents, profile context, RAG, tool calls, professional identity, review mode, AI governance, creator/creative user needs, creatives, creative self-presentation, storefront profiles, or examples of Ramin building AI products from user-context and product-discovery starting points.
