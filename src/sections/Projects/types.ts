import {
  deepDives,
  portfolioContent,
  projectCaseStudies,
  toolsAndSystems,
} from '../../data/portfolio';
import {
  type DeepDiveItem,
  type WorkItem,
  type CaseStudyEntry,
} from '../types';
import { slugifyTitle, readableSectionLabel } from '../../lib/text';

export function toProjectCaseStudyEntry(work: WorkItem): CaseStudyEntry {
  return {
    id: `project-${slugifyTitle(work.title)}`,
    typeLabel: 'Project Case Study',
    eyebrow: work.tag,
    title: work.title,
    summary: work.summary,
    readTime: 'Case study',
    year: '2026',
    status: 'Project write-up',
    sourceStatus: work.sourceStatus,
    heroImage: work.image,
    cardSpan: work.span,
    cardAspect: work.aspect,
    sections: [
      { label: 'Problem', body: work.problem },
      { label: 'Architecture', body: work.architecture },
      { label: 'Why this approach', body: work.approach },
      { label: 'Tradeoffs', body: work.tradeoffs },
      { label: 'Demo / proof', body: work.proof },
      { label: 'What I would improve', body: work.improve },
    ],
    chips: work.chips,
    structure: work.architectureChips,
    links: work.links,
    assetSlots: [{ label: 'Next asset needed', note: work.assetRequest, sourceStatus: 'manual-needed' }],
    related: work.architectureChips.map((chip) => chip.label),
  };
}

export function toDeepDiveCaseStudyEntry(item: DeepDiveItem, typeLabel = 'Portfolio Write-up'): CaseStudyEntry {
  return {
    id: `writeup-${item.slug}`,
    typeLabel,
    eyebrow: item.eyebrow,
    title: item.title,
    summary: item.dek,
    readTime: item.readTime,
    year: item.year,
    status: item.status,
    sourceStatus: item.proofChips[0]?.sourceStatus ?? 'local-primary',
    sections: item.sections.map((section) => ({
      label: readableSectionLabel(section.heading),
      body: section.body,
    })),
    chips: item.proofChips,
    structure: item.metadata,
    links: item.sourceLinks,
    assetSlots: item.assetSlots,
    related: item.related,
  };
}

export const metacognitionCaseStudy: CaseStudyEntry = {
  id: 'framework-of-metacognition',
  typeLabel: 'Framework Case Study',
  eyebrow: 'Signature Framework',
  title: 'Framework of Metacognition',
  summary:
    'A hierarchy for turning lived experience into values, values into vision, vision into strategy, and strategy into daily tactics.',
  readTime: '5 min read',
  year: '2026',
  status: 'Draft source',
  sourceStatus: 'manual-needed',
  sections: [
    {
      label: 'Problem',
      body: [
        'People often have strong stories, skills, and ambitions, but no clean architecture for turning them into a coherent public identity or product direction.',
        'The gap is metacognitive: knowing what happened is not the same as knowing what it means, what it proves, or how it should shape the next decision.',
      ],
    },
    {
      label: 'Architecture',
      body: [
        'The framework moves from Experience to Who, Why, How, and What: story becomes values, values become vision, vision becomes strategy, and strategy becomes tactics.',
        'That hierarchy prevents tactics from floating loose. Daily action is connected back to identity, meaning, and long-range direction.',
      ],
    },
    {
      label: 'Why this approach',
      body: [
        'The structure is useful because it works across formats: a pitch, a portfolio, a personal operating system, a course, or a novel can all be organised through the same inner architecture.',
        'It is the conceptual bridge between Product Manager, Engineer, Teacher, and Fiction Author: four surfaces, one underlying way of organising meaning.',
      ],
    },
    {
      label: 'Tradeoffs',
      body: [
        'The framework favours coherence over speed. It asks for enough reflection to avoid shipping a polished surface with no real centre.',
        'It can become too abstract if it is not tied back to examples, proof, and concrete choices. The structure only works when it changes what gets built, said, or prioritised.',
      ],
    },
    {
      label: 'Demo / proof',
      body: [
        'On this site, the framework explains why the same person can credibly hold product work, AI systems, teaching, and fiction inside one portfolio.',
        'The public thought layer already contains the proof surfaces: courses, TEDx, The Proposition, and the AI-Native Product OS.',
      ],
    },
    {
      label: 'What I would improve',
      body: [
        'The next version should become a dedicated essay with a clear diagram and one worked example: taking an experience and tracing it all the way down to a tactical choice.',
        'It should also show how the framework can be used by teams, not just individuals, to translate narrative, values, and strategy into product decisions.',
      ],
    },
  ],
  chips: [
    { label: 'Shape', value: 'Experience -> Who -> Why -> How -> What', sourceStatus: 'local-primary' },
    { label: 'Bridge', value: 'Unifies Manager, Engineer, Teacher, and Author', sourceStatus: 'manual-needed' },
    { label: 'Use', value: 'Organises stories, pitches, frameworks, and related information', sourceStatus: 'manual-needed' },
  ],
  structure: [
    { label: 'Experience', value: 'Story' },
    { label: 'Who', value: 'Values' },
    { label: 'Why', value: 'Vision' },
    { label: 'How', value: 'Strategy' },
    { label: 'What', value: 'Tactics' },
  ],
  links: [
    { label: 'Author site', href: 'https://author.vision/', sourceStatus: 'public-proof' },
    {
      label: 'Product course',
      href: 'https://www.udemy.com/course/the-fastest-way-to-become-a-product-manager/',
      sourceStatus: 'public-proof',
    },
  ],
  assetSlots: [
    { label: 'Framework diagram', note: 'Needs a polished visual hierarchy for the five levels.', sourceStatus: 'manual-needed' },
    { label: 'Worked example', note: 'Needs one concrete story-to-tactic example.', sourceStatus: 'manual-needed' },
  ],
  related: ['AI-Native Product OS', 'Teaching', 'The Proposition', 'Portfolio structure'],
};

export const projectCaseStudyEntries = projectCaseStudies.map(toProjectCaseStudyEntry);
export const caseStudyByDeepDiveSlug = new Map(
  deepDives.map((item) => [
    item.slug,
    toDeepDiveCaseStudyEntry(item, item.slug === 'ai-native-product-os' ? 'Thesis Case Study' : 'Portfolio Write-up'),
  ]),
);

export const caseStudyByProjectName = new Map(projectCaseStudyEntries.map((item) => [item.title, item]));
export const workCaseStudyByTitle = new Map(projectCaseStudies.map((item) => [item.title, item]));

export function getProjectReader(projectName: string) {
  if (projectName === 'AI Native Product OS') return caseStudyByDeepDiveSlug.get('ai-native-product-os');
  return caseStudyByProjectName.get(projectName);
}

export const projectExperienceGroups = [
  {
    label: 'Apps',
    shortLabel: 'App',
    indexLabel: '02A',
    description: 'Mobile and app-store products with live user-facing surfaces.',
    titles: ['Dreamsea', '24Seven Concierge'],
  },
  {
    label: 'Web Apps',
    shortLabel: 'Web App',
    indexLabel: '02B',
    description: 'Browser-based self-ware, identity systems, intelligence surfaces, and curation products.',
    titles: ['nsso', 'Qadam', 'RazinFlix'],
  },
  {
    label: 'Tools',
    shortLabel: 'Tool',
    indexLabel: '02C',
    description: 'Agents, extraction workflows, dashboards, and reusable operating systems.',
    titles: ['AI-Native Product Manager OS', 'Mass Social Wisdom Agent', 'AI Costs Dashboard', 'RAG Pipeline'],
  },
] as const;

export const toolsSystemSignals = [
  {
    label: 'Context ownership',
    detail: 'Profile context, catalog context, dream traditions, source URLs, and curated corpora become the defensible product layer.',
    proof: 'RAG / wiki injection / catalog compression',
  },
  {
    label: 'Workflow motion',
    detail: 'Each tool turns a prompt into a repeatable sequence: classify, retrieve, generate, verify, review, export, or hand off.',
    proof: 'Tool calls / jobs / structured outputs',
  },
  {
    label: 'Governance visibility',
    detail: 'The useful architecture exposes cost, evals, privacy, refusal, review mode, and failure logs before scale.',
    proof: 'Evals / guardrails / observability',
  },
  {
    label: 'Human boundary',
    detail: 'The system can propose, compose, and route work; the user still owns taste, identity, acceptance, and final judgement.',
    proof: 'Review cards / handoffs / accepted actions',
  },
] as const;

export const layerValueKeys = {
  Model: 'modelLayer',
  Context: 'contextLayer',
  Orchestration: 'orchestrationLayer',
  Governance: 'governanceLayer',
  Human: 'humanLayer',
} as const;

export const thoughtArchitectureByProject = new Map(
  portfolioContent.teachingSpeakingWriting.architectureBridge.applications.map((application) => [
    application.projectName,
    application,
  ]),
);

export const toolSystemBySlug = new Map(toolsAndSystems.map((system) => [slugifyTitle(system.title), system]));

export const projectActNavItems = [
  { id: 'projects', label: 'Intro', index: '00' },
  { id: 'projects-selfware-stack', label: 'Selfware', index: '01' },
  { id: 'projects-tools', label: 'Tools', index: '02' },
  { id: 'projects-architecture', label: 'Architecture', index: '03' },
] as const;

export const thoughtFormatNavGroups = [
  {
    index: '01',
    label: 'How I think',
    items: [
      {
        id: 'thoughts-foundations',
        label: 'Clarity',
        detail: 'How I confidently approach life in a noisy world.',
      },
      {
        id: 'thoughts-talks',
        label: 'Values',
        detail: 'Widen perspective until values become obvious.',
      },
    ],
  },
  {
    index: '02',
    label: 'How I express it',
    items: [
      {
        id: 'thoughts-books',
        label: 'Storycraft',
        detail: 'Storytelling and beautiful, future-proof product craft.',
      },
      {
        id: 'thoughts-integration',
        label: 'Integration',
        detail: 'How career and personal projects compound each other.',
      },
    ],
  },
  {
    index: '03',
    label: 'What it builds',
    items: [
      {
        id: 'thoughts-courses',
        label: 'Systems',
        detail: 'Product judgment turned into repeatable operating systems.',
      },
      {
        id: 'thoughts-os',
        label: 'The OS',
        detail: 'The AI-Native Product OS every product runs on.',
      },
    ],
  },
] as const;
