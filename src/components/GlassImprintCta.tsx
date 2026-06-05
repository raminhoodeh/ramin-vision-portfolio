import { useId } from 'react';
import type { CSSProperties } from 'react';

type GlassImprintCtaProps = {
  label: string;
  ariaLabel?: string;
  href?: string;
  target?: string;
  rel?: string;
  className?: string;
  onClick?: () => void;
};

export function GlassImprintCta({
  label,
  ariaLabel,
  href,
  target,
  rel,
  className = '',
  onClick,
}: GlassImprintCtaProps) {
  const filterId = `hero-thesis-glass-${useId().replace(/:/g, '')}`;
  const glassStyle = { '--tahoe-glass-filter': `url(#${filterId})` } as CSSProperties & {
    '--tahoe-glass-filter': string;
  };

  const content = (
    <>
      <svg className="tahoe-glass-filter-defs" aria-hidden="true" focusable="false">
        <filter id={filterId} primitiveUnits="objectBoundingBox">
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
      <span className="hero-thesis-glass-lens" aria-hidden="true" />
      <span className="hero-thesis-glass-label">{label}</span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className={`hero-thesis-glass-button ${className}`}
        style={glassStyle}
        aria-label={ariaLabel ?? label}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`hero-thesis-glass-button ${className}`}
      style={glassStyle}
      aria-label={ariaLabel ?? label}
    >
      {content}
    </button>
  );
}
