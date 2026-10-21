import { useEffect, useRef, useState } from 'react';
import '../styles/accessibility.css';

export function ReaderTools() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isReadingView, setIsReadingView] = useState(false);
  useEffect(() => {
    const reader = rootRef.current?.closest('[data-reader-modal]');
    reader?.toggleAttribute('data-reading-view', isReadingView);
    if (isReadingView) rootRef.current?.scrollIntoView({ block: 'start', behavior: 'auto' });
    return () => { reader?.removeAttribute('data-reading-view'); };
  }, [isReadingView]);
  return (
    <div ref={rootRef} className="portfolio-reader-tools">
      <button type="button" aria-pressed={isReadingView} onClick={() => setIsReadingView((current) => !current)}>
        {isReadingView ? 'Visual view' : 'Reading view'}
      </button>
      <button type="button" onClick={() => window.print()}>Print / PDF</button>
    </div>
  );
}
