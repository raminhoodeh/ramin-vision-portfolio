import { motion } from 'framer-motion';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { portfolioContent, toolsAndSystems, architectureLayers } from '../../data/portfolio';
import {
  type CaseStudyEntry,
  type ToolSystemEntry,
  toolLayerColumns,
} from '../types';
import { isPlaceholderValue, contentValue, type PlaceholderLike } from '../../lib/placeholder';
import { formatSourceStatus } from '../../lib/text';
import { SectionHeader } from '../../components/SectionHeader';
import { WorkflowDiagram } from '../../components/WorkflowDiagram';
import {
  toolsSystemSignals,
  layerValueKeys,
  getProjectReader,
} from '../Projects/types';
import { ProjectLink } from '../Projects/index';
import { ThoughtEditorialHero, ThoughtFoundationsSection } from './Foundations';
import { TalksStage, IntegrationStage } from './Talks';
import { BooksShelf } from './Books';
import { CoursesCurriculum } from './Courses';
import { ThoughtArchitectureBridge } from './ArchitectureBridge';

export function ThoughtMediaSlot({
  label,
  value,
  actionLabel = 'Open link',
}: {
  label: string;
  value: string | PlaceholderLike;
  actionLabel?: string;
}) {
  const isPlaceholder = isPlaceholderValue(value);

  return (
    <div className="rounded-[1.25rem] bg-white/30 p-4">
      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted">{label}</p>
      <div className="mt-3 flex aspect-video items-center justify-center rounded-[1rem] bg-white/25 px-4 text-center text-sm leading-6 text-muted">
        {isPlaceholder ? contentValue(value) : 'Media link ready'}
      </div>
      <div className="mt-3">
        <ProjectLink label={actionLabel} value={value} />
      </div>
    </div>
  );
}

function SystemLayerStack({ system }: { system: ToolSystemEntry }) {
  return (
    <div className="grid gap-3">
      {toolLayerColumns.map((label, index) => {
        const value = system[layerValueKeys[label]];

        return (
          <div
            key={`${system.title}-${label}`}
            className="grid gap-3 border-t border-stroke/60 pt-4 first:border-t-0 first:pt-0 md:grid-cols-[0.22fr_0.78fr]"
          >
            <div>
              <p className="text-[0.62rem] uppercase tracking-[0.16em] text-muted">
                {String(index + 1).padStart(2, '0')}
              </p>
              <p className="mt-2 text-sm font-medium text-text-primary">{label}</p>
            </div>
            <p className="text-sm leading-6 text-muted">{value}</p>
          </div>
        );
      })}
    </div>
  );
}

function ArchitectureCoverageMatrix() {
  return (
    <div className="liquid-glass-strong mt-5 rounded-[2rem] p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-muted">Layer coverage</p>
          <h3 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-text-primary md:text-4xl">
            Each tool is a different expression of the same architecture.
          </h3>
        </div>
        <span className="liquid-glass rounded-full px-4 py-2 text-xs uppercase tracking-[0.18em] text-muted">
          {toolsAndSystems.length} systems
        </span>
      </div>

      <div className="mt-7 overflow-x-auto pb-2">
        <div className="min-w-[980px]">
          <div className="grid grid-cols-[1.1fr_repeat(5,minmax(0,1fr))] gap-2 text-[0.62rem] uppercase tracking-[0.16em] text-muted">
            <span>System</span>
            {toolLayerColumns.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          <div className="mt-3 grid gap-2">
            {toolsAndSystems.map((system) => (
              <div
                key={`matrix-${system.title}`}
                className="grid grid-cols-[1.1fr_repeat(5,minmax(0,1fr))] gap-2"
              >
                <div className="rounded-[1rem] bg-white/40 p-3">
                  <p className="text-sm font-medium leading-5 text-text-primary">{system.title}</p>
                  <p className="mt-1 text-[0.62rem] uppercase tracking-[0.14em] text-muted">
                    {system.systemType}
                  </p>
                </div>
                {toolLayerColumns.map((label) => (
                  <div key={`${system.title}-${label}-matrix`} className="rounded-[1rem] bg-white/28 p-3">
                    <p className="line-clamp-3 text-xs leading-5 text-muted">{system[layerValueKeys[label]]}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolSystemCard({ system, index }: { system: ToolSystemEntry; index: number }) {
  return (
    <motion.article
      className="liquid-glass flex flex-col rounded-[1.75rem] p-6 md:p-7"
      initial={{ opacity: 0, y: 24 }}
      key={system.title}
      transition={{ duration: 0.7, delay: index * 0.04 }}
      viewport={{ once: true, margin: '-80px' }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">{system.systemType}</p>
          <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-text-primary md:text-3xl">
            {system.title}
          </h3>
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted/80">{system.layer}</p>
        </div>
        <span className="shrink-0 rounded-full bg-white/40 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.16em] text-muted">
          {formatSourceStatus(system.sourceStatus)}
        </span>
      </div>

      <p className="mt-5 text-sm leading-7 text-muted">{system.description}</p>

      <div className="mt-7">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">Workflow diagram</p>
        <div className="mt-4">
          <WorkflowDiagram steps={system.workflow} />
        </div>
      </div>

      <div className="mt-7">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">Layer lenses</p>
        <div className="mt-4">
          <SystemLayerStack system={system} />
        </div>
      </div>

      <div className="mt-auto pt-7">
        <div className="grid gap-3 border-t border-stroke/60 pt-5 md:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-[0.62rem] uppercase tracking-[0.16em] text-muted">Proof</p>
            <p className="mt-2 text-sm leading-6 text-text-primary">{system.proof}</p>
          </div>
          <div>
            <p className="text-[0.62rem] uppercase tracking-[0.16em] text-muted">Diagram slot</p>
            <p className="mt-2 text-sm leading-6 text-muted">{system.assetSlot}</p>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function ToolsSystemsPanel() {
  return (
    <section id="project-tools" className="bg-transparent py-12 md:py-16">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        <SectionHeader
          sectionNumber="02C"
          eyebrow="Projects / Tools"
          prefix="Tools"
          italic="and systems"
          copy="The tools branch of self-ware: agents, dashboards, pipelines, workflow loops, and reusable AI product infrastructure."
        />

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="liquid-glass-strong rounded-[2rem] p-7 md:p-8">
            <p className="text-xs uppercase tracking-[0.28em] text-muted">System logic</p>
            <h3 className="mt-6 max-w-xl font-body text-4xl font-semibold tracking-[-0.04em] text-text-primary md:text-5xl">
              Architecture is the work product.
            </h3>
            <p className="mt-6 text-sm leading-7 text-muted md:text-base">
              The tools branch is not a second project gallery. It shows the reusable machinery underneath the work: context loading, workflow orchestration, evals, guardrails, cost control, and human review boundaries.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {toolsSystemSignals.map((signal) => (
                <div key={signal.label} className="rounded-[1.1rem] bg-white/35 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">{signal.label}</p>
                  <p className="mt-3 text-sm leading-6 text-text-primary">{signal.detail}</p>
                  <p className="mt-3 text-[0.62rem] uppercase tracking-[0.16em] text-muted">{signal.proof}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="liquid-glass rounded-[2rem] p-7 md:p-8">
            <p className="text-xs uppercase tracking-[0.28em] text-muted">Reusable stack</p>
            <div className="mt-6 grid gap-4">
              {architectureLayers.map((layer, index) => (
                <div
                  key={layer.label}
                  className="grid gap-3 border-t border-stroke/60 pt-4 first:border-t-0 first:pt-0 md:grid-cols-[0.28fr_0.72fr]"
                >
                  <div>
                    <p className="text-[0.62rem] uppercase tracking-[0.16em] text-muted">
                      {String(index + 1).padStart(2, '0')}
                    </p>
                    <p className="mt-2 text-base font-medium text-text-primary">{layer.label}</p>
                  </div>
                  <div>
                    <p className="text-sm leading-6 text-text-primary">{layer.purpose}</p>
                    <p className="mt-2 text-xs leading-5 text-muted">{layer.examples}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <ArchitectureCoverageMatrix />

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {toolsAndSystems.map((system, index) => (
            <ToolSystemCard key={system.title} system={system} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ActDivider({
  act,
  id,
  label,
  body,
}: {
  act: string;
  id: string;
  label: string;
  body: string;
}) {
  return (
    <motion.div
      id={id}
      className="thought-act-divider thought-format-section"
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-120px' }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <span className="thought-act-divider-rule" aria-hidden="true" />
      <div className="thought-act-divider-body">
        <p className="thought-act-divider-eyebrow">Act {act}</p>
        <h3 className="thought-act-divider-title">{label}</h3>
        <p className="thought-act-divider-copy">{body}</p>
      </div>
      <span className="thought-act-divider-numeral" aria-hidden="true">
        {act}
      </span>
    </motion.div>
  );
}

function ThoughtsBuildCrescendo({ onOpen }: { onOpen: (item: CaseStudyEntry) => void }) {
  const osReader = getProjectReader('AI Native Product OS');

  return (
    <motion.section
      id="thoughts-os"
      className="thoughts-build-crescendo thought-format-section"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.75, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <span className="thoughts-build-crescendo-glow" aria-hidden="true" />
      <div className="thoughts-build-crescendo-inner">
        <p className="thoughts-build-eyebrow">The payoff · what it builds</p>
        <h3 className="thoughts-build-title">
          It all compiles into one
          <span className="thoughts-build-title-serif"> operating system.</span>
        </h3>
        <p className="thoughts-build-copy">
          The AI-Native Product OS is the five-layer stack every product in this portfolio runs on — model,
          context, orchestration, governance, and human. The thinking isn't decoration; it's the architecture.
        </p>

        <div className="thoughts-build-layers" aria-label="Five-layer AI-native stack">
          {architectureLayers.map((layer, index) => (
            <div key={layer.label}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{layer.label}</strong>
              <p>{layer.purpose}</p>
            </div>
          ))}
        </div>

        <div className="thoughts-build-actions">
          <button
            type="button"
            className="thoughts-build-primary"
            disabled={!osReader}
            onClick={() => {
              if (osReader) onOpen(osReader);
            }}
          >
            {osReader ? 'Open the AI-Native Product OS →' : 'Reader needed'}
          </button>
          <a className="thoughts-build-secondary" href="#projects">
            See the products →
          </a>
        </div>

        <div className="thoughts-build-motif">
          <p>How I think. How I express it. What it builds.</p>
          <h4>One argument keeps taking product form.</h4>
        </div>
      </div>
    </motion.section>
  );
}

export function TeachingWritingShelf({ onOpen }: { onOpen: (item: CaseStudyEntry) => void }) {
  const { teaching, speaking, writing } = portfolioContent.teachingSpeakingWriting;
  const spine = portfolioContent.teachingSpeakingWriting.frame.thesisSpine;

  return (
    <section id="teaching-speaking-writing" className="thoughts-editorial relative isolate overflow-hidden">
      <AuroraBackground className="thoughts-aurora-shell min-h-full items-stretch justify-start bg-zinc-50">
        <ThoughtEditorialHero />

        <div className="thoughts-editorial-body relative z-10 mx-auto grid max-w-[1440px] gap-6 px-5 py-8 pb-32 sm:px-8 md:px-12 md:py-12 md:pb-32 lg:px-16">
          <ActDivider act="I" id="thoughts-act-think" label={spine[0].label} body={spine[0].body} />
          <ThoughtFoundationsSection />
          <TalksStage talks={speaking} />

          <ActDivider act="II" id="thoughts-act-express" label={spine[1].label} body={spine[1].body} />
          <BooksShelf books={writing.books} />
          <IntegrationStage talks={speaking} />

          <ActDivider act="III" id="thoughts-act-build" label={spine[2].label} body={spine[2].body} />
          <CoursesCurriculum courses={teaching} />
          <ThoughtArchitectureBridge />
          <ThoughtsBuildCrescendo onOpen={onOpen} />
        </div>
      </AuroraBackground>
    </section>
  );
}
