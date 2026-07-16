import { useId } from 'react';
import type { CSSProperties, ReactNode } from 'react';

type GlassFilterStyle = CSSProperties & {
  '--tahoe-glass-filter': string;
};

type TahoeGlassChipProps = {
  children: ReactNode;
  className?: string;
  labelClassName?: string;
  as?: 'span' | 'button';
  ariaLabel?: string;
  title?: string;
  onClick?: () => void;
};

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

export function TahoeGlassChip({
  children,
  className = '',
  labelClassName = '',
  as = 'span',
  ariaLabel,
  title,
  onClick,
}: TahoeGlassChipProps) {
  const filterId = `portfolio-tahoe-glass-chip-${useId().replace(/:/g, '')}`;
  const glassStyle: GlassFilterStyle = { '--tahoe-glass-filter': `url(#${filterId})` };
  const content = (
    <>
      <TahoeGlassFilter id={filterId} />
      <span className="tahoe-glass-chip-lens" aria-hidden="true" />
      <span className={`tahoe-glass-chip-label ${labelClassName}`}>{children}</span>
    </>
  );

  if (as === 'button') {
    return (
      <button
        type="button"
        aria-label={ariaLabel}
        title={title}
        onClick={onClick}
        className={`tahoe-glass-chip ${className}`}
        style={glassStyle}
      >
        {content}
      </button>
    );
  }

  return (
    <span className={`tahoe-glass-chip ${className}`} style={glassStyle} title={title}>
      {content}
    </span>
  );
}
