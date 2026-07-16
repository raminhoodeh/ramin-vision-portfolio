import { AnimatePresence, motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { VisionLoadingScreen } from './components/VisionLoadingScreen';
import { StaticShaderGradientBackground, type PortfolioShaderVariant } from './components/StaticShaderGradientBackground';
import { AiViewportBorderGlow } from './components/AiViewportBorderGlow';
import { BottomNavigation } from './components/BottomNavigation';
import { ContentReadinessPanel } from './components/ContentReadinessPanel';
import {
  getBonusRockPreloadSnapshot,
  preloadBonusRockAssets,
  subscribeBonusRockPreload,
  type BonusRockPreloadStatus,
} from './three/bonusRockPreload';
import { preloadWorkVideos, type WorkVideoPreloadReason } from './performance/workVideoPreload';
import { normalizeSectionTarget, type SectionTarget } from './lib/text';
import { scrollToId } from './lib/scroll';
import { type CaseStudyEntry } from './sections/types';
import { Contact } from './sections/Contact';
import { Hero } from './sections/Hero';
import { AiRaminSection } from './sections/AiRamin';
import { ExperienceEducationSection } from './sections/ExperienceEducation';
import {
  BonusSection,
  clampBonusRockClicks,
} from './sections/Bonus';
import { CaseStudyGrid } from './sections/Projects/index';
import { CaseStudyOverlay } from './sections/Projects/CaseStudyOverlay';
import { ThesisDeepDive } from './sections/Projects/ThesisDeepDive';
import { caseStudyByDeepDiveSlug, projectCaseStudyEntries } from './sections/Projects/types';
import { TeachingWritingShelf } from './sections/TeachingWriting/index';
import { MetacognitionDeepDive, METACOGNITION_DEEP_DIVE_ID, METACOGNITION_SENTINEL } from './sections/TeachingWriting/MetacognitionDeepDive';
import { SectionMarker } from './components/SectionHeader';

gsap.registerPlugin(ScrollTrigger);

const THESIS_CASE_STUDY_ID = 'writeup-ai-native-product-os';
const PRODUCT_THESIS_PATH = '/product-thesis';
const METACOGNITION_PATH = '/thoughts/framework-of-metacognition';

let bonusRockClickMemory = 0;

const sectionPathByTarget: Record<SectionTarget, string> = {
  hero: '/',
  'experience-education': '/experience-education',
  projects: '/projects',
  thoughts: '/thoughts',
  contact: '/contact',
  bonus: '/bonus',
  'ai-ramin': '/ai-ramin',
};

const sectionAliases: Record<string, SectionTarget> = {
  '': 'hero',
  home: 'hero',
  hero: 'hero',
  intro: 'hero',
  work: 'experience-education',
  experience: 'experience-education',
  'experience-education': 'experience-education',
  projects: 'projects',
  thoughts: 'thoughts',
  'teaching-speaking-writing': 'thoughts',
  contact: 'contact',
  bonus: 'bonus',
  ai: 'ai-ramin',
  'ai-ramin': 'ai-ramin',
};

const projectSubsectionBySlug: Record<string, string> = {
  featured: 'projects-featured',
  product: 'projects-featured',
  products: 'projects-selfware-stack',
  selfware: 'projects-selfware-stack',
  apps: 'projects-selfware-stack',
  tools: 'projects-tools',
  systems: 'projects-tools',
  architecture: 'projects-architecture',
  thesis: 'projects-architecture',
};

const thoughtsSubsectionBySlug: Record<string, string> = {
  foundations: 'thoughts-foundations',
  clarity: 'thoughts-foundations',
  think: 'thoughts-act-method-values',
  method: 'thoughts-act-method-values',
  'method-values': 'thoughts-act-method-values',
  talks: 'thoughts-talks',
  values: 'thoughts-talks',
  passions: 'thoughts-passions',
  formation: 'thoughts-act-formation',
  books: 'thoughts-books',
  storycraft: 'thoughts-books',
  express: 'thoughts-act-formation',
  integration: 'thoughts-integration',
  courses: 'thoughts-courses',
  systems: 'thoughts-courses',
  build: 'thoughts-act-integration-proof',
  proof: 'thoughts-act-integration-proof',
  'integration-proof': 'thoughts-act-integration-proof',
  os: 'thoughts-os',
  architecture: 'thoughts-architecture-bridge',
  work: 'thoughts-work-narrative',
  'work-narrative': 'thoughts-work-narrative',
  'case-studies': 'thoughts-case-studies',
};

const legacyDomIdRoutes: Record<string, { section: SectionTarget; scrollTargetId: string; canonicalPath: string }> = {
  'projects-featured': { section: 'projects', scrollTargetId: 'projects-featured', canonicalPath: '/projects/featured' },
  'projects-selfware': { section: 'projects', scrollTargetId: 'projects-selfware-stack', canonicalPath: '/projects/selfware' },
  'projects-selfware-stack': { section: 'projects', scrollTargetId: 'projects-selfware-stack', canonicalPath: '/projects/selfware' },
  'projects-tools': { section: 'projects', scrollTargetId: 'projects-tools', canonicalPath: '/projects/tools' },
  'projects-architecture': { section: 'projects', scrollTargetId: 'projects-architecture', canonicalPath: '/projects/architecture' },
  'thoughts-foundations': { section: 'thoughts', scrollTargetId: 'thoughts-foundations', canonicalPath: '/thoughts/foundations' },
  'thoughts-act-method-values': { section: 'thoughts', scrollTargetId: 'thoughts-act-method-values', canonicalPath: '/thoughts/method-values' },
  'thoughts-talks': { section: 'thoughts', scrollTargetId: 'thoughts-talks', canonicalPath: '/thoughts/talks' },
  'thoughts-passions': { section: 'thoughts', scrollTargetId: 'thoughts-passions', canonicalPath: '/thoughts/passions' },
  'thoughts-act-formation': { section: 'thoughts', scrollTargetId: 'thoughts-act-formation', canonicalPath: '/thoughts/formation' },
  'thoughts-books': { section: 'thoughts', scrollTargetId: 'thoughts-books', canonicalPath: '/thoughts/books' },
  'thoughts-integration': { section: 'thoughts', scrollTargetId: 'thoughts-integration', canonicalPath: '/thoughts/integration' },
  'thoughts-courses': { section: 'thoughts', scrollTargetId: 'thoughts-courses', canonicalPath: '/thoughts/courses' },
  'thoughts-act-integration-proof': { section: 'thoughts', scrollTargetId: 'thoughts-act-integration-proof', canonicalPath: '/thoughts/integration-proof' },
  'thoughts-os': { section: 'thoughts', scrollTargetId: 'thoughts-os', canonicalPath: '/thoughts/os' },
  'thoughts-architecture-bridge': { section: 'thoughts', scrollTargetId: 'thoughts-architecture-bridge', canonicalPath: '/thoughts/architecture' },
  'thoughts-work-narrative': { section: 'thoughts', scrollTargetId: 'thoughts-work-narrative', canonicalPath: '/thoughts/work-narrative' },
  'thoughts-case-studies': { section: 'thoughts', scrollTargetId: 'thoughts-case-studies', canonicalPath: '/thoughts/case-studies' },
};

const projectCaseStudyBySlug = new Map(
  projectCaseStudyEntries.map((item) => [item.id.replace(/^project-/, ''), item] as const),
);

type ParsedPortfolioRoute = {
  section: SectionTarget;
  caseStudy: CaseStudyEntry | null;
  scrollTargetId: string | null;
  canonicalPath: string;
};

function normalizeRouteSegment(value: string | undefined) {
  return decodeURIComponent(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/^#\/?/, '')
    .replace(/^\/+|\/+$/g, '');
}

function getRouteSegments(pathnameOrHash: string) {
  const normalized = normalizeRouteSegment(pathnameOrHash);
  return normalized ? normalized.split('/').filter(Boolean) : [];
}

function thesisRoute(section: SectionTarget = 'hero', canonicalPath = PRODUCT_THESIS_PATH): ParsedPortfolioRoute {
  return {
    section,
    caseStudy: caseStudyByDeepDiveSlug.get('ai-native-product-os') ?? null,
    scrollTargetId: null,
    canonicalPath,
  };
}

function sectionRoute(section: SectionTarget, canonicalPath = sectionPathByTarget[section]): ParsedPortfolioRoute {
  return { section, caseStudy: null, scrollTargetId: null, canonicalPath };
}

function scrollRoute(section: SectionTarget, scrollTargetId: string, canonicalPath: string): ParsedPortfolioRoute {
  return { section, caseStudy: null, scrollTargetId, canonicalPath };
}

function caseStudyPath(item: CaseStudyEntry) {
  if (item.id === THESIS_CASE_STUDY_ID) return PRODUCT_THESIS_PATH;
  if (item.id === METACOGNITION_DEEP_DIVE_ID) return METACOGNITION_PATH;
  if (item.id.startsWith('project-')) return `/projects/${item.id.replace(/^project-/, '')}`;
  if (item.id.startsWith('writeup-')) return `/thoughts/${item.id.replace(/^writeup-/, '')}`;
  return `/case-studies/${item.id}`;
}

function parseSegmentsToRoute(segments: string[]): ParsedPortfolioRoute {
  const [firstRaw, secondRaw] = segments;
  const first = normalizeRouteSegment(firstRaw);
  const second = normalizeRouteSegment(secondRaw);

  if (!first) return sectionRoute('hero');

  const legacyDomRoute = legacyDomIdRoutes[first];
  if (legacyDomRoute) return { ...legacyDomRoute, caseStudy: null };

  if (first === 'thesis' || first === 'product-thesis' || first === 'my-product-thesis') {
    return thesisRoute();
  }

  if (first === 'projects') {
    if (!second) return sectionRoute('projects');
    if (second === 'ai-native-product-os' || second === 'product-thesis') return thesisRoute('projects');

    const subsection = projectSubsectionBySlug[second];
    if (subsection) return scrollRoute('projects', subsection, `/projects/${second}`);

    const projectCaseStudy = projectCaseStudyBySlug.get(second);
    if (projectCaseStudy) {
      return { section: 'projects', caseStudy: projectCaseStudy, scrollTargetId: null, canonicalPath: caseStudyPath(projectCaseStudy) };
    }

    const writeup = caseStudyByDeepDiveSlug.get(second);
    if (writeup) {
      return { section: 'projects', caseStudy: writeup, scrollTargetId: null, canonicalPath: caseStudyPath(writeup) };
    }

    return sectionRoute('projects');
  }

  if (first === 'thoughts') {
    if (!second) return sectionRoute('thoughts');
    if (second === 'ai-native-product-os' || second === 'product-thesis' || second === 'thesis') return thesisRoute('thoughts');
    if (second === 'framework-of-metacognition') {
      return { section: 'thoughts' as const, caseStudy: METACOGNITION_SENTINEL, scrollTargetId: null, canonicalPath: METACOGNITION_PATH };
    }

    const subsection = thoughtsSubsectionBySlug[second];
    if (subsection) return scrollRoute('thoughts', subsection, `/thoughts/${second}`);

    const writeup = caseStudyByDeepDiveSlug.get(second);
    if (writeup) {
      return { section: 'thoughts', caseStudy: writeup, scrollTargetId: null, canonicalPath: caseStudyPath(writeup) };
    }

    const projectCaseStudy = projectCaseStudyBySlug.get(second);
    if (projectCaseStudy) {
      return { section: 'projects', caseStudy: projectCaseStudy, scrollTargetId: null, canonicalPath: caseStudyPath(projectCaseStudy) };
    }

    return sectionRoute('thoughts');
  }

  const directSection = sectionAliases[first];
  if (directSection) return sectionRoute(directSection);

  const directProjectCaseStudy = projectCaseStudyBySlug.get(first);
  if (directProjectCaseStudy) {
    return { section: 'projects', caseStudy: directProjectCaseStudy, scrollTargetId: null, canonicalPath: caseStudyPath(directProjectCaseStudy) };
  }

  const directWriteup = caseStudyByDeepDiveSlug.get(first);
  if (directWriteup) {
    return { section: 'thoughts', caseStudy: directWriteup, scrollTargetId: null, canonicalPath: caseStudyPath(directWriteup) };
  }

  return sectionRoute('hero');
}

function parsePortfolioLocation(pathname: string, hash: string): ParsedPortfolioRoute {
  const hashSegments = getRouteSegments(hash);
  if (hashSegments.length > 0) return parseSegmentsToRoute(hashSegments);

  return parseSegmentsToRoute(getRouteSegments(pathname));
}

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

function ActivePortfolioSection({
  active,
  ready,
  onOpenThesis,
  onOpenCaseStudy,
  showContentReadiness,
  bonusRockPreloadStatus,
  bonusRockClicks,
  onBonusRockClick,
  onOpenMobileMenu,
}: {
  active: SectionTarget;
  ready: boolean;
  onOpenThesis: () => void;
  onOpenCaseStudy: (item: CaseStudyEntry) => void;
  showContentReadiness: boolean;
  bonusRockPreloadStatus: BonusRockPreloadStatus;
  bonusRockClicks: number;
  onBonusRockClick: () => void;
  onOpenMobileMenu: () => void;
}) {
  switch (active) {
    case 'experience-education':
      return <ExperienceEducationSection />;
    case 'projects':
      return <CaseStudyGrid onOpen={onOpenCaseStudy} />;
    case 'thoughts':
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
      return <AiRaminSection onOpenMenu={onOpenMobileMenu} />;
    case 'hero':
    default:
      return <Hero ready={ready} onOpenThesis={onOpenThesis} />;
  }
}

function PortfolioPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(
    () => !(import.meta.env.DEV && new URLSearchParams(window.location.search).has('noIntro')),
  );
  const [liveBackgroundReady, setLiveBackgroundReady] = useState(false);
  const [bonusRockPreloadStatus, setBonusRockPreloadStatus] = useState<BonusRockPreloadStatus>(
    () => getBonusRockPreloadSnapshot().status,
  );
  const [bonusRockClicks, setBonusRockClicks] = useState(() => bonusRockClickMemory);
  const [activeSection, setActiveSection] = useState<SectionTarget>(() =>
    typeof window === 'undefined' ? 'hero' : parsePortfolioLocation(window.location.pathname, window.location.hash).section,
  );
  const [activeCaseStudy, setActiveCaseStudy] = useState<CaseStudyEntry | null>(() =>
    typeof window === 'undefined' ? null : parsePortfolioLocation(window.location.pathname, window.location.hash).caseStudy,
  );
  const [routeScrollTargetId, setRouteScrollTargetId] = useState<string | null>(() =>
    typeof window === 'undefined'
      ? null
      : parsePortfolioLocation(window.location.pathname, window.location.hash).scrollTargetId,
  );
  const [caseStudyReturnSection, setCaseStudyReturnSection] = useState<SectionTarget>(() =>
    typeof window === 'undefined' ? 'hero' : parsePortfolioLocation(window.location.pathname, window.location.hash).section,
  );
  const thesisCaseStudy = caseStudyByDeepDiveSlug.get('ai-native-product-os');
  const showContentReadiness = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.has('intake') || searchParams.has('stage12-content-intake');
  }, [location.search]);
  const showPerformanceBaseline = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return import.meta.env.DEV && searchParams.has('perf');
  }, [location.search]);
  const mobileMenuOpenRef = useRef<(() => void) | null>(null);
  const openMobileMenu = useCallback(() => { mobileMenuOpenRef.current?.(); }, []);
  const isProjectsSection = activeSection === 'projects';
  const isThoughtsSection = activeSection === 'thoughts';
  const isAiRaminSection = activeSection === 'ai-ramin';
  const isContactSection = activeSection === 'contact';
  const isFullBleedSection = isProjectsSection || isThoughtsSection;
  const hasActiveDeepDive = activeCaseStudy !== null;
  const usesProjectsBackdrop = isProjectsSection;
  const shaderVariant: PortfolioShaderVariant = usesProjectsBackdrop
    ? 'projects'
    : activeSection === 'bonus'
      ? 'bonus'
      : 'default';
  const liveShaderVariant = shaderVariant;
  const shouldUseLiveBackground = liveBackgroundReady && !hasActiveDeepDive;

  useEffect(() => {
    const handleInternalLinkClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target instanceof Element ? event.target : null;
      const anchor = target?.closest<HTMLAnchorElement>('a[href]');
      if (!anchor || (anchor.target && anchor.target !== '_self') || anchor.hasAttribute('download')) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) return;

      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname.startsWith('/api/')) return;

      event.preventDefault();
      navigate({ pathname: url.pathname, search: url.search || location.search, hash: url.hash });
    };

    document.addEventListener('click', handleInternalLinkClick);
    return () => document.removeEventListener('click', handleInternalLinkClick);
  }, [location.search, navigate]);

  const requestBonusRockPreload = useCallback((reason: 'idle' | 'intent' | 'navigate' = 'intent') => {
    void preloadBonusRockAssets(reason);
  }, []);

  const requestWorkVideoPreload = useCallback((reason: WorkVideoPreloadReason = 'intent') => {
    preloadWorkVideos(reason);
  }, []);

  const handleBonusRockClick = useCallback(() => {
    setBonusRockClicks((current) => {
      const nextClickCount = clampBonusRockClicks(current + 1);
      bonusRockClickMemory = nextClickCount;
      return nextClickCount;
    });
  }, []);

  const resetViewportScroll = useCallback((behavior: ScrollBehavior = 'auto') => {
    window.scrollTo({ top: 0, left: 0, behavior });
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('.portfolio-stage')?.scrollTo({ top: 0, left: 0, behavior });
    });
  }, []);

  const navigateToPath = useCallback(
    (pathname: string, options: { replace?: boolean } = {}) => {
      navigate({ pathname, search: location.search, hash: '' }, { replace: options.replace });
    },
    [location.search, navigate],
  );

  const handleSectionNavigate = useCallback(
    (target: SectionTarget) => {
      setActiveSection(target);
      setActiveCaseStudy(null);
      setRouteScrollTargetId(null);
      setCaseStudyReturnSection(target);
      navigateToPath(sectionPathByTarget[target]);
      resetViewportScroll('smooth');
    },
    [navigateToPath, resetViewportScroll],
  );

  const handleBottomNavigation = useCallback(
    (target: string) => {
      if (target === 'experience-education') {
        requestWorkVideoPreload('navigate');
      }

      if (target === 'bonus') {
        requestBonusRockPreload('navigate');
      }

      handleSectionNavigate(normalizeSectionTarget(target));
    },
    [handleSectionNavigate, requestBonusRockPreload, requestWorkVideoPreload],
  );

  const handleBottomNavigationIntent = useCallback(
    (target: string) => {
      if (target === 'experience-education') requestWorkVideoPreload('intent');
      if (target === 'bonus') requestBonusRockPreload('intent');
    },
    [requestBonusRockPreload, requestWorkVideoPreload],
  );

  useEffect(() => {
    const route = parsePortfolioLocation(location.pathname, location.hash);
    const shouldCanonicalize = Boolean(location.hash) || location.pathname !== route.canonicalPath;

    if (shouldCanonicalize) {
      navigate({ pathname: route.canonicalPath, search: location.search, hash: '' }, { replace: true });
      return;
    }

    setActiveSection(route.caseStudy ? caseStudyReturnSection : route.section);
    setActiveCaseStudy(route.caseStudy);
    setRouteScrollTargetId(route.scrollTargetId);
    if (!route.caseStudy) setCaseStudyReturnSection(route.section);

    if (route.section === 'experience-education') requestWorkVideoPreload('navigate');
    if (route.section === 'bonus') requestBonusRockPreload('navigate');
  }, [
    caseStudyReturnSection,
    location.hash,
    location.pathname,
    location.search,
    navigate,
    requestBonusRockPreload,
    requestWorkVideoPreload,
  ]);

  const handleOpenThesis = useCallback(() => {
    if (!thesisCaseStudy) return;
    setCaseStudyReturnSection(activeSection);
    navigateToPath(PRODUCT_THESIS_PATH);
  }, [activeSection, navigateToPath, thesisCaseStudy]);

  const handleOpenCaseStudy = useCallback(
    (item: CaseStudyEntry) => {
      setCaseStudyReturnSection(activeSection);
      navigateToPath(caseStudyPath(item));
    },
    [activeSection, navigateToPath],
  );

  const handleCloseCaseStudy = useCallback(() => {
    setActiveCaseStudy(null);
    navigateToPath(sectionPathByTarget[caseStudyReturnSection]);
  }, [caseStudyReturnSection, navigateToPath]);

  useEffect(() => {
    if (!isLoading) {
      resetViewportScroll('auto');
      window.setTimeout(() => ScrollTrigger.refresh(), 100);
    }
  }, [activeSection, isLoading, resetViewportScroll]);

  useEffect(() => {
    if (isLoading || !routeScrollTargetId || activeCaseStudy) return undefined;

    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        scrollToId(routeScrollTargetId);
        window.setTimeout(() => ScrollTrigger.refresh(), 100);
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeCaseStudy, activeSection, isLoading, routeScrollTargetId]);

  useEffect(() => {
    if (isLoading || activeCaseStudy || routeScrollTargetId || activeSection !== 'thoughts') return undefined;
    if (!window.matchMedia('(max-width: 767px)').matches) return undefined;

    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const thoughtsStage = document.querySelector<HTMLElement>('.portfolio-stage.is-thoughts-stage');
        thoughtsStage?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeCaseStudy, activeSection, isLoading, routeScrollTargetId]);

  useEffect(
    () =>
      subscribeBonusRockPreload((snapshot) => {
        setBonusRockPreloadStatus(snapshot.status);
      }),
    [],
  );

  useEffect(() => {
    if (isLoading) return undefined;

    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    const warmBonusRock = () => requestBonusRockPreload('idle');
    const warmWorkVideos = () => requestWorkVideoPreload('idle');

    if (idleWindow.requestIdleCallback) {
      const workIdleId = idleWindow.requestIdleCallback(warmWorkVideos, { timeout: 1800 });
      const bonusIdleId = idleWindow.requestIdleCallback(warmBonusRock, { timeout: 3200 });
      return () => {
        idleWindow.cancelIdleCallback?.(workIdleId);
        idleWindow.cancelIdleCallback?.(bonusIdleId);
      };
    }

    const workTimer = window.setTimeout(warmWorkVideos, 900);
    const bonusTimer = window.setTimeout(warmBonusRock, 1700);
    return () => {
      window.clearTimeout(workTimer);
      window.clearTimeout(bonusTimer);
    };
  }, [isLoading, requestBonusRockPreload, requestWorkVideoPreload]);

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
      data-deep-dive-active={hasActiveDeepDive ? 'true' : 'false'}
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
      <div
        className={`fixed inset-0 z-10 overflow-hidden ${isFullBleedSection || isAiRaminSection ? 'p-0' : 'p-3 sm:p-5 lg:p-4'}`}
        data-portfolio-underlay
        aria-hidden={hasActiveDeepDive ? true : undefined}
      >
        {/* AI Ramin renders its section label inside its own layout. */}
        {isAiRaminSection ? null : <SectionMarker section={activeSection} />}
          <div
            className={`portfolio-frame relative mx-auto flex h-full w-full lg:w-full ${
              isFullBleedSection ? (isProjectsSection ? 'is-projects-frame' : 'is-thoughts-frame') : 'lg:max-w-[1426px]'
            } ${
              isAiRaminSection ? 'is-ai-ramin-frame' : ''
            } ${
              isContactSection ? 'is-contact-frame' : ''
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
            } ${
              isContactSection ? 'is-contact-stage' : ''
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
                    onOpenThesis={handleOpenThesis}
                    onOpenCaseStudy={handleOpenCaseStudy}
                    showContentReadiness={showContentReadiness}
                    bonusRockPreloadStatus={bonusRockPreloadStatus}
                    bonusRockClicks={bonusRockClicks}
                    onBonusRockClick={handleBonusRockClick}
                    onOpenMobileMenu={openMobileMenu}
                  />
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {activeCaseStudy ? (
          activeCaseStudy.id === THESIS_CASE_STUDY_ID ? (
            <ThesisDeepDive key="thesis-deep-dive" onClose={handleCloseCaseStudy} />
          ) : activeCaseStudy.id === METACOGNITION_DEEP_DIVE_ID ? (
            <MetacognitionDeepDive key="metacognition-deep-dive" onClose={handleCloseCaseStudy} />
          ) : (
            <CaseStudyOverlay
              key={activeCaseStudy.id}
              item={activeCaseStudy}
              onClose={handleCloseCaseStudy}
            />
          )
        ) : null}
      </AnimatePresence>
      <BottomNavigation
        active={activeSection}
        currentSection={activeSection}
        onNavigate={handleBottomNavigation}
        onNavIntent={handleBottomNavigationIntent}
        onRegisterMenuOpen={(fn) => { mobileMenuOpenRef.current = fn; }}
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
  return (
    <Routes>
      <Route path="*" element={<PortfolioPage />} />
    </Routes>
  );
}
