import { useEffect, useRef } from 'react';
import { homepagePositioning, homepageProducts } from '../data/homepage';
import { commercialProofs } from '../data/homepageProofs';
import { aiProductCourseEvidence, instructorTeachingEvidence } from '../data/teachingEvidence';
import { startProofTickers } from './proofTicker';

export function HomepageProofs() {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => rootRef.current ? startProofTickers(rootRef.current) : undefined, []);
  const projects = ['nsso', 'Dreamsea', '24Seven Concierge'].map((name) => homepageProducts.find((entry) => entry.name === name)!);
  const totals = `${instructorTeachingEvidence.totalLearners} Udemy learners · ${instructorTeachingEvidence.reviews} reviews`;

  return <div className="homepage-hero__strengths homepage-proof-set homepage-hero__reveal" ref={rootRef} data-homepage-proofs="" role="group" aria-label="Three connected strengths">
    <section className="homepage-proof-card homepage-proof-ticker" data-proof-ticker="commercial" aria-label="Commercial judgment" aria-live="off">
      {commercialProofs.map((proof, index) => <div className="homepage-proof-slide" data-proof-slide="" data-active={String(index === 0)} aria-hidden={index !== 0} inert={index !== 0} key={proof.title}>
        <h3 className="homepage-proof-title">{proof.title}</h3><p className="homepage-proof-detail">{proof.detail}</p>
      </div>)}
    </section>
    <section className="homepage-proof-card" aria-label="Hands-on AI building">
      <h3 className="homepage-proof-title homepage-proof-projects">{projects.map((project, index) => <span key={project.name}>{index ? <span aria-hidden="true"> · </span> : null}<a href={project.publicHref} target="_blank" rel="noopener noreferrer" aria-label={`Open ${project.name === '24Seven Concierge' ? '24Seven' : project.name}${project.name === 'nsso' ? '' : ' in the App Store'} (opens in a new tab)`}>{project.name === '24Seven Concierge' ? '24Seven' : project.name}</a></span>)}</h3>
      <p className="homepage-proof-detail">{homepagePositioning.strengthBuildingDetail}</p>
    </section>
    <section className="homepage-proof-card homepage-proof-teaching" aria-label="A method I teach">
      <h3 className="homepage-proof-title">{homepagePositioning.strengthTeaching}</h3>
      <div className="homepage-proof-summary homepage-proof-detail" data-teaching-summary="">
        <p title={`${instructorTeachingEvidence.checkedLabel}; Udemy instructor totals`}>{totals}</p>
        <div className="homepage-proof-badges" data-teaching-badges="" role="group" aria-label="Udemy AI course badges">{aiProductCourseEvidence.udemy.badges.map((badge) => <span key={badge} title={`${badge} on the Udemy AI course`}>{badge}</span>)}</div>
      </div>
      <p className="homepage-proof-courses"><a href={aiProductCourseEvidence.coursera.href} target="_blank" rel="noopener noreferrer" aria-label="Coursera AI product management course (opens in a new tab)">Coursera</a><span aria-hidden="true"> · </span><a href={aiProductCourseEvidence.udemy.href} target="_blank" rel="noopener noreferrer" aria-label="Udemy AI product management course (opens in a new tab)">Udemy</a></p>
      <button type="button" className="homepage-proof-motion" data-proof-motion="" aria-label="Pause proof rotation" aria-pressed="false" title="Pause proof rotation">
        <svg className="homepage-proof-pause" viewBox="0 0 20 20" aria-hidden="true"><path d="M6 4h3v12H6zm5 0h3v12h-3z" fill="currentColor" /></svg>
        <svg className="homepage-proof-play" viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 9 6-9 6z" fill="currentColor" /></svg>
        <svg className="homepage-proof-next" viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.7" /></svg>
      </button>
    </section>
  </div>;
}
