import { useMemo } from 'react';
import { contentReadiness, portfolioContent } from '../data/portfolio';
import { countPlaceholders } from '../lib/placeholder';
import { scrollToId } from '../lib/scroll';
import { formatSourceStatus } from '../lib/text';

export function ContentReadinessPanel() {
  const placeholderCounts = useMemo(
    () => [
      { section: 'Hero', count: countPlaceholders(portfolioContent.hero) },
      {
        section: 'Experience & Education',
        count:
          countPlaceholders(portfolioContent.productManagementWorkExperiences) +
          countPlaceholders(portfolioContent.qualifications),
      },
      { section: 'Projects', count: countPlaceholders(portfolioContent.personalProjects) },
      { section: 'Teaching, Speaking & Writing', count: countPlaceholders(portfolioContent.teachingSpeakingWriting) },
      { section: 'Contact', count: countPlaceholders(portfolioContent.contactCta) },
      { section: 'Bonus', count: countPlaceholders(portfolioContent.bonus) },
      { section: 'AI Ramin', count: countPlaceholders(portfolioContent.aiRaminChatbot) },
    ],
    [],
  );

  const totalPlaceholders = placeholderCounts.reduce((total, item) => total + item.count, 0);
  const totalRequests = contentReadiness.groups.reduce((total, group) => total + group.requests.length, 0);

  return (
    <section id="content-readiness" aria-label="Content readiness intake" className="bg-transparent py-12 md:py-16">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        <div className="liquid-glass-strong rounded-[2rem] p-6 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Private QA view</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-text-primary md:text-5xl">
                {contentReadiness.title}
              </h2>
              <p className="mt-5 text-sm leading-7 text-muted">{contentReadiness.accessHint}</p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.2rem] bg-white/35 p-4">
                  <p className="text-[0.62rem] uppercase tracking-[0.18em] text-muted">Intentional placeholders</p>
                  <p className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-text-primary">
                    {totalPlaceholders}
                  </p>
                </div>
                <div className="rounded-[1.2rem] bg-white/35 p-4">
                  <p className="text-[0.62rem] uppercase tracking-[0.18em] text-muted">Open intake requests</p>
                  <p className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-text-primary">
                    {totalRequests}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              {placeholderCounts.map((item) => (
                <div
                  key={item.section}
                  className="grid gap-3 rounded-[1rem] bg-white/30 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                >
                  <p className="text-sm font-medium text-text-primary">{item.section}</p>
                  <span className="rounded-full bg-white/45 px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-muted">
                    {item.count} missing
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {contentReadiness.groups.map((group) => (
              <details
                key={group.section}
                className="rounded-[1.4rem] border border-white/25 bg-white/24 p-4 [&>summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[0.62rem] uppercase tracking-[0.18em] text-muted">
                      {group.sectionNumber} / {group.priority} priority
                    </p>
                    <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-text-primary">
                      {group.section}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted">{group.sourceNote}</p>
                  </div>
                  {group.target !== 'ai-ramin-modal' ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        scrollToId(group.target);
                      }}
                      className="shrink-0 rounded-full bg-white/45 px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-muted transition duration-300 hover:bg-white/70 hover:text-text-primary"
                    >
                      Jump
                    </button>
                  ) : (
                    <span className="shrink-0 rounded-full bg-white/35 px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-muted">
                      Modal
                    </span>
                  )}
                </summary>

                <div className="mt-4 grid gap-2 border-t border-stroke/60 pt-4">
                  {group.requests.map((request, index) => (
                    <div
                      key={`${group.section}-${request.item}`}
                      className="grid gap-3 rounded-[0.95rem] bg-white/30 p-3 sm:grid-cols-[2rem_minmax(0,1fr)_auto] sm:items-start"
                    >
                      <span className="text-[0.62rem] uppercase tracking-[0.16em] text-muted">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <p className="text-sm leading-6 text-text-primary">{request.item}</p>
                      <span className="rounded-full bg-white/45 px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.14em] text-muted">
                        {formatSourceStatus(request.sourceStatus)}
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
