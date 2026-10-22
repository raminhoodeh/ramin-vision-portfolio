import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { homepagePositioning } from '../data/homepage';
import { GlassImprintCta } from '../components/GlassImprintCta';
import { HomepageProofs } from '../components/HomepageProofs';
import './homeHighlights.css';

export function Hero({ ready }: { ready: boolean; onOpenThesis: () => void }) {
  const rootRef = useRef<HTMLElement | null>(null);
  const hero = homepagePositioning;

  useLayoutEffect(() => {
    if (!ready) return undefined;

    const ctx = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      gsap.fromTo('.homepage-hero__reveal', { y: 8 }, {
        y: 0,
        duration: 0.45,
        stagger: 0.03,
        ease: 'power3.out',
        clearProps: 'transform',
      });
    }, rootRef);

    return () => ctx.revert();
  }, [ready]);

  return (
    <section
      id="hero"
      ref={rootRef}
      className="homepage-hero"
    >
      <div className="homepage-hero__content">
      <div className="homepage-hero__name homepage-hero__reveal" aria-hidden="true">
      <svg
        className="hero-name-cutout-layer hero-name-cutout-layer-desktop"
        viewBox="0 0 1600 240"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="hero-name-glass-desktop" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#20374f" />
            <stop offset="0.36" stopColor="#617e98" />
            <stop offset="0.62" stopColor="#294965" />
            <stop offset="1" stopColor="#718ba1" />
          </linearGradient>
          <mask id="hero-name-cutout-mask-desktop" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="240">
            <rect x="0" y="0" width="1600" height="240" fill="black" />
            <text className="hero-name-cutout-mask-text hero-name-cutout-mask-text-desktop" x="800" y="120" fill="white">
              {hero.name}
            </text>
          </mask>
        </defs>
        <rect
          className="hero-name-cutout-surface"
          x="0"
          y="0"
          width="1600"
          height="240"
          fill="url(#hero-name-glass-desktop)"
          mask="url(#hero-name-cutout-mask-desktop)"
        />
      </svg>
      <svg
        className="hero-name-cutout-layer hero-name-cutout-layer-mobile"
        viewBox="0 0 600 180"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="hero-name-glass-mobile" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#20374f" />
            <stop offset="0.36" stopColor="#617e98" />
            <stop offset="0.62" stopColor="#294965" />
            <stop offset="1" stopColor="#718ba1" />
          </linearGradient>
          <mask id="hero-name-cutout-mask-mobile" maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="180">
            <rect x="0" y="0" width="600" height="180" fill="black" />
            <text
              className="hero-name-cutout-mask-text hero-name-cutout-mask-text-mobile"
              x="300"
              y="90"
              fill="white"
              stroke="white"
              transform="translate(300 90) scale(1.3 1) translate(-300 -90)"
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
          height="180"
          fill="url(#hero-name-glass-mobile)"
          mask="url(#hero-name-cutout-mask-mobile)"
        />
      </svg>
      </div>
        <h1 className="homepage-hero__role homepage-hero__reveal"><span className="sr-only">{hero.name}, </span><span>{hero.role}</span><span className="homepage-hero__specialism"><span aria-hidden="true">| </span><span className="sr-only">, </span>{hero.specialism}</span></h1>
        <p className="homepage-hero__intro homepage-hero__reveal">{hero.intro}</p>
        <HomepageProofs />
        <nav className="homepage-hero__actions homepage-hero__reveal" aria-label="Explore Ramin’s work">
          <GlassImprintCta label="View selected work" href="/experience-education" className="homepage-hero__primary" />
          <a href="/contact">Contact</a>
          <a href="/product-thesis">Product thesis</a>
        </nav>
        <p className="homepage-hero__personal homepage-hero__reveal"><a href="/thoughts/books">{hero.personalNote}</a></p>
      </div>
    </section>
  );
}
