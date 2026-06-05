---
title: "Assumption Testing"
source_type: generic_framework
trust_level: generic
visibility: internal_framework_only
retrieval_priority: medium
answer_permission: use_as_framework_only
source_paths:
  - "ai-ramin-context/Product Manager Interview Guide.md"
  - "thoughts-section/courses/course-full-text-product-innovation-process.md"
verification_status: distilled_generic_framework
---

# Assumption Testing

Use this file to shape discovery, validation, MVP, and experiment answers. Do not use it as evidence about Ramin.

## Riskiest Assumption Flow

1. State the goal.
2. List assumptions.
3. Identify the riskiest assumption.
4. Decide what evidence would prove or disprove it.
5. Choose the cheapest credible test.
6. Set a decision threshold before running the test.
7. Decide whether to proceed, pivot, narrow, or stop.

## Assumption Types

- Value: users care enough to act.
- Usability: users can understand and use the product.
- Viability: the business model can work.
- Feasibility: the team can build and operate it.
- GTM: the product can reach buyers or users.
- Governance: legal, safety, privacy, or compliance requirements can be met.
- Reliability: the system behaves predictably enough for the use case.

## AI Assumption Types

For AI products, include:

- model capability
- source-context quality
- retrieval precision and recall
- prompt and orchestration reliability
- latency and cost
- safety and refusal behaviour
- user trust and correction behaviour
- human review needs

## Testing Examples

Use examples as generic test types, not personal claims:

- concierge prototype before full automation
- retrieval benchmark before chatbot launch
- smoke test before building a workflow
- manual wizard-of-oz test before investing in model orchestration
- small pilot before broad rollout
- offline eval set before live traffic

## Answer Boundary

If asked how Ramin validates products, retrieve `canonical/product-philosophy.md` and relevant project files first. This file should only help structure the answer.
