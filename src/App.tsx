import { AnimatePresence, motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { MutableRefObject, ReactNode } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { LiquidGlassJsNavShell } from './components/LiquidGlassJsNavShell';
import { VisionLoadingScreen } from './components/VisionLoadingScreen';
import profileImageUrl from './assets/ramin-profile-nav.webp';
import rockModelUrl from '../gl/global/rocks.glb?url';
import {
  architectureLayers,
  contentReadiness,
  deepDives,
  navLinks,
  portfolioContent,
  projectCaseStudies,
  roles,
  socialLinks,
  toolsAndSystems,
} from './data/portfolio';

gsap.registerPlugin(ScrollTrigger);

const LiveShaderGradientBackground = lazy(() =>
  import('./components/ShaderGradientBackground').then((module) => ({ default: module.ShaderGradientBackground })),
);

function StaticShaderGradientBackground() {
  return <div className="fixed inset-0 z-0 overflow-hidden bg-black shader-gradient-surface" aria-hidden="true" />;
}

type DeepDiveItem = (typeof deepDives)[number];
type WorkItem = (typeof projectCaseStudies)[number];
type ToolSystemEntry = (typeof toolsAndSystems)[number];
type AssetSlotItem = DeepDiveItem['assetSlots'][number];
type PlaceholderLike = { kind: 'placeholder'; label: string };
type ProductManagementWorkExperience =
  (typeof portfolioContent.productManagementWorkExperiences.companies)[number];
type PersonalProjectEntry =
  | (typeof portfolioContent.personalProjects.selfware)[number]
  | (typeof portfolioContent.personalProjects.tools)[number];
type QualificationEntry = (typeof portfolioContent.qualifications.qualifications)[number];
type CertificationEntry = (typeof portfolioContent.qualifications.certifications)[number];
type TeachingEntry = (typeof portfolioContent.teachingSpeakingWriting.teaching)[number];
type SpeakingEntry = (typeof portfolioContent.teachingSpeakingWriting.speaking)[number];
type BookEntry = (typeof portfolioContent.teachingSpeakingWriting.writing.books)[number];
type ArticleEntry = (typeof portfolioContent.teachingSpeakingWriting.writing.articles)[number];
type WritingCaseStudyEntry = (typeof portfolioContent.teachingSpeakingWriting.writing.caseStudies)[number];
type SectionTarget = (typeof navLinks)[number]['target'];

type CaseStudyEntry = {
  id: string;
  tag?: string;
  typeLabel: string;
  eyebrow: string;
  title: string;
  summary: string;
  readTime: string;
  year: string;
  status: string;
  sourceStatus: string;
  heroImage?: string;
  cardSpan?: string;
  cardAspect?: string;
  sections: readonly { label: string; body: readonly string[] }[];
  chips: readonly { label: string; value: string; sourceStatus?: string }[];
  structure: readonly { label: string; value: string }[];
  links: readonly { label: string; href: string; sourceStatus?: string }[];
  assetSlots: readonly { label: string; note: string; sourceStatus?: string }[];
  related: readonly string[];
};

function scrollToId(target: string) {
  document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function isPlaceholderValue(value: unknown): value is PlaceholderLike {
  return Boolean(value && typeof value === 'object' && 'kind' in value && (value as PlaceholderLike).kind === 'placeholder');
}

function contentValue(value: string | PlaceholderLike | undefined) {
  if (!value) return 'Detail needed';
  return isPlaceholderValue(value) ? value.label : value;
}

function countPlaceholders(value: unknown): number {
  if (isPlaceholderValue(value)) return 1;
  if (Array.isArray(value)) return value.reduce((total, item) => total + countPlaceholders(item), 0);

  if (value && typeof value === 'object') {
    return Object.values(value).reduce((total, item) => total + countPlaceholders(item), 0);
  }

  return 0;
}

function ContentToken({ value }: { value: string | PlaceholderLike }) {
  const isPlaceholder = isPlaceholderValue(value);

  return (
    <span
      className={`rounded-full px-3 py-1.5 text-xs ${
        isPlaceholder ? 'border border-dashed border-stroke/70 text-muted' : 'bg-white/45 text-text-primary'
      }`}
    >
      {contentValue(value)}
    </span>
  );
}

function normalizeSectionTarget(target: string | null | undefined): SectionTarget {
  return navLinks.find((link) => link.target === target)?.target ?? 'hero';
}

const bottomNavigationLinks = [
  { label: 'Intro', target: 'hero', icon: 'intro' },
  { label: 'Work', target: 'experience-education', icon: 'work' },
  { label: 'Projects', target: 'projects', icon: 'projects' },
  { label: 'Thoughts', target: 'teaching-speaking-writing', icon: 'thoughts' },
  { label: 'Contact', target: 'contact', icon: 'contact' },
  { label: 'Bonus', target: 'bonus', icon: 'bonus' },
  { label: 'AI Ramin', target: 'ai-ramin', icon: 'ai' },
] as const;

function BottomNavigation({
  active,
  onNavigate,
}: {
  active: SectionTarget | 'ai-ramin';
  onNavigate: (target: string) => void;
}) {
  return (
    <nav aria-label="Portfolio navigation" className="portfolio-bottom-navigation">
      <LiquidGlassJsNavShell
        active={active}
        navLinks={bottomNavigationLinks}
        onNavigate={onNavigate}
        onCta={() => onNavigate('ai-ramin')}
        className="portfolio-bottom-navigation-liquid-shell"
        orientation="bottom"
        showLogo={false}
        showCta={false}
        navLabel="Portfolio navigation"
      />
    </nav>
  );
}

function Hero({ ready, onOpenThesis }: { ready: boolean; onOpenThesis: () => void }) {
  const rootRef = useRef<HTMLElement | null>(null);
  const [roleIndex, setRoleIndex] = useState(0);
  const { hero } = portfolioContent;
  const activeRole = roles[roleIndex];

  useLayoutEffect(() => {
    if (!ready) return undefined;

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .to('.name-reveal', { opacity: 1, y: 0, duration: 1.2, delay: 0.1 })
        .to(
          '.blur-in',
          {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            duration: 1,
            stagger: 0.1,
          },
          0.3,
        );
    }, rootRef);

    return () => ctx.revert();
  }, [ready]);

  useEffect(() => {
    if (!ready) return undefined;

    const interval = window.setInterval(() => {
      setRoleIndex((current) => (current + 1) % roles.length);
    }, 2000);

    return () => window.clearInterval(interval);
  }, [ready]);

  return (
    <section
      id="hero"
      ref={rootRef}
      className="relative flex min-h-[calc(100vh-1.5rem)] items-center justify-center overflow-hidden px-6 text-center sm:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-6rem)]"
    >
      <div className="absolute inset-0 z-0 bg-white/8" />
      <svg
        className="hero-name-cutout-layer hero-name-cutout-layer-desktop"
        viewBox="0 0 1600 900"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <mask id="hero-name-cutout-mask-desktop" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="900">
            <rect x="0" y="0" width="1600" height="900" fill="white" />
            <text className="hero-name-cutout-mask-text hero-name-cutout-mask-text-desktop" x="800" y="350" fill="black">
              {hero.name}
            </text>
          </mask>
        </defs>
        <rect
          className="hero-name-cutout-surface"
          x="0"
          y="0"
          width="1600"
          height="900"
          fill="white"
          mask="url(#hero-name-cutout-mask-desktop)"
        />
      </svg>
      <svg
        className="hero-name-cutout-layer hero-name-cutout-layer-mobile"
        viewBox="0 0 600 760"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <mask id="hero-name-cutout-mask-mobile" maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="760">
            <rect x="0" y="0" width="600" height="760" fill="white" />
            <text className="hero-name-cutout-mask-text hero-name-cutout-mask-text-mobile" x="300" y="306" fill="black">
              {hero.name}
            </text>
          </mask>
        </defs>
        <rect
          className="hero-name-cutout-surface"
          x="0"
          y="0"
          width="600"
          height="760"
          fill="white"
          mask="url(#hero-name-cutout-mask-mobile)"
        />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 z-[2] h-48 bg-gradient-to-t from-bg/90 to-transparent" />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center">
        <h1 className="sr-only">{hero.name}</h1>
        <div className="hero-name-cutout-spacer name-reveal translate-y-[50px]" aria-hidden="true" />
        <p className="blur-in mt-6 translate-y-5 text-center text-sm font-semibold leading-normal text-[#4f5863] [filter:blur(10px)] md:text-base">
          <span>Product </span>
          <motion.span
            key={activeRole}
            className="inline-block align-baseline font-display text-[1.04em] italic leading-normal text-[#65707c]"
            initial={{ opacity: 0.55, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {activeRole}
          </motion.span>
          <span> and Fiction Author</span>
        </p>
        <p className="blur-in mt-5 max-w-md translate-y-5 text-sm leading-7 text-muted [filter:blur(10px)] md:text-base">
          {hero.headline}
        </p>
        <div className="blur-in mt-12 flex translate-y-5 flex-wrap justify-center gap-4 [filter:blur(10px)]">
          <button
            type="button"
            onClick={onOpenThesis}
            className="group relative inline-flex rounded-full p-[2px] text-sm transition duration-300 hover:scale-105"
          >
            <span className="accent-gradient animated-gradient absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="relative rounded-full border border-stroke bg-white/60 px-7 py-3.5 text-text-primary shadow-[0_10px_30px_rgba(55,80,108,0.08)] transition duration-300 group-hover:border-transparent group-hover:bg-white">
              My Product Thesis
            </span>
          </button>
        </div>
      </div>

    </section>
  );
}

function SectionHeader({
  eyebrow,
  prefix,
  italic,
  copy,
  cta,
  sectionNumber,
}: {
  eyebrow: string;
  prefix: string;
  italic: string;
  copy: string;
  cta?: string;
  sectionNumber?: string;
}) {
  return (
    <motion.div
      className="mb-10 flex flex-col gap-8 md:mb-14 md:flex-row md:items-end md:justify-between"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
      viewport={{ once: true, margin: '-100px' }}
    >
      <div>
        <div className="mb-5 flex items-center gap-4">
          {sectionNumber ? (
            <span className="font-display text-3xl italic leading-none text-text-primary/55">
              {sectionNumber}
            </span>
          ) : null}
          <span className="h-px w-8 bg-stroke" />
          <span className="text-xs uppercase tracking-[0.3em] text-muted">{eyebrow}</span>
        </div>
        <h2 className="font-body text-4xl font-semibold tracking-[-0.04em] text-text-primary md:text-6xl">
          {prefix} <span className="font-display italic font-normal">{italic}</span>
        </h2>
        <p className="mt-5 max-w-md text-sm leading-7 text-muted md:text-base">{copy}</p>
      </div>

      {cta ? (
        <a
          href="#contact"
          className="group relative hidden rounded-full p-[2px] text-sm transition duration-300 hover:scale-105 md:inline-flex"
        >
          <span className="accent-gradient animated-gradient absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span className="relative rounded-full bg-bg px-6 py-3 text-text-primary ring-1 ring-stroke transition duration-300 group-hover:ring-transparent">
            {cta} <span aria-hidden="true">→</span>
          </span>
        </a>
      ) : null}
    </motion.div>
  );
}

function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function readableSectionLabel(heading: string) {
  return heading.includes(' - ') ? heading.split(' - ')[0] : heading;
}

function toProjectCaseStudyEntry(work: WorkItem): CaseStudyEntry {
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

function toDeepDiveCaseStudyEntry(item: DeepDiveItem, typeLabel = 'Portfolio Write-up'): CaseStudyEntry {
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

const metacognitionCaseStudy: CaseStudyEntry = {
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
    { label: 'Bridge', value: 'Connects Manager, Engineer, Teacher, and Author', sourceStatus: 'manual-needed' },
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

const projectCaseStudyEntries = projectCaseStudies.map(toProjectCaseStudyEntry);
const caseStudyByDeepDiveSlug = new Map(
  deepDives.map((item) => [
    item.slug,
    toDeepDiveCaseStudyEntry(item, item.slug === 'ai-native-product-os' ? 'Thesis Case Study' : 'Portfolio Write-up'),
  ]),
);

const caseStudyByProjectName = new Map(projectCaseStudyEntries.map((item) => [item.title, item]));

function getProjectReader(projectName: string) {
  if (projectName === 'AI Native Product OS') return caseStudyByDeepDiveSlug.get('ai-native-product-os');
  return caseStudyByProjectName.get(projectName);
}

const projectExperienceGroups = [
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
    titles: ['Mass Social Wisdom Agent'],
  },
] as const;

const toolsSystemSignals = [
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

const layerValueKeys = {
  Model: 'modelLayer',
  Context: 'contextLayer',
  Orchestration: 'orchestrationLayer',
  Governance: 'governanceLayer',
  Human: 'humanLayer',
} as const;

const toolLayerColumns = ['Model', 'Context', 'Orchestration', 'Governance', 'Human'] as const;

function ProjectCaseStudyRow({
  entry,
  groupLabel,
  index,
  onOpen,
}: {
  entry: CaseStudyEntry;
  groupLabel: string;
  index: number;
  onOpen: (item: CaseStudyEntry) => void;
}) {
  const proofChip = entry.chips.find((chip) => /proof|public|live|asset/i.test(chip.label)) ?? entry.chips[0];
  const structureLabels = entry.structure.slice(0, 3).map((detail) => detail.label);

  return (
    <motion.button
      type="button"
      key={entry.id}
      onClick={() => onOpen(entry)}
      className="group relative w-full overflow-hidden rounded-[30px] border border-white/20 bg-white/[0.24] p-3 text-left shadow-[0_12px_44px_rgba(45,72,105,0.09)] transition duration-300 hover:-translate-y-0.5 hover:border-white/55 hover:bg-white/[0.34] hover:shadow-[0_20px_70px_rgba(45,72,105,0.16)] sm:rounded-[34px] lg:rounded-full"
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay: Math.min(index * 0.04, 0.2) }}
      viewport={{ once: true, margin: '-80px' }}
    >
      <span className="accent-gradient absolute inset-x-8 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="grid gap-4 lg:grid-cols-[7.5rem_11rem_minmax(0,1fr)_minmax(15rem,0.42fr)_auto] lg:items-center">
        <div className="flex items-center justify-between gap-3 sm:block">
          <span className="font-display text-3xl italic leading-none text-text-primary/70 md:text-4xl">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="rounded-full bg-white/45 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.16em] text-muted sm:mt-3 sm:inline-flex">
            {groupLabel}
          </span>
        </div>

        <div className="relative h-28 overflow-hidden rounded-[24px] bg-white/25 sm:order-none sm:h-24 sm:rounded-full lg:h-24">
          {entry.heroImage ? (
            <img
              src={entry.heroImage}
              alt=""
              loading="lazy"
              decoding="async"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,rgba(255,255,255,0.75),rgba(137,170,204,0.38)_42%,rgba(38,57,86,0.58)_100%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-bg/12 via-transparent to-bg/20" />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted">{entry.eyebrow}</p>
            <span className="h-1 w-1 rounded-full bg-muted/60" />
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted/80">
              {entry.status}
            </p>
          </div>
          <h3 className="mt-2 text-3xl font-semibold leading-none tracking-[-0.045em] text-text-primary md:text-4xl">
            {entry.title}
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{entry.summary}</p>
        </div>

        <div className="hidden min-w-0 lg:block">
          <p className="text-[0.62rem] uppercase tracking-[0.18em] text-muted">Proof shape</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {structureLabels.map((label) => (
              <span key={`${entry.id}-${label}`} className="rounded-full bg-white/35 px-3 py-1.5 text-xs text-muted">
                {label}
              </span>
            ))}
            {proofChip ? (
              <span className="rounded-full bg-white/55 px-3 py-1.5 text-xs text-text-primary">
                {proofChip.label}
              </span>
            ) : null}
          </div>
        </div>

        <span className="inline-flex items-center justify-center rounded-full bg-white/70 px-5 py-3 text-sm text-text-primary transition duration-300 group-hover:bg-text-primary group-hover:text-bg">
          Open reader
        </span>
      </div>
    </motion.button>
  );
}

function formatSourceStatus(status: string) {
  return status.replace('-', ' ');
}

function AssetSlotCard({ slot }: { slot: AssetSlotItem }) {
  return (
    <div className="liquid-glass rounded-[1.35rem] p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-text-primary">{slot.label}</p>
        <span className="shrink-0 text-[0.62rem] uppercase tracking-[0.18em] text-muted">
          {formatSourceStatus(slot.sourceStatus)}
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted">{slot.note}</p>
    </div>
  );
}

function ContentReadinessPanel() {
  const placeholderCounts = useMemo(
    () => [
      { section: 'Hero', count: countPlaceholders(portfolioContent.hero) },
      {
        section: 'Experience & Education',
        count:
          countPlaceholders(portfolioContent.productManagementWorkExperiences) +
          countPlaceholders(portfolioContent.qualifications),
      },
      { section: 'Projects', count: countPlaceholders(portfolioContent.personalProjects) },
      { section: 'Teaching, Speaking & Writing', count: countPlaceholders(portfolioContent.teachingSpeakingWriting) },
      { section: 'Contact', count: countPlaceholders(portfolioContent.contactCta) },
      { section: 'Bonus', count: countPlaceholders(portfolioContent.bonus) },
      { section: 'AI Ramin', count: countPlaceholders(portfolioContent.aiRaminChatbot) },
    ],
    [],
  );

  const totalPlaceholders = placeholderCounts.reduce((total, item) => total + item.count, 0);
  const totalRequests = contentReadiness.groups.reduce((total, group) => total + group.requests.length, 0);

  return (
    <section id="content-readiness" aria-label="Content readiness intake" className="bg-transparent py-12 md:py-16">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        <div className="liquid-glass-strong rounded-[2rem] p-6 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Private QA view</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-text-primary md:text-5xl">
                {contentReadiness.title}
              </h2>
              <p className="mt-5 text-sm leading-7 text-muted">{contentReadiness.accessHint}</p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.2rem] bg-white/35 p-4">
                  <p className="text-[0.62rem] uppercase tracking-[0.18em] text-muted">Intentional placeholders</p>
                  <p className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-text-primary">
                    {totalPlaceholders}
                  </p>
                </div>
                <div className="rounded-[1.2rem] bg-white/35 p-4">
                  <p className="text-[0.62rem] uppercase tracking-[0.18em] text-muted">Open intake requests</p>
                  <p className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-text-primary">
                    {totalRequests}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              {placeholderCounts.map((item) => (
                <div
                  key={item.section}
                  className="grid gap-3 rounded-[1rem] bg-white/30 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                >
                  <p className="text-sm font-medium text-text-primary">{item.section}</p>
                  <span className="rounded-full bg-white/45 px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-muted">
                    {item.count} missing
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {contentReadiness.groups.map((group) => (
              <details
                key={group.section}
                className="rounded-[1.4rem] border border-white/25 bg-white/24 p-4 [&>summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[0.62rem] uppercase tracking-[0.18em] text-muted">
                      {group.sectionNumber} / {group.priority} priority
                    </p>
                    <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-text-primary">
                      {group.section}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted">{group.sourceNote}</p>
                  </div>
                  {group.target !== 'ai-ramin-modal' ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        scrollToId(group.target);
                      }}
                      className="shrink-0 rounded-full bg-white/45 px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-muted transition duration-300 hover:bg-white/70 hover:text-text-primary"
                    >
                      Jump
                    </button>
                  ) : (
                    <span className="shrink-0 rounded-full bg-white/35 px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-muted">
                      Modal
                    </span>
                  )}
                </summary>

                <div className="mt-4 grid gap-2 border-t border-stroke/60 pt-4">
                  {group.requests.map((request, index) => (
                    <div
                      key={`${group.section}-${request.item}`}
                      className="grid gap-3 rounded-[0.95rem] bg-white/30 p-3 sm:grid-cols-[2rem_minmax(0,1fr)_auto] sm:items-start"
                    >
                      <span className="text-[0.62rem] uppercase tracking-[0.16em] text-muted">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <p className="text-sm leading-6 text-text-primary">{request.item}</p>
                      <span className="rounded-full bg-white/45 px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.14em] text-muted">
                        {formatSourceStatus(request.sourceStatus)}
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const thesisStackLayers = [
  {
    name: 'Model',
    role: 'Capability',
    detail: 'GPT, Claude, Gemini: the rented intelligence layer that changes fastest.',
  },
  {
    name: 'Context',
    role: 'Defensibility',
    detail: 'Product truth, users, strategy, memory, retrieval, voice, and constraints.',
  },
  {
    name: 'Orchestration',
    role: 'Motion',
    detail: 'Agents, tools, MCPs, jobs, routing, and the workflow around the model.',
  },
  {
    name: 'Governance',
    role: 'Trust',
    detail: 'Evals, guardrails, refusal, observability, fallbacks, audit, and cost control.',
  },
  {
    name: 'Human',
    role: 'Judgement',
    detail: 'Vision, empathy, taste, communication, accountability, and decision quality.',
  },
] as const;

const thesisLoopSteps = [
  { name: 'Talk', layer: 'Human + Context', detail: 'Turn ambiguity into useful context.' },
  { name: 'Decide', layer: 'Human + Governance', detail: 'Set the standard for what good means.' },
  { name: 'Build', layer: 'Model + Orchestration', detail: 'Move from direction to working artifact.' },
  { name: 'Observe', layer: 'Governance', detail: 'Measure behaviour against the eval bar.' },
  { name: 'Iterate', layer: 'All five layers', detail: 'Feed evidence back into the system.' },
] as const;

const governanceItems = ['Evals', 'Guardrails', 'Refusal', 'Cost controls', 'Human review'] as const;

const thesisConsequences = [
  {
    name: 'One',
    force: "You can't prompt-and-hope. You have to understand the model and load your context.",
    layer: 'Model + Context',
  },
  {
    name: 'Two',
    force: 'Probabilistic systems need loops, not straight lines.',
    layer: 'Orchestration',
  },
  {
    name: 'Three',
    force: 'Probabilistic systems need guardrails and evals, not hope.',
    layer: 'Governance',
  },
  {
    name: 'Four',
    force: 'Probabilistic systems change what being a professional means.',
    layer: 'Human',
  },
] as const;

const thesisTradeoffs = [
  {
    name: 'Speed over exhaustive documentation',
    detail: 'A clickable prototype on day three can beat a thirty-page PRD on day thirty when the material is probabilistic.',
  },
  {
    name: 'Loops over stage-gates',
    detail: 'Replace only what is broken or too slow; keep old safeguards until the new muscles are stable.',
  },
  {
    name: 'Measurement discipline over vibes',
    detail: 'Ship what you can measure. Hold what you cannot.',
  },
  {
    name: 'Human judgment is not delegatable',
    detail: 'When execution is cheap, the scarce resource is taste.',
  },
] as const;

const thesisImprovementGaps = [
  {
    name: 'Governance layer',
    detail: 'Most teams under-install evals, guardrails, observability, fallbacks, and cost controls.',
  },
  {
    name: 'Human layer',
    detail: 'Vision, empathy, taste, communication, and judgment need reps the OS cannot automate.',
  },
  {
    name: 'Eval coverage',
    detail: 'The target is a living suite where every bug seen in the wild becomes a permanent test case.',
  },
] as const;

const thesisInstallRules = [
  'Build something small this week.',
  'Never confuse a model update with a stack change.',
  'The model is rented. Your context is owned.',
  'You are not the builder. You are the conductor.',
  'Ship what you can measure. Hold what you cannot.',
  'You are the Context Layer.',
] as const;

function StackDiagramCard() {
  return (
    <div className="liquid-glass-strong shrink-0 rounded-[2rem] p-6 md:p-7">
      <p className="text-xs uppercase tracking-[0.24em] text-muted">5-Layer Stack</p>
      <div className="mt-6 grid gap-2">
        {thesisStackLayers.map((layer, index) => (
          <div key={layer.name} className="liquid-glass rounded-[1.25rem] px-4 py-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-text-primary">{layer.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">{layer.role}</p>
              </div>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/40 text-xs text-text-primary">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">{layer.detail}</p>
          </div>
        ))}
      </div>
      <p className="mt-5 rounded-2xl bg-white/35 px-4 py-3 font-display text-xl italic leading-7 text-text-primary">
        Model is capability. Context is defensibility.
      </p>
    </div>
  );
}

function LoopDiagramCard() {
  return (
    <div className="liquid-glass shrink-0 rounded-[2rem] p-6 md:p-7">
      <p className="text-xs uppercase tracking-[0.24em] text-muted">AI-Native Loop</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-5 lg:grid-cols-1 xl:grid-cols-5">
        {thesisLoopSteps.map((step, index) => (
          <div key={step.name} className="relative liquid-glass rounded-[1.35rem] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-text-primary">{step.name}</p>
              <span className="text-[0.62rem] uppercase tracking-[0.18em] text-muted">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted">{step.layer}</p>
            <p className="mt-3 text-sm leading-6 text-muted">{step.detail}</p>
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm leading-6 text-text-primary">
        Measured in hours, not quarters. Fast work still needs a standard.
      </p>
    </div>
  );
}

function TradeoffsCard() {
  return (
    <div className="liquid-glass shrink-0 rounded-[2rem] p-6 md:p-7">
      <p className="text-xs uppercase tracking-[0.24em] text-muted">Tradeoffs</p>
      <div className="mt-5 grid gap-3">
        {thesisTradeoffs.map((item, index) => (
          <div key={item.name} className="rounded-2xl bg-white/35 p-4">
            <div className="flex items-start gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/45 text-[0.68rem] text-text-primary">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-semibold leading-5 text-text-primary">{item.name}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{item.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConsequencesCard() {
  return (
    <div className="liquid-glass shrink-0 rounded-[2rem] p-6 md:p-7">
      <p className="text-xs uppercase tracking-[0.24em] text-muted">Why This Approach</p>
      <h4 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-text-primary">
        Four consequences, one property
      </h4>
      <div className="mt-5 grid gap-3">
        {thesisConsequences.map((item) => (
          <div key={item.name} className="rounded-2xl bg-white/35 p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">{item.name}</p>
              <span className="rounded-full bg-white/45 px-3 py-1 text-[0.62rem] uppercase tracking-[0.14em] text-muted">
                {item.layer}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-text-primary">{item.force}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImprovementGapsCard() {
  return (
    <div className="liquid-glass shrink-0 rounded-[2rem] p-6 md:p-7">
      <p className="text-xs uppercase tracking-[0.24em] text-muted">What I Would Improve</p>
      <div className="mt-5 grid gap-3">
        {thesisImprovementGaps.map((item) => (
          <div key={item.name} className="rounded-2xl bg-white/35 p-4">
            <p className="text-sm font-semibold text-text-primary">{item.name}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{item.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DefensibilityCard() {
  return (
    <div className="liquid-glass shrink-0 rounded-[2rem] p-6 md:p-7">
      <p className="text-xs uppercase tracking-[0.24em] text-muted">Core Rule</p>
      <p className="mt-5 font-display text-4xl italic leading-none tracking-[-0.04em] text-text-primary md:text-5xl">
        The model is rented.
      </p>
      <p className="mt-2 font-body text-3xl font-semibold leading-none tracking-[-0.04em] text-text-primary md:text-4xl">
        Your context is owned.
      </p>
      <p className="mt-5 text-sm leading-7 text-muted">
        Durable AI products compound around proprietary context, workflows, constraints, trust, and taste.
      </p>
    </div>
  );
}

function GovernanceCard() {
  return (
    <div className="liquid-glass shrink-0 rounded-[2rem] p-6 md:p-7">
      <p className="text-xs uppercase tracking-[0.24em] text-muted">Governance</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {governanceItems.map((item) => (
          <span key={item} className="rounded-full bg-white/45 px-4 py-2 text-xs text-text-primary">
            {item}
          </span>
        ))}
      </div>
      <p className="mt-5 text-sm leading-7 text-muted">
        Governance is designed into the product from day one, before the system touches real users.
      </p>
    </div>
  );
}

function ThesisRulesCard() {
  return (
    <div className="liquid-glass shrink-0 rounded-[2rem] p-6 md:p-7">
      <p className="text-xs uppercase tracking-[0.24em] text-muted">How To Implement</p>
      <h4 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-text-primary">
        Six install rules
      </h4>
      <div className="mt-5 grid gap-3">
        {thesisInstallRules.map((rule, index) => (
          <div key={rule} className="flex gap-3 rounded-2xl bg-white/35 p-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/45 text-[0.68rem] text-text-primary">
              {index + 1}
            </span>
            <p className="text-sm leading-6 text-text-primary">{rule}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ThesisDeepDiveReader({
  item,
  onClose,
  sectionRefs,
  onJump,
}: {
  item: DeepDiveItem;
  onClose: () => void;
  sectionRefs: MutableRefObject<Array<HTMLElement | null>>;
  onJump: (index: number) => void;
}) {
  return (
    <>
      <div className="liquid-glass-strong flex min-h-[78vh] flex-col rounded-[2rem] p-6 md:p-8 lg:h-full lg:p-10">
        <div className="flex items-center justify-between gap-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">{item.eyebrow}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.22em] text-muted">
              {item.readTime} / {item.year}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="liquid-glass-control rounded-full px-5 py-3 text-sm text-text-primary transition-transform duration-300 hover:scale-105"
          >
            Close
          </button>
        </div>

        <div className="mt-9 overflow-y-auto pr-1 lg:pr-4">
          <p className="text-xs uppercase tracking-[0.24em] text-muted">Identity, Bio & AI PM Thesis</p>
          <h2 className="mt-5 max-w-3xl font-body text-5xl font-semibold tracking-[-0.045em] text-text-primary md:text-7xl">
            AI-Native <span className="font-display italic font-normal">Product OS</span>
          </h2>
          <p className="mt-7 max-w-3xl text-base leading-8 text-muted md:text-lg">{item.dek}</p>

          <div className="mt-8 rounded-[1.75rem] bg-white/30 p-5 md:p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">Operating Definition</p>
            <p className="mt-4 text-sm leading-7 text-text-primary md:text-base">
              An AI Product Manager uses AI to research, design, and build AI-native features every single day.
              They architect trust, cost efficiency, defensibility, context, governance, and orchestration into
              production systems from the beginning.
            </p>
          </div>

          <div className="mt-12 space-y-12 pb-8">
            {item.sections.map((section, index) => {
              const [sectionType, sectionTitle] = section.heading.includes(' - ')
                ? section.heading.split(' - ')
                : ['Thesis', section.heading];

              return (
                <section
                  key={section.heading}
                  ref={(element) => {
                    sectionRefs.current[index] = element;
                  }}
                  className="scroll-mt-8 border-t border-stroke/70 pt-10 first:border-t-0 first:pt-0"
                >
                  <p className="text-xs uppercase tracking-[0.24em] text-muted">
                    {String(index + 1).padStart(2, '0')} / {sectionType}
                  </p>
                  <h3 className="mt-3 max-w-2xl font-body text-3xl font-semibold tracking-[-0.035em] text-text-primary md:text-5xl">
                    {sectionTitle}
                  </h3>
                  <div className="mt-6 space-y-5">
                    {section.body.map((paragraph) => (
                      <p key={paragraph} className="text-sm leading-7 text-muted md:text-base md:leading-8">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>

      <aside className="deep-dive-support-rail flex flex-col gap-4 lg:h-full lg:overflow-y-auto lg:pr-1">
        <div className="liquid-glass-strong shrink-0 rounded-[2rem] p-6 md:p-7">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted">Reading Map</p>
              <h3 className="mt-4 font-body text-3xl font-semibold tracking-[-0.04em] text-text-primary">
                {item.status}
              </h3>
            </div>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/45 font-display italic text-text-primary">
              OS
            </span>
          </div>

          <div className="mt-7 grid gap-2">
            {item.index.map((label, index) => (
              <button
                type="button"
                key={label}
                onClick={() => onJump(index)}
                className="liquid-glass flex items-center justify-between rounded-full px-4 py-3 text-left text-sm text-muted transition-transform duration-300 hover:scale-[1.02] hover:text-text-primary"
              >
                <span>{label}</span>
                <span>{String(index + 1).padStart(2, '0')}</span>
              </button>
            ))}
          </div>
        </div>

        <StackDiagramCard />
        <LoopDiagramCard />
        <ConsequencesCard />
        <TradeoffsCard />
        <ThesisRulesCard />
        <ImprovementGapsCard />
        <DefensibilityCard />
        <GovernanceCard />

        <div className="grid shrink-0 gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {item.metadata.map((card) => (
            <div key={card.label} className="liquid-glass rounded-[1.5rem] p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">{card.label}</p>
              <p className="mt-4 text-sm leading-7 text-text-primary">{card.value}</p>
            </div>
          ))}
        </div>

        {item.proofChips.length ? (
          <div className="liquid-glass rounded-[2rem] p-6 md:p-7">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">Proof Chips</p>
            <div className="mt-5 grid gap-3">
              {item.proofChips.map((chip) => (
                <div key={`${chip.label}-${chip.value}`} className="border-b border-stroke/70 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-medium text-text-primary">{chip.label}</p>
                    <span className="shrink-0 text-[0.62rem] uppercase tracking-[0.18em] text-muted">
                      {formatSourceStatus(chip.sourceStatus)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">{chip.value}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {item.sourceLinks.length ? (
          <div className="liquid-glass rounded-[2rem] p-6 md:p-7">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">Source Links</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {item.sourceLinks.map((source) => (
                <a
                  key={source.href}
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-white/45 px-4 py-2 text-xs text-text-primary transition duration-300 hover:bg-white/75"
                >
                  {source.label}
                </a>
              ))}
            </div>
          </div>
        ) : null}

        {item.assetSlots.length ? (
          <div className="liquid-glass rounded-[2rem] p-6 md:p-7">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">Asset Slots</p>
            <div className="mt-5 grid gap-3">
              {item.assetSlots.map((slot) => (
                <AssetSlotCard key={slot.label} slot={slot} />
              ))}
            </div>
          </div>
        ) : null}

        <div className="liquid-glass mt-auto rounded-[2rem] p-6 md:p-7">
          <p className="text-xs uppercase tracking-[0.24em] text-muted">Connects To</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {item.related.map((related) => (
              <span key={related} className="rounded-full bg-white/45 px-4 py-2 text-xs text-text-primary">
                {related}
              </span>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}

function DeepDiveOverlay({ item, onClose }: { item: DeepDiveItem; onClose: () => void }) {
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const isThesis = item.slug === 'ai-native-product-os';

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleJump = (index: number) => {
    sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] overflow-y-auto px-3 py-3 text-text-primary sm:px-5 sm:py-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <button
        type="button"
        aria-label="Close deep dive"
        className="absolute inset-0 bg-bg/20 backdrop-blur-[3px]"
        onClick={onClose}
      />

      <motion.article
        layoutId={`deep-dive-${item.slug}`}
        className={`relative mx-auto min-h-[calc(100vh-1.5rem)] max-w-[1320px] gap-4 lg:h-[calc(100vh-2.5rem)] lg:min-h-0 ${
          isThesis ? 'grid lg:grid-cols-[52fr_48fr]' : 'flex flex-col lg:flex-row'
        }`}
      >
        {isThesis ? (
          <ThesisDeepDiveReader item={item} onClose={onClose} sectionRefs={sectionRefs} onJump={handleJump} />
        ) : (
          <>
            <div className="liquid-glass-strong flex min-h-[70vh] flex-col rounded-[2rem] p-6 md:p-8 lg:h-full lg:w-[58%] lg:p-10">
              <div className="flex items-center justify-between gap-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted">{item.eyebrow}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.22em] text-muted">
                    {item.readTime} / {item.year}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="liquid-glass-control rounded-full px-5 py-3 text-sm text-text-primary transition-transform duration-300 hover:scale-105"
                >
                  Close
                </button>
              </div>

              <div className="mt-12 overflow-y-auto pr-1 lg:pr-4">
                <h2 className="max-w-2xl font-body text-5xl font-semibold tracking-[-0.04em] text-text-primary md:text-7xl">
                  {item.title}
                </h2>
                <p className="mt-7 max-w-2xl text-base leading-8 text-muted md:text-lg">{item.dek}</p>

                <div className="mt-12 space-y-12 pb-8">
                  {item.sections.map((section, index) => (
                    <section
                      key={section.heading}
                      ref={(element) => {
                        sectionRefs.current[index] = element;
                      }}
                      className="scroll-mt-8"
                    >
                      <p className="text-xs uppercase tracking-[0.24em] text-muted">
                        {String(index + 1).padStart(2, '0')}
                      </p>
                      <h3 className="mt-3 font-body text-3xl font-semibold tracking-[-0.03em] text-text-primary md:text-4xl">
                        {section.heading}
                      </h3>
                      <div className="mt-5 space-y-5">
                        {section.body.map((paragraph) => (
                          <p key={paragraph} className="text-sm leading-7 text-muted md:text-base md:leading-8">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            </div>

            <aside className="deep-dive-support-rail flex flex-col gap-4 lg:h-full lg:w-[42%] lg:overflow-y-auto lg:pr-1">
              <div className="liquid-glass-strong rounded-[2rem] p-6 md:p-7">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-muted">Reading Map</p>
                    <h3 className="mt-4 font-body text-3xl font-semibold tracking-[-0.04em] text-text-primary">
                      {item.status}
                    </h3>
                  </div>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/45 font-display italic text-text-primary">
                    RH
                  </span>
                </div>

                <div className="mt-7 grid gap-2">
                  {item.index.map((label, index) => (
                    <button
                      type="button"
                      key={label}
                      onClick={() => handleJump(index)}
                      className="liquid-glass flex items-center justify-between rounded-full px-4 py-3 text-left text-sm text-muted transition-transform duration-300 hover:scale-[1.02] hover:text-text-primary"
                    >
                      <span>{label}</span>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {item.metadata.map((card) => (
                  <div key={card.label} className="liquid-glass rounded-[1.5rem] p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-muted">{card.label}</p>
                    <p className="mt-4 text-sm leading-7 text-text-primary">{card.value}</p>
                  </div>
                ))}
              </div>

              {item.proofChips.length ? (
                <div className="liquid-glass rounded-[2rem] p-6 md:p-7">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted">Proof Chips</p>
                  <div className="mt-5 grid gap-3">
                    {item.proofChips.map((chip) => (
                      <div key={`${chip.label}-${chip.value}`} className="border-b border-stroke/70 pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-sm font-medium text-text-primary">{chip.label}</p>
                          <span className="shrink-0 text-[0.62rem] uppercase tracking-[0.18em] text-muted">
                            {formatSourceStatus(chip.sourceStatus)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted">{chip.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {item.sourceLinks.length ? (
                <div className="liquid-glass rounded-[2rem] p-6 md:p-7">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted">Source Links</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {item.sourceLinks.map((source) => (
                      <a
                        key={source.href}
                        href={source.href}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-white/45 px-4 py-2 text-xs text-text-primary transition duration-300 hover:bg-white/75"
                      >
                        {source.label}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              {item.assetSlots.length ? (
                <div className="liquid-glass rounded-[2rem] p-6 md:p-7">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted">Asset Slots</p>
                  <div className="mt-5 grid gap-3">
                    {item.assetSlots.map((slot) => (
                      <AssetSlotCard key={slot.label} slot={slot} />
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="liquid-glass mt-auto rounded-[2rem] p-6 md:p-7">
                <p className="text-xs uppercase tracking-[0.24em] text-muted">Connects To</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {item.related.map((related) => (
                    <span key={related} className="rounded-full bg-white/45 px-4 py-2 text-xs text-text-primary">
                      {related}
                    </span>
                  ))}
                </div>
              </div>
            </aside>
          </>
        )}
      </motion.article>
    </motion.div>
  );
}

function ProjectVisualSlot({
  label,
  value,
  alt,
}: {
  label: string;
  value: string | PlaceholderLike;
  alt: string;
}) {
  const isPlaceholder = isPlaceholderValue(value);

  return (
    <div>
      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted">{label}</p>
      <div className="relative mt-3 flex aspect-[16/8] items-center justify-center overflow-hidden rounded-[1.25rem] border border-white/35 bg-white/25 text-sm text-muted">
        {isPlaceholder ? (
          <span>{value.label}</span>
        ) : (
          <>
            <img
              src={value}
              alt={alt}
              loading="lazy"
              decoding="async"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-bg/10 via-transparent to-bg/20" />
          </>
        )}
      </div>
    </div>
  );
}

function ProjectLink({
  label,
  value,
}: {
  label: string;
  value: string | PlaceholderLike;
}) {
  if (isPlaceholderValue(value)) return <ContentToken value={value} />;

  return (
    <a
      href={value}
      target="_blank"
      rel="noreferrer"
      className="rounded-full bg-white/55 px-3 py-1.5 text-xs text-text-primary transition duration-300 hover:bg-white/80"
    >
      {label}
    </a>
  );
}

function ProjectField({
  label,
  value,
}: {
  label: string;
  value: string | PlaceholderLike;
}) {
  return (
    <div className="rounded-[1.1rem] bg-white/30 p-4">
      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className={`mt-3 text-sm leading-6 ${isPlaceholderValue(value) ? 'text-muted' : 'text-text-primary'}`}>
        {contentValue(value)}
      </p>
    </div>
  );
}

function PersonalProjectCard({
  project,
  index,
  groupLabel,
  onOpen,
}: {
  project: PersonalProjectEntry;
  index: number;
  groupLabel: string;
  onOpen: (item: CaseStudyEntry) => void;
}) {
  const reader = getProjectReader(project.projectName);

  return (
    <motion.article
      className="liquid-glass rounded-[1.75rem] p-5 md:p-6"
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay: Math.min(index * 0.04, 0.18) }}
      viewport={{ once: true, margin: '-80px' }}
    >
      <div className="grid gap-5 lg:grid-cols-[12rem_minmax(0,1fr)_auto] lg:items-center">
        <ProjectVisualSlot label="Main picture / GIF" value={project.mainPictureGif} alt={project.projectName} />

        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-white/45 px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-muted">
              {groupLabel}
            </span>
            <span className="rounded-full bg-white/55 px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-text-primary">
              {project.type}
            </span>
          </div>
          <h3 className="mt-4 text-3xl font-semibold leading-none tracking-[-0.045em] text-text-primary md:text-4xl">
            {project.projectName}
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{contentValue(project.briefDescription)}</p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (reader) onOpen(reader);
          }}
          disabled={!reader}
          className="inline-flex items-center justify-center rounded-full bg-white/70 px-5 py-3 text-sm text-text-primary transition duration-300 enabled:hover:bg-text-primary enabled:hover:text-bg disabled:cursor-not-allowed disabled:opacity-55"
        >
          {reader ? 'Open reader' : 'Write-up needed'}
        </button>
      </div>

      <details className="mt-5 group/project [&>summary::-webkit-details-marker]:hidden">
        <summary className="flex cursor-pointer items-center justify-between gap-4 rounded-full bg-white/35 px-4 py-3 text-sm text-text-primary">
          Project structure
          <span className="text-xs uppercase tracking-[0.16em] text-muted group-open/project:hidden">Expand</span>
          <span className="hidden text-xs uppercase tracking-[0.16em] text-muted group-open/project:inline">Collapse</span>
        </summary>

        <div className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-5">
            <ProjectVisualSlot label="Secondary picture" value={project.secondaryPicture} alt={`${project.projectName} secondary`} />
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted">Technical stack</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {project.technicalStack.map((item, stackIndex) => (
                  <ContentToken key={`${project.projectName}-stack-${stackIndex}`} value={item} />
                ))}
              </div>
            </div>

            {project.domainExpertisePartner ? (
              <div className="rounded-[1.25rem] bg-white/30 p-4">
                <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted">Domain expertise partner</p>
                <div className="mt-3 flex gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-dashed border-stroke/80 text-[0.58rem] uppercase leading-4 tracking-[0.12em] text-muted">
                    {contentValue(project.domainExpertisePartner.partnerPicture)}
                  </span>
                  <p className="text-sm leading-6 text-muted">
                    {contentValue(project.domainExpertisePartner.shortBio)}
                  </p>
                </div>
              </div>
            ) : null}

            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted">Links</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <ProjectLink label="Live link" value={project.liveLink} />
                <ProjectLink label="GitHub" value={project.githubLink} />
                <ProjectLink label="Full write-up" value={project.fullWriteupLink} />
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <ProjectField label="Problem" value={project.problem} />
            <ProjectField label="Architecture" value={project.architecture} />
            <ProjectField label="Why this approach" value={project.whyThisApproach} />
            <ProjectField label="Tradeoffs" value={project.tradeoffs} />
            <ProjectField label="What I would improve" value={project.whatIWouldImprove} />
          </div>
        </div>
      </details>
    </motion.article>
  );
}

function ProjectGroup({
  label,
  eyebrow,
  projects,
  onOpen,
}: {
  label: string;
  eyebrow: string;
  projects: readonly PersonalProjectEntry[];
  onOpen: (item: CaseStudyEntry) => void;
}) {
  return (
    <div className="grid gap-3">
      <div className="flex flex-col gap-4 border-t border-stroke/70 pt-6 first:border-t-0 first:pt-0 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted">{eyebrow}</p>
          <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-text-primary md:text-4xl">
            {label}
          </h3>
        </div>
        <span className="rounded-full bg-white/40 px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-muted">
          {projects.length} entries
        </span>
      </div>

      {projects.map((project, index) => (
        <PersonalProjectCard
          key={project.projectName}
          project={project}
          index={index}
          groupLabel={label}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}

function ArchitectureAcrossToolsPanel() {
  const architecture = portfolioContent.personalProjects.architectureAcrossTools;

  return (
    <details className="liquid-glass-strong rounded-[2rem] p-6 md:p-8 [&>summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-muted">Expandable architecture subsection</p>
          <h3 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-text-primary md:text-4xl">
            {architecture.title}
          </h3>
        </div>
        <span className="rounded-full bg-white/45 px-4 py-2 text-xs uppercase tracking-[0.18em] text-muted">
          Expand layers
        </span>
      </summary>

      <div className="mt-7 grid gap-3 md:grid-cols-5">
        {architecture.layers.map((layer, index) => (
          <div key={layer.layer} className="rounded-[1.15rem] bg-white/32 p-4">
            <p className="text-[0.62rem] uppercase tracking-[0.16em] text-muted">
              {String(index + 1).padStart(2, '0')}
            </p>
            <p className="mt-3 text-base font-semibold text-text-primary">{layer.layer}</p>
            <p className="mt-3 text-xs leading-5 text-text-primary">{contentValue(layer.purpose)}</p>
            <p className="mt-3 text-xs leading-5 text-muted">{contentValue(layer.examples)}</p>
          </div>
        ))}
      </div>
    </details>
  );
}

function CaseStudyGrid({ onOpen }: { onOpen: (item: CaseStudyEntry) => void }) {
  const { selfware, tools } = portfolioContent.personalProjects;

  return (
    <section id="projects" className="bg-transparent py-12 md:py-16">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        <SectionHeader
          sectionNumber="03"
          eyebrow="Projects"
          prefix="Personal Projects"
          italic="tools and selfware"
          copy="Selfware and tools presented as one consistent project system: every item has the same UX structure, with deeper readers where the write-up already exists."
        />

        <div className="grid gap-8">
          <ProjectGroup label="Selfware" eyebrow="Apps, web apps, and agents" projects={selfware} onOpen={onOpen} />
          <ProjectGroup label="Tools" eyebrow="Operating systems, workflows, dashboards, and pipelines" projects={tools} onOpen={onOpen} />
          <ArchitectureAcrossToolsPanel />
        </div>
      </div>
    </section>
  );
}

function CaseStudyOverlay({ item, onClose }: { item: CaseStudyEntry; onClose: () => void }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] overflow-y-auto px-3 py-3 text-text-primary sm:px-5 sm:py-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <button
        type="button"
        aria-label="Close case study"
        className="absolute inset-0 bg-bg/20 backdrop-blur-[3px]"
        onClick={onClose}
      />

      <motion.article className="relative mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1320px] gap-4 lg:h-[calc(100vh-2.5rem)] lg:min-h-0 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="deep-dive-support-rail liquid-glass-strong flex min-h-[56vh] flex-col overflow-hidden rounded-[2rem] lg:h-full lg:overflow-y-auto">
          <div className="relative min-h-[280px] flex-1 bg-[radial-gradient(circle_at_30%_18%,rgba(255,255,255,0.78),rgba(187,210,230,0.45)_38%,rgba(77,106,136,0.55)_100%)]">
            {item.heroImage ? (
              <img
                src={item.heroImage}
                alt={item.title}
                decoding="async"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_20%,rgba(255,255,255,0.86),rgba(137,170,204,0.42)_40%,rgba(31,49,78,0.68)_100%)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <p className="text-xs uppercase tracking-[0.28em] text-muted">{item.eyebrow}</p>
              <h2 className="mt-4 font-body text-5xl font-semibold tracking-[-0.04em] text-text-primary md:text-7xl">
                {item.title}
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-muted md:text-base">{item.summary}</p>
            </div>
          </div>

          <div className="grid shrink-0 gap-3 p-6 md:grid-cols-3 md:p-8 lg:grid-cols-1 xl:grid-cols-3">
            {item.chips.map((chip) => (
              <div key={`${chip.label}-${chip.value}`} className="liquid-glass rounded-[1.35rem] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">{chip.label}</p>
                  {chip.sourceStatus ? (
                    <span className="text-[0.58rem] uppercase tracking-[0.16em] text-muted/80">
                      {formatSourceStatus(chip.sourceStatus)}
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm leading-6 text-text-primary">{chip.value}</p>
              </div>
            ))}
          </div>

          <div className="grid shrink-0 gap-4 px-6 pb-6 md:px-8 md:pb-8">
            <div className="liquid-glass rounded-[1.5rem] p-5 md:p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">Structure</p>
              <div className="mt-5 grid gap-3">
                {item.structure.map((detail) => (
                  <div key={`${detail.label}-${detail.value}`} className="flex gap-3 rounded-2xl bg-white/35 p-3">
                    <span className="shrink-0 rounded-full bg-white/45 px-3 py-1 text-[0.62rem] uppercase tracking-[0.16em] text-muted">
                      {detail.label}
                    </span>
                    <p className="text-sm leading-6 text-text-primary">{detail.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="liquid-glass rounded-[1.5rem] p-5 md:p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">Evidence</p>
              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl bg-white/35 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Status</p>
                  <p className="mt-2 text-sm leading-6 text-text-primary">
                    {item.status} / {formatSourceStatus(item.sourceStatus)}
                  </p>
                </div>

                {item.links.length ? (
                  <div className="rounded-2xl bg-white/35 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">Source links</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.links.map((link) => (
                        <a
                          key={`${item.id}-${link.href}`}
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full bg-white/45 px-3 py-1.5 text-xs text-text-primary transition duration-300 hover:bg-white/75"
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}

                {item.assetSlots.length ? (
                  <div className="rounded-2xl bg-white/35 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">Next assets</p>
                    <div className="mt-3 grid gap-3">
                      {item.assetSlots.map((slot) => (
                        <div key={`${item.id}-${slot.label}`}>
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-text-primary">{slot.label}</p>
                            {slot.sourceStatus ? (
                              <span className="text-[0.58rem] uppercase tracking-[0.16em] text-muted/80">
                                {formatSourceStatus(slot.sourceStatus)}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-sm leading-6 text-muted">{slot.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </aside>

        <div className="liquid-glass-strong flex flex-col rounded-[2rem] p-6 md:p-8 lg:min-h-0">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">{item.typeLabel}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.22em] text-muted">
                {item.readTime} / {item.year}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="liquid-glass-control rounded-full px-5 py-3 text-sm text-text-primary transition-transform duration-300 hover:scale-105"
            >
              Close
            </button>
          </div>

          <div className="mt-8 overflow-y-auto pr-1 lg:pr-4">
            <div className="grid gap-5">
              {item.sections.map((section, index) => (
                <section key={`${item.id}-${section.label}`} className="liquid-glass rounded-[1.5rem] p-5 md:p-6">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted">
                    {String(index + 1).padStart(2, '0')} / {section.label}
                  </p>
                  <div className="mt-4 space-y-4">
                    {section.body.map((paragraph) => (
                      <p key={paragraph} className="text-sm leading-7 text-text-primary md:text-base">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {item.related.length ? (
              <div className="mt-5 liquid-glass rounded-[1.5rem] p-5 md:p-6">
                <p className="text-xs uppercase tracking-[0.22em] text-muted">Connects To</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {item.related.map((related) => (
                    <span key={`${item.id}-${related}`} className="rounded-full bg-white/45 px-4 py-2 text-xs text-text-primary">
                      {related}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
}

function WorkCaseStudyOverlay({ item, onClose }: { item: WorkItem; onClose: () => void }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const caseSections = [
    { label: 'Problem', body: item.problem },
    { label: 'Architecture', body: item.architecture },
    { label: 'Why this approach', body: item.approach },
    { label: 'Tradeoffs', body: item.tradeoffs },
    { label: 'Demo / proof', body: item.proof },
    { label: 'What I would improve', body: item.improve },
  ];
  const governanceChip =
    item.chips.find((chip) => /governance|privacy|human|proof/i.test(chip.label)) ?? item.chips[1] ?? item.chips[0];

  return (
    <motion.div
      className="fixed inset-0 z-[100] overflow-y-auto px-3 py-3 text-text-primary sm:px-5 sm:py-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <button
        type="button"
        aria-label="Close project case study"
        className="absolute inset-0 bg-bg/20 backdrop-blur-[3px]"
        onClick={onClose}
      />

      <motion.article
        layoutId={`work-case-${item.title}`}
        className="relative mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1320px] gap-4 lg:h-[calc(100vh-2.5rem)] lg:min-h-0 lg:grid-cols-[0.9fr_1.1fr]"
      >
        <div className="deep-dive-support-rail liquid-glass-strong flex min-h-[58vh] flex-col overflow-hidden rounded-[2rem] lg:h-full lg:overflow-y-auto">
          <div className="relative min-h-[280px] flex-1 bg-[radial-gradient(circle_at_30%_18%,rgba(255,255,255,0.78),rgba(187,210,230,0.45)_38%,rgba(77,106,136,0.55)_100%)]">
            <img
              src={item.image}
              alt={item.title}
              decoding="async"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/28 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <p className="text-xs uppercase tracking-[0.28em] text-muted">{item.tag}</p>
              <h2 className="mt-4 font-body text-5xl font-semibold tracking-[-0.04em] text-text-primary md:text-7xl">
                {item.title}
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-muted md:text-base">{item.summary}</p>
            </div>
          </div>

          <div className="grid shrink-0 gap-3 p-6 md:grid-cols-3 md:p-8 lg:grid-cols-1 xl:grid-cols-3">
            {item.chips.map((chip) => (
              <div key={chip.label} className="liquid-glass rounded-[1.35rem] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">{chip.label}</p>
                  <span className="text-[0.58rem] uppercase tracking-[0.16em] text-muted/80">
                    {formatSourceStatus(chip.sourceStatus)}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-text-primary">{chip.value}</p>
              </div>
            ))}
          </div>

          <div className="grid shrink-0 gap-4 px-6 pb-6 md:px-8 md:pb-8">
            <div className="liquid-glass rounded-[1.5rem] p-5 md:p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">Architecture Chips</p>
              <div className="mt-5 grid gap-3">
                {item.architectureChips.map((chip) => (
                  <div key={chip.label} className="flex gap-3 rounded-2xl bg-white/35 p-3">
                    <span className="shrink-0 rounded-full bg-white/45 px-3 py-1 text-[0.62rem] uppercase tracking-[0.16em] text-muted">
                      {chip.label}
                    </span>
                    <p className="text-sm leading-6 text-text-primary">{chip.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="liquid-glass rounded-[1.5rem] p-5 md:p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">Proof Stack</p>
              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl bg-white/35 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Public proof</p>
                  <p className="mt-2 text-sm leading-6 text-text-primary">
                    {item.links.length ? item.links.map((link) => link.label).join(' / ') : item.proof[0]}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/35 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Technical layer</p>
                  <p className="mt-2 text-sm leading-6 text-text-primary">
                    {item.architectureChips
                      .slice(0, 3)
                      .map((chip) => chip.label)
                      .join(' / ')}
                  </p>
                </div>
                {governanceChip ? (
                  <div className="rounded-2xl bg-white/35 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">Trust layer</p>
                    <p className="mt-2 text-sm leading-6 text-text-primary">{governanceChip.value}</p>
                  </div>
                ) : null}
                <div className="rounded-2xl bg-white/35 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Next asset needed</p>
                  <p className="mt-2 text-sm leading-6 text-text-primary">{item.assetRequest}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="liquid-glass-strong flex flex-col rounded-[2rem] p-6 md:p-8 lg:min-h-0">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Case Study</p>
              <p className="mt-2 text-xs uppercase tracking-[0.22em] text-muted">
                {formatSourceStatus(item.sourceStatus)}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="liquid-glass-control rounded-full px-5 py-3 text-sm text-text-primary transition-transform duration-300 hover:scale-105"
            >
              Close
            </button>
          </div>

          <div className="mt-8 overflow-y-auto pr-1 lg:pr-4">
            <div className="grid gap-5">
              {caseSections.map((section, index) => (
                <section key={section.label} className="liquid-glass rounded-[1.5rem] p-5 md:p-6">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted">
                    {String(index + 1).padStart(2, '0')} / {section.label}
                  </p>
                  <div className="mt-4 space-y-4">
                    {section.body.map((paragraph) => (
                      <p key={paragraph} className="text-sm leading-7 text-text-primary md:text-base">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {item.links.length ? (
              <div className="mt-5 liquid-glass rounded-[1.5rem] p-5 md:p-6">
                <p className="text-xs uppercase tracking-[0.22em] text-muted">Source Links</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {item.links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-white/45 px-4 py-2 text-xs text-text-primary transition duration-300 hover:bg-white/75"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
}

function TeachingCard({ entry, index }: { entry: TeachingEntry; index: number }) {
  return (
    <motion.article
      className="liquid-glass rounded-[1.5rem] p-5 md:p-6"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.04 }}
      viewport={{ once: true, margin: '-80px' }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted">Course</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-text-primary md:text-3xl">
            {entry.courseTitle}
          </h3>
          <p className="mt-3 text-sm leading-6 text-muted">{contentValue(entry.courseDescription)}</p>
        </div>
        <ContentToken value={entry.tag} />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-[0.9fr_1.1fr]">
        <ProjectField label="Course trailer" value={entry.courseTrailer} />
        <div className="rounded-[1.1rem] bg-white/30 p-4">
          <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted">Course modules</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {entry.courseModules.map((module, moduleIndex) => (
              <ContentToken key={`${entry.courseTitle}-module-${moduleIndex}`} value={module} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <ProjectLink label="Course link" value={entry.courseLink} />
      </div>
    </motion.article>
  );
}

function SpeakingCard({ entry, index }: { entry: SpeakingEntry; index: number }) {
  return (
    <motion.article
      className="liquid-glass rounded-[1.5rem] p-5 md:p-6"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.04 }}
      viewport={{ once: true, margin: '-80px' }}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,0.55fr)]">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted">Talk</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-text-primary md:text-3xl">
            {entry.talkTitle}
          </h3>
          <p className="mt-3 text-sm leading-6 text-muted">{contentValue(entry.talkDescription)}</p>
        </div>
        <div className="rounded-[1.1rem] bg-white/30 p-4">
          <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted">Invited by</p>
          <p className="mt-3 text-sm leading-6 text-text-primary">{contentValue(entry.invitedBy)}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <ProjectLink label="YouTube / talk link" value={entry.youtubeEmbeddedLink} />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function BookCard({ book, index }: { book: BookEntry; index: number }) {
  return (
    <motion.article
      className="liquid-glass rounded-[1.5rem] p-5 md:p-6"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.04 }}
      viewport={{ once: true, margin: '-80px' }}
    >
      <div className="grid gap-5 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <ProjectVisualSlot label="Book image" value={book.bookImage} alt={book.bookName} />
        <div>
          <div className="flex flex-wrap gap-2">
            <ContentToken value={book.bookType} />
          </div>
          <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-text-primary md:text-3xl">
            {book.bookName}
          </h3>
          <p className="mt-3 text-sm leading-6 text-muted">{contentValue(book.bookDescription)}</p>
          {book.bookVideo ? <div className="mt-4"><ProjectField label="Book video" value={book.bookVideo} /></div> : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <ProjectLink label="Purchase link" value={book.purchaseLink} />
            {book.previewLink ? <ProjectLink label="Preview link" value={book.previewLink} /> : null}
            {book.summaryLink ? <ProjectLink label="Summary link" value={book.summaryLink} /> : null}
            {book.fullText ? <ProjectLink label="Full text" value={book.fullText} /> : null}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function ArticleCard({ article, index }: { article: ArticleEntry; index: number }) {
  const horizontalStages = 'horizontalStages' in article ? article.horizontalStages : undefined;

  return (
    <motion.article
      className="liquid-glass rounded-[1.5rem] p-5 md:p-6"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.04 }}
      viewport={{ once: true, margin: '-80px' }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted">Article</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-text-primary md:text-3xl">
            {article.articleTitle}
          </h3>
          <p className="mt-3 text-sm leading-6 text-muted">{contentValue(article.articleContent)}</p>
        </div>
        <ContentToken value={article.articleDiagram} />
      </div>

      <div className="mt-5">
        <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted">Article sub-headings</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {article.articleSubHeadings.map((heading, headingIndex) => (
            <ContentToken key={`${article.articleTitle}-heading-${headingIndex}`} value={heading} />
          ))}
        </div>
      </div>

      {horizontalStages ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-5">
          {horizontalStages.map((stage, stageIndex) => (
            <div key={contentValue(stage)} className="border-t border-stroke/60 pt-4">
              <p className="text-[0.62rem] uppercase tracking-[0.16em] text-muted">
                {String(stageIndex + 1).padStart(2, '0')}
              </p>
              <p className="mt-4 text-sm font-medium text-text-primary">{contentValue(stage)}</p>
            </div>
          ))}
        </div>
      ) : null}
    </motion.article>
  );
}

function AiNativeProductOsWriting({ onOpen }: { onOpen: (item: CaseStudyEntry) => void }) {
  const os = portfolioContent.teachingSpeakingWriting.writing.aiNativeProductOs;
  const thesisReader = caseStudyByDeepDiveSlug.get('ai-native-product-os');

  return (
    <div className="liquid-glass-strong rounded-[2rem] p-6 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-muted">Writing / AI-Native Product OS</p>
          <h3 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-text-primary md:text-4xl">
            AI-Native Product OS
          </h3>
        </div>
        {thesisReader ? (
          <button
            type="button"
            onClick={() => onOpen(thesisReader)}
            className="rounded-full bg-white/55 px-4 py-2 text-xs uppercase tracking-[0.18em] text-text-primary transition duration-300 hover:bg-text-primary hover:text-bg"
          >
            Open thesis reader
          </button>
        ) : null}
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <ProjectField label="Problem" value={os.problem} />
        <ProjectField label="Architecture" value={os.architecture} />
        <ProjectField label="Why this approach" value={os.whyThisApproach} />
        <ProjectField label="Tradeoffs" value={os.tradeoffs} />
        <ProjectField label="What I would improve" value={os.whatIWouldImprove} />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[1.25rem] bg-white/30 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-muted">Workflow diagram</p>
          <div className="mt-4">
            <WorkflowDiagram steps={os.workflowDiagram} />
          </div>
        </div>
        <div className="rounded-[1.25rem] bg-white/30 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-muted">Layer lenses overview</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {os.layerLensesOverview.map((layer) => (
              <ContentToken key={layer} value={layer} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <ProjectLink label="Live link" value={os.liveLink} />
        <ProjectLink label="GitHub" value={os.githubLink} />
        <ProjectLink label="Full write-up" value={os.fullWriteupLink} />
      </div>
    </div>
  );
}

function WritingCaseStudyRow({
  entry,
  index,
  onOpen,
}: {
  entry: WritingCaseStudyEntry;
  index: number;
  onOpen: (item: CaseStudyEntry) => void;
}) {
  const reader = getProjectReader(entry.projectName);

  return (
    <motion.article
      className="liquid-glass rounded-[1.5rem] p-5 md:p-6"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.03 }}
      viewport={{ once: true, margin: '-80px' }}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted">Case study write-up</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-text-primary md:text-3xl">
            {entry.projectName}
          </h3>
          <p className="mt-3 text-sm leading-6 text-muted">{contentValue(entry.problem)}</p>
        </div>
        <button
          type="button"
          disabled={!reader}
          onClick={() => {
            if (reader) onOpen(reader);
          }}
          className="rounded-full bg-white/55 px-4 py-2 text-xs uppercase tracking-[0.18em] text-text-primary transition duration-300 enabled:hover:bg-text-primary enabled:hover:text-bg disabled:cursor-not-allowed disabled:opacity-55"
        >
          {reader ? 'Open reader' : 'Reader needed'}
        </button>
      </div>

      <details className="mt-4 [&>summary::-webkit-details-marker]:hidden">
        <summary className="cursor-pointer rounded-full bg-white/35 px-4 py-3 text-sm text-text-primary">
          Show write-up structure
        </summary>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <ProjectField label="Architecture" value={entry.architecture} />
          <ProjectField label="Why this approach" value={entry.whyThisApproach} />
          <ProjectField label="Tradeoffs" value={entry.tradeoffs} />
          <ProjectField label="What I would improve" value={entry.whatIWouldImprove} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <ProjectLink label="Live link" value={entry.liveLink} />
          <ProjectLink label="GitHub" value={entry.githubLink} />
          <ProjectLink label="Full write-up" value={entry.fullWriteupLink} />
        </div>
      </details>
    </motion.article>
  );
}

function ThoughtGroup({
  eyebrow,
  title,
  count,
  children,
}: {
  eyebrow: string;
  title: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-3">
      <div className="flex flex-col gap-4 border-t border-stroke/70 pt-6 first:border-t-0 first:pt-0 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted">{eyebrow}</p>
          <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-text-primary md:text-4xl">
            {title}
          </h3>
        </div>
        <span className="rounded-full bg-white/40 px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-muted">
          {count} entries
        </span>
      </div>
      {children}
    </div>
  );
}

function TeachingWritingShelf({ onOpen }: { onOpen: (item: CaseStudyEntry) => void }) {
  const { teaching, speaking, writing } = portfolioContent.teachingSpeakingWriting;

  return (
    <section id="teaching-speaking-writing" className="bg-transparent py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        <SectionHeader
          sectionNumber="04"
          eyebrow="Teaching, Speaking & Writing"
          prefix="Teaching, Speaking"
          italic="and writing"
          copy="Courses, talks, books, articles, the AI-Native Product OS thesis, and every project write-up, kept in one section with separate form factors."
        />

        <div className="grid gap-8">
          <ThoughtGroup eyebrow="Teaching" title="Courses" count={teaching.length}>
            {teaching.map((entry, index) => (
              <TeachingCard key={entry.courseTitle} entry={entry} index={index} />
            ))}
          </ThoughtGroup>

          <ThoughtGroup eyebrow="Speaking" title="Talks" count={speaking.length}>
            {speaking.map((entry, index) => (
              <SpeakingCard key={entry.talkTitle} entry={entry} index={index} />
            ))}
          </ThoughtGroup>

          <ThoughtGroup eyebrow="Writing / Sub-category 1" title="Books" count={writing.books.length}>
            {writing.books.map((book, index) => (
              <BookCard key={book.bookName} book={book} index={index} />
            ))}
          </ThoughtGroup>

          <ThoughtGroup eyebrow="Writing / Sub-category 2" title="Articles" count={writing.articles.length}>
            {writing.articles.map((article, index) => (
              <ArticleCard key={article.articleTitle} article={article} index={index} />
            ))}
          </ThoughtGroup>

          <ThoughtGroup eyebrow="Writing / Sub-category 3" title="AI-Native Product OS" count={1}>
            <AiNativeProductOsWriting onOpen={onOpen} />
          </ThoughtGroup>

          <ThoughtGroup eyebrow="Writing / Sub-category 4" title="Case studies" count={writing.caseStudies.length}>
            <div className="grid gap-3">
              {writing.caseStudies.map((entry, index) => (
                <WritingCaseStudyRow key={entry.projectName} entry={entry} index={index} onOpen={onOpen} />
              ))}
            </div>
          </ThoughtGroup>
        </div>
      </div>
    </section>
  );
}

function WorkflowDiagram({ steps }: { steps: readonly string[] }) {
  return (
    <ol className="grid gap-2 sm:grid-cols-5">
      {steps.map((step, index) => (
        <li key={step} className="rounded-[1.1rem] bg-white/35 p-3">
          <p className="text-[0.62rem] uppercase tracking-[0.16em] text-muted">
            {String(index + 1).padStart(2, '0')}
          </p>
          <p className="mt-2 text-sm font-medium leading-5 text-text-primary">{step}</p>
        </li>
      ))}
    </ol>
  );
}

function SystemLayerStack({ system }: { system: ToolSystemEntry }) {
  return (
    <div className="grid gap-3">
      {toolLayerColumns.map((label, index) => {
        const value = system[layerValueKeys[label]];

        return (
          <div
            key={`${system.title}-${label}`}
            className="grid gap-3 border-t border-stroke/60 pt-4 first:border-t-0 first:pt-0 md:grid-cols-[0.22fr_0.78fr]"
          >
            <div>
              <p className="text-[0.62rem] uppercase tracking-[0.16em] text-muted">
                {String(index + 1).padStart(2, '0')}
              </p>
              <p className="mt-2 text-sm font-medium text-text-primary">{label}</p>
            </div>
            <p className="text-sm leading-6 text-muted">{value}</p>
          </div>
        );
      })}
    </div>
  );
}

function ArchitectureCoverageMatrix() {
  return (
    <div className="liquid-glass-strong mt-5 rounded-[2rem] p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-muted">Layer coverage</p>
          <h3 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-text-primary md:text-4xl">
            Each tool is a different expression of the same architecture.
          </h3>
        </div>
        <span className="liquid-glass rounded-full px-4 py-2 text-xs uppercase tracking-[0.18em] text-muted">
          {toolsAndSystems.length} systems
        </span>
      </div>

      <div className="mt-7 overflow-x-auto pb-2">
        <div className="min-w-[980px]">
          <div className="grid grid-cols-[1.1fr_repeat(5,minmax(0,1fr))] gap-2 text-[0.62rem] uppercase tracking-[0.16em] text-muted">
            <span>System</span>
            {toolLayerColumns.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          <div className="mt-3 grid gap-2">
            {toolsAndSystems.map((system) => (
              <div
                key={`matrix-${system.title}`}
                className="grid grid-cols-[1.1fr_repeat(5,minmax(0,1fr))] gap-2"
              >
                <div className="rounded-[1rem] bg-white/40 p-3">
                  <p className="text-sm font-medium leading-5 text-text-primary">{system.title}</p>
                  <p className="mt-1 text-[0.62rem] uppercase tracking-[0.14em] text-muted">
                    {system.systemType}
                  </p>
                </div>
                {toolLayerColumns.map((label) => (
                  <div key={`${system.title}-${label}-matrix`} className="rounded-[1rem] bg-white/28 p-3">
                    <p className="line-clamp-3 text-xs leading-5 text-muted">{system[layerValueKeys[label]]}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolSystemCard({ system, index }: { system: ToolSystemEntry; index: number }) {
  return (
    <motion.article
      className="liquid-glass flex flex-col rounded-[1.75rem] p-6 md:p-7"
      initial={{ opacity: 0, y: 24 }}
      key={system.title}
      transition={{ duration: 0.7, delay: index * 0.04 }}
      viewport={{ once: true, margin: '-80px' }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">{system.systemType}</p>
          <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-text-primary md:text-3xl">
            {system.title}
          </h3>
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted/80">{system.layer}</p>
        </div>
        <span className="shrink-0 rounded-full bg-white/40 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.16em] text-muted">
          {formatSourceStatus(system.sourceStatus)}
        </span>
      </div>

      <p className="mt-5 text-sm leading-7 text-muted">{system.description}</p>

      <div className="mt-7">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">Workflow diagram</p>
        <div className="mt-4">
          <WorkflowDiagram steps={system.workflow} />
        </div>
      </div>

      <div className="mt-7">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">Layer lenses</p>
        <div className="mt-4">
          <SystemLayerStack system={system} />
        </div>
      </div>

      <div className="mt-auto pt-7">
        <div className="grid gap-3 border-t border-stroke/60 pt-5 md:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-[0.62rem] uppercase tracking-[0.16em] text-muted">Proof</p>
            <p className="mt-2 text-sm leading-6 text-text-primary">{system.proof}</p>
          </div>
          <div>
            <p className="text-[0.62rem] uppercase tracking-[0.16em] text-muted">Diagram slot</p>
            <p className="mt-2 text-sm leading-6 text-muted">{system.assetSlot}</p>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function ToolsSystemsPanel() {
  return (
    <section id="project-tools" className="bg-transparent py-12 md:py-16">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        <SectionHeader
          sectionNumber="02C"
          eyebrow="Projects / Tools"
          prefix="Tools"
          italic="and systems"
          copy="The tools branch of self-ware: agents, dashboards, pipelines, workflow loops, and reusable AI product infrastructure."
        />

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="liquid-glass-strong rounded-[2rem] p-7 md:p-8">
            <p className="text-xs uppercase tracking-[0.28em] text-muted">System logic</p>
            <h3 className="mt-6 max-w-xl font-body text-4xl font-semibold tracking-[-0.04em] text-text-primary md:text-5xl">
              Architecture is the work product.
            </h3>
            <p className="mt-6 text-sm leading-7 text-muted md:text-base">
              The tools branch is not a second project gallery. It shows the reusable machinery underneath the work: context loading, workflow orchestration, evals, guardrails, cost control, and human review boundaries.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {toolsSystemSignals.map((signal) => (
                <div key={signal.label} className="rounded-[1.1rem] bg-white/35 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">{signal.label}</p>
                  <p className="mt-3 text-sm leading-6 text-text-primary">{signal.detail}</p>
                  <p className="mt-3 text-[0.62rem] uppercase tracking-[0.16em] text-muted">{signal.proof}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="liquid-glass rounded-[2rem] p-7 md:p-8">
            <p className="text-xs uppercase tracking-[0.28em] text-muted">Reusable stack</p>
            <div className="mt-6 grid gap-4">
              {architectureLayers.map((layer, index) => (
                <div
                  key={layer.label}
                  className="grid gap-3 border-t border-stroke/60 pt-4 first:border-t-0 first:pt-0 md:grid-cols-[0.28fr_0.72fr]"
                >
                  <div>
                    <p className="text-[0.62rem] uppercase tracking-[0.16em] text-muted">
                      {String(index + 1).padStart(2, '0')}
                    </p>
                    <p className="mt-2 text-base font-medium text-text-primary">{layer.label}</p>
                  </div>
                  <div>
                    <p className="text-sm leading-6 text-text-primary">{layer.purpose}</p>
                    <p className="mt-2 text-xs leading-5 text-muted">{layer.examples}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <ArchitectureCoverageMatrix />

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {toolsAndSystems.map((system, index) => (
            <ToolSystemCard key={system.title} system={system} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkDetail({
  label,
  value,
}: {
  label: string;
  value: string | PlaceholderLike;
}) {
  const isPlaceholder = isPlaceholderValue(value);

  return (
    <div className="border-t border-stroke/70 pt-4">
      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className={`mt-2 text-sm leading-6 ${isPlaceholder ? 'text-muted' : 'text-text-primary'}`}>
        {contentValue(value)}
      </p>
    </div>
  );
}

function WorkDetailList({
  label,
  items,
}: {
  label: string;
  items: readonly (string | PlaceholderLike)[];
}) {
  return (
    <div className="border-t border-stroke/70 pt-4">
      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item, index) => (
          <ContentToken key={`${label}-${contentValue(item)}-${index}`} value={item} />
        ))}
      </div>
    </div>
  );
}

function ProductManagementWorkRow({
  entry,
  index,
}: {
  entry: ProductManagementWorkExperience;
  index: number;
}) {
  return (
    <motion.details
      className="group liquid-glass rounded-[1.5rem] p-0 [&>summary::-webkit-details-marker]:hidden"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.04 }}
      viewport={{ once: true, margin: '-80px' }}
      open={index === 0}
    >
      <summary className="grid cursor-pointer list-none gap-4 p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-6">
        <div className="flex min-w-0 gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.1rem] border border-dashed border-stroke/80 bg-white/30 px-2 text-center text-[0.58rem] uppercase leading-4 tracking-[0.12em] text-muted">
            {contentValue(entry.companyLogo)}
          </span>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.22em] text-muted">
              {String(index + 1).padStart(2, '0')} / {contentValue(entry.monthYearRangeWorked)}
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-text-primary md:text-3xl">
              {entry.companyName}
            </h3>
            <p className="mt-1 text-sm leading-6 text-muted">{contentValue(entry.jobTitle)}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <ContentToken value={entry.industryTag} />
          <ContentToken value={entry.marketType} />
          <span className="rounded-full border border-stroke/70 px-3 py-1.5 text-xs text-muted transition duration-300 group-open:bg-white/45 group-open:text-text-primary">
            View
          </span>
        </div>
      </summary>

      <div className="border-t border-stroke/70 px-5 pb-5 md:px-6 md:pb-6">
        <div className="grid gap-6 pt-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-5">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted">Product video</p>
              <div className="mt-3 flex aspect-[16/7] items-center justify-center rounded-[1.25rem] border border-dashed border-stroke/80 bg-white/25 text-sm text-muted">
                {contentValue(entry.productVideo)}
              </div>
            </div>

            <WorkDetail label="Company description" value={entry.companyDescription} />
            <WorkDetail label="Location" value={entry.location} />
            <WorkDetail label="Customers / client types and user numbers" value={entry.customerClientTypesAndUserNumbers} />
          </div>

          <div className="space-y-5">
            <WorkDetailList label="Products worked on" items={entry.productsWorkedOn} />
            <WorkDetailList label="Main achievements" items={entry.mainAchievements} />
            <WorkDetailList label="Processes introduced / managerial" items={entry.processesIntroducedManagerial} />
            <WorkDetailList label="Reviews" items={entry.reviews} />
          </div>
        </div>
      </div>
    </motion.details>
  );
}

function ProductManagementWorkList() {
  const { companies } = portfolioContent.productManagementWorkExperiences;

  return (
    <div className="space-y-4">
      {companies.map((entry, index) => (
        <ProductManagementWorkRow key={entry.companyName} entry={entry} index={index} />
      ))}
    </div>
  );
}

function ExperienceEducationSection() {
  const { intro } = portfolioContent.productManagementWorkExperiences;

  return (
    <section id="experience-education" className="bg-transparent py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        <SectionHeader
          sectionNumber="02"
          eyebrow="Experience & Education"
          prefix="Experience"
          italic="and education"
          copy={intro}
        />

        <div className="grid gap-10">
          <ProductManagementWorkList />
          <QualificationsStack />
        </div>
      </div>
    </section>
  );
}

function QualificationCard({ entry, index }: { entry: QualificationEntry; index: number }) {
  return (
    <motion.article
      className="liquid-glass rounded-[1.5rem] p-5 md:p-6"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.04 }}
      viewport={{ once: true, margin: '-80px' }}
    >
      <div className="grid gap-5 lg:grid-cols-[4.5rem_minmax(0,1fr)_auto] lg:items-start">
        <span className="flex h-16 w-16 items-center justify-center rounded-[1.1rem] border border-dashed border-stroke/80 bg-white/30 px-2 text-center text-[0.58rem] uppercase leading-4 tracking-[0.12em] text-muted">
          {contentValue(entry.institutionLogo)}
        </span>

        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted">{entry.institutionName}</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-text-primary md:text-3xl">
            {entry.qualification}
          </h3>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <ContentToken value={entry.qualificationType} />
          <ContentToken value={entry.gradeAchieved} />
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-[0.72fr_1.28fr]">
        <ProjectField label="Qualification type" value={entry.qualificationType} />
        <ProjectField label="How this has helped me as a PM" value={entry.howThisHasHelpedYouAsAPM} />
      </div>
    </motion.article>
  );
}

function CertificationCard({ entry, index }: { entry: CertificationEntry; index: number }) {
  return (
    <motion.article
      className="liquid-glass rounded-[1.5rem] p-5 md:p-6"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.04 }}
      viewport={{ once: true, margin: '-80px' }}
    >
      <div className="grid gap-5 lg:grid-cols-[4.5rem_minmax(0,1fr)_auto] lg:items-start">
        <span className="flex h-16 w-16 items-center justify-center rounded-[1.1rem] border border-dashed border-stroke/80 bg-white/30 px-2 text-center text-[0.58rem] uppercase leading-4 tracking-[0.12em] text-muted">
          {contentValue(entry.awardingBodyLogo)}
        </span>

        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted">{entry.awardingBodyName}</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-text-primary md:text-3xl">
            {entry.certificationName}
          </h3>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <ProjectLink label="Certification link" value={entry.certificationLink} />
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-[0.72fr_1.28fr]">
        <div className="rounded-[1.1rem] bg-white/30 p-4">
          <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted">Modules included</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {entry.modulesIncluded.map((module, moduleIndex) => (
              <ContentToken key={`${entry.certificationName}-module-${moduleIndex}`} value={module} />
            ))}
          </div>
        </div>
        <ProjectField label="How this has helped me as a PM" value={entry.howThisHasHelpedYouAsAPM} />
      </div>
    </motion.article>
  );
}

function QualificationsStack() {
  const { qualifications, certifications } = portfolioContent.qualifications;

  return (
    <div className="grid gap-8">
      <div className="grid gap-3">
        <div className="flex flex-col gap-4 border-t border-stroke/70 pt-6 first:border-t-0 first:pt-0 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted">Qualifications</p>
            <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-text-primary md:text-4xl">
              Formal education
            </h3>
          </div>
          <span className="rounded-full bg-white/40 px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-muted">
            {qualifications.length} entries
          </span>
        </div>

        {qualifications.map((entry, index) => (
          <QualificationCard key={entry.institutionName} entry={entry} index={index} />
        ))}
      </div>

      <div className="grid gap-3">
        <div className="flex flex-col gap-4 border-t border-stroke/70 pt-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted">Certifications</p>
            <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-text-primary md:text-4xl">
              Professional credentials
            </h3>
          </div>
          <span className="rounded-full bg-white/40 px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-muted">
            {certifications.length} entries
          </span>
        </div>

        {certifications.map((entry, index) => (
          <CertificationCard key={entry.certificationName} entry={entry} index={index} />
        ))}
      </div>
    </div>
  );
}

function AiRaminModal({ onClose }: { onClose: () => void }) {
  const chatbot = portfolioContent.aiRaminChatbot;
  const [selectedModel, setSelectedModel] = useState(chatbot.modelSelector[0]);
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[120] overflow-y-auto px-3 py-3 text-text-primary sm:px-5 sm:py-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <button
        type="button"
        aria-label="Close AI Ramin"
        className="absolute inset-0 bg-bg/25 backdrop-blur-[4px]"
        onClick={onClose}
      />

      <motion.article
        className="relative mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[980px] content-center"
        initial={{ y: 24, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 18, scale: 0.98 }}
        transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="liquid-glass-popout overflow-hidden rounded-[2rem]">
          <div className="border-b border-stroke/70 p-6 md:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex gap-4">
                  <span className="ai-ramin-avatar ai-ramin-avatar-large mt-1">
                    <img src={profileImageUrl} alt="" decoding="async" />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-muted">{chatbot.comingSoonState}</p>
                    <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-text-primary md:text-5xl">
                      {chatbot.modalTitle}
                    </h2>
                  </div>
                </div>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
                  Paste in a job or project and choose the model aesthetic. The real answer engine comes later; this shell is guarded to stay truthful to Ramin&apos;s actual skills and experience.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="liquid-glass-control rounded-full px-5 py-3 text-sm text-text-primary transition-transform duration-300 hover:scale-105"
              >
                Close
              </button>
            </div>
          </div>

          <div className="grid gap-5 p-6 md:p-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="grid gap-5">
              <div>
                <label htmlFor="ai-ramin-prompt" className="text-xs uppercase tracking-[0.22em] text-muted">
                  {chatbot.textarea.label}
                </label>
                <textarea
                  id="ai-ramin-prompt"
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder={chatbot.textarea.placeholder}
                  className="mt-3 min-h-48 w-full resize-none rounded-[1.35rem] border border-white/40 bg-white/45 p-5 text-sm leading-7 text-text-primary outline-none placeholder:text-muted/75 focus:border-white/80"
                />
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted">Model selector</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {chatbot.modelSelector.map((model) => {
                    const selected = model === selectedModel;
                    return (
                      <button
                        key={model}
                        type="button"
                        onClick={() => setSelectedModel(model)}
                        className={`rounded-full px-3 py-1.5 text-xs transition duration-300 ${
                          selected
                            ? 'bg-text-primary text-bg'
                            : 'bg-white/45 text-muted hover:bg-white/70 hover:text-text-primary'
                        }`}
                      >
                        {model}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                disabled
                className="rounded-full bg-text-primary px-6 py-3.5 text-sm text-bg opacity-55"
              >
                {chatbot.comingSoonState}
              </button>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[1.5rem] bg-white/30 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-muted">Selected model</p>
                <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-text-primary">{selectedModel}</p>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {prompt ? 'Prompt captured locally in the modal only.' : 'Waiting for a job or project prompt.'}
                </p>
              </div>

              <div className="rounded-[1.5rem] bg-white/30 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-muted">Guardrails</p>
                <div className="mt-4 grid gap-3">
                  {chatbot.guardrails.map((guardrail, index) => (
                    <div key={guardrail} className="grid gap-3 border-t border-stroke/60 pt-3 first:border-t-0 first:pt-0 sm:grid-cols-[2.25rem_minmax(0,1fr)]">
                      <span className="text-[0.62rem] uppercase tracking-[0.16em] text-muted">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <p className="text-sm leading-6 text-text-primary">{guardrail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
}

function Contact() {
  const { contactCta } = portfolioContent;
  const marqueeRef = useRef<HTMLDivElement | null>(null);
  const marqueeText = useMemo(
    () => Array.from({ length: 10 }, () => `${contactCta.artisticHeroText} . `).join(''),
    [contactCta.artisticHeroText],
  );

  useLayoutEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return undefined;

    const ctx = gsap.context(() => {
      gsap.to(marquee, {
        xPercent: -50,
        duration: 57.1,
        ease: 'none',
        repeat: -1,
      });
    }, marquee);

    return () => ctx.revert();
  }, []);

  return (
    <footer id="contact" className="relative overflow-hidden bg-transparent pb-8 pt-16 md:pb-12 md:pt-20">
      <div className="absolute inset-0 bg-white/60" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-bg/90 to-transparent" />

      <div className="relative z-10 overflow-hidden py-10">
        <div
          ref={marqueeRef}
          className="flex w-max whitespace-nowrap font-display text-6xl italic text-text-primary/10 md:text-9xl"
        >
          <span>{marqueeText}</span>
          <span>{marqueeText}</span>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex max-w-[1200px] flex-col items-center px-6 text-center md:px-10 lg:px-16">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">{contactCta.hook}</p>
        <h2 className="mt-5 max-w-3xl font-body text-5xl font-semibold tracking-[-0.04em] md:text-7xl">
          {contactCta.headline}
        </h2>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {contactCta.ctaButtons.map((button) =>
            isPlaceholderValue(button.href) ? (
              <span
                key={button.label}
                className="rounded-full border border-dashed border-stroke bg-white/35 px-7 py-3.5 text-sm text-muted"
              >
                {button.label} / {button.href.label}
              </span>
            ) : (
              <a
                key={button.label}
                href={button.href}
                className="group relative inline-flex rounded-full p-[2px] text-sm transition duration-300 hover:scale-105"
              >
                <span className="accent-gradient animated-gradient absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="relative rounded-full bg-text-primary px-7 py-3.5 text-bg transition duration-300 group-hover:bg-bg group-hover:text-text-primary">
                  {button.label}
                </span>
              </a>
            ),
          )}
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-20 flex max-w-[1200px] flex-col gap-5 border-t border-stroke px-6 pt-6 text-xs uppercase tracking-[0.22em] text-muted md:flex-row md:items-center md:justify-between md:px-10 lg:px-16">
        <div className="flex flex-wrap gap-5">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="transition duration-300 hover:text-text-primary"
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          Available for projects
        </div>
      </div>
    </footer>
  );
}

function MagicalRockScene({
  clickCount,
  revealed,
  onRockClick,
}: {
  clickCount: number;
  revealed: boolean;
  onRockClick: () => void;
}) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const clickCountRef = useRef(clickCount);
  const revealedRef = useRef(revealed);

  useEffect(() => {
    clickCountRef.current = clickCount;
    revealedRef.current = revealed;
  }, [clickCount, revealed]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let cancelled = false;
    let disposeScene: (() => void) | undefined;

    void Promise.all([import('three'), import('three/examples/jsm/loaders/GLTFLoader.js')]).then(([THREE, { GLTFLoader }]) => {
      if (cancelled || !mount.isConnected) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
      camera.position.set(0, 0.35, 5.4);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0x000000, 0);
      mount.appendChild(renderer.domElement);

      const rockGroup = new THREE.Group();
      scene.add(rockGroup);

      const keyLight = new THREE.DirectionalLight(0xb8d7ff, 3.2);
      keyLight.position.set(3, 3, 4);
      scene.add(keyLight);

      const fillLight = new THREE.PointLight(0x8aaacc, 4.8, 9);
      fillLight.position.set(-2, -1, 3);
      scene.add(fillLight);
      scene.add(new THREE.AmbientLight(0xffffff, 1.25));

      const rockMaterial = new THREE.MeshStandardMaterial({
        color: 0x77869a,
        roughness: 0.58,
        metalness: 0.12,
        emissive: new THREE.Color(0x6f9dd0),
        emissiveIntensity: 0.18,
        transparent: true,
        opacity: 1,
      });

      const normalizeRock = (object: import('three').Object3D) => {
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxAxis = Math.max(size.x, size.y, size.z) || 1;
        object.position.sub(center);
        object.scale.setScalar(2.4 / maxAxis);
        object.rotation.set(-0.18, 0.2, 0.08);
      };

      const useFallbackRock = () => {
        if (cancelled) return;
        const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.25, 3), rockMaterial);
        mesh.rotation.set(-0.18, 0.2, 0.08);
        rockGroup.add(mesh);
      };

      const loader = new GLTFLoader();
      loader.load(
        rockModelUrl,
        (gltf) => {
          if (cancelled) return;
          const model = gltf.scene;
          model.traverse((child: import('three').Object3D) => {
            if (child instanceof THREE.Mesh) {
              child.material = rockMaterial;
            }
          });
          normalizeRock(model);
          rockGroup.add(model);
        },
        undefined,
        useFallbackRock,
      );

      const particleCount = 190;
      const particlePositions = new Float32Array(particleCount * 3);
      const basePositions = new Float32Array(particleCount * 3);
      const velocities = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i += 1) {
        const radius = 0.45 + Math.random() * 0.9;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        const idx = i * 3;
        basePositions[idx] = x;
        basePositions[idx + 1] = y;
        basePositions[idx + 2] = z;
        particlePositions[idx] = x;
        particlePositions[idx + 1] = y;
        particlePositions[idx + 2] = z;
        velocities[idx] = x * (1.5 + Math.random() * 1.7);
        velocities[idx + 1] = y * (1.4 + Math.random() * 1.5) + Math.random() * 0.75;
        velocities[idx + 2] = z * (1.2 + Math.random() * 1.8);
      }

      const particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      const particleMaterial = new THREE.PointsMaterial({
        color: 0xd9edff,
        size: 0.035,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const particles = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particles);

      let frameId = 0;
      let explosionProgress = revealedRef.current ? 1 : 0;
      const clock = new THREE.Clock();

      const resize = () => {
        const width = mount.clientWidth || 640;
        const height = mount.clientHeight || 420;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };

      const observer = new ResizeObserver(resize);
      observer.observe(mount);
      resize();

      const animate = () => {
        const delta = clock.getDelta();
        const elapsed = clock.elapsedTime;
        const pressure = Math.min(clickCountRef.current / 3, 1);
        explosionProgress = revealedRef.current
          ? Math.min(1, explosionProgress + delta * 0.95)
          : Math.max(0, explosionProgress - delta * 1.8);

        rockGroup.rotation.y += delta * (0.32 + pressure * 0.28);
        rockGroup.rotation.x = -0.12 + Math.sin(elapsed * 1.4) * 0.035;
        const pulse = Math.sin(elapsed * 5.2) * 0.04 * pressure;
        const rockScale = revealedRef.current ? Math.max(0.025, 1 - explosionProgress * 0.96) : 1 + pressure * 0.1 + pulse;
        rockGroup.scale.setScalar(rockScale);

        rockMaterial.emissiveIntensity = revealedRef.current
          ? 0.7 + (1 - explosionProgress) * 1.8
          : 0.16 + pressure * 0.55 + Math.max(0, pulse);
        rockMaterial.opacity = revealedRef.current ? Math.max(0, 1 - explosionProgress * 1.25) : 1;
        rockGroup.visible = rockMaterial.opacity > 0.02;

        const positionAttribute = particleGeometry.getAttribute('position') as import('three').BufferAttribute;
        for (let i = 0; i < particleCount; i += 1) {
          const idx = i * 3;
          const drift = Math.sin(elapsed * 1.8 + i) * 0.045 * explosionProgress;
          particlePositions[idx] = basePositions[idx] + velocities[idx] * explosionProgress + drift;
          particlePositions[idx + 1] = basePositions[idx + 1] + velocities[idx + 1] * explosionProgress - explosionProgress * explosionProgress * 0.4;
          particlePositions[idx + 2] = basePositions[idx + 2] + velocities[idx + 2] * explosionProgress;
        }
        positionAttribute.needsUpdate = true;
        particles.rotation.y -= delta * 0.12;
        particleMaterial.opacity = revealedRef.current ? Math.max(0.08, 1 - explosionProgress * 0.28) : pressure * 0.12;

        renderer.render(scene, camera);
        frameId = window.requestAnimationFrame(animate);
      };

      animate();

      disposeScene = () => {
        window.cancelAnimationFrame(frameId);
        observer.disconnect();
        renderer.dispose();
        particleGeometry.dispose();
        particleMaterial.dispose();
        rockMaterial.dispose();
        rockGroup.traverse((child: import('three').Object3D) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
          }
        });
        renderer.domElement.remove();
      };
    });

    return () => {
      cancelled = true;
      disposeScene?.();
    };
  }, []);

  return (
    <button
      type="button"
      onClick={onRockClick}
      className="group relative min-h-[340px] overflow-hidden rounded-[2rem] border border-white/35 bg-white/20 text-left shadow-[0_20px_80px_rgba(45,72,105,0.16)] transition duration-300 hover:border-white/70 md:min-h-[430px]"
      aria-label="Click the magical rock"
    >
      <div ref={mountRef} className="absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.36),transparent_42%),linear-gradient(180deg,transparent,rgba(238,247,255,0.22))]" />
      <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-white/60 px-4 py-2 text-xs uppercase tracking-[0.18em] text-text-primary">
          {revealed ? 'Gifts unlocked' : `${Math.min(clickCount, 3)} / 3 clicks`}
        </span>
        <span className="rounded-full bg-white/40 px-4 py-2 text-xs uppercase tracking-[0.18em] text-muted transition duration-300 group-hover:bg-white/65 group-hover:text-text-primary">
          Click rock
        </span>
      </div>
    </button>
  );
}

function MagicalRockPlaceholder({ onActivate }: { onActivate: () => void }) {
  return (
    <button
      type="button"
      onClick={onActivate}
      className="group relative min-h-[340px] overflow-hidden rounded-[2rem] border border-white/35 bg-white/20 text-left shadow-[0_20px_80px_rgba(45,72,105,0.16)] transition duration-300 hover:border-white/70 md:min-h-[430px]"
      aria-label="Prepare the magical rock"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.38),transparent_42%),linear-gradient(180deg,rgba(216,235,255,0.38),rgba(238,247,255,0.18))]" />
      <div className="absolute inset-8 rounded-[2rem] border border-dashed border-white/40 bg-white/16" />
      <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-white/60 px-4 py-2 text-xs uppercase tracking-[0.18em] text-text-primary">
          Rock ready nearby
        </span>
        <span className="rounded-full bg-white/40 px-4 py-2 text-xs uppercase tracking-[0.18em] text-muted transition duration-300 group-hover:bg-white/65 group-hover:text-text-primary">
          Prepare rock
        </span>
      </div>
    </button>
  );
}

function BonusSection() {
  const { bonus } = portfolioContent;
  const [rockClicks, setRockClicks] = useState(0);
  const [shouldMountRock, setShouldMountRock] = useState(false);
  const rockShellRef = useRef<HTMLDivElement | null>(null);
  const revealed = rockClicks >= 3;
  const handleRockClick = useCallback(() => {
    setRockClicks((current) => Math.min(3, current + 1));
  }, []);

  useEffect(() => {
    if (shouldMountRock) return undefined;

    const node = rockShellRef.current;
    if (!node) return undefined;

    if (!('IntersectionObserver' in window)) {
      setShouldMountRock(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldMountRock(true);
          observer.disconnect();
        }
      },
      { rootMargin: '700px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldMountRock]);

  return (
    <section id="bonus" className="relative bg-transparent py-14 md:py-20">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        <div className="grid gap-5 lg:grid-cols-[0.86fr_1.14fr] lg:items-stretch">
          <div className="liquid-glass-strong rounded-[2rem] p-7 md:p-10">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">Bonus</p>
            <h2 className="mt-4 font-body text-4xl font-semibold tracking-[-0.04em] text-text-primary md:text-6xl">
              {bonus.hook}
            </h2>
            <p className="mt-6 text-sm leading-7 text-muted md:text-base">{bonus.body}</p>

            <div className="mt-7 grid gap-3">
              <ProjectField label="3D element" value={bonus.trigger.element} />
              <ProjectField label="Trigger" value={bonus.trigger.interaction} />
            </div>
          </div>

          <div ref={rockShellRef}>
            {shouldMountRock ? (
              <MagicalRockScene clickCount={rockClicks} revealed={revealed} onRockClick={handleRockClick} />
            ) : (
              <MagicalRockPlaceholder onActivate={() => setShouldMountRock(true)} />
            )}
          </div>
        </div>

        <AnimatePresence>
          {revealed ? (
            <motion.div
              className="mt-5 grid gap-4 md:grid-cols-2"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.45 }}
            >
              {bonus.gifts.map((gift, index) => (
                <motion.article
                  key={gift.title}
                  className="liquid-glass rounded-[1.5rem] p-5 md:p-6"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                >
                  <p className="text-xs uppercase tracking-[0.22em] text-muted">
                    Gift {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-text-primary">
                    {gift.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-muted">{gift.detail}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <ProjectLink label="Open gift link" value={gift.link} />
                  </div>
                </motion.article>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}

function ActivePortfolioSection({
  active,
  ready,
  onOpenThesis,
  onOpenCaseStudy,
  showContentReadiness,
}: {
  active: SectionTarget;
  ready: boolean;
  onOpenThesis: () => void;
  onOpenCaseStudy: (item: CaseStudyEntry) => void;
  showContentReadiness: boolean;
}) {
  switch (active) {
    case 'experience-education':
      return <ExperienceEducationSection />;
    case 'projects':
      return <CaseStudyGrid onOpen={onOpenCaseStudy} />;
    case 'teaching-speaking-writing':
      return <TeachingWritingShelf onOpen={onOpenCaseStudy} />;
    case 'contact':
      return <Contact />;
    case 'bonus':
      return (
        <>
          <BonusSection />
          {showContentReadiness ? <ContentReadinessPanel /> : null}
        </>
      );
    case 'hero':
    default:
      return <Hero ready={ready} onOpenThesis={onOpenThesis} />;
  }
}

function PortfolioPage() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [liveBackgroundReady, setLiveBackgroundReady] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionTarget>(() =>
    normalizeSectionTarget(typeof window === 'undefined' ? undefined : window.location.hash.replace('#', '')),
  );
  const [activeCaseStudy, setActiveCaseStudy] = useState<CaseStudyEntry | null>(null);
  const [isAiRaminOpen, setIsAiRaminOpen] = useState(false);
  const thesisCaseStudy = caseStudyByDeepDiveSlug.get('ai-native-product-os');
  const showContentReadiness = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.has('intake') || searchParams.has('stage12-content-intake');
  }, [location.search]);

  const handleSectionNavigate = useCallback((target: SectionTarget) => {
    setActiveSection(target);
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${target}`);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }, []);

  const handleBottomNavigation = useCallback(
    (target: string) => {
      if (target === 'ai-ramin') {
        setIsAiRaminOpen(true);
        return;
      }

      setIsAiRaminOpen(false);
      handleSectionNavigate(normalizeSectionTarget(target));
    },
    [handleSectionNavigate],
  );

  useEffect(() => {
    const handleHashChange = () => {
      setActiveSection(normalizeSectionTarget(window.location.hash.replace('#', '')));
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      window.setTimeout(() => ScrollTrigger.refresh(), 100);
    }
  }, [activeSection, isLoading]);

  useEffect(() => {
    if (isLoading) {
      setLiveBackgroundReady(false);
      return undefined;
    }

    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (idleWindow.requestIdleCallback) {
      const idleId = idleWindow.requestIdleCallback(() => setLiveBackgroundReady(true), { timeout: 1600 });
      return () => idleWindow.cancelIdleCallback?.(idleId);
    }

    const timer = window.setTimeout(() => setLiveBackgroundReady(true), 900);
    return () => window.clearTimeout(timer);
  }, [isLoading]);

  return (
    <motion.div
      className="min-h-screen bg-transparent text-text-primary"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <AnimatePresence mode="wait">
        {isLoading ? <VisionLoadingScreen key="loading" onComplete={() => setIsLoading(false)} /> : null}
      </AnimatePresence>
      {liveBackgroundReady ? (
        <Suspense fallback={<StaticShaderGradientBackground />}>
          <LiveShaderGradientBackground />
        </Suspense>
      ) : (
        <StaticShaderGradientBackground />
      )}
      <div className="relative z-10 px-3 pb-28 pt-10 sm:px-6 sm:pb-32 sm:pt-14 lg:px-12 lg:pb-36 lg:pt-16">
        <div className="portfolio-frame relative mx-auto w-full lg:w-[86vw] lg:max-w-[1240px]">
          <div className="portfolio-stage relative min-h-[calc(100vh-1.5rem)] w-full overflow-hidden rounded-[24px] sm:min-h-[calc(100vh-3rem)] sm:rounded-[34px] lg:min-h-[calc(100vh-6rem)]">
            <main className="relative z-10">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <ActivePortfolioSection
                    active={activeSection}
                    ready={!isLoading}
                    onOpenThesis={() => {
                      if (thesisCaseStudy) setActiveCaseStudy(thesisCaseStudy);
                    }}
                    onOpenCaseStudy={setActiveCaseStudy}
                    showContentReadiness={showContentReadiness}
                  />
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {activeCaseStudy ? (
          <CaseStudyOverlay
            key={activeCaseStudy.id}
            item={activeCaseStudy}
            onClose={() => setActiveCaseStudy(null)}
          />
        ) : null}
      </AnimatePresence>
      <BottomNavigation
        active={isAiRaminOpen ? 'ai-ramin' : activeSection}
        onNavigate={handleBottomNavigation}
      />
      <AnimatePresence>
        {isAiRaminOpen ? <AiRaminModal onClose={() => setIsAiRaminOpen(false)} /> : null}
      </AnimatePresence>
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="*" element={<PortfolioPage />} />
      </Routes>
    </AnimatePresence>
  );
}
