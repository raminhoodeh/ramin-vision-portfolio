import { motion } from 'framer-motion';
import { portfolioContent, architectureLayers } from '../../data/portfolio';
import {
  type WritingCaseStudyEntry,
  type CaseStudyEntry,
  type CaseWriteupLineageItem,
  type StackLayerName,
  type ThoughtStackComparisonRow,
  type WorkItem,
  toolLayerColumns,
} from '../types';
import { isPlaceholderValue, contentValue, type PlaceholderLike } from '../../lib/placeholder';
import { slugifyTitle } from '../../lib/text';
import {
  selfwareGeneratedArtwork,
  toolGeneratedArtwork,
  ProjectLink,
} from '../Projects/index';
import {
  getProjectReader,
  toolSystemBySlug,
  thoughtArchitectureByProject,
  layerValueKeys,
  caseStudyByDeepDiveSlug,
  workCaseStudyByTitle,
} from '../Projects/types';

function caseWriteupReaderSection(reader: CaseStudyEntry | undefined, label: string) {
  return reader?.sections.find((section) => section.label.toLowerCase().startsWith(label.toLowerCase()));
}

function caseWriteupToolSystem(projectName: string) {
  return toolSystemBySlug.get(slugifyTitle(projectName));
}

function caseWriteupToolFallback(projectName: string, label: string) {
  const system = caseWriteupToolSystem(projectName);
  if (!system) return undefined;
  const labelKey = label.toLowerCase();
  const customFallbacks: Record<string, Record<string, string>> = {
    'AI Costs Dashboard': {
      'why this approach':
        'Observability has to be a product surface, not an invoice reviewed after the fact. Cost, latency, model choice, endpoint, and failure patterns only become governable when they are visible beside product value.',
      tradeoffs:
        'The first version optimizes for product-level cost and latency awareness, not a complete ML observability platform. It should inform product decisions without pretending to replace eval suites.',
      'demo / proof':
        'The workflow is Log call -> Group usage -> Detect anomaly -> Review spend -> Tune feature, designed for nsso, Dreamsea, and future AI products where spend and quality need the same review surface.',
      'what i would improve':
        'Next step: publish an anonymised dashboard view that shows per-feature cost, latency, failure rate, and quality signals together.',
    },
    'RAG Pipeline': {
      'why this approach':
        'Durable context beats one-off prompting when a product depends on trusted knowledge. The deliberate choice is to make ingestion, retrieval, verification, and context injection reusable infrastructure.',
      tradeoffs:
        'Reusability creates abstraction pressure. Each product still needs source curation, retrieval thresholds, prompt-injection handling, and eval coverage specific to its user risk.',
      'demo / proof':
        'The pattern appears across nsso and Dreamsea: curated source material becomes retrievable context instead of freeform prompt stuffing.',
      'what i would improve':
        'Next step: add a source-safe ingestion/retrieval diagram and formal eval coverage for retrieval quality, link verification, and prompt-injection handling.',
    },
  };

  const customValue = customFallbacks[projectName]?.[labelKey];
  if (customValue) return customValue;

  if (labelKey.startsWith('problem')) return system.description;
  if (labelKey.startsWith('architecture')) {
    return `Model: ${system.modelLayer} Context: ${system.contextLayer} Orchestration: ${system.orchestrationLayer}`;
  }
  if (labelKey.startsWith('why')) return `${system.layer} is explicit because ${system.humanLayer}`;
  if (labelKey.startsWith('tradeoff')) return system.governanceLayer;
  if (labelKey.startsWith('demo')) return system.proof;
  if (labelKey.startsWith('what')) return system.assetSlot;

  return undefined;
}

function caseWriteupSnippet(
  projectName: string,
  reader: CaseStudyEntry | undefined,
  label: string,
  fallback: string | PlaceholderLike,
) {
  return caseWriteupReaderSection(reader, label)?.body[0] ?? caseWriteupToolFallback(projectName, label) ?? contentValue(fallback);
}

function caseWriteupStructureCards(entry: WritingCaseStudyEntry, reader: CaseStudyEntry | undefined) {
  return [
    { label: 'Problem', value: caseWriteupSnippet(entry.projectName, reader, 'Problem', entry.problem) },
    { label: 'Architecture', value: caseWriteupSnippet(entry.projectName, reader, 'Architecture', entry.architecture) },
    { label: 'Why this approach', value: caseWriteupSnippet(entry.projectName, reader, 'Why this approach', entry.whyThisApproach) },
    { label: 'Tradeoff', value: caseWriteupSnippet(entry.projectName, reader, 'Tradeoffs', entry.tradeoffs) },
    { label: 'Demo', value: caseWriteupSnippet(entry.projectName, reader, 'Demo / proof', entry.liveLink) },
    {
      label: 'Improve',
      value: caseWriteupSnippet(entry.projectName, reader, 'What I would improve', entry.whatIWouldImprove),
    },
  ];
}

export function caseWriteupArtwork(projectName: string, reader?: CaseStudyEntry) {
  return selfwareGeneratedArtwork[projectName] ?? toolGeneratedArtwork[projectName] ?? reader?.heroImage;
}

export function caseWriteupTone(projectName: string): 'product' | 'tool' {
  return toolGeneratedArtwork[projectName] ? 'tool' : 'product';
}

export function caseWriteupLineage(projectName: string) {
  return thoughtArchitectureByProject.get(projectName);
}

function CaseWriteupVisual({
  title,
  label,
  image,
  index,
  tone = 'product',
}: {
  title: string;
  label: string;
  image?: string;
  index: number;
  tone?: 'product' | 'tool' | 'thesis';
}) {
  return (
    <div className="case-writeup-visual" data-tone={tone}>
      {image ? (
        <img
          src={image}
          alt={`${title} case study visual`}
          loading={index <= 1 ? 'eager' : 'lazy'}
          decoding="async"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      ) : null}
      <div className="case-writeup-visual-shade" aria-hidden="true" />
      <div className="case-writeup-visual-grid" aria-hidden="true" />
      <div className="case-writeup-visual-copy">
        <span>{label}</span>
        <strong>{title}</strong>
      </div>
    </div>
  );
}

export function CaseWriteupLineageStrip({ items }: { items: readonly CaseWriteupLineageItem[] }) {
  return (
    <div className="case-writeup-lineage-strip">
      {items.map((item) => (
        <div key={item.label}>
          <span>{item.label}</span>
          <p>{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function CaseWriteupInsightDeck({
  cards,
  footerLabel,
  footerValue,
}: {
  cards: readonly { label: string; value: string }[];
  footerLabel?: string;
  footerValue?: string;
}) {
  return (
    <div className="case-writeup-proof" data-card-count={cards.length}>
      {cards.map((card) => (
        <div key={card.label}>
          <span>{card.label}</span>
          <p>{card.value}</p>
        </div>
      ))}
      {footerLabel && footerValue ? (
        <div className="case-writeup-proof-wide">
          <span>{footerLabel}</span>
          <p>{footerValue}</p>
        </div>
      ) : null}
    </div>
  );
}

function CaseWriteupActionLinks({
  entry,
  reader,
}: {
  entry: WritingCaseStudyEntry;
  reader?: CaseStudyEntry;
}) {
  const readerLinks = reader?.links ?? [];
  const entryLinks = [
    { label: 'Live link', value: entry.liveLink },
    { label: 'GitHub', value: entry.githubLink },
    { label: 'Full write-up', value: entry.fullWriteupLink },
  ].filter((link) => !isPlaceholderValue(link.value));

  if (readerLinks.length) {
    return (
      <div>
        {readerLinks.slice(0, 3).map((link) => (
          <ProjectLink key={`${entry.projectName}-${link.href}`} label={link.label} value={link.href} />
        ))}
      </div>
    );
  }

  if (entryLinks.length) {
    return (
      <div>
        {entryLinks.map((link) => (
          <ProjectLink key={`${entry.projectName}-${link.label}`} label={link.label} value={link.value} />
        ))}
      </div>
    );
  }

  return <p className="case-writeup-action-note">Source-registry brief</p>;
}

export function AiNativeProductOsWriteupRow({ onOpen }: { onOpen: (item: CaseStudyEntry) => void }) {
  const os = portfolioContent.teachingSpeakingWriting.writing.aiNativeProductOs;
  const thesisReader = caseStudyByDeepDiveSlug.get('ai-native-product-os');
  const workflowSummary = os.workflowDiagram.join(' -> ');
  const image = toolGeneratedArtwork['AI Native Product OS'];
  const insightCards = [
    { label: 'Problem', value: contentValue(os.problem) },
    { label: 'Architecture', value: contentValue(os.architecture) },
    { label: 'Tradeoffs', value: contentValue(os.tradeoffs) },
  ];
  const lineageItems: CaseWriteupLineageItem[] = [
    { label: 'Foundation', value: 'AI-Native Product OS' },
    { label: 'Core loop', value: workflowSummary },
    { label: 'Stack', value: os.layerLensesOverview.join(' / ') },
  ];

  return (
    <motion.article
      className="case-writeup-row case-writeup-row-thesis"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.58 }}
      viewport={{ once: true, margin: '-80px' }}
    >
      <span className="case-writeup-index-number">00</span>

      <CaseWriteupVisual
        title="AI-Native Product OS"
        label="Thesis system"
        image={image}
        index={0}
        tone="thesis"
      />

      <div className="case-writeup-main">
        <div className="flex flex-wrap gap-2">
          <span className="case-writeup-chip">Thesis</span>
          <span className="case-writeup-chip">AI-Native Product OS</span>
          {thesisReader?.readTime ? <span className="case-writeup-chip">{thesisReader.readTime}</span> : null}
        </div>
        <h4 className="mt-4 text-3xl font-semibold tracking-[-0.055em] text-white md:text-5xl">
          AI-Native Product OS
        </h4>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/62">{thesisReader?.summary ?? contentValue(os.problem)}</p>
        <CaseWriteupLineageStrip items={lineageItems} />
      </div>

      <CaseWriteupInsightDeck cards={insightCards} footerLabel="Workflow" footerValue={workflowSummary} />

      <div className="case-writeup-actions">
        <button
          type="button"
          disabled={!thesisReader}
          onClick={() => {
            if (thesisReader) onOpen(thesisReader);
          }}
        >
          {thesisReader ? 'Open thesis' : 'Reader needed'}
        </button>
        <div>
          <ProjectLink label="Live link" value={os.liveLink} />
          <ProjectLink label="GitHub" value={os.githubLink} />
          <ProjectLink label="Full write-up" value={os.fullWriteupLink} />
        </div>
      </div>
    </motion.article>
  );
}

function CaseStudyWriteupRow({
  entry,
  index,
  onOpen,
}: {
  entry: WritingCaseStudyEntry;
  index: number;
  onOpen: (item: CaseStudyEntry) => void;
}) {
  const reader = getProjectReader(entry.projectName);
  const rowLabel = reader?.tag ?? reader?.typeLabel ?? 'Case study';
  const image = caseWriteupArtwork(entry.projectName, reader);
  const tone = caseWriteupTone(entry.projectName);
  const lineage = caseWriteupLineage(entry.projectName);
  const insightCards = caseWriteupStructureCards(entry, reader);
  const lineageItems: CaseWriteupLineageItem[] = lineage
    ? [
        { label: 'Kind', value: tone === 'tool' ? 'Tool system' : 'Product' },
        { label: 'Foundation', value: lineage.foundation },
        { label: 'Result', value: lineage.outcome },
      ]
    : [
        { label: 'Kind', value: tone === 'tool' ? 'Tool system' : 'Product' },
        { label: 'Built form', value: tone === 'tool' ? 'Tool system' : 'Product system' },
        { label: 'Reader', value: reader ? 'Full six-part write-up available.' : 'Condensed system brief from source registry.' },
      ];

  return (
    <motion.article
      className="case-writeup-row"
      data-tone={tone}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.58, delay: index * 0.035 }}
      viewport={{ once: true, margin: '-80px' }}
    >
      <span className="case-writeup-index-number">{String(index + 1).padStart(2, '0')}</span>

      <CaseWriteupVisual title={entry.projectName} label={rowLabel} image={image} index={index + 1} tone={tone} />

      <div className="case-writeup-main">
        <div className="flex flex-wrap gap-2">
          <span className="case-writeup-chip">{rowLabel}</span>
          {lineage ? <span className="case-writeup-chip">{lineage.foundation}</span> : null}
          {reader?.readTime ? <span className="case-writeup-chip">{reader.readTime}</span> : null}
        </div>
        <h4 className="mt-4 text-3xl font-semibold tracking-[-0.055em] text-white md:text-5xl">
          {entry.projectName}
        </h4>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/62">{reader?.summary ?? contentValue(entry.problem)}</p>
      <CaseWriteupLineageStrip items={lineageItems} />
      </div>

      <CaseWriteupInsightDeck cards={insightCards} />

      <div className="case-writeup-actions">
        {reader ? (
          <button type="button" onClick={() => onOpen(reader)}>
            Open reader
          </button>
        ) : (
          <span className="case-writeup-action-status">System brief</span>
        )}
        <CaseWriteupActionLinks entry={entry} reader={reader} />
      </div>
    </motion.article>
  );
}

function CaseStudyFruitCoda({ mappedLineageCount }: { mappedLineageCount: number }) {
  const cards = [
    {
      label: 'Judgment',
      value: 'I start with the problem, understand the architecture, then make the tradeoffs explicit.',
    },
    {
      label: 'Formation',
      value: 'Each product carries the shape of the thinking that produced it.',
    },
    {
      label: 'Mapped lineage',
      value: `${mappedLineageCount} products and tools trace a direct line from foundational thinking into product and AI architecture.`,
    },
  ];

  return (
    <div className="case-writeup-coda">
      <div>
        <p>What remains</p>
        <h4>Not a list of projects. A record of judgment.</h4>
      </div>
      <div className="case-writeup-coda-grid">
        {cards.map((card) => (
          <div key={card.label}>
            <span>{card.label}</span>
            <p>{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function layerValueFromWork(work: WorkItem | undefined, label: StackLayerName) {
  return work?.architectureChips.find((chip) => chip.label === label)?.value;
}

function createThoughtStackRow(entry: WritingCaseStudyEntry): ThoughtStackComparisonRow {
  const work = workCaseStudyByTitle.get(entry.projectName);
  const system = caseWriteupToolSystem(entry.projectName);
  const lineage = caseWriteupLineage(entry.projectName);
  const kind = caseWriteupTone(entry.projectName) === 'tool' ? 'Tool' : 'Product';
  const source = work ? 'Full write-up' : system ? 'System registry' : 'Case-study brief';

  return {
    projectName: entry.projectName,
    descriptor: work?.tag ?? system?.systemType ?? kind,
    kind,
    foundation: lineage?.foundation ?? (system ? 'AI-Native Product OS' : 'Framework of Metacognition'),
    outcome: lineage?.outcome ?? system?.proof ?? work?.summary ?? contentValue(entry.problem),
    source,
    layers: {
      Model: layerValueFromWork(work, 'Model') ?? system?.modelLayer ?? caseWriteupSnippet(entry.projectName, undefined, 'Problem', entry.problem),
      Context: layerValueFromWork(work, 'Context') ?? system?.contextLayer ?? caseWriteupSnippet(entry.projectName, undefined, 'Architecture', entry.architecture),
      Orchestration:
        layerValueFromWork(work, 'Orchestration') ??
        system?.orchestrationLayer ??
        caseWriteupSnippet(entry.projectName, undefined, 'Why this approach', entry.whyThisApproach),
      Governance:
        layerValueFromWork(work, 'Governance') ??
        system?.governanceLayer ??
        caseWriteupSnippet(entry.projectName, undefined, 'Tradeoffs', entry.tradeoffs),
      Human:
        layerValueFromWork(work, 'Human') ??
        system?.humanLayer ??
        caseWriteupSnippet(entry.projectName, undefined, 'What I would improve', entry.whatIWouldImprove),
    },
  };
}

function StackLayerCompass() {
  return (
    <div className="stack-comparison-compass" aria-label="Five layer stack">
      {architectureLayers.map((layer, index) => (
        <div key={layer.label}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <strong>{layer.label}</strong>
          <p>{layer.purpose}</p>
        </div>
      ))}
    </div>
  );
}

export function StackComparisonFinale({ caseStudies }: { caseStudies: readonly WritingCaseStudyEntry[] }) {
  const rows = caseStudies
    .filter((entry) => entry.projectName !== 'AI Native Product OS')
    .map(createThoughtStackRow);
  const productCount = rows.filter((row) => row.kind === 'Product').length;
  const toolCount = rows.filter((row) => row.kind === 'Tool').length;

  return (
    <section id="thoughts-stack-comparison" className="thought-format-section stack-comparison-finale">
      <div className="stack-comparison-heading">
        <div>
          <p>08 / Stack recap</p>
          <h3>The same five layers, eight outcomes.</h3>
          <span>
            The products look different on the surface, but I keep solving through the same Model, Context, Orchestration, Governance, and Human stack.
          </span>
        </div>
        <div className="stack-comparison-summary">
          <strong>{rows.length}</strong>
          <span>Outcomes mapped</span>
          <p>{productCount} products / {toolCount} tool systems</p>
        </div>
      </div>

      <div className="stack-comparison-thesis">
        <div>
          <span>Underlying question</span>
          <blockquote>What does the whole stack look like across the products and tools?</blockquote>
        </div>
        <p>
          The stack is how I compress the work into one view. Dreamsea, nsso, Qadam, 24Seven, RazinFlix, Mass Social Wisdom Agent, AI Costs Dashboard, and the RAG Pipeline are different expressions of one product judgment system.
        </p>
      </div>

      <StackLayerCompass />

      <div className="stack-comparison-table-shell" aria-label="Products and tools mapped to the five layer AI-native stack">
        <table className="stack-comparison-table">
          <thead>
            <tr>
              <th scope="col">Outcome</th>
              {toolLayerColumns.map((layer) => (
                <th key={layer} scope="col">{layer}</th>
              ))}
              <th scope="col">Lineage</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={row.projectName}>
                <th scope="row">
                  <span>{String(rowIndex + 1).padStart(2, '0')}</span>
                  <strong>{row.projectName}</strong>
                  <em>{row.descriptor}</em>
                </th>
                {toolLayerColumns.map((layer) => (
                  <td key={`${row.projectName}-${layer}`}>
                    <span>{layer}</span>
                    <p>{row.layers[layer]}</p>
                  </td>
                ))}
                <td>
                  <span>{row.foundation}</span>
                  <p>{row.outcome}</p>
                  <em>{row.source}</em>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="stack-comparison-coda">
        <p>How I think. How I express it. What it builds.</p>
        <h4>One argument keeps taking product form.</h4>
      </div>
    </section>
  );
}

export function CaseStudyWriteupIndex({
  caseStudies,
  onOpen,
}: {
  caseStudies: readonly WritingCaseStudyEntry[];
  onOpen: (item: CaseStudyEntry) => void;
}) {
  const displayCaseStudies = caseStudies.filter((entry) => entry.projectName !== 'AI Native Product OS');
  const writeupCount = displayCaseStudies.length;
  const productCount = displayCaseStudies.filter((entry) => !toolGeneratedArtwork[entry.projectName]).length;
  const toolCount = displayCaseStudies.filter((entry) => toolGeneratedArtwork[entry.projectName]).length;
  const readerCount = displayCaseStudies.reduce((total, entry) => total + (getProjectReader(entry.projectName) ? 1 : 0), 0);
  const writingFrame = portfolioContent.teachingSpeakingWriting.frame;
  const foundations = portfolioContent.teachingSpeakingWriting.foundations.foundations;
  const mappedLineageCount = displayCaseStudies.reduce(
    (total, entry) => total + (caseWriteupLineage(entry.projectName) ? 1 : 0),
    0,
  );
  const formationQuoteSerif = 'You are shaped by what you create.';
  const formationQuoteLead = writingFrame.formationQuote.replace(formationQuoteSerif, '').trim();

  return (
    <section id="thoughts-case-studies" className="thought-format-section case-writeup-index">
      <div className="case-writeup-heading">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/46">07 / Built products and tools</p>
          <h3 className="mt-4 text-5xl font-semibold tracking-[-0.065em] text-white md:text-7xl">
            What the thinking builds.
          </h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/58">
            Clarity, expression, the middle way, and operating systems eventually have to become shipped surfaces, agents, pipelines, and product architecture.
          </p>
        </div>
        <span className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-white/58">
          {writeupCount} outcomes
        </span>
      </div>

      <div className="case-writeup-primer">
        <div>
          <p className="text-xs uppercase tracking-[0.26em] text-white/42">The question</p>
          <blockquote className="case-writeup-stage-question">
            What products and tools have I made through that?
          </blockquote>
          <p className="case-writeup-primer-quote mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.055em] text-white md:text-5xl">
            "{formationQuoteLead}{' '}
            <span className="case-writeup-primer-quote-serif">{formationQuoteSerif}</span>"
          </p>
          <p className="case-writeup-primer-copy mt-5 max-w-2xl text-sm leading-7 text-white/58">
            I want each product to reveal the same deeper movement: the problem I saw, the architecture I chose, the tradeoffs I accepted, and the judgment I would sharpen next.
          </p>
          <div className="case-writeup-foundation-strip" aria-label="Foundations carried into the case studies">
            {foundations.map((foundation) => (
              <span key={foundation.title}>{foundation.title}</span>
            ))}
          </div>
        </div>
        <div className="case-writeup-stat-grid">
          <div>
            <span>{writeupCount}</span>
            <p>Outcomes</p>
          </div>
          <div>
            <span>{readerCount}</span>
            <p>Readers</p>
          </div>
          <div>
            <span>{foundations.length}</span>
            <p>Foundations</p>
          </div>
          <div>
            <span>{productCount}</span>
            <p>Products</p>
          </div>
          <div>
            <span>{toolCount}</span>
            <p>Systems</p>
          </div>
          <div>
            <span>{mappedLineageCount}</span>
            <p>Lineages</p>
          </div>
        </div>
      </div>

      <div className="case-writeup-rows">
        {displayCaseStudies.map((entry, index) => (
          <CaseStudyWriteupRow key={entry.projectName} entry={entry} index={index} onOpen={onOpen} />
        ))}
      </div>

      <CaseStudyFruitCoda mappedLineageCount={mappedLineageCount} />
    </section>
  );
}
