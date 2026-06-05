---
title: "Execution"
source_type: generic_framework
trust_level: generic
visibility: internal_framework_only
retrieval_priority: medium
answer_permission: use_as_framework_only
source_paths:
  - "ai-ramin-context/Product Manager Interview Guide.md"
  - "ai-ramin-context/Interview Questions and Answers 2aa6fe2ecf37809490a2fcbd613f7a3b.md"
verification_status: distilled_generic_framework
---

# Execution

Use this file to shape execution, metrics, debugging, and delivery answers. Do not use it as evidence about Ramin.

## Execution Answer Shape

1. Define the goal and current symptom.
2. Choose the north star metric.
3. Break it into input metrics.
4. Segment users, traffic, product surfaces, or workflows.
5. Diagnose the likely cause.
6. Prioritise fixes or experiments.
7. Define success, guardrails, and rollback criteria.
8. Monitor and learn.

## Debugging A Product Problem

When asked about a drop, broken metric, or failed launch:

1. Confirm the metric definition and instrumentation.
2. Check whether the issue is global or segmented.
3. Locate the funnel or workflow step.
4. Separate product, data, engineering, market, and user-behaviour causes.
5. Form hypotheses.
6. Validate with logs, analytics, research, or experiment data.
7. Ship the smallest appropriate fix.
8. Monitor for recovery and side effects.

## AI Execution Diagnostics

For AI products, also diagnose:

- model output quality
- retrieval quality
- prompt and orchestration reliability
- tool-call success
- latency
- cost per successful task
- hallucination or unsupported-answer rate
- over-refusal rate
- safety classifier performance
- user feedback and correction patterns

## Delivery Practice

Use the Product Innovation Process as a Ramin-specific evidence source only after retrieving the canonical product-philosophy file.

Useful delivery concepts:

- single source of truth
- problem, solution, why, schedule, resources, KPIs
- stage gates: discovery, concept, alpha, beta, live
- requirements and handover
- post-launch learning

## Answer Boundary

Do not claim Ramin shipped or measured something unless canonical context or story-bank context confirms it.
