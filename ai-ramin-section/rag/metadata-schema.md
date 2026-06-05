---
title: "RAG Metadata Schema"
source_type: ingestion_policy
trust_level: generic
visibility: internal_rag_build
retrieval_priority: high
answer_permission: use_as_ingestion_spec
source_paths:
  - "ai-ramin-context/00_manifest.yml"
  - "ai-ramin-context/policies/source-priority.md"
verification_status: implementation_spec
---

# RAG Metadata Schema

This schema controls filtering, ranking, answer permissions, and safety behaviour.

## File Metadata

| Field | Required | Purpose |
| --- | --- | --- |
| `title` | yes | Human-readable source name. |
| `source_type` | yes | Classifies source role. |
| `trust_level` | yes | Controls whether claims can be used. |
| `visibility` | yes | Controls public-safe use. |
| `retrieval_priority` | yes | Ranking hint. |
| `answer_permission` | yes | Defines whether the file can support answers. |
| `source_paths` | no | Traceability back to raw or canonical sources. |
| `claim_status` | no | Marks whether the source is verified, review-needed, or inferred. |
| `source_kind` | no | More specific source subtype, such as professional_scenario or qualification_scenario. |
| `based_on` | no | Source files or context the inferred scenario is derived from. |
| `forbidden_use` | no | Explicit boundaries for what the source must not support. |
| `verification_status` | no | Indicates review state. |

## Chunk Metadata

| Field | Type | Notes |
| --- | --- | --- |
| `chunk_id` | string | Stable ID, e.g. hash of file path plus heading plus index. |
| `file_path` | string | Source file path. |
| `title` | string | Inherited from frontmatter. |
| `heading_path` | string[] | Markdown headings above the chunk. |
| `chunk_index` | number | Zero-based order within file. |
| `source_type` | string | Inherited from file. |
| `source_role` | string | policy, canonical, work, project, story, inferred, or framework. |
| `trust_level` | string | Inherited from file. |
| `visibility` | string | Inherited from file. |
| `retrieval_priority` | string | highest, high, medium, low, none. |
| `answer_permission` | string | factual_answer, enforce_policy, use_as_framework_only, etc. |
| `claim_status` | string | verified_or_user_confirmed, review_needed, inferred_not_verified, or similar status. |
| `source_kind` | string | Specific source subtype used by answer assembly and debugging. |
| `based_on` | string[] | Source paths or context notes supporting an inferred scenario. |
| `forbidden_use` | string[] | Boundaries that the runtime must respect. |
| `public_safe` | boolean | True only when website answer use is allowed. |
| `can_answer_from` | boolean | False for indexes and framework-only chunks. |
| `can_support_inference` | boolean | True for chunks that may support inferred fit, likely approach, risks, or assumptions without becoming proof. |
| `requires_contact_fallback` | boolean | True for sensitive or unsupported categories. |
| `contains_metric` | boolean | True if chunk includes numbers used as performance claims. |
| `metric_verification_status` | string | confirmed, review_needed, none, or unknown. |
| `token_estimate` | number | Approximate model-token count. |

## Public Safe Mapping

Set `public_safe: true` when:

- `visibility` is `public_portfolio_safe`
- `answer_permission` allows factual answer or story use
- `trust_level` is canonical or canonical candidate
- the chunk does not include private company details, secrets, or unverified claims

Set `public_safe: false` when:

- visibility is internal-only
- source is a framework or policy
- source is raw archive
- chunk includes sensitive details
- chunk includes unverified metrics that could overclaim

Framework and policy chunks can still be retrieved internally, but they should not be cited as Ramin evidence.

## Source Role Derivation

| Source type | Source role |
| --- | --- |
| `canonical_personal_context` | canonical |
| `work_experience` | work |
| `story_bank` | story |
| `inferred_story` | inferred |
| `hypothetical_application` | inferred |
| `generic_framework` | framework |
| `answer_strategy` | framework |
| `voice_policy` | policy |
| `guardrail_policy` | policy |
| `source_policy` | policy |
| `contact_policy` | policy |
| `abuse_policy` | policy |
| `privacy_policy` | policy |

## Answer Permission Mapping

| Permission | Can support factual claims? | Use |
| --- | --- | --- |
| `factual_answer` | yes | Direct portfolio facts. |
| `story_answer` | yes | Examples and proof stories. |
| `inferred_fit_only` | no | Inferred product judgement, adjacent-fit reasoning, assumptions, and likely approach only. |
| `enforce_policy` | no | Behaviour and safety controls. |
| `use_as_framework_only` | no | Answer shape only. |
| `use_as_ingestion_spec` | no | Runtime build guidance only. |
| `do_not_answer_from_index` | no | Navigation only. |

## Metric Handling

When `contains_metric: true`:

- Prefer chunks where `metric_verification_status: confirmed`.
- Avoid public claims from `review_needed` metrics unless qualified.
- If two metrics conflict, use no metric or mention uncertainty.
- Do not discard the whole source because a metric needs review. The non-metric product claim can still support an answer when `public_safe: true` and `can_answer_from: true`.
- For answer assembly, `canonical_candidate` plus `can_answer_from: true` is usable portfolio evidence. The caution applies to sensitive details and metrics, not to the existence of the product, role, project, or capability.

## Inferred Scenario Handling

Inferred chunks can support product judgement and role-fit reasoning when the user asks how Ramin would approach a problem, but they must stay separate from verified evidence.

When `source_role: inferred` or `answer_permission: inferred_fit_only`:

- `can_answer_from` must remain false.
- `can_support_inference` may be true.
- The answer may use the chunk for `inferred_fit`, product risks, assumptions, likely approach, and open questions.
- The answer must not use the chunk for `verified_proof`, `strongest_verified_proof`, `most_relevant_proof`, or hiring brief proof anchors.
- The answer must not describe the inferred scenario as a completed role, project, launch, metric, or achievement.

## Metadata Validation

The ingestion script should fail loudly when:

- required fields are missing
- `source_type` is unknown
- `answer_permission` is unknown
- a public answer would rely only on framework or policy chunks
- index files are accidentally included as answer sources
