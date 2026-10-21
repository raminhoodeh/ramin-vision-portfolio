import { getProjectBrief } from '../../data/projectBriefs';

const products = [
  ['nsso', 'nsso'], ['24Seven Concierge', '24seven-concierge'], ['Dreamsea', 'dreamsea'],
  ['Qadam', 'qadam'], ['RazinFlix', 'razinflix'],
  ['AI-Native Product Manager OS', 'ai-native-product-manager-os'],
  ['Mass Social Wisdom Agent', 'mass-social-wisdom-agent'],
  ['AI Costs Dashboard', 'ai-costs-dashboard'], ['RAG Pipeline', 'rag-pipeline'],
] as const;

function ProductCards({ entries }: { entries: readonly (typeof products)[number][] }) {
  return <div className="project-entry__grid">{entries.map(([name, slug], index) => {
    const brief = getProjectBrief(name);
    if (!brief) return null;
    const role = name === '24Seven Concierge' ? 'Client AI enhancement' : ['nsso', 'Dreamsea', 'Qadam', 'RazinFlix'].includes(name) ? 'Independent product' : 'Supporting system';
    return <article className="project-entry__card" key={slug}>
      <p className="project-entry__eyebrow">{role}</p>
      <h2><a href={`/projects/${slug}`}>{name}</a></h2>
      <p>{brief.who}</p>
      <dl><dt>My role</dt><dd>{brief.owned}</dd><dt>Key decision</dt><dd>{brief.decision}</dd><dt>Current state</dt><dd>{brief.current}</dd></dl>
      <nav aria-label={`${name} evidence`}><a href={`/projects/${slug}`}>Read the case</a>{brief.links.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label} ↗</a>)}</nav>
    </article>;
  })}</div>;
}

export function ProjectEntry() {
  return <section className="project-entry" id="products-overview" aria-labelledby="products-overview-title">
    <h1 id="products-overview-title">Products I’ve built.</h1>
    <p>Independent products, a client AI enhancement and the systems supporting the work. Start with a decision: reviewed agent actions in nsso, a human concierge handoff in 24Seven, or voice capture and recovery in Dreamsea.</p>
    <nav className="project-entry__links" aria-label="Product collection"><a href="#projects-selfware-stack">Product walkthroughs</a><a href="#projects-tools">Tools & systems</a><a href="#projects-architecture">Architecture & method</a></nav>
    <ProductCards entries={products.slice(0, 3)} />
    <details className="mt-6"><summary className="cursor-pointer py-3 text-base font-semibold">More products & supporting systems</summary><p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200">Qadam is a guarded paper research experiment; RazinFlix brings curation and automation together. The workspace and tools have their own implementation and evidence boundaries. “Selfware” is my shorthand for useful products I build for myself and others.</p><ProductCards entries={products.slice(3)} /></details>
  </section>;
}
