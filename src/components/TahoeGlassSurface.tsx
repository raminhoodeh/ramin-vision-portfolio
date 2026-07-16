import { useId } from 'react';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { TahoeGlassFilter, type TahoeGlassFilterStyle } from './TahoeGlassTabNav';

type TahoeGlassSurfaceProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  contentClassName?: string;
};

export function TahoeGlassSurface({
  children,
  className = '',
  contentClassName = '',
  style,
  ...props
}: TahoeGlassSurfaceProps) {
  const filterId = `portfolio-tahoe-glass-surface-${useId().replace(/:/g, '')}`;
  const glassStyle: TahoeGlassFilterStyle & CSSProperties = {
    '--tahoe-glass-filter': `url(#${filterId})`,
    ...style,
  };

  return (
    <div className={`tahoe-glass-surface ${className}`} style={glassStyle} {...props}>
      <TahoeGlassFilter id={filterId} />
      <span className="tahoe-glass-nav-lens" aria-hidden="true" />
      <div className={`tahoe-glass-surface-content ${contentClassName}`}>{children}</div>
    </div>
  );
}
