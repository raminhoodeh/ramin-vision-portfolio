---
title: "Root Cause And Metric Diagnosis Playbook"
source_type: generic_framework
trust_level: generic
visibility: internal_framework_only
retrieval_priority: high
answer_permission: use_as_framework_only
source_paths:
  - "ai-ramin-context/Product Manager Interview Guide.md"
  - "ai-ramin-context/How to answer product manager interview questions.md"
verification_status: distilled_generic_framework
---

# Root Cause And Metric Diagnosis Playbook

Use this file to shape "metric X dropped, why", "diagnose this", or debugging-style answers. Do not use it as evidence about Ramin.

## Answer Shape

1. Clarify the metric definition, the size of the change, and the time window.
2. Ask whether the change is real or an artefact: tracking bug, logging change, seasonality, or a definition change.
3. Frame it as external vs internal: market, competitor, or seasonality vs a change we shipped.
4. Decompose the metric into its parts (for example conversion = traffic x step-rates), and find which part moved.
5. Segment the move: platform, geography, new vs returning, channel, cohort, device.
6. Form the most likely hypothesis from where the drop concentrates.
7. State how you would confirm it quickly and what you would do about it.

## Useful Internal Prompts

- Is the metric down everywhere, or in one segment?
- Did anything ship, change, or break around the inflection point?
- Is it a numerator problem or a denominator problem?
- Sudden cliff (usually a release or outage) or gradual decline (usually mix, competition, or saturation)?

## What Strong Diagnosis Sounds Like

Strong answers rule out instrumentation first, narrow with a decomposition and a segmentation before guessing a cause, and separate the diagnosis from the fix. Weak answers jump to a single cause or a solution before isolating where the change lives.

## Ramin Evidence Pointers

Pair this with Ramin-specific sources when relevant:

- `canonical/work-experiences/perkbox-vivup.md`
- `canonical/work-experiences/bayut-ai-product-manager.md`
- `canonical/product-philosophy.md`

Do not mention these file paths to the visitor.
