import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  type CaseStudyEntry,
} from '../types';
import { portfolioContent } from '../../data/portfolio';
import { getProjectCardDescriptionByName } from './projectCopy';
import { GlassImprintCta } from '../../components/GlassImprintCta';
import { IPhone3D } from '../../components/IPhone3D';
import { MassSocialWisdomDemo } from './MassSocialWisdomDemo';
import aiCostsDashboardVisualUrl from '../../assets/projects/ai-costs-mock.webp';
import aiNativeProductOsVisualUrl from '../../assets/projects/ai-native-os-hero.webp';
import massSocialWisdomAgentAppScreenshotUrl from '../../assets/projects/mass-social-app-screenshot.webp';
import nssoVisualUrl from '../../assets/projects/nsso-mock.webp';
import qadamVisualUrl from '../../assets/projects/qadam-mock.webp';
import ragPipelineVisualUrl from '../../assets/projects/rag-mock.webp';
import razinflixVisualUrl from '../../assets/projects/razinflix-mock.webp';
import nssoProjectAnimationVideoUrl from '../../../projects-section/Project Images/nsso-recording-fixed.webm';
import nssoProfileDemoPosterUrl from '../../../projects-section/nsso-project-images/nsso-demo-poster.jpg';
import nssoProfileDemoVideoUrl from '../../../projects-section/nsso-project-images/nsso-demo.webm';
import nssoAgentDatabaseScreenUrl from '../../assets/projects/nsso-deep-dive/nsso-agent-database.webp';
import nssoExperienceBuilderScreenUrl from '../../assets/projects/nsso-deep-dive/nsso-experience-builder.webp';
import nssoLinksContactScreenUrl from '../../assets/projects/nsso-deep-dive/nsso-links-contact.webp';
import nssoLoginScreenUrl from '../../assets/projects/nsso-deep-dive/nsso-login.webp';
import nssoMobileEditScreenUrl from '../../assets/projects/nsso-deep-dive/nsso-mobile-edit.webp';
import nssoNetworkScreenUrl from '../../assets/projects/nsso-deep-dive/nsso-network-timeline.webp';
import nssoProfileEditorScreenUrl from '../../assets/projects/nsso-deep-dive/nsso-profile-editor.webp';
import nssoProductEditorScreenUrl from '../../assets/projects/nsso-deep-dive/nsso-product-editor.webp';
import nssoSalesPageBuilderScreenUrl from '../../assets/projects/nsso-deep-dive/nsso-sales-page-builder.webp';
import qadamProjectAnimationVideoUrl from '../../../projects-section/Project Images/qadam-recording-fixed.webm';
import qadamCodexAutomationPassScreenUrl from '../../assets/projects/qadam-deep-dive/qadam-codex-automation-pass.webp';
import qadamCodexNoTradeDetailScreenUrl from '../../assets/projects/qadam-deep-dive/qadam-codex-no-trade-detail.webp';
import qadamGithubInstallScreenUrl from '../../assets/projects/qadam-deep-dive/qadam-github-install.webp';
import qadamMissionControlScreenUrl from '../../../projects-section/qadam-project-pics/qadam-mission-control.png';
import qadamNodeStatusScreenUrl from '../../../projects-section/qadam-project-pics/qadam-node-status.png';
import qadamTelegramDailyUpdateScreenUrl from '../../assets/projects/qadam-deep-dive/qadam-telegram-daily-update.webp';
import qadamTelegramDeployUpdateScreenUrl from '../../assets/projects/qadam-deep-dive/qadam-telegram-deploy-update.webp';
import qadamTelegramPaperTradeScreenUrl from '../../assets/projects/qadam-deep-dive/qadam-telegram-paper-trade.webp';
import qadamTradingStrategiesScreenUrl from '../../../projects-section/qadam-project-pics/qadam-trading-strategies.png';
import qadamUserGuideScreenUrl from '../../assets/projects/qadam-deep-dive/qadam-user-guide.webp';
import qadamWhitepaperScreenUrl from '../../assets/projects/qadam-deep-dive/qadam-whitepaper.webp';
import razinflixProjectAnimationVideoUrl from '../../../projects-section/Project Images/razinflix-project-recording.webm';
import razinflixAddFilmScreenUrl from '../../assets/projects/razinflix-deep-dive/razinflix-add-film.webp';
import razinflixAdminEditorScreenUrl from '../../assets/projects/razinflix-deep-dive/razinflix-admin-editor.webp';
import razinflixAfterCatalogueScreenUrl from '../../assets/projects/razinflix-deep-dive/razinflix-after-catalogue.webp';
import razinflixBeforeWatchlistScreenUrl from '../../assets/projects/razinflix-deep-dive/razinflix-before-watchlist.webp';
import razinflixCategoryRailsScreenUrl from '../../assets/projects/razinflix-deep-dive/razinflix-category-rails.webp';
import razinflixFilmDetailScreenUrl from '../../assets/projects/razinflix-deep-dive/razinflix-film-detail.webp';
import razinflixIntelligenceRunScreenUrl from '../../assets/projects/razinflix-deep-dive/razinflix-intelligence-run.webp';
import dreamseaHomepageScreenUrl from '../../../projects-section/Project Images/dreamsea-images/dreamsea-homepage.PNG';
import dreamseaIphoneRecordingUrl from '../../../projects-section/Project Images/dreamsea-fixed-recording-3d-island.webm';
import conciergeHomepageScreenUrl from '../../../projects-section/Project Images/24seven-concierge-images/24-seven-homepage.PNG';
import conciergeScreenRecordingUrl from '../../../projects-section/Project Images/24seven-concierge-images/24-seven-concierge-screen-recording-3d-shifted-17.mp4';

const mobileDeepDivePresentation: Record<
  string,
  { screen: string; screenVideo?: string }
> = {
  Dreamsea: {
    screen: dreamseaHomepageScreenUrl,
    screenVideo: dreamseaIphoneRecordingUrl,
  },
  '24Seven Concierge': {
    screen: conciergeHomepageScreenUrl,
    screenVideo: conciergeScreenRecordingUrl,
  },
};

const toolCaseStudyTitles = new Set(portfolioContent.personalProjects.tools.map((project) => project.projectName));

type NonMobileVisualSlide = {
  label: string;
  detail: string;
  image: string;
  mobileImages?: readonly string[];
  video?: string;
  fit?: 'cover' | 'contain';
  frame?: 'web' | 'mobile';
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
    'Open the live nsso product surface in a new tab. Use it to inspect the identity system, profile storefront, Deity profile-coach access, and working Ramin profile example.',
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
        label: 'Landing page',
        detail: 'The landing page frames nsso as Shopify, but the product is you: a username-claim identity surface where profile, proof, products, links, and Deity AI come together.',
        image: nssoVisualUrl,
        video: nssoProjectAnimationVideoUrl,
      },
      {
        label: 'Profile demo',
        detail: 'The mobile profile demo shows the public identity surface end to end: bio, links, experiences, qualifications, projects, products, and services arranged as one shareable profile.',
        image: nssoProfileDemoPosterUrl,
        video: nssoProfileDemoVideoUrl,
      },
      {
        label: 'Sign-in routes',
        detail: 'The authentication screen gives users multiple entry points: Google, GitHub, email, and crypto wallet options for the future commerce layer.',
        image: nssoLoginScreenUrl,
      },
      {
        label: 'Profile editor',
        detail: 'The signed-in profile editor captures the raw material of identity: photo, name, headline, bio, custom profile domain, links, and the fields Deity later reads as live context.',
        image: nssoProfileEditorScreenUrl,
      },
      {
        label: 'Links and contact',
        detail: 'The links layer consolidates the scattered digital footprint: social accounts, content, external platforms, and contact routes in one coherent public surface.',
        image: nssoLinksContactScreenUrl,
      },
      {
        label: 'Experience builder',
        detail: 'The experience section turns job titles, qualifications, projects, and proof into structured identity data rather than a flat CV, giving Deity context it can reason over.',
        image: nssoExperienceBuilderScreenUrl,
      },
      {
        label: 'Products and services',
        detail: 'The products area lets a user add a paid offer, upload product imagery, describe the item, and attach purchase links or payment code.',
        image: nssoProductEditorScreenUrl,
      },
      {
        label: 'Sales-page builder',
        detail: 'The sales-page creator uses conversion-oriented fields - hooks, pain-benefit framing, value proposition, benefits, testimonials, and payment embeds - so products and services can sit beside the proof that makes them credible.',
        image: nssoSalesPageBuilderScreenUrl,
      },
      {
        label: 'Network timeline',
        detail: 'My nsso becomes a personal CRM: saved people, meeting context, dates, notes, and a visual journey of relationships over time.',
        image: nssoNetworkScreenUrl,
      },
      {
        label: 'Deity agent layer',
        detail: 'The Deity view shows the agentic layer: live profile context, curated knowledge retrieval, profile-aware reranking, and reviewable profile mutations instead of generic chatbot advice.',
        image: nssoAgentDatabaseScreenUrl,
      },
      {
        label: 'Mobile edit mode',
        detail: 'The mobile experience preserves the same profile-building workflow, including preview mode, Deity assistance, headline editing, and bio capture.',
        image: nssoMobileEditScreenUrl,
        fit: 'contain',
        frame: 'mobile',
      },
    ],
  },
  Qadam: {
    accent: '#89aacc',
    glow: 'rgba(102, 132, 178, 0.36)',
    surface: 'rgba(4, 12, 22, 0.68)',
    slides: [
      {
        label: 'Access gate',
        detail: 'The landing page is the public entrance to Qadam: visitors can understand the system, while allowlisted Fund Managers sign in to reach the protected cockpit.',
        image: qadamVisualUrl,
        video: qadamProjectAnimationVideoUrl,
      },
      {
        label: 'Mission Control',
        detail: 'Mission Control gives the first operating read: paper mode, live capital off, source state, strategy posture, agent/team state, hypotheses, paper account, proof status, and learning-loop maturity.',
        image: qadamMissionControlScreenUrl,
        fit: 'contain',
      },
      {
        label: 'Control Plane',
        detail: 'The control plane exposes why Qadam is allowed, blocked, degraded, or waiting: Python COO, local LLM, frontier LLM, Head of Quant, Risk Agent, Execution Policy, source plumbing, Telegram, governance, logs, and diagnostics.',
        image: qadamNodeStatusScreenUrl,
        fit: 'contain',
      },
      {
        label: 'Strategy + Reasoning',
        detail: 'The strategy view is where Qadam’s thinking lives: worldview priors, evidence packets, research goals, hypotheses, Strategy Lead challenges, and quant review can explain or challenge, but cannot execute.',
        image: qadamTradingStrategiesScreenUrl,
        fit: 'contain',
      },
      {
        label: 'Whitepaper',
        detail: 'The whitepaper explains the complete loop: world happens, Qadam observes, filters sources, forms hypotheses, challenges them, checks risk and authority, paper-trades only if gates pass, logs outcomes, and learns.',
        image: qadamWhitepaperScreenUrl,
        fit: 'contain',
      },
      {
        label: 'User guide',
        detail: 'The user guide explains how members read the cockpit, what paper trading means, what members can do, and which safety boundaries must never be crossed.',
        image: qadamUserGuideScreenUrl,
        fit: 'contain',
      },
      {
        label: 'Install surface',
        detail: 'The GitHub repository gives people the source, README, deployment history, and public project link needed to inspect or install the local trading-intelligence stack on their machine.',
        image: qadamGithubInstallScreenUrl,
        fit: 'contain',
      },
      {
        label: 'Automation pass',
        detail: 'A Codex automation run triggers one Qadam pass, reads the PaperOps summary, and reports the trade lifecycle state: allowed, blocked by evidence or risk, duplicate-protected, or waiting on current paper-order state.',
        image: qadamCodexAutomationPassScreenUrl,
        fit: 'contain',
      },
      {
        label: 'No-trade decision',
        detail: 'When Qadam does not trade, the run still explains the decision: pending paper fills, duplicate-submit protection, zero fresh eligible submits, no active blockers, or missing authority.',
        image: qadamCodexNoTradeDetailScreenUrl,
        fit: 'contain',
      },
      {
        label: 'Telegram updates',
        detail: 'Qadam pushes short summaries into Telegram: paper-trade confirmations, daily portfolio reports, and deployment notices become readable outbound updates, not hidden approvals or command authority.',
        image: qadamTelegramPaperTradeScreenUrl,
        mobileImages: [
          qadamTelegramPaperTradeScreenUrl,
          qadamTelegramDailyUpdateScreenUrl,
          qadamTelegramDeployUpdateScreenUrl,
        ],
        frame: 'mobile',
      },
    ],
  },
  RazinFlix: {
    accent: '#d9b074',
    glow: 'rgba(217, 176, 116, 0.34)',
    surface: 'rgba(17, 12, 14, 0.66)',
    slides: [
      {
        label: 'Visual catalogue',
        detail: 'The RazinFlix homepage is the visual film catalogue: poster-led shelves, a streaming-style browsing surface, and an Add Film button where users can add films to their library.',
        image: razinflixVisualUrl,
        video: razinflixProjectAnimationVideoUrl,
      },
      {
        label: 'Before: watchlist',
        detail: 'Before RazinFlix, the library lived as a text-heavy spreadsheet of IMDb IDs, film names, descriptions, release dates, directors, and ratings.',
        image: razinflixBeforeWatchlistScreenUrl,
        fit: 'contain',
      },
      {
        label: 'After: catalogue',
        detail: 'After RazinFlix, the same watchlist becomes a cinematic front-end with a hero feature, trailer CTA, More Info action, and poster-led rails.',
        image: razinflixAfterCatalogueScreenUrl,
      },
      {
        label: 'Film detail page',
        detail: 'Selecting a film opens a theatre-like detail page with the trailer, rating, year, description, director, categories, and similar-film recommendations.',
        image: razinflixFilmDetailScreenUrl,
      },
      {
        label: 'Metadata editor',
        detail: 'The admin editor lets the user refine a film record: poster/backdrop, rating, year, description, YouTube trailer URL, director, categories, and save state.',
        image: razinflixAdminEditorScreenUrl,
      },
      {
        label: 'Add-film input',
        detail: 'The Add Film modal accepts plain film names and years, including multiple titles separated by commas or line breaks, so the user does not need structured metadata upfront.',
        image: razinflixAddFilmScreenUrl,
      },
      {
        label: 'Intelligence run',
        detail: 'The processing terminal exposes the enrichment workflow: TMDB search, genre cleanup, Gemini plot synthesis, IMDb rating checks, YouTube trailer lookup, and poster validation.',
        image: razinflixIntelligenceRunScreenUrl,
      },
      {
        label: 'Black Bag added',
        detail: 'After Black Bag is added in the previous step, RazinFlix places it into the visual catalogue with poster artwork, title treatment, and the surrounding streaming-style rows.',
        image: razinflixCategoryRailsScreenUrl,
      },
    ],
  },
  'Mass Social Wisdom Agent': {
    accent: '#9fb6cf',
    glow: 'rgba(159, 182, 207, 0.32)',
    surface: 'rgba(7, 16, 27, 0.68)',
    slides: [
      {
        label: 'Portfolio web app',
        detail: 'The embedded portfolio demo shows the real app shell: prepared source URLs, processing stages, guardrails, output space, and status terminal in one surface.',
        image: massSocialWisdomAgentAppScreenshotUrl,
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
      label: 'View on GitHub →',
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

function createProofCta(item: CaseStudyEntry, link: CaseStudyEntry['links'][number]): ProofCta {
  const kind = classifyProofLink(link);
  const defaults: Record<ProofCtaKind, Pick<ProofCta, 'eyebrow' | 'label' | 'description'>> = {
    'app-store': {
      eyebrow: 'App Store proof',
      label: 'View App Store →',
      description: 'Open the public App Store listing to download the live mobile product and inspect the user-facing release.',
    },
    github: {
      eyebrow: 'Repository proof',
      label: 'View on GitHub →',
      description: 'Open the public GitHub repository to inspect the source, architecture, and implementation details behind the tool.',
    },
    live: {
      eyebrow: 'Live product proof',
      label: link.label.toLowerCase().includes('demo') ? 'Try live demo →' : 'Open live →',
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

function getDemoProofCtas(item: CaseStudyEntry): ProofCta[] {
  if (item.id === 'writeup-mass-social-wisdom-agent') {
    const githubLink = item.links.find((link) => classifyProofLink(link) === 'github');
    const liveDemoLink = item.links.find((link) => /live demo/i.test(link.label));

    return [githubLink, liveDemoLink].filter(Boolean).map((link) => createProofCta(item, link));
  }

  const proofCta = getProofCta(item);
  return proofCta ? [proofCta] : [];
}

function getProofPanelCopy(item: CaseStudyEntry, proofCtas: readonly ProofCta[]) {
  if (item.id === 'writeup-mass-social-wisdom-agent') {
    return {
      eyebrow: 'Demo / repository proof',
      description:
        'Open the live portfolio demo to try the workflow, or inspect the public GitHub repository for the Flask and Gemini implementation.',
    };
  }

  return {
    eyebrow: proofCtas[0]?.eyebrow ?? 'Proof',
    description: proofCtas[0]?.description ?? '',
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
  const [hasManualSlideSelection, setHasManualSlideSelection] = useState(false);
  const activeSlide = slides[activeIndex] ?? slides[0];
  const isMobileSlide = activeSlide.frame === 'mobile';
  const activeMobileImages = activeSlide.mobileImages ?? [activeSlide.image];
  const hasMobileImagePass = isMobileSlide && activeMobileImages.length > 1;
  const shouldBrightenBackdropTitle = item.title === 'nsso' || item.title === 'Qadam' || item.title === 'RazinFlix';
  const hasSlideNavigation = slides.length > 1;
  const sourceLinks = item.links
    .filter((link) => !(item.title === 'nsso' && link.label === 'Public profile'))
    .slice(0, 2);

  const selectSlide = (index: number) => {
    setHasManualSlideSelection(true);
    setActiveIndex(index);
  };

  const shiftSlide = (direction: -1 | 1) => {
    setHasManualSlideSelection(true);
    setActiveIndex((current) => (current + direction + slides.length) % slides.length);
  };

  useEffect(() => {
    setActiveIndex(0);
    setHasManualSlideSelection(false);
  }, [item.id]);

  useEffect(() => {
    if (shouldReduceMotion || hasManualSlideSelection || slides.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [hasManualSlideSelection, shouldReduceMotion, slides.length]);

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

        <div
          className={`pointer-events-none absolute left-5 right-5 top-6 z-10 select-none overflow-visible whitespace-nowrap pr-[0.16em] font-body text-[clamp(4.5rem,8.6vw,8.2rem)] font-black leading-none tracking-[-0.08em] sm:left-7 sm:right-7 ${
            shouldBrightenBackdropTitle ? 'text-white/[0.15]' : 'text-white/[0.09]'
          }`}
        >
          {item.title}
        </div>

        <div className="project-deep-dive-scroll relative z-20 flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-7 pt-[7.25rem] md:px-7 md:pb-8 md:pt-[8rem]">
          <div
            className={`flex shrink-0 items-center pb-2 ${
              isMobileSlide ? 'min-h-[21.5rem] justify-center' : 'min-h-[18rem]'
            }`}
          >
            <motion.div
              key={`${item.id}-${activeSlide.label}-${activeSlide.video ?? activeSlide.image}`}
              className={`case-study-slide-frame overflow-hidden border border-white/18 bg-black/26 shadow-[0_34px_110px_rgba(0,0,0,0.38)] backdrop-blur-xl ${
                hasMobileImagePass
                  ? 'case-study-mobile-pass w-full rounded-[1.45rem]'
                  : isMobileSlide
                  ? 'case-study-slide-frame--mobile w-[min(48%,12.2rem)] max-w-[12.2rem] rounded-[1.3rem]'
                  : 'w-full rounded-[1.45rem]'
              }`}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.58, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {isMobileSlide ? null : (
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
              )}
              <div
                className={`relative overflow-hidden bg-black/30 ${
                  hasMobileImagePass ? 'h-[26.5rem]' : isMobileSlide ? 'aspect-[460/996]' : 'aspect-[16/9]'
                }`}
              >
                {hasMobileImagePass ? (
                  <div
                    className="case-study-mobile-pass-track"
                    style={{ '--case-study-mobile-pass-duration': `${Math.max(30, activeMobileImages.length * 11)}s` } as CSSProperties}
                  >
                    {[0, 1].map((sequence) => (
                      <div
                        key={`${item.id}-${activeSlide.label}-mobile-pass-${sequence}`}
                        className="case-study-mobile-pass-sequence"
                        aria-hidden={sequence === 1}
                      >
                        {activeMobileImages.map((image, imageIndex) => (
                          <div
                            key={`${item.id}-${activeSlide.label}-mobile-pass-${sequence}-${imageIndex}`}
                            className="case-study-mobile-pass-card"
                          >
                            <img
                              src={image}
                              alt={sequence === 0 ? `${item.title} ${activeSlide.label} ${imageIndex + 1}` : ''}
                              loading={imageIndex === 0 ? 'eager' : 'lazy'}
                              decoding="async"
                              className="h-full w-full object-cover"
                              draggable={false}
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : activeSlide.video && !shouldReduceMotion ? (
                  <video
                    aria-label={`${item.title} ${activeSlide.label}`}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    poster={activeSlide.image}
                    onLoadedData={(event) => {
                      void event.currentTarget.play().catch(() => undefined);
                    }}
                    className="h-full w-full object-cover"
                    style={{ objectPosition: activeSlide.position ?? '50% 50%' }}
                  >
                    <source src={activeSlide.video} type="video/webm" />
                  </video>
                ) : (
                  <img
                    src={activeSlide.image}
                    alt={`${item.title} ${activeSlide.label}`}
                    decoding="async"
                    className="h-full w-full object-cover"
                    style={{ objectPosition: activeSlide.position ?? '50% 50%' }}
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/28 via-transparent to-white/[0.035]" />
                {hasSlideNavigation ? (
                  <div className="case-study-slide-nav absolute inset-y-0 left-0 right-0 flex items-center justify-between px-3 transition duration-300">
                    <button
                      type="button"
                      aria-label={`Show previous ${item.title} image`}
                      onClick={() => shiftSlide(-1)}
                      className={`case-study-slide-nav-button flex items-center justify-center rounded-full border border-white/28 bg-black/45 leading-none text-white shadow-[0_12px_36px_rgba(0,0,0,0.34)] backdrop-blur-xl transition duration-300 hover:border-white/50 hover:bg-white hover:text-[#07101c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                        isMobileSlide ? 'h-9 w-9 text-2xl' : 'h-11 w-11 text-3xl'
                      }`}
                    >
                      <span aria-hidden="true" className="-mt-1">
                        ‹
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Show next ${item.title} image`}
                      onClick={() => shiftSlide(1)}
                      className={`case-study-slide-nav-button flex items-center justify-center rounded-full border border-white/28 bg-black/45 leading-none text-white shadow-[0_12px_36px_rgba(0,0,0,0.34)] backdrop-blur-xl transition duration-300 hover:border-white/50 hover:bg-white hover:text-[#07101c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                        isMobileSlide ? 'h-9 w-9 text-2xl' : 'h-11 w-11 text-3xl'
                      }`}
                    >
                      <span aria-hidden="true" className="-mt-1">
                        ›
                      </span>
                    </button>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </div>

          <div className="mt-7 shrink-0">
            <div className="rounded-[1.35rem] border border-white/12 bg-black/18 p-5 backdrop-blur-xl">
              <p className="text-[0.58rem] uppercase tracking-[0.18em] text-white/40">{activeSlide.label}</p>
              <p className="mt-3 text-sm leading-6 text-white/72">{activeSlide.detail}</p>
            </div>

            {hasSlideNavigation ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {slides.map((slide, index) => {
                  const isActive = index === activeIndex;
                  const isMobileThumbnail = slide.frame === 'mobile';

                  return (
                    <button
                      key={`${item.id}-${slide.label}`}
                      type="button"
                      aria-label={`Show ${slide.label}`}
                      aria-pressed={isActive}
                      onClick={() => selectSlide(index)}
                      className={`group overflow-hidden rounded-[1rem] border p-1 transition duration-300 ${
                        isActive
                          ? 'border-white/40 bg-white/[0.16]'
                          : 'border-white/10 bg-white/[0.055] hover:border-white/24 hover:bg-white/[0.11]'
                      }`}
                    >
                      <div
                        className={`relative aspect-[16/9] overflow-hidden rounded-[0.75rem] bg-black/22 ${
                          isMobileThumbnail ? 'flex items-center justify-center p-1.5' : ''
                        }`}
                      >
                        <div
                          className={
                            isMobileThumbnail
                              ? 'h-full overflow-hidden rounded-[0.55rem] border border-white/12 bg-black/36 shadow-[0_10px_28px_rgba(0,0,0,0.28)] aspect-[460/996]'
                              : 'h-full w-full'
                          }
                        >
                          <img
                            src={slide.image}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                            style={{ objectPosition: slide.position ?? '50% 50%' }}
                            onError={(event) => {
                              event.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : null}

            {sourceLinks.length ? (
              <div
                className={`case-study-source-glass-button-row mt-6 flex gap-3 ${
                  sourceLinks.length > 1 ? 'case-study-source-glass-button-row--multiple' : 'flex-wrap'
                }`}
              >
                {sourceLinks.map((link) => (
                  <GlassImprintCta
                    key={`${item.id}-${link.href}`}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    label={createProofCta(item, link).label}
                    className="case-study-source-glass-button"
                  />
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
  const demoProofCtas = getDemoProofCtas(item);
  const proofPanelCopy = getProofPanelCopy(item, demoProofCtas);
  const productQuote = productDeepDiveQuotes[item.title];
  const shouldShowMassSocialDemo = item.id === 'project-mass-social-wisdom-agent';
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
      className="portfolio-deep-dive-overlay fixed inset-0 z-[220] overflow-y-auto px-3 py-3 text-text-primary sm:px-5 sm:py-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <button
        type="button"
        aria-label="Close case study backdrop"
        className="portfolio-deep-dive-backdrop absolute inset-0 bg-bg/20 backdrop-blur-[3px]"
        onClick={onClose}
      />

      {shouldShowMassSocialDemo ? (
        <MassSocialWisdomDemo onClose={onClose} githubHref={proofCta?.href} />
      ) : (
      <motion.article className="portfolio-deep-dive-shell relative mx-auto grid min-h-[calc(100svh-1.5rem)] max-w-[1320px] gap-4 lg:h-[calc(100svh-2.5rem)] lg:min-h-0 lg:grid-cols-[0.9fr_1.1fr] lg:overflow-hidden">
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
                    screenVideoSrc={mobilePresentation.screenVideo}
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

        <div className="portfolio-deep-dive-reader-panel liquid-glass-strong flex flex-col rounded-[2rem] p-6 md:p-8 lg:min-h-0 lg:overflow-hidden">
          <div className="portfolio-deep-dive-header flex shrink-0 items-start justify-between gap-5">
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
              className="portfolio-deep-dive-inline-close card-glass-attachment is-active"
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
                <blockquote className="project-case-study-quote font-display text-[clamp(2.5rem,5vw,4.8rem)] italic leading-[0.9] tracking-[-0.045em]">
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
                    {demoProofCtas.length > 0 && isDemoProofSection(section.label) ? (
                      <div className="mt-5 rounded-[1.15rem] border border-[#89AACC]/24 bg-[#89AACC]/[0.08] p-4 md:p-5">
                        <p className="text-[0.58rem] uppercase tracking-[0.16em] text-muted">{proofPanelCopy.eyebrow}</p>
                        <p className="mt-3 text-sm leading-6 text-text-primary/78 md:text-base">{proofPanelCopy.description}</p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          {demoProofCtas.map((cta) => (
                            <GlassImprintCta
                              key={`${item.id}-${cta.href}`}
                              href={cta.href}
                              target="_blank"
                              rel="noreferrer"
                              label={cta.label}
                              className="case-study-proof-glass-button"
                            />
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </section>
                );
              })}
            </div>

          </div>
        </div>
      </motion.article>
      )}
    </motion.div>
  );
}
