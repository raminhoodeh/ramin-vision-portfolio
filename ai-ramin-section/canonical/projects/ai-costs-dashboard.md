---
title: "AI Costs Dashboard"
source_type: project_case_study
trust_level: canonical_candidate
visibility: public_portfolio_safe
retrieval_priority: high
answer_permission: factual_answer
source_paths:
  - "src/data/projects.ts"
public_links:
  - "https://github.com/raminhoodeh/ai-costs-dashboard"
---

# AI Costs Dashboard

AI Costs Dashboard is a standalone Python metering and routing library with a SQLite usage store, editable pricing, cached evaluation scores, budgets, a CLI, and an optional Streamlit reporting view.

## Implemented behaviour and proof boundary

The router prefers the cheapest candidate whose cached score clears the configured quality threshold. If no candidate clears it, the router returns the best-scoring candidate. If scores are absent, it returns the most expensive candidate as a capability proxy. These fallbacks do not establish quality and can proceed below the threshold. This is an eval-informed routing policy, not a fail-closed quality gate.

The demo seeds product names, events, and evaluation scores. Names such as nsso, Dreamsea, and 24Seven are illustrative examples, not live telemetry, verified integrations, measured savings, or production-quality results from those apps.

The case-study records a local 13-test unit run covering pricing, routing, budgets, score updates, and reports. That verifies those tested library behaviours; it is not evidence of deployed product outcomes.

## Planned improvements

A shared database adapter, provider imports, per-user attribution, hosted cockpit, richer evaluation provenance, and a hard hold or human review when quality cannot be established remain future work.

## Retrieval guidance

Use for cost observability, AI model routing, budget controls, and cost-quality tradeoffs. Keep standalone implementation, seeded demonstration, proposed integration, and production outcomes separate.
