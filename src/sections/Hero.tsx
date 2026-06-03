import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { portfolioContent, roles } from '../data/portfolio';
import { GlassImprintCta } from '../components/GlassImprintCta';
import { SectionKicker } from '../components/SectionHeader';

function ThesisGlassButton({ onClick }: { onClick: () => void }) {
  return <GlassImprintCta label="My Product Thesis" onClick={onClick} className="hero-thesis-glass-button--thesis" />;
}

export function Hero({ ready, onOpenThesis }: { ready: boolean; onOpenThesis: () => void }) {
  const rootRef = useRef<HTMLElement | null>(null);
  const [roleIndex, setRoleIndex] = useState(0);
  const { hero } = portfolioContent;
  const activeRole = roles[roleIndex];

  useLayoutEffect(() => {
    if (!ready) return undefined;

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .to('.name-reveal', { opacity: 1, y: 0, duration: 1.2, delay: 0.1 })
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
      className="relative flex h-full min-h-full items-center justify-center overflow-hidden px-6 text-center"
    >
      <div className="absolute inset-0 z-0 bg-white/8" />
      <svg
        className="hero-name-cutout-layer hero-name-cutout-layer-desktop"
        viewBox="0 0 1600 900"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <mask id="hero-name-cutout-mask-desktop" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="900">
            <rect x="0" y="0" width="1600" height="900" fill="white" />
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
          height="900"
          fill="white"
          mask="url(#hero-name-cutout-mask-desktop)"
        />
      </svg>
      <svg
        className="hero-name-cutout-layer hero-name-cutout-layer-mobile"
        viewBox="0 0 600 760"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <mask id="hero-name-cutout-mask-mobile" maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="760">
            <rect x="0" y="0" width="600" height="760" fill="white" />
            <text className="hero-name-cutout-mask-text hero-name-cutout-mask-text-mobile" x="300" y="306" fill="black">
              {hero.name}
            </text>
          </mask>
        </defs>
        <rect
          className="hero-name-cutout-surface"
          x="0"
          y="0"
          width="600"
          height="760"
          fill="white"
          mask="url(#hero-name-cutout-mask-mobile)"
        />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 z-[2] h-48 bg-gradient-to-t from-bg/90 to-transparent" />
      <div className="pointer-events-none absolute left-6 top-8 z-10 sm:left-8 md:left-12 lg:left-16">
        <SectionKicker number="01" label="Intro" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center">
        <h1 className="sr-only">{hero.name}</h1>
        <div className="hero-name-cutout-spacer name-reveal translate-y-[50px]" aria-hidden="true" />
        <p className="blur-in mt-6 translate-y-5 text-center text-[1.14rem] font-semibold leading-normal text-[#4f5863] [filter:blur(10px)] md:text-[1.3rem]">
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
          <span> and Fiction Author</span>
        </p>
        <p className="blur-in mt-5 max-w-md translate-y-5 text-sm leading-7 text-muted [filter:blur(10px)] md:text-base">
          {hero.headline}
        </p>
        <div className="blur-in mt-12 flex translate-y-5 flex-wrap justify-center gap-4 [filter:blur(10px)]">
          <ThesisGlassButton onClick={onOpenThesis} />
        </div>
      </div>

    </section>
  );
}
