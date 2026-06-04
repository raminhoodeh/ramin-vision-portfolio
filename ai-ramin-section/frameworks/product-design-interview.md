---
title: "Product Design Interview Playbook"
source_type: generic_framework
trust_level: generic
visibility: internal_framework_only
retrieval_priority: high
answer_permission: use_as_framework_only
source_paths:
  - "ai-ramin-context/How to answer product manager interview questions.md"
  - "ai-ramin-context/Product Manager Interview Guide.md"
verification_status: distilled_generic_framework
---

# Product Design Interview Playbook

Use this file to shape "design a product", "design a feature for X", or "improve product Y" answers. Do not use it as evidence about Ramin.

## Answer Shape

1. Clarify scope, platform, and constraints, then restate the goal in one line.
2. Name the mission or business objective the design should serve.
3. Pick one primary user segment and justify the choice over alternatives.
4. List that segment's top jobs, pains, and motivations; choose the highest-leverage pain.
5. Generate two to four distinct solution directions, not one.
6. Select a direction using impact, confidence, effort, risk, and learning value.
7. Describe the core flow or MVP slice concretely.
8. Define success metrics and one guardrail metric.
9. Name the main tradeoff and the next thing you would test.

## What Strong Design Answers Sound Like

Strong answers are specific and comparative: they explain why this user, this pain, and this solution beat the alternatives. They show breadth (several options) then depth (one chosen flow). Weak answers jump straight to a feature list with no user, goal, or prioritisation.

## Common Pitfalls

- Designing for "everyone" instead of one segment.
- Listing features before defining the user pain and the goal.
- No success metric, or a vanity metric with no guardrail.
- Forgetting edge cases, abuse, accessibility, and the unhappy path.

## AI Product Design Additions

For AI features, also decide: where uncertainty enters the experience; whether the AI should suggest, act, retrieve, explain, or escalate; how the user knows whether to trust the output; what happens at low confidence; and what feedback the product captures to improve.

## Ramin Evidence Pointers

Pair this structure with Ramin-specific sources when relevant:

- `canonical/product-philosophy.md`
- `canonical/projects/nsso.md`
- `canonical/projects/dreamsea.md`
- `canonical/projects/24seven-concierge.md`
- `canonical/work-experiences/perkbox-vivup.md`
- `story-bank/product-judgement/*`

Do not mention these file paths to the visitor.
