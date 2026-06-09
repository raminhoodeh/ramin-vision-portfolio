import type { PersonalProjectEntry } from '../types';
import { contentValue } from '../../lib/placeholder';

const projectDescriptions: Record<string, string> = {
  nsso:
    'nsso is an owned professional identity platform: profile, CV, projects, storefront, payments, and an AI profile coach in one public home. It turns scattered proof into a living identity surface that can be updated, monetised, and understood at a glance.',
  Dreamsea:
    'Dreamsea is a voice-first iOS dream journal for the half-awake moment when memory is still fragile. It captures a dream by voice, then turns it into a transcript, symbolic interpretations, archetypal motifs, and watercolor imagery for private reflection.',
  Qadam:
    'Qadam is a catalyst-driven market intelligence system built around the gap between physical events and market consensus. It watches logistics, conflict, macro, order-flow, and narrative signals so price-moving context is visible before it becomes a headline.',
  '24Seven Concierge':
    '24Seven Concierge is a luxury travel app that turns loose trip intent into a catalog-grounded itinerary and WhatsApp handoff. Shopify inventory, AI planning, and human concierge fulfilment work together so clients move from browsing to a real booking conversation without starting over.',
  RazinFlix:
    'RazinFlix is a personal streaming-style film library shaped around taste rather than generic genre shelves. It enriches a flat title list with metadata, trailers, posters, atmospheric descriptions, curated categories, and recommendations so a stale spreadsheet becomes a browsable personal canon.',
  'Mass Social Wisdom Agent':
    'Mass Social Wisdom Agent is a Flask and Gemini workflow for turning messy social inputs into structured knowledge. Links, transcripts, screenshots, captions, and carousel posts become a clean .docx export, replacing the usual backlog of saved content with something ready to read, search, and import into Notion.',
  'AI-Native Product Manager OS':
    'AI-Native Product Manager OS is an installable local workspace for PMs moving into AI product work. It gives Codex, Claude Code, Cursor, or Antigravity a durable context library, PM workflow routing, templates, review panels, governance checks, and local output folders so product work compounds beyond one-off prompts.',
  'AI Costs Dashboard':
    'AI Costs Dashboard is an observability surface for AI product usage, spend, latency, failures, and provider/model attribution. It gives teams a way to see where money, reliability, and product value are drifting before small leaks become operating problems.',
  'RAG Pipeline':
    'RAG Pipeline is reusable context infrastructure for AI products that need trusted source material, not one-off prompting. It handles ingestion, chunking, embeddings, retrieval, re-ranking, verification, and context injection so answers stay grounded in the right knowledge.',
};

export function getProjectCardDescriptionByName(projectName: string, fallback: string) {
  return projectDescriptions[projectName] ?? fallback;
}

export function getProjectDescription(project: PersonalProjectEntry) {
  return getProjectCardDescriptionByName(project.projectName, contentValue(project.briefDescription));
}
