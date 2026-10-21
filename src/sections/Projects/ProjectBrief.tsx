import { getProjectBrief } from '../../data/projectBriefs';
import './project-brief.css';

export function ProjectBrief({ title, className = '' }: { title: string; className?: string }) {
  const brief = getProjectBrief(title);
  if (!brief) return null;
  const fields = [
    ['Who it serves', brief.who],
    ['What I owned', brief.owned],
    ['Key decision', brief.decision],
    ['Current state', brief.current],
    ['Evidence and gap', brief.evidence],
  ];

  return (
    <section className={`project-entry-brief ${className}`} aria-label={`${title} at a glance`}>
      <p className="project-entry-brief-kicker">{title} · At a glance</p>
      <dl>{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <div className="project-entry-brief-links">{brief.links.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label} <span aria-hidden="true">↗</span></a>)}</div>
    </section>
  );
}
