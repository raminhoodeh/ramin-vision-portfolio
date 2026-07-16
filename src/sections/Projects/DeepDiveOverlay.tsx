import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  type DeepDiveItem,
  type AssetSlotItem,
  type CaseStudyEntry,
} from '../types';
import {
  caseStudyByDeepDiveSlug,
} from './types';
import { formatSourceStatus } from '../../lib/text';

function AssetSlotCard({ slot }: { slot: AssetSlotItem }) {
  return (
    <div className="liquid-glass rounded-[1.35rem] p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-text-primary">{slot.label}</p>
        <span className="shrink-0 text-[0.62rem] uppercase tracking-[0.18em] text-muted">
          {formatSourceStatus(slot.sourceStatus)}
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted">{slot.note}</p>
    </div>
  );
}


const thesisStackLayers = [
  {
    name: 'Model',
    role: 'Capability',
    detail: 'GPT, Claude, Gemini: the rented intelligence layer that changes fastest.',
  },
  {
    name: 'Context',
    role: 'Defensibility',
    detail: 'Product truth, users, strategy, memory, retrieval, voice, and constraints.',
  },
  {
    name: 'Orchestration',
    role: 'Motion',
    detail: 'Agents, tools, MCPs, jobs, routing, and the workflow around the model.',
  },
  {
    name: 'Governance',
    role: 'Trust',
    detail: 'Evals, guardrails, refusal, observability, fallbacks, audit, and cost control.',
  },
  {
    name: 'Human',
    role: 'Judgement',
    detail: 'Vision, empathy, taste, communication, accountability, and decision quality.',
  },
] as const;

const thesisLoopSteps = [
  { name: 'Talk', layer: 'Human + Context', detail: 'Turn ambiguity into useful context.' },
  { name: 'Decide', layer: 'Human + Governance', detail: 'Set the standard for what good means.' },
  { name: 'Build', layer: 'Model + Orchestration', detail: 'Move from direction to working artifact.' },
  { name: 'Observe', layer: 'Governance', detail: 'Measure behaviour against the eval bar.' },
  { name: 'Iterate', layer: 'All five layers', detail: 'Feed evidence back into the system.' },
] as const;

const governanceItems = ['Evals', 'Guardrails', 'Refusal', 'Cost controls', 'Human review'] as const;

const thesisConsequences = [
  {
    name: 'One',
    force: "You can't prompt-and-hope. You have to understand the model and load your context.",
    layer: 'Model + Context',
  },
  {
    name: 'Two',
    force: 'Probabilistic systems need loops, not straight lines.',
    layer: 'Orchestration',
  },
  {
    name: 'Three',
    force: 'Probabilistic systems need guardrails and evals, not hope.',
    layer: 'Governance',
  },
  {
    name: 'Four',
    force: 'Probabilistic systems change what being a professional means.',
    layer: 'Human',
  },
] as const;

const thesisTradeoffs = [
  {
    name: 'Speed over exhaustive documentation',
    detail: 'A clickable prototype on day three can beat a thirty-page PRD on day thirty when the material is probabilistic.',
  },
  {
    name: 'Loops over stage-gates',
    detail: 'Replace only what is broken or too slow; keep old safeguards until the new muscles are stable.',
  },
  {
    name: 'Measurement discipline over vibes',
    detail: 'Ship what you can measure. Hold what you cannot.',
  },
  {
    name: 'Human judgment is not delegatable',
    detail: 'When execution is cheap, the scarce resource is taste.',
  },
] as const;

const thesisImprovementGaps = [
  {
    name: 'Governance layer',
    detail: 'Most teams under-install evals, guardrails, observability, fallbacks, and cost controls.',
  },
  {
    name: 'Human layer',
    detail: 'Vision, empathy, taste, communication, and judgment need reps the OS cannot automate.',
  },
  {
    name: 'Eval coverage',
    detail: 'The target is a living suite where every bug seen in the wild becomes a permanent test case.',
  },
] as const;

const thesisInstallRules = [
  'Build something small this week.',
  'Never confuse a model update with a stack change.',
  'The model is rented. Your context is owned.',
  'You are not the builder. You are the conductor.',
  'Ship what you can measure. Hold what you cannot.',
  'You are the Context Layer.',
] as const;

function StackDiagramCard() {
  return (
    <div className="liquid-glass-strong shrink-0 rounded-[2rem] p-6 md:p-7">
      <p className="text-xs uppercase tracking-[0.24em] text-muted">5-Layer Stack</p>
      <div className="mt-6 grid gap-2">
        {thesisStackLayers.map((layer, index) => (
          <div key={layer.name} className="liquid-glass rounded-[1.25rem] px-4 py-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-text-primary">{layer.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">{layer.role}</p>
              </div>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/40 text-xs text-text-primary">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">{layer.detail}</p>
          </div>
        ))}
      </div>
      <p className="mt-5 rounded-2xl bg-white/35 px-4 py-3 font-display text-xl italic leading-7 text-text-primary">
        Model is capability. Context is defensibility.
      </p>
    </div>
  );
}

function LoopDiagramCard() {
  return (
    <div className="liquid-glass shrink-0 rounded-[2rem] p-6 md:p-7">
      <p className="text-xs uppercase tracking-[0.24em] text-muted">AI-Native Loop</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-5 lg:grid-cols-1 xl:grid-cols-5">
        {thesisLoopSteps.map((step, index) => (
          <div key={step.name} className="relative liquid-glass rounded-[1.35rem] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-text-primary">{step.name}</p>
              <span className="text-[0.62rem] uppercase tracking-[0.18em] text-muted">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted">{step.layer}</p>
            <p className="mt-3 text-sm leading-6 text-muted">{step.detail}</p>
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm leading-6 text-text-primary">
        Measured in hours, not quarters. Fast work still needs a standard.
      </p>
    </div>
  );
}

function TradeoffsCard() {
  return (
    <div className="liquid-glass shrink-0 rounded-[2rem] p-6 md:p-7">
      <p className="text-xs uppercase tracking-[0.24em] text-muted">Tradeoffs</p>
      <div className="mt-5 grid gap-3">
        {thesisTradeoffs.map((item, index) => (
          <div key={item.name} className="rounded-2xl bg-white/35 p-4">
            <div className="flex items-start gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/45 text-[0.68rem] text-text-primary">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-semibold leading-5 text-text-primary">{item.name}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{item.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConsequencesCard() {
  return (
    <div className="liquid-glass shrink-0 rounded-[2rem] p-6 md:p-7">
      <p className="text-xs uppercase tracking-[0.24em] text-muted">Why This Approach</p>
      <h4 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-text-primary">
        Four consequences, one property
      </h4>
      <div className="mt-5 grid gap-3">
        {thesisConsequences.map((item) => (
          <div key={item.name} className="rounded-2xl bg-white/35 p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">{item.name}</p>
              <span className="rounded-full bg-white/45 px-3 py-1 text-[0.62rem] uppercase tracking-[0.14em] text-muted">
                {item.layer}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-text-primary">{item.force}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImprovementGapsCard() {
  return (
    <div className="liquid-glass shrink-0 rounded-[2rem] p-6 md:p-7">
      <p className="text-xs uppercase tracking-[0.24em] text-muted">What I Would Improve</p>
      <div className="mt-5 grid gap-3">
        {thesisImprovementGaps.map((item) => (
          <div key={item.name} className="rounded-2xl bg-white/35 p-4">
            <p className="text-sm font-semibold text-text-primary">{item.name}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{item.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DefensibilityCard() {
  return (
    <div className="liquid-glass shrink-0 rounded-[2rem] p-6 md:p-7">
      <p className="text-xs uppercase tracking-[0.24em] text-muted">Core Rule</p>
      <p className="mt-5 font-display text-4xl italic leading-none tracking-[-0.04em] text-text-primary md:text-5xl">
        The model is rented.
      </p>
      <p className="mt-2 font-body text-3xl font-semibold leading-none tracking-[-0.04em] text-text-primary md:text-4xl">
        Your context is owned.
      </p>
      <p className="mt-5 text-sm leading-7 text-muted">
        Durable AI products compound around proprietary context, workflows, constraints, trust, and taste.
      </p>
    </div>
  );
}

function GovernanceCard() {
  return (
    <div className="liquid-glass shrink-0 rounded-[2rem] p-6 md:p-7">
      <p className="text-xs uppercase tracking-[0.24em] text-muted">Governance</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {governanceItems.map((item) => (
          <span key={item} className="rounded-full bg-white/45 px-4 py-2 text-xs text-text-primary">
            {item}
          </span>
        ))}
      </div>
      <p className="mt-5 text-sm leading-7 text-muted">
        Governance is designed into the product from day one, before the system touches real users.
      </p>
    </div>
  );
}

function ThesisRulesCard() {
  return (
    <div className="liquid-glass shrink-0 rounded-[2rem] p-6 md:p-7">
      <p className="text-xs uppercase tracking-[0.24em] text-muted">How To Implement</p>
      <h4 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-text-primary">
        Six install rules
      </h4>
      <div className="mt-5 grid gap-3">
        {thesisInstallRules.map((rule, index) => (
          <div key={rule} className="flex gap-3 rounded-2xl bg-white/35 p-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/45 text-[0.68rem] text-text-primary">
              {index + 1}
            </span>
            <p className="text-sm leading-6 text-text-primary">{rule}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ThesisDeepDiveReader({
  item,
  onClose,
  sectionRefs,
  onJump,
}: {
  item: DeepDiveItem;
  onClose: () => void;
  sectionRefs: MutableRefObject<Array<HTMLElement | null>>;
  onJump: (index: number) => void;
}) {
  return (
    <>
      <div className="portfolio-deep-dive-reader-panel liquid-glass-strong flex min-h-[78vh] flex-col rounded-[2rem] p-6 md:p-8 lg:h-full lg:min-h-0 lg:overflow-hidden lg:p-10">
        <div className="portfolio-deep-dive-header flex shrink-0 items-center justify-between gap-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">{item.eyebrow}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.22em] text-muted">
              {item.readTime} / {item.year}
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

        <div className="project-deep-dive-scroll mt-9 pr-1 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-4">
          <p className="text-xs uppercase tracking-[0.24em] text-muted">Identity, Bio & AI PM Thesis</p>
          <h2 className="mt-5 max-w-3xl font-body text-5xl font-semibold tracking-[-0.045em] text-text-primary md:text-7xl">
            AI-Native <span className="font-display italic font-normal">Product OS</span>
          </h2>
          <p className="mt-7 max-w-3xl text-base leading-8 text-muted md:text-lg">{item.dek}</p>

          <div className="mt-8 rounded-[1.75rem] bg-white/30 p-5 md:p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">Operating Definition</p>
            <p className="mt-4 text-sm leading-7 text-text-primary md:text-base">
              An AI Product Manager uses AI to research, design, and build AI-native features every single day.
              They architect trust, cost efficiency, defensibility, context, governance, and orchestration into
              production systems from the beginning.
            </p>
          </div>

          <div className="mt-12 space-y-12 pb-8">
            {item.sections.map((section, index) => {
              const [sectionType, sectionTitle] = section.heading.includes(' - ')
                ? section.heading.split(' - ')
                : ['Thesis', section.heading];

              return (
                <section
                  key={section.heading}
                  ref={(element) => {
                    sectionRefs.current[index] = element;
                  }}
                  className="scroll-mt-8 border-t border-stroke/70 pt-10 first:border-t-0 first:pt-0"
                >
                  <p className="text-xs uppercase tracking-[0.24em] text-muted">
                    {String(index + 1).padStart(2, '0')} / {sectionType}
                  </p>
                  <h3 className="mt-3 max-w-2xl font-body text-3xl font-semibold tracking-[-0.035em] text-text-primary md:text-5xl">
                    {sectionTitle}
                  </h3>
                  <div className="mt-6 space-y-5">
                    {section.body.map((paragraph) => (
                      <p key={paragraph} className="text-sm leading-7 text-muted md:text-base md:leading-8">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>

      <aside className="deep-dive-support-rail project-deep-dive-scroll flex flex-col gap-4 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-1">
        <div className="liquid-glass-strong shrink-0 rounded-[2rem] p-6 md:p-7">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted">Reading Map</p>
              <h3 className="mt-4 font-body text-3xl font-semibold tracking-[-0.04em] text-text-primary">
                {item.status}
              </h3>
            </div>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/45 font-display italic text-text-primary">
              OS
            </span>
          </div>

          <div className="mt-7 grid gap-2">
            {item.index.map((label, index) => (
              <button
                type="button"
                key={label}
                onClick={() => onJump(index)}
                className="liquid-glass flex items-center justify-between rounded-full px-4 py-3 text-left text-sm text-muted transition-transform duration-300 hover:scale-[1.02] hover:text-text-primary"
              >
                <span>{label}</span>
                <span>{String(index + 1).padStart(2, '0')}</span>
              </button>
            ))}
          </div>
        </div>

        <StackDiagramCard />
        <LoopDiagramCard />
        <ConsequencesCard />
        <TradeoffsCard />
        <ThesisRulesCard />
        <ImprovementGapsCard />
        <DefensibilityCard />
        <GovernanceCard />

        <div className="grid shrink-0 gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {item.metadata.map((card) => (
            <div key={card.label} className="liquid-glass rounded-[1.5rem] p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">{card.label}</p>
              <p className="mt-4 text-sm leading-7 text-text-primary">{card.value}</p>
            </div>
          ))}
        </div>

        {item.proofChips.length ? (
          <div className="liquid-glass rounded-[2rem] p-6 md:p-7">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">Proof Chips</p>
            <div className="mt-5 grid gap-3">
              {item.proofChips.map((chip) => (
                <div key={`${chip.label}-${chip.value}`} className="border-b border-stroke/70 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-medium text-text-primary">{chip.label}</p>
                    <span className="shrink-0 text-[0.62rem] uppercase tracking-[0.18em] text-muted">
                      {formatSourceStatus(chip.sourceStatus)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">{chip.value}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {item.sourceLinks.length ? (
          <div className="liquid-glass rounded-[2rem] p-6 md:p-7">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">Source Links</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {item.sourceLinks.map((source) => (
                <a
                  key={source.href}
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-white/45 px-4 py-2 text-xs text-text-primary transition duration-300 hover:bg-white/75"
                >
                  {source.label}
                </a>
              ))}
            </div>
          </div>
        ) : null}

        {item.assetSlots.length ? (
          <div className="liquid-glass rounded-[2rem] p-6 md:p-7">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">Asset Slots</p>
            <div className="mt-5 grid gap-3">
              {item.assetSlots.map((slot) => (
                <AssetSlotCard key={slot.label} slot={slot} />
              ))}
            </div>
          </div>
        ) : null}

        <div className="liquid-glass mt-auto rounded-[2rem] p-6 md:p-7">
          <p className="text-xs uppercase tracking-[0.24em] text-muted">Related lenses</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {item.related.map((related) => (
              <span key={related} className="rounded-full bg-white/45 px-4 py-2 text-xs text-text-primary">
                {related}
              </span>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}

export function DeepDiveOverlay({ item, onClose }: { item: DeepDiveItem; onClose: () => void }) {
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const isThesis = item.slug === 'ai-native-product-os';

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

  const handleJump = (index: number) => {
    sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
        aria-label="Close deep dive"
        className="portfolio-deep-dive-backdrop absolute inset-0 bg-bg/20 backdrop-blur-[3px]"
        onClick={onClose}
      />

      <motion.article
        layoutId={`deep-dive-${item.slug}`}
        className={`portfolio-deep-dive-shell relative mx-auto min-h-[calc(100svh-1.5rem)] max-w-[1320px] gap-4 lg:h-[calc(100svh-2.5rem)] lg:min-h-0 lg:overflow-hidden ${
          isThesis ? 'grid lg:grid-cols-[52fr_48fr]' : 'flex flex-col lg:flex-row'
        }`}
      >
        {isThesis ? (
          <ThesisDeepDiveReader item={item} onClose={onClose} sectionRefs={sectionRefs} onJump={handleJump} />
        ) : (
          <>
            <div className="portfolio-deep-dive-reader-panel liquid-glass-strong flex min-h-[70vh] flex-col rounded-[2rem] p-6 md:p-8 lg:h-full lg:min-h-0 lg:w-[58%] lg:overflow-hidden lg:p-10">
              <div className="portfolio-deep-dive-header flex shrink-0 items-center justify-between gap-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted">{item.eyebrow}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.22em] text-muted">
                    {item.readTime} / {item.year}
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

              <div className="project-deep-dive-scroll mt-12 pr-1 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-4">
                <h2 className="max-w-2xl font-body text-5xl font-semibold tracking-[-0.04em] text-text-primary md:text-7xl">
                  {item.title}
                </h2>
                <p className="mt-7 max-w-2xl text-base leading-8 text-muted md:text-lg">{item.dek}</p>

                <div className="mt-12 space-y-12 pb-8">
                  {item.sections.map((section, index) => (
                    <section
                      key={section.heading}
                      ref={(element) => {
                        sectionRefs.current[index] = element;
                      }}
                      className="scroll-mt-8"
                    >
                      <p className="text-xs uppercase tracking-[0.24em] text-muted">
                        {String(index + 1).padStart(2, '0')}
                      </p>
                      <h3 className="mt-3 font-body text-3xl font-semibold tracking-[-0.03em] text-text-primary md:text-4xl">
                        {section.heading}
                      </h3>
                      <div className="mt-5 space-y-5">
                        {section.body.map((paragraph) => (
                          <p key={paragraph} className="text-sm leading-7 text-muted md:text-base md:leading-8">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            </div>

            <aside className="deep-dive-support-rail project-deep-dive-scroll flex flex-col gap-4 lg:h-full lg:min-h-0 lg:w-[42%] lg:overflow-y-auto lg:pr-1">
              <div className="liquid-glass-strong rounded-[2rem] p-6 md:p-7">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-muted">Reading Map</p>
                    <h3 className="mt-4 font-body text-3xl font-semibold tracking-[-0.04em] text-text-primary">
                      {item.status}
                    </h3>
                  </div>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/45 font-display italic text-text-primary">
                    RH
                  </span>
                </div>

                <div className="mt-7 grid gap-2">
                  {item.index.map((label, index) => (
                    <button
                      type="button"
                      key={label}
                      onClick={() => handleJump(index)}
                      className="liquid-glass flex items-center justify-between rounded-full px-4 py-3 text-left text-sm text-muted transition-transform duration-300 hover:scale-[1.02] hover:text-text-primary"
                    >
                      <span>{label}</span>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {item.metadata.map((card) => (
                  <div key={card.label} className="liquid-glass rounded-[1.5rem] p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-muted">{card.label}</p>
                    <p className="mt-4 text-sm leading-7 text-text-primary">{card.value}</p>
                  </div>
                ))}
              </div>

              {item.proofChips.length ? (
                <div className="liquid-glass rounded-[2rem] p-6 md:p-7">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted">Proof Chips</p>
                  <div className="mt-5 grid gap-3">
                    {item.proofChips.map((chip) => (
                      <div key={`${chip.label}-${chip.value}`} className="border-b border-stroke/70 pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-sm font-medium text-text-primary">{chip.label}</p>
                          <span className="shrink-0 text-[0.62rem] uppercase tracking-[0.18em] text-muted">
                            {formatSourceStatus(chip.sourceStatus)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted">{chip.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {item.sourceLinks.length ? (
                <div className="liquid-glass rounded-[2rem] p-6 md:p-7">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted">Source Links</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {item.sourceLinks.map((source) => (
                      <a
                        key={source.href}
                        href={source.href}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-white/45 px-4 py-2 text-xs text-text-primary transition duration-300 hover:bg-white/75"
                      >
                        {source.label}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              {item.assetSlots.length ? (
                <div className="liquid-glass rounded-[2rem] p-6 md:p-7">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted">Asset Slots</p>
                  <div className="mt-5 grid gap-3">
                    {item.assetSlots.map((slot) => (
                      <AssetSlotCard key={slot.label} slot={slot} />
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="liquid-glass mt-auto rounded-[2rem] p-6 md:p-7">
                <p className="text-xs uppercase tracking-[0.24em] text-muted">Related lenses</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {item.related.map((related) => (
                    <span key={related} className="rounded-full bg-white/45 px-4 py-2 text-xs text-text-primary">
                      {related}
                    </span>
                  ))}
                </div>
              </div>
            </aside>
          </>
        )}
      </motion.article>
    </motion.div>
  );
}
