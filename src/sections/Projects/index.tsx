import { useCallback, useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react';
import type { ReactNode, CSSProperties } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import aiCostsDashboardArtworkUrl from '../../assets/projects/ai-costs-mock.webp';
import aiNativeProductOsArtworkUrl from '../../assets/projects/ai-native-os-hero.webp';
import conciergeSelfwareArtworkUrl from '../../assets/projects/24seven-mock.webp';
import dreamseaSelfwareArtworkUrl from '../../assets/projects/dreamsea-mock.webp';
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
  countPlaceholders,
  type PlaceholderLike,
} from '../../lib/placeholder';
import { ContentToken } from '../../components/ContentToken';
import { WorkflowDiagram } from '../../components/WorkflowDiagram';
import { SectionKicker } from '../../components/SectionHeader';
import {
  projectExperienceGroups,
  toolsSystemSignals,
  layerValueKeys,
  thoughtArchitectureByProject,
  toolSystemBySlug,
  projectActNavItems,
  thoughtFormatNavGroups,
  projectArchitectureFlow,
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

function ProjectCinematicPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-[0.64rem] uppercase tracking-[0.16em] text-white/68 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      {children}
    </span>
  );
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
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75 }}
          >
            <SectionKicker number="03" label="Projects" tone="dark" />
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
      <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/36 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.16em] text-white/72 backdrop-blur-md">
        {project.type}
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
  const stackPreview = project.technicalStack.slice(0, 5);
  const liveHref = isPlaceholderValue(project.liveLink) ? undefined : project.liveLink;
  const stickyOffsetRem = 1 + Math.min(index, 4) * 0.62;
  const productMeta = [
    { label: 'Surface', value: project.type },
    { label: 'Architecture', value: '5-layer AI-native stack' },
    { label: 'Status', value: liveHref ? 'Shipped · live' : 'In progress' },
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
              {liveHref ? <ProjectCinematicPill>Live</ProjectCinematicPill> : null}
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
                  Read the build
                </button>
              ) : null}
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
  const layers = project.technicalStack.slice(0, 5);
  const liveHref = isPlaceholderValue(project.liveLink) ? undefined : project.liveLink;
  const githubHref = isPlaceholderValue(project.githubLink) ? undefined : project.githubLink;
  const primaryHref = githubHref ?? liveHref;
  const output = isPlaceholderValue(project.whatIWouldImprove) ? contentValue(project.briefDescription) : contentValue(project.whatIWouldImprove);
  const workflowStages = ['Input', 'Route', 'Generate', 'Verify', 'Export'];
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
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <ProjectCinematicPill>{project.type}</ProjectCinematicPill>
            {primaryHref ? <ProjectCinematicPill>Open-source</ProjectCinematicPill> : null}
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
              Read the build
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

export function ArchitectureKernel({ onOpen }: { onOpen: (item: CaseStudyEntry) => void }) {
  const architecture = portfolioContent.personalProjects.architectureAcrossTools;
  const { selfware, tools } = portfolioContent.personalProjects;
  const osReader = getProjectReader('AI Native Product OS');
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

            <div className="mt-4 rounded-[1.4rem] border border-[#6e8bff]/26 bg-[#6e8bff]/[0.06] p-5">
              <p className="text-[0.58rem] uppercase tracking-[0.17em] text-[#9fb6cf]">The thesis</p>
              <p className="mt-2 text-xl font-semibold text-white">AI-Native Product OS</p>
              <p className="mt-2 text-sm leading-6 text-white/64">
                The five-layer stack every product above runs on — model · context · orchestration · governance · human.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {osReader ? (
                  <button
                    type="button"
                    onClick={() => onOpen(osReader)}
                    className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-[#07101c] transition duration-300 hover:scale-[1.03] hover:bg-[#dce8f2]"
                  >
                    Read the thesis
                  </button>
                ) : null}
                <a
                  href="https://maven.com/raminhoodeh/ai-product"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/16 bg-white/[0.08] px-5 py-2.5 text-sm text-white/80 transition duration-300 hover:bg-white hover:text-[#07101c]"
                >
                  Take the course →
                </a>
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

function FeaturedProject({ project, onOpen }: { project: PersonalProjectEntry; onOpen: (item: CaseStudyEntry) => void }) {
  const reader = getProjectReader(project.projectName);
  const liveHref = isPlaceholderValue(project.liveLink) ? undefined : project.liveLink;
  const visual =
    selfwareGeneratedArtwork[project.projectName] ??
    (isPlaceholderValue(project.mainPictureGif) ? undefined : project.mainPictureGif);
  const visualRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: visualRef, offset: ['start end', 'end start'] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ['-5%', '5%']);

  return (
    <section id="projects-featured" className="relative px-5 pb-10 pt-4 sm:px-8 md:px-12 lg:px-16">
      <div className="mx-auto max-w-[1500px]">
        <p className="text-sm uppercase tracking-[0.3em] text-[#9fb6cf]">★ Featured build</p>
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
                      poster={visual}
                      ariaLabel={`${project.projectName} shown on a rotating 3D iPhone`}
                    />
                  </div>
                </motion.div>
              ) : null}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#08111d]/55" />
            </div>
            <div className="flex flex-col justify-center gap-6 p-8 md:p-12">
              <div className="flex flex-wrap gap-2">
                <ProjectCinematicPill>{project.type}</ProjectCinematicPill>
                {liveHref ? <ProjectCinematicPill>Live</ProjectCinematicPill> : null}
              </div>
              <h3 className="text-[clamp(3rem,6vw,5.6rem)] font-black uppercase leading-[0.84] tracking-[-0.06em] text-white">
                {project.projectName}
              </h3>
              <p className="max-w-xl text-base leading-8 text-white/74 md:text-lg">{contentValue(project.briefDescription)}</p>
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
                    Read the build
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
  const [featured, ...restSelfware] = selfware;

  return (
    <section id="projects" className="projects-cinematic relative isolate min-h-screen overflow-hidden bg-transparent pb-32 text-white">
      <ProjectActRail />
      <ProjectCinematicHero selfware={selfware} tools={tools} layerCount={layerCount} />
      {featured ? <FeaturedProject project={featured} onOpen={onOpen} /> : null}
      <SelfwareStickyStack projects={restSelfware} onOpen={onOpen} />
      <ToolsOperationsBay projects={tools} onOpen={onOpen} />
      <ArchitectureKernel onOpen={onOpen} />
    </section>
  );
}
