import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  type CaseStudyEntry,
} from '../types';
import { portfolioContent } from '../../data/portfolio';
import { getProjectCardDescriptionByName } from './projectCopy';
import { IPhone3D } from '../../components/IPhone3D';
import aiCostsDashboardVisualUrl from '../../assets/projects/ai-costs-mock.webp';
import aiNativeProductOsVisualUrl from '../../assets/projects/ai-native-os-hero.webp';
import massSocialWisdomAgentVisualUrl from '../../assets/projects/mass-social.gif';
import nssoBillboardStageUrl from '../../assets/projects/nsso-billboard-stage4.jpg';
import nssoVisualUrl from '../../assets/projects/nsso-mock.webp';
import qadamVisualUrl from '../../assets/projects/qadam-mock.webp';
import ragPipelineVisualUrl from '../../assets/projects/rag-mock.webp';
import razinflixBackdropUrl from '../../assets/projects/razinflix-backdrop.svg';
import razinflixVisualUrl from '../../assets/projects/razinflix-mock.webp';
import aiCostsDashboardProjectImageUrl from '../../../projects-section/Project Images/AI Costs Dashboard.webp';
import aiNativeProductOsProjectImageUrl from '../../../projects-section/Project Images/AI Native Product OS.webp';
import massSocialWisdomAgentProjectImageUrl from '../../../projects-section/Project Images/Mass Social Wisdom Agent.webp';
import nssoProjectImageUrl from '../../../projects-section/Project Images/nsso.webp';
import qadamProjectImageUrl from '../../../projects-section/Project Images/Qadam.webp';
import ragPipelineProjectImageUrl from '../../../projects-section/Project Images/RAG Pipeline.webp';
import razinflixProjectImageUrl from '../../../projects-section/Project Images/RazinFlix.webp';
import dreamseaHomepageScreenUrl from '../../../projects-section/Project Images/dreamsea-images/dreamsea-homepage.PNG';
import conciergeHomepageScreenUrl from '../../../projects-section/Project Images/24seven-concierge-images/24-seven-homepage.PNG';

const mobileDeepDivePresentation: Record<string, { screen: string }> = {
  Dreamsea: {
    screen: dreamseaHomepageScreenUrl,
  },
  '24Seven Concierge': {
    screen: conciergeHomepageScreenUrl,
  },
};

const toolCaseStudyTitles = new Set(portfolioContent.personalProjects.tools.map((project) => project.projectName));

type NonMobileVisualSlide = {
  label: string;
  detail: string;
  image: string;
  fit?: 'cover' | 'contain';
  position?: string;
};

type NonMobileVisualConfig = {
  accent: string;
  glow: string;
  surface: string;
  slides: readonly NonMobileVisualSlide[];
};

type ProofCtaKind = 'app-store' | 'github' | 'live';

type ProofCta = {
  kind: ProofCtaKind;
  href: string;
  label: string;
  eyebrow: string;
  description: string;
};

const proofCtaDescriptions: Record<string, string> = {
  nsso:
    'Open the live nsso product surface in a new tab. Use it to inspect the public profile system, profile storefront, Deity profile-coach access, and the working Ramin profile example.',
  Dreamsea:
    'Open the public App Store listing. Download it on iPhone to inspect the live voice-capture dream journal, interpretation flow, and symbolic generation experience.',
  Qadam:
    'Open the live Qadam web surface in a new tab. The link shows the catalyst-driven intelligence product and the public paper-proof framing before any live-capital claim.',
  '24Seven Concierge':
    'Open the public App Store listing. Download the iPhone app to inspect the live travel concierge, destination browsing, catalog-led planning, and AI-to-human handoff.',
  RazinFlix:
    'Open the live RazinFlix route in a new tab. The link shows the poster-led film library, category rows, search, trailer modal, and recommendation surface.',
  'AI-Native Product Manager OS':
    'Open the public GitHub repository. Clone or download it to inspect the installable local PM operating system, workflow files, templates, review panels, and governance checks.',
  'AI Native Product OS':
    'Open the public GitHub repository. Use it to inspect the five-layer operating-system materials, thesis assets, and reusable AI-native product-management structure.',
  'AI-Native Product OS':
    'Open the public GitHub repository. Use it to inspect the five-layer operating-system materials, thesis assets, and reusable AI-native product-management structure.',
  'Mass Social Wisdom Agent':
    'Open the public GitHub repository. Review the Flask and Gemini workflow, live extraction logs, URL/image ingestion path, and .docx export implementation.',
  'AI Costs Dashboard':
    'Open the public GitHub repository. Review the dashboard implementation for usage events, spend visibility, latency, failure tracking, and model/provider attribution.',
  'RAG Pipeline':
    'Open the public GitHub repository. Review the reusable ingestion, chunking, embedding, retrieval, reranking, verification, and context-injection pipeline.',
};

const productDeepDiveQuotes: Record<string, string> = {
  Qadam: '“A hedge fund team that fits inside your laptop.”',
  nsso: '“The CV of the future.”',
  RazinFlix: '“From watchlist to personal Netflix.”',
  Dreamsea: '“A dream interpreter under your pillow.”',
  '24Seven Concierge': '“A holiday concierge in your pocket.”',
};

const nonMobileDeepDiveVisuals: Record<string, NonMobileVisualConfig> = {
  nsso: {
    accent: '#d4e5f4',
    glow: 'rgba(186, 213, 237, 0.34)',
    surface: 'rgba(12, 21, 33, 0.58)',
    slides: [
      {
        label: 'Public identity surface',
        detail: 'Profile, storefront, proof, payments, and Deity context in one owned professional home.',
        image: nssoVisualUrl,
      },
      {
        label: 'Billboard proof',
        detail: 'The product behaves like a public identity billboard rather than a static portfolio page.',
        image: nssoBillboardStageUrl,
      },
      {
        label: 'Product system view',
        detail: 'A compact view of the same profile, shop, and AI-coach architecture used in the build.',
        image: nssoProjectImageUrl,
      },
    ],
  },
  Qadam: {
    accent: '#89aacc',
    glow: 'rgba(102, 132, 178, 0.36)',
    surface: 'rgba(4, 12, 22, 0.68)',
    slides: [
      {
        label: 'Market cockpit',
        detail: 'Catalyst, source, signal, and paper-proof posture arranged as an intelligence surface.',
        image: qadamVisualUrl,
      },
      {
        label: 'Command layer',
        detail: 'The visual language is closer to a decision room than a generic finance dashboard.',
        image: qadamProjectImageUrl,
      },
    ],
  },
  RazinFlix: {
    accent: '#d9b074',
    glow: 'rgba(217, 176, 116, 0.34)',
    surface: 'rgba(17, 12, 14, 0.66)',
    slides: [
      {
        label: 'Streaming-style library',
        detail: 'A personal film spreadsheet becomes a browsable canon with posters, shelves, and atmosphere.',
        image: razinflixVisualUrl,
      },
      {
        label: 'Cinematic proof',
        detail: 'The surface is intentionally poster-led: taste is visible before metadata has to explain it.',
        image: razinflixProjectImageUrl,
      },
      {
        label: 'Backdrop system',
        detail: 'The enrichment layer supports the theatre-like browsing treatment rather than a table view.',
        image: razinflixBackdropUrl,
        fit: 'contain',
      },
    ],
  },
  'Mass Social Wisdom Agent': {
    accent: '#9fb6cf',
    glow: 'rgba(159, 182, 207, 0.32)',
    surface: 'rgba(7, 16, 27, 0.68)',
    slides: [
      {
        label: 'Live extraction run',
        detail: 'Messy URLs and screenshots become a visible processing run with logs and extracted items.',
        image: massSocialWisdomAgentVisualUrl,
      },
      {
        label: 'Knowledge output',
        detail: 'The workflow resolves into structured material ready for a document or Notion import.',
        image: massSocialWisdomAgentProjectImageUrl,
      },
    ],
  },
  'AI Costs Dashboard': {
    accent: '#93c5fd',
    glow: 'rgba(147, 197, 253, 0.28)',
    surface: 'rgba(7, 17, 30, 0.68)',
    slides: [
      {
        label: 'Cost observability',
        detail: 'Provider, model, spend, latency, and failure data become an operating surface.',
        image: aiCostsDashboardVisualUrl,
      },
      {
        label: 'Usage intelligence',
        detail: 'The dashboard turns AI product cost from an invoice surprise into a managed signal.',
        image: aiCostsDashboardProjectImageUrl,
      },
    ],
  },
  'RAG Pipeline': {
    accent: '#a7f3d0',
    glow: 'rgba(167, 243, 208, 0.22)',
    surface: 'rgba(7, 20, 22, 0.66)',
    slides: [
      {
        label: 'Retrieval infrastructure',
        detail: 'Ingestion, chunking, embeddings, retrieval, reranking, and context injection as one reusable product layer.',
        image: ragPipelineVisualUrl,
      },
      {
        label: 'Grounded answers',
        detail: 'The useful product is not chat; it is a reliable context path into the model.',
        image: ragPipelineProjectImageUrl,
      },
    ],
  },
  'AI Native Product OS': {
    accent: '#a5b4fc',
    glow: 'rgba(165, 180, 252, 0.3)',
    surface: 'rgba(9, 13, 28, 0.68)',
    slides: [
      {
        label: 'Operating system',
        detail: 'The five-layer stack and product loop expressed as a reusable AI-native working model.',
        image: aiNativeProductOsVisualUrl,
      },
      {
        label: 'Thesis surface',
        detail: 'The essay is treated as a product artifact: model, context, orchestration, governance, and human judgment.',
        image: aiNativeProductOsProjectImageUrl,
      },
    ],
  },
  'AI-Native Product Manager OS': {
    accent: '#a5b4fc',
    glow: 'rgba(165, 180, 252, 0.3)',
    surface: 'rgba(9, 13, 28, 0.68)',
    slides: [
      {
        label: 'Installable workspace',
        detail: 'A local folder a PM can open in Codex, Claude Code, Cursor, or Antigravity to run AI-native product work from durable context.',
        image: aiNativeProductOsVisualUrl,
      },
      {
        label: 'Course companion',
        detail: 'The product turns the course thesis into files: context library, workflows, templates, review panels, governance, outputs, and adapters.',
        image: aiNativeProductOsProjectImageUrl,
      },
    ],
  },
  'AI-Native Product OS': {
    accent: '#a5b4fc',
    glow: 'rgba(165, 180, 252, 0.3)',
    surface: 'rgba(9, 13, 28, 0.68)',
    slides: [
      {
        label: 'Operating system',
        detail: 'The five-layer stack and product loop expressed as a reusable AI-native working model.',
        image: aiNativeProductOsVisualUrl,
      },
      {
        label: 'Thesis surface',
        detail: 'The essay is treated as a product artifact: model, context, orchestration, governance, and human judgment.',
        image: aiNativeProductOsProjectImageUrl,
      },
    ],
  },
};

function getNonMobileVisualConfig(item: CaseStudyEntry): NonMobileVisualConfig {
  const configured = nonMobileDeepDiveVisuals[item.title];
  if (configured) return configured;

  const fallbackImage = item.heroImage ?? aiNativeProductOsVisualUrl;
  return {
    accent: '#9fb6cf',
    glow: 'rgba(159, 182, 207, 0.28)',
    surface: 'rgba(9, 18, 31, 0.66)',
    slides: [
      {
        label: 'Product surface',
        detail: item.summary,
        image: fallbackImage,
      },
    ],
  };
}

function classifyProofLink(link: CaseStudyEntry['links'][number]): ProofCtaKind {
  const signature = `${link.label} ${link.href}`.toLowerCase();
  if (signature.includes('apps.apple.com') || signature.includes('app store')) return 'app-store';
  if (signature.includes('github.com') || signature.includes('github')) return 'github';
  return 'live';
}

function getPreferredProofLink(item: CaseStudyEntry) {
  const appStoreLink = item.links.find((link) => classifyProofLink(link) === 'app-store');
  const liveLink = item.links.find((link) => classifyProofLink(link) === 'live' && /open live|live|product|profile|site/i.test(link.label));
  const githubLink = item.links.find((link) => classifyProofLink(link) === 'github');

  return appStoreLink ?? liveLink ?? githubLink ?? item.links[0];
}

function getProofCta(item: CaseStudyEntry): ProofCta | null {
  const link = getPreferredProofLink(item);
  if (!link) return null;

  const kind = classifyProofLink(link);
  const defaults: Record<ProofCtaKind, Pick<ProofCta, 'eyebrow' | 'label' | 'description'>> = {
    'app-store': {
      eyebrow: 'App Store proof',
      label: 'View App Store →',
      description: 'Open the public App Store listing to download the live mobile product and inspect the user-facing release.',
    },
    github: {
      eyebrow: 'Repository proof',
      label: 'View GitHub →',
      description: 'Open the public GitHub repository to inspect the source, architecture, and implementation details behind the tool.',
    },
    live: {
      eyebrow: 'Live product proof',
      label: 'Open live →',
      description: 'Open the live product in a new tab to inspect the public surface rather than only the portfolio write-up.',
    },
  };
  const fallback = defaults[kind];

  return {
    kind,
    href: link.href,
    label: fallback.label,
    eyebrow: fallback.eyebrow,
    description: proofCtaDescriptions[item.title] ?? fallback.description,
  };
}

function isDemoProofSection(label: string) {
  const normalisedLabel = label.toLowerCase();
  return normalisedLabel.includes('demo') && normalisedLabel.includes('proof');
}

function shouldShowToolArchitectureLayers(item: CaseStudyEntry, sectionLabel: string) {
  return sectionLabel.toLowerCase() === 'architecture' && toolCaseStudyTitles.has(item.title) && item.structure.length > 0;
}

export function ProjectCaseStudyRow({
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

function NonMobileCaseStudyVisualPanel({ item }: { item: CaseStudyEntry }) {
  const shouldReduceMotion = useReducedMotion();
  const config = useMemo(() => getNonMobileVisualConfig(item), [item]);
  const slides = config.slides;
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex] ?? slides[0];
  const sourceLinks = item.links
    .filter((link) => !(item.title === 'nsso' && link.label === 'Public profile'))
    .slice(0, 2);

  useEffect(() => {
    setActiveIndex(0);
  }, [item.id]);

  useEffect(() => {
    if (shouldReduceMotion || slides.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [shouldReduceMotion, slides.length]);

  return (
    <aside className="deep-dive-support-rail liquid-glass-strong flex min-h-[64vh] flex-col overflow-hidden rounded-[2rem] lg:h-full lg:min-h-0">
      <div
        className="relative flex min-h-[38rem] flex-1 flex-col overflow-hidden rounded-[2rem] border border-white/14 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]"
        style={{ backgroundColor: config.surface }}
      >
        <div className="absolute inset-0">
          <motion.img
            key={`${item.id}-${activeSlide.image}-backdrop`}
            src={activeSlide.image}
            alt=""
            decoding="async"
            className="h-full w-full scale-110 object-cover opacity-28 blur-2xl saturate-[1.15]"
            style={{ objectPosition: activeSlide.position ?? '50% 50%' }}
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 1.16 }}
            animate={shouldReduceMotion ? undefined : { opacity: 0.28, scale: 1.1 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 28% 18%, ${config.glow}, transparent 38%), linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.03) 34%, rgba(1,6,14,0.58) 100%)`,
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.16)_1px,transparent_1px)] bg-[length:5px_5px] opacity-[0.12]" />
        </div>

        <div className="pointer-events-none absolute left-5 right-5 top-6 z-10 select-none overflow-visible whitespace-nowrap pr-[0.16em] font-body text-[clamp(4.5rem,8.6vw,8.2rem)] font-black leading-none tracking-[-0.08em] text-white/[0.09] sm:left-7 sm:right-7">
          {item.title}
        </div>

        <div className="relative z-20 flex min-h-0 flex-1 flex-col p-5 pt-[7.25rem] md:p-7 md:pt-[8rem]">
          <div className="flex min-h-[18rem] flex-1 items-center">
            <motion.div
              key={`${item.id}-${activeSlide.label}`}
              className="w-full overflow-hidden rounded-[1.45rem] border border-white/18 bg-black/26 shadow-[0_34px_110px_rgba(0,0,0,0.38)] backdrop-blur-xl"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.58, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="flex h-9 items-center justify-between border-b border-white/10 bg-white/[0.075] px-4">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/42" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/28" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/18" />
                </div>
                <p className="max-w-[56%] truncate text-[0.56rem] uppercase tracking-[0.14em] text-white/42">
                  {activeSlide.label}
                </p>
              </div>
              <div className="relative aspect-[16/9] overflow-hidden bg-black/30">
                <img
                  src={activeSlide.image}
                  alt={`${item.title} ${activeSlide.label}`}
                  decoding="async"
                  className={`h-full w-full ${activeSlide.fit === 'contain' ? 'object-contain p-5' : 'object-cover'}`}
                  style={{ objectPosition: activeSlide.position ?? '50% 50%' }}
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/28 via-transparent to-white/[0.035]" />
              </div>
            </motion.div>
          </div>

          <div className="mt-5 shrink-0">
            <div className="rounded-[1.35rem] border border-white/12 bg-black/18 p-4 backdrop-blur-xl">
              <p className="text-[0.58rem] uppercase tracking-[0.18em] text-white/40">{activeSlide.label}</p>
              <p className="mt-2 text-sm leading-6 text-white/72">{activeSlide.detail}</p>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {slides.map((slide, index) => {
                const isActive = index === activeIndex;

                return (
                  <button
                    key={`${item.id}-${slide.label}`}
                    type="button"
                    aria-label={`Show ${slide.label}`}
                    aria-pressed={isActive}
                    onClick={() => setActiveIndex(index)}
                    className={`group overflow-hidden rounded-[1rem] border p-1 transition duration-300 ${
                      isActive
                        ? 'border-white/40 bg-white/[0.16]'
                        : 'border-white/10 bg-white/[0.055] hover:border-white/24 hover:bg-white/[0.11]'
                    }`}
                  >
                    <div className="relative aspect-[16/9] overflow-hidden rounded-[0.75rem] bg-black/22">
                      <img
                        src={slide.image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className={`h-full w-full transition duration-500 group-hover:scale-[1.04] ${
                          slide.fit === 'contain' ? 'object-contain p-2' : 'object-cover'
                        }`}
                        style={{ objectPosition: slide.position ?? '50% 50%' }}
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {sourceLinks.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {sourceLinks.map((link) => (
                  <a
                    key={`${item.id}-${link.href}`}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-white/12 bg-white/[0.08] px-3 py-2 text-xs text-white/70 transition duration-300 hover:bg-white hover:text-[#07101c]"
                  >
                    {link.label} →
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  );
}


export function CaseStudyOverlay({ item, onClose }: { item: CaseStudyEntry; onClose: () => void }) {
  const mobilePresentation = mobileDeepDivePresentation[item.title];
  const overviewBody = getProjectCardDescriptionByName(item.title, item.summary);
  const proofCta = getProofCta(item);
  const productQuote = productDeepDiveQuotes[item.title];
  const sections = [
    { label: 'Overview', body: [overviewBody] },
    ...item.sections.filter((section) => section.label.toLowerCase() !== 'overview'),
  ];

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
      className="fixed inset-0 z-[220] overflow-y-auto px-3 py-3 text-text-primary sm:px-5 sm:py-5"
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

      <motion.article className="relative mx-auto grid min-h-[calc(100svh-1.5rem)] max-w-[1320px] gap-4 lg:h-[calc(100svh-2.5rem)] lg:min-h-0 lg:grid-cols-[0.9fr_1.1fr] lg:overflow-hidden">
        {mobilePresentation ? (
          <aside className="deep-dive-support-rail liquid-glass-strong flex min-h-[64vh] flex-col overflow-hidden rounded-[2rem] lg:h-full lg:min-h-0">
            <div className="relative min-h-[38rem] flex-1 overflow-hidden rounded-[2rem] border border-white/12 bg-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-[#6e8bff]/20 backdrop-blur-2xl sm:min-h-[44rem] lg:h-full lg:min-h-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(110,139,255,0.22),transparent_62%)]" />
              <div className="pointer-events-none absolute left-7 top-7 z-10 max-w-[85%] md:left-8 md:top-8">
                <p className="text-xs uppercase tracking-[0.28em] text-muted">{item.eyebrow}</p>
                <h2 className="mt-4 max-w-[8.5ch] font-body text-[clamp(4.2rem,8vw,7.2rem)] font-semibold leading-[0.88] tracking-[-0.06em] text-text-primary/75">
                  {item.title}
                </h2>
              </div>
              <div className="absolute inset-0 z-20 flex items-center justify-center px-2 py-2 sm:px-5 lg:px-1">
                <div className="h-[108%] max-h-[44rem] min-h-[32rem] aspect-[0.47] translate-y-10 sm:max-h-[50rem] sm:translate-y-12 lg:max-h-[82vh] lg:translate-y-14">
                  <IPhone3D
                    screenSrc={mobilePresentation.screen}
                    poster={mobilePresentation.screen}
                    ariaLabel={`${item.title} shown on a rotating 3D iPhone`}
                  />
                </div>
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#08111d]/55" />
            </div>
          </aside>
        ) : (
          <NonMobileCaseStudyVisualPanel item={item} />
        )}

        <div className="liquid-glass-strong flex flex-col rounded-[2rem] p-6 md:p-8 lg:min-h-0 lg:overflow-hidden">
          <div className="flex shrink-0 items-start justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">{item.typeLabel}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.22em] text-muted">
                // {item.title}
              </p>
            </div>
            <button
              type="button"
              aria-label="Close case study"
              onClick={onClose}
              className="card-glass-attachment is-active"
            >
              <span className="card-glass-attachment__glyph">
                <span className="card-glass-attachment__line card-glass-attachment__line-horizontal" />
                <span className="card-glass-attachment__line card-glass-attachment__line-vertical" />
              </span>
            </button>
          </div>

          <div className="project-deep-dive-scroll mt-8 pr-1 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-4">
            {productQuote ? (
              <figure className="mb-6 border-b border-[#89AACC]/18 pb-6">
                <blockquote className="font-display text-[clamp(2.5rem,5vw,4.8rem)] italic leading-[0.9] tracking-[-0.045em] text-text-primary/78">
                  {productQuote}
                </blockquote>
              </figure>
            ) : null}
            <div className="grid gap-5">
              {sections.map((section, index) => {
                const showToolArchitectureLayers = shouldShowToolArchitectureLayers(item, section.label);

                return (
                  <section key={`${item.id}-${section.label}`} className="liquid-glass rounded-[1.5rem] p-5 md:p-6">
                    <p className={`text-xs uppercase tracking-[0.22em] text-muted ${section.label === 'Overview' ? 'font-semibold' : ''}`}>
                      {String(index + 1).padStart(2, '0')} / {section.label}
                    </p>
                    <div className="mt-4 space-y-4">
                      {section.body.map((paragraph) => (
                        <p
                          key={paragraph}
                          className={`text-sm leading-7 text-text-primary md:text-base ${
                            section.label === 'Overview' ? 'font-semibold' : ''
                          }`}
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    {showToolArchitectureLayers ? (
                      <div className="mt-5 grid auto-rows-fr gap-3 sm:grid-cols-2">
                        {item.structure.map((detail) => (
                          <div
                            key={`${item.id}-architecture-layer-${detail.label}`}
                            className="rounded-[1.05rem] border border-[#89AACC]/18 bg-[#89AACC]/[0.07] p-4"
                          >
                            <p className="text-[0.58rem] uppercase tracking-[0.16em] text-muted">{detail.label}</p>
                            <p className="mt-3 text-sm leading-6 text-text-primary/78">{detail.value}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {proofCta && isDemoProofSection(section.label) ? (
                      <div className="mt-5 rounded-[1.15rem] border border-[#89AACC]/24 bg-[#89AACC]/[0.08] p-4 md:p-5">
                        <p className="text-[0.58rem] uppercase tracking-[0.16em] text-muted">{proofCta.eyebrow}</p>
                        <p className="mt-3 text-sm leading-6 text-text-primary/78 md:text-base">{proofCta.description}</p>
                        <a
                          href={proofCta.href}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 inline-flex w-fit items-center rounded-full bg-text-primary px-5 py-3 text-sm font-medium text-bg transition duration-300 hover:scale-[1.03] hover:bg-[#dce8f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                        >
                          {proofCta.label}
                        </a>
                      </div>
                    ) : null}
                  </section>
                );
              })}
            </div>

          </div>
        </div>
      </motion.article>
    </motion.div>
  );
}
