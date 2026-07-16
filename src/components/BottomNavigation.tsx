import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useId, useRef, useState } from 'react';
import { detectSurfaceToneUnderNav, TahoeGlassFilter, TahoeGlassTabNav } from './TahoeGlassTabNav';
import type { TahoeGlassFilterStyle } from './TahoeGlassTabNav';
import type { SectionTarget } from '../lib/text';

const bottomNavigationLinks = [
  { label: 'Intro', target: 'hero', icon: 'intro' },
  { label: 'Work', target: 'experience-education', icon: 'work' },
  { label: 'Projects', target: 'projects', icon: 'projects' },
  { label: 'Thoughts', target: 'thoughts', icon: 'thoughts' },
  { label: 'Contact', target: 'contact', icon: 'contact' },
  { label: 'Bonus', target: 'bonus', icon: 'bonus' },
  { label: 'AI Ramin', target: 'ai-ramin', icon: 'ai' },
] as const;

const PHONE_NAV_QUERY = '(max-width: 767px)';

function useIsPhoneNavigation() {
  const [isPhoneNavigation, setIsPhoneNavigation] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(PHONE_NAV_QUERY).matches,
  );

  useEffect(() => {
    const query = window.matchMedia(PHONE_NAV_QUERY);
    const update = () => setIsPhoneNavigation(query.matches);

    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return isPhoneNavigation;
}

export function BottomNavigation({
  active,
  currentSection,
  onNavigate,
  onNavIntent,
  onRegisterMenuOpen,
}: {
  active: SectionTarget;
  currentSection: SectionTarget;
  onNavigate: (target: string) => void;
  onNavIntent?: (target: string) => void;
  onRegisterMenuOpen?: (fn: () => void) => void;
}) {
  const isDarkPage = currentSection === 'bonus' || currentSection === 'projects';
  const isPhoneNavigation = useIsPhoneNavigation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileNavOnDarkSurface, setIsMobileNavOnDarkSurface] = useState(isDarkPage);
  const mobileNavTriggerRef = useRef<HTMLButtonElement | null>(null);
  const activeLink = bottomNavigationLinks.find((link) => link.target === active) ?? bottomNavigationLinks[0];
  const mobileTriggerFilterId = `portfolio-mobile-nav-filter-${useId().replace(/:/g, '')}`;
  const mobileMenuItemFilterBaseId = `portfolio-mobile-menu-item-filter-${useId().replace(/:/g, '')}`;
  const mobileTriggerFilterStyle: TahoeGlassFilterStyle = { '--tahoe-glass-filter': `url(#${mobileTriggerFilterId})` };

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isPhoneNavigation) setIsMobileMenuOpen(false);
  }, [isPhoneNavigation]);

  useEffect(() => {
    if (isPhoneNavigation && onRegisterMenuOpen) {
      onRegisterMenuOpen(() => setIsMobileMenuOpen(true));
    }
  }, [isPhoneNavigation, onRegisterMenuOpen]);

  useEffect(() => {
    if (!isPhoneNavigation) {
      setIsMobileNavOnDarkSurface(isDarkPage);
      return undefined;
    }

    const root = mobileNavTriggerRef.current;
    if (!root) {
      setIsMobileNavOnDarkSurface(isDarkPage);
      return undefined;
    }

    let frame = 0;

    const sampleSurface = () => {
      frame = 0;
      const tone = detectSurfaceToneUnderNav(root);
      setIsMobileNavOnDarkSurface(tone === null ? isDarkPage : tone === 'dark');
    };

    const scheduleSample = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(sampleSurface);
    };

    sampleSurface();

    window.addEventListener('scroll', scheduleSample, { passive: true, capture: true });
    window.addEventListener('resize', scheduleSample, { passive: true });
    window.addEventListener('pointermove', scheduleSample, { passive: true });
    window.addEventListener('touchmove', scheduleSample, { passive: true });

    const resizeObserver = new ResizeObserver(scheduleSample);
    resizeObserver.observe(root);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleSample, true);
      window.removeEventListener('resize', scheduleSample);
      window.removeEventListener('pointermove', scheduleSample);
      window.removeEventListener('touchmove', scheduleSample);
      resizeObserver.disconnect();
    };
  }, [active, currentSection, isDarkPage, isPhoneNavigation]);

  if (isPhoneNavigation) {
    return (
      <>
        <nav aria-label="Portfolio navigation" className={`portfolio-mobile-bottom-navigation ${active === 'ai-ramin' ? 'is-ai-ramin-active' : ''}`}>
          {active !== 'ai-ramin' ? (
            <button
              ref={mobileNavTriggerRef}
              type="button"
              className={`portfolio-mobile-nav-trigger ${isMobileNavOnDarkSurface ? 'is-on-dark-surface' : ''}`}
              style={mobileTriggerFilterStyle}
              aria-haspopup="dialog"
              aria-expanded={isMobileMenuOpen}
              aria-controls="portfolio-mobile-menu"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <TahoeGlassFilter id={mobileTriggerFilterId} />
              <span className="tahoe-glass-nav-lens" aria-hidden="true" />
              <span className="portfolio-mobile-nav-trigger-copy">
                <span className="portfolio-mobile-nav-trigger-kicker">Menu</span>
                <span className="portfolio-mobile-nav-trigger-active">{activeLink.label}</span>
              </span>
              <span className="portfolio-mobile-nav-trigger-glyph" aria-hidden="true">
                <span />
                <span />
              </span>
            </button>
          ) : null}
        </nav>

        <AnimatePresence>
          {isMobileMenuOpen ? (
            <motion.div
              id="portfolio-mobile-menu"
              className="portfolio-mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Website sections"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="portfolio-mobile-menu-aurora" aria-hidden="true" />
              <span className="portfolio-mobile-menu-wash" aria-hidden="true" />

              <motion.div
                className="portfolio-mobile-menu-close-motion"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.24, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <button
                  type="button"
                  className="portfolio-mobile-menu-close-button portfolio-deep-dive-mobile-close card-glass-attachment is-active"
                  aria-label="Close menu"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="card-glass-attachment__glyph" aria-hidden="true">
                    <span className="card-glass-attachment__line card-glass-attachment__line-horizontal" />
                    <span className="card-glass-attachment__line card-glass-attachment__line-vertical" />
                  </span>
                </button>
              </motion.div>

              <motion.div
                className="portfolio-mobile-menu-content"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.36, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <p className="portfolio-mobile-menu-eyebrow">Portfolio</p>
                <h2 className="portfolio-mobile-menu-title">Menu</h2>
                <div className="portfolio-mobile-menu-list-glass">
                  <div className="portfolio-mobile-menu-list" aria-label="Mobile website sections">
                    {bottomNavigationLinks.map((link) => {
                      const isActive = active === link.target;
                      const itemFilterId = `${mobileMenuItemFilterBaseId}-${link.target}`;

                      return (
                        <button
                          key={link.target}
                          type="button"
                          className={`portfolio-mobile-menu-item tahoe-glass-chip ${isActive ? 'is-active' : ''}`}
                          style={{ '--tahoe-glass-filter': `url(#${itemFilterId})` } as TahoeGlassFilterStyle}
                          aria-current={isActive ? 'page' : undefined}
                          onPointerEnter={() => onNavIntent?.(link.target)}
                          onFocus={() => onNavIntent?.(link.target)}
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            onNavigate(link.target);
                          }}
                        >
                          <TahoeGlassFilter id={itemFilterId} />
                          <span className="tahoe-glass-chip-lens portfolio-mobile-menu-item-lens" aria-hidden="true" />
                          <span className="portfolio-mobile-menu-item-label">{link.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </>
    );
  }

  return (
    <nav
      aria-label="Portfolio navigation"
      className={`portfolio-bottom-navigation ${active === 'ai-ramin' ? 'has-ai-ramin-active' : ''}`}
    >
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
