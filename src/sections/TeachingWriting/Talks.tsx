import { motion } from 'framer-motion';
import { portfolioContent } from '../../data/portfolio';
import { type SpeakingEntry } from '../types';
import { isPlaceholderValue, contentValue } from '../../lib/placeholder';
import { ProjectLink } from '../Projects/index';

export type ThoughtFormatExpression = {
  eyebrow: string;
  title: string;
  body: string;
  links: readonly { label: string; body: string }[];
};

export function ThoughtExpressionPanel({
  expression,
  tone,
}: {
  expression: ThoughtFormatExpression;
  tone: 'talks' | 'books' | 'courses';
}) {
  return (
    <div className="thought-expression-panel" data-expression-tone={tone}>
      <div className="thought-expression-copy">
        <p>{expression.eyebrow}</p>
        <h4>{expression.title}</h4>
        <span>{expression.body}</span>
      </div>
      <div className="thought-expression-links">
        {expression.links.map((link) => (
          <div key={`${tone}-${link.label}`}>
            <span>{link.label}</span>
            <p>{link.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function getTalkTitle(entry: SpeakingEntry) {
  return 'displayTitle' in entry && typeof entry.displayTitle === 'string' ? entry.displayTitle : entry.talkTitle;
}

export function getTalkSourceLinks(entry: SpeakingEntry) {
  return 'sourceLinks' in entry ? entry.sourceLinks : [];
}

export function getTalkTags(entry: SpeakingEntry) {
  return 'tags' in entry ? entry.tags : [];
}

export function TalksStageVideoSlot({ entry, compact = false }: { entry: SpeakingEntry; compact?: boolean }) {
  const isPlaceholder = isPlaceholderValue(entry.youtubeEmbeddedLink);
  const media = 'media' in entry ? entry.media : undefined;

  return (
    <div className={`talks-stage-video ${compact ? 'is-compact' : ''}`}>
      <div className="talks-stage-video-frame">
        {media ? (
          <img
            className="talks-stage-video-image"
            src={media.path}
            alt={media.alt}
            loading="lazy"
            decoding="async"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
        ) : null}
        <div className="talks-stage-video-shade" aria-hidden="true" />
        <div className="talks-stage-video-grid" aria-hidden="true" />
        <div className="talks-stage-video-content">
          <p className="talks-stage-video-label">{compact ? 'Replay' : 'Replay slot'}</p>
          <p className="talks-stage-video-title">{getTalkTitle(entry)}</p>
          <p className="talks-stage-video-meta">
            {isPlaceholder ? contentValue(entry.youtubeEmbeddedLink) : entry.venue ?? entry.invitedBy}
          </p>
          <div className="mt-3">
            <ProjectLink label="YouTube / talk link" value={entry.youtubeEmbeddedLink} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TalksStage({ talks }: { talks: readonly SpeakingEntry[] }) {
  const tedxTalk =
    talks.find((talk) => getTalkTitle(talk).toLowerCase().includes('existentially viewing')) ?? talks[0];
  const talksFrame = portfolioContent.teachingSpeakingWriting.frame.formatIntros.talks;
  const valueStage = tedxTalk && 'valueStage' in tedxTalk ? tedxTalk.valueStage : null;

  return (
    <section id="thoughts-talks" className="thought-format-section talks-stage">
      <div className="talks-stage-heading">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--thought-faint)]">
            {valueStage?.eyebrow ?? 'What do I value?'}
          </p>
          <h3 className="mt-4 max-w-4xl text-5xl font-semibold tracking-[-0.065em] text-[color:var(--thought-strong)] md:text-7xl">
            {valueStage?.title ?? talksFrame.title}
          </h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--thought-muted)]">
            {valueStage?.thesis ?? talksFrame.body}
          </p>
        </div>
        <span className="rounded-full border border-[color:var(--thought-hairline)] bg-white/45 px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-[color:var(--thought-muted)]">
          TEDx Imperial
        </span>
      </div>

      {tedxTalk && valueStage ? (
        <motion.article
          className="talks-stage-synthesis"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <TalksStageVideoSlot entry={tedxTalk} />
          <div className="talks-stage-synthesis-copy">
            <h4>TEDx is where I make Framework of Reality felt.</h4>
            <p>{valueStage.bridge}</p>
            <p>{valueStage.outcome}</p>
            <div className="talks-stage-source-links">
              {getTalkSourceLinks(tedxTalk).map((link) => (
                <ProjectLink key={link.href} label={link.label} value={link.href} />
              ))}
            </div>

            <details className="talks-stage-detail">
              <summary>What the wider perspective clarifies</summary>
              <ol>
                {valueStage.valueLens.map((item, index) => (
                  <li key={item.label}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <strong>{item.label}</strong>
                    <p>{item.body}</p>
                  </li>
                ))}
              </ol>
            </details>

            <details className="talks-stage-detail">
              <summary>How the talk creates that shift</summary>
              <ol>
                {valueStage.method.map((step, index) => (
                  <li key={step.label}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <strong>{step.label}</strong>
                    <p>{step.body}</p>
                  </li>
                ))}
              </ol>
            </details>

            <blockquote className="talks-stage-synthesis-quote">"{talksFrame.quote}"</blockquote>
          </div>
        </motion.article>
      ) : null}
    </section>
  );
}

export function IntegrationStage({ talks }: { talks: readonly SpeakingEntry[] }) {
  const integrationTalk =
    talks.find((talk) => 'integrationStage' in talk) ??
    talks.find((talk) => getTalkTitle(talk).toLowerCase().includes('my story'));
  const stage = integrationTalk && 'integrationStage' in integrationTalk ? integrationTalk.integrationStage : null;

  if (!integrationTalk || !stage) return null;

  return (
    <section id="thoughts-integration" className="thought-format-section integration-stage">
      <div className="integration-stage-heading">
        <div>
          <p>{stage.eyebrow}</p>
          <h3>{stage.title}</h3>
          <span>{stage.thesis}</span>
        </div>
        <span>University talk</span>
      </div>

      <motion.article
        className="integration-stage-hero"
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.68 }}
        viewport={{ once: true, margin: '-100px' }}
      >
        <div className="integration-stage-copy">
          <p>The question</p>
          <blockquote>{stage.question}</blockquote>
          <span>{stage.bridge}</span>
          <div className="integration-stage-links">
            {getTalkSourceLinks(integrationTalk).map((link) => (
              <ProjectLink key={link.href} label={link.label} value={link.href} />
            ))}
          </div>
        </div>
        <TalksStageVideoSlot entry={integrationTalk} />
      </motion.article>

      <div className="integration-stage-principles" aria-label="Middle way principles">
        {stage.principles.map((principle, index) => (
          <motion.div
            key={principle.label}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: index * 0.04 }}
            viewport={{ once: true, margin: '-80px' }}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{principle.label}</strong>
            <p>{principle.body}</p>
          </motion.div>
        ))}
      </div>

      <div className="integration-stage-arc" aria-label="University talk career arc">
        {stage.arc.map((moment, index) => (
          <motion.div
            key={moment.label}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: index * 0.04 }}
            viewport={{ once: true, margin: '-80px' }}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{moment.label}</strong>
            <p>{moment.body}</p>
          </motion.div>
        ))}
      </div>

      <motion.article
        className="integration-stage-synthesis"
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.68 }}
        viewport={{ once: true, margin: '-100px' }}
      >
        <div>
          <p>Talk thesis</p>
          <blockquote>"{stage.quote}"</blockquote>
        </div>
        <div>
          <span>{stage.synthesis.title}</span>
          <p>{stage.synthesis.body}</p>
        </div>
      </motion.article>
    </section>
  );
}
