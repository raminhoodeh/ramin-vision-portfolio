import {
  productMethodDiagramUrl,
  productMethodLoop,
  productMethodResponsibilities,
  productMethodRoutes,
  productWorkspaceHref,
} from '../data/disxTalk';
import { aiProductCourseEvidence } from '../data/teachingEvidence';
import './ProductMethodSummary.css';

export type ProductMethodSummaryProps = {
  compact?: boolean;
  className?: string;
};

export function ProductMethodSummary({ compact = false, className = '' }: ProductMethodSummaryProps) {
  const Heading = compact ? 'h2' : 'h1';
  const Subheading = compact ? 'h3' : 'h2';

  return (
    <section
      id={compact ? 'product-method-summary' : 'product-method'}
      className={`product-method-summary${compact ? ' product-method-summary--compact' : ''} ${className}`.trim()}
      aria-label="My approach to AI product work"
    >
      <header className="product-method-summary__header">
        <p className="product-method-summary__eyebrow">My product method · AI-Native Product OS</p>
        <Heading>Understand the system. Give it a useful job. Keep learning.</Heading>
        <p className="product-method-summary__intro">
          AI can make a first working version cheaper to build. It also creates outputs that need to be checked.
          I use five areas of responsibility and a repeatable development loop to connect the work to a customer
          problem, clear decision rights and evidence of what happened.
        </p>
      </header>

      <div className="product-method-summary__structure">
        <div className="product-method-summary__stack">
          <Subheading className="product-method-summary__label">The Stack · what to take responsibility for</Subheading>
          <dl>
            {productMethodResponsibilities.map((layer) => (
              <div key={layer.name}>
                <dt>{layer.name}</dt>
                <dd>
                  <span>{layer.question}</span>
                  {!compact ? <p>{layer.detail}</p> : null}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="product-method-summary__process">
          <Subheading className="product-method-summary__label">The Loop · how to develop it</Subheading>
          <ol aria-label="Talk, Decide, Build, Observe, Iterate">
            {productMethodLoop.map((step, index) => (
              <li key={step.name}>
                <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <strong>{step.name}</strong>
                  {!compact ? <p>{step.detail}</p> : null}
                </div>
              </li>
            ))}
          </ol>
          <p className="product-method-summary__boundary">
            Governance and human responsibility apply throughout. The checks and release gates depend on the
            consequences of getting the task wrong.
          </p>
        </div>
      </div>

      <nav className="product-method-summary__routes" aria-label="Explore the product method">
        {productMethodRoutes.map((route) => (
          <a
            key={route.href}
            href={route.href}
            target={route.href.startsWith('https:') ? '_blank' : undefined}
            rel={route.href.startsWith('https:') ? 'noopener noreferrer' : undefined}
          >
            <strong>{route.label}<span aria-hidden="true"> ↗</span></strong>
            {!compact ? <span>{route.detail}</span> : null}
          </a>
        ))}
      </nav>

      <div className="product-method-summary__editions">
        <p>
          <strong>The framework</strong> is this way of thinking.{' '}
          <strong>The workspace</strong> is the <a href={productWorkspaceHref} target="_blank" rel="noopener noreferrer">installable GitHub toolkit</a>.{' '}
          <strong>The courses</strong> teach it on{' '}
          <a href={aiProductCourseEvidence.udemy.href} target="_blank" rel="noopener noreferrer">Udemy</a> and{' '}
          <a href={aiProductCourseEvidence.coursera.href} target="_blank" rel="noopener noreferrer">Coursera</a>.
        </p>
      </div>

      {!compact ? (
        <>
          <figure id="method-diagram" className="product-method-summary__diagram">
            <a href={productMethodDiagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Open the AI-Native Product OS diagram at full size">
              <img
                src={productMethodDiagramUrl}
                width="1600"
                height="900"
                alt="AI-Native Product OS: Model, Context, Orchestration, Governance and Human responsibilities alongside the Talk, Decide, Build, Observe, Iterate loop. The responsibilities and steps are described above."
                loading="lazy"
                decoding="async"
              />
            </a>
            <figcaption>
              The Stack helps locate a decision or failure. The Loop helps test and improve it.
              {' '}<a href="/presentation">Open the presentation</a>.
            </figcaption>
          </figure>
          <aside className="product-method-summary__limits" aria-label="Where the method needs judgment">
            <h2>A working map, open to revision.</h2>
            <p>
              This is my teaching and decision framework, rather than a universal architecture standard. It complements
              discovery, delivery discipline and specialist review. A shipped product shows an application of the
              method; customer outcomes, evaluation results and operational evidence determine how well it worked.
            </p>
          </aside>
        </>
      ) : null}
    </section>
  );
}
