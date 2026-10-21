import type { PersonalProjectEntry } from '../types';
import { contentValue } from '../../lib/placeholder';

const projectDescriptions: Record<string, string> = {
  nsso:
    'Shopify, but the product is you: one owned identity surface where profile, proof, projects, products, links, and Deity AI turn self-presentation into self-clarification.',
  Dreamsea:
    'Dreamsea is a voice-first iOS dream journal for the half-awake moment when memory is still fragile. It captures a dream by voice, then turns it into a transcript, symbolic interpretations, archetypal motifs, and watercolour imagery for private reflection.',
  Qadam:
    'A protected macro-intelligence control room that shows the path from world events to evidence, reasoning, paper-only trade lifecycle, proof ledger, operations, and learning.',
  '24Seven Concierge':
    '24Seven Concierge is a luxury travel app that turns loose trip intent into a catalogue-grounded itinerary and WhatsApp handoff. Shopify inventory, AI planning, and human concierge fulfilment work together so clients move from browsing to a real booking conversation without starting over.',
  RazinFlix:
    'A personal streaming-style film library. Add film names and years to run metadata lookups and AI-assisted enrichment, then use the admin editor to correct uncertain matches before browsing the catalogue.',
  'Mass Social Wisdom Agent':
    'Mass Social Wisdom Agent is a staged Flask and Gemini pipeline that turns links, transcripts, screenshots, captions, and carousel posts into a structured .docx export. Its self-scores guide retries; human-calibrated quality evals remain planned.',
  'AI-Native Product Manager OS':
    'AI-Native Product Manager OS is an installable local workspace for PMs moving into AI product work. It gives Codex, Claude Code, Cursor, or Antigravity a durable context library, PM workflow routing, templates, review panels, governance checks, and local output folders so product work compounds beyond one-off prompts.',
  'AI Costs Dashboard':
    'AI Costs Dashboard is a standalone metering and routing library with spend reports, budget alerts, and cached eval scores. Its demo uses seeded events; fallback routing can proceed when no model clears the quality threshold.',
  'RAG Pipeline':
    'RAG Pipeline is a standalone package for chunking, embeddings, namespace-scoped vector retrieval, and cited context packing. Its offline demo exercises the structure; reranking, hybrid search, and retrieval-quality evals remain planned.',
};

export function getProjectCardDescriptionByName(projectName: string, fallback: string) {
  return projectDescriptions[projectName] ?? fallback;
}

export function getProjectDescription(project: PersonalProjectEntry) {
  return getProjectCardDescriptionByName(project.projectName, contentValue(project.briefDescription));
}
