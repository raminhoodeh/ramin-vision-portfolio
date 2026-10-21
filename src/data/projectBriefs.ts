export type ProjectBriefContent = {
  who: string;
  owned: string;
  decision: string;
  current: string;
  evidence: string;
  links: readonly { label: string; href: string }[];
};

export const projectBriefs: Record<string, ProjectBriefContent> = {
  nsso: {
    who: 'People bringing their profile, work and products into one public identity.',
    owned: 'Independent product design and implementation, including Deity and commerce integrations.',
    decision: 'Show before/after review cards before AI changes the owner’s profile.',
    current: 'Live profile and storefront product with an AI coaching surface.',
    evidence: 'Live product and public profile. Adoption, conversion lift and AI quality results are not published here.',
    links: [{ label: 'Live product', href: 'https://nsso.me/' }, { label: 'My public profile', href: 'https://nsso.me/ramin' }],
  },
  Dreamsea: {
    who: 'People trying to capture a dream before the details disappear.',
    owned: 'Product design and implementation with a psychotherapist partner shaping interpretation context.',
    decision: 'Capture voice first; save generation progress and let the domain expert edit prompts and knowledge.',
    current: 'Released iPhone app, with on-device persistence and cloud AI generation.',
    evidence: 'Public App Store release and recorded product flow. Retention and interpretation-quality benchmarks are not published here.',
    links: [{ label: 'App Store', href: 'https://apps.apple.com/us/app/dreamsea/id6761101193' }],
  },
  Qadam: {
    who: 'Me and trading collaborators reviewing financial research and paper-only decisions.',
    owned: 'Research workflow, decision records and guarded paper operations, informed by trader feedback.',
    decision: 'Separate model reasoning from execution authority; block action when evidence or permissions are missing.',
    current: 'Operating paper-only research system. No live capital; cockpit access may require approval.',
    evidence: 'Workflow screenshots and decision records. These do not establish a trading edge, validated returns or quantum advantage.',
    links: [{ label: 'Qadam', href: 'https://qadam.trade/dashboard' }],
  },
  '24Seven Concierge': {
    who: 'A boutique travel business whose clients preferred conversation to catalogue browsing.',
    owned: 'The AI concierge enhancement inside the client’s existing app and Shopify catalogue—not the original app.',
    decision: 'Use catalogue context and structured product handles for visual suggestions; hand booking confirmation to a human.',
    current: 'AI planning feature in a released client app, ending in a WhatsApp concierge handoff.',
    evidence: 'App Store listing and feature recording. Booking conversion, revenue lift and formal AI-quality results are not published here.',
    links: [{ label: 'App Store', href: 'https://apps.apple.com/us/app/24seven-concierge/id6663954162' }],
  },
  RazinFlix: {
    who: 'Me, family and friends choosing films from recommendations we trust.',
    owned: 'Curated collection, enrichment workflow and the browsing interface.',
    decision: 'Keep human curation in charge; use automation and AI-assisted ingestion to maintain the catalogue.',
    current: 'Live film-discovery library with browsing, trailers and curator tools.',
    evidence: 'Live catalogue and recorded workflow. A working personal library is the result; audience growth is not claimed.',
    links: [{ label: 'Live library', href: 'https://nsso.me/film/razinflix' }],
  },
  'AI-Native Product Manager OS': {
    who: 'Product managers using AI coding assistants for recurring product work.',
    owned: 'The operating framework and installable workspace of context, workflows and templates.',
    decision: 'Make reusable context and review steps part of the workspace, rather than rely on one-off prompts.',
    current: 'Public, installable local workspace; integrations depend on the user’s connected tools.',
    evidence: 'Repository, setup instructions and workflow materials. Team productivity gains are not independently measured here.',
    links: [{ label: 'GitHub', href: 'https://github.com/raminhoodeh/AI-Native-Product-OS' }],
  },
  'Mass Social Wisdom Agent': {
    who: 'People turning saved links and screenshots into knowledge they can review and reuse.',
    owned: 'Source ingestion, extraction, categorisation and document-export workflow.',
    decision: 'Preserve source attribution and expose model self-scores as review aids, not independent quality measurements.',
    current: 'Public repository and a quota-limited live portfolio demo.',
    evidence: 'Runnable workflow and document output. Extraction fidelity and self-score calibration still need labelled evaluation.',
    links: [{ label: 'GitHub', href: 'https://github.com/raminhoodeh/mass-social-wisdom-agent' }],
  },
  'AI Costs Dashboard': {
    who: 'Builders who need to inspect model usage and cost before choosing where to optimise.',
    owned: 'Standalone metering, cached-eval routing and dashboard library.',
    decision: 'Make cost, task quality and fallback behaviour inspectable together.',
    current: 'Public library and seeded demo; illustrative product usage is not live telemetry from my apps.',
    evidence: 'Repository, tests and demo. Real product savings, production latency and cross-app deployment are not established here.',
    links: [{ label: 'GitHub', href: 'https://github.com/raminhoodeh/ai-costs-dashboard' }],
  },
  'RAG Pipeline': {
    who: 'AI-product builders needing attributable context from separate source collections.',
    owned: 'Standalone ingestion, chunking, embedding, retrieval and context-packing package.',
    decision: 'Scope retrieval by namespace and carry source tags into the packed context.',
    current: 'Public package with an offline demo and provider/store adapters. Reranking remains planned.',
    evidence: 'Repository and deterministic tests. Semantic retrieval quality and private-app deployment are not established here.',
    links: [{ label: 'GitHub', href: 'https://github.com/raminhoodeh/unified-rag-pipeline' }],
  },
};

export function getProjectBrief(title: string) {
  if (title === 'AI Native Product OS' || title === 'AI-Native Product OS') return projectBriefs['AI-Native Product Manager OS'];
  return projectBriefs[title];
}
