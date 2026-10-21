# Portfolio maintenance and evidence review

The site should make it easy to understand Ramin’s product judgment, inspect the relevant evidence and start a useful conversation. Keep factual review, software checks, human usability and visitor activity as separate kinds of evidence.

## Manual cadence

- After a substantive content, navigation, AI or product-status change: review the affected claims, run the relevant checks and repeat the affected visitor tasks before release.
- During active iteration: inspect a retained visitor-log window once a week, manually. Confirm the project’s current runtime-log retention first; a weekly or monthly export cannot recover records that have already expired.
- In the first working week of each month: check changing public facts, link destinations, available offers and the claim register. Repeat the full human task review after a major change, or when recurring questions show that visitors are missing something important.

These are review dates for a person. This document creates no scheduler, recurring automation or notification.

## Keep claims tied to their evidence

Review a changed claim against its primary source and `docs/portfolio-claims.json`. Record the scope, measurement period, attribution, public-safe boundary, last check and next review. Run `npm run check:portfolio-claims` after updating the register. An employment outcome reported in a CV, a repository, a course listing and an organiser announcement establish different things.

Pay particular attention to:

- Course titles, platform-specific ratings and enrolments, badges, provider and check date in `src/data/teachingEvidence.ts`. Do not add course enrolments into a unique-learner total.
- Professional results and their individual measurement windows in `src/data/professionalStories.ts` and `src/data/homepage.ts`. Avoid combining separate initiatives into one causal claim.
- Product availability and implementation evidence in `src/data/projectBriefs.ts`, the case studies and their linked repositories. An illustrative demo does not establish private-app integration or measured production quality.
- Qadam’s paper-only boundary. Do not turn paper records into a proven trading edge, live return or demonstrated quantum advantage.
- The DISx scenario’s hypothetical, simulated status. Public speaking recognition is separate from production payment or sanctions-screening performance.
- Resource and bonus destinations, coupon validity, booking availability and any membership offer. Verify an entitlement before promising it.

When a changing figure cannot be refreshed, retain its real historical check date or omit the figure. Do not move the date forward because the page was edited. Keep the visible page, AI Ramin’s canonical sources and generated corpus consistent.

## Software verification

`npm run check:priority-eight` runs the claim reconciliation, measurement/report and AI conversation continuity checks. It is also part of `npm run verify`. Claim reconciliation additionally runs in `prebuild`, including Vercel production builds, so a due review or source-value mismatch blocks a new build until it is reconciled. To inspect date-sensitive claims at a specific review date, use `npm run check:portfolio-claims -- --as-of YYYY-MM-DD --json`. The first current claim reviews fall due on 21 November 2026; this is a manual maintenance date, not a newly scheduled task.

Use the repository’s checks as executable evidence, and inspect their output. The usual entry point is `npm run verify`; production HTML and routing can also be checked with `npm run check:public-http` after a build, and accessibility contracts with `npm run check:accessibility`.

Confirm the CV and presentation redirects, useful initial HTML, canonical URLs, real 404 responses, reader exits, keyboard focus, mobile scrolling and important external destinations. A passing script confirms what that script exercised. It does not establish that a person understood the site or that a remote provider returned a useful answer.

Offline AI evaluation and routing checks remain separate from reviewing newly generated answers. The live generated-answer review is deferred while the Gemini issue is unresolved; do not present offline results as a current live-provider quality assessment or start that review implicitly.

## Review recorded visitor activity

Export a retained log window from the hosting platform, then run:

```sh
node scripts/report-visitor-journey.mjs --input /path/to/export.jsonl
node scripts/report-visitor-journey.mjs --input /path/to/export.json --output /path/to/visitor-review.md
```

One verified Vercel CLI export shape is:

```sh
vercel logs --environment production --no-branch --since 7d --query portfolio_journey --json --limit 1000 --scope ramin-hoodehs-projects > /path/to/export.jsonl
```

Confirm retention before requesting that window. Check the current CLI help if a fixed end time is needed, and record the chosen start/end and export limit. Seven days in the command does not establish that seven days were retained. A 1,000-record cap can truncate the export; do not assume a returned export is complete or add overlapping exports together.

The report accepts JSON or JSONL, including log envelopes whose `message` contains the JSON event. It admits only the strict `portfolio_journey` schema in `src/analytics/visitorJourneySchema.mjs`: finite event, surface, target and audience values, with an exact server envelope and a valid UTC day. Its output contains aggregate counts and server-assigned days, rather than raw log messages, prompts, job descriptions, URLs, visitor IDs or cookies.

`audience: qa` records are reported separately and excluded from the visitor baseline. Local and non-production activity is assigned to QA. The in-memory `?journey=qa` mode marks a production QA walkthrough across SPA navigation; verify that mode when testing, and do not infer that every unmarked visitor record came from a prospective customer. There are no identifiers with which to repair a wrongly marked session afterward.

This is a first-party event log, not a durable analytics database. Availability depends on the host’s current runtime-log retention and the exported window. The host may separately retain request metadata outside the application’s event payload; an exported hosting log should not be described as containing only the application’s minimal fields.

Read the report as counts of accepted records:

- A page-view event is a recorded action, not a unique visitor or a complete visit.
- A CV, course, evidence or contact action does not establish that the destination loaded, a course was purchased, a message was sent or a useful enquiry arrived.
- Without identifiers or session linkage, these records cannot establish a person-level funnel, conversion rate, repeat visitor or an ordered journey through the site.
- Logging gaps, blocked or failed requests, local testing, retries, robots and overlapping exports can affect the totals. Identical records are not deduplicated: they may represent separate actions, and the schema cannot distinguish them reliably.
- No accepted events means that the export supplies no usable baseline. It is not evidence that nobody visited.

Record the export window and known QA activity beside the report. Avoid summing overlapping windows. If keeping trends, retain the aggregate review rather than copying raw hosting logs into the repository. Follow the chosen retention policy for exports; this script does not delete input files or create a database.

## Connect counts to an actual question

Use activity to choose what to inspect, then use human review to explain it. For example, repeated case openings with few evidence-follow events can motivate a check of the evidence link’s visibility; it does not prove that readers distrust the case. More contact actions do not prove more qualified opportunities.

Review useful enquiries manually and separately. A useful enquiry has enough real role, audience or project context to support a next step. Record a coarse count and the question it answered without copying names, messages or job descriptions into the activity report. If none have been reviewed, say so.

Use `docs/visitor-journey-review-template.md` for human review. Keep scripted QA results, observed usability, activity counts and substantive enquiries in distinct sections. End a review with a small number of concrete changes, an owner and a date to check their effect; do not claim improvement before that next observation.
