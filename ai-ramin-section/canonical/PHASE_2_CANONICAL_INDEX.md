---
title: "Phase 2 Canonical Index"
source_type: canonical_index
trust_level: canonical_candidate
visibility: internal_rag_build
retrieval_priority: none
answer_permission: do_not_answer_from_index
---

# Phase 2 Canonical Index

Phase 2 created the first clean canonical knowledge base for AI Ramin.

These files are canonical candidates. They are cleaner than the raw exports, but some metrics still need final verification before public chatbot ingestion.

## Profile and Philosophy

- `ramin-overview.md`
- `profile.md`
- `product-philosophy.md`
- `qualifications.md`
- `talks-writing-courses.md`

## Work Experiences

- `work-experiences/bayut-ai-product-manager.md`
- `work-experiences/side-ai-erp.md`
- `work-experiences/perkbox-vivup.md`
- `work-experiences/groupm-carbon-calculator.md`
- `work-experiences/cox-automotive-auction-platform.md`
- `work-experiences/ordnance-survey-os-maps-api.md`
- `work-experiences/urgentem-element6.md`
- `work-experiences/deity-ai.md`
- `work-experiences/erm-tesla.md`

## Projects

- `projects/ai-native-product-os.md`
- `projects/nsso.md`
- `projects/dreamsea.md`
- `projects/qadam.md`
- `projects/24seven-concierge.md`
- `projects/mass-social-wisdom-agent.md`
- `projects/razinflix.md`
- `projects/selfware-overview.md`

## Ingestion Notes

Future RAG ingestion should:

- prefer these files over raw exports
- exclude `raw-archive/`
- exclude `.DS_Store`
- avoid answering from this index file
- review files with `verification_status: metric_review_needed` before public deployment
- require uncertainty responses when canonical evidence is weak
