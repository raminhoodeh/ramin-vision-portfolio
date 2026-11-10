import { useId, type RefObject } from 'react';
import { ReaderOverlay } from '../components/ReaderOverlay';
import { portfolioContent } from '../data/portfolio';

export function BiographyReader({ onClose, returnFocusRef }: {
  onClose: () => void;
  returnFocusRef: RefObject<HTMLElement | null>;
}) {
  const titleId = useId();
  const { hero } = portfolioContent;
  const { latestWork } = hero.biography;

  return (
    <ReaderOverlay onClose={onClose} labelledBy={titleId} returnFocusRef={returnFocusRef} className="biography-reader-overlay">
      <button type="button" aria-label="Close biography" onClick={onClose} className="portfolio-deep-dive-mobile-close card-glass-attachment is-active">
        <span className="card-glass-attachment__glyph" aria-hidden="true">
          <span className="card-glass-attachment__line card-glass-attachment__line-horizontal" />
          <span className="card-glass-attachment__line card-glass-attachment__line-vertical" />
        </span>
      </button>
      <article className="biography-reader-shell relative">
        <div className="portfolio-deep-dive-reader-panel liquid-glass-strong rounded-[2rem] p-6 md:p-8">
          <header className="portfolio-deep-dive-header flex items-start justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Biography</p>
              <h2 id={titleId} className="mt-3 font-display text-4xl italic text-text-primary">{hero.name}</h2>
            </div>
            <button type="button" aria-label="Close biography" onClick={onClose} className="biography-reader-close portfolio-deep-dive-inline-close card-glass-attachment is-active">
              <span className="card-glass-attachment__glyph" aria-hidden="true">
                <span className="card-glass-attachment__line card-glass-attachment__line-horizontal" />
                <span className="card-glass-attachment__line card-glass-attachment__line-vertical" />
              </span>
            </button>
          </header>
          <div className="biography-reader-body mt-8 text-sm leading-7 text-text-primary md:text-base">
            <p>{hero.headline}</p>
            <p>{hero.biography.career}</p>
            <p>
              {latestWork.beforeLink}
              <a href={latestWork.linkHref} target="_blank" rel="noopener noreferrer" className="biography-reader-link">{latestWork.linkLabel}</a>
              {latestWork.afterLink}
            </p>
          </div>
        </div>
      </article>
    </ReaderOverlay>
  );
}
