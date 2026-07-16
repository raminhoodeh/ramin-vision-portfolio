import { motion } from 'framer-motion';
import { portfolioContent } from '../../data/portfolio';
import { ProjectLink } from '../Projects/index';

function threadEyebrowClass(index: number) {
  if (index === 1) return 'text-[color:rgba(59,130,246,0.82)]';
  return 'text-[color:var(--thought-faint)]';
}

export function WorkIntegrationNarrative() {
  const workIntegration = portfolioContent.teachingSpeakingWriting.workIntegration;

  return (
    <section id="thoughts-work-narrative" className="thought-format-section">
      <motion.div
        className="rounded-[2rem] border border-white/35 bg-white/45 p-6 shadow-[0_24px_80px_rgba(37,52,72,0.12)] backdrop-blur-xl md:p-8"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="max-w-4xl">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">{workIntegration.eyebrow}</p>
          <h3 className="mt-4 text-4xl font-semibold tracking-[-0.055em] text-text-primary md:text-6xl">
            {workIntegration.title}
          </h3>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted md:text-base">{workIntegration.thesis}</p>
        </div>

        <div className="mt-7 grid gap-3">
          {workIntegration.threads.map((thread, index) => (
            <motion.details
              key={thread.index}
              className="group liquid-glass rounded-[1.5rem] px-6 py-5"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.58, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <summary className="grid cursor-pointer list-none gap-3 md:grid-cols-[7.5rem_minmax(0,0.55fr)_minmax(0,0.45fr)_2rem] md:items-center [&::-webkit-details-marker]:hidden">
                <span className={`text-[0.62rem] uppercase tracking-[0.18em] ${threadEyebrowClass(index)}`}>
                  Thread {thread.index} / {thread.eyebrow}
                </span>
                <strong className="text-base font-semibold tracking-[-0.025em] text-text-primary md:text-lg">
                  {thread.label}
                </strong>
                <span className="truncate text-sm leading-6 text-muted">{thread.summary}</span>
                <span
                  className="flex h-8 w-8 items-center justify-center justify-self-start rounded-full bg-white/45 text-xl leading-none text-muted transition duration-300 group-open:rotate-45 md:justify-self-end"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>

              <div className="mt-5 grid gap-4 border-t border-white/45 pt-5">
                <div className="grid max-w-3xl gap-4">
                  {thread.body.map((paragraph) => (
                    <p key={paragraph} className="text-sm leading-7 text-muted">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {thread.stat || thread.link ? (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {thread.stat ? (
                      <span className="rounded-full bg-white/35 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.16em] text-muted">
                        {thread.stat}
                      </span>
                    ) : null}
                    {thread.link ? <ProjectLink label="Open reference" value={thread.link} /> : null}
                  </div>
                ) : null}
              </div>
            </motion.details>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
