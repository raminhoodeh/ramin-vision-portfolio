import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  type WorkItem,
} from '../types';
import { formatSourceStatus } from '../../lib/text';
import { workCaseStudyByTitle } from './types';

export function WorkCaseStudyOverlay({ item, onClose }: { item: WorkItem; onClose: () => void }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const caseSections = [
    { label: 'Problem', body: item.problem },
    { label: 'Architecture', body: item.architecture },
    { label: 'Why this approach', body: item.approach },
    { label: 'Tradeoffs', body: item.tradeoffs },
    { label: 'Demo / proof', body: item.proof },
    { label: 'What I would improve', body: item.improve },
  ];
  const governanceChip =
    item.chips.find((chip) => /governance|privacy|human|proof/i.test(chip.label)) ?? item.chips[1] ?? item.chips[0];

  return (
    <motion.div
      className="portfolio-deep-dive-overlay fixed inset-0 z-[100] overflow-y-auto px-3 py-3 text-text-primary sm:px-5 sm:py-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <button
        type="button"
        aria-label="Close project case study"
        className="portfolio-deep-dive-backdrop absolute inset-0 bg-bg/20 backdrop-blur-[3px]"
        onClick={onClose}
      />

      <motion.article
        layoutId={`work-case-${item.title}`}
        className="portfolio-deep-dive-shell relative mx-auto grid min-h-[calc(100svh-1.5rem)] max-w-[1320px] gap-4 lg:h-[calc(100svh-2.5rem)] lg:min-h-0 lg:grid-cols-[0.9fr_1.1fr] lg:overflow-hidden"
      >
        <div className="deep-dive-support-rail project-deep-dive-scroll liquid-glass-strong flex min-h-[58vh] flex-col overflow-hidden rounded-[2rem] lg:h-full lg:min-h-0 lg:overflow-y-auto">
          <div className="relative min-h-[280px] flex-1 bg-[radial-gradient(circle_at_30%_18%,rgba(255,255,255,0.78),rgba(187,210,230,0.45)_38%,rgba(77,106,136,0.55)_100%)]">
            <img
              src={item.image}
              alt={item.title}
              decoding="async"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/28 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <p className="text-xs uppercase tracking-[0.28em] text-muted">{item.tag}</p>
              <h2 className="mt-4 font-body text-5xl font-semibold tracking-[-0.04em] text-text-primary md:text-7xl">
                {item.title}
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-muted md:text-base">{item.summary}</p>
            </div>
          </div>

          <div className="grid shrink-0 gap-3 p-6 md:grid-cols-3 md:p-8 lg:grid-cols-1 xl:grid-cols-3">
            {item.chips.map((chip) => (
              <div key={chip.label} className="liquid-glass rounded-[1.35rem] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">{chip.label}</p>
                  <span className="text-[0.58rem] uppercase tracking-[0.16em] text-muted/80">
                    {formatSourceStatus(chip.sourceStatus)}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-text-primary">{chip.value}</p>
              </div>
            ))}
          </div>

          <div className="grid shrink-0 gap-4 px-6 pb-6 md:px-8 md:pb-8">
            <div className="liquid-glass rounded-[1.5rem] p-5 md:p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">Architecture Chips</p>
              <div className="mt-5 grid gap-3">
                {item.architectureChips.map((chip) => (
                  <div key={chip.label} className="flex gap-3 rounded-2xl bg-white/35 p-3">
                    <span className="shrink-0 rounded-full bg-white/45 px-3 py-1 text-[0.62rem] uppercase tracking-[0.16em] text-muted">
                      {chip.label}
                    </span>
                    <p className="text-sm leading-6 text-text-primary">{chip.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="liquid-glass rounded-[1.5rem] p-5 md:p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">Proof Stack</p>
              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl bg-white/35 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Public proof</p>
                  <p className="mt-2 text-sm leading-6 text-text-primary">
                    {item.links.length ? item.links.map((link) => link.label).join(' / ') : item.proof[0]}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/35 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Technical layer</p>
                  <p className="mt-2 text-sm leading-6 text-text-primary">
                    {item.architectureChips
                      .slice(0, 3)
                      .map((chip) => chip.label)
                      .join(' / ')}
                  </p>
                </div>
                {governanceChip ? (
                  <div className="rounded-2xl bg-white/35 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">Trust layer</p>
                    <p className="mt-2 text-sm leading-6 text-text-primary">{governanceChip.value}</p>
                  </div>
                ) : null}
                <div className="rounded-2xl bg-white/35 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Next asset needed</p>
                  <p className="mt-2 text-sm leading-6 text-text-primary">{item.assetRequest}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="portfolio-deep-dive-reader-panel liquid-glass-strong flex flex-col rounded-[2rem] p-6 md:p-8 lg:min-h-0 lg:overflow-hidden">
          <div className="portfolio-deep-dive-header flex shrink-0 items-start justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Case Study</p>
              <p className="mt-2 text-xs uppercase tracking-[0.22em] text-muted">
                {formatSourceStatus(item.sourceStatus)}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="portfolio-deep-dive-inline-close liquid-glass-control rounded-full px-5 py-3 text-sm text-text-primary transition-transform duration-300 hover:scale-105"
            >
              Close
            </button>
          </div>

          <div className="project-deep-dive-scroll mt-8 pr-1 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-4">
            <div className="grid gap-5">
              {caseSections.map((section, index) => (
                <section key={section.label} className="liquid-glass rounded-[1.5rem] p-5 md:p-6">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted">
                    {String(index + 1).padStart(2, '0')} / {section.label}
                  </p>
                  <div className="mt-4 space-y-4">
                    {section.body.map((paragraph) => (
                      <p key={paragraph} className="text-sm leading-7 text-text-primary md:text-base">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {item.links.length ? (
              <div className="mt-5 liquid-glass rounded-[1.5rem] p-5 md:p-6">
                <p className="text-xs uppercase tracking-[0.22em] text-muted">Source Links</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {item.links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-white/45 px-4 py-2 text-xs text-text-primary transition duration-300 hover:bg-white/75"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
}
