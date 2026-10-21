import { professionalStories } from '../data/professionalStories';
import './professional-stories.css';

export function ProfessionalStories({ activeSlug }: { activeSlug?: string }) {
  if (!activeSlug) {
    return (
      <section className="professional-story-selection" aria-label="Selected professional decisions">
        <p className="professional-story-eyebrow">Selected decisions</p>
        <div className="professional-story-selection-grid">
          {professionalStories.map((story) => (
            <a key={story.slug} href={`/work/${story.slug}`} className="professional-story-teaser liquid-glass">
              <span>{story.company}</span>
              <strong>{story.title}</strong>
              <p>Reported: {story.highlight}</p>
              <small>Read the decision <span aria-hidden="true">↗</span></small>
            </a>
          ))}
        </div>
      </section>
    );
  }

  const story = professionalStories.find((entry) => entry.slug === activeSlug);
  if (!story) return <section className="professional-story-page"><h1>Story not found</h1><a href="/experience-education">Back to work</a></section>;

  return (
    <section className="professional-story-page portfolio-stage-scroll">
      <article className="professional-story-reader liquid-glass-strong">
        <a className="professional-story-back" href="/experience-education">← Back to work</a>
        <header>
          <p className="professional-story-eyebrow">Professional decision · {story.company}</p>
          <h1>{story.title}</h1>
          <p className="professional-story-meta">{story.role} · {story.period}</p>
        </header>
        <div className="professional-story-highlight"><span>Reported outcome</span><strong>{story.highlight}</strong></div>
        <section><h2>The problem</h2><p>{story.problem}</p></section>
        <section><h2>What I owned</h2><p>{story.ownership}</p></section>
        <section><h2>The decision</h2>{story.decision.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>
        <section><h2>Results and period</h2><ul>{story.results.map((result) => <li key={result}>{result}</li>)}</ul></section>
        <section className="professional-story-evidence">
          <h2>Evidence and limits</h2><p>{story.limitations}</p>
          <p className="professional-story-context-note">The company link provides context; it does not independently verify the outcomes.</p>
          <div className="professional-story-links">{story.links.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label} <span aria-hidden="true">↗</span></a>)}</div>
        </section>
        <a className="professional-story-contact" href="/contact">Discuss the decisions and my role →</a>
      </article>
    </section>
  );
}
