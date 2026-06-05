import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const loadingWords = ['Judgement', 'Vision', 'Taste', 'Clarity'] as const;
const loadingDurationMs = 3600;

type LoadingScreenProps = {
  onComplete: () => void;
};

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [count, setCount] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const completeRef = useRef(false);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = loadingDurationMs;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const nextCount = Math.round(progress * 100);
      const nextWordIndex = Math.min(Math.floor(progress * loadingWords.length), loadingWords.length - 1);
      setCount(nextCount);
      setWordIndex(nextWordIndex);

      if (nextCount >= 100 && !completeRef.current) {
        completeRef.current = true;
        window.setTimeout(onComplete, 400);
        return;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  return (
    <motion.div
      data-testid="loading-screen"
      className="fixed inset-0 z-[9999] bg-bg text-text-primary"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } }}
    >
      <motion.div
        className="absolute left-6 top-6 text-xs uppercase tracking-[0.3em] text-muted md:left-10 md:top-9"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      >
        Portfolio
      </motion.div>

      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={loadingWords[wordIndex]}
            className="font-display text-4xl italic text-text-primary/80 md:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {loadingWords[wordIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-9 right-6 font-display text-6xl tabular-nums text-text-primary md:bottom-12 md:right-10 md:text-8xl lg:text-9xl">
        {String(count).padStart(3, '0')}
      </div>

      <div className="absolute bottom-0 left-0 h-[3px] w-full bg-stroke/50">
        <div
          className="accent-gradient h-full origin-left"
          style={{
            transform: `scaleX(${count / 100})`,
            boxShadow: '0 0 8px rgba(137, 170, 204, 0.35)',
          }}
        />
      </div>
    </motion.div>
  );
}
