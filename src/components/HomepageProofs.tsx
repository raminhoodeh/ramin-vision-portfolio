import { useEffect, useRef, type ReactNode } from 'react';
import { homepagePositioning, homepageProducts } from '../data/homepage';
import { commercialProofs } from '../data/homepageProofs';
import { aiProductCourseEvidence, instructorTeachingEvidence } from '../data/teachingEvidence';
import { TahoeGlassSurface } from './TahoeGlassSurface';
import { startProofTickers } from './proofTicker';

function ProofCard({ label, className = '', children }: { label: string; className?: string; children: ReactNode }) {
  return <section className={`homepage-proof-card ${className}`} aria-label={label}>
    <TahoeGlassSurface className="homepage-proof-glass" contentClassName="homepage-proof-content">{children}</TahoeGlassSurface>
  </section>;
}

export function HomepageProofs() {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => rootRef.current ? startProofTickers(rootRef.current) : undefined, []);
  const projects = ['nsso', 'Dreamsea', '24Seven Concierge'].map((name) => homepageProducts.find((entry) => entry.name === name)!);
  const totals = `${instructorTeachingEvidence.totalLearners} Learners`;
  const rating = `${instructorTeachingEvidence.rating}/5 · ${instructorTeachingEvidence.reviews} reviews`;

  return <div className="homepage-hero__strengths homepage-proof-set homepage-hero__reveal" ref={rootRef} data-homepage-proofs="" data-proof-cycle="0" role="group" aria-label="Three connected strengths">
    <ProofCard label="Commercial judgment" className="homepage-proof-commercial">
      <div className="homepage-proof-ticker" data-proof-ticker="commercial" aria-live="off">
        {commercialProofs.map((proof, index) => <div className="homepage-proof-slide" data-proof-slide="" data-proof-id={proof.id} data-active={String(index === 0)} aria-hidden={index !== 0} inert={index !== 0} key={proof.id}>
          <h3 className="homepage-proof-title">{proof.title}</h3><p className="homepage-proof-detail">{proof.detail}</p>
        </div>)}
      </div>
    </ProofCard>
    <ProofCard label="Hands-on AI building">
      <h3 className="homepage-proof-title homepage-proof-projects">{projects.map((project, index) => <span key={project.name}>{index ? <span aria-hidden="true"> · </span> : null}<a href={project.publicHref} target="_blank" rel="noopener noreferrer" aria-label={`Open ${project.name === '24Seven Concierge' ? '24Seven' : project.name}${project.name === 'nsso' ? '' : ' in the App Store'} (opens in a new tab)`}>{project.name === '24Seven Concierge' ? '24Seven' : project.name}</a></span>)}</h3>
      <p className="homepage-proof-detail">{homepagePositioning.strengthBuildingDetail}</p>
    </ProofCard>
    <ProofCard label="A method I teach" className="homepage-proof-teaching">
      <h3 className="homepage-proof-title">{homepagePositioning.strengthTeaching}</h3>
      <div className="homepage-proof-summary homepage-proof-detail" data-teaching-summary="" aria-label={`Udemy instructor rating and totals. ${instructorTeachingEvidence.checkedLabel}.`}>
        <p>{totals}</p>
        <p title={`Udemy instructor rating out of five. ${instructorTeachingEvidence.checkedLabel}.`}>{rating}</p>
        <div className="homepage-proof-badges" data-teaching-badges="" role="group" aria-label="Udemy AI course badges">{aiProductCourseEvidence.udemy.badges.map((badge) => <span key={badge} title={`${badge} on the Udemy AI course`}>{badge}</span>)}</div>
      </div>
      <p className="homepage-proof-courses"><a href={aiProductCourseEvidence.coursera.href} target="_blank" rel="noopener noreferrer" aria-label="Coursera AI product management course (opens in a new tab)">Coursera</a><span aria-hidden="true"> · </span><a href={aiProductCourseEvidence.udemy.href} target="_blank" rel="noopener noreferrer" aria-label="Udemy AI product management course (opens in a new tab)">Udemy</a></p>
    </ProofCard>
  </div>;
}
