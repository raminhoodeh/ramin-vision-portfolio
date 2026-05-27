---
title: "Strongest Product Role Question Baseline"
source_type: evaluation_note
trust_level: internal
visibility: internal_rag_build
retrieval_priority: none
answer_permission: do_not_answer_from_index
verification_status: baseline_recorded
---

# Strongest Product Role Question Baseline

Recorded on 2026-05-25 before implementing the strongest-product routing and recovery stages.

## Failure Class

AI Ramin is over-cautious on broad hiring questions that ask for Ramin's strongest, best, or most impressive product evidence.

This is not specific to Google. The same behavior can appear for any company or role context when the prompt asks a subjective ranking question without using explicit words like "proof" or "evidence".

## Reproduction Prompts

| Prompt | Current route | Current result |
| --- | --- | --- |
| "whats the most impressive product ramin has made? i have a product manager job for him at google" | `portfolio_overview` | Incorrect refusal: "I do not have enough verified portfolio context..." |
| "whats the strongest product ramin has built? i have a product manager job for him" | `portfolio_overview` | Incorrect refusal: "I do not have enough verified portfolio context..." |
| "what is the best product example for ramin if i am hiring him as a product manager?" | `strongest_product_proof` | Correctly compares relevant product examples without exposing a stronger-proof CTA. |

## Baseline Metadata From Failed Variants

The failed variants still retrieve usable context:

- `requestType`: `general_chat`
- `primaryQuestionType`: `portfolio_overview`
- `answerTechniqueId`: `rule_of_three_orientation`
- `answerFrameId`: `orient_prove_translate`
- `answerableEvidenceCount`: `8`
- `evidenceCardCount`: `6`
- `verifiedProofCount`: `0`
- `contextTruncated`: `false`

Retrieved sources include:

- `ai-ramin-section/canonical/product-philosophy.md`
- `ai-ramin-section/canonical/profile.md`
- `ai-ramin-section/canonical/work-experiences/perkbox-vivup.md`
- `ai-ramin-section/canonical/work-experiences/groupm-carbon-calculator.md`
- `ai-ramin-section/canonical/work-experiences/urgentem-element6.md`
- `ai-ramin-section/canonical/projects/ai-native-product-os.md`
- `ai-ramin-section/canonical/projects/mass-social-wisdom-agent.md`
- `ai-ramin-section/canonical/projects/24seven-concierge.md`

## Current Root Cause

The router only treats this family as evidence lookup when the prompt uses explicit terms like "proof" or "evidence". It does not currently understand that "most impressive product", "strongest product", "best product", "product he made", or "product he built" are evidence-ranking questions.

The model then receives a generic portfolio-overview answer frame and over-applies the guardrail fallback, despite enough answerable evidence being retrieved.

## Target Behavior

For any company or product manager role context, AI Ramin should answer with a best-supported ranking rather than a blanket refusal.

Expected answer shape:

1. Direct answer: name the best-supported strongest product evidence.
2. Professional proof: GroupM Media Carbon Calculator and/or Urgentem Element6, depending on role context.
3. Self-directed AI proof: AI-Native Product OS, 24Seven Concierge, Mass Social Wisdom Agent, nsso, or Qadam when relevant.
4. Role translation: explain why that proof matters for the hiring context.
5. Boundary: say that exact role fit depends on the job description and company context.

The answer should use language like "best-supported answer" or "based on the portfolio evidence" rather than claiming objective certainty.

## Regression Acceptance For Later Stages

Future implementation stages should fail if:

- these prompts route as plain `portfolio_overview`;
- the answer is only "I do not have enough verified portfolio context";
- `answerableEvidenceCount >= minimumAnswerableEvidence` but the response has no proof, no nearest evidence, and no role translation;
- the UI displays `0 verified` in a way that implies no evidence exists when evidence cards are present.
