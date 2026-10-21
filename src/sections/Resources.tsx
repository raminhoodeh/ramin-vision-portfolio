import { aiProductCourseEvidence, productCourseEvidence } from '../data/teachingEvidence';
import { resourceStarterLinks, resourceOffers, type ResourceOffer } from '../data/resources';
export { resourceOffers, resourceStarterLinks } from '../data/resources';
import './resources.css';

export function Resources() {
  return <section id="resources" className="resources-page" aria-labelledby="resources-title">
    <header className="resources-page__header">
      <p className="resources-page__eyebrow">Resources</p>
      <h1 id="resources-title">Useful material. Direct access.</h1>
      <p>Start with the workspace, inspect an evaluation example, or explore the teaching behind the products.</p>
    </header>
    <section className="resources-page__section" aria-labelledby="resources-starter-title">
      <h2 id="resources-starter-title">Start with something practical</h2>
      <div className="resources-page__grid">
        {resourceStarterLinks.map((resource) => <article key={resource.href} className="resources-page__card">
          <h3>{resource.title}</h3><p>{resource.description}</p>
          <a href={resource.href} target="_blank" rel="noopener noreferrer">{resource.label} <span aria-hidden="true">↗</span></a>
        </article>)}
      </div>
      <p className="resources-page__related"><a href="/presentation">Open the presentation</a> · <a href="/talks/disx-dubai">Read the DISx talk and hypothetical example</a> · <a href="/product-method">Explore the method</a></p>
    </section>
    <section className="resources-page__section" aria-labelledby="resources-courses-title">
      <h2 id="resources-courses-title">Learn through the courses</h2>
      <div className="resources-page__grid">
        <article className="resources-page__card"><p className="resources-page__platform">Udemy · AI product management</p>
          <h3>{aiProductCourseEvidence.udemy.title}</h3><p>Turn AI product judgment into practical decisions about context, behaviour and evaluation.</p>
          <a href={aiProductCourseEvidence.udemy.href} target="_blank" rel="noopener noreferrer">View on Udemy <span aria-hidden="true">↗</span></a>
        </article>
        <article className="resources-page__card"><p className="resources-page__platform">Coursera · Offered by {aiProductCourseEvidence.coursera.provider}</p>
          <h3>{aiProductCourseEvidence.coursera.title}</h3><p>The Coursera edition has its own platform structure and access options.</p>
          <a href={aiProductCourseEvidence.coursera.href} target="_blank" rel="noopener noreferrer">View on Coursera <span aria-hidden="true">↗</span></a>
        </article>
        <article className="resources-page__card"><p className="resources-page__platform">Udemy · Product craft</p>
          <h3>{productCourseEvidence.title}</h3><p>A structured introduction to product management and the Product Innovation Process.</p>
          <a href={productCourseEvidence.href} target="_blank" rel="noopener noreferrer">View on Udemy <span aria-hidden="true">↗</span></a>
        </article>
      </div>
    </section>
    <section className="resources-page__section" aria-labelledby="resources-access-title">
      <h2 id="resources-access-title">Access and enquiries</h2>
      <p>Platforms show their current terms. For a promotion, consultation or special access, ask Ramin to confirm what is available.</p>
      <div className="resources-page__grid resources-page__grid--offers">
        {resourceOffers.map((offer: ResourceOffer) => <article key={offer.title} className="resources-page__card">
          <h3>{offer.title}</h3><p>{offer.detail}</p>
          <div className="resources-page__actions"><a href={offer.link} target={offer.link.startsWith('https:') ? '_blank' : undefined} rel={offer.link.startsWith('https:') ? 'noopener noreferrer' : undefined}>{offer.actionLabel}</a>
            {offer.requestLink ? <a href={offer.requestLink}>{offer.requestLabel}</a> : null}</div>
        </article>)}
      </div>
    </section>
    <aside className="resources-page__optional"><h2>A little personality, too.</h2><p>The optional rock interaction opens the same resource links.</p><a href="/bonus">Try the playful version <span aria-hidden="true">→</span></a></aside>
  </section>;
}
