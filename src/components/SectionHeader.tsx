import { motion } from 'framer-motion';

export function SectionKicker({
  number,
  label,
  tone = 'default',
  className = '',
}: {
  number?: string;
  label: string;
  tone?: 'default' | 'dark';
  className?: string;
}) {
  const toneClass = tone === 'dark' ? 'text-white/55' : 'text-muted';

  return (
    <p className={`text-xs uppercase tracking-[0.34em] ${toneClass} ${className}`}>
      {number ? `${number} / ${label}` : label}
    </p>
  );
}

export function SectionHeader({
  eyebrow,
  prefix,
  italic,
  copy,
  cta,
  sectionNumber,
}: {
  eyebrow: string;
  prefix: string;
  italic: string;
  copy: string;
  cta?: string;
  sectionNumber?: string;
}) {
  return (
    <motion.div
      className="mb-10 flex flex-col gap-8 md:mb-14 md:flex-row md:items-end md:justify-between"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
      viewport={{ once: true, margin: '-100px' }}
    >
      <div>
        <div className="mb-5 flex items-center gap-4">
          <SectionKicker number={sectionNumber} label={eyebrow} />
        </div>
        <h2 className="font-body text-4xl font-semibold tracking-[-0.04em] text-text-primary md:text-6xl">
          {prefix} <span className="font-display italic font-normal">{italic}</span>
        </h2>
        <p className="mt-5 max-w-md text-sm leading-7 text-muted md:text-base">{copy}</p>
      </div>

      {cta ? (
        <a
          href="#contact"
          className="group relative hidden rounded-full p-[2px] text-sm transition duration-300 hover:scale-105 md:inline-flex"
        >
          <span className="accent-gradient animated-gradient absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span className="relative rounded-full bg-bg px-6 py-3 text-text-primary ring-1 ring-stroke transition duration-300 group-hover:ring-transparent">
            {cta} <span aria-hidden="true">→</span>
          </span>
        </a>
      ) : null}
    </motion.div>
  );
}
