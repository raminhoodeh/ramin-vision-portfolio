# AI Ramin Evaluation And Hardening

Phase 8 adds an offline quality loop for AI Ramin. It does not call Gemini. It checks whether curated evaluation prompts retrieve the right source classes, source files, keywords, and answer-contract expectations before a live model ever writes copy.

## Runbook

1. Run `npm run check:ai-ramin-eval`.
2. Run `npm run check:ai-ramin-routing` after changing question types, answer frames, answer techniques, or soft CTAs.
3. Run `npm run check:ai-ramin-regression` after changing semantic routing, conversation continuity, answer recovery, or chat presentation policy.
4. Run `npm run check:ai-ramin-feedback` after changing feedback UI, feedback endpoint routing, or feedback log shape.
5. Run `npm run check:ai-ramin-review` after changing feedback review scripts, review-report shape, or eval-case candidate output.
6. Run `npm run review:ai-ramin-feedback` to triage local visitor feedback and write `latest-feedback-review.json`.
7. If retrieval evaluation fails, run `npm run evaluate:ai-ramin` to write a local report and append failures to the local failure log.
8. Open `ai-ramin-section/evaluation/latest-evaluation-report.json`.
9. For each failure, decide whether the issue is:
   - weak source coverage
   - missing or stale frontmatter
   - poor keywords or retrieval priority
   - unsafe answer permission
   - missing public link
   - an eval case that should be revised
10. Make the smallest corpus/source change that fixes the failure.
11. Run `npm run check:ai-ramin-corpus`, `npm run check:ai-ramin-eval`, `npm run check:ai-ramin-routing`, `npm run check:ai-ramin-regression`, `npm run check:ai-ramin-feedback`, and `npm run check:ai-ramin-review` again.

## Files

- `eval-cases.json`: curated prompt tests and expected retrieval behavior.
- `failure-log.schema.json`: JSONL shape for local failure records.
- `latest-evaluation-report.json`: generated local report, ignored by git.
- `failure-log.jsonl`: generated local failure log, ignored by git.
- `live-feedback.schema.json`: schema for visitor-facing answer feedback records.
- `live-feedback.jsonl`: generated local answer feedback log, ignored by git.
- `latest-feedback-review.schema.json`: schema for local feedback review reports.
- `latest-feedback-review.json`: generated feedback review report, ignored by git.
- `scripts/check-ai-ramin-interview-routing.mjs`: deterministic drift check for question types, answer techniques, answer frames, soft CTAs, and eval-case coverage.
- `regression-suite-fixtures.json`: deterministic regression fixtures for casual chat separation, professional routing, conversation follow-ups, and quality recovery.
- `scripts/check-ai-ramin-regression-suite.mjs`: deterministic regression gate that exercises the combined AI Ramin routing and recovery contract.
- `scripts/check-ai-ramin-feedback-contract.mjs`: deterministic contract check for feedback UI, API routing, log schema, and local-log ignore rules.
- `scripts/review-ai-ramin-feedback.mjs`: local triage workflow for filtering feedback, labeling likely issues, finding recurring patterns, and drafting eval-case candidates.
- `scripts/check-ai-ramin-feedback-review-contract.mjs`: deterministic contract check for the local feedback review workflow.

## Quality Gate

The current gate requires:

- 100 percent pass rate.
- Average score of at least 85.
- Zero failed cases.

This is intentionally strict because the runner is deterministic and checks retrieval health, not subjective model copy quality.

The routing check additionally requires:

- every server question type has an answer frame,
- evaluator answer-technique and answer-frame mappings match server routing,
- evaluator soft CTAs match server answer-frame CTAs,
- each eval case's expected technique and frame match server routing,
- every question type has at least one eval case.

The regression-suite check additionally requires:

- casual greetings and status checks remain `conversation_open`, do not retrieve proof, and do not fall through to portfolio overview,
- professional role-fit and strongest-product prompts route to evidence-backed answer shapes,
- contextual follow-ups carry previous intent and evidence anchors into retrieval and prompting,
- over-cautious casual and first-90-days answers recover into useful chat copy instead of generic biography or insufficient-context copy.

The feedback contract check additionally requires:

- the Vite and production servers expose `/api/ai-ramin/feedback`,
- the chat UI renders the answer-feedback affordance,
- the server writes feedback to the local JSONL review log,
- the feedback schema supports `helpful` and `needs_review`,
- the generated feedback log remains ignored by git.

The feedback review contract check additionally requires:

- `review:ai-ramin-feedback` exists as an npm script,
- the review script reads `live-feedback.jsonl`,
- the review script writes `latest-feedback-review.json`,
- the report schema includes review queue, recurring issues, and eval-case candidates,
- the generated review report remains ignored by git.

## Feedback Review Workflow

Run:

```bash
npm run review:ai-ramin-feedback
```

Useful filters:

```bash
node scripts/review-ai-ramin-feedback.mjs --feedback=needs_review
node scripts/review-ai-ramin-feedback.mjs --priority=high
node scripts/review-ai-ramin-feedback.mjs --request-type=role_fit
node scripts/review-ai-ramin-feedback.mjs --answer-frame=proof_first_ledger
node scripts/review-ai-ramin-feedback.mjs --json --no-write-report
```

The report contains:

- `summary`: counts by feedback, priority, request type, answer frame, and issue label.
- `review_queue`: needs-review records sorted by priority with labels and recommended actions.
- `recurring_issues`: grouped patterns that meet the recurring threshold.
- `eval_case_candidates`: draft cases that can be manually promoted into `eval-cases.json`.
- `next_actions`: the recommended review loop after triage.

## When To Add Cases

Add a case when:

- a hiring manager asks a new high-value question,
- a weak answer appears in manual testing,
- a source file is added or substantially changed,
- a guardrail edge case is discovered,
- a new dedicated request type is added to the UI.

## Failure Triage

Use this default triage order:

1. If the correct source file was not retrieved, improve source frontmatter, retrieval priority, headings, or keywords in the source text.
2. If policy was not retrieved for a sensitive prompt, strengthen policy wording or prompt classification.
3. If a public link is missing, add `public_links` frontmatter to the approved canonical source.
4. If the eval case is over-specific, adjust expected paths or keywords without weakening the safety bar.
5. If a model answer is bad despite retrieval passing, log it manually and add a future live-answer review case.
6. If a visitor marks an answer as `needs_review`, run `npm run review:ai-ramin-feedback` and inspect `ai-ramin-section/evaluation/latest-feedback-review.json`.
7. If the review report creates an eval-case candidate, manually promote it into `eval-cases.json` only after checking that the prompt and expected contract are still safe and useful.

The goal is not to game the test. The goal is to keep AI Ramin grounded, safe, and useful as the corpus evolves.
