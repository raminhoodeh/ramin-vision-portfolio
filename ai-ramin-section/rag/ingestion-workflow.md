---
title: "RAG Ingestion Workflow"
source_type: ingestion_policy
trust_level: generic
visibility: internal_rag_build
retrieval_priority: high
answer_permission: use_as_ingestion_spec
source_paths:
  - "ai-ramin-context/00_manifest.yml"
  - "ai-ramin-context/policies/source-priority.md"
  - "ai-ramin-context/canonical/PHASE_2_CANONICAL_INDEX.md"
  - "ai-ramin-context/story-bank/PHASE_3_STORY_BANK_INDEX.md"
  - "ai-ramin-context/frameworks/PHASE_4_FRAMEWORK_INDEX.md"
  - "ai-ramin-context/policies/PHASE_5_POLICY_INDEX.md"
verification_status: implementation_spec
---

# RAG Ingestion Workflow

This file defines how AI Ramin context files should be converted into retrievable chunks.

## Ingestion Inputs

Ingest these directories:

- `ai-ramin-context/canonical/`
- `ai-ramin-context/story-bank/`
- `ai-ramin-context/frameworks/`
- `ai-ramin-context/policies/`

Do not ingest these by default:

- raw exported source files in `ai-ramin-context/`
- `ai-ramin-context/raw-archive/`
- `.DS_Store`
- large exported interview guides
- private or internal-only files unless their metadata allows policy or framework use

## Ingestion Steps

1. Load `ai-ramin-context/00_manifest.yml`.
2. Discover Markdown files in allowed directories.
3. Parse YAML frontmatter.
4. Validate required metadata fields.
5. Reject files with `answer_permission: do_not_answer_from_index`.
6. Reject files with `trust_level: exclude`.
7. Split documents using the chunking strategy.
8. Attach inherited file metadata to every chunk.
9. Add chunk-level metadata.
10. Store chunks in the retrieval index.
11. Run the evaluation set before deployment.

## Required Frontmatter Fields

Every ingested file should have:

- `title`
- `source_type`
- `trust_level`
- `visibility`
- `retrieval_priority`
- `answer_permission`

Files missing these fields should fail ingestion.

## Chunk-Level Fields

Every chunk should add:

- `chunk_id`
- `file_path`
- `heading_path`
- `chunk_index`
- `chunk_text`
- `token_estimate`
- `source_role`
- `public_safe`
- `can_answer_from`
- `requires_contact_fallback`
- `contains_metric`
- `metric_verification_status`

## Source Role Mapping

Use these roles during answer assembly:

- policy: controls behaviour
- canonical: factual Ramin evidence
- work: company-specific Ramin evidence
- project: portfolio project evidence
- story: reusable proof example
- framework: answer structure only

## Ingestion Rejection Rules

Reject or skip chunks that:

- come from raw archive sources
- contain obvious base64 image exports
- are index files with `do_not_answer_from_index`
- have no usable text after frontmatter removal
- are marked `exclude`
- are marked private and not needed for policy enforcement

## Update Workflow

When new Ramin context is added:

1. Add or update canonical/story/framework/policy files.
2. Update the manifest.
3. Run metadata validation.
4. Rebuild embeddings.
5. Run evals.
6. Spot-check answers with hiring-manager questions.

## Deployment Note

Ingestion should run server-side. Browser code should never receive API keys, raw internal files, or full corpus dumps.
