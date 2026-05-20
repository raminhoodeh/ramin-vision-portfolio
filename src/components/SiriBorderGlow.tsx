import { useEffect, useState } from 'react';

type SiriBorderGlowProps = {
  className?: string;
  energizedMs?: number;
};

const SIRI_BORDER_STEPS = [
  { id: 'start' },
  { id: 'step-1' },
  { id: 'step-2' },
  { id: 'end' },
] as const;

export function SiriBorderGlow({ className = '', energizedMs = 18000 }: SiriBorderGlowProps) {
  const [isEnergized, setIsEnergized] = useState(true);

  useEffect(() => {
    setIsEnergized(true);
    const timer = window.setTimeout(() => setIsEnergized(false), energizedMs);
    return () => window.clearTimeout(timer);
  }, [energizedMs]);

  return (
    <span className={`siri-border-glow ${isEnergized ? 'is-energized' : 'is-ambient'} ${className}`} aria-hidden="true">
      {SIRI_BORDER_STEPS.map((step) => (
        <span key={step.id} className={`siri-border-glow-frame siri-border-glow-frame-${step.id}`}>
          <span className="siri-border-glow-layer siri-border-glow-bloom" />
          <span className="siri-border-glow-layer siri-border-glow-core" />
          <span className="siri-border-glow-layer siri-border-glow-spark" />
        </span>
      ))}
    </span>
  );
}
