import type { CaseStudyEntry } from '../sections/types';

// Routing needs identities, not case copy, media, demos, or renderers.
const reference = (id: string, title: string): CaseStudyEntry => ({
  id, title, typeLabel: 'Portfolio reader', eyebrow: '', summary: '', readTime: '',
  year: '', status: '', sourceStatus: '', sections: [], chips: [], structure: [],
  links: [], assetSlots: [], related: [],
});

export const THESIS_CASE_STUDY_ID = 'writeup-ai-native-product-os';
export const METACOGNITION_DEEP_DIVE_ID = 'metacognition-deep-dive';
export const thesisReference = reference(THESIS_CASE_STUDY_ID, 'AI-Native Product OS');
export const METACOGNITION_SENTINEL = reference(METACOGNITION_DEEP_DIVE_ID, 'Framework of Metacognition');

export const projectCaseStudyBySlug = new Map([
  ['nsso', 'nsso'], ['dreamsea', 'Dreamsea'], ['qadam', 'Qadam'],
  ['24seven-concierge', '24Seven Concierge'], ['razinflix', 'RazinFlix'],
  ['ai-native-product-manager-os', 'AI-Native Product Manager OS'],
  ['mass-social-wisdom-agent', 'Mass Social Wisdom Agent'],
  ['ai-costs-dashboard', 'AI Costs Dashboard'], ['rag-pipeline', 'RAG Pipeline'],
].map(([slug, title]) => [slug, reference(`project-${slug}`, title)]));

export const caseStudyByDeepDiveSlug = new Map([
  ['ai-native-product-os', 'AI-Native Product OS'], ['product-experience', 'Work'],
  ['selected-builds', 'Projects'], ['tools-systems', 'Tools'],
  ['credential-stack', 'Qualifications'], ['teaching-writing', 'Thoughts'],
  ['ai-ramin', 'Ramin.AI'], ['mass-social-wisdom-agent', 'Mass Social Wisdom Agent'],
].map(([slug, title]) => [slug, reference(`writeup-${slug}`, title)]));
