import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { portfolioContent, roles } from '../data/portfolio';
import { GlassImprintCta } from '../components/GlassImprintCta';
import './heroBio.css';

function ThesisGlassButton({ onClick }: { onClick: () => void }) {
  return <GlassImprintCta label="My Product Thesis" onClick={onClick} className="hero-thesis-glass-button--thesis" />;
}

export function Hero({ ready, onOpenThesis }: { ready: boolean; onOpenThesis: () => void }) {
  const rootRef = useRef<HTMLElement | null>(null);
  const [roleIndex, setRoleIndex] = useState(0);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [viewBoxScale, setViewBoxScale] = useState(1);
  const bioDetailsId = `hero-bio-${useId().replace(/:/g, '')}`;
  const bioDetailsRef = useRef<HTMLDivElement | null>(null);
  const { hero } = portfolioContent;
  const activeRole = roles[roleIndex];

  useLayoutEffect(() => {
    const root = rootRef.current;
    const stage = root?.closest<HTMLElement>('.portfolio-stage');
    if (!root || !stage) return;
    const update = () => {
      const viewportHeight = stage.clientHeight;
      if (!viewportHeight) return;
      root.style.setProperty('--hero-stage-height', `${viewportHeight}px`);
      const scale = Math.max(1, root.clientHeight / viewportHeight);
      setViewBoxScale((current) => Math.abs(current - scale) > 0.001 ? scale : current);
    };
    const observer = new ResizeObserver(update);
    observer.observe(root);
    observer.observe(stage);
    update();
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (!ready) return undefined;

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
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
    if (isBioExpanded) bioDetailsRef.current?.focus();
  }, [isBioExpanded]);

  function toggleBiography() {
    setIsBioExpanded((current) => !current);
  }

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
      className="homepage-hero relative min-h-full overflow-hidden px-6 text-center"
    >
      <div className="absolute inset-0 z-0 bg-white/8" />
      <svg
        className="hero-name-cutout-layer hero-name-cutout-layer-desktop"
        viewBox={`0 0 1600 ${900 * viewBoxScale}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <mask id="hero-name-cutout-mask-desktop" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height={900 * viewBoxScale}>
            <rect x="0" y="0" width="1600" height={900 * viewBoxScale} fill="white" />
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
          height={900 * viewBoxScale}
          fill="white"
          mask="url(#hero-name-cutout-mask-desktop)"
        />
      </svg>
      <svg
        className="hero-name-cutout-layer hero-name-cutout-layer-mobile"
        viewBox={`0 0 600 ${760 * viewBoxScale}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <mask id="hero-name-cutout-mask-mobile" maskUnits="userSpaceOnUse" x="0" y="0" width="600" height={760 * viewBoxScale}>
            <rect x="0" y="0" width="600" height={760 * viewBoxScale} fill="white" />
            <text
              className="hero-name-cutout-mask-text hero-name-cutout-mask-text-mobile"
              x="300"
              y="306"
              fill="black"
              stroke="black"
              transform="translate(300 306) scale(1.45 1) translate(-300 -306)"
            >
              {hero.name}
            </text>
          </mask>
        </defs>
        <rect
          className="hero-name-cutout-surface"
          x="0"
          y="0"
          width="600"
          height={760 * viewBoxScale}
          fill="white"
          mask="url(#hero-name-cutout-mask-mobile)"
        />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 z-[2] h-48 bg-gradient-to-t from-bg/90 to-transparent" />

      <div className="homepage-hero__copy z-10">
        <h1 className="sr-only">{hero.name}</h1>
        <p className="homepage-hero__role blur-in translate-y-5 text-center text-[1.14rem] font-semibold leading-normal text-[#4f5863] [filter:blur(10px)] md:text-[1.3rem]">
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
        </p>
        <div className="homepage-hero__bio blur-in translate-y-5 text-sm leading-7 text-muted [filter:blur(10px)] md:text-base">
          <div>
            <p>{hero.headline}</p>
            <div
              id={bioDetailsId}
              ref={bioDetailsRef}
              hidden={!isBioExpanded}
              tabIndex={-1}
              role="region"
              aria-label="More about Ramin Hoodeh"
              className="homepage-hero__bio-details"
            >
              <p>{hero.biography.career}</p>
              <p>
                {hero.biography.latestWork.beforeLink}
                <a
                  href={hero.biography.latestWork.linkHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="homepage-hero__bio-link"
                >
                  {hero.biography.latestWork.linkLabel}
                </a>
                {hero.biography.latestWork.afterLink}
              </p>
            </div>
          </div>
          <div className="homepage-hero__bio-toggle">
            <button
              type="button"
              aria-expanded={isBioExpanded}
              aria-controls={bioDetailsId}
              onClick={toggleBiography}
              className="education-read-more-chip"
            >
              <span className="education-read-more-chip__label">{isBioExpanded ? 'Show less' : 'Read more'}</span>
            </button>
          </div>
        </div>
        <div className="homepage-hero__cta blur-in flex translate-y-5 flex-wrap justify-center gap-4 [filter:blur(10px)]">
          <ThesisGlassButton onClick={onOpenThesis} />
        </div>
      </div>

    </section>
  );
}
