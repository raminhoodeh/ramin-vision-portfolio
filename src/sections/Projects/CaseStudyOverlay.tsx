import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  type CaseStudyEntry,
} from '../types';
import { formatSourceStatus } from '../../lib/text';
import { IPhone3D } from '../../components/IPhone3D';
import dreamseaHomepageScreenUrl from '../../../projects-section/Project Images/dreamsea-images/dreamsea-homepage.PNG';
import conciergeHomepageScreenUrl from '../../../projects-section/Project Images/24seven-concierge-images/24-seven-homepage.PNG';

const mobileDeepDivePresentation: Record<string, { screen: string; narrative: string }> = {
  Dreamsea: {
    screen: dreamseaHomepageScreenUrl,
    narrative:
      'Dreamsea is a voice-first dream journal with multimodal generation and philosophy-specific interpretation. It solves the fragile morning-capture problem: vivid dreams disappear when recall requires typing, full attention, or later reconstruction, so the app lets users preserve the dream quickly by voice and then gives it a reflective interpretive framework.',
  },
  '24Seven Concierge': {
    screen: conciergeHomepageScreenUrl,
    narrative:
      '24Seven Concierge is a catalog-grounded travel concierge that plans across Shopify inventory and hands off to a human agent. It solves the luxury discovery-to-booking gap: clients had to browse disconnected inventory and then restart with a concierge, so the app connects intent, catalog discovery, itinerary structure, and human fulfilment.',
  },
};

export function ProjectCaseStudyRow({
  entry,
  groupLabel,
  index,
  onOpen,
}: {
  entry: CaseStudyEntry;
  groupLabel: string;
  index: number;
  onOpen: (item: CaseStudyEntry) => void;
}) {
  const proofChip = entry.chips.find((chip) => /proof|public|live|asset/i.test(chip.label)) ?? entry.chips[0];
  const structureLabels = entry.structure.slice(0, 3).map((detail) => detail.label);

  return (
    <motion.button
      type="button"
      key={entry.id}
      onClick={() => onOpen(entry)}
      className="group relative w-full overflow-hidden rounded-[30px] border border-white/20 bg-white/[0.24] p-3 text-left shadow-[0_12px_44px_rgba(45,72,105,0.09)] transition duration-300 hover:-translate-y-0.5 hover:border-white/55 hover:bg-white/[0.34] hover:shadow-[0_20px_70px_rgba(45,72,105,0.16)] sm:rounded-[34px] lg:rounded-full"
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay: Math.min(index * 0.04, 0.2) }}
      viewport={{ once: true, margin: '-80px' }}
    >
      <span className="accent-gradient absolute inset-x-8 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="grid gap-4 lg:grid-cols-[7.5rem_11rem_minmax(0,1fr)_minmax(15rem,0.42fr)_auto] lg:items-center">
        <div className="flex items-center justify-between gap-3 sm:block">
          <span className="font-display text-3xl italic leading-none text-text-primary/70 md:text-4xl">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="rounded-full bg-white/45 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.16em] text-muted sm:mt-3 sm:inline-flex">
            {groupLabel}
          </span>
        </div>

        <div className="relative h-28 overflow-hidden rounded-[24px] bg-white/25 sm:order-none sm:h-24 sm:rounded-full lg:h-24">
          {entry.heroImage ? (
            <img
              src={entry.heroImage}
              alt=""
              loading="lazy"
              decoding="async"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,rgba(255,255,255,0.75),rgba(137,170,204,0.38)_42%,rgba(38,57,86,0.58)_100%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-bg/12 via-transparent to-bg/20" />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted">{entry.eyebrow}</p>
            <span className="h-1 w-1 rounded-full bg-muted/60" />
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted/80">
              {entry.status}
            </p>
          </div>
          <h3 className="mt-2 text-3xl font-semibold leading-none tracking-[-0.045em] text-text-primary md:text-4xl">
            {entry.title}
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{entry.summary}</p>
        </div>

        <div className="hidden min-w-0 lg:block">
          <p className="text-[0.62rem] uppercase tracking-[0.18em] text-muted">Proof shape</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {structureLabels.map((label) => (
              <span key={`${entry.id}-${label}`} className="rounded-full bg-white/35 px-3 py-1.5 text-xs text-muted">
                {label}
              </span>
            ))}
            {proofChip ? (
              <span className="rounded-full bg-white/55 px-3 py-1.5 text-xs text-text-primary">
                {proofChip.label}
              </span>
            ) : null}
          </div>
        </div>

        <span className="inline-flex items-center justify-center rounded-full bg-white/70 px-5 py-3 text-sm text-text-primary transition duration-300 group-hover:bg-text-primary group-hover:text-bg">
          Open reader
        </span>
      </div>
    </motion.button>
  );
}


export function CaseStudyOverlay({ item, onClose }: { item: CaseStudyEntry; onClose: () => void }) {
  const mobilePresentation = mobileDeepDivePresentation[item.title];

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

  return (
    <motion.div
      className="fixed inset-0 z-[100] overflow-y-auto px-3 py-3 text-text-primary sm:px-5 sm:py-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <button
        type="button"
        aria-label="Close case study backdrop"
        className="absolute inset-0 bg-bg/20 backdrop-blur-[3px]"
        onClick={onClose}
      />

      <motion.article className="relative mx-auto grid min-h-[calc(100svh-1.5rem)] max-w-[1320px] gap-4 lg:h-[calc(100svh-2.5rem)] lg:min-h-0 lg:grid-cols-[0.9fr_1.1fr] lg:overflow-hidden">
        {mobilePresentation ? (
          <aside className="deep-dive-support-rail project-deep-dive-scroll liquid-glass-strong flex min-h-[56vh] flex-col overflow-hidden rounded-[2rem] lg:h-full lg:min-h-0 lg:overflow-y-auto">
            <div className="relative min-h-[34rem] shrink-0 overflow-hidden rounded-[2rem] border border-white/12 bg-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-[#6e8bff]/20 backdrop-blur-2xl sm:min-h-[40rem] lg:min-h-[68vh]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(110,139,255,0.22),transparent_62%)]" />
              <div className="pointer-events-none absolute left-7 top-7 z-10 max-w-[85%] md:left-8 md:top-8">
                <p className="text-xs uppercase tracking-[0.28em] text-muted">{item.eyebrow}</p>
                <h2 className="mt-4 max-w-[8.5ch] font-body text-[clamp(4.2rem,8vw,7.2rem)] font-semibold leading-[0.88] tracking-[-0.06em] text-text-primary">
                  {item.title}
                </h2>
              </div>
              <div className="absolute inset-0 z-20 flex items-center justify-center px-4 py-4 sm:px-8 lg:px-3">
                <div className="h-[96%] max-h-[36rem] min-h-[29rem] aspect-[0.47] sm:max-h-[41rem] lg:max-h-[64vh]">
                  <IPhone3D
                    screenSrc={mobilePresentation.screen}
                    poster={mobilePresentation.screen}
                    ariaLabel={`${item.title} shown on a rotating 3D iPhone`}
                  />
                </div>
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#08111d]/55" />
            </div>

            <div className="shrink-0 p-6 md:p-8">
              <div className="liquid-glass rounded-[1.5rem] p-5 md:p-6">
                <p className="text-xs uppercase tracking-[0.22em] text-muted">Product narrative</p>
                <p className="mt-4 text-sm leading-7 text-text-primary md:text-base">{mobilePresentation.narrative}</p>
              </div>
            </div>
          </aside>
        ) : (
          <aside className="deep-dive-support-rail project-deep-dive-scroll liquid-glass-strong flex min-h-[56vh] flex-col overflow-hidden rounded-[2rem] lg:h-full lg:min-h-0 lg:overflow-y-auto">
            <div className="relative min-h-[280px] flex-1 bg-[radial-gradient(circle_at_30%_18%,rgba(255,255,255,0.78),rgba(187,210,230,0.45)_38%,rgba(77,106,136,0.55)_100%)]">
              {item.heroImage ? (
                <img
                  src={item.heroImage}
                  alt={item.title}
                  decoding="async"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_20%,rgba(255,255,255,0.86),rgba(137,170,204,0.38)_42%,rgba(31,49,78,0.68)_100%)]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <p className="text-xs uppercase tracking-[0.28em] text-muted">{item.eyebrow}</p>
                <h2 className="mt-4 font-body text-5xl font-semibold tracking-[-0.04em] text-text-primary md:text-7xl">
                  {item.title}
                </h2>
                <p className="mt-5 max-w-xl text-sm leading-7 text-muted md:text-base">{item.summary}</p>
              </div>
            </div>

            <div className="grid shrink-0 gap-3 p-6 md:grid-cols-3 md:p-8 lg:grid-cols-1 xl:grid-cols-3">
              {item.chips.map((chip) => (
                <div key={`${chip.label}-${chip.value}`} className="liquid-glass rounded-[1.35rem] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">{chip.label}</p>
                    {chip.sourceStatus ? (
                      <span className="text-[0.58rem] uppercase tracking-[0.16em] text-muted/80">
                        {formatSourceStatus(chip.sourceStatus)}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-text-primary">{chip.value}</p>
                </div>
              ))}
            </div>

            <div className="grid shrink-0 gap-4 px-6 pb-6 md:px-8 md:pb-8">
              <div className="liquid-glass rounded-[1.5rem] p-5 md:p-6">
                <p className="text-xs uppercase tracking-[0.22em] text-muted">Structure</p>
                <div className="mt-5 grid gap-3">
                  {item.structure.map((detail) => (
                    <div key={`${detail.label}-${detail.value}`} className="flex gap-3 rounded-2xl bg-white/35 p-3">
                      <span className="shrink-0 rounded-full bg-white/45 px-3 py-1 text-[0.62rem] uppercase tracking-[0.16em] text-muted">
                        {detail.label}
                      </span>
                      <p className="text-sm leading-6 text-text-primary">{detail.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="liquid-glass rounded-[1.5rem] p-5 md:p-6">
                <p className="text-xs uppercase tracking-[0.22em] text-muted">Evidence</p>
                <div className="mt-5 grid gap-3">
                  <div className="rounded-2xl bg-white/35 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">Status</p>
                    <p className="mt-2 text-sm leading-6 text-text-primary">
                      {item.status} / {formatSourceStatus(item.sourceStatus)}
                    </p>
                  </div>

                  {item.links.length ? (
                    <div className="rounded-2xl bg-white/35 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">Source links</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.links.map((link) => (
                          <a
                            key={`${item.id}-${link.href}`}
                            href={link.href}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full bg-white/45 px-3 py-1.5 text-xs text-text-primary transition duration-300 hover:bg-white/75"
                          >
                            {link.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {item.assetSlots.length ? (
                    <div className="rounded-2xl bg-white/35 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">Next assets</p>
                      <div className="mt-3 grid gap-3">
                        {item.assetSlots.map((slot) => (
                          <div key={`${item.id}-${slot.label}`}>
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-medium text-text-primary">{slot.label}</p>
                              {slot.sourceStatus ? (
                                <span className="text-[0.58rem] uppercase tracking-[0.16em] text-muted/80">
                                  {formatSourceStatus(slot.sourceStatus)}
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-1 text-sm leading-6 text-muted">{slot.note}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </aside>
        )}

        <div className="liquid-glass-strong flex flex-col rounded-[2rem] p-6 md:p-8 lg:min-h-0 lg:overflow-hidden">
          <div className="flex shrink-0 items-start justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">{item.typeLabel}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.22em] text-muted">
                {item.readTime} / {item.year}
              </p>
            </div>
            <button
              type="button"
              aria-label="Close case study"
              onClick={onClose}
              className="liquid-glass-control rounded-full px-5 py-3 text-sm text-text-primary transition-transform duration-300 hover:scale-105"
            >
              Close
            </button>
          </div>

          <div className="project-deep-dive-scroll mt-8 pr-1 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-4">
            <div className="grid gap-5">
              {item.sections.map((section, index) => (
                <section key={`${item.id}-${section.label}`} className="liquid-glass rounded-[1.5rem] p-5 md:p-6">
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

          </div>
        </div>
      </motion.article>
    </motion.div>
  );
}
