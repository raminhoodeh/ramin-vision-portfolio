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
    'A personal streaming-style film library. Simply enter a film name and year to trigger an automatic scrape of all of the film\'s metadata; poster, IMDB rating, description and YouTube trailer - as the film is elegantly added to the visual catalogue.',
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
