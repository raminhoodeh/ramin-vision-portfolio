import { motion } from 'framer-motion';
import { portfolioContent } from '../../data/portfolio';
import { caseWriteupArtwork } from './CaseWriteups';

export function PassionManifest() {
  const manifest = portfolioContent.teachingSpeakingWriting.passionManifest;

  return (
    <section id="thoughts-passions" className="thought-format-section">
      <motion.div
        className="grid gap-4 rounded-[2rem] border border-white/35 bg-white/45 p-6 shadow-[0_24px_80px_rgba(37,52,72,0.12)] backdrop-blur-xl md:p-8"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">{manifest.eyebrow}</p>
          <h3 className="mt-4 text-4xl font-semibold tracking-[-0.055em] text-text-primary md:text-6xl">
            {manifest.title}
          </h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted md:text-base">{manifest.body}</p>
        </div>

        <div className="mt-2 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {manifest.passions.map((passion, index) => {
            const thumbnail = passion.projectName ? caseWriteupArtwork(passion.projectName) : undefined;

            return (
              <motion.article
                key={passion.name}
                className="liquid-glass flex min-h-[22rem] flex-col rounded-[1.75rem] p-6 md:p-8"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.65, delay: index * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.62rem] uppercase tracking-[0.22em] text-muted">
                      {String(index + 1).padStart(2, '0')} / Material
                    </p>
                    <h4 className="mt-4 text-xl font-semibold tracking-[-0.04em] text-text-primary md:text-2xl">
                      {passion.name}
                    </h4>
                  </div>
                  {thumbnail ? (
                    <span className="block h-12 w-12 shrink-0 overflow-hidden rounded-[0.75rem] border border-white/45 bg-white/45 shadow-[0_12px_34px_rgba(37,52,72,0.16)]">
                      <img
                        src={thumbnail}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                        }}
                      />
                    </span>
                  ) : null}
                </div>

                <p className="mt-5 text-base font-semibold leading-6 tracking-[-0.025em] text-text-primary">
                  {passion.claim}
                </p>
                <p className="mt-4 text-sm leading-7 text-muted">{passion.body}</p>

                <div className="mt-auto flex flex-wrap gap-2 pt-7">
                  {passion.artifacts.map((artifact) => (
                    <span
                      key={`${passion.name}-${artifact}`}
                      className="rounded-full bg-white/35 px-3 py-1 text-[0.65rem] uppercase tracking-[0.16em] text-muted"
                    >
                      {artifact}
                    </span>
                  ))}
                </div>
              </motion.article>
            );
          })}
        </div>

        <p className="mx-auto mt-2 max-w-3xl text-center text-sm italic leading-7 text-muted">
          {manifest.bridge}
        </p>
      </motion.div>
    </section>
  );
}
