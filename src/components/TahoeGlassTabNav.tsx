import { useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

type NavIconName = 'intro' | 'work' | 'projects' | 'thoughts' | 'contact' | 'bonus' | 'ai';

type NavLink = {
  label: string;
  menuLabel?: string;
  target: string;
  icon?: NavIconName;
};

type TahoeGlassTabNavProps = {
  active: string;
  navLinks: readonly NavLink[];
  onNavigate: (target: string) => void;
  onNavIntent?: (target: string) => void;
  isDarkPage?: boolean;
  className?: string;
  navLabel?: string;
};

type GlassFilterStyle = CSSProperties & {
  '--tahoe-glass-filter': string;
};

const navIconPaths: Record<NavIconName, readonly string[]> = {
  intro: ['M3 10.5 12 3l9 7.5', 'M5 9.5V21h5v-6h4v6h5V9.5'],
  work: ['M9 6V5a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v1', 'M3 7h18v13H3z', 'M3 12h18'],
  projects: ['M12 3 3 8l9 5 9-5-9-5Z', 'M3 13l9 5 9-5', 'M3 18l9 5 9-5'],
  thoughts: ['M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z', 'M8 7h8', 'M8 11h7'],
  contact: ['M4 6h16v12H4z', 'm4 7 8 6 8-6'],
  bonus: ['M20 12v8H4v-8', 'M3 8h18v4H3z', 'M12 8v12', 'M12 8H8.5A2.5 2.5 0 1 1 12 5.5V8Z', 'M12 8h3.5A2.5 2.5 0 1 0 12 5.5V8Z'],
  ai: ['M12 3l1.15 4.1L17 8.25l-3.85 1.15L12 13.5l-1.15-4.1L7 8.25l3.85-1.15L12 3Z', 'M5 14l.75 2.2L8 17l-2.25.8L5 20l-.75-2.2L2 17l2.25-.8L5 14Z', 'M18 14l.75 2.2L21 17l-2.25.8L18 20l-.75-2.2L15 17l2.25-.8L18 14Z'],
};

function NavIcon({ icon }: { icon?: NavIconName }) {
  if (!icon) return null;

  return (
    <svg className="tahoe-glass-nav-icon" viewBox="0 0 24 24" aria-hidden="true">
      {navIconPaths[icon].map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}

function TahoeGlassFilter({ id }: { id: string }) {
  return (
    <svg className="tahoe-glass-filter-defs" aria-hidden="true" focusable="false">
      <filter id={id} primitiveUnits="objectBoundingBox">
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
  );
}

export function TahoeGlassTabNav({
  active,
  navLinks,
  onNavigate,
  onNavIntent,
  isDarkPage = false,
  className = '',
  navLabel = 'Portfolio navigation',
}: TahoeGlassTabNavProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const collapseTimerRef = useRef<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const filterId = `portfolio-tahoe-glass-nav-${useId().replace(/:/g, '')}`;
  const filterStyle: GlassFilterStyle = { '--tahoe-glass-filter': `url(#${filterId})` };

  useEffect(() => {
    const parentNav = rootRef.current?.closest('.portfolio-bottom-navigation');
    parentNav?.classList.toggle('is-expanded', isExpanded);

    return () => {
      parentNav?.classList.remove('is-expanded');
    };
  }, [isExpanded]);

  useEffect(
    () => () => {
      if (collapseTimerRef.current !== null) window.clearTimeout(collapseTimerRef.current);
    },
    [],
  );

  const clearCollapseTimer = () => {
    if (collapseTimerRef.current === null) return;

    window.clearTimeout(collapseTimerRef.current);
    collapseTimerRef.current = null;
  };

  const expand = () => {
    clearCollapseTimer();
    setIsExpanded(true);
  };

  const collapseIfIdle = () => {
    const root = rootRef.current;
    if (!root) {
      setIsExpanded(false);
      return;
    }

    if (root.matches(':hover') || root.contains(document.activeElement)) return;
    setIsExpanded(false);
  };

  const holdAfterTouchOrClick = () => {
    expand();
    clearCollapseTimer();
    collapseTimerRef.current = window.setTimeout(collapseIfIdle, 1600);
  };

  return (
    <div
      ref={rootRef}
      className={`tahoe-glass-tab-nav ${isExpanded ? 'is-expanded' : ''} ${isDarkPage ? 'is-dark-page' : ''} ${className}`}
      style={filterStyle}
      role="tablist"
      aria-label={navLabel}
      onPointerEnter={expand}
      onPointerLeave={() => {
        clearCollapseTimer();
        setIsExpanded(false);
      }}
      onFocus={expand}
      onBlur={() => {
        window.setTimeout(collapseIfIdle, 0);
      }}
    >
      <TahoeGlassFilter id={filterId} />
      <span className="tahoe-glass-nav-lens" aria-hidden="true" />
      <div className="tahoe-glass-nav-tabs">
        {navLinks.map((link) => {
          const isActive = active === link.target;

          return (
            <button
              key={link.target}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={link.menuLabel ?? link.label}
              className={`tahoe-glass-nav-tab ${isActive ? 'is-active' : ''}`}
              onPointerEnter={() => onNavIntent?.(link.target)}
              onFocus={() => onNavIntent?.(link.target)}
              onPointerDown={holdAfterTouchOrClick}
              onClick={() => {
                holdAfterTouchOrClick();
                onNavigate(link.target);
              }}
            >
              {isActive ? <span className="tahoe-glass-tab-lens" aria-hidden="true" /> : null}
              <span className="tahoe-glass-tab-content">
                <NavIcon icon={link.icon} />
                <span className="tahoe-glass-nav-label">{link.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
