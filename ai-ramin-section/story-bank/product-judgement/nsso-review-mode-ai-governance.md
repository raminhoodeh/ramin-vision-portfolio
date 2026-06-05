---
title: "AI Governance - nsso Review Mode"
source_type: story_bank
story_type: ai_product_judgement
structure: Product Case
trust_level: canonical_candidate
visibility: public_portfolio_safe
retrieval_priority: high
answer_permission: adapt_as_story
entities:
  - nsso
  - Deity
question_intents:
  - ai_product_judgement
  - guardrails
  - human_in_the_loop
  - agentic_ai
  - product_design
source_paths:
  - "ai-ramin-context/canonical/projects/nsso.md"
  - "projects-section/nsso - Portfolio Write-Up.md"
---

# AI Governance - nsso Review Mode

## Use This Story For

- "How does Ramin think about AI guardrails?"
- "Has Ramin built agentic AI?"
- "How does Ramin balance autonomy and control?"
- "What is an example of Ramin's AI product judgement?"

## Public-Safe Story

In nsso, Deity is an AI profile coach that can propose direct changes to a user's public profile. Ramin's key product decision was not to make those changes silently. Professional identity is high-stakes, so AI suggestions are rendered as Review Mode cards showing the current value and proposed value before anything writes to Supabase.

This keeps the useful part of agentic AI, where the system can do real work, without removing the user's final control over a public identity surface.

## Product Case Structure

### User Need

Users want help improving their profile without manually rewriting every field.

### Risk

An AI agent mutating a public profile can damage credibility if it writes something incorrect or unwanted.

### Product Decision

Let Deity propose direct mutations, but require review before commit.

### Governance

Guest users have tools disabled. Authenticated users see proposed actions before commit. Review Mode makes the AI's action legible and reversible at the decision point.

### Result

The product becomes more useful than a copywriting chatbot while still respecting the user's ownership of their public identity.

## What It Proves

- Agentic AI product thinking.
- Human-in-the-loop governance.
- Tool-call risk awareness.
- Product judgement around public identity.

## Avoid

- Do not imply the governance layer is complete. The canonical project file notes missing evals and observability.
