# AI Ramin Evaluation And Hardening

Phase 8 adds an offline quality loop for AI Ramin. It does not call Gemini. It checks whether curated evaluation prompts retrieve the right source classes, source files, keywords, and answer-contract expectations before a live model ever writes copy.

## Runbook

1. Run `npm run status:ai-ramin` when you need a quick local snapshot of corpus, eval, live-review, key, endpoint, and generated-file state.
2. Run `npm run verify:ai-ramin` after AI Ramin behavior, corpus, prompt, routing, UI formatting, feedback, promotion, or live-capture harness changes.
3. Run `npm run verify` before shipping portfolio changes.
4. Run `npm run check:ai-ramin-eval` when you only need retrieval and source-contract feedback.
5. Run `npm run check:ai-ramin-routing` after changing question types, answer frames, answer techniques, or soft CTAs.
6. Run `npm run check:ai-ramin-regression` after changing semantic routing, conversation continuity, answer recovery, or chat presentation policy.
7. Run `npm run check:ai-ramin-feedback` after changing feedback UI, feedback endpoint routing, or feedback log shape.
8. Run `npm run check:ai-ramin-review` after changing feedback review scripts, review-report shape, or eval-case candidate output.
9. Run `npm run check:ai-ramin-eval-promotion` after changing eval-case promotion scripts or promotion-plan shape.
10. Run `npm run check:ai-ramin-live-capture` after changing the live-answer review set or capture harness.
11. Run `npm run check:ai-ramin-live-review` after captured live answers are manually scored.
12. Run `npm run check:ai-ramin-live-review -- --strict` before treating a full live-answer review pass as complete.
13. Run `npm run review:ai-ramin-live` after scoring live answers to write `latest-live-review-report.json`.
14. Run `npm run review:ai-ramin-feedback` to triage local visitor feedback and write `latest-feedback-review.json`.
15. Run `npm run promote:ai-ramin-eval-candidates` to preview a dry-run promotion plan for generated eval-case candidates.
16. If a candidate should become a deterministic eval, approve it with `npm run promote:ai-ramin-eval-candidates -- --candidate=<id> --approve`.
17. If retrieval evaluation fails, run `npm run evaluate:ai-ramin` to write a local report and append failures to the local failure log.
18. Open `ai-ramin-section/evaluation/latest-evaluation-report.json`.
19. For each failure, decide whether the issue is:
   - weak source coverage
   - missing or stale frontmatter
   - poor keywords or retrieval priority
   - unsafe answer permission
   - missing public link
   - an eval case that should be revised
20. Make the smallest corpus/source change that fixes the failure.
21. Run `npm run verify:ai-ramin` again.

## Files

- `eval-cases.json`: curated prompt tests and expected retrieval behavior.
- `live-answer-review-set.json`: manual live-answer review prompts, expected behavior notes, and capture slots for Gemini-backed answer excerpts.
- `markdown-normalization-fixtures.json`: renderer-level fixtures for malformed chat markdown, including glued bold lead-ins and inline numbered lists.
- `failure-log.schema.json`: JSONL shape for local failure records.
- `latest-evaluation-report.json`: generated local report, ignored by git.
- `failure-log.jsonl`: generated local failure log, ignored by git.
- `live-feedback.schema.json`: schema for visitor-facing answer feedback records.
- `live-feedback.jsonl`: generated local answer feedback log, ignored by git.
- `latest-feedback-review.schema.json`: schema for local feedback review reports.
- `latest-feedback-review.json`: generated feedback review report, ignored by git.
- `latest-eval-case-promotion-plan.json`: generated local dry-run promotion plan, ignored by git.
- `latest-live-review-report.schema.json`: schema for local live-answer review reports.
- `latest-live-review-report.json`: generated live-answer review report, ignored by git.
- `scripts/check-ai-ramin-interview-routing.mjs`: deterministic drift check for question types, answer techniques, answer frames, soft CTAs, and eval-case coverage.
- `regression-suite-fixtures.json`: deterministic regression fixtures for casual chat separation, professional routing, conversation follow-ups, and quality recovery.
- `scripts/check-ai-ramin-regression-suite.mjs`: deterministic regression gate that exercises the combined AI Ramin routing and recovery contract.
- `scripts/check-ai-ramin-feedback-contract.mjs`: deterministic contract check for feedback UI, API routing, log schema, and local-log ignore rules.
- `scripts/review-ai-ramin-feedback.mjs`: local triage workflow for filtering feedback, labeling likely issues, finding recurring patterns, and drafting eval-case candidates.
- `scripts/check-ai-ramin-feedback-review-contract.mjs`: deterministic contract check for the local feedback review workflow.
- `scripts/promote-ai-ramin-eval-candidates.mjs`: dry-run-first workflow for promoting approved feedback review candidates into `eval-cases.json`.
- `scripts/check-ai-ramin-eval-promotion-contract.mjs`: deterministic contract check for candidate normalization, write guards, duplicate handling, and provenance retention.
- `scripts/report-ai-ramin-status.mjs`: read-only local status reporter for corpus, eval, live-review, key, endpoint, and generated-file state.
- `scripts/check-ai-ramin-live-review.mjs`: read-only live-answer review validator for captured scores, issue notes, and strict review completion.
- `scripts/check-ai-ramin-live-review-contract.mjs`: deterministic fixture check for the live-review validator's scoring and strict-mode behavior.
- `scripts/review-ai-ramin-live-answers.mjs`: local report workflow for summarizing scored live-answer review results and deterministic follow-ups.
- `scripts/check-ai-ramin-live-review-report-contract.mjs`: deterministic fixture check for the live-review report workflow.
- `scripts/check-ai-ramin-markdown-normalization.mjs`: extracts the UI markdown normalizer and checks that malformed model prose is split into renderable paragraphs/lists.
- `scripts/capture-ai-ramin-live-answers.mjs`: live Gemini-backed capture harness for `live-answer-review-set.json`; dry-run mode is deterministic and safe without an API key, and preflight mode checks key and endpoint readiness.

## Quality Gate

The current gate requires:

- 100 percent pass rate.
- Average score of at least 85.
- Zero failed cases.

This is intentionally strict because the runner is deterministic and checks retrieval health, not subjective model copy quality.

The focused AI Ramin verification command additionally requires all deterministic AI Ramin contract gates to pass:

- corpus check,
- retrieval eval,
- interview routing and routing observability,
- intent, classifier, semantic routing, semantic confidence, and conversation-context contracts,
- regression, clarification, prompt, UI copy, markdown normalization, weak-answer UI, feedback, feedback-review, and eval-promotion contracts,
- live-answer capture dry run,
- live-answer review validation and validator contract fixtures,
- live-answer review report contract fixtures.

The status command is not a gate. It is a local diagnostic report that can show mutable state such as missing API keys,
server reachability, feedback-log presence, and live-answer capture progress.

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
- affirmative replies to a previous suggested next action route to that action's answer frame,
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

The eval promotion contract check additionally requires:

- `promote:ai-ramin-eval-candidates` exists as an npm script,
- the promotion script reads `latest-feedback-review.json`,
- the promotion script writes `latest-eval-case-promotion-plan.json` in dry-run mode,
- approved writes require `--approve` plus `--candidate=<id>` or `--all`,
- stale candidate answer techniques, answer frames, and soft CTA labels are normalized to live routing-contract ids,
- duplicate candidate promotion is skipped,
- promoted cases retain feedback-review provenance,
- the generated promotion plan remains ignored by git.

The live-review checker additionally requires:

- captured answers have a manual score of `0`, `1`, `2`, or `3`,
- failed captures are re-run or reset before review is complete,
- weak or failing scores include actionable issue notes,
- strong scores do not keep unresolved issue tags,
- severe issues such as HTTP failures, empty answers, raw JSON, local source paths, or internal metadata leaks cannot be scored as acceptable or strong,
- strict mode requires every case to be captured and scored, zero failed captures, zero weak/failing scores, and an average score of at least `2.5`.

The live-review report contract check additionally requires:

- `review:ai-ramin-live` exists as an npm script,
- the report script reads `live-answer-review-set.json`,
- the report script writes `latest-live-review-report.json`,
- the report schema includes summary, review queue, deterministic follow-ups, and next actions,
- filters can narrow by family and capture/scoring status,
- `--no-write-report` leaves no generated artifact behind,
- the generated live-review report remains ignored by git.

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

## Eval Candidate Promotion Workflow

Run a dry-run plan first:

```bash
npm run promote:ai-ramin-eval-candidates
```

Useful approval commands:

```bash
npm run promote:ai-ramin-eval-candidates -- --candidate=feedback-role-fit-insufficient-evidence-1 --approve
npm run promote:ai-ramin-eval-candidates -- --all --approve
node scripts/promote-ai-ramin-eval-candidates.mjs --review=ai-ramin-section/evaluation/latest-feedback-review.json --json
```

The promotion script is intentionally conservative:

- dry-run is the default,
- approved writes require an explicit candidate id or `--all`,
- generated promotion plans stay local and ignored by git,
- promoted cases are normalized to current answer technique, answer frame, and soft CTA ids,
- duplicate case ids or duplicate prompt/request/question/hiring fingerprints are skipped,
- feedback provenance stays attached under `feedbackReview` and `promotionReview`.

## Live Answer Review Workflow

`live-answer-review-set.json` is for subjective live-output review. It is intentionally separate from the deterministic eval fixtures because it checks answer quality, voice, formatting, and usefulness after Gemini writes the final copy.

Use it when:

- a Gemini or Google API key is configured locally,
- prompt, formatting, recovery, or answer-frame behavior changes,
- a weak live answer is found during manual testing,
- the team wants before/after examples for answer-quality work.

Recommended loop:

1. Start the server with `GEMINI_API_KEY` or `GOOGLE_API_KEY` configured.
2. Run `npm run preflight:ai-ramin-live` to confirm the key is detected and `/api/ai-ramin` is reachable.
3. Run `npm run capture:ai-ramin-live` to capture all pending cases through `/api/ai-ramin`.
4. Use filters for smaller passes, for example `npm run capture:ai-ramin-live -- --case=live-best-at-product --no-write` or `npm run capture:ai-ramin-live -- --family=product_judgment`.
5. Review the updated `capture` objects: model, answer excerpt, quality issues, routing notes, and recovery notes are auto-filled; score and reviewer notes remain manual.
6. Score using the file's `reviewScale`.
7. Run `npm run check:ai-ramin-live-review` to catch missing manual scores, inconsistent issue tags, and weak/failing answers without review notes.
8. Run `npm run review:ai-ramin-live` to write a local summary of score distribution, review queue, deterministic follow-ups, and next actions.
9. Once every case is captured and scored, run `npm run check:ai-ramin-live-review -- --strict`.
10. If the issue is deterministic, promote it into `eval-cases.json` or a contract fixture.
11. If the issue is subjective copy quality, adjust prompt/answer-frame/recovery behavior and re-capture the same case.

Useful live-review report filters:

```bash
npm run review:ai-ramin-live -- --status=weak
npm run review:ai-ramin-live -- --status=unscored
npm run review:ai-ramin-live -- --family=role_fit
npm run review:ai-ramin-live -- --family=role_fit,product_judgment --json --no-write-report
```

If no Gemini key is configured locally, `npm run check:ai-ramin-live-capture` still validates the review-set shape in dry-run mode. To confirm the server path while acknowledging the key blocker, run `npm run preflight:ai-ramin-live -- --no-key-ok`. Actual live capture remains blocked until a key is configured.

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
7. If the review report creates an eval-case candidate, run `npm run promote:ai-ramin-eval-candidates` and inspect the dry-run plan.
8. Promote only approved candidates with `npm run promote:ai-ramin-eval-candidates -- --candidate=<id> --approve`, then run the AI Ramin eval and routing checks.

The goal is not to game the test. The goal is to keep AI Ramin grounded, safe, and useful as the corpus evolves.
