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
  const [nameVerticalOffset, setNameVerticalOffset] = useState(0);
  const bioDetailsId = `hero-bio-${useId().replace(/:/g, '')}`;
  const bioDetailsRef = useRef<HTMLDivElement | null>(null);
  const { hero } = portfolioContent;
  const activeRole = roles[roleIndex];

  useLayoutEffect(() => {
    const root = rootRef.current;
    const stage = root?.closest<HTMLElement>('.portfolio-stage');
    if (!root || !stage) return;
    let active = true;
    let previousOffset = 0;
    let previousWidth = 0;
    let previousHeight = 0;
    let previousIntroHeight = 0;
    const update = () => {
      if (!active) return;
      const viewportHeight = stage.clientHeight;
      if (!viewportHeight) return;
      root.style.setProperty('--hero-stage-height', `${viewportHeight}px`);
      const details = bioDetailsRef.current;
      const intro = root.querySelector<HTMLElement>('.homepage-hero__bio-intro');
      const cta = root.querySelector<HTMLElement>('.homepage-hero__cta');
      const mobile = window.matchMedia('(max-width: 640px)').matches;
      const name = root.querySelector<SVGTextElement>(
        `.hero-name-cutout-layer-${mobile ? 'mobile' : 'desktop'} .hero-name-cutout-mask-text`,
      );
      const introHeight = intro?.getBoundingClientRect().height ?? 0;
      const resized = previousWidth !== stage.clientWidth || previousHeight !== viewportHeight || previousIntroHeight !== introHeight;
      if (name && cta && details && (details.hidden || resized)) {
        const viewHeight = mobile ? 760 : 900;
        const baselineOffset = Number(name.getAttribute('y')) - (mobile ? 306 : 350);
        const nameTop = (name.getBBox().y - baselineOffset) * viewportHeight / viewHeight;
        const detailsHeight = details.hidden ? 0 : details.getBoundingClientRect().height;
        const ctaStyle = window.getComputedStyle(cta);
        const transformOffset = ctaStyle.transform === 'none' ? 0 : new DOMMatrixReadOnly(ctaStyle.transform).m42;
        const translateOffset = ctaStyle.translate === 'none' ? 0 : Number.parseFloat(ctaStyle.translate.split(/\s+/)[1] ?? '0');
        const entranceOffset = transformOffset + translateOffset;
        const collapsedBottom = cta.getBoundingClientRect().bottom - root.getBoundingClientRect().top - detailsHeight - previousOffset - entranceOffset;
        const centeredOffset = viewportHeight / 2 - (nameTop + collapsedBottom) / 2;
        const offset = Math.max(64 - nameTop, centeredOffset);
        root.style.setProperty('--hero-copy-offset', `${offset}px`);
        previousOffset = offset;
        setNameVerticalOffset((current) => Math.abs(current - offset / viewportHeight) > 0.00001 ? offset / viewportHeight : current);
        previousWidth = stage.clientWidth;
        previousHeight = viewportHeight;
        previousIntroHeight = introHeight;
      }
      const scale = Math.max(1, root.clientHeight / viewportHeight);
      setViewBoxScale((current) => Math.abs(current - scale) > 0.001 ? scale : current);
    };
    const observer = new ResizeObserver(update);
    observer.observe(root);
    observer.observe(stage);
    update();
    void document.fonts.ready.then(update);
    return () => { active = false; observer.disconnect(); };
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
            <text className="hero-name-cutout-mask-text hero-name-cutout-mask-text-desktop" x="800" y={350 + 900 * nameVerticalOffset} fill="black">
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
              y={306 + 760 * nameVerticalOffset}
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
          <p className="homepage-hero__bio-intro">{hero.headline}</p>
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
        <div className="homepage-hero__cta blur-in flex translate-y-5 flex-wrap justify-center gap-4 [filter:blur(10px)]">
          <ThesisGlassButton onClick={onOpenThesis} />
        </div>
      </div>

    </section>
  );
}
