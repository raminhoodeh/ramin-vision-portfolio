import type { ReactNode } from 'react';
import {
  disxTalk,
  disxTranscriptReadMinutes,
  disxTranscriptSections,
  productMethodDiagramUrl,
  productWorkspaceHref,
} from '../data/disxTalk';
import { aiProductCourseEvidence } from '../data/teachingEvidence';
import './DisxTalkPage.css';

export type DisxTalkPageProps = {
  onOpenThesis?: () => void;
};

// Render source text as React nodes; never interpret the supplied script as HTML.
function transcriptText(text: string): ReactNode {
  const pattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s]+)|(www DOT ramin DOT vision)/g;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > lastIndex) nodes.push(text.slice(lastIndex, index));
    const label = match[1] ?? match[3] ?? match[4];
    const href = match[2] ?? match[3] ?? 'https://ramin.vision/';
    nodes.push(<a key={`${index}-${href}`} href={href} target="_blank" rel="noopener noreferrer">{label}</a>);
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes.length ? nodes : text;
}

export function DisxTalkPage({ onOpenThesis }: DisxTalkPageProps) {
  return (
    <article className="disx-talk-page" aria-labelledby="disx-talk-title">
      <header className="disx-talk-page__hero">
        <p className="disx-talk-page__eyebrow">Talk · {disxTalk.event}</p>
        <h1 id="disx-talk-title">{disxTalk.title}</h1>
        <dl className="disx-talk-page__meta">
          <div><dt>When</dt><dd><time dateTime={disxTalk.date}>{disxTalk.dateLabel}</time></dd></div>
          <div><dt>Where</dt><dd>{disxTalk.location}</dd></div>
          <div><dt>Stage</dt><dd>{disxTalk.stage}</dd></div>
        </dl>
        <p className="disx-talk-page__lead">
          The Stack helps us understand an AI system. The Loop helps us develop it. In this talk, I introduced
          that approach, then used a hypothetical payment decision to make the boundary between a useful
          recommendation and an authorised action visible.
        </p>
        <div className="disx-talk-page__sources" aria-label="Event organiser sources">
          {disxTalk.sources.map((source) => (
            <a key={source.href} href={source.href} target="_blank" rel="noopener noreferrer">{source.label} ↗</a>
          ))}
        </div>
      </header>

      <nav className="disx-talk-page__nav" aria-label="On this talk page">
        <a href="#framework">The slide</a>
        <a href="#takeaways">Takeaways</a>
        <a href="#worked-example">Worked example</a>
        <a href="#transcript">Full talk script</a>
        <a href="#resources">Resources</a>
      </nav>

      <section id="framework" className="disx-talk-page__section" aria-labelledby="disx-framework-title">
        <div className="disx-talk-page__section-heading">
          <p className="disx-talk-page__eyebrow">One slide, two instruments</p>
          <h2 id="disx-framework-title">A place to put what you learn, and a way to put it to work.</h2>
          <p>
            Model, Context, Orchestration, Governance and Human are five areas to examine. Talk, Decide, Build,
            Observe and Iterate are the development loop. Governance and human responsibility apply throughout.
          </p>
        </div>
        <figure className="disx-talk-page__diagram">
          <a href={productMethodDiagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Open the AI-Native Product OS slide at full size">
            <img
              src={productMethodDiagramUrl}
              width="1600"
              height="900"
              alt="The AI-Native Product OS slide connects the Model, Context, Orchestration, Governance and Human Stack with the Talk, Decide, Build, Observe and Iterate Loop."
              loading="lazy"
              decoding="async"
            />
          </a>
          <figcaption>
            <a href="/presentation">Open the presentation</a> ·{' '}
            <a href={productMethodDiagramUrl} download="ramin-hoodeh-ai-native-product-os.jpg">Download the diagram</a> ·{' '}
            <a href="/product-method">Read the concise method</a>
          </figcaption>
        </figure>
      </section>

      <section id="takeaways" className="disx-talk-page__section" aria-labelledby="disx-takeaways-title">
        <div className="disx-talk-page__section-heading">
          <p className="disx-talk-page__eyebrow">What to carry into the work</p>
          <h2 id="disx-takeaways-title">Three practical takeaways.</h2>
        </div>
        <ol className="disx-talk-page__takeaways">
          {disxTalk.takeaways.map((takeaway, index) => (
            <li key={takeaway}><span aria-hidden="true">0{index + 1}</span><p>{takeaway}</p></li>
          ))}
        </ol>
      </section>

      <section id="worked-example" className="disx-talk-page__section" aria-labelledby="disx-example-title">
        <div className="disx-talk-page__section-heading">
          <p className="disx-talk-page__eyebrow">Worked example · hypothetical simulation</p>
          <h2 id="disx-example-title">When a confident recommendation needs a stop condition.</h2>
          <p>
            A $4.2 billion cross-border payment is the teaching scenario. The sequence below explains the reasoning
            in the talk; it does not report a production transfer or measured evaluation results.
          </p>
        </div>
        <ol className="disx-talk-page__example">
          {disxTalk.workedExample.map((step, index) => (
            <li key={step.title}>
              <span className="disx-talk-page__step-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <p className="disx-talk-page__phase">{step.phase}</p>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
                <p className="disx-talk-page__artifact"><strong>What becomes explicit:</strong> {step.artifact}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="transcript" className="disx-talk-page__section" aria-labelledby="disx-transcript-title">
        <div className="disx-talk-page__section-heading">
          <p className="disx-talk-page__eyebrow">Read the talk · {disxTranscriptReadMinutes}-minute read</p>
          <h2 id="disx-transcript-title">Full talk script.</h2>
          <p>
            Prepared talk script, lightly edited for the web; an undated enrolment claim has been omitted.
            Reading headings have been added. This is not a recording transcription.
          </p>
        </div>
        <aside className="disx-talk-page__editorial-note" aria-label="Notes on the prepared talk script">
          <p>
            Model references below belong to the prepared talk script. For current, dated course information,
            see <a href="/thoughts/courses">the course listings</a>. The payment workflow and its rerun are
            hypothetical illustrations.
          </p>
        </aside>
        <nav className="disx-talk-page__transcript-nav" aria-label="Talk script sections">
          {disxTranscriptSections.map((section) => (
            <a key={section.id} href={`#script-${section.id}`}>{section.title}</a>
          ))}
        </nav>
        <div className="disx-talk-page__transcript">
          {disxTranscriptSections.map((section) => (
            <section key={section.id} id={`script-${section.id}`} aria-labelledby={`script-heading-${section.id}`}>
              <h3 id={`script-heading-${section.id}`}>{section.title}</h3>
              {section.paragraphs.map((paragraph, index) => (
                <div key={`${section.id}-${index}`} className="disx-talk-page__script-paragraph">
                  <p>{transcriptText(paragraph)}</p>
                  {section.id === 'building-the-simulation' && index === 0 ? (
                    <aside className="disx-talk-page__editorial-note" aria-label="Model selection clarification">
                      <p>
                        Model selection clarification: age and low temperature are not guarantees of correctness.
                        My method calls for assessing task quality, privacy, latency and cost, with evaluation
                        evidence and controls outside the model. The named model in the earlier explanation
                        is a speaking example, rather than a product recommendation.
                      </p>
                    </aside>
                  ) : null}
                </div>
              ))}
            </section>
          ))}
        </div>
      </section>

      <section id="resources" className="disx-talk-page__section disx-talk-page__resources" aria-labelledby="disx-resources-title">
        <div className="disx-talk-page__section-heading">
          <p className="disx-talk-page__eyebrow">Take it further</p>
          <h2 id="disx-resources-title">Understand it, use it, or learn it with me.</h2>
          <p>The framework, installable workspace and courses are separate ways to engage with the method.</p>
        </div>
        <div className="disx-talk-page__resource-links">
          <a href="/product-method"><strong>The concise framework</strong><span>Five responsibilities and a development loop.</span></a>
          <a href="/product-thesis" onClick={onOpenThesis ? (event) => { event.preventDefault(); onOpenThesis(); } : undefined}>
            <strong>The full thesis</strong><span>The reasoning, applications and limits.</span>
          </a>
          <a href={productWorkspaceHref} target="_blank" rel="noopener noreferrer"><strong>The GitHub workspace</strong><span>Install and adapt the toolkit.</span></a>
          <a href={aiProductCourseEvidence.udemy.href} target="_blank" rel="noopener noreferrer"><strong>The Udemy course</strong><span>{aiProductCourseEvidence.udemy.title}.</span></a>
          <a href={aiProductCourseEvidence.coursera.href} target="_blank" rel="noopener noreferrer"><strong>The Coursera course</strong><span>{aiProductCourseEvidence.coursera.title}, offered by {aiProductCourseEvidence.coursera.provider}.</span></a>
          <a href="/contact"><strong>Teaching and speaking enquiries</strong><span>Tell me about the audience and the problem.</span></a>
        </div>
      </section>
    </article>
  );
}
