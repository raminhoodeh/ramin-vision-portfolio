import { AnimatePresence, motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
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
import { normalizeSectionTarget, type SectionTarget } from './lib/text';
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
import { caseStudyByDeepDiveSlug } from './sections/Projects/types';
import { TeachingWritingShelf } from './sections/TeachingWriting/index';
import { SectionMarker } from './components/SectionHeader';

gsap.registerPlugin(ScrollTrigger);

let bonusRockClickMemory = 0;

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
  const [isLoading, setIsLoading] = useState(
    () => !(import.meta.env.DEV && new URLSearchParams(window.location.search).has('noIntro')),
  );
  const [liveBackgroundReady, setLiveBackgroundReady] = useState(false);
  const [bonusRockPreloadStatus, setBonusRockPreloadStatus] = useState<BonusRockPreloadStatus>(
    () => getBonusRockPreloadSnapshot().status,
  );
  const [bonusRockClicks, setBonusRockClicks] = useState(() => bonusRockClickMemory);
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
  const isAiRaminSection = activeSection === 'ai-ramin';
  const isFullBleedSection = isProjectsSection || isThoughtsSection;
  const usesProjectsBackdrop = isProjectsSection;
  const shaderVariant: PortfolioShaderVariant = usesProjectsBackdrop
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
      <div className={`fixed inset-0 z-10 overflow-hidden ${isFullBleedSection ? 'p-0' : 'p-3 sm:p-5 lg:p-4'}`}>
        {/* AI Ramin is a framed (inset) card, so its kicker is rendered inside the card
            at its top-left instead of the viewport-pinned global marker. */}
        {isAiRaminSection ? null : <SectionMarker section={activeSection} />}
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
