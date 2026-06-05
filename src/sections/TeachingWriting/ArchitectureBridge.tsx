import { motion } from 'framer-motion';
import { portfolioContent } from '../../data/portfolio';
import { type ThoughtArchitectureApplication } from '../types';
import { caseWriteupArtwork } from './CaseWriteups';

function ThoughtArchitectureApplicationCard({
  application,
  index,
}: {
  application: ThoughtArchitectureApplication;
  index: number;
}) {
  const artwork = caseWriteupArtwork(application.projectName);

  return (
    <motion.article
      className="thought-architecture-card"
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.58, delay: index * 0.04, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="thought-architecture-visual">
        {artwork ? (
          <img
            src={artwork}
            alt=""
            loading="lazy"
            decoding="async"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
        ) : null}
        <span>{String(index + 1).padStart(2, '0')}</span>
      </div>

      <div className="thought-architecture-card-main">
        <div>
          <p>{application.type}</p>
          <h4>{application.projectName}</h4>
        </div>
        <p>{application.ambiguity}</p>
      </div>

      <div className="thought-architecture-card-lenses">
        <div>
          <span>Foundation</span>
          <p>{application.foundation}</p>
        </div>
        <div>
          <span>Thought lens</span>
          <p>{application.lens}</p>
        </div>
        <div>
          <span>Architecture move</span>
          <p>{application.architecture}</p>
        </div>
      </div>

      <p className="thought-architecture-outcome">{application.outcome}</p>
    </motion.article>
  );
}

export function ThoughtArchitectureBridge() {
  const bridge = portfolioContent.teachingSpeakingWriting.architectureBridge;

  return (
    <section id="thoughts-architecture-bridge" className="thought-format-section thought-architecture-bridge">
      <div className="thought-architecture-heading">
        <div>
          <p>{bridge.eyebrow}</p>
          <h3>{bridge.title}</h3>
          <span>{bridge.body}</span>
        </div>
        <blockquote>{bridge.thesis}</blockquote>
      </div>

      <ol className="thought-architecture-flow" aria-label="Thought to system flow">
        {bridge.flow.map((step, index) => (
          <li key={step.label}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{step.label}</strong>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>

      <div className="thought-architecture-grid">
        {bridge.applications.map((application, index) => (
          <ThoughtArchitectureApplicationCard
            key={application.projectName}
            application={application}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
