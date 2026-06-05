import { navLinks } from '../data/portfolio';

export type SectionTarget = (typeof navLinks)[number]['target'];

export function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function readableSectionLabel(heading: string) {
  return heading.includes(' - ') ? heading.split(' - ')[0] : heading;
}

export function getInitials(label: string) {
  return label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function conciseCredentialSummary(value: string) {
  const firstSentence = value.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim();
  const summary = firstSentence ?? value;
  return summary.length > 132 ? `${summary.slice(0, 129).trim()}...` : summary;
}

export function educationCredentialChipName(name: string) {
  if (name === 'AI Engineer Certification') return 'AI Engineering';
  if (name === 'MCP Advanced Topics') return 'MCP Advanced Topics';
  return name;
}

export function educationIssuerChipName(name: string) {
  if (name === 'Google AI School') return 'Google';
  if (name === 'Anthropic Academy') return 'Anthropic';
  return name;
}

export function normalizeSectionTarget(target: string | null | undefined): SectionTarget {
  return navLinks.find((link) => link.target === target)?.target ?? 'hero';
}

export function formatSourceStatus(status: string) {
  return status.replace('-', ' ');
}

export function createAiRaminMessageId(prefix: 'assistant' | 'user') {
  const randomId =
    globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${randomId}`;
}
