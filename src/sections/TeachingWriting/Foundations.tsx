import { motion } from 'framer-motion';
import { portfolioContent } from '../../data/portfolio';
import { type ThoughtFoundationEntry } from '../types';
import { thoughtFormatNavGroups } from '../Projects/types';
import { scrollToId } from '../../lib/scroll';

function FoundationSequence({ foundation }: { foundation: ThoughtFoundationEntry }) {
  return (
    <ol className="thought-foundation-sequence" aria-label={`${foundation.title} sequence`}>
      {foundation.sequence.map((step, index) => (
        <li key={`${foundation.id}-${step.label}`}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <strong>{step.label}</strong>
          <p>{step.detail}</p>
        </li>
      ))}
    </ol>
  );
}

function ThoughtFoundationCard({ foundation }: { foundation: ThoughtFoundationEntry }) {
  return (
    <motion.article
      className="thought-foundation-card"
      data-foundation={foundation.id}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="thought-foundation-card-head">
        <span>{foundation.index}</span>
        <p>{foundation.role}</p>
      </div>

      <div className="thought-foundation-card-copy">
        <p className="thought-foundation-source">{foundation.sourceLabel}</p>
        <h4>{foundation.title}</h4>
        <p>{foundation.thesis}</p>
      </div>

      <FoundationSequence foundation={foundation} />

      {'stack' in foundation ? (
        <div className="thought-foundation-stack" aria-label="AI-Native Product OS stack">
          {foundation.stack.map((layer) => (
            <span key={`${foundation.id}-${layer}`}>{layer}</span>
          ))}
        </div>
      ) : null}

      <p className="thought-foundation-application">{foundation.application}</p>
    </motion.article>
  );
}

function ThoughtClarityMotif() {
  const motif = portfolioContent.teachingSpeakingWriting.foundations.clarityMotif;

  return (
    <motion.article
      className="thought-clarity-motif"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="thought-clarity-quote-panel">
        <p>{motif.eyebrow}</p>
        <blockquote>"{motif.quote}"</blockquote>
        <span>{motif.source}</span>
      </div>

      <div className="thought-clarity-copy">
        <h4>{motif.title}</h4>
        <p>{motif.body}</p>
        <p>{motif.bridge}</p>
        <div className="thought-clarity-principles">
          {motif.principles.map((principle) => (
            <div key={principle.label}>
              <span>{principle.label}</span>
              <p>{principle.body}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

function ThoughtLifeApproachBridge() {
  const bridge = portfolioContent.teachingSpeakingWriting.foundations.metaphysicsBridge;

  return (
    <motion.article
      className="thought-life-bridge"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="thought-life-bridge-main">
        <p>{bridge.eyebrow}</p>
        <h4>{bridge.title}</h4>
        <blockquote>"{bridge.quote}"</blockquote>
        <span>{bridge.body}</span>
      </div>

      <div className="thought-life-bridge-points">
        {bridge.points.map((point) => (
          <div key={point.label} className="thought-life-bridge-point">
            <span>{point.label}</span>
            <p>{point.body}</p>
          </div>
        ))}
      </div>
    </motion.article>
  );
}

function ThoughtValuesConclusion() {
  const conclusion = portfolioContent.teachingSpeakingWriting.foundations.valuesConclusion;

  return (
    <motion.article
      className="thought-values-conclusion"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="thought-values-conclusion-copy">
        <p>{conclusion.eyebrow}</p>
        <h4>{conclusion.title}</h4>
        <span>{conclusion.body}</span>
      </div>

      <div className="thought-values-ladder">
        {conclusion.ladder.map((step, index) => (
          <div key={step.label}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{step.label}</strong>
            <p>{step.body}</p>
          </div>
        ))}
      </div>
    </motion.article>
  );
}

function ThoughtFoundationModule({ foundation }: { foundation: ThoughtFoundationEntry }) {
  return (
    <details className="thought-foundation-module">
      <summary>
        <span>{foundation.index}</span>
        <strong>{foundation.title}</strong>
        <em>{foundation.role}</em>
      </summary>
      <div>
        <p>{foundation.thesis}</p>
        <FoundationSequence foundation={foundation} />
        <p>{foundation.application}</p>
      </div>
    </details>
  );
}

function ThoughtStratetree({ stratetree }: { stratetree: typeof portfolioContent.teachingSpeakingWriting.foundations.stratetree }) {
  const levels = [...stratetree.levels].reverse();

  return (
    <motion.article
      className="thought-stratetree"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-90px' }}
      transition={{ duration: 0.68, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="thought-stratetree-copy">
        <p>{stratetree.eyebrow}</p>
        <h4>{stratetree.title}</h4>
        <span>{stratetree.body}</span>
        <blockquote>{stratetree.bridge}</blockquote>
      </div>

      <div className="thought-stratetree-visual" aria-label="Metacognitive Stratetree">
        <div className="thought-stratetree-flower" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <ol>
          {levels.map((level) => (
            <li
              key={level.index}
              data-stratetree-level={level.index}
              aria-label={`${level.index}. ${level.label}. ${level.metaphor}. ${level.body}`}
            >
              <span>{level.index}</span>
              <div>
                <strong>{level.label}</strong>
                <em>{level.metaphor}</em>
                <p>{level.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </motion.article>
  );
}

export function ThoughtFoundationsSection() {
  const foundations = portfolioContent.teachingSpeakingWriting.foundations;
  const lifeFoundations = foundations.foundations.filter((foundation) => foundation.id !== 'ai-native-product-os');
  const motif = foundations.clarityMotif;

  return (
    <section id="thoughts-foundations" className="thought-format-section thought-foundations">
      <div className="thought-foundations-heading">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--thought-faint)]">Clarity</p>
          <h3 className="mt-4 text-5xl font-semibold tracking-[-0.065em] text-[color:var(--thought-strong)] md:text-7xl">
            {foundations.title}
          </h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--thought-muted)]">{foundations.intro}</p>
        </div>
      </div>

      <div className="thought-foundations-synthesis">
        <div className="thought-foundations-synthesis-copy">
          <h4>Metacognition is the method. Reality is the application.</h4>
          <p>
            Framework of Metacognition is the underlying way I structure thought: experience becomes values, values become vision, vision becomes strategy, and strategy becomes action. Framework of Reality applies that same method to life itself, so clarity becomes a question of where I am, what I am, what I can become, and what I should do.
          </p>
          <blockquote>"{motif.quote}"</blockquote>
          <p>
            That quote matters because noise is what prevents people from hearing their own values. Metaphysical wisdom becomes practical when it restores enough silence and structure for a person to know their why.
          </p>
          <p className="thought-foundations-synthesis-route">
            Framework of Metacognition is the method. Framework of Reality is the life application. Stratetree is the route from values into products.
          </p>
        </div>
      </div>

      <ThoughtStratetree stratetree={foundations.stratetree} />

      <div className="thought-foundation-modules" aria-label="Expand the underlying frameworks">
        {lifeFoundations.map((foundation) => (
          <ThoughtFoundationModule key={foundation.id} foundation={foundation} />
        ))}
      </div>
    </section>
  );
}

export function ThoughtQuoteThread() {
  const quoteThread = portfolioContent.teachingSpeakingWriting.frame.quoteThread;
  const formationQuoteSerif = 'You are shaped by what you create.';

  return (
    <section className="thought-format-section thought-quote-thread" aria-label="Thought quote thread">
      <div className="thought-quote-thread-heading">
        <div>
          <p>{quoteThread.eyebrow}</p>
          <h3>{quoteThread.title}</h3>
        </div>
        <span>{quoteThread.body}</span>
      </div>

      <div className="thought-quote-thread-grid">
        {quoteThread.items.map((item, index) => {
          const isFormationQuote = item.quote.includes(formationQuoteSerif);
          const formationQuoteLead = item.quote.replace(formationQuoteSerif, '').trim();

          return (
            <motion.article
              key={item.label}
              className="thought-quote-thread-card"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <p>{item.label}</p>
              </div>
              <blockquote className={isFormationQuote ? 'thought-formation-thread-quote' : undefined}>
                "
                {isFormationQuote ? (
                  <>
                    {formationQuoteLead}{' '}
                    <span className="thought-quote-thread-serif">{formationQuoteSerif}</span>
                  </>
                ) : (
                  item.quote
                )}
                "
              </blockquote>
              <footer>
                <strong>{item.source}</strong>
                <em>{item.role}</em>
              </footer>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

export function ThoughtEditorialHero() {
  const frame = portfolioContent.teachingSpeakingWriting.frame;
  const formationQuoteSerif = 'You are shaped by what you create.';
  const formationQuoteLead = frame.formationQuote.replace(formationQuoteSerif, '').trim();

  return (
    <div className="thoughts-hero relative isolate overflow-hidden px-5 pb-12 pt-24 sm:px-8 md:px-12 lg:px-16">
      <div className="thoughts-hero-scan absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="relative z-10 mx-auto grid min-h-[calc(100svh-8rem)] max-w-[1440px] content-between gap-12">
        <div>
          {/* Section label rendered globally via <SectionMarker> */}
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,0.64fr)_minmax(22rem,0.36fr)] xl:items-end">
          <div>
            <p className="max-w-xl text-sm uppercase leading-6 tracking-[0.24em] text-white/54">
              {frame.kicker}
            </p>
            <h2 className="thoughts-hero-title mt-6 font-semibold text-white">
              Thoughts
              <span className="thoughts-hero-title-serif">
                {frame.headline}
              </span>
            </h2>
            {frame.body ? (
              <p className="mt-8 max-w-2xl text-base leading-8 text-white/66 md:text-lg">
                {frame.body}
              </p>
            ) : null}
            <p className="thoughts-hero-bridge mt-8 max-w-2xl text-lg leading-8 text-white md:text-xl">
              {frame.heroBridge}
            </p>
          </div>

          <div className="thoughts-hero-panel rounded-[2rem] border border-white/12 bg-white/[0.055] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.24)] backdrop-blur-2xl md:p-6">
            <span className="thoughts-hero-belief-chip">My core belief</span>
            <blockquote className="thoughts-hero-quote text-2xl font-semibold leading-tight tracking-[-0.045em] text-white md:text-3xl">
            "{formationQuoteLead}{' '}
              <span className="thoughts-hero-quote-serif">{formationQuoteSerif}"</span>
            </blockquote>
          </div>
        </div>

        <nav className="thought-format-rail" aria-label="Thought journey">
          {thoughtFormatNavGroups.map((group) => (
            <div key={group.label} className="thought-format-rail-group">
              <div className="thought-format-rail-meta">
                <span>{group.index}</span>
                <strong>{group.label}</strong>
              </div>
              <div className="thought-format-rail-items">
                {group.items.map((item) => (
                  <button key={item.id} type="button" title={item.detail} onClick={() => scrollToId(item.id)}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
