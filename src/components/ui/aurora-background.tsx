"use client";

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
  backgroundMode?: 'absolute' | 'fixed';
}

export function AuroraBackground({
  className,
  children,
  showRadialGradient = true,
  backgroundMode = 'absolute',
  ...props
}: AuroraBackgroundProps) {
  const isFixedBackground = backgroundMode === 'fixed';

  return (
    <div
      className={cn(
        'relative flex min-h-screen flex-col overflow-hidden bg-zinc-50 text-slate-950 transition-colors',
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          'pointer-events-none overflow-hidden',
          isFixedBackground ? 'fixed inset-0 h-dvh' : 'absolute inset-0',
        )}
        aria-hidden="true"
      >
        <div
          className={cn(
            `
            [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)]
            [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]
            [--aurora:repeating-linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-300)_15%,var(--blue-300)_20%,var(--violet-200)_25%,var(--blue-400)_30%)]
            [background-image:var(--white-gradient),var(--aurora)]
            dark:[background-image:var(--dark-gradient),var(--aurora)]
            [background-size:300%,_200%]
            [background-position:50%_50%,50%_50%]
            filter blur-[10px] invert dark:invert-0
            after:content-[""] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)]
            after:dark:[background-image:var(--dark-gradient),var(--aurora)]
            after:[background-size:200%,_100%]
            after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference
            pointer-events-none
            opacity-50
            `,
            isFixedBackground ? 'fixed -inset-[10px] h-[calc(100dvh+20px)] will-change-[background-position]' : 'absolute -inset-[10px] will-change-transform',
            showRadialGradient &&
              '[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]',
          )}
        />
      </div>
      <div className="relative z-10 min-h-full">{children}</div>
    </div>
  );
}
