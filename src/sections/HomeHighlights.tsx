import {
  homepageOutcomes,
  homepageProducts,
  homepageRecognition,
  homepageWriting,
} from '../data/homepage';
import { GlassCarousel } from '../components/GlassCarousel';
import './homeHighlights.css';

export function HomeHighlights() {
  return (
    <section className="home-highlights" aria-labelledby="home-outcomes-title">
      <div className="home-highlights__heading">
        <div>
          <p className="home-highlights__eyebrow">Professional work</p>
          <h2 id="home-outcomes-title">Product decisions with a business outcome.</h2>
        </div>
        <a className="home-highlights__text-link" href="/experience-education">View experience <span aria-hidden="true">↗</span></a>
      </div>

      <div className="home-outcomes-grid">
        {homepageOutcomes.map((item) => (
          <article key={item.id} className="home-outcome-card" aria-labelledby={`${item.id}-title`}>
            <p className="home-highlights__eyebrow">{item.company}</p>
            <h3 id={`${item.id}-title`}>
              <span className="home-outcome-card__metric">{item.metric}</span>
              <span className="home-outcome-card__outcome">{item.outcome}</span>
            </h3>
            <p className="home-outcome-card__context">{item.context}</p>
            <p className="home-outcome-card__responsibility">{item.responsibility}</p>
            <dl className="home-outcome-card__scope">
              <div><dt>My role</dt><dd>{item.role} · {item.rolePeriod}</dd></div>
              <div><dt>Measured</dt><dd>{item.measurementPeriod}</dd></div>
            </dl>
            <a className="home-outcome-card__decision home-highlights__text-link" href={item.href} aria-label={`Read the ${item.company} ${item.context.toLowerCase()} decision`}>Read the decision <span aria-hidden="true">→</span></a>
          </article>
        ))}
      </div>
      <p className="home-highlights__source-note">Figures from my career record; not independently audited. Role dates and measurement windows are shown separately.</p>

      <div className="home-highlights__heading home-highlights__heading--products">
        <div>
          <p className="home-highlights__eyebrow">Hands-on AI development</p>
          <h2 id="home-products-title">Three ways the thinking becomes a product.</h2>
        </div>
        <a className="home-highlights__text-link" href="/projects">All projects & tools <span aria-hidden="true">↗</span></a>
      </div>
      <GlassCarousel products={homepageProducts} labelledBy="home-products-title" />
    </section>
  );
}

export function HomeRecognition() {
  const { teaching, speaking } = homepageRecognition;

  return (
    <section className="home-recognition" aria-labelledby="home-recognition-title">
      <div className="home-highlights__heading">
        <div>
          <p className="home-highlights__eyebrow">Teaching & speaking</p>
          <h2 id="home-recognition-title">Making the practice useful to other people.</h2>
        </div>
      </div>
      <div className="home-recognition__grid">
        <article className="home-recognition-card">
          <p className="home-highlights__eyebrow">Coursera & Udemy</p>
          <h3>{teaching.title}</h3>
          <p>{teaching.description}</p>
          <p className="home-recognition-card__evidence">
            Udemy: {teaching.udemy.students} enrolments · {teaching.udemy.rating}/5 from {teaching.udemy.ratings} ratings.
            {' '}{teaching.udemy.badges.join(' · ')}.
          </p>
          <p className="home-recognition-card__checked">{teaching.udemy.checkedLabel}. Enrolments are platform-specific.</p>
          <div className="home-recognition-card__links">
            <a href={teaching.udemy.href} target="_blank" rel="noopener noreferrer">Udemy course <span aria-hidden="true">↗</span></a>
            <a href={teaching.coursera.href} target="_blank" rel="noopener noreferrer">Coursera · {teaching.coursera.provider} <span aria-hidden="true">↗</span></a>
          </div>
        </article>
        <article className="home-recognition-card">
          <p className="home-highlights__eyebrow">DISx Dubai · {speaking.dateLabel}</p>
          <h3>{speaking.title}</h3>
          <p>{speaking.description}</p>
          <p className="home-recognition-card__evidence">{speaking.event} · Machine Learning, Generative & Agentic AI.</p>
          <div className="home-recognition-card__links">
            <a href={speaking.href}>The talk & worked example <span aria-hidden="true">→</span></a>
            <a href={speaking.source.href} target="_blank" rel="noopener noreferrer">Organiser’s announcement <span aria-hidden="true">↗</span></a>
          </div>
        </article>
      </div>
      <div className="home-writing-note">
        <div>
          <p className="home-highlights__eyebrow">Fiction & storytelling</p>
          <h3>{homepageWriting.title}</h3>
          <p>{homepageWriting.description}</p>
        </div>
        <a className="home-highlights__text-link" href={homepageWriting.href}>{homepageWriting.label} <span aria-hidden="true">→</span></a>
      </div>
      <div className="home-contact-note">
        <p>Have a product challenge or a role in mind?</p>
        <a href="/contact">Let’s talk <span aria-hidden="true">→</span></a>
      </div>
    </section>
  );
}
