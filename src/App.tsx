import { AnimatePresence, motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { lazy, Suspense, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent as ReactMouseEvent, MutableRefObject, ReactNode } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { TahoeGlassTabNav } from './components/TahoeGlassTabNav';
import { VisionLoadingScreen } from './components/VisionLoadingScreen';
import { AuroraBackground } from '@/components/ui/aurora-background';
import profileImageUrl from './assets/ramin-profile-nav.webp';
import aiCostsDashboardArtworkUrl from './assets/projects/ai-costs-dashboard-ai-placeholder.webp';
import aiNativeProductOsArtworkUrl from './assets/projects/ai-native-product-os-ai-placeholder.webp';
import conciergeSelfwareArtworkUrl from './assets/projects/24seven-concierge-ai-placeholder.webp';
import dreamseaSelfwareArtworkUrl from './assets/projects/dreamsea-ai-placeholder.webp';
import massSocialWisdomAgentArtworkUrl from './assets/projects/mass-social-wisdom-agent-ai-placeholder.webp';
import nssoSelfwareArtworkUrl from './assets/projects/nsso-ai-placeholder.webp';
import qadamSelfwareArtworkUrl from './assets/projects/qadam-ai-placeholder.webp';
import ragPipelineArtworkUrl from './assets/projects/rag-pipeline-ai-placeholder.webp';
import razinflixSelfwareArtworkUrl from './assets/projects/razinflix-ai-placeholder.webp';
import dreamseaGiftLogoUrl from '../gift-card-logos/dreamsea-app-icon-2026-card.jpg';
import googleMeetGiftLogoUrl from '../gift-card-logos/google-meet-logo.png';
import googleSheetsGiftLogoUrl from '../gift-card-logos/google-sheets-logo.png';
import udemyGiftLogoUrl from '../gift-card-logos/udemy-app-logo.png';
import {
  hashgraphRockAssetPipeline,
  validateHashgraphRockAssetPipeline,
} from './three/hashgraphRockAssets';
import {
  getBonusRockPreloadSnapshot,
  preloadBonusRockAssets,
  subscribeBonusRockPreload,
  type BonusRockPreloadStatus,
} from './three/bonusRockPreload';
import {
  BONUS_ROCK_FINAL_CLICK_COUNT,
  getBonusRockAnimationTargets,
  getBonusRockStage,
} from './three/hashgraphRockMotion';
import {
  architectureLayers,
  aiRaminPrototype,
  contentReadiness,
  deepDives,
  navLinks,
  portfolioContent,
  projectCaseStudies,
  roles,
  toolsAndSystems,
} from './data/portfolio';

gsap.registerPlugin(ScrollTrigger);

const LiveShaderGradientBackground = lazy(() =>
  import('./components/ShaderGradientBackground').then((module) => ({ default: module.ShaderGradientBackground })),
);

const PerformanceBaselinePanel = import.meta.env.DEV
  ? lazy(() =>
      import('./components/PerformanceBaselinePanel').then((module) => ({
        default: module.PerformanceBaselinePanel,
      })),
    )
  : null;

type PortfolioShaderVariant = 'default' | 'bonus' | 'projects';

function StaticShaderGradientBackground({ variant = 'default' }: { variant?: PortfolioShaderVariant }) {
  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden bg-black shader-gradient-surface"
      data-shader-variant={variant}
      aria-hidden="true"
    />
  );
}

function AiViewportBorderGlow() {
  return (
    <div className="portfolio-ai-screen-border" aria-hidden="true">
      <span className="portfolio-ai-screen-border-frame portfolio-ai-screen-border-frame-start" />
      <span className="portfolio-ai-screen-border-frame portfolio-ai-screen-border-frame-step-1" />
      <span className="portfolio-ai-screen-border-frame portfolio-ai-screen-border-frame-step-2" />
      <span className="portfolio-ai-screen-border-frame portfolio-ai-screen-border-frame-end" />
    </div>
  );
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
type TeachingEntry = (typeof portfolioContent.teachingSpeakingWriting.teaching)[number];
type SpeakingEntry = (typeof portfolioContent.teachingSpeakingWriting.speaking)[number];
type BookEntry = (typeof portfolioContent.teachingSpeakingWriting.writing.books)[number];
type ArticleEntry = (typeof portfolioContent.teachingSpeakingWriting.writing.articles)[number];
type WritingCaseStudyEntry = (typeof portfolioContent.teachingSpeakingWriting.writing.caseStudies)[number];
type BonusGiftEntry = (typeof portfolioContent.bonus.gifts)[number];
type SectionTarget = (typeof navLinks)[number]['target'];
type AiRaminMessageRole = 'assistant' | 'user';
type AiRaminMessage = {
  id: string;
  role: AiRaminMessageRole;
  content: string;
  isIntro?: boolean;
};
type BonusRockLayerStyle = CSSProperties & Record<`--${string}`, string | number>;
type BonusGiftLogo = {
  src: string;
  alt: string;
};

const BONUS_CELESTIAL_SPARKS = Array.from({ length: 22 }, (_, index) => index);
const BONUS_ROCK_UNLOCK_STORAGE_KEY = 'portfolio:bonus-rock-clicks';

function clampBonusRockClicks(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(BONUS_ROCK_FINAL_CLICK_COUNT, Math.trunc(value)));
}

function getInitialBonusRockClicks() {
  if (typeof window === 'undefined') return 0;

  try {
    return clampBonusRockClicks(Number(window.sessionStorage.getItem(BONUS_ROCK_UNLOCK_STORAGE_KEY)));
  } catch {
    return 0;
  }
}

function getBonusGiftLogo(gift: BonusGiftEntry): BonusGiftLogo {
  const title = gift.title.toLowerCase();

  if (title.includes('dreamsea')) {
    return { src: dreamseaGiftLogoUrl, alt: 'Dreamsea app logo' };
  }

  if (title.includes('tools database')) {
    return { src: googleSheetsGiftLogoUrl, alt: 'Google Sheets logo' };
  }

  if (title.includes('consultation')) {
    return { src: googleMeetGiftLogoUrl, alt: 'Google Meet logo' };
  }

  return { src: udemyGiftLogoUrl, alt: 'Udemy logo' };
}

const companyLogoAssets = import.meta.glob<string>('../company-logos/*', { eager: true, import: 'default' });
const companyVideoAssets = import.meta.glob<string>('../company-videos/*.{mp4,webm,mov}', {
  eager: true,
  import: 'default',
});

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
  const targetElement = document.getElementById(target);
  if (!targetElement) return;

  const scrollContainer = targetElement.closest<HTMLElement>('.portfolio-stage-scroll, .portfolio-stage');
  if (scrollContainer) {
    const targetRect = targetElement.getBoundingClientRect();
    const containerRect = scrollContainer.getBoundingClientRect();

    scrollContainer.scrollTo({
      top: Math.max(scrollContainer.scrollTop + targetRect.top - containerRect.top, 0),
      behavior: 'smooth',
    });
    return;
  }

  targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

function createAiRaminMessageId(prefix: AiRaminMessageRole) {
  const randomId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${randomId}`;
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
  currentSection,
  onNavigate,
  onNavIntent,
}: {
  active: SectionTarget;
  currentSection: SectionTarget;
  onNavigate: (target: string) => void;
  onNavIntent?: (target: string) => void;
}) {
  const isDarkPage = currentSection === 'bonus';

  return (
    <nav aria-label="Portfolio navigation" className="portfolio-bottom-navigation">
      <TahoeGlassTabNav
        active={active}
        navLinks={bottomNavigationLinks}
        onNavigate={onNavigate}
        onNavIntent={onNavIntent}
        isDarkPage={isDarkPage}
        className="portfolio-bottom-navigation-liquid-shell"
        navLabel="Portfolio navigation"
      />
    </nav>
  );
}

type GlassImprintCtaProps = {
  label: string;
  ariaLabel?: string;
  href?: string;
  target?: string;
  rel?: string;
  className?: string;
  onClick?: () => void;
};

function GlassImprintCta({
  label,
  ariaLabel,
  href,
  target,
  rel,
  className = '',
  onClick,
}: GlassImprintCtaProps) {
  const filterId = `hero-thesis-glass-${useId().replace(/:/g, '')}`;
  const glassStyle = { '--tahoe-glass-filter': `url(#${filterId})` } as CSSProperties & {
    '--tahoe-glass-filter': string;
  };

  const content = (
    <>
      <svg className="tahoe-glass-filter-defs" aria-hidden="true" focusable="false">
        <filter id={filterId} primitiveUnits="objectBoundingBox">
          <feTurbulence type="fractalNoise" baseFrequency="0.018 0.044" numOctaves="2" seed="23" result="grain" />
          <feColorMatrix
            in="grain"
            type="matrix"
            values="
              0.16 0 0 0 0.42
              0 0.16 0 0 0.42
              0 0 0.16 0 0.42
              0 0 0 1 0"
            result="map"
          />
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.01" result="blur" />
          <feDisplacementMap in="blur" in2="map" scale="0.18" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <span className="hero-thesis-glass-lens" aria-hidden="true" />
      <span className="hero-thesis-glass-label">{label}</span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className={`hero-thesis-glass-button ${className}`}
        style={glassStyle}
        aria-label={ariaLabel ?? label}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`hero-thesis-glass-button ${className}`}
      style={glassStyle}
      aria-label={ariaLabel ?? label}
    >
      {content}
    </button>
  );
}

function ThesisGlassButton({ onClick }: { onClick: () => void }) {
  return <GlassImprintCta label="My Product Thesis" onClick={onClick} />;
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
      className="relative flex h-full min-h-full items-center justify-center overflow-hidden px-6 text-center"
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
          <ThesisGlassButton onClick={onOpenThesis} />
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
    <div className="min-w-0">
      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted">{label}</p>
      <div
        className="relative mt-3 flex aspect-[16/8] items-center justify-center overflow-hidden rounded-[1.25rem] border border-white/35 bg-white/25 text-sm text-muted"
      >
        {isPlaceholder ? (
          <span className="px-4 text-center text-xs leading-5">{value.label}</span>
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

function projectMissingAssetCount(project: PersonalProjectEntry) {
  const trackedValues = [
    project.mainPictureGif,
    project.secondaryPicture,
    project.liveLink,
    project.githubLink,
    project.fullWriteupLink,
    project.domainExpertisePartner?.partnerPicture,
    project.domainExpertisePartner?.shortBio,
  ];

  return trackedValues.reduce((total, value) => total + (isPlaceholderValue(value) ? 1 : 0), 0);
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
  const missingAssetCount = projectMissingAssetCount(project);
  const primaryStackItems = project.technicalStack.slice(0, 2);
  const hiddenStackCount = Math.max(project.technicalStack.length - primaryStackItems.length, 0);

  return (
    <motion.article
      className="liquid-glass rounded-[1.65rem] p-4 transition duration-300 hover:bg-white/28 md:p-5"
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay: Math.min(index * 0.04, 0.18) }}
      viewport={{ once: true, margin: '-80px' }}
    >
      <div className="grid gap-4">
        <ProjectVisualSlot label="Main picture / GIF" value={project.mainPictureGif} alt={project.projectName} />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/45 px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-muted">
              {groupLabel}
            </span>
            <span className="rounded-full bg-white/55 px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-text-primary">
              {project.type}
            </span>
          </div>
          <h3 className="mt-4 text-2xl font-semibold leading-none tracking-[-0.045em] text-text-primary md:text-3xl">
            {project.projectName}
          </h3>
          <p className="mt-3 text-sm leading-6 text-muted">{contentValue(project.briefDescription)}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {primaryStackItems.map((item, stackIndex) => (
              <ContentToken key={`${project.projectName}-primary-stack-${stackIndex}`} value={item} />
            ))}
            {hiddenStackCount > 0 ? (
              <span className="rounded-full bg-white/35 px-3 py-1.5 text-xs text-muted">
                +{hiddenStackCount} stack notes
              </span>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (reader) onOpen(reader);
              }}
              disabled={!reader}
              className="inline-flex items-center justify-center rounded-full bg-white/70 px-4 py-2.5 text-sm text-text-primary transition duration-300 enabled:hover:bg-text-primary enabled:hover:text-bg disabled:cursor-not-allowed disabled:opacity-55"
            >
              {reader ? 'Open reader' : 'Write-up needed'}
            </button>
            <span className="rounded-full bg-white/35 px-3 py-2 text-[0.62rem] uppercase tracking-[0.14em] text-muted">
              {reader ? 'Reader ready' : 'Reader slot'}
            </span>
            <span className="rounded-full bg-white/35 px-3 py-2 text-[0.62rem] uppercase tracking-[0.14em] text-muted">
              {missingAssetCount} asset slots
            </span>
          </div>
        </div>
      </div>

      <details className="mt-5 group/project [&>summary::-webkit-details-marker]:hidden">
        <summary className="flex cursor-pointer items-center justify-between gap-4 rounded-full bg-white/35 px-4 py-3 text-sm text-text-primary">
          Project structure
          <span className="text-xs uppercase tracking-[0.16em] text-muted group-open/project:hidden">Expand</span>
          <span className="hidden text-xs uppercase tracking-[0.16em] text-muted group-open/project:inline">Collapse</span>
        </summary>

        <div className="mt-5 grid gap-5">
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

          <div className="grid gap-3">
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
    <div className="liquid-glass-strong flex min-h-full flex-col rounded-[2rem] p-4 md:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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

      <div className="mt-5 grid gap-4">
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

const projectArchitectureFlow = ['Problem', 'Context', 'Reasoning', 'Review', 'Output'] as const;

const selfwareGeneratedArtwork: Record<string, string> = {
  Qadam: qadamSelfwareArtworkUrl,
  Dreamsea: dreamseaSelfwareArtworkUrl,
  nsso: nssoSelfwareArtworkUrl,
  RazinFlix: razinflixSelfwareArtworkUrl,
  '24Seven Concierge': conciergeSelfwareArtworkUrl,
};

const toolGeneratedArtwork: Record<string, string> = {
  'AI Native Product OS': aiNativeProductOsArtworkUrl,
  'Mass Social Wisdom Agent': massSocialWisdomAgentArtworkUrl,
  'AI Costs Dashboard': aiCostsDashboardArtworkUrl,
  'RAG Pipeline': ragPipelineArtworkUrl,
};

const projectActNavItems = [
  { id: 'projects', label: 'Atlas', index: '00' },
  { id: 'projects-selfware-stack', label: 'Products', index: '01' },
  { id: 'projects-tools', label: 'Tools', index: '02' },
  { id: 'projects-architecture', label: 'Architecture', index: '03' },
] as const;

const thoughtFormatNavItems = [
  {
    id: 'thoughts-talks',
    label: 'Talks',
    index: '01',
    detail: 'Public arguments, narrative openings, and live room energy.',
  },
  {
    id: 'thoughts-books',
    label: 'Books',
    index: '02',
    detail: 'Long-form fiction and metaphysics with deeper reading paths.',
  },
  {
    id: 'thoughts-courses',
    label: 'Courses',
    index: '03',
    detail: 'Structured teaching systems for AI product management and building.',
  },
  {
    id: 'thoughts-case-studies',
    label: 'Case Studies',
    index: '04',
    detail: 'Wide write-ups for products, tools, frameworks, and the thesis.',
  },
] as const;

function ProjectCinematicPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-[0.64rem] uppercase tracking-[0.16em] text-white/68 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      {children}
    </span>
  );
}

function ProjectCinematicHero({
  selfware,
  tools,
  layerCount,
}: {
  selfware: readonly PersonalProjectEntry[];
  tools: readonly PersonalProjectEntry[];
  layerCount: number;
}) {
  const heroStats = [
    { label: 'Products', value: selfware.length },
    { label: 'Tools', value: tools.length },
    { label: 'Layers', value: layerCount },
  ];
  const heroActs = [
    {
      label: 'Products',
      title: 'Selfware',
      detail: 'Usable apps, agents, and web products with real case-study depth.',
    },
    {
      label: 'Machinery',
      title: 'Tools',
      detail: 'Dashboards, workflows, and agents that turn AI into operating leverage.',
    },
    {
      label: 'Thesis',
      title: 'Architecture',
      detail: 'Model, context, orchestration, governance, and human judgement repeated across the work.',
    },
  ];
  const featuredSelfware = selfware.slice(0, 5);
  const featuredTools = tools.slice(0, 4);

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden px-5 pb-28 pt-16 sm:px-8 md:px-12 lg:px-16">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_24%,rgba(185,202,216,0.22),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.07),transparent_42%)]" />
      <div className="projects-hero-scan absolute inset-0 z-0 opacity-70" />
      <div className="absolute -left-[10vw] top-[5%] z-0 text-[clamp(9rem,20vw,20rem)] font-black uppercase leading-none tracking-[-0.08em] text-white/[0.025]">
        Atlas
      </div>
      <div className="absolute right-[-8rem] top-[10%] z-0 h-[36rem] w-[36rem] rounded-full border border-white/10 bg-white/[0.025] blur-sm" />
      <div className="absolute left-[48%] top-[14%] z-0 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full border border-white/10 bg-white/[0.025] blur-sm" />

      <div className="relative z-10 mx-auto grid w-full max-w-[1520px] gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(21rem,28rem)] lg:items-end">
        <div>
          <motion.p
            className="text-xs uppercase tracking-[0.34em] text-white/55"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75 }}
          >
            03 / Projects
          </motion.p>
          <motion.h1
            className="projects-hero-title mt-7 max-w-[12ch] text-[clamp(4.6rem,14vw,15rem)] font-black uppercase leading-[0.78] tracking-[-0.075em] text-white"
            initial={{ opacity: 0, y: 42 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, delay: 0.08, ease: [0.25, 0.1, 0.25, 1] }}
          >
            Selfware
            <span className="block bg-gradient-to-b from-white via-[#b9cad8] to-[#5d7f9d] bg-clip-text text-transparent">
              Tools
            </span>
            <span className="block font-display italic font-normal normal-case tracking-[-0.05em] text-white/48">
              Architecture
            </span>
          </motion.h1>

          <motion.p
            className="mt-7 max-w-2xl text-base leading-8 text-white/68 md:text-lg"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.18 }}
          >
            I build products first, then turn the repeated patterns into tools, systems, and a durable AI-native product
            architecture.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.26 }}
          >
            <button
              type="button"
              onClick={() => scrollToId('projects-selfware-stack')}
              className="rounded-full bg-white px-6 py-3 text-sm font-medium text-[#07101c] transition duration-300 hover:scale-[1.03] hover:bg-[#dce8f2]"
            >
              Enter atlas
            </button>
            <button
              type="button"
              onClick={() => scrollToId('projects-architecture')}
              className="rounded-full border border-white/16 bg-white/[0.08] px-6 py-3 text-sm text-white/76 transition duration-300 hover:bg-white hover:text-[#07101c]"
            >
              See architecture
            </button>
            <button
              type="button"
              onClick={() => scrollToId('projects-tools')}
              className="rounded-full border border-[#b9cad8]/20 bg-[#b9cad8]/10 px-6 py-3 text-sm text-white/76 transition duration-300 hover:bg-white hover:text-[#07101c]"
            >
              Open tools bay
            </button>
          </motion.div>
        </div>

        <motion.aside
          className="projects-hero-aside relative overflow-hidden rounded-[1.75rem] border border-white/14 bg-black/26 p-4 text-white shadow-[0_28px_90px_rgba(0,0,0,0.3)] backdrop-blur-xl md:p-5"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.2 }}
        >
          <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          <p className="text-[0.62rem] uppercase tracking-[0.22em] text-white/44">Atlas control</p>
          <p className="mt-4 text-sm leading-6 text-white/72">
            Products people can use, tools that change how I build, and one repeatable AI-native architecture underneath
            the whole system.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {heroStats.map(({ label, value }) => (
              <div key={label} className="rounded-[1.1rem] border border-white/10 bg-white/[0.06] p-2.5">
                <p className="text-[0.58rem] uppercase tracking-[0.16em] text-white/46">{label}</p>
                <p className="mt-1.5 text-2xl font-semibold leading-none tracking-[-0.04em] text-white md:text-3xl">{value}</p>
              </div>
            ))}
          </div>

          <div className="projects-hero-acts mt-4 grid gap-2">
            {heroActs.map((act, index) => (
              <div key={act.title} className="grid grid-cols-[1.9rem_minmax(0,1fr)] gap-3 rounded-[1.05rem] border border-white/10 bg-white/[0.045] p-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/12 bg-white/[0.07] text-[0.58rem] text-white/60">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="text-[0.56rem] uppercase tracking-[0.15em] text-white/36">{act.label}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{act.title}</p>
                  <p className="projects-hero-act-detail mt-1 line-clamp-2 text-xs leading-5 text-white/54">
                    {act.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.aside>

        <motion.div
          className="grid gap-3 rounded-[1.65rem] border border-white/12 bg-black/18 p-3 shadow-[0_24px_90px_rgba(0,0,0,0.22)] backdrop-blur-xl lg:col-span-2 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:p-4"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.34 }}
        >
          <div className="flex min-w-0 flex-wrap gap-2">
            {featuredSelfware.map((project) => (
              <span
                key={`hero-selfware-${project.projectName}`}
                className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-2 text-xs text-white/70"
              >
                {project.projectName}
              </span>
            ))}
          </div>
          <div className="hidden items-center gap-2 px-3 text-[0.58rem] uppercase tracking-[0.2em] text-white/34 lg:flex">
            <span className="h-px w-10 bg-white/18" />
            becomes
            <span className="h-px w-10 bg-white/18" />
          </div>
          <div className="flex min-w-0 flex-wrap gap-2 lg:justify-end">
            {featuredTools.map((project) => (
              <span
                key={`hero-tool-${project.projectName}`}
                className="rounded-full border border-[#b9cad8]/20 bg-[#b9cad8]/10 px-3 py-2 text-xs text-white/72"
              >
                {project.projectName}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-5 z-10 hidden items-center gap-3 text-[0.62rem] uppercase tracking-[0.24em] text-white/42 sm:left-8 md:left-12 lg:flex">
        <span>Scroll</span>
        <span className="relative block h-px w-20 overflow-hidden bg-white/14">
          <span className="projects-scroll-pulse absolute inset-y-0 left-0 w-8 bg-white/48" />
        </span>
      </div>
    </section>
  );
}

function CinematicProjectVisual({
  project,
  index,
  tone = 'product',
}: {
  project: PersonalProjectEntry;
  index: number;
  tone?: 'product' | 'tool';
}) {
  const generatedArtwork =
    tone === 'tool' ? toolGeneratedArtwork[project.projectName] : selfwareGeneratedArtwork[project.projectName];
  const image = generatedArtwork ?? (isPlaceholderValue(project.mainPictureGif) ? undefined : project.mainPictureGif);
  const gradientStops =
    tone === 'tool'
      ? ['rgba(48,85,120,0.86)', 'rgba(9,19,32,0.92)', 'rgba(220,235,247,0.48)']
      : ['rgba(104,137,170,0.82)', 'rgba(8,18,32,0.86)', 'rgba(255,255,255,0.52)'];

  return (
    <div className="projects-visual-panel relative min-h-[22rem] overflow-hidden rounded-[2rem] border border-white/12 bg-black/34 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] md:min-h-[30rem]">
      {image ? (
        <>
          <img
            src={image}
            alt={`${project.projectName} project preview`}
            loading={index === 0 ? 'eager' : 'lazy'}
            fetchPriority={index === 0 ? 'low' : 'auto'}
            decoding="async"
            draggable={false}
            sizes={tone === 'tool' ? '(min-width: 1280px) 38vw, (min-width: 768px) 60vw, 100vw' : '(min-width: 1024px) 48vw, 100vw'}
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/24 to-black/5" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(255,255,255,0.26),transparent_24%)] mix-blend-screen" />
        </>
      ) : (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 24% 18%, ${gradientStops[2]}, transparent 25%), linear-gradient(135deg, ${gradientStops[0]}, ${gradientStops[1]})`,
            }}
          />
          <div className="absolute inset-x-8 top-9 grid gap-3">
            {[0, 1, 2].map((row) => (
              <div
                key={`${project.projectName}-visual-row-${row}`}
                className="h-11 rounded-full border border-white/12 bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                style={{ width: `${92 - row * 13}%` }}
              />
            ))}
          </div>
          <div className="absolute bottom-8 left-8 right-8 grid grid-cols-3 gap-3">
            {[0, 1, 2, 3, 4, 5].map((cell) => (
              <div
                key={`${project.projectName}-visual-cell-${cell}`}
                className="aspect-[1.2/1] rounded-[1rem] border border-white/12 bg-black/24 backdrop-blur-md"
              />
            ))}
          </div>
        </>
      )}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.16)_1px,transparent_1px)] bg-[length:5px_5px] opacity-[0.18]" />
      <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/36 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.16em] text-white/72 backdrop-blur-md">
        {generatedArtwork ? 'AI concept visual' : `${project.type} system`}
      </div>
      <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[0.62rem] uppercase tracking-[0.18em] text-white/50">System preview</p>
          <p className="mt-2 max-w-[18rem] text-sm leading-5 text-white/76">{contentValue(project.architecture)}</p>
        </div>
        <span className="font-display text-6xl italic leading-none text-white/32">{String(index + 1).padStart(2, '0')}</span>
      </div>
    </div>
  );
}

function SelfwareShowcaseCard({
  project,
  index,
  onOpen,
}: {
  project: PersonalProjectEntry;
  index: number;
  onOpen: (item: CaseStudyEntry) => void;
}) {
  const reader = getProjectReader(project.projectName);
  const proofText = isPlaceholderValue(project.liveLink) ? 'Proof slot' : 'Public proof';
  const stackPreview = project.technicalStack.slice(0, 5);
  const generatedArtwork = selfwareGeneratedArtwork[project.projectName];
  const proofHref = isPlaceholderValue(project.liveLink) ? undefined : project.liveLink;
  const stickyOffsetRem = 1 + Math.min(index, 4) * 0.62;
  const productMeta = [
    { label: 'Surface', value: project.type },
    { label: 'Reader', value: reader ? 'Case study ready' : 'Write-up needed' },
    { label: 'Visual', value: generatedArtwork ? 'AI concept art' : 'Source asset' },
  ];

  return (
    <div className="relative min-h-0 py-6 md:min-h-[92svh] md:py-10">
      <motion.article
        className="overflow-hidden rounded-[2.4rem] border border-white/14 bg-[#08111d]/84 p-4 text-white shadow-[0_32px_120px_rgba(0,0,0,0.42)] backdrop-blur-xl sm:p-5 md:sticky md:rounded-[3rem] md:p-8"
        style={{ top: `calc(${stickyOffsetRem}rem + env(safe-area-inset-top))`, zIndex: index + 1, transformOrigin: '50% 0%' }}
        initial={{ opacity: 0, y: 42 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: Math.min(index * 0.04, 0.18), ease: [0.25, 0.1, 0.25, 1] }}
        viewport={{ once: true, margin: '-120px' }}
      >
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/46 to-transparent" />
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
          <div className="flex min-h-[28rem] flex-col p-2 md:p-3">
            <div className="flex flex-wrap items-center gap-2">
              <ProjectCinematicPill>Selfware</ProjectCinematicPill>
              <ProjectCinematicPill>{project.type}</ProjectCinematicPill>
              <ProjectCinematicPill>{proofText}</ProjectCinematicPill>
              {generatedArtwork ? <ProjectCinematicPill>Generated visual</ProjectCinematicPill> : null}
            </div>
            <div className="mt-10">
              <p className="font-display text-7xl italic leading-none text-white/26 md:text-8xl">
                {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-5 text-[clamp(3rem,7vw,7rem)] font-black uppercase leading-[0.84] tracking-[-0.07em] text-white">
                {project.projectName}
              </h3>
              <p className="mt-6 max-w-xl text-base leading-8 text-white/68 md:text-lg">
                {contentValue(project.briefDescription)}
              </p>
            </div>

            <div className="mt-7 grid gap-2 sm:grid-cols-3">
              {productMeta.map((item) => (
                <div key={`${project.projectName}-${item.label}`} className="rounded-[1rem] border border-white/10 bg-black/20 p-3">
                  <p className="text-[0.56rem] uppercase tracking-[0.14em] text-white/36">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-white/76">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-2 sm:grid-cols-5">
              {projectArchitectureFlow.map((step, stepIndex) => (
                <div key={`${project.projectName}-${step}`} className="rounded-[1rem] border border-white/10 bg-white/[0.055] p-3">
                  <p className="text-[0.56rem] uppercase tracking-[0.14em] text-white/38">
                    {String(stepIndex + 1).padStart(2, '0')}
                  </p>
                  <p className="mt-2 text-xs font-medium text-white/78">{step}</p>
                </div>
              ))}
            </div>

            <div className="mt-auto flex flex-wrap items-center gap-3 pt-8">
              <button
                type="button"
                onClick={() => {
                  if (reader) onOpen(reader);
                }}
                disabled={!reader}
                className="rounded-full bg-white px-5 py-3 text-sm font-medium text-[#07101c] transition duration-300 enabled:hover:scale-[1.03] enabled:hover:bg-[#dce8f2] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {reader ? 'Open reader' : 'Write-up needed'}
              </button>
              {proofHref ? (
                <a
                  href={proofHref}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/14 bg-white/[0.08] px-5 py-3 text-sm text-white/72 transition duration-300 hover:bg-white hover:text-[#07101c]"
                >
                  Public proof
                </a>
              ) : null}
              <span className="rounded-full border border-white/12 bg-white/[0.07] px-4 py-3 text-xs uppercase tracking-[0.15em] text-white/54">
                {projectMissingAssetCount(project)} asset slots
              </span>
            </div>
          </div>

          <div className="grid gap-4">
            <CinematicProjectVisual project={project} index={index} />
            <div className="grid gap-3 md:grid-cols-5">
              {stackPreview.map((item, itemIndex) => (
                <div key={`${project.projectName}-stack-${itemIndex}`} className="rounded-[1.15rem] border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-[0.58rem] uppercase tracking-[0.16em] text-white/40">
                    {toolLayerColumns[itemIndex] ?? `Layer ${String(itemIndex + 1).padStart(2, '0')}`}
                  </p>
                  <p className="mt-3 line-clamp-4 text-xs leading-5 text-white/72">{contentValue(item)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.article>
    </div>
  );
}

function SelfwareStickyStack({
  projects,
  onOpen,
}: {
  projects: readonly PersonalProjectEntry[];
  onOpen: (item: CaseStudyEntry) => void;
}) {
  return (
    <section id="projects-selfware" className="relative px-5 py-16 sm:px-8 md:px-12 lg:px-16">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/44">Act 1 / Products</p>
            <h2 className="mt-4 text-[clamp(3.2rem,9vw,8.5rem)] font-black uppercase leading-[0.82] tracking-[-0.07em] text-white">
              Selfware
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-white/62">
            Apps, web apps, and agents presented as shipped product systems, each with visible architecture beneath the
            user-facing surface.
          </p>
        </div>
        <div id="projects-selfware-stack" className="scroll-mt-4">
          {projects.map((project, index) => (
            <SelfwareShowcaseCard key={project.projectName} project={project} index={index} onOpen={onOpen} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ToolConsoleCard({
  project,
  index,
  onOpen,
}: {
  project: PersonalProjectEntry;
  index: number;
  onOpen: (item: CaseStudyEntry) => void;
}) {
  const reader = getProjectReader(project.projectName);
  const layers = project.technicalStack.slice(0, 5);
  const generatedArtwork = toolGeneratedArtwork[project.projectName];
  const output = isPlaceholderValue(project.whatIWouldImprove) ? 'Workflow output slot' : contentValue(project.whatIWouldImprove);
  const workflowStages = ['Input', 'Route', 'Generate', 'Verify', 'Export'];
  const telemetry = [
    { label: 'Mode', value: project.type },
    { label: 'Reader', value: reader ? 'Ready' : 'Slot' },
    { label: 'Visual', value: generatedArtwork ? 'Generated' : 'Fallback' },
  ];

  return (
    <motion.article
      className="group relative overflow-hidden rounded-[2rem] border border-white/12 bg-black/36 p-4 text-white shadow-[0_24px_90px_rgba(0,0,0,0.3)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-white/[0.075] md:p-5"
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: Math.min(index * 0.06, 0.18) }}
      viewport={{ once: true, margin: '-100px' }}
    >
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#b9cad8]/62 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.62rem] uppercase tracking-[0.22em] text-white/42">Tool / {String(index + 1).padStart(2, '0')}</p>
            <h3 className="mt-3 text-3xl font-semibold leading-none tracking-[-0.045em] text-white md:text-4xl">
              {project.projectName}
            </h3>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <ProjectCinematicPill>{project.type}</ProjectCinematicPill>
            {generatedArtwork ? <ProjectCinematicPill>Generated visual</ProjectCinematicPill> : null}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <CinematicProjectVisual project={project} index={index} tone="tool" />
          <div className="grid content-start gap-3">
            <div className="grid grid-cols-3 gap-2">
              {telemetry.map((item) => (
                <div key={`${project.projectName}-${item.label}`} className="rounded-[1rem] border border-white/10 bg-white/[0.055] p-3">
                  <p className="text-[0.54rem] uppercase tracking-[0.14em] text-white/34">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-white/76">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.045] p-4">
              <p className="text-[0.58rem] uppercase tracking-[0.16em] text-white/36">Execution path</p>
              <div className="mt-4 grid gap-2">
                {workflowStages.map((stage, stageIndex) => (
                  <div
                    key={`${project.projectName}-${stage}`}
                    className="grid grid-cols-[2rem_minmax(0,1fr)] items-center gap-3 rounded-full border border-white/10 bg-black/22 px-3 py-2"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.08] text-[0.58rem] text-white/54">
                      {String(stageIndex + 1).padStart(2, '0')}
                    </span>
                    <span className="text-xs font-medium uppercase tracking-[0.13em] text-white/72">{stage}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[1.1rem] border border-white/10 bg-white/[0.055] p-4">
            <p className="text-[0.58rem] uppercase tracking-[0.16em] text-white/38">Input</p>
            <p className="mt-3 text-sm leading-6 text-white/72">{contentValue(project.problem)}</p>
          </div>
          <div className="rounded-[1.1rem] border border-white/10 bg-white/[0.055] p-4">
            <p className="text-[0.58rem] uppercase tracking-[0.16em] text-white/38">Process</p>
            <p className="mt-3 text-sm leading-6 text-white/72">{contentValue(project.architecture)}</p>
          </div>
          <div className="rounded-[1.1rem] border border-white/10 bg-white/[0.055] p-4">
            <p className="text-[0.58rem] uppercase tracking-[0.16em] text-white/38">Output</p>
            <p className="mt-3 text-sm leading-6 text-white/72">{output}</p>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-5">
          {layers.map((layer, layerIndex) => (
            <div key={`${project.projectName}-tool-layer-${layerIndex}`} className="rounded-[0.95rem] border border-white/10 bg-white/[0.05] p-3">
              <p className="text-[0.54rem] uppercase tracking-[0.14em] text-white/36">
                {toolLayerColumns[layerIndex] ?? `L${layerIndex + 1}`}
              </p>
              <p className="mt-2 line-clamp-3 text-xs leading-5 text-white/68">{contentValue(layer)}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (reader) onOpen(reader);
            }}
            disabled={!reader}
            className="w-fit rounded-full border border-white/16 bg-white/[0.08] px-5 py-3 text-sm text-white/78 transition duration-300 enabled:hover:bg-white enabled:hover:text-[#07101c] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {reader ? 'Open reader' : 'Reader slot'}
          </button>
          <span className="rounded-full border border-white/12 bg-white/[0.055] px-4 py-3 text-xs uppercase tracking-[0.15em] text-white/48">
            Operations layer
          </span>
        </div>
      </div>
    </motion.article>
  );
}

function ToolsOperationsBay({
  projects,
  onOpen,
}: {
  projects: readonly PersonalProjectEntry[];
  onOpen: (item: CaseStudyEntry) => void;
}) {
  return (
    <section id="projects-tools" className="relative px-5 py-20 sm:px-8 md:px-12 lg:px-16">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/44">Act 2 / Tools</p>
            <h2 className="mt-4 text-[clamp(3.2rem,9vw,8.5rem)] font-black uppercase leading-[0.82] tracking-[-0.07em] text-white">
              Operations Bay
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-white/62 lg:justify-self-end">
            The tools are the backstage machinery: prompts become workflows, workflows become governance, and governance
            becomes a repeatable way to ship AI-native product work.
          </p>
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          {projects.map((project, index) => (
            <ToolConsoleCard key={project.projectName} project={project} index={index} onOpen={onOpen} />
          ))}
        </div>
      </div>
    </section>
  );
}

function getProjectLayerSummary(project: PersonalProjectEntry, layerName: string, layerIndex: number) {
  const value = contentValue(project.technicalStack[layerIndex]);
  const prefix = `${layerName}:`;

  return value.startsWith(prefix) ? value.slice(prefix.length).trim() : value;
}

function ArchitectureExpressionGroup({
  label,
  eyebrow,
  projects,
  tone,
}: {
  label: string;
  eyebrow: string;
  projects: readonly PersonalProjectEntry[];
  tone: 'selfware' | 'tools';
}) {
  const toneClass =
    tone === 'selfware'
      ? 'border-white/14 bg-white/[0.07] text-white/78'
      : 'border-[#89AACC]/24 bg-[#89AACC]/[0.085] text-[#dcecff]';

  return (
    <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl md:p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[0.58rem] uppercase tracking-[0.18em] text-white/38">{eyebrow}</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{label}</h3>
        </div>
        <span className="rounded-full border border-white/12 px-3 py-1.5 text-[0.58rem] uppercase tracking-[0.15em] text-white/46">
          {projects.length} systems
        </span>
      </div>

      <div className="mt-5 grid gap-2">
        {projects.map((project, index) => (
          <div
            key={`architecture-expression-${label}-${project.projectName}`}
            className={`group grid grid-cols-[2.8rem_minmax(0,1fr)_auto] items-center gap-3 rounded-[1.05rem] border px-3 py-3 transition duration-300 hover:border-white/32 hover:bg-white/[0.12] ${toneClass}`}
          >
            <span className="font-display text-2xl italic leading-none text-white/32">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-[-0.02em] text-white">{project.projectName}</p>
              <p className="mt-1 truncate text-[0.58rem] uppercase tracking-[0.14em] text-white/42">
                {contentValue(project.architecture)}
              </p>
            </div>
            <span className="rounded-full border border-white/12 px-2.5 py-1 text-[0.54rem] uppercase tracking-[0.13em] text-white/42">
              {project.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ArchitectureKernel() {
  const architecture = portfolioContent.personalProjects.architectureAcrossTools;
  const { selfware, tools } = portfolioContent.personalProjects;
  const architectureSystems = [
    ...selfware.map((project, index) => ({
      project,
      code: `P${index + 1}`,
      family: 'Product',
    })),
    ...tools.map((project, index) => ({
      project,
      code: `T${index + 1}`,
      family: 'Tool',
    })),
  ];
  const architectureStats = [
    { label: 'Systems mapped', value: architectureSystems.length },
    { label: 'Product surfaces', value: selfware.length },
    { label: 'Reusable tools', value: tools.length },
    { label: 'Shared layers', value: architecture.layers.length },
  ];
  const expressionFlow = ['Sense', 'Ground', 'Route', 'Check', 'Decide'];

  return (
    <section
      id="projects-architecture"
      className="relative min-h-[100svh] overflow-hidden px-5 py-24 sm:px-8 md:px-12 lg:px-16"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/26 to-transparent" />
      <div className="absolute left-1/2 top-[42%] h-[56rem] w-[56rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-white/[0.022]" />
      <div className="absolute -right-56 bottom-12 h-[34rem] w-[34rem] rounded-full bg-[#89AACC]/[0.08] blur-3xl" />
      <div className="absolute -left-52 top-36 h-[30rem] w-[30rem] rounded-full bg-white/[0.05] blur-3xl" />

      <div className="relative z-10 mx-auto max-w-[1540px]">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start">
          <div className="min-w-0 lg:sticky lg:top-24">
            <p className="text-xs uppercase tracking-[0.3em] text-white/44">Act 3 / Architecture</p>
            <h2 className="mt-5 text-[clamp(3rem,5vw,7.2rem)] font-black uppercase leading-[0.82] tracking-[-0.07em] text-white">
              One Architecture
              <span className="block font-display italic font-normal normal-case tracking-[-0.04em] text-white/46">
                many expressions
              </span>
            </h2>
            <p className="mt-7 max-w-xl text-base leading-8 text-white/66">{architecture.title}</p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {architectureStats.map((stat) => (
                <div key={stat.label} className="rounded-[1.2rem] border border-white/10 bg-white/[0.055] p-4">
                  <p className="font-display text-4xl italic leading-none text-white/76">{stat.value}</p>
                  <p className="mt-3 text-[0.58rem] uppercase tracking-[0.15em] text-white/38">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-white/[0.05] p-4">
              <p className="text-[0.58rem] uppercase tracking-[0.17em] text-white/38">Expression path</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {expressionFlow.map((step, index) => (
                  <div key={step} className="flex items-center gap-2">
                    <span className="rounded-full border border-white/12 bg-white/[0.07] px-3 py-1.5 text-[0.58rem] uppercase tracking-[0.14em] text-white/62">
                      {step}
                    </span>
                    {index < expressionFlow.length - 1 ? <span className="hidden h-px w-5 bg-white/18 sm:block" /> : null}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative min-w-0 rounded-[2.4rem] border border-white/12 bg-black/20 p-3 shadow-[0_34px_120px_rgba(0,0,0,0.32)] backdrop-blur-2xl sm:p-4 md:rounded-[3rem] md:p-5">
            <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/38 to-transparent" />
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-4 md:rounded-[2.45rem] md:p-6">
              <div className="flex flex-col gap-5 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[0.62rem] uppercase tracking-[0.2em] text-white/38">Kernel map</p>
                  <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white md:text-4xl 2xl:text-5xl">
                    Same stack, different surfaces.
                  </h3>
                </div>
                <div className="grid grid-cols-3 gap-1 rounded-full border border-white/10 bg-white/[0.045] p-1">
                  {['Product', 'Tool', 'Thesis'].map((label) => (
                    <span
                      key={label}
                      className="rounded-full px-3 py-2 text-center text-[0.56rem] uppercase tracking-[0.13em] text-white/46"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {architecture.layers.map((layer, index) => {
                  const layerLabel = toolLayerColumns[index] ?? layer.layer;
                  const highlightedSystems = architectureSystems
                    .slice(index)
                    .concat(architectureSystems.slice(0, index))
                    .slice(0, 4);

                  return (
                    <motion.article
                      key={`architecture-kernel-${layer.layer}`}
                      className="group relative overflow-hidden rounded-[1.45rem] border border-white/10 bg-white/[0.055] p-4 transition duration-300 hover:border-white/26 hover:bg-white/[0.08] md:p-5"
                      initial={{ opacity: 0, y: 26 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.68, delay: index * 0.07 }}
                      viewport={{ once: true, margin: '-80px' }}
                    >
                      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-transparent via-[#89AACC]/60 to-transparent opacity-40 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="grid gap-5 2xl:grid-cols-[8.5rem_minmax(0,0.75fr)_minmax(22rem,1fr)] 2xl:items-center">
                        <div>
                          <p className="font-display text-5xl italic leading-none text-white/30">
                            {String(index + 1).padStart(2, '0')}
                          </p>
                          <h4 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">{layer.layer}</h4>
                        </div>

                        <div>
                          <p className="text-[0.58rem] uppercase tracking-[0.16em] text-white/36">Layer job</p>
                          <p className="mt-3 text-sm leading-6 text-white/72">{contentValue(layer.purpose)}</p>
                        </div>

                        <div>
                          <div
                            className="grid gap-1"
                            style={{ gridTemplateColumns: `repeat(${architectureSystems.length}, minmax(0, 1fr))` }}
                          >
                            {architectureSystems.map((system) => (
                              <span
                                key={`${layer.layer}-${system.project.projectName}`}
                                title={`${system.project.projectName} uses the ${layer.layer} layer`}
                                aria-label={`${system.project.projectName} uses the ${layer.layer} layer`}
                                className={`h-8 rounded-full border text-center text-[0.55rem] font-medium uppercase leading-8 tracking-[0.08em] ${
                                  system.family === 'Product'
                                    ? 'border-white/12 bg-white/[0.07] text-white/48'
                                    : 'border-[#89AACC]/20 bg-[#89AACC]/[0.09] text-[#dcecff]/60'
                                }`}
                              >
                                {system.code}
                              </span>
                            ))}
                          </div>

                          <div className="mt-4 grid gap-2 sm:grid-cols-2">
                            {highlightedSystems.map((system) => (
                              <div
                                key={`${layer.layer}-${system.project.projectName}-summary`}
                                className="rounded-[0.95rem] border border-white/10 bg-black/15 p-3"
                              >
                                <p className="truncate text-xs font-semibold text-white/80">{system.project.projectName}</p>
                                <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/52">
                                  {getProjectLayerSummary(system.project, layerLabel, index)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
          <ArchitectureExpressionGroup label="Products and apps" eyebrow="Expression type 01" projects={selfware} tone="selfware" />

          <div className="flex items-center justify-center">
            <div className="relative flex min-h-48 w-full max-w-[18rem] flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-white/12 bg-white/[0.055] p-6 text-center backdrop-blur-xl lg:h-full">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(137,170,204,0.16),transparent_46%)]" />
              <div className="relative z-10">
                <p className="text-[0.58rem] uppercase tracking-[0.18em] text-white/38">Shared kernel</p>
                <p className="mt-3 font-display text-5xl italic leading-none text-white/76">5</p>
                <p className="mt-2 text-sm uppercase tracking-[0.18em] text-white/58">layers repeat</p>
              </div>
              <div className="relative z-10 mt-5 grid w-full grid-cols-5 gap-1">
                {architecture.layers.map((layer, index) => (
                  <span
                    key={`architecture-kernel-mini-${layer.layer}`}
                    className="h-16 rounded-full border border-white/12 bg-white/[0.07] text-center text-[0.52rem] uppercase leading-[4rem] tracking-[0.08em] text-white/38"
                  >
                    {String(index + 1)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <ArchitectureExpressionGroup label="Tools and systems" eyebrow="Expression type 02" projects={tools} tone="tools" />
        </div>
      </div>
    </section>
  );
}

function ProjectActRail() {
  const [activeAct, setActiveAct] = useState<string>(projectActNavItems[0].id);

  useEffect(() => {
    const scrollContainer = document.querySelector<HTMLElement>('.portfolio-stage');
    if (!scrollContainer) return undefined;

    let animationFrame = 0;

    const updateActiveAct = () => {
      animationFrame = 0;
      const containerRect = scrollContainer.getBoundingClientRect();
      const targetLine = containerRect.top + containerRect.height * 0.34;
      let nextAct = projectActNavItems[0].id;
      let nearestDistance = Number.POSITIVE_INFINITY;

      projectActNavItems.forEach((item) => {
        const element = document.getElementById(item.id);
        if (!element) return;

        const distance = Math.abs(element.getBoundingClientRect().top - targetLine);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nextAct = item.id;
        }
      });

      setActiveAct((current) => (current === nextAct ? current : nextAct));
    };

    const requestActiveActUpdate = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(updateActiveAct);
    };

    updateActiveAct();
    scrollContainer.addEventListener('scroll', requestActiveActUpdate, { passive: true });
    window.addEventListener('resize', requestActiveActUpdate);

    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      scrollContainer.removeEventListener('scroll', requestActiveActUpdate);
      window.removeEventListener('resize', requestActiveActUpdate);
    };
  }, []);

  return (
    <nav className="projects-act-rail" aria-label="Projects acts">
      {projectActNavItems.map((item) => {
        const isActive = activeAct === item.id;

        return (
          <button
            key={item.id}
            type="button"
            aria-current={isActive ? 'true' : undefined}
            onClick={() => scrollToId(item.id)}
          >
            <span>{item.index}</span>
            <strong>{item.label}</strong>
          </button>
        );
      })}
    </nav>
  );
}

function CaseStudyGrid({ onOpen }: { onOpen: (item: CaseStudyEntry) => void }) {
  const { selfware, tools } = portfolioContent.personalProjects;
  const layerCount = portfolioContent.personalProjects.architectureAcrossTools.layers.length;

  return (
    <section id="projects" className="projects-cinematic relative isolate min-h-screen overflow-hidden bg-transparent pb-32 text-white">
      <ProjectActRail />
      <ProjectCinematicHero selfware={selfware} tools={tools} layerCount={layerCount} />
      <SelfwareStickyStack projects={selfware} onOpen={onOpen} />
      <ToolsOperationsBay projects={tools} onOpen={onOpen} />
      <ArchitectureKernel />
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
        aria-label="Close case study backdrop"
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
              aria-label="Close case study"
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

function CourseModuleTrack({ course }: { course: TeachingEntry }) {
  return (
    <ol className="courses-curriculum-track">
      {course.courseModules.map((module, moduleIndex) => (
        <li key={`${course.courseTitle}-module-${moduleIndex}`}>
          <span>{String(moduleIndex + 1).padStart(2, '0')}</span>
          <p>{contentValue(module)}</p>
        </li>
      ))}
    </ol>
  );
}

function getCourseTitle(course: TeachingEntry) {
  return 'displayTitle' in course && typeof course.displayTitle === 'string' ? course.displayTitle : course.courseTitle;
}

function CourseTagStrip({ course }: { course: TeachingEntry }) {
  return (
    <div className="courses-curriculum-tag-strip">
      {course.tags.map((tag) => (
        <span key={`${course.courseTitle}-${tag}`}>{tag}</span>
      ))}
    </div>
  );
}

function CourseStatGrid({ course }: { course: TeachingEntry }) {
  return (
    <div className="courses-curriculum-stat-grid">
      {course.stats.map((stat) => (
        <div key={`${course.courseTitle}-${stat.label}`}>
          <span>{stat.value}</span>
          <p>{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

function CourseTrailerPanel({ course }: { course: TeachingEntry }) {
  const isPlaceholder = isPlaceholderValue(course.courseTrailer);
  const heroMedia = course.media[0];
  const supportingMedia = course.media[1];

  return (
    <div className="courses-curriculum-trailer">
      {heroMedia ? (
        <img
          className="courses-curriculum-trailer-image"
          src={heroMedia.path}
          alt={heroMedia.alt}
          loading="eager"
          decoding="async"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      ) : null}
      {supportingMedia ? (
        <img
          className="courses-curriculum-trailer-secondary"
          src={supportingMedia.path}
          alt={supportingMedia.alt}
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      ) : null}
      <div className="courses-curriculum-trailer-shade" aria-hidden="true" />
      <div className="courses-curriculum-trailer-grid" aria-hidden="true" />
      <div className="courses-curriculum-trailer-content">
        <p className="text-[0.62rem] uppercase tracking-[0.22em] text-white/42">Course trailer</p>
        <h5>{getCourseTitle(course)}</h5>
        <p>{isPlaceholder ? contentValue(course.courseTrailer) : course.framework.name}</p>
        <div className="mt-4">
          <ProjectLink label="Course trailer" value={course.courseTrailer} />
        </div>
      </div>
    </div>
  );
}

function CourseFrameworkMap({ course }: { course: TeachingEntry }) {
  return (
    <div className="courses-curriculum-framework">
      <div className="courses-curriculum-framework-head">
        <span>Framework</span>
        <strong>{course.framework.name}</strong>
        <p>{course.framework.durableClaim}</p>
      </div>

      <div className="courses-curriculum-loop" aria-label={`${course.framework.name} loop`}>
        {course.framework.loop.map((step, index) => (
          <span key={`${course.courseTitle}-loop-${step}`}>
            <em>{String(index + 1).padStart(2, '0')}</em>
            {step}
          </span>
        ))}
      </div>

      <div className="courses-curriculum-stack" aria-label={`${course.framework.name} stack`}>
        {course.framework.stack.map((layer) => (
          <span key={`${course.courseTitle}-stack-${layer}`}>{layer}</span>
        ))}
      </div>
    </div>
  );
}

function CourseAssetGrid({ course }: { course: TeachingEntry }) {
  return (
    <div className="courses-curriculum-assets">
      <p>Included assets</p>
      <div>
        {course.includedAssets.map((asset) => (
          <span key={`${course.courseTitle}-${asset}`}>{asset}</span>
        ))}
      </div>
    </div>
  );
}

function CourseLinkCluster({ course }: { course: TeachingEntry }) {
  return (
    <div className="courses-curriculum-source-links">
      <ProjectLink label="Course link" value={course.courseLink} />
      {course.sourceLinks.map((link) => (
        <ProjectLink key={`${course.courseTitle}-${link.href}`} label={link.label} value={link.href} />
      ))}
    </div>
  );
}

function CourseRowSnapshot({ course }: { course: TeachingEntry }) {
  const media = course.media[0];

  return (
    <div className="courses-curriculum-row-snapshot">
      {media ? (
        <img
          src={media.path}
          alt=""
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      ) : null}
      <div>
        {course.stats.slice(0, 2).map((stat) => (
          <span key={`${course.courseTitle}-row-${stat.label}`}>
            <strong>{stat.value}</strong>
            <em>{stat.label}</em>
          </span>
        ))}
      </div>
    </div>
  );
}

function CoursesCurriculum({ courses }: { courses: readonly TeachingEntry[] }) {
  const [activeCourseIndex, setActiveCourseIndex] = useState(0);
  const activeCourse = courses[activeCourseIndex] ?? courses[0];
  const totalModules = courses.reduce((total, course) => total + course.courseModules.length, 0);
  const totalAssets = courses.reduce((total, course) => total + course.includedAssets.length, 0);
  const coursesFrame = portfolioContent.teachingSpeakingWriting.frame.formatIntros.courses;

  return (
    <section id="thoughts-courses" className="thought-format-section courses-curriculum">
      <div className="courses-curriculum-heading">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/46">Format 03 / Courses</p>
          <h3 className="mt-4 text-5xl font-semibold tracking-[-0.065em] text-white md:text-7xl">Courses</h3>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/58">{coursesFrame.title}</p>
        </div>
        <span className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-white/58">
          {courses.length} entries
        </span>
      </div>

      {activeCourse ? (
        <div className="courses-curriculum-stage">
          <div className="courses-curriculum-command">
            <p className="text-xs uppercase tracking-[0.26em] text-white/42">Active curriculum</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-white/56">
                Course
              </span>
              <ContentToken value={activeCourse.tag} />
            </div>
            <h4 className="mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.06em] text-white md:text-6xl">
              {getCourseTitle(activeCourse)}
            </h4>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/62 md:text-base md:leading-8">
              {contentValue(activeCourse.courseDescription)}
            </p>
            <p className="courses-curriculum-positioning">{activeCourse.positioning}</p>

            <div className="courses-curriculum-signals" aria-label="Course structure">
              {activeCourse.framework.loop.map((signal) => (
                <span key={signal}>{signal}</span>
              ))}
            </div>

            <CourseTagStrip course={activeCourse} />
            <CourseLinkCluster course={activeCourse} />
          </div>

          <div className="courses-curriculum-board">
            <div className="courses-curriculum-board-summary">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/42">Operating system</p>
                <p className="mt-3 text-sm leading-6 text-white/58">
                  {coursesFrame.body}
                </p>
              </div>
              <CourseStatGrid course={activeCourse} />
            </div>

            <div className="courses-curriculum-board-main">
              <CourseTrailerPanel course={activeCourse} />
              <div className="courses-curriculum-system-column">
                <CourseFrameworkMap course={activeCourse} />
                <CourseAssetGrid course={activeCourse} />
              </div>
            </div>

            <div className="courses-curriculum-module-panel">
              <div>
                <p>Module map</p>
                <span>
                  {activeCourse.courseModules.length} modules / {totalModules} total modules / {totalAssets} included assets
                </span>
              </div>
              <CourseModuleTrack course={activeCourse} />
            </div>
          </div>
        </div>
      ) : null}

      <div className="courses-curriculum-index">
        {courses.map((course, index) => (
          <motion.button
            key={course.courseTitle}
            type="button"
            className="courses-curriculum-row"
            data-active={index === activeCourseIndex ? 'true' : 'false'}
            onClick={() => setActiveCourseIndex(index)}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.58, delay: index * 0.05 }}
            viewport={{ once: true, margin: '-80px' }}
          >
            <span className="courses-curriculum-row-index">{String(index + 1).padStart(2, '0')}</span>
            <div>
              <div className="flex flex-wrap gap-2">
                <ContentToken value={course.tag} />
              </div>
              <h4 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
                {getCourseTitle(course)}
              </h4>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58">{contentValue(course.courseDescription)}</p>
              <CourseTagStrip course={course} />
            </div>
            <CourseRowSnapshot course={course} />
            <span className="courses-curriculum-row-action">{index === activeCourseIndex ? 'Selected' : 'View track'}</span>
          </motion.button>
        ))}
      </div>
    </section>
  );
}

function TalksStageVideoSlot({ entry, compact = false }: { entry: SpeakingEntry; compact?: boolean }) {
  const isPlaceholder = isPlaceholderValue(entry.youtubeEmbeddedLink);
  const media = 'media' in entry ? entry.media : undefined;

  return (
    <div className={`talks-stage-video ${compact ? 'is-compact' : ''}`}>
      <div className="talks-stage-video-frame">
        {media ? (
          <img
            className="talks-stage-video-image"
            src={media.path}
            alt={media.alt}
            loading="lazy"
            decoding="async"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
        ) : null}
        <div className="talks-stage-video-shade" aria-hidden="true" />
        <div className="talks-stage-video-grid" aria-hidden="true" />
        <div className="talks-stage-video-content">
          <p className="talks-stage-video-label">{compact ? 'Replay' : 'Replay slot'}</p>
          <p className="talks-stage-video-title">{getTalkTitle(entry)}</p>
          <p className="talks-stage-video-meta">
            {isPlaceholder ? contentValue(entry.youtubeEmbeddedLink) : entry.venue ?? entry.invitedBy}
          </p>
          <div className="mt-3">
            <ProjectLink label="YouTube / talk link" value={entry.youtubeEmbeddedLink} />
          </div>
        </div>
      </div>
    </div>
  );
}

function getTalkTitle(entry: SpeakingEntry) {
  return 'displayTitle' in entry && typeof entry.displayTitle === 'string' ? entry.displayTitle : entry.talkTitle;
}

function getTalkSourceLinks(entry: SpeakingEntry) {
  return 'sourceLinks' in entry ? entry.sourceLinks : [];
}

function getTalkTags(entry: SpeakingEntry) {
  return 'tags' in entry ? entry.tags : [];
}

function TalksStage({ talks }: { talks: readonly SpeakingEntry[] }) {
  const featuredTalk = talks[0];
  const talksFrame = portfolioContent.teachingSpeakingWriting.frame.formatIntros.talks;
  const talkSignals = ['Need', 'Room', 'Exercise', 'Afterlife'];
  const featuredStoryCards = featuredTalk
    ? [
        { label: 'Core idea', value: featuredTalk.coreIdea },
        { label: 'Audience takeaway', value: featuredTalk.audienceTakeaway },
        { label: 'How it shaped me', value: featuredTalk.whyItShapedMe },
      ]
    : [];

  return (
    <section id="thoughts-talks" className="thought-format-section talks-stage">
      <div className="talks-stage-heading">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/48">Format 01 / Talks</p>
          <h3 className="mt-4 text-5xl font-semibold tracking-[-0.065em] text-white md:text-7xl">Talks</h3>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/58">{talksFrame.title}</p>
        </div>
        <span className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-white/58">
          {talks.length} entries
        </span>
      </div>

      <div className="talks-stage-layout">
        <div className="talks-stage-manifesto">
          <span className="talks-stage-kicker">Talk principle</span>
          <blockquote>"{talksFrame.quote}"</blockquote>
          <p className="talks-stage-manifesto-copy">{talksFrame.body}</p>
          <div className="talks-stage-signals" aria-label="Talks structure">
            {talkSignals.map((signal) => (
              <span key={signal}>{signal}</span>
            ))}
          </div>
        </div>

        {featuredTalk ? (
          <motion.article
            className="talks-stage-feature"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <div className="talks-stage-feature-copy">
              <div className="flex flex-wrap gap-2">
                <p className="rounded-full border border-white/12 bg-white/[0.08] px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-white/62">
                  Featured talk
                </p>
                <ContentToken value={featuredTalk.invitedBy} />
              </div>
              <h4 className="mt-5 text-3xl font-semibold tracking-[-0.045em] text-white md:text-5xl">
                {getTalkTitle(featuredTalk)}
              </h4>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62">
                {featuredTalk.coreIdea}
              </p>
              <div className="talks-stage-proof-grid">
                {featuredStoryCards.map((card) => (
                  <div key={card.label}>
                    <span>{card.label}</span>
                    <p>{card.value}</p>
                  </div>
                ))}
              </div>
              <div className="talks-stage-source-links">
                {getTalkSourceLinks(featuredTalk).map((link) => (
                  <ProjectLink key={link.href} label={link.label} value={link.href} />
                ))}
              </div>
            </div>
            <TalksStageVideoSlot entry={featuredTalk} />
          </motion.article>
        ) : null}
      </div>

      <div className="talks-stage-lineup">
        {talks.map((entry, index) => (
          <motion.article
            key={entry.talkTitle}
            className="talks-stage-row"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.58, delay: index * 0.05 }}
            viewport={{ once: true, margin: '-80px' }}
          >
            <span className="talks-stage-row-index">{String(index + 1).padStart(2, '0')}</span>
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <p className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-white/54">
                  Talk
                </p>
                <ContentToken value={entry.invitedBy} />
              </div>
              <h4 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
                {getTalkTitle(entry)}
              </h4>
              <div className="talks-stage-row-copy-grid">
                <div>
                  <span>Argument</span>
                  <p>{entry.coreIdea}</p>
                </div>
                <div>
                  <span>Room effect</span>
                  <p>{entry.liveMoment}</p>
                </div>
              </div>
              <div className="talks-stage-row-tags">
                {getTalkTags(entry).map((tag) => (
                  <span key={`${entry.talkTitle}-${tag}`}>{tag}</span>
                ))}
              </div>
            </div>
            <TalksStageVideoSlot entry={entry} compact />
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function BookCoverButton({
  book,
  index,
  isActive,
  onSelect,
}: {
  book: BookEntry;
  index: number;
  isActive: boolean;
  onSelect: () => void;
}) {
  const coverImage = isPlaceholderValue(book.bookImage) ? null : book.bookImage;

  return (
    <button
      type="button"
      className="books-shelf-cover"
      data-active={isActive ? 'true' : 'false'}
      onClick={onSelect}
      aria-pressed={isActive}
    >
      <span className="books-shelf-cover-spine" aria-hidden="true" />
      <span className="books-shelf-cover-index">{String(index + 1).padStart(2, '0')}</span>
      <span className="books-shelf-cover-art">
        {coverImage ? (
          <img
            src={coverImage}
            alt=""
            loading="lazy"
            decoding="async"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
        ) : null}
        <span className="books-shelf-cover-content">
          <span>{contentValue(book.bookType)}</span>
          <strong>{book.bookName}</strong>
          <em>Ramin Hoodeh</em>
        </span>
      </span>
    </button>
  );
}

function BookLinkCluster({ book }: { book: BookEntry }) {
  return (
    <div className="flex flex-wrap gap-2">
      <ProjectLink label="Purchase link" value={book.purchaseLink} />
      {book.previewLink ? <ProjectLink label="Preview link" value={book.previewLink} /> : null}
      {book.summaryLink ? <ProjectLink label="Summary link" value={book.summaryLink} /> : null}
      {book.fullText ? <ProjectLink label="Full text" value={book.fullText} /> : null}
    </div>
  );
}

function getBookWorldImages(book: BookEntry) {
  const inventory = book.visualInventory;
  const images: { src: string; label: string; role: string }[] = [];

  const addImage = (src: string | undefined, label: string, role: string) => {
    if (src) images.push({ src, label, role });
  };

  const addImageList = (sources: readonly string[] | undefined, label: string, role: string) => {
    sources?.forEach((src, index) => addImage(src, `${label} ${index + 1}`, role));
  };

  addImage(inventory.cover, 'Cover', 'Artifact');
  addImage('openedBook' in inventory ? inventory.openedBook : undefined, 'Opened book', 'Artifact');
  addImageList(inventory.world, 'World frame', 'World');
  addImageList('characters' in inventory ? inventory.characters : undefined, 'Character', 'Cast');
  addImageList('portrait' in inventory ? inventory.portrait : undefined, 'Portrait', 'World');
  addImage('quote' in inventory ? inventory.quote : undefined, 'Quote page', 'Text');
  addImageList('supporting' in inventory ? inventory.supporting : undefined, 'Supporting frame', 'World');

  return images;
}

function BookWorldGallery({ book }: { book: BookEntry }) {
  const worldImages = getBookWorldImages(book);
  const heroImage = worldImages[1] ?? worldImages[0];
  const supportingImages = worldImages.slice(2, 7);

  return (
    <div className="books-world-gallery">
      {heroImage ? (
        <figure className="books-world-hero">
          <img
            src={heroImage.src}
            alt=""
            loading="eager"
            decoding="async"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
          <figcaption>
            <span>{heroImage.role}</span>
            <strong>{book.bookName}</strong>
          </figcaption>
        </figure>
      ) : null}

      <div className="books-world-grid" aria-label={`${book.bookName} visual world`}>
        {supportingImages.map((image, index) => (
          <figure key={`${book.bookName}-${image.src}`} className={index === 0 ? 'is-wide' : undefined}>
            <img
              src={image.src}
              alt=""
              loading="eager"
              decoding="async"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
            <figcaption>
              <span>{image.role}</span>
              <strong>{image.label}</strong>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

function BookInsightGrid({ book }: { book: BookEntry }) {
  const insights = [
    { label: 'Premise', value: book.premise },
    { label: 'Core question', value: book.coreQuestion },
    { label: 'Reader use', value: book.readerUse },
    { label: 'How it shaped me', value: book.shapedMe },
  ];

  return (
    <div className="books-shelf-insight-grid">
      {insights.map((insight) => (
        <div key={insight.label}>
          <span>{insight.label}</span>
          <p>{insight.value}</p>
        </div>
      ))}
    </div>
  );
}

function BookTagStrip({ book }: { book: BookEntry }) {
  return (
    <div className="books-shelf-tag-strip">
      {book.tags.map((tag) => (
        <span key={`${book.bookName}-${tag}`}>{tag}</span>
      ))}
    </div>
  );
}

function BookMiniVisualStrip({ book }: { book: BookEntry }) {
  const images = getBookWorldImages(book).slice(0, 4);

  return (
    <div className="books-shelf-mini-strip" aria-label={`${book.bookName} image strip`}>
      {images.map((image) => (
        <span key={`${book.bookName}-mini-${image.src}`}>
          <img
            src={image.src}
            alt=""
            loading="lazy"
            decoding="async"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
        </span>
      ))}
    </div>
  );
}

function BooksShelf({ books }: { books: readonly BookEntry[] }) {
  const [activeBookIndex, setActiveBookIndex] = useState(0);
  const activeBook = books[activeBookIndex] ?? books[0];
  const booksFrame = portfolioContent.teachingSpeakingWriting.frame.formatIntros.books;

  return (
    <section id="thoughts-books" className="thought-format-section books-shelf">
      <div className="books-shelf-heading">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/46">Format 02 / Books</p>
          <h3 className="mt-4 text-5xl font-semibold tracking-[-0.065em] text-white md:text-7xl">Books</h3>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/58">{booksFrame.title}</p>
        </div>
        <span className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-white/58">
          {books.length} entries
        </span>
      </div>

      {activeBook ? (
        <div className="books-shelf-stage">
          <div className="books-shelf-reader">
            <p className="text-xs uppercase tracking-[0.26em] text-white/42">Selected reading path</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <ContentToken value={activeBook.bookType} />
              <span className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-xs text-white/56">
                Long-form
              </span>
            </div>
            <h4 className="mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.06em] text-white md:text-6xl">
              {activeBook.bookName}
            </h4>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/62 md:text-base md:leading-8">
              {contentValue(activeBook.bookDescription)}
            </p>
            <p className="books-shelf-reader-thesis">{booksFrame.body}</p>

            <BookInsightGrid book={activeBook} />

            <div className="books-shelf-guide">
              <span>Included guide</span>
              <p>{activeBook.includedGuide}</p>
            </div>

            <BookTagStrip book={activeBook} />

            <div className="mt-7">
              <BookLinkCluster book={activeBook} />
            </div>

            {activeBook.bookVideo ? (
              <div className="books-shelf-video mt-7">
                <p className="text-[0.62rem] uppercase tracking-[0.22em] text-white/42">Video / trailer</p>
                <div className="mt-3 flex aspect-video items-end rounded-[1.25rem] border border-white/10 bg-white/[0.045] p-4">
                  <div>
                    <p className="text-sm leading-6 text-white/58">
                      {isPlaceholderValue(activeBook.bookVideo) ? contentValue(activeBook.bookVideo) : 'Media link ready'}
                    </p>
                    <div className="mt-3">
                      <ProjectLink label="Book video" value={activeBook.bookVideo} />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="books-shelf-display">
            <div className="books-shelf-display-copy">
              <p className="text-xs uppercase tracking-[0.26em] text-white/42">World view</p>
              <p className="mt-3 text-sm leading-6 text-white/58">
                Covers act as selectors, while the selected book opens into the visual system behind the story.
              </p>
            </div>
            <BookWorldGallery book={activeBook} />
            <div className="books-shelf-plinth" aria-label="Book selector">
              {books.map((book, index) => (
                <BookCoverButton
                  key={book.bookName}
                  book={book}
                  index={index}
                  isActive={index === activeBookIndex}
                  onSelect={() => setActiveBookIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="books-shelf-spines">
        {books.map((book, index) => (
          <motion.article
            key={`book-spine-${book.bookName}`}
            className="books-shelf-spine-row"
            data-active={index === activeBookIndex ? 'true' : 'false'}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.58, delay: index * 0.05 }}
            viewport={{ once: true, margin: '-80px' }}
          >
            <span className="books-shelf-spine-index">{String(index + 1).padStart(2, '0')}</span>
            <div className="books-shelf-spine-main">
              <div className="flex flex-wrap gap-2">
                <ContentToken value={book.bookType} />
              </div>
              <h4 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
                {book.bookName}
              </h4>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58">{contentValue(book.bookDescription)}</p>
              <div className="books-shelf-spine-proof">
                <div>
                  <span>Question</span>
                  <p>{book.coreQuestion}</p>
                </div>
                <div>
                  <span>Use</span>
                  <p>{book.readerUse}</p>
                </div>
              </div>
              <BookTagStrip book={book} />
            </div>
            <div className="books-shelf-spine-media">
              <BookMiniVisualStrip book={book} />
              <BookLinkCluster book={book} />
              <button type="button" onClick={() => setActiveBookIndex(index)}>
                {index === activeBookIndex ? 'Selected' : 'Open book'}
              </button>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function ArticleCard({ article, index }: { article: ArticleEntry; index: number }) {
  const horizontalStages = 'horizontalStages' in article ? article.horizontalStages : undefined;

  return (
    <motion.article
      className="liquid-glass rounded-[1.65rem] p-4 transition duration-300 hover:bg-white/28 md:p-5"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.04 }}
      viewport={{ once: true, margin: '-80px' }}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(12rem,0.55fr)]">
        <div className="min-w-0">
          <p className="rounded-full bg-white/45 px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-muted">
            Article
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-text-primary md:text-3xl">
            {article.articleTitle}
          </h3>
          <p className="mt-3 text-sm leading-6 text-muted">{contentValue(article.articleContent)}</p>
        </div>
        <ProjectVisualSlot label="Article diagram" value={article.articleDiagram} alt={`${article.articleTitle} diagram`} />
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

function AiNativeProductOsWriteupRow({ onOpen }: { onOpen: (item: CaseStudyEntry) => void }) {
  const os = portfolioContent.teachingSpeakingWriting.writing.aiNativeProductOs;
  const thesisReader = caseStudyByDeepDiveSlug.get('ai-native-product-os');
  const workflowSummary = os.workflowDiagram.join(' -> ');
  const image = toolGeneratedArtwork['AI Native Product OS'];
  const insightCards = [
    { label: 'Problem', value: contentValue(os.problem) },
    { label: 'Architecture', value: contentValue(os.architecture) },
    { label: 'Tradeoffs', value: contentValue(os.tradeoffs) },
  ];

  return (
    <motion.article
      className="case-writeup-row case-writeup-row-thesis"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.58 }}
      viewport={{ once: true, margin: '-80px' }}
    >
      <span className="case-writeup-index-number">00</span>

      <CaseWriteupVisual
        title="AI-Native Product OS"
        label="Thesis system"
        image={image}
        index={0}
        tone="thesis"
      />

      <div className="case-writeup-main">
        <div className="flex flex-wrap gap-2">
          <span className="case-writeup-chip">Thesis</span>
          <span className="case-writeup-chip">AI-Native Product OS</span>
          {thesisReader?.readTime ? <span className="case-writeup-chip">{thesisReader.readTime}</span> : null}
        </div>
        <h4 className="mt-4 text-3xl font-semibold tracking-[-0.055em] text-white md:text-5xl">
          AI-Native Product OS
        </h4>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/62">{thesisReader?.summary ?? contentValue(os.problem)}</p>
        <CaseWriteupLayerStrip layers={os.layerLensesOverview} />
      </div>

      <CaseWriteupInsightDeck cards={insightCards} footerLabel="Workflow" footerValue={workflowSummary} />

      <div className="case-writeup-actions">
        <button
          type="button"
          disabled={!thesisReader}
          onClick={() => {
            if (thesisReader) onOpen(thesisReader);
          }}
        >
          {thesisReader ? 'Open thesis' : 'Reader needed'}
        </button>
        <div>
          <ProjectLink label="Live link" value={os.liveLink} />
          <ProjectLink label="GitHub" value={os.githubLink} />
          <ProjectLink label="Full write-up" value={os.fullWriteupLink} />
        </div>
      </div>
    </motion.article>
  );
}

function caseWriteupReaderSection(reader: CaseStudyEntry | undefined, label: string) {
  return reader?.sections.find((section) => section.label.toLowerCase().startsWith(label.toLowerCase()));
}

function caseWriteupSnippet(reader: CaseStudyEntry | undefined, label: string, fallback: string | PlaceholderLike) {
  return caseWriteupReaderSection(reader, label)?.body[0] ?? contentValue(fallback);
}

function caseWriteupArtwork(projectName: string, reader?: CaseStudyEntry) {
  return selfwareGeneratedArtwork[projectName] ?? toolGeneratedArtwork[projectName] ?? reader?.heroImage;
}

function caseWriteupTone(projectName: string): 'product' | 'tool' {
  return toolGeneratedArtwork[projectName] ? 'tool' : 'product';
}

function CaseWriteupVisual({
  title,
  label,
  image,
  index,
  tone = 'product',
}: {
  title: string;
  label: string;
  image?: string;
  index: number;
  tone?: 'product' | 'tool' | 'thesis';
}) {
  return (
    <div className="case-writeup-visual" data-tone={tone}>
      {image ? (
        <img
          src={image}
          alt={`${title} case study visual`}
          loading={index <= 1 ? 'eager' : 'lazy'}
          decoding="async"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      ) : null}
      <div className="case-writeup-visual-shade" aria-hidden="true" />
      <div className="case-writeup-visual-grid" aria-hidden="true" />
      <div className="case-writeup-visual-copy">
        <span>{label}</span>
        <strong>{title}</strong>
      </div>
    </div>
  );
}

function CaseWriteupLayerStrip({ layers }: { layers: readonly string[] }) {
  return (
    <div className="case-writeup-layer-strip">
      {layers.map((layer) => (
        <span key={layer}>{layer}</span>
      ))}
    </div>
  );
}

function CaseWriteupInsightDeck({
  cards,
  footerLabel,
  footerValue,
}: {
  cards: readonly { label: string; value: string }[];
  footerLabel?: string;
  footerValue?: string;
}) {
  return (
    <div className="case-writeup-proof">
      {cards.map((card) => (
        <div key={card.label}>
          <span>{card.label}</span>
          <p>{card.value}</p>
        </div>
      ))}
      {footerLabel && footerValue ? (
        <div className="case-writeup-proof-wide">
          <span>{footerLabel}</span>
          <p>{footerValue}</p>
        </div>
      ) : null}
    </div>
  );
}

function CaseStudyWriteupRow({
  entry,
  index,
  onOpen,
}: {
  entry: WritingCaseStudyEntry;
  index: number;
  onOpen: (item: CaseStudyEntry) => void;
}) {
  const reader = getProjectReader(entry.projectName);
  const rowLabel = reader?.tag ?? reader?.typeLabel ?? 'Case study';
  const image = caseWriteupArtwork(entry.projectName, reader);
  const tone = caseWriteupTone(entry.projectName);
  const architectureLayers = reader?.structure.map((item) => item.label) ?? [];
  const insightCards = [
    { label: 'Problem', value: caseWriteupSnippet(reader, 'Problem', entry.problem) },
    { label: 'Architecture', value: caseWriteupSnippet(reader, 'Architecture', entry.architecture) },
    { label: 'Decision', value: caseWriteupSnippet(reader, 'Why this approach', entry.whyThisApproach) },
  ];
  const tradeoff = caseWriteupSnippet(reader, 'Tradeoffs', entry.tradeoffs);

  return (
    <motion.article
      className="case-writeup-row"
      data-tone={tone}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.58, delay: index * 0.035 }}
      viewport={{ once: true, margin: '-80px' }}
    >
      <span className="case-writeup-index-number">{String(index + 1).padStart(2, '0')}</span>

      <CaseWriteupVisual title={entry.projectName} label={rowLabel} image={image} index={index + 1} tone={tone} />

      <div className="case-writeup-main">
        <div className="flex flex-wrap gap-2">
          <span className="case-writeup-chip">{rowLabel}</span>
          {reader?.readTime ? <span className="case-writeup-chip">{reader.readTime}</span> : null}
        </div>
        <h4 className="mt-4 text-3xl font-semibold tracking-[-0.055em] text-white md:text-5xl">
          {entry.projectName}
        </h4>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/62">{reader?.summary ?? contentValue(entry.problem)}</p>
        <CaseWriteupLayerStrip layers={architectureLayers.length ? architectureLayers : [rowLabel, tone === 'tool' ? 'System' : 'Product', 'Reader']} />
      </div>

      <CaseWriteupInsightDeck cards={insightCards} footerLabel="Tradeoff" footerValue={tradeoff} />

      <div className="case-writeup-actions">
        <button
          type="button"
          disabled={!reader}
          onClick={() => {
            if (reader) onOpen(reader);
          }}
        >
          {reader ? 'Open reader' : 'Reader needed'}
        </button>
        <div>
          <ProjectLink label="Live link" value={entry.liveLink} />
          <ProjectLink label="GitHub" value={entry.githubLink} />
          <ProjectLink label="Full write-up" value={entry.fullWriteupLink} />
        </div>
      </div>
    </motion.article>
  );
}

function CaseStudyWriteupIndex({
  caseStudies,
  articles,
  onOpen,
}: {
  caseStudies: readonly WritingCaseStudyEntry[];
  articles: readonly ArticleEntry[];
  onOpen: (item: CaseStudyEntry) => void;
}) {
  const thesisReader = caseStudyByDeepDiveSlug.get('ai-native-product-os');
  const writeupCount = caseStudies.length + 1;
  const productCount = caseStudies.filter((entry) => !toolGeneratedArtwork[entry.projectName]).length;
  const toolCount = caseStudies.filter((entry) => toolGeneratedArtwork[entry.projectName]).length + 1;
  const readerCount =
    caseStudies.reduce((total, entry) => total + (getProjectReader(entry.projectName) ? 1 : 0), 0) +
    (thesisReader ? 1 : 0);
  const writingFrame = portfolioContent.teachingSpeakingWriting.frame;
  const formationQuoteSerif = 'how the things you create have shaped you.';
  const formationQuoteLead = writingFrame.formationQuote.replace(formationQuoteSerif, '').trim();

  return (
    <section id="thoughts-case-studies" className="thought-format-section case-writeup-index">
      <div className="case-writeup-heading">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/46">Format 04 / Case study write-ups</p>
          <h3 className="mt-4 text-5xl font-semibold tracking-[-0.065em] text-white md:text-7xl">Case Studies</h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/58">
            The write-ups show how the work thinks: what problem forced the architecture, what system was chosen, and what the next version would need.
          </p>
        </div>
        <span className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-white/58">
          {caseStudies.length + articles.length + 1} entries
        </span>
      </div>

      <div className="case-writeup-primer">
        <div>
          <p className="text-xs uppercase tracking-[0.26em] text-white/42">Reader atlas</p>
          <p className="case-writeup-primer-quote mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.055em] text-white md:text-5xl">
            "{formationQuoteLead}{' '}
            <span className="case-writeup-primer-quote-serif">{formationQuoteSerif}</span>"
          </p>
          <p className="case-writeup-primer-copy mt-5 max-w-2xl text-sm leading-7 text-white/58">
            Products, tools, and thesis work are presented as formation records: each row shows the created thing, the system underneath it, and the judgment it sharpened.
          </p>
        </div>
        <div className="case-writeup-stat-grid">
          <div>
            <span>{writeupCount}</span>
            <p>Write-ups</p>
          </div>
          <div>
            <span>{readerCount}</span>
            <p>Readers</p>
          </div>
          <div>
            <span>{articles.length}</span>
            <p>Frameworks</p>
          </div>
          <div>
            <span>{productCount}</span>
            <p>Products</p>
          </div>
          <div>
            <span>{toolCount}</span>
            <p>Systems</p>
          </div>
          <div>
            <span>5</span>
            <p>Lenses</p>
          </div>
        </div>
      </div>

      <div className="case-writeup-rows">
        <AiNativeProductOsWriteupRow onOpen={onOpen} />
        {caseStudies.map((entry, index) => (
          <CaseStudyWriteupRow key={entry.projectName} entry={entry} index={index} onOpen={onOpen} />
        ))}
      </div>

      <div className="thought-framework-notes rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-4 md:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted">Framework notes</p>
            <h4 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-text-primary">
              Articles that support the write-ups
            </h4>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.16em] text-muted">
            {articles.length} notes
          </span>
        </div>
        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {articles.map((article, index) => (
            <ArticleCard key={article.articleTitle} article={article} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ThoughtGroup({
  id,
  eyebrow,
  title,
  count,
  summary,
  children,
  className = '',
}: {
  id?: string;
  eyebrow: string;
  title: string;
  count: number;
  summary?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`thought-format-section liquid-glass-strong rounded-[2rem] p-4 md:p-6 ${className}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted">{eyebrow}</p>
          <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-text-primary md:text-4xl">
            {title}
          </h3>
          {summary ? <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{summary}</p> : null}
        </div>
        <span className="rounded-full bg-white/40 px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-muted">
          {count} entries
        </span>
      </div>
      <div className="mt-5 grid gap-4">{children}</div>
    </section>
  );
}

function ThoughtHeroMetric({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div className="thoughts-hero-metric">
      <p className="text-[0.62rem] uppercase tracking-[0.2em] text-white/48">{label}</p>
      <p className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-white md:text-5xl">{value}</p>
      <p className="mt-2 text-xs leading-5 text-white/52">{detail}</p>
    </div>
  );
}

function ThoughtEditorialHero({
  speakingCount,
  bookCount,
  teachingCount,
  caseStudyCount,
  articleCount,
  missingCount,
}: {
  speakingCount: number;
  bookCount: number;
  teachingCount: number;
  caseStudyCount: number;
  articleCount: number;
  missingCount: number;
}) {
  const writeupCount = caseStudyCount + articleCount + 1;
  const frame = portfolioContent.teachingSpeakingWriting.frame;
  const heroMetrics = [
    { label: 'Talks', value: speakingCount, detail: 'Live arguments for seeing clearly.' },
    { label: 'Books', value: bookCount, detail: 'Stories that turn meaning into guidance.' },
    { label: 'Courses', value: teachingCount, detail: 'Operating systems for product judgment.' },
    { label: 'Write-ups', value: writeupCount, detail: 'Applied records of products, tools, and frameworks.' },
  ];

  return (
    <div className="thoughts-hero relative isolate overflow-hidden px-5 pb-12 pt-24 sm:px-8 md:px-12 lg:px-16">
      <div className="thoughts-hero-scan absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="relative z-10 mx-auto grid min-h-[calc(100svh-8rem)] max-w-[1440px] content-between gap-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs uppercase tracking-[0.34em] text-white/54">04 / Thoughts</p>
          <span className="w-fit rounded-full border border-white/14 bg-white/[0.06] px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.18em] text-white/56">
            A map of formation
          </span>
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,0.68fr)_minmax(22rem,0.32fr)] xl:items-end">
          <div>
            <p className="max-w-xl text-sm uppercase leading-6 tracking-[0.24em] text-white/54">
              Talks, books, courses, and later case-study write-ups
            </p>
            <h2 className="thoughts-hero-title mt-6 text-[22vw] font-semibold leading-[0.78] tracking-[-0.075em] text-white sm:text-[18vw] lg:text-[13.5rem]">
              Thoughts
              <span className="block font-display italic font-normal tracking-[-0.055em] text-white/52">
                {frame.headline}
              </span>
            </h2>
            <p className="mt-8 max-w-2xl text-base leading-8 text-white/66 md:text-lg">
              {frame.body}
            </p>
          </div>

          <div className="thoughts-hero-panel rounded-[2rem] border border-white/12 bg-white/[0.055] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.24)] backdrop-blur-2xl md:p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-white/48">Formation thesis</p>
            <blockquote className="thoughts-hero-quote mt-4 text-2xl font-semibold leading-tight tracking-[-0.045em] text-white md:text-3xl">
              "{frame.formationQuote}"
            </blockquote>
            <p className="thoughts-hero-panel-copy mt-4 text-sm leading-7 text-white/58">
              The page reads each creation as a mark left on the maker: talks shaped the live argument, books shaped the
              metaphysical story, and courses shaped the operating system.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          {heroMetrics.map((metric) => (
            <ThoughtHeroMetric key={metric.label} {...metric} />
          ))}
        </div>

        <nav className="thought-format-rail" aria-label="Thought formats">
          {thoughtFormatNavItems.map((item) => (
            <button key={item.id} type="button" onClick={() => scrollToId(item.id)}>
              <span>{item.index}</span>
              <strong>{item.label}</strong>
              <em>{item.detail}</em>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

function TeachingWritingShelf({ onOpen }: { onOpen: (item: CaseStudyEntry) => void }) {
  const { teaching, speaking, writing } = portfolioContent.teachingSpeakingWriting;
  const missingCount = countPlaceholders(portfolioContent.teachingSpeakingWriting);

  return (
    <section id="teaching-speaking-writing" className="thoughts-editorial relative isolate overflow-hidden">
      <AuroraBackground className="thoughts-aurora-shell min-h-full items-stretch justify-start bg-zinc-50">
        <ThoughtEditorialHero
          speakingCount={speaking.length}
          bookCount={writing.books.length}
          teachingCount={teaching.length}
          caseStudyCount={writing.caseStudies.length}
          articleCount={writing.articles.length}
          missingCount={missingCount}
        />

        <div className="thoughts-editorial-body relative z-10 mx-auto grid max-w-[1440px] gap-6 px-5 py-8 pb-32 sm:px-8 md:px-12 md:py-12 md:pb-32 lg:px-16">
          <TalksStage talks={speaking} />

          <BooksShelf books={writing.books} />

          <CoursesCurriculum courses={teaching} />

          <CaseStudyWriteupIndex caseStudies={writing.caseStudies} articles={writing.articles} onOpen={onOpen} />
        </div>
      </AuroraBackground>
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

function ThoughtMediaSlot({
  label,
  value,
  actionLabel = 'Open link',
}: {
  label: string;
  value: string | PlaceholderLike;
  actionLabel?: string;
}) {
  const isPlaceholder = isPlaceholderValue(value);

  return (
    <div className="rounded-[1.25rem] bg-white/30 p-4">
      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted">{label}</p>
      <div className="mt-3 flex aspect-video items-center justify-center rounded-[1rem] bg-white/25 px-4 text-center text-sm leading-6 text-muted">
        {isPlaceholder ? contentValue(value) : 'Media link ready'}
      </div>
      <div className="mt-3">
        <ProjectLink label={actionLabel} value={value} />
      </div>
    </div>
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

function getInitials(label: string) {
  return label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function normalizeAssetKey(value: string) {
  return value
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9]+/g, '');
}

function findImportedAsset(assets: Record<string, string>, candidates: readonly (string | undefined)[]) {
  const assetEntries = Object.entries(assets).map(([path, url]) => ({
    normalizedPath: normalizeAssetKey(path),
    url,
  }));

  for (const candidate of candidates) {
    if (!candidate) continue;
    const normalizedCandidate = normalizeAssetKey(candidate);
    const match = assetEntries.find((asset) => asset.normalizedPath.endsWith(normalizedCandidate));
    if (match) return match.url;
  }

  return undefined;
}

function resolveCompanyLogoSrc(value: string | PlaceholderLike | undefined) {
  if (!value || isPlaceholderValue(value)) return undefined;
  return companyLogoAssets[`../${value}`];
}

function displayWorkCompanyName(entry: ProductManagementWorkExperience) {
  return (entry as { fullCompanyName?: string }).fullCompanyName ?? entry.companyName;
}

function workVideoPath(entry: ProductManagementWorkExperience) {
  if (!('productVideoAsset' in entry)) return undefined;
  return typeof entry.productVideoAsset.pathOrUrl === 'string' ? entry.productVideoAsset.pathOrUrl : undefined;
}

function workVideoFileStem(entry: ProductManagementWorkExperience) {
  return normalizeAssetKey(displayWorkCompanyName(entry)) || normalizeAssetKey(entry.companyName);
}

function resolveWorkVideoSrc(entry: ProductManagementWorkExperience) {
  const explicitVideo = typeof entry.productVideo === 'string' ? entry.productVideo : undefined;
  if (explicitVideo && /^https?:\/\//i.test(explicitVideo)) return explicitVideo;

  return findImportedAsset(companyVideoAssets, [
    explicitVideo,
    workVideoPath(entry),
    `company-videos/${workVideoFileStem(entry)}`,
    `company-videos/${entry.companyName}`,
    `company-videos/${displayWorkCompanyName(entry)}`,
  ]);
}

function contentItemsToText(items: readonly (string | PlaceholderLike)[], limit = 2) {
  return items
    .slice(0, limit)
    .map((item) => contentValue(item))
    .join(', ');
}

function publicWorkValue(value: string | PlaceholderLike | undefined) {
  if (!value || isPlaceholderValue(value)) return undefined;
  return value;
}

function conciseCredentialSummary(value: string) {
  const firstSentence = value.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim();
  const summary = firstSentence ?? value;
  return summary.length > 132 ? `${summary.slice(0, 129).trim()}...` : summary;
}

function educationCredentialChipName(name: string) {
  if (name === 'AI Engineer Certification') return 'AI Engineering';
  if (name === 'MCP Advanced Topics') return 'MCP Advanced Topics';
  return name;
}

function educationIssuerChipName(name: string) {
  if (name === 'Google AI School') return 'Google';
  if (name === 'Anthropic Academy') return 'Anthropic';
  return name;
}

function CompanyLogoMark({
  logo,
  name,
  className = '',
}: {
  logo: string | PlaceholderLike | undefined;
  name: string;
  className?: string;
}) {
  const logoSrc = resolveCompanyLogoSrc(logo);

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-[1rem] text-center text-[0.58rem] font-semibold uppercase leading-none tracking-[0.12em] text-muted ${
        logoSrc ? 'bg-transparent' : 'bg-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.42)]'
      } ${className}`}
      aria-hidden="true"
    >
      {logoSrc ? (
        <img
          src={logoSrc}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        getInitials(name)
      )}
    </span>
  );
}

function WorkMetaPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-white/42 px-3 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-muted">
      {children}
    </span>
  );
}

function ExpandIndicator({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`card-glass-attachment ${isActive ? 'is-active' : ''}`}
      aria-hidden="true"
    >
      <span className="card-glass-attachment__glyph">
        <span className="card-glass-attachment__line card-glass-attachment__line-horizontal" />
        <span className="card-glass-attachment__line card-glass-attachment__line-vertical" />
      </span>
    </span>
  );
}

function WorkListBlock({
  label,
  items,
  maxItems,
  compact = false,
}: {
  label: string;
  items: readonly (string | PlaceholderLike)[];
  maxItems?: number;
  compact?: boolean;
}) {
  const visibleItems = (maxItems ? items.slice(0, maxItems) : items)
    .map((item) => publicWorkValue(item))
    .filter((item): item is string => Boolean(item));

  if (!visibleItems.length) return null;

  return (
    <div className={`rounded-[1rem] bg-white/24 ${compact ? 'p-3' : 'p-4'}`}>
      <p className="text-[0.58rem] uppercase tracking-[0.16em] text-muted">{label}</p>
      <div className={`${compact ? 'mt-2 gap-1.5' : 'mt-3 gap-2'} grid`}>
        {visibleItems.map((item, index) => (
          <p
            key={`${label}-${item}-${index}`}
            className={`${compact ? 'text-xs leading-5' : 'text-sm leading-6'} text-text-primary`}
          >
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function ProductVideoPreview({
  entry,
  isActive,
}: {
  entry: ProductManagementWorkExperience | null;
  isActive: boolean;
}) {
  if (!entry || !isActive) {
    return null;
  }

  const videoValue = contentValue(entry.productVideo);
  const videoUrl = resolveWorkVideoSrc(entry);
  const isNativeVideo = Boolean(videoUrl && /\.(mp4|webm|mov)(\?.*)?$/i.test(videoUrl));
  const isExternalVideo = Boolean(videoUrl && /^https?:\/\//i.test(videoUrl) && !isNativeVideo);

  return (
    <div className="liquid-glass flex min-h-[8.5rem] flex-1 flex-col rounded-[1.35rem] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <CompanyLogoMark logo={entry.companyLogo} name={displayWorkCompanyName(entry)} className="h-8 w-8 rounded-[0.75rem]" />
          <div className="min-w-0">
          <p className="text-[0.58rem] uppercase tracking-[0.18em] text-muted">Active work preview</p>
          <h3 className="mt-1 text-xl font-semibold tracking-[-0.04em] text-text-primary">
            {displayWorkCompanyName(entry)}
          </h3>
          </div>
        </div>
        <WorkMetaPill>Active</WorkMetaPill>
      </div>

      <div className="mt-3 flex min-h-[5.5rem] flex-1 items-center justify-center overflow-hidden rounded-[1rem] bg-white/26">
        {isNativeVideo && videoUrl ? (
          <video
            src={videoUrl}
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <div className="flex h-full min-h-[5.5rem] w-full flex-col items-center justify-center px-4 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/40 text-sm text-text-primary">
              ▶
            </span>
            <p className="mt-3 text-xs font-medium text-text-primary">
              {isExternalVideo ? 'Open product video' : `${displayWorkCompanyName(entry)} product video preview`}
            </p>
            <p className="mt-1 max-w-xs text-[0.72rem] leading-4 text-muted">
              {isPlaceholderValue(entry.productVideo)
                ? 'A role-specific media slot for a public-safe walkthrough, demo, or product snippet.'
                : videoValue}
            </p>
            {isExternalVideo && videoUrl ? (
              <a
                href={videoUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 rounded-full bg-white/44 px-3 py-1.5 text-xs font-medium text-text-primary transition duration-300 hover:bg-white/70"
              >
                Open video
              </a>
            ) : null}
          </div>
        )}
      </div>

    </div>
  );
}

function ProductManagementWorkCard({
  entry,
  index,
  isActive,
  onActivate,
}: {
  entry: ProductManagementWorkExperience;
  index: number;
  isActive: boolean;
  onActivate: () => void;
}) {
  const companyName = displayWorkCompanyName(entry);
  const productText = contentItemsToText(entry.productsWorkedOn, 2);
  const location = publicWorkValue(entry.location);
  const clients = publicWorkValue(entry.customerClientTypesAndUserNumbers);

  return (
    <motion.article
      layout
      data-work-index={index}
      role="button"
      tabIndex={0}
      aria-expanded={isActive}
      onClick={onActivate}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onActivate();
        }
      }}
      className={`group w-full max-w-full shrink-0 cursor-pointer rounded-[1.15rem] p-2.5 outline-none transition duration-300 ${
        isActive
          ? 'liquid-glass-strong shadow-[0_18px_50px_rgba(23,45,72,0.14)]'
          : 'liquid-glass hover:-translate-y-0.5 hover:bg-white/70 focus-visible:ring-2 focus-visible:ring-white/70'
      }`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.42,
        delay: Math.min(index * 0.025, 0.18),
        layout: { type: 'spring', stiffness: 380, damping: 34 },
      }}
      whileTap={{ scale: 0.996 }}
    >
      <div className="grid gap-x-3 gap-y-2 md:grid-cols-[2.75rem_minmax(12rem,0.85fr)_minmax(18rem,1fr)_2.75rem] md:items-start">
        <CompanyLogoMark logo={entry.companyLogo} name={companyName} className="h-10 w-10" />

        <div className="min-w-0">
          <p className="text-[0.62rem] uppercase tracking-[0.18em] text-muted">
            {publicWorkValue(entry.monthYearRangeWorked)}
          </p>
          <h3 className="mt-1 text-lg font-semibold tracking-[-0.035em] text-text-primary">
            {companyName}
          </h3>
          <p className="mt-1 text-sm leading-5 text-muted">{publicWorkValue(entry.jobTitle)}</p>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap gap-2 md:justify-end">
            <WorkMetaPill>{publicWorkValue(entry.industryTag)}</WorkMetaPill>
            <WorkMetaPill>{publicWorkValue(entry.marketType)}</WorkMetaPill>
          </div>
          <div className="mt-2 flex max-w-full items-center gap-2 md:justify-end">
            <span className="shrink-0 rounded-full bg-white/34 px-2 py-1 text-[0.52rem] uppercase leading-none tracking-[0.12em] text-muted">
              Product
            </span>
            <p
              className="min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-xs leading-5 text-muted md:text-right"
              title={productText}
            >
              {productText}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <ExpandIndicator isActive={isActive} />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isActive ? (
          <motion.div
            key={`${entry.companyName}-details`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-3 grid gap-2 border-t border-stroke/50 pt-3">
              {location ? (
                <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-3 rounded-[0.95rem] bg-white/20 px-3 py-2">
                  <p className="text-[0.58rem] uppercase tracking-[0.16em] text-muted">Location</p>
                  <p className="text-xs leading-5 text-text-primary">{location}</p>
                </div>
              ) : null}
              {clients ? (
                <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-3 rounded-[0.95rem] bg-white/20 px-3 py-2">
                  <p className="text-[0.58rem] uppercase tracking-[0.16em] text-muted">Clients</p>
                  <p className="text-xs leading-5 text-text-primary">{clients}</p>
                </div>
              ) : null}

              <div className="grid gap-2 xl:grid-cols-[0.85fr_1.15fr]">
                <div className="grid gap-2">
                  <div className="rounded-[1rem] bg-white/24 p-3">
                    <p className="text-[0.58rem] uppercase tracking-[0.16em] text-muted">Company context</p>
                    <p className="mt-2 text-xs leading-5 text-text-primary">
                      {publicWorkValue(entry.companyDescription)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-2">
                  <WorkListBlock label="Main achievements" items={entry.mainAchievements} maxItems={3} compact />
                  <WorkListBlock label="Process introduced / managerial" items={entry.processesIntroducedManagerial} maxItems={1} compact />
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  );
}

function ProductManagementWorkRail({
  activeIndex,
  onActiveIndexChange,
}: {
  activeIndex: number | null;
  onActiveIndexChange: (index: number | null) => void;
}) {
  const { companies } = portfolioContent.productManagementWorkExperiences;
  const railRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeIndex === null) return;
    const rail = railRef.current;
    const activeCard = rail?.querySelector<HTMLElement>(`[data-work-index="${activeIndex}"]`);
    if (!rail || !activeCard) return;

    window.requestAnimationFrame(() => {
      const canScrollRail = rail.scrollHeight > rail.clientHeight + 1 && getComputedStyle(rail).overflowY !== 'visible';
      const scrollContainer = canScrollRail ? rail : rail.closest<HTMLElement>('.portfolio-stage');
      if (!scrollContainer) return;
      const activeRect = activeCard.getBoundingClientRect();
      const scrollRect = scrollContainer.getBoundingClientRect();

      scrollContainer.scrollTo({
        top: Math.max(scrollContainer.scrollTop + activeRect.top - scrollRect.top - 16, 0),
        behavior: 'smooth',
      });
    });
  }, [activeIndex]);

  return (
    <div className="flex min-w-0 flex-col bg-transparent p-0 lg:h-full lg:min-h-0">
      <div
        ref={railRef}
        className="work-dashboard-scroll flex flex-col gap-3 py-4 pr-1 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:py-5"
      >
        {companies.map((entry, index) => (
          <ProductManagementWorkCard
            key={`${entry.companyName}-${index}`}
            entry={entry}
            index={index}
            isActive={activeIndex === index}
            onActivate={() => onActiveIndexChange(activeIndex === index ? null : index)}
          />
        ))}
      </div>
    </div>
  );
}

type EducationRow = {
  id: string;
  logo: string | PlaceholderLike;
  issuer: string;
  credential: string;
  typeLabel: string;
  outcome: string;
  year: string;
  summary: string;
  fullSummary: string;
  modules: readonly string[];
};

function EducationSummaryChip({
  label,
  variant,
}: {
  label: string;
  variant: 'degree' | 'certification';
}) {
  return (
    <span
      className={`education-summary-chip ${
        variant === 'degree' ? 'education-summary-chip-degree' : 'education-summary-chip-certification'
      }`}
    >
      {label}
    </span>
  );
}

function EducationDetailPanel({ row }: { row: EducationRow }) {
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const isDegree = row.typeLabel !== 'Certificate';
  const issuerLabel = isDegree ? row.issuer : educationIssuerChipName(row.issuer);
  const credentialLabel = isDegree ? row.credential : educationCredentialChipName(row.credential);
  const hasFullSummary = !isDegree && row.fullSummary.trim().length > row.summary.trim().length;
  const visibleSummary = hasFullSummary && isSummaryExpanded ? row.fullSummary : row.summary;

  return (
    <article className="rounded-[1.1rem] bg-white/26 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.26)]">
      <div className="grid min-w-0 grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-3 pr-11">
        <CompanyLogoMark logo={row.logo} name={row.issuer} className="h-9 w-9 rounded-[0.86rem]" />
        <div className="min-w-0">
          <p className="text-[0.73rem] uppercase tracking-[0.16em] text-muted">
            {isDegree ? 'Degree' : 'Certification'} / {row.year}
          </p>
          <h4 className="mt-1 text-[1.14rem] font-semibold leading-5 text-text-primary">{credentialLabel}</h4>
          <p className="mt-1 text-[0.98rem] leading-5 text-muted">{issuerLabel}</p>
        </div>
      </div>

      <div className="mt-3 rounded-[0.9rem] bg-white/22 px-3.5 py-2.5">
        <p className="text-[0.98rem] leading-7 text-muted">{visibleSummary}</p>
        {hasFullSummary ? (
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              aria-expanded={isSummaryExpanded}
              onClick={() => setIsSummaryExpanded((current) => !current)}
              className="education-read-more-chip"
            >
              <span className="education-read-more-chip__label">{isSummaryExpanded ? 'Show less' : 'Read more'}</span>
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {isDegree ? (
          <span className="rounded-full bg-white/38 px-3 py-1.5 text-[0.75rem] uppercase leading-none tracking-[0.12em] text-text-primary">
            {row.outcome}
          </span>
        ) : null}
        {row.modules.slice(0, isDegree ? 3 : 5).map((module) => (
          <span
            key={`${row.id}-${module}`}
            className="rounded-full bg-white/26 px-3 py-1.5 text-[0.75rem] leading-none text-muted"
          >
            {module}
          </span>
        ))}
      </div>
    </article>
  );
}

function EducationCard({
  isActive,
  onToggle,
}: {
  isActive: boolean;
  onToggle: () => void;
}) {
  const { qualifications, certifications } = portfolioContent.qualifications;
  const degreeRows: EducationRow[] = qualifications.map((entry) => ({
    id: `degree-${entry.institutionName}`,
    logo: entry.institutionLogo,
    issuer: entry.institutionName,
    credential: entry.qualification,
    typeLabel: entry.qualificationType,
    outcome: entry.gradeAchieved,
    year: entry.dateAchieved,
    summary: entry.howThisHasHelpedYouAsAPM,
    fullSummary: entry.howThisHasHelpedYouAsAPM,
    modules: entry.modulesOrFocusAreas,
  }));
  const certificateRows: EducationRow[] = certifications.map((entry) => ({
    id: `certificate-${entry.certificationName}`,
    logo: entry.awardingBodyLogo,
    issuer: entry.awardingBodyName,
    credential: entry.certificationName,
    typeLabel: 'Certificate',
    outcome: 'Certificate',
    year: entry.dateAchieved,
    summary: conciseCredentialSummary(entry.howThisHasHelpedYouAsAPM),
    fullSummary: entry.howThisHasHelpedYouAsAPM,
    modules: entry.modulesIncluded,
  }));
  const featuredDegreeRows = degreeRows.filter((row) => row.issuer === 'Imperial College London').slice(0, 1);
  const featuredCertificateNames = new Set([
    'AI Engineer Certification',
    'Professional Machine Learning Engineer',
    'MCP Advanced Topics',
  ]);
  const expandedCertificateNames = [
    'AI Engineer Certification',
    'Professional Machine Learning Engineer',
    'Generative AI Leader',
    'MCP Advanced Topics',
    'MBTi Leadership Development Programme',
  ];
  const featuredCertificateRows = certificateRows.filter((row) => featuredCertificateNames.has(row.credential));
  const expandedCertificateRows = expandedCertificateNames
    .map((name) => certificateRows.find((row) => row.credential === name))
    .filter((row): row is EducationRow => Boolean(row));
  const detailRows = [...featuredDegreeRows, ...expandedCertificateRows];

  return (
    <section
      data-education-card
      aria-expanded={isActive}
      className={`relative rounded-[1.45rem] p-3.5 outline-none transition duration-300 ${
        isActive ? 'flex h-full flex-col liquid-glass-strong' : 'liquid-glass hover:bg-white/70'
      }`}
    >
      {!isActive ? (
        <button
          type="button"
          aria-expanded={isActive}
          onClick={onToggle}
          className="group/education block w-full rounded-[1.15rem] text-left outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <span className="flex items-start justify-between gap-3">
            <span className="grid min-w-0 flex-1 gap-2.5">
              <span className="font-display text-[1.55rem] italic leading-none tracking-[0] text-text-primary">
                Degrees
              </span>
              <span className="flex min-w-0">
                {featuredDegreeRows.map((row) => (
                  <EducationSummaryChip
                    key={row.id}
                    label={`${row.typeLabel} - ${row.issuer}`}
                    variant="degree"
                  />
                ))}
              </span>
              <span className="pt-1 font-display text-[1.55rem] italic leading-none tracking-[0] text-text-primary">
                Certifications
              </span>
              <span className="education-certification-chip-row">
                {featuredCertificateRows.map((row) => (
                  <EducationSummaryChip
                    key={row.id}
                    label={`${educationCredentialChipName(row.credential)} - ${educationIssuerChipName(row.issuer)}`}
                    variant="certification"
                  />
                ))}
              </span>
            </span>
            <ExpandIndicator isActive={isActive} />
          </span>
        </button>
      ) : (
        <button
          type="button"
          aria-label="Collapse qualifications"
          aria-expanded={isActive}
          onClick={onToggle}
          className="education-collapse-button rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <ExpandIndicator isActive={isActive} />
        </button>
      )}

      <AnimatePresence initial={false}>
        {isActive ? (
          <motion.div
            key="education-details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.25, 0.1, 0.25, 1] }}
            className="min-h-0 flex-1 overflow-hidden"
          >
            <div className="education-detail-scroll portfolio-stage-scroll grid h-full min-h-0 content-start gap-2.5 pr-1">
              {detailRows.map((row) => (
                <EducationDetailPanel key={row.id} row={row} />
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

function WorkFloatingHeader({ intro, hideSubtitle }: { intro: string; hideSubtitle: boolean }) {
  if (hideSubtitle) return null;

  return (
    <div className="pointer-events-none relative z-20 px-7 pt-7 lg:absolute lg:left-10 lg:top-10 lg:max-w-[29rem] lg:p-0">
      <p className="text-[0.62rem] uppercase tracking-[0.3em] text-muted">02 / Work</p>
      <h2 className="mt-4 font-display text-[2.7rem] font-normal italic leading-[0.9] tracking-[0] text-text-primary md:text-[3.6rem] lg:text-[3.8rem]">
        Experiences & Qualifications
      </h2>
      <AnimatePresence initial={false}>
        {!hideSubtitle ? (
          <motion.p
            key="work-subtitle"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="mt-5 max-w-xl text-xs leading-5 text-muted md:mt-6 md:text-sm md:leading-5"
          >
            {intro}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function ExperienceEducationSection() {
  const { intro, companies } = portfolioContent.productManagementWorkExperiences;
  const [activeWorkIndex, setActiveWorkIndex] = useState<number | null>(null);
  const [isEducationExpanded, setIsEducationExpanded] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const educationCardRef = useRef<HTMLDivElement | null>(null);
  const previewEntry = activeWorkIndex === null ? null : companies[activeWorkIndex];

  const handleEducationToggle = () => {
    setIsEducationExpanded((current) => {
      const next = !current;
      if (next) {
        requestAnimationFrame(() => {
          const section = sectionRef.current;
          const stage = section?.closest<HTMLElement>('.portfolio-stage');
          if (!section || !stage) return;
          stage.scrollTo({ top: section.offsetTop, left: 0, behavior: 'smooth' });
        });
      }
      return next;
    });
  };

  useEffect(() => {
    if (!isEducationExpanded) return;

    const handlePointerDown = (event: PointerEvent) => {
      const card = educationCardRef.current;
      if (!card || !(event.target instanceof Node) || card.contains(event.target)) return;
      setIsEducationExpanded(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsEducationExpanded(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEducationExpanded]);

  return (
    <section
      ref={sectionRef}
      id="experience-education"
      className="relative isolate min-h-full overflow-visible rounded-[24px] bg-transparent p-4 sm:rounded-[34px] lg:h-full lg:min-h-0 lg:overflow-hidden lg:p-5"
    >
      <div className="work-section-opacity-layer absolute inset-0 z-0" aria-hidden="true" />
      <WorkFloatingHeader intro={intro} hideSubtitle={isEducationExpanded} />
      <AnimatePresence initial={false}>
        {isEducationExpanded ? (
          <motion.button
            type="button"
            aria-label="Collapse qualifications"
            className="work-education-dim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={() => setIsEducationExpanded(false)}
          />
        ) : null}
      </AnimatePresence>
      <div className="relative min-h-full w-full max-w-none lg:h-full lg:min-h-0">
        <div
          className="relative grid min-h-full gap-5 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,0.382fr)_minmax(0,0.618fr)]"
        >
          <motion.aside
            className={`work-dashboard-scroll relative flex min-h-[42rem] flex-col p-0 lg:h-full lg:min-h-0 lg:overflow-y-auto ${
              isEducationExpanded ? 'z-30' : ''
            }`}
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="min-h-[14rem] shrink-0" />
            {previewEntry ? (
              <div className="mb-4 flex w-full min-h-0 shrink-0">
                <ProductVideoPreview entry={previewEntry} isActive={activeWorkIndex !== null} />
              </div>
            ) : null}
            <div
              ref={educationCardRef}
              className={`transition-[bottom,top,height] duration-300 ${
                isEducationExpanded
                  ? 'absolute inset-0 z-50 h-full'
                  : 'mt-auto lg:absolute lg:bottom-0 lg:left-0 lg:right-0 lg:z-20'
              }`}
            >
              <EducationCard
                isActive={isEducationExpanded}
                onToggle={handleEducationToggle}
              />
            </div>
          </motion.aside>

          <motion.div
            className="relative z-0 min-w-0 lg:h-full lg:min-h-0"
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.06 }}
          >
            <ProductManagementWorkRail activeIndex={activeWorkIndex} onActiveIndexChange={setActiveWorkIndex} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function AiRaminSection() {
  const chatbot = portfolioContent.aiRaminChatbot;
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<AiRaminMessage[]>(() => [
    {
      id: 'assistant-intro',
      role: 'assistant',
      content: `${aiRaminPrototype.headline}\n\n${aiRaminPrototype.description}`,
      isIntro: true,
    },
  ]);
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const promptInputRef = useRef<HTMLTextAreaElement | null>(null);
  const threadEndRef = useRef<HTMLDivElement | null>(null);
  const examplePrompts = aiRaminPrototype.examplePrompts.slice(0, 4);
  const hasConversationStarted = messages.some((message) => message.role === 'user');

  useEffect(() => {
    const input = promptInputRef.current;
    if (!input) return;

    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 132)}px`;
  }, [prompt]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [messages, isSending, chatError]);

  const sendMessage = useCallback(
    async (messageOverride?: string) => {
      const messageText = (messageOverride ?? prompt).trim();
      if (!messageText || isSending) return;

      const requestHistory = messages
        .filter((message) => !message.isIntro)
        .map((message) => ({
          role: message.role,
          content: message.content,
        }));
      const userMessage: AiRaminMessage = {
        id: createAiRaminMessageId('user'),
        role: 'user',
        content: messageText,
      };

      setMessages((currentMessages) => [...currentMessages, userMessage]);
      setPrompt('');
      setChatError(null);
      setIsSending(true);

      try {
        const response = await fetch('/api/ai-ramin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: messageText,
            history: requestHistory,
          }),
        });
        const responsePayload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(responsePayload?.error || 'AI Ramin could not answer that yet.');
        }

        setMessages((currentMessages) => [
          ...currentMessages,
          {
            id: createAiRaminMessageId('assistant'),
            role: 'assistant',
            content: String(responsePayload?.answer || '').trim(),
          },
        ]);
      } catch (error) {
        setChatError(error instanceof Error ? error.message : 'AI Ramin could not answer that yet.');
      } finally {
        setIsSending(false);
      }
    },
    [isSending, messages, prompt],
  );

  return (
    <section id="ai-ramin" className="ai-ramin-section ai-ramin-thoughts-background relative isolate h-full min-h-full overflow-hidden">
      <div className="ai-ramin-ambient" aria-hidden="true" />
      <div className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-[1120px] flex-col px-5 py-8 sm:px-8 md:px-12 lg:px-16">
        <header className="ai-ramin-header flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="ai-ramin-avatar">
              <img src={profileImageUrl} alt="" decoding="async" />
            </span>
            <div className="min-w-0">
              <p className="text-[0.65rem] uppercase tracking-[0.26em] text-white/48">Live portfolio chat</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
                {chatbot.modalTitle}
              </h2>
            </div>
          </div>
          <span className="ai-ramin-model-pill hidden sm:inline-flex">Portfolio copilot</span>
        </header>

        <div className="ai-ramin-chat relative mt-8 flex min-h-0 flex-1 flex-col">
          <div className="ai-ramin-thread" aria-live="polite">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`ai-ramin-message-row ai-ramin-message-row-${message.role} ${
                  message.isIntro ? 'ai-ramin-message-row-intro' : ''
                }`}
              >
                {message.role === 'assistant' ? (
                  <span className="ai-ramin-avatar ai-ramin-avatar-small">
                    <img src={profileImageUrl} alt="" decoding="async" />
                  </span>
                ) : null}
                <div
                  className={`ai-ramin-message ${message.role === 'user' ? 'ai-ramin-user-bubble' : ''} ${
                    message.isIntro ? 'ai-ramin-message-intro' : ''
                  }`}
                >
                  {message.content.split(/\n{2,}/).map((paragraph, index) => (
                    <p key={`${message.id}-${index}`}>{paragraph}</p>
                  ))}
                </div>
              </div>
            ))}

            {!hasConversationStarted ? (
              <div className="ai-ramin-example-grid">
              {examplePrompts.map((example, index) => (
                <button
                  key={example}
                  type="button"
                  className={`ai-ramin-example-field ${index === 1 || index === 3 ? 'is-wide' : ''}`}
                  onClick={() => void sendMessage(example)}
                  disabled={isSending}
                >
                  <span>{example}</span>
                </button>
              ))}
              </div>
            ) : null}

            {isSending ? (
              <div className="ai-ramin-message-row ai-ramin-message-row-assistant">
                <span className="ai-ramin-avatar ai-ramin-avatar-small">
                  <img src={profileImageUrl} alt="" decoding="async" />
                </span>
                <div className="ai-ramin-message ai-ramin-message-compact">
                  <span className="ai-ramin-thinking-dots" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                  <span>Reading the portfolio context...</span>
                </div>
              </div>
            ) : null}

            {chatError ? (
              <div className="ai-ramin-chat-error" role="alert">
                {chatError}
              </div>
            ) : null}

            <div ref={threadEndRef} />
          </div>

          <form
            className="ai-ramin-composer"
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage();
            }}
          >
            <label htmlFor="ai-ramin-page-prompt" className="sr-only">
              {chatbot.textarea.label}
            </label>
            <textarea
              id="ai-ramin-page-prompt"
              ref={promptInputRef}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              placeholder="Message AI Ramin"
              className="ai-ramin-composer-input"
              autoComplete="off"
              rows={1}
            />
            <button
              type="submit"
              className="ai-ramin-send-button"
              aria-label="Send message"
              disabled={isSending || !prompt.trim()}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h13" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const { contactCta } = portfolioContent;
  const marqueeRef = useRef<HTMLDivElement | null>(null);
  const copyResetTimeoutRef = useRef<number | null>(null);
  const [emailCopied, setEmailCopied] = useState(false);
  const emailAddress = contactCta.ctaButtons[0].href;
  const marqueeText = useMemo(
    () => Array.from({ length: 10 }, () => `${contactCta.artisticHeroText} . `).join(''),
    [contactCta.artisticHeroText],
  );
  const headlineLines = useMemo(() => {
    if (contactCta.headline === "Let's create beautiful things that the world really needs") {
      return ["Let's create beautiful", 'things that the world', 'really needs'];
    }

    return [contactCta.headline];
  }, [contactCta.headline]);

  const handleCopyEmail = useCallback(async () => {
    try {
      const copyFromHiddenTextarea = () => {
        const textarea = document.createElement('textarea');
        textarea.value = emailAddress;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        textarea.setSelectionRange(0, textarea.value.length);
        const copied = document.execCommand('copy');
        document.body.removeChild(textarea);
        return copied;
      };

      let didCopy = copyFromHiddenTextarea();

      if (!didCopy && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(emailAddress);
        didCopy = true;
      }

      if (!didCopy) throw new Error('Unable to copy email address.');

      setEmailCopied(true);
      if (copyResetTimeoutRef.current) window.clearTimeout(copyResetTimeoutRef.current);
      copyResetTimeoutRef.current = window.setTimeout(() => setEmailCopied(false), 1800);
    } catch {
      setEmailCopied(false);
    }
  }, [emailAddress]);

  useLayoutEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return undefined;

    const ctx = gsap.context(() => {
      gsap.to(marquee, {
        xPercent: -50,
        duration: 49.2,
        ease: 'none',
        repeat: -1,
      });
    }, marquee);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    return () => {
      if (copyResetTimeoutRef.current) window.clearTimeout(copyResetTimeoutRef.current);
    };
  }, []);

  return (
    <section
      id="contact"
      className="relative isolate flex min-h-[calc(100vh-1.5rem)] items-center justify-center overflow-hidden bg-transparent px-6 pb-36 pt-24 text-center md:min-h-[calc(100vh-3rem)] md:px-10 md:pb-40 md:pt-28 lg:px-16"
    >
      <div className="absolute inset-0 z-0 bg-white/8" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 z-[2] h-44 bg-gradient-to-b from-bg/80 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 z-[2] h-52 bg-gradient-to-t from-bg/80 to-transparent" />

      <svg
        className="contact-headline-cutout-layer contact-headline-cutout-layer-desktop"
        viewBox="0 0 1600 900"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <mask id="contact-headline-cutout-mask-desktop" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="900">
            <rect x="0" y="0" width="1600" height="900" fill="white" />
            {headlineLines.map((line, index) => (
              <text
                key={line}
                className="hero-name-cutout-mask-text contact-headline-cutout-mask-text-desktop"
                x="800"
                y={320 + index * 118}
                fill="black"
              >
                {line}
              </text>
            ))}
          </mask>
        </defs>
        <rect
          className="contact-headline-cutout-surface"
          x="0"
          y="0"
          width="1600"
          height="900"
          fill="white"
          mask="url(#contact-headline-cutout-mask-desktop)"
        />
      </svg>

      <svg
        className="contact-headline-cutout-layer contact-headline-cutout-layer-mobile"
        viewBox="0 0 600 760"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <mask id="contact-headline-cutout-mask-mobile" maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="760">
            <rect x="0" y="0" width="600" height="760" fill="white" />
            {headlineLines.map((line, index) => (
              <text
                key={line}
                className="hero-name-cutout-mask-text contact-headline-cutout-mask-text-mobile"
                x="300"
                y={254 + index * 72}
                fill="black"
              >
                {line}
              </text>
            ))}
          </mask>
        </defs>
        <rect
          className="contact-headline-cutout-surface"
          x="0"
          y="0"
          width="600"
          height="760"
          fill="white"
          mask="url(#contact-headline-cutout-mask-mobile)"
        />
      </svg>

      <div className="pointer-events-none absolute inset-x-0 top-8 z-[3] overflow-hidden py-4 md:top-10">
        <div
          ref={marqueeRef}
          className="flex w-max whitespace-nowrap font-display text-5xl italic text-text-primary/10 md:text-8xl"
        >
          <span>{marqueeText}</span>
          <span>{marqueeText}</span>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center">
        <p className="translate-y-20 text-xs uppercase tracking-[0.3em] text-muted md:translate-y-24">{contactCta.hook}</p>
        <h2 className="sr-only">{contactCta.headline}</h2>
        <div className="contact-headline-cutout-spacer" aria-hidden="true" />

        <div className="mt-24 flex w-full flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          {contactCta.ctaButtons.map((button, index) => {
            const isPlaceholder = isPlaceholderValue(button.href);
            const href = isPlaceholder ? undefined : button.href;
            const isPrimary = index === 0;
            const isEmailCta = isPrimary && href === emailAddress;

            if (isEmailCta) {
              return (
                <button
                  key={button.label}
                  type="button"
                  onClick={handleCopyEmail}
                  aria-label={`Copy ${emailAddress} to clipboard`}
                  className="group relative inline-flex max-w-full rounded-full p-[2px] text-sm transition duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                >
                  <span className="accent-gradient animated-gradient absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="relative inline-flex items-center gap-3 rounded-full bg-text-primary py-3 pl-6 pr-3.5 text-center text-bg transition duration-300 group-hover:bg-bg group-hover:text-text-primary">
                    <span className="max-w-[14.75rem] truncate sm:max-w-none">{emailAddress}</span>
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-bg/80 transition duration-300 group-hover:border-stroke group-hover:bg-white/85 group-hover:text-text-primary">
                      {emailCopied ? (
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      ) : (
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <rect x="9" y="9" width="13" height="13" rx="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      )}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute -top-3 right-4 inline-flex -translate-y-full items-center gap-1.5 rounded-full border border-stroke/70 bg-white/80 px-3 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-text-primary shadow-[0_12px_36px_rgba(15,23,42,0.14)] backdrop-blur-md transition duration-300 ${
                        emailCopied ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0'
                      }`}
                    >
                      <span className="accent-gradient h-1.5 w-1.5 rounded-full" />
                      Copied
                    </span>
                  </span>
                </button>
              );
            }

            if (!href) {
              return (
                <span
                  key={button.label}
                  className="inline-flex max-w-full rounded-full border border-dashed border-stroke/70 bg-white/45 px-7 py-3.5 text-sm text-muted"
                >
                  {button.label}
                </span>
              );
            }

            return (
              <GlassImprintCta
                key={button.label}
                label={button.label}
                ariaLabel={`Open ${button.label}`}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noreferrer' : undefined}
                className="contact-whatsapp-glass-button"
              />
            );
          })}
          <span className="sr-only" aria-live="polite">
            {emailCopied ? `${emailAddress} copied to clipboard` : ''}
          </span>
        </div>
      </div>
    </section>
  );
}

function MagicalRockScene({
  clickCount,
  revealed,
  gifts,
  preloadStatus,
  onRockClick,
}: {
  clickCount: number;
  revealed: boolean;
  gifts: BonusGiftEntry[];
  preloadStatus: BonusRockPreloadStatus;
  onRockClick: () => void;
}) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [rockReady, setRockReady] = useState(false);
  const clickCountRef = useRef(clickCount);
  const revealedRef = useRef(revealed);
  const targetTracksRef = useRef(getBonusRockAnimationTargets(clickCount));
  const clickImpulseRef = useRef(0);
  const lastActivationRef = useRef(0);

  useEffect(() => {
    if (clickCount > clickCountRef.current) {
      clickImpulseRef.current = 1;
    }

    clickCountRef.current = clickCount;
    revealedRef.current = revealed;
    targetTracksRef.current = getBonusRockAnimationTargets(clickCount);
  }, [clickCount, revealed]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let cancelled = false;
    let disposeScene: (() => void) | undefined;
    setRockReady(false);
    void preloadBonusRockAssets('visible');

    void Promise.all([
      import('three'),
      import('three/examples/jsm/loaders/GLTFLoader.js'),
      import('three/examples/jsm/loaders/DRACOLoader.js'),
      import('three/examples/jsm/loaders/KTX2Loader.js'),
    ]).then(async ([THREE, { GLTFLoader }, { DRACOLoader }, { KTX2Loader }]) => {
      if (cancelled || !mount.isConnected) return;

      validateHashgraphRockAssetPipeline();

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
      camera.position.set(0.1, 0.08, 5.8);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 720 ? 1.15 : 1.25));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.96;
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.className = 'hashgraph-bonus-rock-canvas';
      renderer.domElement.dataset.bonusRockCanvas = 'hashgraph-intro-rock';
      renderer.domElement.setAttribute('aria-hidden', 'true');
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.pointerEvents = 'none';
      renderer.domElement.style.width = '100%';
      mount.querySelectorAll('.hashgraph-bonus-rock-canvas').forEach((canvas) => canvas.remove());
      mount.appendChild(renderer.domElement);

      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      const envScene = new THREE.Scene();
      const envSky = new THREE.Mesh(
        new THREE.SphereGeometry(50, 32, 15),
        new THREE.ShaderMaterial({
          side: THREE.BackSide,
          uniforms: {
            topColor: { value: new THREE.Color(0xf8fcff) },
            bottomColor: { value: new THREE.Color(0xb8d0e0) },
            offset: { value: 8 },
            exponent: { value: 0.5 },
          },
          vertexShader: `
            varying vec3 vWorldPosition;
            void main() {
              vec4 worldPos = modelMatrix * vec4(position, 1.0);
              vWorldPosition = worldPos.xyz;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            uniform float offset;
            uniform float exponent;
            varying vec3 vWorldPosition;
            void main() {
              float h = normalize(vWorldPosition + offset).y;
              gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
            }
          `,
        }),
      );
      envScene.add(envSky);
      envScene.add(new THREE.AmbientLight(0xffffff, 0.46));
      const envLight = new THREE.DirectionalLight(0xffffff, 1.35);
      envLight.position.set(5, 10, -5);
      envScene.add(envLight);
      const envMap = pmremGenerator.fromScene(envScene, 0, 0.1, 100).texture;
      scene.environment = envMap;
      pmremGenerator.dispose();
      envSky.geometry.dispose();
      envSky.material.dispose();

      const rockGroup = new THREE.Group();
      rockGroup.rotation.set(-0.06, -0.12, 0.025);
      scene.add(rockGroup);

      const keyLight = new THREE.DirectionalLight(0xf8fbff, 3.05);
      keyLight.position.set(4.5, 6, 5);
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0xbfdfff, 1.8);
      rimLight.position.set(-4, 2.8, -3.5);
      scene.add(rimLight);

      const glowLight = new THREE.PointLight(0x91c7ec, 1.45, 9);
      glowLight.position.set(-0.6, 0.35, 2.2);
      scene.add(glowLight);
      scene.add(new THREE.AmbientLight(0xe7f3ff, 0.76));

      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath(hashgraphRockAssetPipeline.decoders.dracoDecoderPath);
      dracoLoader.setDecoderConfig({ type: 'wasm' });
      dracoLoader.setWorkerLimit(1);

      const ktx2Loader = new KTX2Loader();
      ktx2Loader.setTranscoderPath(hashgraphRockAssetPipeline.decoders.basisTranscoderPath);
      ktx2Loader.setWorkerLimit(1);
      ktx2Loader.detectSupport(renderer);

      const gltfLoader = new GLTFLoader();
      gltfLoader.setDRACOLoader(dracoLoader);
      gltfLoader.setKTX2Loader(ktx2Loader);

      let rockMaterial: import('three').MeshStandardMaterial | undefined;
      let rockRoot: import('three').Object3D | undefined;
      const rockShards: {
        mesh: import('three').Mesh;
        basePosition: import('three').Vector3;
        baseRotation: import('three').Euler;
        baseScale: import('three').Vector3;
        blast: import('three').Vector3;
        fracture: import('three').Vector3;
        spin: import('three').Vector3;
        fractureThreshold: number;
        fractureStrength: number;
        ruptureStrength: number;
        falloff: number;
        delay: number;
      }[] = [];

      const smoothstep = (value: number) => value * value * (3 - 2 * value);
      const seededRandom = (seed: number) => {
        const value = Math.sin(seed * 12.9898) * 43758.5453;
        return value - Math.floor(value);
      };
      const randomUnit = () => new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.18, Math.random() - 0.5).normalize();

      const createRockMaterial = async () => {
        try {
          const [metallicRoughnessTex, baseColorTex, emissiveTex, normalTex] = await Promise.all([
            ktx2Loader.loadAsync(hashgraphRockAssetPipeline.textureUrls.metallicRoughness),
            ktx2Loader.loadAsync(hashgraphRockAssetPipeline.textureUrls.baseColor),
            ktx2Loader.loadAsync(hashgraphRockAssetPipeline.textureUrls.emissive),
            ktx2Loader.loadAsync(hashgraphRockAssetPipeline.textureUrls.normal),
          ]);

          baseColorTex.colorSpace = THREE.SRGBColorSpace;
          emissiveTex.colorSpace = THREE.SRGBColorSpace;

          return new THREE.MeshStandardMaterial({
            map: baseColorTex,
            emissiveMap: emissiveTex,
            emissive: new THREE.Color(0xcdf8ff),
            emissiveIntensity: 1.16,
            normalMap: normalTex,
            roughnessMap: metallicRoughnessTex,
            metalnessMap: metallicRoughnessTex,
            roughness: 0.5,
            metalness: 0.46,
            color: 0x315d78,
            envMapIntensity: 0.54,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 1,
          });
        } catch (error) {
          console.warn('Original WebGL rock material failed to load, using fallback material.', error);
          return new THREE.MeshStandardMaterial({
            color: 0x315d78,
            emissive: new THREE.Color(0xcdf8ff),
            emissiveIntensity: 1.16,
            roughness: 0.5,
            metalness: 0.46,
            envMapIntensity: 0.54,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 1,
          });
        }
      };

      const normalizeRock = (object: import('three').Object3D) => {
        object.scale.setScalar(1.3);
        object.updateMatrixWorld(true);

        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        object.position.set(-center.x, -center.y, -center.z);
        object.updateMatrixWorld(true);

        const fov = camera.fov * (Math.PI / 180);
        const distance = (Math.max(size.y, 2.2) * 1.72) / (2 * Math.tan(fov / 2));
        camera.position.set(0.12, 0.14, Math.max(4.75, distance));
        camera.lookAt(0, 0.02, 0);
      };

      const prepareShards = (object: import('three').Object3D) => {
        object.updateMatrixWorld(true);
        const rootBox = new THREE.Box3().setFromObject(object);
        const rootCenter = rootBox.getCenter(new THREE.Vector3());
        const rootSize = rootBox.getSize(new THREE.Vector3());

        object.traverse((child: import('three').Object3D) => {
          if (!(child instanceof THREE.Mesh) || !child.geometry) return;

          const shardIndex = rockShards.length + 1;
          const shardBox = new THREE.Box3().setFromObject(child);
          const shardCenter = shardBox.getCenter(new THREE.Vector3());
          const worldBlast = shardCenter.clone().sub(rootCenter);
          if (worldBlast.lengthSq() < 0.0001) {
            worldBlast.copy(randomUnit());
          }
          worldBlast.normalize();
          worldBlast.x += (Math.random() - 0.5) * 0.35;
          worldBlast.y += 0.2 + Math.random() * 0.34;
          worldBlast.z += (Math.random() - 0.5) * 0.35;
          worldBlast.normalize();

          const parent = child.parent ?? rockGroup;
          const localStart = parent.worldToLocal(shardCenter.clone());
          const localEnd = parent.worldToLocal(shardCenter.clone().add(worldBlast));
          const blast = localEnd.sub(localStart);
          if (blast.lengthSq() < 0.0001) blast.copy(randomUnit());
          blast.normalize();

          const shardSeed =
            shardIndex * 17.17 +
            shardCenter.x * 11.11 +
            shardCenter.y * 23.23 +
            shardCenter.z * 31.31;
          const fractureRoll = seededRandom(shardSeed);
          const heightRatio = THREE.MathUtils.clamp((shardCenter.y - rootBox.min.y) / Math.max(rootSize.y, 0.001), 0, 1);
          const radialRatio = THREE.MathUtils.clamp(
            Math.hypot(
              (shardCenter.x - rootCenter.x) / Math.max(rootSize.x, 0.001),
              (shardCenter.z - rootCenter.z) / Math.max(rootSize.z, 0.001),
            ) * 1.8,
            0,
            1,
          );
          const fractureEligible = fractureRoll > 0.56 && heightRatio > 0.12 && heightRatio < 0.9;
          const fractureStrength = fractureEligible ? (0.34 + seededRandom(shardSeed + 1.9) * 0.46) * (0.72 + radialRatio * 0.28) : 0;
          const fractureThreshold = 0.4 + seededRandom(shardSeed + 4.7) * 0.34;
          const worldFracture = worldBlast
            .clone()
            .multiplyScalar(0.68)
            .add(new THREE.Vector3((seededRandom(shardSeed + 7.1) - 0.5) * 0.42, (heightRatio - 0.46) * 0.26, (seededRandom(shardSeed + 8.3) - 0.5) * 0.42))
            .normalize();
          const localFractureEnd = parent.worldToLocal(shardCenter.clone().add(worldFracture));
          const fracture = localFractureEnd.sub(localStart.clone());
          if (fracture.lengthSq() < 0.0001) fracture.copy(blast);
          fracture.normalize();

          rockShards.push({
            mesh: child,
            basePosition: child.position.clone(),
            baseRotation: child.rotation.clone(),
            baseScale: child.scale.clone(),
            blast,
            fracture,
            spin: new THREE.Vector3(
              (Math.random() - 0.5) * 1.6,
              (Math.random() - 0.5) * 1.9,
              (Math.random() - 0.5) * 1.4,
            ),
            fractureThreshold,
            fractureStrength,
            ruptureStrength: 0.78 + seededRandom(shardSeed + 11.6) * 0.56,
            falloff: 0.12 + seededRandom(shardSeed + 15.4) * 0.38,
            delay: seededRandom(shardSeed + 19.2) * 0.18,
          });
        });
      };

      const particleCount = window.innerWidth < 720 ? 640 : 920;
      const particlePositions = new Float32Array(particleCount * 3);
      const basePositions = new Float32Array(particleCount * 3);
      const velocities = new Float32Array(particleCount * 3);
      const particleSizes = new Float32Array(particleCount);
      const particleSeeds = new Float32Array(particleCount);

      const seedFallbackParticles = () => {
        for (let i = 0; i < particleCount; i += 1) {
          const radius = 0.25 + Math.random() * 0.9;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const idx = i * 3;
          const x = radius * Math.sin(phi) * Math.cos(theta);
          const y = radius * Math.sin(phi) * Math.sin(theta);
          const z = radius * Math.cos(phi);
          basePositions[idx] = x;
          basePositions[idx + 1] = y;
          basePositions[idx + 2] = z;
          particlePositions[idx] = x;
          particlePositions[idx + 1] = y;
          particlePositions[idx + 2] = z;
          const direction = new THREE.Vector3(x, y + 0.2, z).normalize();
          velocities[idx] = direction.x * (1.5 + Math.random() * 2.7);
          velocities[idx + 1] = direction.y * (1.4 + Math.random() * 2.4) + Math.random() * 1.2;
          velocities[idx + 2] = direction.z * (1.5 + Math.random() * 2.7);
        }
      };

      const seedParticlesFromModel = (object: import('three').Object3D) => {
        object.updateMatrixWorld(true);
        const meshes: { mesh: import('three').Mesh; position: import('three').BufferAttribute; end: number }[] = [];
        let totalVertices = 0;

        object.traverse((child: import('three').Object3D) => {
          if (!(child instanceof THREE.Mesh) || !child.geometry) return;
          const position = child.geometry.getAttribute('position') as import('three').BufferAttribute | undefined;
          if (!position?.count) return;
          totalVertices += position.count;
          meshes.push({ mesh: child, position, end: totalVertices });
        });

        if (!meshes.length || !totalVertices) {
          seedFallbackParticles();
          return;
        }

        const sample = new THREE.Vector3();
        const direction = new THREE.Vector3();
        for (let i = 0; i < particleCount; i += 1) {
          const pick = Math.floor(Math.random() * totalVertices);
          const sourceIndex = meshes.findIndex((entry) => pick < entry.end);
          const source = meshes[sourceIndex] ?? meshes[0];
          const previousEnd = sourceIndex > 0 ? meshes[sourceIndex - 1].end : 0;
          const vertexIndex = pick - previousEnd;
          const idx = i * 3;

          sample.fromBufferAttribute(source.position, vertexIndex);
          source.mesh.localToWorld(sample);
          rockGroup.worldToLocal(sample);

          basePositions[idx] = sample.x;
          basePositions[idx + 1] = sample.y;
          basePositions[idx + 2] = sample.z;
          particlePositions[idx] = sample.x;
          particlePositions[idx + 1] = sample.y;
          particlePositions[idx + 2] = sample.z;

          direction.copy(sample);
          if (direction.lengthSq() < 0.0001) direction.copy(randomUnit());
          direction.normalize();
          direction.y += 0.16 + Math.random() * 0.24;
          direction.x += (Math.random() - 0.5) * 0.28;
          direction.z += (Math.random() - 0.5) * 0.28;
          direction.normalize();

          const layer = Math.random();
          const force = layer < 0.42 ? 0.9 + Math.random() * 1.25 : layer < 0.8 ? 1.8 + Math.random() * 2.2 : 3.2 + Math.random() * 2.6;
          velocities[idx] = direction.x * force;
          velocities[idx + 1] = direction.y * force + 0.35 + Math.random() * 1.15;
          velocities[idx + 2] = direction.z * force;
        }
      };

      seedFallbackParticles();

      for (let i = 0; i < particleCount; i += 1) {
        const sizeRoll = Math.random();
        particleSizes[i] = sizeRoll < 0.7 ? 0.65 + Math.random() * 1.4 : 1.8 + Math.random() * 2.4;
        particleSeeds[i] = Math.random();
      }

      const particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      particleGeometry.setAttribute('aSize', new THREE.BufferAttribute(particleSizes, 1));
      particleGeometry.setAttribute('aSeed', new THREE.BufferAttribute(particleSeeds, 1));
      const particlePositionAttribute = particleGeometry.getAttribute('position') as import('three').BufferAttribute;
      const particleMaterial = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: 0 },
          uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.8) },
        },
        vertexShader: `
          attribute float aSize;
          attribute float aSeed;
          uniform float uTime;
          uniform float uPixelRatio;
          varying float vSeed;
          varying float vAlpha;
          void main() {
            vSeed = aSeed;
            vec3 pos = position;
            pos.y += sin(uTime * 0.8 + aSeed * 13.0) * 0.035;
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = aSize * uPixelRatio * (58.0 / max(1.0, -mvPosition.z));
            gl_Position = projectionMatrix * mvPosition;
            vAlpha = smoothstep(60.0, 3.0, -mvPosition.z);
          }
        `,
        fragmentShader: `
          uniform float uOpacity;
          varying float vSeed;
          varying float vAlpha;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            if (d > 0.5) discard;
            float glow = exp(-d * d * 14.0);
            vec3 blue = vec3(0.46, 0.68, 0.88);
            vec3 white = vec3(0.88, 0.97, 1.0);
            vec3 silver = vec3(0.62, 0.72, 0.82);
            vec3 color = mix(mix(blue, white, smoothstep(0.0, 0.55, vSeed)), silver, smoothstep(0.82, 1.0, vSeed));
            gl_FragColor = vec4(color, glow * uOpacity * vAlpha * 0.88);
          }
        `,
      });
      const particles = new THREE.Points(particleGeometry, particleMaterial);
      particles.frustumCulled = false;
      particles.renderOrder = 3;
      rockGroup.add(particles);

      const shockwaveGeometry = new THREE.RingGeometry(0.82, 0.9, 128);
      const shockwaveMaterial = new THREE.MeshBasicMaterial({
        color: 0xc5ecf8,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
        side: THREE.DoubleSide,
      });
      const shockwave = new THREE.Mesh(shockwaveGeometry, shockwaveMaterial);
      shockwave.renderOrder = 4;
      shockwave.position.set(0, 0.02, 0.04);
      rockGroup.add(shockwave);

      try {
        rockMaterial = await createRockMaterial();
        if (cancelled || !mount.isConnected) return;

        const gltf = await gltfLoader.loadAsync(hashgraphRockAssetPipeline.modelUrl);
        if (cancelled || !mount.isConnected) return;

        rockRoot = gltf.scene;
        rockRoot.traverse((child: import('three').Object3D) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.material = rockMaterial as import('three').MeshStandardMaterial;
          }
        });

        normalizeRock(rockRoot);
        rockGroup.add(rockRoot);
        prepareShards(rockRoot);
        seedParticlesFromModel(rockRoot);
      } catch (error) {
        console.warn('Original WebGL rock failed to load, using fallback geometry.', error);
        if (!rockMaterial) rockMaterial = await createRockMaterial();
        if (cancelled || !mount.isConnected) return;
        const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 4), rockMaterial);
        mesh.rotation.set(-0.18, 0.18, 0.08);
        rockRoot = mesh;
        rockGroup.add(mesh);
        prepareShards(mesh);
      }

      setRockReady(true);

      let frameId = 0;
      const initialTracks = targetTracksRef.current;
      let wakeProgress = initialTracks.wakeProgress;
      let fractureProgress = initialTracks.fractureProgress;
      let ruptureProgress = initialTracks.ruptureProgress;
      let giftPeekProgress = initialTracks.giftPeekProgress;
      let giftRevealProgress = initialTracks.giftRevealProgress;
      let rockSceneInView = true;
      let layoutRockScale = 1;
      let particlesWereActive = false;
      const clock = new THREE.Clock();

      const resize = () => {
        const rect = mount.getBoundingClientRect();
        const width = Math.max(Math.round(rect.width || mount.clientWidth || 640), 1);
        const height = Math.max(Math.round(rect.height || mount.clientHeight || 430), 1);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        const fov = camera.fov * (Math.PI / 180);
        const visibleHeight = 2 * Math.tan(fov / 2) * camera.position.z;
        const visibleWidth = visibleHeight * camera.aspect;
        const isWide = width >= 820;
        layoutRockScale = isWide ? 1 : width < 520 ? 0.72 : 0.82;
        rockGroup.position.set(isWide ? visibleWidth * 0.22 : 0, isWide ? 0.02 : -visibleHeight * 0.18, 0);
      };

      const observer = new ResizeObserver(resize);
      observer.observe(mount);
      resize();
      const settledResizeFrame = window.requestAnimationFrame(resize);
      const settledResizeTimer = window.setTimeout(resize, 120);

      const shouldRenderRockScene = () =>
        !cancelled && mount.isConnected && rockSceneInView && document.visibilityState === 'visible';

      const scheduleRockFrame = () => {
        if (frameId || !shouldRenderRockScene()) return;
        frameId = window.requestAnimationFrame(animate);
      };

      function animate() {
        frameId = 0;
        if (!shouldRenderRockScene()) return;

        const delta = Math.min(clock.getDelta(), 0.05);
        const elapsed = clock.elapsedTime;
        clickImpulseRef.current = Math.max(0, clickImpulseRef.current - delta * (revealedRef.current ? 1.15 : 1.8));
        const clickStage = Math.min(clickCountRef.current, BONUS_ROCK_FINAL_CLICK_COUNT);
        const clickStageRatio = clickStage / BONUS_ROCK_FINAL_CLICK_COUNT;
        const clickImpulse = smoothstep(THREE.MathUtils.clamp(clickImpulseRef.current, 0, 1));
        const clickExpansion = 1 - clickImpulse;
        const targetTracks = targetTracksRef.current;
        wakeProgress += (targetTracks.wakeProgress - wakeProgress) * Math.min(1, delta * 5.4);
        fractureProgress += (targetTracks.fractureProgress - fractureProgress) * Math.min(1, delta * 4.2);
        ruptureProgress += (targetTracks.ruptureProgress - ruptureProgress) * Math.min(1, delta * 2.35);
        giftPeekProgress += (targetTracks.giftPeekProgress - giftPeekProgress) * Math.min(1, delta * 4.4);
        giftRevealProgress += (targetTracks.giftRevealProgress - giftRevealProgress) * Math.min(1, delta * 3.1);

        const wake = smoothstep(THREE.MathUtils.clamp(wakeProgress, 0, 1));
        const fracture = smoothstep(THREE.MathUtils.clamp(fractureProgress, 0, 1));
        const rupture = smoothstep(THREE.MathUtils.clamp(ruptureProgress, 0, 1));
        const giftPeek = smoothstep(THREE.MathUtils.clamp(giftPeekProgress, 0, 1));
        const giftReveal = smoothstep(THREE.MathUtils.clamp(giftRevealProgress, 0, 1));
        const preRuptureEnergy = Math.max(wake * 0.52, fracture);
        const pressurePulse =
          Math.sin(elapsed * (4.4 + wake * 1.2 + fracture * 2.4 + rupture * 3.2)) *
            (0.025 * wake + 0.06 * fracture + 0.08 * rupture) +
          clickImpulse * (clickStage === 1 ? 0.07 : clickStage === 2 ? 0.12 : 0.24);

        rockGroup.rotation.y += delta * (0.14 + wake * 0.04 + fracture * 0.08 + rupture * 0.42);
        rockGroup.rotation.x = -0.06 + Math.sin(elapsed * 1.45) * (0.018 + preRuptureEnergy * 0.016);
        rockGroup.rotation.z = 0.025 + Math.sin(elapsed * 1.1) * (0.004 * wake + 0.01 * fracture + 0.012 * rupture);
        rockGroup.scale.setScalar(
          layoutRockScale *
            (1 + wake * 0.006 + fracture * 0.014 + clickImpulse * (clickStage === 1 ? 0.012 : clickStage === 2 ? 0.024 : 0.052)),
        );

        if (rockMaterial) {
          rockMaterial.emissiveIntensity =
            1.12 +
            wake * 0.32 +
            fracture * 0.46 +
            rupture * 0.88 +
            clickImpulse * (clickStage === 1 ? 0.16 : clickStage === 2 ? 0.34 : 1.42) +
            Math.max(0, pressurePulse * 1.9);
          rockMaterial.envMapIntensity = 0.5 + wake * 0.04 + fracture * 0.08 + rupture * 0.12;
          rockMaterial.opacity = revealedRef.current ? Math.max(0.08, 1 - rupture * 0.86) : 1;
          rockMaterial.transparent = true;
        }

        glowLight.intensity =
          1.25 +
          wake * 0.78 +
          fracture * 1.45 +
          rupture * 4.25 +
          clickImpulse * (clickStage === 1 ? 0.58 : clickStage === 2 ? 1.3 : 6.5) +
          Math.max(0, pressurePulse * 9);
        shockwave.scale.setScalar(1 + clickExpansion * (clickStage === 1 ? 0.7 : clickStage === 2 ? 1.35 : 3.25));
        shockwave.rotation.z = elapsed * 0.22;
        shockwaveMaterial.opacity = clickImpulse * (clickStage === 1 ? 0.03 : clickStage === 2 ? 0.07 : 0.34);

        const shouldAnimateShards = fracture > 0.0005 || rupture > 0.0005 || clickStage >= 2 || revealedRef.current;
        if (shouldAnimateShards) {
          for (let shardIndex = 0; shardIndex < rockShards.length; shardIndex += 1) {
            const shard = rockShards[shardIndex];
            const ruptureShardProgress = smoothstep(THREE.MathUtils.clamp((rupture - shard.delay) / (1 - shard.delay), 0, 1));
            const fractureShardProgress =
              smoothstep(THREE.MathUtils.clamp((fracture - shard.fractureThreshold) / (1 - shard.fractureThreshold), 0, 1)) *
              shard.fractureStrength *
              (1 - ruptureShardProgress);
            const clickNudge =
              clickStage === 2
                ? clickImpulse * 0.008 * shard.fractureStrength
                : clickStage >= BONUS_ROCK_FINAL_CLICK_COUNT
                  ? clickImpulse * 0.26
                  : 0;
            const fractureDistance = fractureShardProgress * 0.07 + clickNudge;
            const ruptureDistance = ruptureShardProgress * 5.4 * shard.ruptureStrength * (0.56 + shard.delay * 1.35);
            const shardRotationEnergy =
              fractureShardProgress * 0.08 +
              ruptureShardProgress * (1.7 + shard.ruptureStrength * 0.82) +
              (clickStage === 2 ? clickImpulse * 0.035 : clickStage >= BONUS_ROCK_FINAL_CLICK_COUNT ? clickImpulse * 0.18 : 0);
            const scale = revealedRef.current ? Math.max(0.11, 1 - ruptureShardProgress * 0.68) : 1 + wake * 0.006 + fracture * 0.018;
            shard.mesh.position
              .copy(shard.basePosition)
              .addScaledVector(shard.fracture, fractureDistance)
              .addScaledVector(shard.blast, ruptureDistance);
            if (ruptureShardProgress > 0.42) {
              shard.mesh.position.y -= (ruptureShardProgress - 0.42) * (ruptureShardProgress - 0.42) * shard.falloff;
            }
            shard.mesh.rotation.set(
              shard.baseRotation.x + shard.spin.x * shardRotationEnergy,
              shard.baseRotation.y + shard.spin.y * shardRotationEnergy,
              shard.baseRotation.z + shard.spin.z * shardRotationEnergy,
            );
            shard.mesh.scale.set(shard.baseScale.x * scale, shard.baseScale.y * scale, shard.baseScale.z * scale);
          }
        }

        const localParticleSpread = wake * 0.012 + fracture * 0.055 + giftPeek * 0.018;
        const spread =
          localParticleSpread +
          rupture * 4.15 +
          clickImpulse * (clickStage === 1 ? 0.008 : clickStage === 2 ? 0.024 : 0.28);
        particles.rotation.y -= delta * (0.035 + preRuptureEnergy * 0.035 + rupture * 0.16);
        particleMaterial.uniforms.uTime.value = elapsed;
        const particleOpacity = Math.min(
          0.84,
          wake * 0.016 +
            fracture * 0.048 +
            giftPeek * 0.018 +
            rupture * 0.68 +
            giftReveal * 0.07 +
            clickImpulse * (clickStage === 1 ? 0.008 : clickStage === 2 ? 0.022 : 0.22),
        );
        particleMaterial.uniforms.uOpacity.value = particleOpacity;
        const particleMotionActive = particleOpacity > 0.002 || spread > 0.001 || particlesWereActive;
        if (particleMotionActive) {
          for (let i = 0; i < particleCount; i += 1) {
            const idx = i * 3;
            const seed = particleSeeds[i];
            const wave = Math.sin(elapsed * 1.7 + seed * 10) * (0.006 * wake + 0.014 * fracture + 0.07 * rupture);
            particlePositions[idx] = basePositions[idx] + velocities[idx] * spread + wave;
            particlePositions[idx + 1] = basePositions[idx + 1] + velocities[idx + 1] * spread - rupture * rupture * 0.38;
            particlePositions[idx + 2] =
              basePositions[idx + 2] +
              velocities[idx + 2] * spread +
              Math.cos(elapsed * 1.4 + seed * 8) * (0.005 * wake + 0.012 * fracture + 0.06 * rupture);
          }
          particlePositionAttribute.needsUpdate = true;
        }
        particlesWereActive = particleOpacity > 0.002;

        if (rockRoot) rockRoot.visible = !revealedRef.current || rupture < 0.98;

        renderer.render(scene, camera);
        scheduleRockFrame();
      }

      const rockVisibilityObserver =
        typeof window.IntersectionObserver === 'undefined'
          ? null
          : new window.IntersectionObserver(
              ([entry]) => {
                rockSceneInView = entry.isIntersecting;
                if (rockSceneInView) {
                  clock.getDelta();
                  scheduleRockFrame();
                }
              },
              { rootMargin: '260px 0px' },
            );

      rockVisibilityObserver?.observe(mount);

      const handleRockDocumentVisibility = () => {
        if (document.visibilityState === 'visible') {
          clock.getDelta();
          scheduleRockFrame();
        }
      };

      document.addEventListener('visibilitychange', handleRockDocumentVisibility);

      scheduleRockFrame();

      disposeScene = () => {
        window.cancelAnimationFrame(frameId);
        window.cancelAnimationFrame(settledResizeFrame);
        window.clearTimeout(settledResizeTimer);
        observer.disconnect();
        rockVisibilityObserver?.disconnect();
        document.removeEventListener('visibilitychange', handleRockDocumentVisibility);
        renderer.dispose();
        particleGeometry.dispose();
        particleMaterial.dispose();
        shockwaveGeometry.dispose();
        shockwaveMaterial.dispose();
        envMap.dispose();
        dracoLoader.dispose();
        ktx2Loader.dispose();
        if (rockMaterial) {
          const textures = new Set([
            rockMaterial.map,
            rockMaterial.emissiveMap,
            rockMaterial.normalMap,
            rockMaterial.roughnessMap,
            rockMaterial.metalnessMap,
          ]);
          textures.forEach((texture) => texture?.dispose());
          rockMaterial.dispose();
        }
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

  const rockStage = getBonusRockStage(clickCount);
  const rockTrackTargets = getBonusRockAnimationTargets(clickCount);
  const clickStage = rockStage.clickCount;
  const clicksRemaining = BONUS_ROCK_FINAL_CLICK_COUNT - clickStage;
  const actionLabel = rockStage.actionLabel;
  const rockLayerStyle: BonusRockLayerStyle = {
    '--bonus-rock-wake-progress': rockTrackTargets.wakeProgress,
    '--bonus-rock-fracture-progress': rockTrackTargets.fractureProgress,
    '--bonus-rock-rupture-progress': rockTrackTargets.ruptureProgress,
    '--bonus-gift-peek-progress': rockTrackTargets.giftPeekProgress,
    '--bonus-gift-reveal-progress': rockTrackTargets.giftRevealProgress,
    '--bonus-gift-preview-opacity': rockStage.giftPreview.opacity,
    '--bonus-gift-preview-scale': rockStage.giftPreview.scale,
    '--bonus-gift-preview-blur': `${rockStage.giftPreview.blurPx}px`,
  };
  const liveStatus = revealed
    ? 'The Bonus rock exploded and the gifts are unlocked.'
    : `${clicksRemaining} ${clicksRemaining === 1 ? 'click' : 'clicks'} until the Bonus rock explodes.`;
  const handleRockActivation = () => {
    const now = performance.now();
    if (now - lastActivationRef.current < 120) return;

    lastActivationRef.current = now;
    onRockClick();
  };
  const handleKeyboardRockActivation = (event: ReactMouseEvent<HTMLButtonElement>) => {
    if (event.detail !== 0) return;

    handleRockActivation();
  };

  return (
    <div
      className="bonus-rock-event-layer group absolute inset-0 text-left"
      aria-label={liveStatus}
      aria-pressed={revealed}
      data-bonus-rock-layer="interactive"
      data-rock-loaded={rockReady}
      data-rock-stage={clickStage}
      data-rock-stage-name={rockStage.id}
      data-rock-preload-status={preloadStatus}
      data-gift-preview={rockStage.giftPreview.mode}
      data-gift-reveal={revealed ? 'visible' : 'hidden'}
      style={rockLayerStyle}
    >
      <div className="bonus-gift-reveal absolute grid gap-3 sm:grid-cols-2" aria-hidden={!revealed}>
        {gifts.map((gift, index) => {
          const giftLabel = `Gift ${String(index + 1).padStart(2, '0')}`;
          const giftLogo = getBonusGiftLogo(gift);
          const giftContent = (
            <>
              <div className="bonus-gift-card-copy">
                <span>{giftLabel}</span>
                <strong>{gift.title}</strong>
                <em>{contentValue(gift.detail)}</em>
                <small>{isPlaceholderValue(gift.link) ? 'Gift revealed' : 'Open gift'}</small>
              </div>
              <img className="bonus-gift-card-logo" src={giftLogo.src} alt={giftLogo.alt} loading="lazy" />
            </>
          );

          return isPlaceholderValue(gift.link) ? (
            <div key={gift.title} className="bonus-gift-card is-disabled">
              {giftContent}
            </div>
          ) : (
            <a
              key={gift.title}
              href={gift.link}
              target="_blank"
              rel="noreferrer"
              className="bonus-gift-card"
              tabIndex={revealed ? undefined : -1}
            >
              {giftContent}
            </a>
          );
        })}
      </div>
      <div className="bonus-rock-loading-orb absolute inset-0" aria-hidden="true" />
      <div ref={mountRef} className="bonus-rock-canvas-mount absolute inset-0" />
      <div className="bonus-rock-atmosphere absolute inset-0" />
      <span className="sr-only" aria-live="polite">
        {liveStatus}
      </span>
      {!revealed ? (
        <button
          type="button"
          onPointerDown={handleRockActivation}
          onClick={handleKeyboardRockActivation}
          className="bonus-rock-hitbox absolute"
          aria-label={liveStatus}
        />
      ) : null}
      <div className="bonus-rock-status absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-end gap-3">
        <span className="rounded-full bg-white/40 px-4 py-2 text-xs uppercase tracking-[0.18em] text-muted transition duration-300 group-hover:bg-white/65 group-hover:text-text-primary">
          {actionLabel}
        </span>
      </div>
    </div>
  );
}

function BonusCelestialBurst() {
  return (
    <div className="bonus-celestial-burst" aria-hidden="true">
      {BONUS_CELESTIAL_SPARKS.map((index) => (
        <span key={index} />
      ))}
    </div>
  );
}

function BonusSection({
  rockClicks,
  preloadStatus,
  onRockClick,
}: {
  rockClicks: number;
  preloadStatus: BonusRockPreloadStatus;
  onRockClick: () => void;
}) {
  const { bonus } = portfolioContent;
  const revealed = rockClicks >= 3;

  return (
    <section id="bonus" className="relative isolate min-h-full overflow-hidden bg-transparent py-14 md:py-20" data-rock-revealed={revealed}>
      <BonusCelestialBurst />
      <MagicalRockScene
        clickCount={rockClicks}
        revealed={revealed}
        gifts={bonus.gifts}
        preloadStatus={preloadStatus}
        onRockClick={onRockClick}
      />
      <div className="bonus-content-shell relative z-30 mx-auto flex min-h-[calc(100dvh-10rem)] max-w-[1200px] items-start px-6 md:min-h-[calc(100dvh-11rem)] md:px-10 lg:items-center lg:px-16">
        <div className="bonus-copy-layout w-full">
          <div className="bonus-copy-card min-w-0 rounded-[2rem] p-7 md:p-10">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">Bonus</p>
            <h2 className="bonus-copy-title mt-4 text-text-primary">
              {bonus.hook}
            </h2>
            <p className="mt-6 text-sm leading-7 text-muted md:text-base">{bonus.body}</p>
          </div>
        </div>
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
  bonusRockPreloadStatus,
  bonusRockClicks,
  onBonusRockClick,
}: {
  active: SectionTarget;
  ready: boolean;
  onOpenThesis: () => void;
  onOpenCaseStudy: (item: CaseStudyEntry) => void;
  showContentReadiness: boolean;
  bonusRockPreloadStatus: BonusRockPreloadStatus;
  bonusRockClicks: number;
  onBonusRockClick: () => void;
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
          <BonusSection
            rockClicks={bonusRockClicks}
            preloadStatus={bonusRockPreloadStatus}
            onRockClick={onBonusRockClick}
          />
          {showContentReadiness ? <ContentReadinessPanel /> : null}
        </>
      );
    case 'ai-ramin':
      return <AiRaminSection />;
    case 'hero':
    default:
      return <Hero ready={ready} onOpenThesis={onOpenThesis} />;
  }
}

function PortfolioPage() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [liveBackgroundReady, setLiveBackgroundReady] = useState(false);
  const [bonusRockPreloadStatus, setBonusRockPreloadStatus] = useState<BonusRockPreloadStatus>(
    () => getBonusRockPreloadSnapshot().status,
  );
  const [bonusRockClicks, setBonusRockClicks] = useState(getInitialBonusRockClicks);
  const [activeSection, setActiveSection] = useState<SectionTarget>(() =>
    normalizeSectionTarget(typeof window === 'undefined' ? undefined : window.location.hash.replace('#', '')),
  );
  const [activeCaseStudy, setActiveCaseStudy] = useState<CaseStudyEntry | null>(null);
  const thesisCaseStudy = caseStudyByDeepDiveSlug.get('ai-native-product-os');
  const showContentReadiness = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.has('intake') || searchParams.has('stage12-content-intake');
  }, [location.search]);
  const showPerformanceBaseline = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return import.meta.env.DEV && searchParams.has('perf');
  }, [location.search]);
  const isProjectsSection = activeSection === 'projects';
  const isThoughtsSection = activeSection === 'teaching-speaking-writing';
  const isFullBleedSection = isProjectsSection || isThoughtsSection;
  const isAiRaminSection = activeSection === 'ai-ramin';
  const shaderVariant: PortfolioShaderVariant = isProjectsSection
    ? 'projects'
    : activeSection === 'bonus'
      ? 'bonus'
      : 'default';
  const liveShaderVariant = shaderVariant;
  const shouldUseLiveBackground = liveBackgroundReady;

  const requestBonusRockPreload = useCallback((reason: 'idle' | 'intent' | 'navigate' = 'intent') => {
    void preloadBonusRockAssets(reason);
  }, []);

  const handleBonusRockClick = useCallback(() => {
    setBonusRockClicks((current) => clampBonusRockClicks(current + 1));
  }, []);

  const resetViewportScroll = useCallback((behavior: ScrollBehavior = 'auto') => {
    window.scrollTo({ top: 0, left: 0, behavior });
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('.portfolio-stage')?.scrollTo({ top: 0, left: 0, behavior });
    });
  }, []);

  const handleSectionNavigate = useCallback((target: SectionTarget) => {
    setActiveSection(target);
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${target}`);
    resetViewportScroll('smooth');
  }, [resetViewportScroll]);

  const handleBottomNavigation = useCallback(
    (target: string) => {
      if (target === 'bonus') {
        requestBonusRockPreload('navigate');
      }

      handleSectionNavigate(normalizeSectionTarget(target));
    },
    [handleSectionNavigate, requestBonusRockPreload],
  );

  const handleBottomNavigationIntent = useCallback(
    (target: string) => {
      if (target === 'bonus') requestBonusRockPreload('intent');
    },
    [requestBonusRockPreload],
  );

  useEffect(() => {
    const handleHashChange = () => {
      setActiveSection(normalizeSectionTarget(window.location.hash.replace('#', '')));
      resetViewportScroll('auto');
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [resetViewportScroll]);

  useEffect(() => {
    if (!isLoading) {
      resetViewportScroll('auto');
      window.setTimeout(() => ScrollTrigger.refresh(), 100);
    }
  }, [activeSection, isLoading, resetViewportScroll]);

  useEffect(
    () =>
      subscribeBonusRockPreload((snapshot) => {
        setBonusRockPreloadStatus(snapshot.status);
      }),
    [],
  );

  useEffect(() => {
    try {
      window.sessionStorage.setItem(BONUS_ROCK_UNLOCK_STORAGE_KEY, String(bonusRockClicks));
    } catch {
      // Session storage can be unavailable in private or embedded contexts.
    }
  }, [bonusRockClicks]);

  useEffect(() => {
    if (isLoading) return undefined;

    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    const warmBonusRock = () => requestBonusRockPreload('idle');

    if (idleWindow.requestIdleCallback) {
      const idleId = idleWindow.requestIdleCallback(warmBonusRock, { timeout: 2600 });
      return () => idleWindow.cancelIdleCallback?.(idleId);
    }

    const timer = window.setTimeout(warmBonusRock, 1400);
    return () => window.clearTimeout(timer);
  }, [isLoading, requestBonusRockPreload]);

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
      className="h-dvh min-h-dvh overflow-hidden bg-transparent text-text-primary"
      data-bonus-rock-preload-status={bonusRockPreloadStatus}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <AnimatePresence mode="wait">
        {isLoading ? <VisionLoadingScreen key="loading" onComplete={() => setIsLoading(false)} /> : null}
      </AnimatePresence>
      <StaticShaderGradientBackground variant={shaderVariant} />
      {shouldUseLiveBackground ? (
        <Suspense fallback={null}>
          <LiveShaderGradientBackground variant={liveShaderVariant} />
        </Suspense>
      ) : null}
      {isAiRaminSection ? (
        <AuroraBackground className="portfolio-ai-ramin-page-backdrop thoughts-aurora-shell h-full min-h-full">
          <span aria-hidden="true" />
        </AuroraBackground>
      ) : null}
      <div className={`fixed inset-0 z-10 overflow-hidden ${isFullBleedSection ? 'p-0' : 'p-3 sm:p-5 lg:p-4'}`}>
        <div
          className={`portfolio-frame relative mx-auto flex h-full w-full lg:w-full ${
            isFullBleedSection ? (isProjectsSection ? 'is-projects-frame' : 'is-thoughts-frame') : 'lg:max-w-[1426px]'
          } ${
            isAiRaminSection ? 'is-ai-ramin-frame' : ''
          }`}
        >
          <div
            className={`portfolio-stage portfolio-stage-scroll relative h-full w-full overflow-x-hidden overflow-y-auto ${
              isProjectsSection
                ? 'is-projects-stage rounded-none'
                : isThoughtsSection
                  ? 'is-thoughts-stage rounded-none'
                  : 'rounded-[24px] sm:rounded-[34px]'
            } ${
              isAiRaminSection ? 'is-ai-ramin-stage' : ''
            }`}
          >
            <main className="relative z-10 h-full">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeSection}
                  className="h-full"
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
                    bonusRockPreloadStatus={bonusRockPreloadStatus}
                    bonusRockClicks={bonusRockClicks}
                    onBonusRockClick={handleBonusRockClick}
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
        active={activeSection}
        currentSection={activeSection}
        onNavigate={handleBottomNavigation}
        onNavIntent={handleBottomNavigationIntent}
      />
      {isAiRaminSection ? <AiViewportBorderGlow /> : null}
      {showPerformanceBaseline && PerformanceBaselinePanel ? (
        <Suspense fallback={null}>
          <PerformanceBaselinePanel activeSection={activeSection} />
        </Suspense>
      ) : null}
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
