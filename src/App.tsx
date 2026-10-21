import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { StaticShaderGradientBackground, type PortfolioShaderVariant } from './components/StaticShaderGradientBackground';
import { AiViewportBorderGlow } from './components/AiViewportBorderGlow';
import { BottomNavigation } from './components/BottomNavigation';
import {
  getBonusRockPreloadSnapshot,
  preloadBonusRockAssets,
  subscribeBonusRockPreload,
  type BonusRockPreloadStatus,
} from './three/bonusRockPreload';
import { BONUS_ROCK_FINAL_CLICK_COUNT } from './three/hashgraphRockMotion';
import { RouteLoadBoundary } from './performance/RouteLoadBoundary';
import { deferredComponent } from './performance/deferredComponent';
import { canSpeculativelyLoad, getLoadingPreferences } from './performance/loadingPolicy';
import {
  THESIS_CASE_STUDY_ID, METACOGNITION_DEEP_DIVE_ID, METACOGNITION_SENTINEL,
  thesisReference, projectCaseStudyBySlug, caseStudyByDeepDiveSlug,
} from './performance/readerRouteReferences';
import { normalizeSectionTarget, type SectionTarget } from './lib/text';
import { preferredScrollBehavior, scrollToId } from './lib/scroll';
import { focusRouteContent, hasOpenDialog } from './lib/dialogFocus';
import { type CaseStudyEntry } from './sections/types';
import { Hero } from './sections/Hero';
import { HomeHighlights, HomeRecognition } from './sections/HomeHighlights';
import { ProductMethodSummary } from './sections/ProductMethodSummary';
import { SectionMarker } from './components/SectionHeader';
import { isKnownPortfolioPath } from './seo/routes.mjs';
import { useRouteMetadata } from './seo/useRouteMetadata';
import { PortfolioAppReady } from './seo/PortfolioAppReady';
import { NotFoundPage } from './seo/NotFoundPage';
import { recordJourneyPage } from './lib/visitorJourney';
import './sections/portfolioDocuments.css';
import './performance/loading.css';
import './styles/planReview.css';

const contactSection = deferredComponent(() => import('./sections/Contact').then((m) => ({ default: m.Contact })));
const { Component: Contact } = contactSection;
const workSection = deferredComponent(() => import('./sections/ExperienceEducation').then((m) => ({ default: m.ExperienceEducationSection })));
const projectsSection = deferredComponent(() => import('./sections/Projects/index').then((m) => ({ default: m.CaseStudyGrid })));
const thoughtsSection = deferredComponent(() => import('./sections/TeachingWriting/index').then((m) => ({ default: m.TeachingWritingShelf })));
const aiSection = deferredComponent(() => import('./sections/AiRamin').then((m) => ({ default: m.AiRaminSection })));
const bonusSection = deferredComponent(() => import('./sections/Bonus').then((m) => ({ default: m.BonusSection })));
const { Component: ExperienceEducationSection } = workSection;
const { Component: CaseStudyGrid } = projectsSection;
const { Component: TeachingWritingShelf } = thoughtsSection;
const { Component: AiRaminSection } = aiSection;
const { Component: BonusSection } = bonusSection;
const { Component: ProfessionalStories } = deferredComponent(() => import('./sections/ProfessionalStories').then((m) => ({ default: m.ProfessionalStories })));
const resourcesSection = deferredComponent(() => import('./sections/Resources').then((m) => ({ default: m.Resources })));
const aboutSection = deferredComponent(() => import('./sections/TeachingWriting/AboutWritingPage').then((m) => ({ default: m.AboutWritingPage })));
const { Component: Resources } = resourcesSection;
const { Component: AboutWritingPage } = aboutSection;
const { Component: DisxTalkPage } = deferredComponent(() => import('./sections/DisxTalkPage').then((m) => ({ default: m.DisxTalkPage })));
const { Component: ThesisDeepDive } = deferredComponent(() => import('./sections/Projects/ThesisDeepDive').then((m) => ({ default: m.ThesisDeepDive })));
const { Component: MetacognitionDeepDive } = deferredComponent(() => import('./sections/TeachingWriting/MetacognitionDeepDive').then((m) => ({ default: m.MetacognitionDeepDive })));
const { Component: CaseStudyReader } = deferredComponent(() => import('./performance/ResolvedCaseStudyReader').then((m) => ({ default: m.ResolvedCaseStudyReader })));
const { Component: VisionLoadingScreen } = deferredComponent(() => import('./components/VisionLoadingScreen').then((m) => ({ default: m.VisionLoadingScreen })));
const { Component: ContentReadinessPanel } = deferredComponent(() => import('./components/ContentReadinessPanel').then((m) => ({ default: m.ContentReadinessPanel })));

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
  talks: 'thoughts-disx',
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

type ParsedPortfolioRoute = {
  section: SectionTarget;
  caseStudy: CaseStudyEntry | null;
  scrollTargetId: string | null;
  canonicalPath: string;
  documentPage?: 'side' | 'vivup' | 'disx' | 'method' | 'about' | 'resources';
};

function normalizeRouteSegment(value: string | undefined) {
  let decoded = value ?? '';
  try { decoded = decodeURIComponent(decoded); } catch { /* Leave malformed paths for the 404 route. */ }
  return decoded
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
    caseStudy: thesisReference,
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

  if (first === 'case-studies') {
    if (second === THESIS_CASE_STUDY_ID) return thesisRoute();
    if (second === METACOGNITION_DEEP_DIVE_ID) return { section: 'thoughts', caseStudy: METACOGNITION_SENTINEL, scrollTargetId: null, canonicalPath: METACOGNITION_PATH };
    const project = projectCaseStudyBySlug.get(second.replace(/^project-|^writeup-/, ''));
    const writeup = caseStudyByDeepDiveSlug.get(second.replace(/^writeup-/, ''));
    const item = second.startsWith('writeup-') ? writeup ?? project : project ?? writeup;
    if (item) return { section: item.id.startsWith('project-') ? 'projects' : 'thoughts', caseStudy: item, scrollTargetId: null, canonicalPath: caseStudyPath(item) };
  }

  if (first === 'work' && (second === 'side' || second === 'vivup')) {
    return { ...sectionRoute('experience-education', `/work/${second}`), documentPage: second };
  }

  if ((first === 'talks' && second === 'disx-dubai') || first === 'disx') {
    return { ...sectionRoute('thoughts', '/talks/disx-dubai'), documentPage: 'disx' };
  }

  if (first === 'product-method' || first === 'method') {
    return { ...sectionRoute('thoughts', '/product-method'), documentPage: 'method' };
  }
  if (first === 'about') return { ...sectionRoute('thoughts', '/about'), documentPage: 'about' };
  if (first === 'resources') return { ...sectionRoute('bonus', '/resources'), documentPage: 'resources' };
  if (first === 'thoughts' && second === 'books') return { ...scrollRoute('thoughts', 'thoughts-books', '/thoughts/books'), documentPage: 'about' };

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

function isLegacyHashRoute(hash: string) {
  const [first] = getRouteSegments(hash);
  return hash.startsWith('#/') || Boolean(legacyDomIdRoutes[first] || sectionAliases[first]);
}

function parsePortfolioLocation(pathname: string, hash: string): ParsedPortfolioRoute {
  const hashSegments = getRouteSegments(hash);
  if (hashSegments.length > 0 && isLegacyHashRoute(hash)) return parseSegmentsToRoute(hashSegments);

  return parseSegmentsToRoute(getRouteSegments(pathname));
}

type ReaderReturnLocation = { pathname: string; search: string; hash: string };
type ReaderReturnSnapshot = {
  location: ReaderReturnLocation;
  route: ParsedPortfolioRoute;
  opener: HTMLElement | null;
  scroll: { element: HTMLElement; top: number; left: number }[];
  windowScroll: { top: number; left: number };
  pending: boolean;
};

function captureReaderReturn(location: ReaderReturnLocation, route: ParsedPortfolioRoute, opener?: HTMLElement | null): ReaderReturnSnapshot {
  const stage = document.querySelector<HTMLElement>('.portfolio-stage');
  const elements = stage ? [stage, ...stage.querySelectorAll<HTMLElement>('*')].filter((element) => element === stage || element.scrollTop || element.scrollLeft) : [];
  return {
    location: { pathname: location.pathname, search: location.search, hash: location.hash },
    route,
    opener: opener ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null),
    scroll: elements.map((element) => ({ element, top: element.scrollTop, left: element.scrollLeft })),
    windowScroll: { top: window.scrollY, left: window.scrollX },
    pending: true,
  };
}

function isReaderReturn(snapshot: ReaderReturnSnapshot | null, location: ReaderReturnLocation) {
  return Boolean(snapshot && snapshot.location.pathname === location.pathname && snapshot.location.search === location.search && snapshot.location.hash === location.hash);
}

function readerBackgroundRoute(route: ParsedPortfolioRoute, snapshot: ReaderReturnSnapshot | null) {
  return route.caseStudy && snapshot ? snapshot.route : route;
}

function restoreReaderReturn(snapshot: ReaderReturnSnapshot, main: HTMLElement | null) {
  window.scrollTo({ ...snapshot.windowScroll, behavior: 'auto' });
  for (const { element, top, left } of snapshot.scroll) {
    if (element.isConnected) element.scrollTo({ top, left, behavior: 'auto' });
  }
  const opener = snapshot.opener;
  const available = (element: HTMLElement) => element.isConnected && !element.closest('[inert], [hidden], [aria-hidden="true"]') &&
    element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden' && !element.matches(':disabled');
  const current = document.activeElement;
  // A visitor who has already focused another control after closing wins.
  const keepCurrentFocus = current instanceof HTMLElement && current !== document.body && current !== document.documentElement &&
    current !== main && current !== opener && !current.closest('.portfolio-reader-layer') && available(current);
  if (!keepCurrentFocus) {
    if (opener && available(opener) && opener.matches('a[href], button, input, select, textarea, summary, [tabindex], [contenteditable="true"]')) {
      const bounds = opener.getBoundingClientRect();
      const stageBounds = document.querySelector<HTMLElement>('.portfolio-stage')?.getBoundingClientRect();
      const visibleTop = Math.max(0, stageBounds?.top ?? 0);
      const visibleBottom = Math.min(window.innerHeight, stageBounds?.bottom ?? window.innerHeight);
      if (bounds.bottom <= visibleTop || bounds.top >= visibleBottom || bounds.right <= 0 || bounds.left >= window.innerWidth) {
        opener.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' });
      }
      opener.focus({ preventScroll: true });
    } else focusRouteContent(main);
  }
  snapshot.pending = false;
}

function scheduleReaderReturn(snapshot: ReaderReturnSnapshot, main: HTMLElement | null) {
  let frame: number | null = null;
  let cancelled = false;
  let attempts = 0;
  const restore = () => {
    if (cancelled) return;
    // Reader exit animations and dialog isolation must finish before focusing
    // the underlay. Cancellation on navigation prevents a stale restoration.
    if (hasOpenDialog()) {
      if (++attempts < 120) frame = window.requestAnimationFrame(restore);
      return;
    }
    restoreReaderReturn(snapshot, main);
    window.dispatchEvent(new Event('resize'));
  };
  frame = window.requestAnimationFrame(restore);
  return () => {
    cancelled = true;
    if (frame !== null) window.cancelAnimationFrame(frame);
  };
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

function RouteContentReady({ onReady }: { onReady: () => void }) {
  useLayoutEffect(onReady, [onReady]);
  return <PortfolioAppReady />;
}

function RoutePending({ reader = false, onClose }: { reader?: boolean; onClose?: () => void }) {
  return <section className={reader ? 'portfolio-reader-pending' : 'portfolio-route-pending'} aria-label="Loading selected content">
    <p role="status">Opening selected content…</p>
    {onClose ? <button type="button" onClick={onClose}>Return to the portfolio</button> : null}
  </section>;
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
  onOpenMobileMenu,
  documentPage,
  notFound,
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
  documentPage?: ParsedPortfolioRoute['documentPage'];
  notFound: boolean;
}) {
  if (notFound) return <NotFoundPage />;
  if (documentPage === 'side' || documentPage === 'vivup') {
    return <ProfessionalStories activeSlug={documentPage} />;
  }
  if (documentPage === 'disx') return <DisxTalkPage onOpenThesis={onOpenThesis} />;
  if (documentPage === 'about') return <AboutWritingPage />;
  if (documentPage === 'resources') return <Resources />;
  if (documentPage === 'method') {
    return <section className="portfolio-document-page"><ProductMethodSummary /></section>;
  }
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
          {showContentReadiness ? <Suspense fallback={null}><ContentReadinessPanel /></Suspense> : null}
        </>
      );
    case 'ai-ramin':
      return <AiRaminSection onOpenMenu={onOpenMobileMenu} />;
    case 'hero':
    default:
      return (
        <div className="portfolio-home">
          <Hero ready={ready} onOpenThesis={onOpenThesis} />
          <HomeHighlights />
          <ProductMethodSummary compact />
          <HomeRecognition />
        </div>
      );
  }
}

function PortfolioPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const requestedRoute = useMemo(() => parsePortfolioLocation(location.pathname, location.hash), [location.pathname, location.hash]);
  const notFound = !isKnownPortfolioPath(location.pathname) && !isLegacyHashRoute(location.hash);
  const readerReturnRef = useRef<ReaderReturnSnapshot | null>(null);
  const lastReaderOpenerRef = useRef<HTMLElement | null>(null);
  // A reader is an overlay on the existing page. Keeping this document and its
  // React key stable preserves disclosures, local state and the real opener.
  const backgroundRoute = readerBackgroundRoute(requestedRoute, readerReturnRef.current);
  const documentPage = backgroundRoute.documentPage;
  useRouteMetadata(location.pathname);
  // The visual intro is an explicit replay, never a prerequisite to reading.
  const [isLoading, setIsLoading] = useState(() => new URLSearchParams(window.location.search).get('intro') === '1' && !getLoadingPreferences().reducedMotion);
  const completeIntro = useCallback(() => setIsLoading(false), []);
  const [loadingPreferences, setLoadingPreferences] = useState(getLoadingPreferences);
  const [resolvedContentKey, setResolvedContentKey] = useState('');
  const routeKey = `${location.pathname}${location.hash}`;
  const mainRef = useRef<HTMLElement>(null);
  const completedRouteRef = useRef<{ key: string; reader: boolean } | null>(null);
  const requestedReader = !notFound && requestedRoute.caseStudy !== null;

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
  const thesisCaseStudy = thesisReference;
  const contentMatchesRoute = notFound || (requestedReader
    ? activeCaseStudy?.id === requestedRoute.caseStudy?.id
    : activeCaseStudy === null && activeSection === requestedRoute.section);

  const showContentReadiness = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.has('intake') || searchParams.has('stage12-content-intake');
  }, [location.search]);
  const showPerformanceBaseline = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return import.meta.env.DEV && searchParams.has('perf');
  }, [location.search]);
  const mobileMenuOpenRef = useRef<(() => void) | null>(null);
  const rememberReaderReturn = useCallback((opener?: HTMLElement | null) => {
    if (requestedReader) return;
    readerReturnRef.current = captureReaderReturn(location, requestedRoute, opener ?? lastReaderOpenerRef.current);
    setCaseStudyReturnSection(requestedRoute.section);
  }, [location, requestedReader, requestedRoute]);
  const openMobileMenu = useCallback(() => { mobileMenuOpenRef.current?.(); }, []);
  const isProjectsSection = activeSection === 'projects';
  const isThoughtsSection = activeSection === 'thoughts';
  const isAiRaminSection = activeSection === 'ai-ramin';
  const isContactSection = activeSection === 'contact';
  const isFullBleedSection = isProjectsSection || (isThoughtsSection && !documentPage);
  const hasActiveDeepDive = activeCaseStudy !== null;
  const usesProjectsBackdrop = isProjectsSection;
  const shaderVariant: PortfolioShaderVariant = usesProjectsBackdrop
    ? 'projects'
    : activeSection === 'bonus' && documentPage !== 'resources'
      ? 'bonus'
      : 'default';
  const liveShaderVariant = shaderVariant;
  const shouldUseLiveBackground = liveBackgroundReady && !hasActiveDeepDive && canSpeculativelyLoad(loadingPreferences);

  const handleRouteReady = useCallback(() => {
    const previous = completedRouteRef.current;
    if (previous?.key === routeKey) return;
    completedRouteRef.current = { key: routeKey, reader: requestedReader };
    setResolvedContentKey(routeKey);
    recordJourneyPage(notFound ? location.pathname : requestedRoute.canonicalPath);
    // Dialogs manage their own focus and restoration. Initial entry leaves the
    // browser's reading position alone; ordinary route changes focus main.
    if (previous && !previous.reader && !requestedReader && !location.hash &&
      !(readerReturnRef.current?.pending && isReaderReturn(readerReturnRef.current, location)) && !hasOpenDialog()) {
      focusRouteContent(mainRef.current);
    }
  }, [location.hash, location.pathname, location.search, notFound, requestedReader, requestedRoute.canonicalPath, routeKey]);

  useEffect(() => {
    const update = () => setLoadingPreferences(getLoadingPreferences());
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: EventTarget }).connection;
    media.addEventListener('change', update);
    connection?.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      media.removeEventListener('change', update);
      connection?.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  useEffect(() => {
    const rememberClickedOpener = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const opener = target?.closest<HTMLElement>('a[href], button, [role="button"]');
      if (!opener?.closest('[data-portfolio-underlay]')) return;
      lastReaderOpenerRef.current = opener;
      queueMicrotask(() => { if (lastReaderOpenerRef.current === opener) lastReaderOpenerRef.current = null; });
    };
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
      // These routes are HTTP redirects to public documents, rather than SPA sections.
      if (/^\/(cv|presentation)\/?$/.test(url.pathname)) return;

      if (parsePortfolioLocation(url.pathname, url.hash).caseStudy && !parsePortfolioLocation(window.location.pathname, window.location.hash).caseStudy) {
        rememberReaderReturn(anchor);
      }

      event.preventDefault();
      navigate({ pathname: url.pathname, search: url.search || location.search, hash: url.hash });
    };

    document.addEventListener('click', rememberClickedOpener, true);
    document.addEventListener('click', handleInternalLinkClick);
    return () => {
      document.removeEventListener('click', rememberClickedOpener, true);
      document.removeEventListener('click', handleInternalLinkClick);
    };
  }, [location.search, navigate, rememberReaderReturn]);

  const requestBonusRockPreload = useCallback((reason: 'idle' | 'intent' | 'navigate' = 'intent') => {
    void preloadBonusRockAssets(reason);
  }, []);

  const handleBonusRockClick = useCallback(() => {
    setBonusRockClicks((current) => {
      const nextClickCount = Math.max(0, Math.min(BONUS_ROCK_FINAL_CLICK_COUNT, Math.floor(current + 1)));
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
      resetViewportScroll(preferredScrollBehavior());
    },
    [navigateToPath, resetViewportScroll],
  );

  const handleBottomNavigation = useCallback(
    (target: string) => {
      if (target === 'about' || target === 'resources') {
        navigateToPath(`/${target}`);
        resetViewportScroll(preferredScrollBehavior());
        return;
      }
      if (target === 'bonus') {
        requestBonusRockPreload('navigate');
      }

      handleSectionNavigate(normalizeSectionTarget(target));
    },
    [handleSectionNavigate, navigateToPath, requestBonusRockPreload, resetViewportScroll],
  );

  const handleBottomNavigationIntent = useCallback(
    (target: string) => {
      if (!canSpeculativelyLoad()) return;
      if (target === 'about' || target === 'resources') {
        void (target === 'about' ? aboutSection : resourcesSection).preload().catch(() => {});
        return;
      }
      const section = normalizeSectionTarget(target);
      const deferred = {
        'experience-education': workSection, projects: projectsSection,
        thoughts: thoughtsSection, 'ai-ramin': aiSection, bonus: bonusSection, contact: contactSection,
      }[section as 'experience-education' | 'projects' | 'thoughts' | 'ai-ramin' | 'bonus' | 'contact'];
      void deferred?.preload().catch(() => { /* Explicit navigation can retry a failed speculative request. */ });
      if (section === 'bonus') requestBonusRockPreload('intent');
    },
    [requestBonusRockPreload],
  );

  useEffect(() => {
    if (notFound) {
      setActiveCaseStudy(null);
      return;
    }
    const route = requestedRoute;
    const legacyHash = Boolean(location.hash) && isLegacyHashRoute(location.hash);
    const shouldCanonicalize = legacyHash || location.pathname !== route.canonicalPath;

    if (shouldCanonicalize) {
      navigate({ pathname: route.canonicalPath, search: location.search, hash: legacyHash ? '' : location.hash }, { replace: true });
      return;
    }

    setActiveSection(route.caseStudy ? readerReturnRef.current?.route.section ?? caseStudyReturnSection : route.section);
    setActiveCaseStudy(route.caseStudy);
    setRouteScrollTargetId(route.scrollTargetId);
    if (route.caseStudy && readerReturnRef.current) {
      const previousReturn = readerReturnRef.current;
      // Forward can reopen a reader after the visitor has moved farther down
      // its origin page. Capture that current position on each new opening.
      readerReturnRef.current = previousReturn.pending ? previousReturn : captureReaderReturn(previousReturn.location, previousReturn.route, previousReturn.opener);
    }
    if (!route.caseStudy) {
      setCaseStudyReturnSection(route.section);
      if (!isReaderReturn(readerReturnRef.current, location)) readerReturnRef.current = null;
    }

    if (route.section === 'bonus' && route.documentPage !== 'resources') requestBonusRockPreload('navigate');
  }, [
    caseStudyReturnSection,
    location.hash,
    location.pathname,
    location.search,
    navigate,
    requestBonusRockPreload,
    requestedRoute,
    notFound,
  ]);

  const handleOpenThesis = useCallback(() => {
    if (!thesisCaseStudy) return;
    rememberReaderReturn();
    navigateToPath(PRODUCT_THESIS_PATH);
  }, [navigateToPath, rememberReaderReturn, thesisCaseStudy]);

  const handleOpenCaseStudy = useCallback(
    (item: CaseStudyEntry) => {
      rememberReaderReturn();
      navigateToPath(caseStudyPath(item));
    },
    [navigateToPath, rememberReaderReturn],
  );

  const handleCloseCaseStudy = useCallback(() => {
    const returnLocation = readerReturnRef.current?.location;
    if (returnLocation) navigate(returnLocation);
    else navigateToPath(sectionPathByTarget[caseStudyReturnSection]);
  }, [caseStudyReturnSection, navigate, navigateToPath]);

  useEffect(() => {
    if (isLoading || resolvedContentKey !== routeKey || activeCaseStudy) return;
    const readerReturn = readerReturnRef.current;
    if (readerReturn?.pending && isReaderReturn(readerReturn, location)) return scheduleReaderReturn(readerReturn, mainRef.current);
    if (!routeScrollTargetId && !location.hash) resetViewportScroll('auto');
    if (routeScrollTargetId) scrollToId(routeScrollTargetId);
    if (location.hash && !isLegacyHashRoute(location.hash)) {
      let id = location.hash.slice(1);
      try { id = decodeURIComponent(id); } catch { /* A malformed fragment has no target. */ }
      document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'auto' });
    }
    // ScrollTrigger is owned by the sections that use it. Refresh an already
    // registered plugin without making it part of the initial route graph.
    const frame = window.requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
    return () => window.cancelAnimationFrame(frame);
  }, [activeCaseStudy, isLoading, location.hash, location.pathname, location.search, resetViewportScroll, resolvedContentKey, routeKey, routeScrollTargetId]);

  useEffect(
    () =>
      subscribeBonusRockPreload((snapshot) => {
        setBonusRockPreloadStatus(snapshot.status);
      }),
    [],
  );

  useEffect(() => {
    if (isLoading || !resolvedContentKey || !canSpeculativelyLoad(loadingPreferences)) {
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
  }, [isLoading, loadingPreferences, resolvedContentKey]);

  return (
    <motion.div
      className="h-dvh min-h-dvh overflow-hidden bg-transparent text-text-primary"
      data-bonus-rock-preload-status={bonusRockPreloadStatus}
      data-deep-dive-active={hasActiveDeepDive ? 'true' : 'false'}
      initial={false}
    >
      <AnimatePresence mode="wait">
        {isLoading ? <RouteLoadBoundary routeKey="intro" optional><Suspense fallback={null}><VisionLoadingScreen key="loading" onComplete={completeIntro} /></Suspense></RouteLoadBoundary> : null}
      </AnimatePresence>
      <a className="portfolio-skip-link" href="#portfolio-main" onClick={(event) => { event.preventDefault(); focusRouteContent(mainRef.current); }}>Skip to content</a>
      <StaticShaderGradientBackground variant={shaderVariant} />
      {shouldUseLiveBackground ? (
        <RouteLoadBoundary routeKey="live-background" optional><Suspense fallback={null}>
          <LiveShaderGradientBackground variant={liveShaderVariant} />
        </Suspense></RouteLoadBoundary>
      ) : null}
      <div
        className={`fixed inset-0 z-10 overflow-hidden ${isFullBleedSection || isAiRaminSection ? 'p-0' : 'p-3 sm:p-5 lg:p-4'}`}
        data-portfolio-underlay
        aria-hidden={hasActiveDeepDive ? true : undefined}
      >
        {/* AI Ramin renders its section label inside its own layout. */}
        {isAiRaminSection ? null : <SectionMarker section={documentPage === 'about' || documentPage === 'resources' ? documentPage : activeSection} />}
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
            <main id="portfolio-main" ref={mainRef} tabIndex={-1} data-route-focus className="relative z-10 h-full">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={notFound ? location.pathname : documentPage ?? activeSection}
                  className="h-full"
                  initial={loadingPreferences.reducedMotion ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={loadingPreferences.reducedMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
                  transition={{ duration: loadingPreferences.reducedMotion ? 0 : 0.28, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <RouteLoadBoundary routeKey={routeKey}>
                  <Suspense fallback={<RoutePending />}>
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
                    documentPage={documentPage}
                    notFound={notFound}
                  />
                  {contentMatchesRoute && !requestedReader ? <RouteContentReady key={routeKey} onReady={handleRouteReady} /> : null}
                  </Suspense>
                  </RouteLoadBoundary>
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {activeCaseStudy && !notFound ? (
          <div key={activeCaseStudy.id} className="portfolio-reader-layer"><RouteLoadBoundary routeKey={routeKey} onClose={handleCloseCaseStudy}>
          <Suspense fallback={<RoutePending reader onClose={handleCloseCaseStudy} />}>
            {activeCaseStudy.id === THESIS_CASE_STUDY_ID ? (
              <ThesisDeepDive onClose={handleCloseCaseStudy} />
            ) : activeCaseStudy.id === METACOGNITION_DEEP_DIVE_ID ? (
              <MetacognitionDeepDive onClose={handleCloseCaseStudy} />
            ) : (
              <CaseStudyReader item={activeCaseStudy} onClose={handleCloseCaseStudy} />
            )}
            {contentMatchesRoute ? <RouteContentReady key={routeKey} onReady={handleRouteReady} /> : null}
          </Suspense>
          </RouteLoadBoundary></div>
        ) : null}
      </AnimatePresence>
      <BottomNavigation
        activeDestination={documentPage === 'about' || documentPage === 'resources' ? documentPage : undefined}
        lightPage={documentPage === 'resources'}
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
    <MotionConfig reducedMotion="user">
      <Routes>
        <Route path="*" element={<PortfolioPage />} />
      </Routes>
    </MotionConfig>
  );
}
