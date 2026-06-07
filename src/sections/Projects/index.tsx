import { useCallback, useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react';
import type { ReactNode, CSSProperties } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import aiCostsDashboardArtworkUrl from '../../assets/projects/ai-costs-mock.webp';
import aiNativeProductOsArtworkUrl from '../../assets/projects/ai-native-os-hero.webp';
import conciergeSelfwareArtworkUrl from '../../assets/projects/24seven-mock.webp';
import dreamseaSelfwareArtworkUrl from '../../assets/projects/dreamsea-mock.webp';
import dreamseaHomepageScreenUrl from '../../../projects-section/Project Images/dreamsea-images/dreamsea-homepage.PNG';
import massSocialWisdomAgentArtworkUrl from '../../assets/projects/mass-social.gif';
import nssoSelfwareArtworkUrl from '../../assets/projects/nsso-mock.webp';
import qadamSelfwareArtworkUrl from '../../assets/projects/qadam-mock.webp';
import ragPipelineArtworkUrl from '../../assets/projects/rag-mock.webp';
import razinflixSelfwareArtworkUrl from '../../assets/projects/razinflix-mock.webp';
import { portfolioContent, toolsAndSystems, architectureLayers } from '../../data/portfolio';
import {
  type PersonalProjectEntry,
  type ToolSystemEntry,
  type CaseStudyEntry,
  type AssetSlotItem,
  toolLayerColumns,
} from '../types';
import { slugifyTitle } from '../../lib/text';
import { scrollToId } from '../../lib/scroll';
import {
  isPlaceholderValue,
  contentValue,
  type PlaceholderLike,
} from '../../lib/placeholder';
import { ContentToken } from '../../components/ContentToken';
import { WorkflowDiagram } from '../../components/WorkflowDiagram';
import {
  projectExperienceGroups,
  toolsSystemSignals,
  layerValueKeys,
  thoughtArchitectureByProject,
  toolSystemBySlug,
  projectActNavItems,
  thoughtFormatNavGroups,
  getProjectReader,
} from './types';
import { DeepDiveOverlay } from './DeepDiveOverlay';
import { CaseStudyOverlay } from './CaseStudyOverlay';
import { WorkCaseStudyOverlay } from './WorkCaseStudyOverlay';
import { IPhone3D } from '../../components/IPhone3D';

export const selfwareGeneratedArtwork: Record<string, string> = {
  Qadam: qadamSelfwareArtworkUrl,
  Dreamsea: dreamseaSelfwareArtworkUrl,
  nsso: nssoSelfwareArtworkUrl,
  RazinFlix: razinflixSelfwareArtworkUrl,
  '24Seven Concierge': conciergeSelfwareArtworkUrl,
};

export const toolGeneratedArtwork: Record<string, string> = {
  'AI Native Product OS': aiNativeProductOsArtworkUrl,
  'Mass Social Wisdom Agent': massSocialWisdomAgentArtworkUrl,
  'AI Costs Dashboard': aiCostsDashboardArtworkUrl,
  'RAG Pipeline': ragPipelineArtworkUrl,
};

const projectDescriptions: Record<string, string> = {
  nsso:
    'NSSO is an owned professional identity platform: profile, CV, projects, storefront, payments, and an AI profile coach in one public home. It turns scattered proof into a living identity surface that can be updated, monetised, and understood at a glance.',
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
  'AI Costs Dashboard':
    'AI Costs Dashboard is an observability surface for AI product usage, spend, latency, failures, and provider/model attribution. It gives teams a way to see where money, reliability, and product value are drifting before small leaks become operating problems.',
  'RAG Pipeline':
    'RAG Pipeline is reusable context infrastructure for AI products that need trusted source material, not one-off prompting. It handles ingestion, chunking, embeddings, retrieval, re-ranking, verification, and context injection so answers stay grounded in the right knowledge.',
};

type ProjectArchitectureCard = {
  label: string;
  value: string;
};

const implementationArchitectureSummaries: Record<string, string> = {
  nsso:
    'Next.js 16 and TypeScript frontend, Supabase Postgres/Storage backend, pgvector retrieval, Gemini Deity agent, PayPal and Polar payment flows.',
  Qadam:
    'Next.js/React cockpit over a Python orchestration backend, PostgreSQL/TimescaleDB event store, ChromaDB knowledge graph, and local/cloud AI strategy loop.',
  Dreamsea:
    'SwiftUI iOS app with Supabase Postgres, Storage and Edge Functions, Core Data local persistence, AVFoundation capture, and Gemini/Imagen generation.',
  '24Seven Concierge':
    'Expo React Native app using Expo Router, Shopify Storefront GraphQL, Lodgify calendar surfaces, Gemini planning, Zustand persistence and React Query.',
  RazinFlix:
    'Next.js 16 and Tailwind frontend with Supabase Postgres/Storage, TMDB metadata, Gemini enrichment, YouTube trailers and Google Vision poster validation.',
  'Mass Social Wisdom Agent':
    'Flask/Python web app with a threaded job runner, Gemini extraction and scoring, SociaVault transcript APIs, local file inputs and .docx export.',
  'AI Costs Dashboard':
    'Usage-event observability dashboard for AI spend, latency, failures, provider/model attribution, anomaly alerts and product-level cost controls.',
  'RAG Pipeline':
    'Reusable context infrastructure for ingestion, chunking, embeddings, retrieval, re-ranking, source verification, prompt injection and logging.',
};

const fallbackArchitectureLabels = ['Model', 'Context', 'Orchestration', 'Governance', 'Human'] as const;

export function ProjectLink({
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

function ProjectCinematicPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-[0.64rem] uppercase tracking-[0.16em] text-white/68 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      {children}
    </span>
  );
}

function ProjectVisualChipOverlay({ chips }: { chips?: readonly string[] }) {
  if (!chips?.length) return null;

  return (
    <div className="pointer-events-none absolute left-5 top-5 z-30 flex max-w-[calc(100%-2.5rem)] flex-wrap gap-2 sm:left-6 sm:top-6 sm:max-w-[calc(100%-3rem)]">
      {chips.map((chip) => (
        <ProjectCinematicPill key={chip}>{chip}</ProjectCinematicPill>
      ))}
    </div>
  );
}

function getProjectTypeLabel(project: PersonalProjectEntry) {
  return project.type === 'App' || project.type === 'iOS App' ? 'Mobile App' : project.type;
}

function getArchitectureSystemMetaLabel(system: ArchitectureSystem) {
  if (system.family === 'Product') {
    return `Product / ${getProjectTypeLabel(system.project)}`;
  }

  const hasPublicSource = !isPlaceholderValue(system.project.githubLink) || !isPlaceholderValue(system.project.liveLink);
  const toolKind =
    system.project.type === 'Agent' ? 'Agent' : system.project.projectName === 'AI Costs Dashboard' ? 'Dashboard' : 'Infrastructure';

  return `Tool / ${hasPublicSource ? 'Open-source' : toolKind}`;
}

function getArchitectureProofFilterCountLabel(filter: ArchitectureProofFilter) {
  if (filter === 'All') return 'systems';
  return filter === 'Product' ? 'products' : 'tools';
}

function getArchitectureLayerHeadingId(layer: ArchitectureLayerEntry) {
  return `architecture-proof-layer-${slugifyTitle(layer.layer)}`;
}

export function ProjectCinematicHero({
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
    { label: 'Architecture', value: 1 },
  ];
  const heroActs = [
    {
      label: 'Products',
      title: 'Selfware',
      detail: 'Usable apps, agents, and web products with real case-study depth.',
      targetId: 'projects-selfware-stack',
    },
    {
      label: 'Machinery',
      title: 'Tools',
      detail: 'Dashboards, workflows, and agents that turn AI into operating leverage.',
      targetId: 'projects-tools',
    },
    {
      label: 'Thesis',
      title: 'Architecture',
      detail: 'All selfware and tools built using the same underlying AI-Native Product OS framework.',
      targetId: 'projects-architecture',
    },
  ];

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
        <div className="projects-hero-copy relative">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75 }}
          >
            {/* Section label rendered globally via <SectionMarker> */}
          </motion.div>
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
            I build products for myself, and feed the repeated patterns into tools and a self-improving AI-native product
            framework which, in turn, improves what I build over time.
          </motion.p>
        </div>

        <motion.aside
          className="projects-hero-aside relative overflow-hidden rounded-[1.75rem] border border-white/14 bg-black/26 p-4 text-white shadow-[0_28px_90px_rgba(0,0,0,0.3)] backdrop-blur-xl md:p-5"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.2 }}
        >
          <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          <p className="text-sm leading-6 text-white/72">
            Selfware refers to software that I make for myself, inspired by the ideas and challenges of my own and those
            around me.
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
              <button
                key={act.title}
                type="button"
                onClick={() => scrollToId(act.targetId)}
                className="grid grid-cols-[1.9rem_minmax(0,1fr)] gap-3 rounded-[1.05rem] border border-white/10 bg-white/[0.045] p-2.5 text-left transition duration-300 hover:-translate-y-0.5 hover:border-white/24 hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
              >
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
              </button>
            ))}
          </div>
        </motion.aside>
      </div>
    </section>
  );
}

function ProjectsUnderpinnedByRow({
  selfware,
  tools,
}: {
  selfware: readonly PersonalProjectEntry[];
  tools: readonly PersonalProjectEntry[];
}) {
  const featuredSelfware = selfware.slice(0, 5);
  const featuredTools = tools.slice(0, 4);

  return (
    <motion.div
      className="grid gap-3 rounded-[1.65rem] border border-white/12 bg-black/18 p-3 shadow-[0_24px_90px_rgba(0,0,0,0.22)] backdrop-blur-xl lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:p-4"
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, ease: [0.25, 0.1, 0.25, 1] }}
      viewport={{ once: true, margin: '-80px' }}
    >
      <div className="flex min-w-0 flex-wrap gap-2">
        {featuredSelfware.map((project) => (
          <span
            key={`featured-selfware-${project.projectName}`}
            className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-2 text-xs text-white/70"
          >
            {project.projectName}
          </span>
        ))}
      </div>
      <div className="hidden items-center gap-2 px-3 text-[0.58rem] uppercase tracking-[0.2em] text-white/34 lg:flex">
        <span className="h-px w-10 bg-white/18" />
        underpinned by
        <span className="h-px w-10 bg-white/18" />
      </div>
      <div className="flex min-w-0 flex-wrap gap-2 lg:justify-end">
        {featuredTools.map((project) => (
          <span
            key={`featured-tool-${project.projectName}`}
            className="rounded-full border border-[#b9cad8]/20 bg-[#b9cad8]/10 px-3 py-2 text-xs text-white/72"
          >
            {project.projectName}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function CinematicProjectVisual({
  project,
  index,
  tone = 'product',
  overlayChips,
}: {
  project: PersonalProjectEntry;
  index: number;
  tone?: 'product' | 'tool';
  overlayChips?: readonly string[];
}) {
  const generatedArtwork =
    tone === 'tool' ? toolGeneratedArtwork[project.projectName] : selfwareGeneratedArtwork[project.projectName];
  const image = generatedArtwork ?? (isPlaceholderValue(project.mainPictureGif) ? undefined : project.mainPictureGif);
  const isPhoneApp =
    tone !== 'tool' &&
    Boolean(image) &&
    (project.projectName === 'Dreamsea' || project.projectName === '24Seven Concierge');
  const gradientStops =
    tone === 'tool'
      ? ['rgba(48,85,120,0.86)', 'rgba(9,19,32,0.92)', 'rgba(220,235,247,0.48)']
      : ['rgba(104,137,170,0.82)', 'rgba(8,18,32,0.86)', 'rgba(255,255,255,0.52)'];

  return (
    <div className="projects-visual-panel relative min-h-[22rem] overflow-hidden rounded-[2rem] border border-white/12 bg-black/34 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] md:min-h-[30rem]">
      {isPhoneApp ? (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(110,139,255,0.2),transparent_60%)]" />
          <div className="absolute inset-0 flex items-center justify-center p-5">
            <div style={{ height: '90%', aspectRatio: '0.47' }}>
              <IPhone3D
                screenSrc={image as string}
                poster={image}
                ariaLabel={`${project.projectName} shown on a rotating 3D iPhone`}
              />
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </>
      ) : image ? (
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
      <ProjectVisualChipOverlay chips={overlayChips} />
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
  const architectureCards = getProjectArchitectureCards(project);
  const liveHref = isPlaceholderValue(project.liveLink) ? undefined : project.liveLink;
  const stickyOffsetRem = 1 + Math.min(index, 4) * 0.62;
  const architectureSummary = getImplementationArchitectureSummary(project);

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
            <div className="mt-3">
              <p className="font-display text-7xl italic leading-none text-white/26 md:text-8xl">
                {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-5 text-[clamp(3rem,7vw,7rem)] font-black uppercase leading-[0.84] tracking-[-0.07em] text-white">
                {project.projectName}
              </h3>
              <p className="mt-6 max-w-xl text-base leading-8 text-white/68 md:text-lg">
                {getProjectDescription(project)}
              </p>
            </div>

            <div className="mt-7 rounded-[1.2rem] border border-white/10 bg-black/20 p-4 md:p-5">
              <p className="text-[0.56rem] uppercase tracking-[0.14em] text-white/36">Architecture</p>
              <p className="mt-3 text-base font-medium leading-7 text-white/78">{architectureSummary}</p>
            </div>

            <div className="mt-auto flex flex-wrap items-center gap-3 pt-8">
              {liveHref ? (
                <a
                  href={liveHref}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-white px-5 py-3 text-sm font-medium text-[#07101c] transition duration-300 hover:scale-[1.03] hover:bg-[#dce8f2]"
                >
                  Open live →
                </a>
              ) : null}
              {reader ? (
                <button
                  type="button"
                  onClick={() => onOpen(reader)}
                  className="rounded-full border border-white/14 bg-white/[0.08] px-5 py-3 text-sm text-white/80 transition duration-300 hover:bg-white hover:text-[#07101c]"
                >
                  Deep dive +
                </button>
              ) : null}
            </div>
          </div>

          <div className="grid content-start gap-4">
            <CinematicProjectVisual
              project={project}
              index={index}
              overlayChips={[getProjectTypeLabel(project)]}
            />
            <div className="grid items-start gap-3 md:grid-cols-5">
              {architectureCards.map((item, itemIndex) => (
                <div key={`${project.projectName}-stack-${item.label}-${itemIndex}`} className="flex h-[14rem] flex-col overflow-hidden rounded-[1.15rem] border border-white/10 bg-white/[0.06] px-4 pb-4 pt-4">
                  <p className="text-[0.58rem] uppercase tracking-[0.16em] text-white/40">{item.label}</p>
                  <p className="mt-3 text-xs leading-5 text-white/72">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.article>
    </div>
  );
}

export function SelfwareStickyStack({
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
  const architectureCards = getProjectArchitectureCards(project);
  const liveHref = isPlaceholderValue(project.liveLink) ? undefined : project.liveLink;
  const githubHref = isPlaceholderValue(project.githubLink) ? undefined : project.githubLink;
  const primaryHref = githubHref ?? liveHref;
  const output = isPlaceholderValue(project.whatIWouldImprove) ? contentValue(project.briefDescription) : contentValue(project.whatIWouldImprove);
  const telemetry = [
    { label: 'Type', value: project.type },
    { label: 'Layer', value: 'Platform' },
    { label: 'Status', value: primaryHref ? 'Open-source' : 'Internal' },
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
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/62">{getProjectDescription(project)}</p>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <CinematicProjectVisual
            project={project}
            index={index}
            tone="tool"
            overlayChips={[getProjectTypeLabel(project), primaryHref ? 'Open-source' : 'Internal']}
          />
          <div className="grid content-start gap-3">
            <div className="grid grid-cols-3 gap-2">
              {telemetry.map((item) => (
                <div key={`${project.projectName}-${item.label}`} className="rounded-[1rem] border border-white/10 bg-white/[0.055] p-3">
                  <p className="text-[0.54rem] uppercase tracking-[0.14em] text-white/34">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-white/76">{item.value}</p>
                </div>
              ))}
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
          {architectureCards.map((item, itemIndex) => (
            <div key={`${project.projectName}-tool-layer-${item.label}-${itemIndex}`} className="flex h-[14rem] flex-col overflow-hidden rounded-[0.95rem] border border-white/10 bg-white/[0.05] px-4 pb-4 pt-4">
              <p className="text-[0.54rem] uppercase tracking-[0.14em] text-white/36">{item.label}</p>
              <p className="mt-3 text-xs leading-5 text-white/68">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {primaryHref ? (
            <a
              href={primaryHref}
              target="_blank"
              rel="noreferrer"
              className="w-fit rounded-full bg-white px-5 py-3 text-sm font-medium text-[#07101c] transition duration-300 hover:scale-[1.03] hover:bg-[#dce8f2]"
            >
              {githubHref ? 'View on GitHub →' : 'Open live →'}
            </a>
          ) : null}
          {reader ? (
            <button
              type="button"
              onClick={() => onOpen(reader)}
              className="w-fit rounded-full border border-white/16 bg-white/[0.08] px-5 py-3 text-sm text-white/80 transition duration-300 hover:bg-white hover:text-[#07101c]"
            >
              Deep dive +
            </button>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}

export function ToolsOperationsBay({
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

function getImplementationArchitectureSummary(project: PersonalProjectEntry) {
  return implementationArchitectureSummaries[project.projectName] ?? contentValue(project.architecture);
}

function getProjectArchitectureCards(project: PersonalProjectEntry, limit = 5) {
  return project.technicalStack.slice(0, limit).map((item, index) =>
    getArchitectureCardFromStackItem(item, fallbackArchitectureLabels[index] ?? `Layer ${String(index + 1).padStart(2, '0')}`),
  );
}

function getArchitectureCardFromStackItem(item: string | PlaceholderLike, fallbackLabel: string): ProjectArchitectureCard {
  const value = contentValue(item);
  const separatorIndex = value.indexOf(':');

  if (separatorIndex > 0 && separatorIndex < 32) {
    return {
      label: value.slice(0, separatorIndex).trim(),
      value: value.slice(separatorIndex + 1).trim(),
    };
  }

  return { label: fallbackLabel, value };
}

function getProjectLayerSummary(project: PersonalProjectEntry, layerName: string, layerIndex: number) {
  const value = contentValue(project.technicalStack[layerIndex]);
  const prefix = `${layerName}:`;

  return value.startsWith(prefix) ? value.slice(prefix.length).trim() : value;
}

function getProjectDescription(project: PersonalProjectEntry) {
  return projectDescriptions[project.projectName] ?? contentValue(project.briefDescription);
}

type ArchitectureLayerEntry = {
  layer: string;
  purpose: string | PlaceholderLike;
  examples: string | PlaceholderLike;
};

type ArchitectureSystem = {
  project: PersonalProjectEntry;
  code: string;
  family: 'Product' | 'Tool';
};

type ArchitectureProofFilter = 'All' | ArchitectureSystem['family'];

const oldOperatingStages = ['Idea', 'Design', 'Concept', 'Alpha/Beta', 'Live'] as const;

const architectureProofFilters = ['All', 'Product', 'Tool'] as const satisfies readonly ArchitectureProofFilter[];

const aiNativeLoopStages: Array<{ label: string; detail: string; position: CSSProperties }> = [
  {
    label: 'Talk',
    detail: 'Load intent, taste, constraints, and context before the model acts.',
    position: { left: '63%', top: '22%', transform: 'translate(-50%, -50%)' },
  },
  {
    label: 'Decide',
    detail: 'Use human judgment and governance to choose the next move.',
    position: { left: '73%', top: '62%', transform: 'translate(-50%, -50%)' },
  },
  {
    label: 'Build',
    detail: 'Wire models into tools, jobs, outputs, and product surfaces.',
    position: { left: '45%', top: '82%', transform: 'translate(-50%, -50%)' },
  },
  {
    label: 'Observe',
    detail: 'Read traces, failures, quality, user behavior, and cost.',
    position: { left: '20%', top: '58%', transform: 'translate(-50%, -50%)' },
  },
  {
    label: 'Iterate',
    detail: 'Feed what was learned back into all five layers.',
    position: { left: '28%', top: '24%', transform: 'translate(-50%, -50%)' },
  },
];

const triangleWidths = ['34%', '49%', '64%', '79%', '94%'] as const;

function getArchitectureLayerLabel(layer: ArchitectureLayerEntry, index: number) {
  return toolLayerColumns[index] ?? layer.layer;
}

function ArchitectureIntro({
  architectureTitle,
  systemCount,
  productCount,
  toolCount,
  layerCount,
}: {
  architectureTitle: string;
  systemCount: number;
  productCount: number;
  toolCount: number;
  layerCount: number;
}) {
  const stats = [
    { label: 'Systems mapped', value: systemCount },
    { label: 'Selfware products', value: productCount },
    { label: 'Tools', value: toolCount },
    { label: 'Stack layers', value: layerCount },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-end">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/44">Act 3 / Architecture</p>
        <h2
          id="architecture-section-title"
          aria-label="AI-Native Product OS"
          className="mt-5 text-[clamp(3rem,5.6vw,7.6rem)] font-black uppercase leading-[0.82] tracking-[-0.07em] text-white"
        >
          AI-Native
          <span className="block font-display italic font-normal normal-case tracking-[-0.04em] text-white/48">
            Product OS
          </span>
        </h2>
        <p className="mt-7 max-w-2xl text-base leading-8 text-white/66">{architectureTitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:justify-self-end">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="rounded-[1.2rem] border border-white/10 bg-white/[0.055] p-4 backdrop-blur-xl"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.52, delay: index * 0.045 }}
            viewport={{ once: true, margin: '-60px' }}
            whileHover={{ y: -3, borderColor: 'rgba(255,255,255,0.22)' }}
          >
            <p className="font-display text-4xl italic leading-none text-white/78">{stat.value}</p>
            <p className="mt-3 text-[0.58rem] uppercase tracking-[0.15em] text-white/38">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function OldToNewProcess() {
  return (
    <div className="mt-10 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]" aria-label="Old product process compared with AI-native product loop">
      <motion.article
        aria-labelledby="architecture-old-process-title"
        className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl md:p-6"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: '-80px' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent" />
        <div className="relative z-10">
          <p className="text-[0.62rem] uppercase tracking-[0.2em] text-white/38">Before</p>
          <h3 id="architecture-old-process-title" className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
            Old operating system
          </h3>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/58">
            The classic product path assumes certainty increases through a sequence of fixed stages.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-2">
            {oldOperatingStages.map((stage, index) => (
              <motion.div
                key={stage}
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.42, delay: index * 0.06 }}
                viewport={{ once: true, margin: '-80px' }}
              >
                <span className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-2 text-[0.58rem] uppercase tracking-[0.14em] text-white/56">
                  {stage}
                </span>
                {index < oldOperatingStages.length - 1 ? (
                  <motion.span
                    className="hidden h-px w-5 origin-left bg-white/18 sm:block"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 0.36, delay: index * 0.06 + 0.12 }}
                    viewport={{ once: true, margin: '-80px' }}
                  />
                ) : null}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.article>

      <motion.article
        aria-labelledby="architecture-new-loop-title"
        className="relative overflow-hidden rounded-[2rem] border border-[#89AACC]/24 bg-[#89AACC]/[0.075] p-5 backdrop-blur-xl md:p-6"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.06 }}
        viewport={{ once: true, margin: '-80px' }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_25%,rgba(137,170,204,0.18),transparent_52%)]" />
        <div className="relative z-10">
          <p className="text-[0.62rem] uppercase tracking-[0.2em] text-[#b8cde3]/64">After</p>
          <h3 id="architecture-new-loop-title" className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
            AI-native loop
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/62">
            AI products behave less like handoffs and more like operating loops: talk, decide, build, observe, iterate.
          </p>
          <div className="mt-7 grid gap-2 sm:grid-cols-5">
            {aiNativeLoopStages.map((stage, index) => (
              <motion.div
                key={`ai-native-process-${stage.label}`}
                className="rounded-[1rem] border border-white/12 bg-black/16 p-3"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.44, delay: index * 0.055 }}
                viewport={{ once: true, margin: '-80px' }}
                whileHover={{ y: -3, borderColor: 'rgba(137,170,204,0.34)' }}
              >
                <p className="font-display text-2xl italic leading-none text-white/28">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <p className="mt-2 text-sm font-semibold text-white">{stage.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.article>
    </div>
  );
}

function OperatingLoopDiagram() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      aria-describedby="architecture-loop-description"
      aria-labelledby="architecture-loop-title"
      className="relative min-h-0 overflow-hidden rounded-[2.2rem] border border-white/12 bg-black/20 p-5 shadow-[0_34px_120px_rgba(0,0,0,0.28)] backdrop-blur-2xl md:min-h-[34rem] md:p-7"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true, margin: '-80px' }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_46%,rgba(137,170,204,0.16),transparent_62%)]" />
      <div className="relative z-10 flex items-start justify-between gap-5">
        <div>
          <p className="text-[0.62rem] uppercase tracking-[0.2em] text-white/38">Operating loop</p>
          <h3 id="architecture-loop-title" className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
            Talk, decide, build, observe, iterate.
          </h3>
          <p id="architecture-loop-description" className="sr-only">
            The AI-native operating loop moves through Talk, Decide, Build, Observe, and Iterate, replacing a fixed linear product process with repeated learning.
          </p>
        </div>
        <span className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-[0.58rem] uppercase tracking-[0.15em] text-white/46">
          Loop
        </span>
      </div>

      <div data-architecture-mobile-loop="true" className="relative z-10 mt-6 grid gap-2 md:hidden">
        {aiNativeLoopStages.map((stage, index) => (
          <motion.div
            key={`ai-native-mobile-loop-${stage.label}`}
            className="grid grid-cols-[2.4rem_minmax(0,1fr)] gap-3 rounded-[1.1rem] border border-white/12 bg-white/[0.055] p-3"
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.42, delay: index * 0.055 }}
            viewport={{ once: true, margin: '-60px' }}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ff4f3f]/40 bg-[#ff4f3f]/14 text-[0.6rem] font-semibold text-[#ffb3ac]">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-white">{stage.label}</span>
              <span className="mt-1 block text-xs leading-5 text-white/56">{stage.detail}</span>
            </span>
          </motion.div>
        ))}
      </div>

      <div data-architecture-desktop-loop="true" className="relative z-10 mx-auto mt-6 hidden aspect-square max-w-[31rem] md:block">
        <motion.div
          aria-hidden="true"
          className="absolute inset-[8%] rounded-full border border-[#ff4f3f]/20"
          animate={shouldReduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 38, repeat: Infinity, ease: 'linear' }}
        >
          <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#ff4f3f]/70 bg-[#ff4f3f]/80 shadow-[0_0_26px_rgba(255,79,63,0.48)]" />
          <span className="absolute bottom-[12%] right-[4%] h-2.5 w-2.5 rounded-full border border-[#ff4f3f]/55 bg-[#ff4f3f]/55 shadow-[0_0_22px_rgba(255,79,63,0.38)]" />
        </motion.div>
        {[0, 1, 2, 3].map((ring) => (
          <motion.div
            key={`ai-native-loop-ring-${ring}`}
            className="absolute rounded-full border border-white/12"
            style={{
              inset: `${ring * 11}%`,
              opacity: 0.68 - ring * 0.11,
            }}
            animate={shouldReduceMotion ? undefined : { opacity: [0.5 - ring * 0.07, 0.72 - ring * 0.1, 0.5 - ring * 0.07] }}
            transition={{ duration: 5.5 + ring * 0.7, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
        <motion.div
          className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/14 bg-white/[0.075] text-center text-[0.62rem] uppercase tracking-[0.17em] text-white/58 backdrop-blur-xl"
          animate={shouldReduceMotion ? undefined : { boxShadow: ['0 0 0 rgba(137,170,204,0)', '0 0 44px rgba(137,170,204,0.18)', '0 0 0 rgba(137,170,204,0)'] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          Product OS
        </motion.div>
        {aiNativeLoopStages.map((stage, index) => (
          <motion.div
            key={`ai-native-loop-node-${stage.label}`}
            className="absolute w-[10rem] rounded-[1.15rem] border border-white/12 bg-[#111923]/88 p-3 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl"
            style={stage.position}
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    y: [0, -4, 0],
                    borderColor: ['rgba(255,255,255,0.12)', 'rgba(255,79,63,0.34)', 'rgba(255,255,255,0.12)'],
                  }
            }
            transition={{
              opacity: { duration: 0.42, delay: index * 0.07 },
              scale: { duration: 0.42, delay: index * 0.07 },
              y: { duration: 5, delay: index * 0.35, repeat: Infinity, ease: 'easeInOut' },
              borderColor: { duration: 5, delay: index * 0.35, repeat: Infinity, ease: 'easeInOut' },
            }}
            viewport={{ once: true, margin: '-80px' }}
            whileHover={{ scale: 1.035, y: -6 }}
          >
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#ff4f3f]/45 bg-[#ff4f3f]/18 text-[0.58rem] font-semibold text-[#ffb3ac]">
                {String(index + 1).padStart(2, '0')}
              </span>
              <p className="text-sm font-semibold text-white">{stage.label}</p>
            </div>
            <p className="mt-2 text-xs leading-5 text-white/54">{stage.detail}</p>
          </motion.div>
        ))}
      </div>
    </motion.article>
  );
}

function FiveLayerTriangle({ layers }: { layers: readonly ArchitectureLayerEntry[] }) {
  const triangleRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: triangleRef, offset: ['start 0.85', 'end 0.35'] });
  const activationScaleY = useTransform(scrollYProgress, [0, 1], [0.05, 1]);
  const activationOpacity = useTransform(scrollYProgress, [0, 0.18, 1], [0.22, 0.82, 0.52]);
  const displayLayers = [...layers].reverse();

  return (
    <motion.article
      ref={triangleRef}
      aria-describedby="architecture-triangle-description"
      aria-labelledby="architecture-triangle-title"
      className="relative overflow-hidden rounded-[2.2rem] border border-white/12 bg-white/[0.045] p-5 backdrop-blur-2xl md:p-7"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.06 }}
      viewport={{ once: true, margin: '-80px' }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(110,139,255,0.18),transparent_56%)]" />
      <div className="relative z-10">
        <p className="text-[0.62rem] uppercase tracking-[0.2em] text-white/38">Five layers</p>
        <h3 id="architecture-triangle-title" className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
          The stack behind every build.
        </h3>
        <p id="architecture-triangle-description" className="mt-3 max-w-2xl text-sm leading-6 text-white/62">
          The model is only the base. Useful AI products need context, orchestration, governance, and human judgment above it.
        </p>
      </div>

      <div className="relative z-10 mt-9 flex flex-col items-center gap-2">
        <motion.div
          aria-hidden="true"
          className="absolute bottom-0 left-1/2 top-0 w-px origin-bottom -translate-x-1/2 bg-gradient-to-t from-[#89AACC]/70 via-white/40 to-transparent"
          style={{ scaleY: activationScaleY, opacity: activationOpacity }}
        />
        {displayLayers.map((layer, displayIndex) => (
          <motion.div
            key={`ai-native-triangle-${layer.layer}`}
            className="relative min-h-[4.8rem] overflow-hidden rounded-[1.15rem] border border-white/12 bg-gradient-to-br from-[#9abbe0]/[0.22] via-white/[0.075] to-[#111923]/[0.72] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
            style={{ width: triangleWidths[displayIndex] }}
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.58, delay: displayIndex * 0.07 }}
            viewport={{ once: true, margin: '-80px' }}
            whileHover={{ scale: 1.015, borderColor: 'rgba(255,255,255,0.24)' }}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />
            <p className="text-center text-[0.6rem] uppercase tracking-[0.18em] text-white/48">
              {String(layers.length - displayIndex).padStart(2, '0')}
            </p>
            <p className="mt-1 text-center text-xl font-semibold tracking-[-0.03em] text-white">{layer.layer}</p>
          </motion.div>
        ))}
      </div>
    </motion.article>
  );
}

function LayerProofMatrix({
  layers,
  systems,
}: {
  layers: readonly ArchitectureLayerEntry[];
  systems: readonly ArchitectureSystem[];
}) {
  const [activeFamily, setActiveFamily] = useState<ArchitectureProofFilter>('All');
  const visibleSystems = useMemo(
    () => (activeFamily === 'All' ? systems : systems.filter((system) => system.family === activeFamily)),
    [activeFamily, systems],
  );
  const activeFilterCountLabel = getArchitectureProofFilterCountLabel(activeFamily);
  const proofCardGridClass =
    activeFamily === 'All'
      ? 'grid auto-rows-fr gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
      : 'grid auto-rows-fr gap-3 sm:grid-cols-2 xl:grid-cols-3';

  return (
    <div
      id="architecture-layer-proof"
      className="mt-8 rounded-[2.4rem] border border-white/12 bg-black/20 p-3 shadow-[0_34px_120px_rgba(0,0,0,0.32)] backdrop-blur-2xl sm:p-4 md:rounded-[3rem] md:p-5"
    >
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-4 md:rounded-[2.45rem] md:p-6">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[0.62rem] uppercase tracking-[0.2em] text-white/38">Layer proof</p>
            <h3 id="architecture-layer-proof-title" className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white md:text-4xl">
              How the same OS shows up across the work.
            </h3>
            <p id="architecture-proof-status" className="mt-3 text-sm leading-6 text-white/52" aria-live="polite" aria-atomic="true">
              Showing {visibleSystems.length} {activeFilterCountLabel} across each layer.
            </p>
          </div>
          <div
            className="grid grid-cols-3 gap-1 rounded-full border border-white/10 bg-white/[0.045] p-1"
            role="group"
            aria-label="Filter layer proof systems"
            aria-describedby="architecture-proof-status"
          >
            {architectureProofFilters.map((label) => {
              const isActive = activeFamily === label;

              return (
                <button
                  key={`architecture-proof-filter-${label}`}
                  type="button"
                  data-architecture-proof-filter={label.toLowerCase()}
                  aria-pressed={isActive}
                  aria-controls="architecture-layer-proof-grid"
                  aria-label={`Show ${label === 'All' ? 'all systems' : `${label.toLowerCase()}s`} in the layer proof matrix`}
                  onClick={() => setActiveFamily(label)}
                  className={`rounded-full px-3 py-2 text-center text-[0.56rem] uppercase tracking-[0.13em] outline-none transition duration-300 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07101c] ${
                    isActive ? 'bg-white text-[#07101c]' : 'text-white/46 hover:bg-white/[0.08] hover:text-white/72'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div id="architecture-layer-proof-grid" className="mt-6 grid gap-4" aria-labelledby="architecture-layer-proof-title">
          {layers.map((layer, index) => {
            const layerLabel = getArchitectureLayerLabel(layer, index);
            const layerHeadingId = getArchitectureLayerHeadingId(layer);

            return (
              <motion.article
                key={`architecture-proof-${layer.layer}`}
                aria-labelledby={layerHeadingId}
                className="relative overflow-hidden rounded-[1.55rem] border border-white/10 bg-white/[0.05] p-4 md:p-5"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.62, delay: index * 0.05 }}
                viewport={{ once: true, margin: '-80px' }}
              >
                <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-transparent via-[#89AACC]/60 to-transparent opacity-50" />
                <div className="grid gap-5 xl:grid-cols-[16rem_minmax(0,1fr)]">
                  <div>
                    <p className="font-display text-5xl italic leading-none text-white/28">
                      {String(index + 1).padStart(2, '0')}
                    </p>
                    <h4 id={layerHeadingId} className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">{layer.layer}</h4>
                    <p className="mt-3 text-sm leading-6 text-white/62">{contentValue(layer.purpose)}</p>
                    <p className="mt-4 text-[0.58rem] uppercase tracking-[0.16em] text-white/34">
                      {contentValue(layer.examples)}
                    </p>
                  </div>

                  <motion.div
                    layout
                    role="list"
                    aria-labelledby={layerHeadingId}
                    className={proofCardGridClass}
                  >
                    <AnimatePresence mode="popLayout">
                      {visibleSystems.map((system, systemIndex) => (
                        <motion.div
                          key={`architecture-proof-${layer.layer}-${system.project.projectName}`}
                          role="listitem"
                          aria-label={`${system.project.projectName} ${layer.layer} layer example`}
                          layout
                          className={`flex h-full min-h-[9.75rem] flex-col rounded-[1.05rem] border p-4 md:min-h-[10.25rem] ${
                            system.family === 'Product'
                              ? 'border-white/12 bg-white/[0.065]'
                              : 'border-[#89AACC]/22 bg-[#89AACC]/[0.085]'
                          }`}
                          initial={{ opacity: 0, y: 16 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8, scale: 0.98 }}
                          transition={{ duration: 0.42, delay: Math.min(systemIndex * 0.025, 0.14) }}
                          viewport={{ once: true, margin: '-70px' }}
                          whileHover={{
                            y: -4,
                            borderColor:
                              system.family === 'Product' ? 'rgba(255,255,255,0.25)' : 'rgba(137,170,204,0.42)',
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold tracking-[-0.02em] text-white">
                                {system.project.projectName}
                              </p>
                              <p className="mt-1 text-[0.54rem] uppercase tracking-[0.13em] text-white/38">
                                {getArchitectureSystemMetaLabel(system)}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-full border border-white/12 bg-black/18 px-2 py-1 text-[0.52rem] uppercase tracking-[0.1em] text-white/44">
                              {system.code}
                            </span>
                          </div>
                          <p className="mt-4 text-xs leading-5 text-white/62">
                            {getProjectLayerSummary(system.project, layerLabel, index)}
                          </p>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ArchitectureCTA({
  osReader,
  onOpen,
}: {
  osReader: CaseStudyEntry | undefined;
  onOpen: (item: CaseStudyEntry) => void;
}) {
  const thesisRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: thesisRef, offset: ['start 0.9', 'end 0.65'] });
  const thesisProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <motion.div
      ref={thesisRef}
      aria-labelledby="architecture-thesis-title"
      className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.62 }}
      viewport={{ once: true, margin: '-80px' }}
    >
      <div className="relative overflow-hidden rounded-[1.7rem] border border-[#6e8bff]/24 bg-[#6e8bff]/[0.06] p-5 backdrop-blur-xl md:p-6">
        <motion.div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-[#89AACC]/0 via-[#89AACC]/80 to-white/0"
          style={{ scaleX: thesisProgress }}
        />
        <p className="text-[0.58rem] uppercase tracking-[0.17em] text-[#9fb6cf]">The thesis</p>
        <p id="architecture-thesis-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
          AI-Native Product OS
        </p>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/64">
          These projects are not separate experiments with AI sprinkled on top. They are different expressions of the same operating system: choose the model, load the context, orchestrate execution, govern the risk, and keep human judgment in charge.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 lg:justify-end">
        {osReader ? (
          <button
            type="button"
            aria-label="Read the AI-Native Product OS thesis"
            onClick={() => onOpen(osReader)}
            className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-[#07101c] outline-none transition duration-300 hover:scale-[1.03] hover:bg-[#dce8f2] focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07101c]"
          >
            Read the thesis
          </button>
        ) : null}
        <a
          href="https://maven.com/raminhoodeh/ai-product"
          target="_blank"
          rel="noreferrer"
          aria-label="Take the AI Product course on Maven, opens in a new tab"
          className="rounded-full border border-white/16 bg-white/[0.08] px-5 py-2.5 text-sm text-white/80 outline-none transition duration-300 hover:bg-white hover:text-[#07101c] focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07101c]"
        >
          Take the course →
        </a>
      </div>
    </motion.div>
  );
}

export function ArchitectureKernel({ onOpen }: { onOpen: (item: CaseStudyEntry) => void }) {
  const architectureRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: architectureRef, offset: ['start end', 'end start'] });
  const sectionProgress = useTransform(scrollYProgress, [0.08, 0.92], [0, 1]);
  const sectionGlowOpacity = useTransform(scrollYProgress, [0, 0.22, 0.78, 1], [0.08, 0.22, 0.18, 0.06]);
  const architecture = portfolioContent.personalProjects.architectureAcrossTools;
  const { selfware, tools } = portfolioContent.personalProjects;
  const osReader = getProjectReader('AI Native Product OS');
  const architectureSystems = useMemo<ArchitectureSystem[]>(
    () => [
      ...selfware.map((project, index) => ({
        project,
        code: `P${index + 1}`,
        family: 'Product' as const,
      })),
      ...tools.map((project, index) => ({
        project,
        code: `T${index + 1}`,
        family: 'Tool' as const,
      })),
    ],
    [selfware, tools],
  );

  return (
    <section
      ref={architectureRef}
      id="projects-architecture"
      data-architecture-section="ai-native-product-os"
      aria-labelledby="architecture-section-title"
      className="relative min-h-[100svh] overflow-hidden px-5 pb-40 pt-24 sm:px-8 md:pb-48 md:px-12 lg:px-16"
    >
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/26 to-transparent" />
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px origin-left bg-gradient-to-r from-[#89AACC]/0 via-[#89AACC]/80 to-white/0"
        style={{ scaleX: sectionProgress }}
      />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-[42%] h-[56rem] w-[56rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-white/[0.022]"
      />
      <motion.div
        aria-hidden="true"
        className="absolute -right-56 bottom-12 h-[34rem] w-[34rem] rounded-full bg-[#89AACC]/[0.08] blur-3xl"
        style={{ opacity: sectionGlowOpacity }}
      />
      <div aria-hidden="true" className="absolute -left-52 top-36 h-[30rem] w-[30rem] rounded-full bg-white/[0.05] blur-3xl" />

      <div className="relative z-10 mx-auto max-w-[1540px]">
        <ArchitectureIntro
          architectureTitle={architecture.title}
          systemCount={architectureSystems.length}
          productCount={selfware.length}
          toolCount={tools.length}
          layerCount={architecture.layers.length}
        />
        <OldToNewProcess />
        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <OperatingLoopDiagram />
          <FiveLayerTriangle layers={architecture.layers} />
        </div>
        <LayerProofMatrix layers={architecture.layers} systems={architectureSystems} />
        <ArchitectureCTA osReader={osReader} onOpen={onOpen} />
      </div>
    </section>
  );
}

export function ProjectActRail() {
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

function FeaturedProject({
  project,
  selfware,
  tools,
  onOpen,
}: {
  project: PersonalProjectEntry;
  selfware: readonly PersonalProjectEntry[];
  tools: readonly PersonalProjectEntry[];
  onOpen: (item: CaseStudyEntry) => void;
}) {
  const reader = getProjectReader(project.projectName);
  const liveHref = isPlaceholderValue(project.liveLink) ? undefined : project.liveLink;
  const architectureSummary = getImplementationArchitectureSummary(project);
  const visual =
    project.projectName === 'Dreamsea'
      ? dreamseaHomepageScreenUrl
      : selfwareGeneratedArtwork[project.projectName] ??
        (isPlaceholderValue(project.mainPictureGif) ? undefined : project.mainPictureGif);
  const poster =
    selfwareGeneratedArtwork[project.projectName] ??
    (isPlaceholderValue(project.mainPictureGif) ? undefined : project.mainPictureGif);
  const visualRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: visualRef, offset: ['start end', 'end start'] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ['-5%', '5%']);

  return (
    <section id="projects-featured" className="relative px-5 pb-10 pt-4 sm:px-8 md:px-12 lg:px-16">
      <div className="mx-auto max-w-[1500px]">
        <ProjectsUnderpinnedByRow selfware={selfware} tools={tools} />
        <p className="mt-8 text-sm uppercase tracking-[0.3em] text-[#9fb6cf]">★ Featured build</p>
        <motion.article
          className="mt-5 overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/[0.07] shadow-[0_50px_160px_rgba(0,0,0,0.5)] ring-1 ring-[#6e8bff]/20 backdrop-blur-2xl"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            <div ref={visualRef} className="relative min-h-[24rem] overflow-hidden lg:min-h-[40rem]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(110,139,255,0.22),transparent_62%)]" />
              {visual ? (
                <motion.div style={{ y: parallaxY }} className="absolute inset-0 flex items-center justify-center p-6 md:p-10">
                  <div style={{ height: '88%', aspectRatio: '0.47' }}>
                    <IPhone3D
                      screenSrc={visual}
                      poster={poster ?? visual}
                      ariaLabel={`${project.projectName} shown on a rotating 3D iPhone`}
                    />
                  </div>
                </motion.div>
              ) : null}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#08111d]/55" />
              <ProjectVisualChipOverlay chips={[getProjectTypeLabel(project)]} />
            </div>
            <div className="flex flex-col justify-center gap-6 p-8 md:p-12">
              <h3 className="text-[clamp(3rem,6vw,5.6rem)] font-black uppercase leading-[0.84] tracking-[-0.06em] text-white">
                {project.projectName}
              </h3>
              <p className="max-w-xl text-base leading-8 text-white/74 md:text-lg">{getProjectDescription(project)}</p>
              <div className="rounded-[1.2rem] border border-white/10 bg-black/20 p-4 md:p-5">
                <p className="text-[0.56rem] uppercase tracking-[0.14em] text-white/36">Architecture</p>
                <p className="mt-3 text-base font-medium leading-7 text-white/78">{architectureSummary}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {liveHref ? (
                  <a
                    href={liveHref}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-white px-6 py-3.5 text-sm font-medium text-[#07101c] transition duration-300 hover:scale-[1.03] hover:bg-[#dce8f2]"
                  >
                    Open live →
                  </a>
                ) : null}
                {reader ? (
                  <button
                    type="button"
                    onClick={() => onOpen(reader)}
                    className="rounded-full border border-white/16 bg-white/[0.08] px-6 py-3.5 text-sm text-white/80 transition duration-300 hover:bg-white hover:text-[#07101c]"
                  >
                    Deep dive +
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </motion.article>
      </div>
    </section>
  );
}

export function CaseStudyGrid({ onOpen }: { onOpen: (item: CaseStudyEntry) => void }) {
  const { selfware, tools } = portfolioContent.personalProjects;
  const layerCount = portfolioContent.personalProjects.architectureAcrossTools.layers.length;
  const featured = selfware.find((project) => project.projectName === 'Dreamsea') ?? selfware[0];

  return (
    <section id="projects" className="projects-cinematic relative isolate min-h-screen overflow-hidden bg-transparent pb-32 text-white">
      <ProjectActRail />
      <ProjectCinematicHero selfware={selfware} tools={tools} layerCount={layerCount} />
      {featured ? <FeaturedProject project={featured} selfware={selfware} tools={tools} onOpen={onOpen} /> : null}
      <SelfwareStickyStack projects={selfware} onOpen={onOpen} />
      <ToolsOperationsBay projects={tools} onOpen={onOpen} />
      <ArchitectureKernel onOpen={onOpen} />
    </section>
  );
}
