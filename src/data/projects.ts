import { pmOsThesisUrl } from './nav';
import type { DeepDive, WorkCaseStudy, ArchitectureLayer, ToolSystem } from './shared';

export const deepDives = [
  {
    slug: 'ai-native-product-os',
    eyebrow: 'Core Thesis',
    title: 'AI-Native Product OS',
    dek: 'A practical operating system for AI product work: a durable stack and execution loop for probabilistic software, where context, governance, orchestration, and human judgement matter as much as model capability.',
    readTime: '12 min read',
    status: 'Primary essay',
    year: '2026',
    index: [
      'Context',
      'Architecture',
      'Why this approach',
      'Tradeoffs',
      'How to implement',
      'What I would improve',
    ],
    metadata: [
      { label: 'Best for', value: 'AI PM roles, hiring managers, product leaders' },
      { label: 'Core stack', value: 'Model, Context, Orchestration, Governance, Human' },
      { label: 'Loop', value: 'Talk -> Decide -> Build -> Observe -> Iterate' },
      { label: 'Reader goal', value: 'Understand how I design trustworthy AI-native product systems' },
    ],
    related: ['Mass Social Wisdom Agent', 'nsso Deity', 'Dreamsea generation pipeline', '24Seven AI concierge'],
    proofChips: [
      { label: 'Framework', value: '5-layer AI-native stack', sourceStatus: 'local-primary' },
      { label: 'Loop', value: 'Talk -> Decide -> Build -> Observe -> Iterate', sourceStatus: 'local-primary' },
      { label: 'Governance', value: 'Evals, guardrails, observability, fallbacks, cost control', sourceStatus: 'local-primary' },
      { label: 'Public identity', value: 'AI Builder | Fiction Author', sourceStatus: 'public-proof' },
    ],
    sourceLinks: [
      { label: 'Public profile', href: 'https://nsso.me/ramin', sourceStatus: 'public-proof' },
      {
        label: 'AI-Native Product OS',
        href: pmOsThesisUrl,
        sourceStatus: 'local-primary',
      },
      {
        label: 'Product course',
        href: 'https://www.udemy.com/course/the-fastest-way-to-become-a-product-manager/',
        sourceStatus: 'public-proof',
      },
    ],
    assetSlots: [
      { label: '5-layer stack diagram', note: 'Needs final visual system diagram.', sourceStatus: 'manual-needed' },
      { label: 'AI-native loop diagram', note: 'Needs a compact reader-side diagram.', sourceStatus: 'manual-needed' },
      { label: 'Four consequences table', note: 'Needs a polished visual version of the probabilistic-output consequences.', sourceStatus: 'manual-needed' },
      { label: 'Profile image', note: 'Local candidate exists; final choice needed.', sourceStatus: 'asset-lead' },
    ],
    sections: [
      {
        heading: 'Context - The operating system broke',
        body: [
          'For over a decade, product teams ran a linear pipeline - Idea -> Design -> Concept -> Alpha/Beta -> Live - because the material was deterministic. You could specify behaviour, build it, QA it, and trust it to repeat. That process was a masterpiece of risk management.',
          'Then the physics changed. Large language models are not deterministic. They are probabilistic: same prompt, different output. Nobody, including the researchers who built them, can fully predict what the model will say before it says it.',
          'That one property pulls the thread on every assumption the old pipeline was built on. A PRD cannot fully specify correct for a probabilistic system. Stage-gates cannot protect you when the model updates underneath you mid-sprint. Manual QA cannot scale when the failure modes are hallucination, prompt injection, and cost runaway, not regressions in a login form.',
          'The old process was not wrong. It was the right tool for deterministic material. The material changed. The process had to change with it - not as a preference, but as a physical consequence of what we are now building on top of.',
        ],
      },
      {
        heading: 'Architecture - The 5-Layer Stack the Loop runs on',
        body: [
          'The AI-Native Product OS replaces the linear pipeline with a loop: Talk -> Decide -> Build -> Observe -> Iterate. The Loop is measured in hours, not quarters. It is not a productivity framework; it is the shape probabilistic material forces on any honest process.',
          'The Loop runs on a 5-Layer Stack: Model, Context, Orchestration, Governance, and Human. Model is the raw intelligence - GPT, Claude, Gemini. Context is everything the model needs to act like a teammate: your company, product, users, voice, and strategy. Orchestration is agents, MCPs, and workflow wiring. Governance is evals, guardrails, observability, fallbacks, and audit trails. Human is vision, empathy, taste, communication, and judgment.',
          'The canonical verb-to-layer mapping matters. Talk is Human plus Context. Decide is Human plus Governance. Build is Model plus Orchestration. Observe is Governance. Iterate touches all five at once, feeding what you learned back into the Context Layer so the next loop runs richer.',
          'The Stack does not change. Only what sits inside each layer changes. That is what makes it durable: a cabinet that holds for the rest of your career, not a toolkit that decays in six months.',
        ],
      },
      {
        heading: 'Why This Approach - Four consequences, one property',
        body: [
          'The Stack takes the shape it does because of one property: outputs are probabilistic, not deterministic. Everything else is a consequence of that single fact.',
          'First, you cannot prompt-and-hope. You have to understand the model and load your context. Second, probabilistic systems need loops, not straight lines. Third, probabilistic systems need guardrails and evals, not hope. Fourth, probabilistic systems change what being a professional means.',
          'The alternative was to keep sprinkling AI on top of the old linear process - to build a faster horse. That approach treats AI as a shortcut on top of an existing workflow, not as a material with different physics. It produces impressive demos that do not survive contact with production.',
          'The old world valued alignment, documentation, checklists, coordination, single source of truth, consensus, and risk management. These were the right values for deterministic software. The new world values decision velocity, prototypes, evals, orchestration, living systems, taste, and intelligence management. The old values are not wrong; the new ones build upstairs from them.',
        ],
      },
      {
        heading: 'Tradeoffs - What this OS consciously gives up',
        body: [
          'Speed over exhaustive documentation. The OS bets that a clickable prototype on day three beats a thirty-page PRD on day thirty. This is right for probabilistic material and wrong for regulated, high-stakes deterministic systems. Know your material.',
          'Loops over stage-gates. The OS eliminates handoffs between design, engineering, and product, but this requires the team to develop new muscles - taste, eval discipline, and governance wiring - before they discard old safeguards. A rip-and-replace without those muscles leads to fast, ungoverned shipping.',
          'Measurement discipline over vibes. Rule #5 - ship what you can measure, hold what you cannot - means some features stay on the shelf longer than a vibe-based culture would tolerate. That friction is the point. Features that cannot be measured cannot be governed.',
          'Human judgment is not delegatable. The OS does not reduce the importance of the Human Layer; it increases it. When execution is cheap, the scarce resource is taste. Delegation without comprehension is abdication.',
        ],
      },
      {
        heading: 'How to Implement - Making your company future-proof',
        body: [
          'The strategy is Incremental Modular Adoption. Not a revolution, but a systematic upgrade of interchangeable parts.',
          'The six rules are the installation logic. Build something small this week. Never confuse a Model Layer update with a Stack change. The model is rented; your context is owned. You are not the builder; you are the conductor. Ship what you can measure; hold what you cannot. You are the Context Layer.',
          'The implementation sequence is practical: boot the Model Layer, load the Context Layer, wire the Orchestration Layer, install the Governance Layer, and activate the Human Layer. Pick a default frontier model, author your context files, connect your tools, run the Loop end-to-end on real work, then set the evals, guardrails, trace dashboard, and cost cap before pointing the feature at real users.',
          'The professional shift is clear: retire task administrator. Adopt outcome orchestrator. Point the Stack at an outcome. Hold the outcome.',
        ],
      },
      {
        heading: 'What I Would Improve - The honest version',
        body: [
          'The Governance Layer is under-installed in most teams. The most common gap is not a missing model or a thin context file; it is a Governance Layer that was never wired in because the demo worked and felt like enough. It is not enough. Governance cannot be retrofitted after an incident because bad outputs deposit into the Context Layer on every loop close.',
          'The Human Layer is the hardest to install. Vision, empathy, taste, communication, and judgment are easy to name and hard to compound. The OS can give you the structure, but not the reps. The reps come from shipping real things, reading the failures, and noticing the user subtext no eval suite would catch.',
          'The next meaningful improvement is better tooling for eval coverage. Most eval suites sit at 12 to 50 cases - enough to catch regressions, not enough to cover edge cases across all failure categories. The target is a living suite that grows automatically: every bug seen in the wild becomes a permanent test case.',
          'The handoff is this: a toolkit ages in six months, but an architecture compounds for ten years. Every new model release lands as fuel, not as an earthquake. Every new governance tool is sharper instrumentation. This OS was never really about AI; it was about installing a Stack that survives AI.',
        ],
      },
    ],
  },
  {
    slug: 'product-experience',
    eyebrow: '01 Work',
    title: 'Work',
    dek: 'Product leadership across AI search, ERP transformation, employee benefits, media sustainability, automotive marketplaces, geospatial APIs, climate risk, conversational AI, and electric vehicles.',
    readTime: '7 min scan',
    status: 'Career timeline',
    year: '2017-2026',
    index: ['AI product leadership', 'Internal transformation', 'Climate and platforms', 'What it proves'],
    metadata: [
      { label: 'Domains', value: 'AI search, ERP, benefits, media carbon, geospatial APIs, climate risk, EVs' },
      { label: 'Public proof', value: 'Green.org, Mi3 carbon calculator context, Microsoft OS Places connector' },
      { label: 'Confidentiality', value: 'Bayut and Side.inc details stay public-safe and outcome-led' },
    ],
    related: ['Bayut', 'Side.inc', 'GroupM', 'Ordnance Survey', 'Urgentem', 'Tesla'],
    proofChips: [
      { label: 'ERP shift', value: '20% cost reduction and 90% faster idea-to-feature cycle', sourceStatus: 'local-primary' },
      { label: 'Benefits app', value: 'App store ratings improved within 3 months', sourceStatus: 'local-primary' },
      { label: 'Media carbon', value: '£1B+ media investment measured in 2022', sourceStatus: 'local-primary' },
    ],
    sourceLinks: [
      {
        label: 'Green.org interview',
        href: 'https://green.org/2022/07/13/utilizing-media-to-build-a-sustainable-future/',
        sourceStatus: 'public-proof',
      },
      {
        label: 'Mi3 carbon calculator context',
        href: 'https://www.mi-3.com.au/20-07-2022/carbon-footprint-different-media-distribution-options-will-increasingly-influence-where',
        sourceStatus: 'public-proof',
      },
      {
        label: 'Microsoft OS Places connector',
        href: 'https://docs.microsoft.com/en-gb/connectors/ordnancesurveyplaces/',
        sourceStatus: 'public-proof',
      },
    ],
    assetSlots: [
      { label: 'Company logos', note: 'Needs approved logo set or monochrome treatment.', sourceStatus: 'manual-needed' },
      { label: 'Timeline proof cards', note: 'Public-safe role cards and metrics.', sourceStatus: 'local-primary' },
      { label: 'Product screenshots', note: 'Only include where permission is clear.', sourceStatus: 'manual-needed' },
    ],
    sections: [
      {
        heading: 'AI product leadership',
        body: [
          'At Bayut, the public-safe story is AI-native product work across property search, recommendations, and conversational AI: model selection, eval suite design, guardrails, MCP integration, and the AI-Native Product OS as a team framework.',
          'At Side.inc, the proof is operational transformation: replacing multiple internal ERP products with AI-coded in-house alternatives, reducing ERP operational costs, and making internal process improvement dramatically faster.',
        ],
      },
      {
        heading: 'Internal transformation',
        body: [
          'At Perkbox Vivup, the most relevant context is product judgement around app UX, monetisation, and checkout guidance: improvements that made the product easier to use while increasing lifetime value.',
          'At GroupM, product management moved through sustainability, data methodology, and media investment: turning carbon emissions modelling into a product specification used at meaningful market scale.',
        ],
      },
      {
        heading: 'Climate and platforms',
        body: [
          'Ordnance Survey, Urgentem, ERM, and Cox Automotive show breadth: geospatial APIs, climate risk analytics, lifecycle assessment, and automotive marketplace tooling.',
          'These roles matter because they prove product judgement across regulated, technical, and multi-stakeholder domains before AI became the centre of the story.',
        ],
      },
      {
        heading: 'What it proves',
        body: [
          'The through-line is not a single industry. It is the ability to translate ambiguous systems into usable products: data into decisions, stakeholder tension into roadmap clarity, and technical possibility into a user-facing product surface.',
          'The portfolio should keep this as a proof layer, not a CV dump: enough evidence to establish range, then deeper paths for the roles that matter most to AI product leadership.',
        ],
      },
    ],
  },
  {
    slug: 'selected-builds',
    eyebrow: '02 Projects',
    title: 'Projects',
    dek: 'Self-ware projects I built for identity, dreams, trading intelligence, luxury concierge workflows, film curation, and social wisdom extraction.',
    readTime: '6 min scan',
    status: 'Project map',
    year: '2026',
    index: ['Flagship', 'Signals', 'Concierge and curation', 'What to prove'],
    metadata: [
      { label: 'Lead with', value: 'nsso, Dreamsea, Qadam, 24Seven Concierge' },
      { label: 'Evidence style', value: 'Problem, architecture, tradeoffs, demo or public proof' },
      { label: 'Reader goal', value: 'See how product judgement turns into shipped systems' },
    ],
    related: ['nsso', 'Dreamsea', 'Qadam', '24Seven Concierge', 'RazinFlix', 'Mass Social Wisdom Agent'],
    proofChips: [
      { label: 'Dreamsea', value: 'Public App Store listing, version 2.5 at scrape time', sourceStatus: 'public-proof' },
      { label: '24Seven', value: 'Public App Store listing, version 1.2.4 at scrape time', sourceStatus: 'public-proof' },
      { label: 'Agent repo', value: 'Mass Social Wisdom Agent is public on GitHub', sourceStatus: 'public-proof' },
    ],
    sourceLinks: [
      { label: 'nsso', href: 'https://nsso.me/', sourceStatus: 'public-proof' },
      { label: 'Dreamsea App Store', href: 'https://apps.apple.com/us/app/dreamsea/id6761101193', sourceStatus: 'public-proof' },
      { label: 'Qadam', href: 'http://qadam.trade', sourceStatus: 'public-proof' },
      {
        label: '24Seven App Store',
        href: 'https://apps.apple.com/us/app/24seven-concierge/id6663954162',
        sourceStatus: 'public-proof',
      },
      {
        label: 'Mass Social Wisdom Agent',
        href: 'https://github.com/raminhoodeh/mass-social-wisdom-agent',
        sourceStatus: 'public-proof',
      },
    ],
    assetSlots: [
      { label: 'Project screenshots', note: 'Needed for nsso, Dreamsea, Qadam, 24Seven, RazinFlix.', sourceStatus: 'manual-needed' },
      { label: 'Architecture diagrams', note: 'Needed for agent, RAG, and catalog-grounded systems.', sourceStatus: 'manual-needed' },
      { label: 'Demo links', note: 'Use public apps now; add Looms or repos where safe.', sourceStatus: 'asset-lead' },
    ],
    sections: [
      {
        heading: 'Flagship',
        body: [
          'nsso should lead because it carries the strongest personal and strategic signal: professional identity online as a fragmentation problem, not just a presentation problem.',
          'Dreamsea is the strongest emotional product story: an AI dream journal and interpretation app that blends voice capture, symbolic frameworks, image generation, and privacy-first architecture.',
        ],
      },
      {
        heading: 'Signals',
        body: [
          'Qadam belongs as catalyst-driven macro intelligence: physical-world signals before market consensus, five intelligence pipelines, local LLM triage, frontier LLM strategy, and a paper-proof phase.',
          'Mass Social Wisdom Agent is the clearest autonomous workflow: Inspect, Route, Compose, Self-Assess, Categorise, Sort, Export. It extracts knowledge, not just links.',
        ],
      },
      {
        heading: 'Concierge and curation',
        body: [
          '24Seven Concierge shows catalog-grounded conversational planning over Shopify inventory, Gemini itinerary generation, WhatsApp handoff, Dubai expansion, and calendar booking.',
          'RazinFlix supports taste and system thinking: a personal film library turned into a streaming-style curation tool with enrichment, poster validation, Supabase persistence, and recommendations.',
        ],
      },
      {
        heading: 'What to prove',
        body: [
          'Every project page should answer six questions: problem, architecture, why this approach, tradeoffs, demo or proof, and what I would improve.',
          'The homepage should stay cinematic and scannable. The depth belongs in expandable readers, proof chips, source links, and visual evidence.',
        ],
      },
    ],
  },
  {
    slug: 'tools-systems',
    eyebrow: '02 Projects / Tools',
    title: 'Tools',
    dek: 'Reusable operating systems, agents, dashboards, pipelines, and governance loops that show how the thinking turns into product infrastructure.',
    readTime: '6 min scan',
    status: 'Architecture map',
    year: '2026',
    index: ['Operating systems', 'Context layer', 'Orchestration', 'Governance'],
    metadata: [
      { label: 'Model layer', value: 'Gemini, local LLMs, frontier LLMs' },
      { label: 'Context layer', value: 'RAG, wiki injection, profile context, catalog injection' },
      { label: 'Governance layer', value: 'Evals, guardrails, privacy, cost controls, review mode' },
    ],
    related: ['AI-Native Product OS', 'Deity', 'Dreamsea', '24Seven', 'Mass Social Wisdom Agent'],
    proofChips: [
      { label: 'Agent workflow', value: 'Public Flask/Gemini/SociaVault repo', sourceStatus: 'public-proof' },
      { label: 'Profile coach', value: 'nsso public copy references Deity and AI profile creation', sourceStatus: 'public-proof' },
      { label: 'Missing asset', value: 'AI Costs Dashboard write-up still needed', sourceStatus: 'manual-needed' },
    ],
    sourceLinks: [
      { label: 'nsso', href: 'https://nsso.me/', sourceStatus: 'public-proof' },
      {
        label: 'Mass Social Wisdom Agent',
        href: 'https://github.com/raminhoodeh/mass-social-wisdom-agent',
        sourceStatus: 'public-proof',
      },
      {
        label: 'Product course',
        href: 'https://www.udemy.com/course/the-fastest-way-to-become-a-product-manager/',
        sourceStatus: 'public-proof',
      },
    ],
    assetSlots: [
      { label: 'RAG pipeline diagram', note: 'Needs visual for nsso or Dreamsea context flow.', sourceStatus: 'manual-needed' },
      { label: 'Cost dashboard', note: 'Needs write-up, screenshot, or anonymised chart.', sourceStatus: 'manual-needed' },
      { label: 'Workflow diagrams', note: 'Use for agent and catalog-grounded planning loops.', sourceStatus: 'manual-needed' },
    ],
    sections: [
      {
        heading: 'Operating systems',
        body: [
          'This section should not look like project thumbnails. It should look like architecture: stack cards, workflow diagrams, eval slots, and tool-call loops.',
          'The AI-Native Product OS is the anchor, then the examples show it in motion: Deity, Dreamsea, 24Seven, and Mass Social Wisdom Agent.',
        ],
      },
      {
        heading: 'Context layer',
        body: [
          'The context layer is the defensible part: profile context, RAG, wiki injection, product catalog injection, memory boundaries, and source provenance.',
          'The model is useful because it can reason over context, but the product becomes trustworthy only when the context is owned, scoped, and observable.',
        ],
      },
      {
        heading: 'Orchestration',
        body: [
          'The examples should show different orchestration patterns: tool calls and mutation review in Deity, multimodal generation in Dreamsea, catalog-grounded planning in 24Seven, and staged autonomous extraction in Mass Social Wisdom Agent.',
          'That makes the technical story legible without turning the homepage into an engineering document.',
        ],
      },
      {
        heading: 'Governance',
        body: [
          'Governance is where many AI demos become products or fail to. The system needs evals, refusal logic, cost controls, privacy boundaries, and human review where the stakes justify it.',
          'The next visual pass should add diagrams for this layer, because it is the clearest bridge between product judgement and technical architecture.',
        ],
      },
    ],
  },
  {
    slug: 'credential-stack',
    eyebrow: '03 Qualifications',
    title: 'Qualifications',
    dek: 'Current qualifications, AI certifications, formal education, and leadership training backing the product work.',
    readTime: '4 min scan',
    status: 'Credential stack',
    year: '2016-2026',
    index: ['AI credentials', 'Formal education', 'Leadership', 'What to add'],
    metadata: [
      { label: 'AI', value: 'IBM AI Engineering, Google ML Engineer, Google Generative AI Leader, Anthropic MCP' },
      { label: 'Education', value: 'Imperial MSc with Distinction, Northampton BA with 1st Class Honours' },
      { label: 'Leadership', value: 'MBTi Leadership Development Programme' },
    ],
    related: ['AI Product Management', 'Imperial College London', 'Anthropic MCP', 'Google AI School'],
    proofChips: [
      { label: '2026 AI', value: 'IBM, Google, and Anthropic AI credentials', sourceStatus: 'local-primary' },
      { label: 'Imperial', value: 'MSc Environmental Technology with Distinction', sourceStatus: 'local-primary' },
      { label: 'Northampton', value: 'BA Business and Marketing with 1st Class Honours', sourceStatus: 'local-primary' },
    ],
    sourceLinks: [],
    assetSlots: [
      { label: 'Credential badges', note: 'Needs certificate images or verification URLs.', sourceStatus: 'manual-needed' },
      { label: 'Institution marks', note: 'Needs logo permission or neutral text treatment.', sourceStatus: 'manual-needed' },
      { label: 'Older qualifications', note: 'Ask before adding older nsso-profile qualifications.', sourceStatus: 'manual-needed' },
    ],
    sections: [
      {
        heading: 'AI credentials',
        body: [
          'The current AI layer is the one to foreground: IBM AI Engineering Professional Certificate, Google Professional Machine Learning Engineer, Google Generative AI Leader, and Anthropic MCP Protocols Advanced Topics.',
          'These should support the product narrative rather than replace it. The credential stack backs the claim that the AI work is deliberate, current, and technically literate.',
        ],
      },
      {
        heading: 'Formal education',
        body: [
          'The formal education story is still useful: MSc Environmental Technology with Distinction from Imperial College London and BA Business and Marketing with 1st Class Honours from the University of Northampton.',
          'It connects product judgement to systems, sustainability, and commercial thinking.',
        ],
      },
      {
        heading: 'Leadership',
        body: [
          'The MBTi Leadership Development Programme belongs here because the portfolio is not just proving solo building. It is proving leadership judgement, communication, and the ability to make teams sharper.',
          'This section should be compact, credible, and easy to scan.',
        ],
      },
      {
        heading: 'What to add',
        body: [
          'The next content pass should add certificate badges or verification links where available.',
          'Older or partial qualifications from the public nsso profile should not be imported automatically. The resume context is canonical until Ramin confirms otherwise.',
        ],
      },
    ],
  },
  {
    slug: 'teaching-writing',
    eyebrow: '04 Thoughts',
    title: 'Thoughts',
    dek: 'Teaching, speaking, and writing case studies that turn product thinking and metaphysical inquiry into teachable, shareable work.',
    readTime: '5 min scan',
    status: 'Credibility layer',
    year: '2018-2026',
    index: ['Teaching', 'Speaking', 'Writing', 'Metacognition'],
    metadata: [
      { label: 'Course proof', value: 'Udemy rating, students, reviews, and AI-Native Product OS update' },
      { label: 'Talk proof', value: 'TEDxImperialCollege, June 2018, public transcript and plays' },
      { label: 'Book proof', value: 'The Proposition, spiritual fiction, public author/book page' },
    ],
    related: ['AI PM Course', 'Product Course', 'TEDx', 'The Proposition', 'Framework of Metacognition'],
    proofChips: [
      { label: 'Udemy', value: '4.8 rating, 4,871 students at scrape time', sourceStatus: 'public-proof' },
      { label: 'TEDx', value: '42,969 plays at scrape time', sourceStatus: 'public-proof' },
      { label: 'Book', value: '385-page paperback, 5.0 rating at scrape time', sourceStatus: 'public-proof' },
    ],
    sourceLinks: [
      {
        label: 'Product course',
        href: 'https://www.udemy.com/course/the-fastest-way-to-become-a-product-manager/',
        sourceStatus: 'public-proof',
      },
      {
        label: 'TEDx talk',
        href: 'https://www.ted.com/talks/ramin_hoodeh_existentially_viewing_your_existential_crisis/transcript',
        sourceStatus: 'public-proof',
      },
      { label: 'Book', href: 'https://author.vision/', sourceStatus: 'public-proof' },
    ],
    assetSlots: [
      { label: 'Course thumbnail', note: 'Use preferred course image when supplied.', sourceStatus: 'asset-lead' },
      { label: 'TED thumbnail', note: 'Needs preferred frame or public thumbnail.', sourceStatus: 'asset-lead' },
      { label: 'Book cover', note: 'Needs high-quality cover file if available.', sourceStatus: 'asset-lead' },
    ],
    sections: [
      {
        heading: 'Teaching',
        body: [
          'The AI PM course should be positioned as the packaged version of the operating system: a way for product managers to move from feature delivery into AI-native product leadership.',
          'The existing product management course proves that the thinking can be taught to a broad audience, while the AI-native update shows where the work is going next.',
        ],
      },
      {
        heading: 'Speaking',
        body: [
          'The TEDx section should carry the broader worldview: cosmic perspective, mindfulness, meaning, and the ability to make a large idea feel human.',
          'This matters because AI product leadership is also narrative leadership. Teams need someone who can make uncertainty feel navigable.',
        ],
      },
      {
        heading: 'Writing',
        body: [
          'The Proposition belongs as fiction, but also as evidence of sustained metaphysical inquiry, world-building, and long-form creative discipline.',
          "Keep the author positioning close to Ramin's own language: spiritual fiction, metaphysical enquiry, philosophy, consciousness, nature of reality, and story.",
        ],
      },
      {
        heading: 'Metacognition',
        body: [
          'The Framework of Metacognition can become a signature essay: how to organize stories, pitches, frameworks, and related information into coherent inner architecture.',
          'This is the bridge between Manager, Engineer, Teacher, and Author.',
        ],
      },
    ],
  },
  {
    slug: 'ai-ramin',
    eyebrow: '05 Ramin.AI',
    title: 'Ramin.AI',
    dek: 'A future interactive layer where a reader can paste a role, project, or product problem and see the approach Ramin would bring, with strict source-grounded guardrails.',
    readTime: '4 min prototype',
    status: 'Prototype boundary',
    year: 'Next',
    index: ['Purpose', 'Allowed sources', 'Guardrails', 'Prototype path'],
    metadata: [
      { label: 'Allowed sources', value: 'Curated portfolio files, resume context, project write-ups, source registry, approved site copy' },
      { label: 'Guardrails', value: 'No inflated claims, no confidential detail, no unverified metrics' },
      { label: 'Inputs', value: 'Job description, product brief, AI feature idea, collaboration prompt' },
      { label: 'Output shape', value: 'Source boundary, relevant proof, approach, risks, next questions' },
    ],
    related: ['Source Registry', 'AI-Native Product OS', 'Project Write-ups', 'Resume Context'],
    proofChips: [
      { label: 'Status', value: 'Prototype only until model integration exists', sourceStatus: 'manual-needed' },
      { label: 'Source rule', value: 'Curated local sources, not raw scrape dumps', sourceStatus: 'local-primary' },
      { label: 'Adjacent precedent', value: 'nsso Deity profile coach', sourceStatus: 'public-proof' },
    ],
    sourceLinks: [{ label: 'nsso', href: 'https://nsso.me/', sourceStatus: 'public-proof' }],
    assetSlots: [
      { label: 'Prototype panel', note: 'Needs elegant non-live UI state.', sourceStatus: 'manual-needed' },
      { label: 'Knowledge source list', note: 'Can be generated from curated repo files.', sourceStatus: 'local-primary' },
      { label: 'Guardrail checklist', note: 'Needs final sensitive topics and disallowed claims.', sourceStatus: 'manual-needed' },
    ],
    sections: [
      {
        heading: 'Purpose',
        body: [
          'Ramin.AI should not be presented as live until it is actually integrated. For now, it can exist as a polished prototype panel that explains what the future interface will do.',
          'The useful version lets a reader paste a role, product problem, or project brief and receive a source-grounded answer about how Ramin would approach it.',
        ],
      },
      {
        heading: 'Allowed sources',
        body: [
          'The allowed knowledge base should be curated portfolio files: resume context, overall structure context, project write-ups, portfolio content enrichment, the source registry, and approved final site copy.',
          'Raw scraped pages should not become the model memory. They are evidence and asset leads, not the voice of the portfolio.',
        ],
      },
      {
        heading: 'Guardrails',
        body: [
          'The assistant should not inflate claims, invent metrics, expose confidential Bayut or Side.inc detail, overstate implementation status, or turn unverified metrics into proof.',
          'It should state source boundaries clearly, ask for missing context, and prefer a precise answer over a grand one.',
        ],
      },
      {
        heading: 'Prototype path',
        body: [
          'The first implementation can be an elegant static panel with sample prompts, source boundaries, and guardrail chips.',
          'The actual model/provider decision can come later, after the content model is stable and the allowed-source set is approved.',
        ],
      },
    ],
  },
] as const satisfies readonly DeepDive[];

export const works = [
  {
    title: 'nsso',
    tag: 'Identity platform',
    summary: 'A unified professional identity surface with profile context, storefronts, and an agentic AI coach.',
    span: 'md:col-span-7',
    aspect: 'aspect-[1.12/1] md:aspect-[7/5]',
    image:
      'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1400&q=82',
    sourceStatus: 'local-primary',
    problem: [
      'Professional identity online is a fragmentation problem masquerading as a presentation problem. Most people have a LinkedIn, a personal site or Linktree, a payment link, a portfolio somewhere, and a WhatsApp number. None of those surfaces speak to each other.',
      'Every time your work changes, you manually update four different places, and the audience still gets an incomplete picture. The gap was not another link-in-bio; it was a unified, intelligent professional operating system owned by the person it represents.',
    ],
    architecture: [
      'NSSO combines a public profile, structured CV, projects, qualifications, contact methods, social links, product listings, hosted sales pages, referral earnings, PayPal and Polar payment flows, and profile completeness scoring.',
      'The architecturally significant layer is Deity: an agentic AI profile coach that reads the full live profile context, runs profile-aware retrieval, and proposes direct profile mutations through tool calls.',
      'Every authenticated Deity request fetches the full structured user profile through Supabase, serialises it into context, and can combine that profile with a curated knowledge corpus through dual embeddings and re-ranking.',
    ],
    approach: [
      'The core product decision was to make the profile an owned operating system, not a link page. That means the AI should not merely advise the user what to write; it should be able to propose the exact change in the product surface.',
      'Review Mode protects the high-stakes surface. A wrong public bio is a credibility problem, so Deity presents every proposed mutation as a before/after confirmation card before anything writes to Supabase.',
    ],
    tradeoffs: [
      'Intent arbitration is heuristic, not yet probabilistic. Ambiguous queries can still be routed to the wrong mode when they contain both knowledge and profile-editing signals.',
      'The tool-call parsing path needs regression coverage. If a model update changes the streaming function-call shape, the user could receive a normal text response without the intended profile update actions.',
      'The knowledge ingestion path still needs idempotency. Re-running ingestion can duplicate chunks and weaken retrieval quality over time.',
    ],
    proof: [
      'The product is public at nsso.me, with Ramin\'s profile live at nsso.me/ramin.',
      'The public profile demonstrates the identity surface, storefront-style project listings, and the guest-facing Deity entry point.',
    ],
    improve: [
      'The first improvement would be a classifier for intent arbitration: profile mode above a confidence threshold, knowledge mode below it, and disambiguation in the uncertain middle.',
      'The second gap is observability. Deity needs per-turn logging for intent classification, retrieval hit rate, tool-call count, accepted actions, rejected actions, latency, and confidence.',
    ],
    links: [
      { label: 'Product', href: 'https://nsso.me/', sourceStatus: 'public-proof' },
      { label: 'Public profile', href: 'https://nsso.me/ramin', sourceStatus: 'public-proof' },
    ],
    chips: [
      { label: 'Context', value: 'Full structured profile injected into Deity conversations', sourceStatus: 'local-primary' },
      { label: 'Governance', value: 'Review mode before profile mutations commit', sourceStatus: 'local-primary' },
      { label: 'Proof', value: 'Public profile and product surface live', sourceStatus: 'public-proof' },
    ],
    architectureChips: [
      { label: 'Model', value: 'Turns profile advice into proposed edits, not generic chat responses' },
      { label: 'Context', value: 'Reads the live profile and knowledge base before advising' },
      { label: 'Orchestration', value: 'Routes coaching, retrieval, tool calls, and review cards' },
      { label: 'Governance', value: 'Blocks guest mutations and requires approval before public changes' },
      { label: 'Human', value: 'Keeps final identity decisions with the profile owner' },
    ],
    assetRequest: 'Needs approved nsso screenshot set and a Deity architecture diagram.',
  },
  {
    title: 'Dreamsea',
    tag: 'AI iOS app',
    summary: 'A voice-first dream journal with multimodal generation and philosophy-specific interpretation.',
    span: 'md:col-span-5',
    aspect: 'aspect-[1.12/1] md:aspect-[5/6]',
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=82',
    sourceStatus: 'local-primary',
    problem: [
      'Every morning I would wake from a vivid dream and immediately lose it, not because I did not try to remember, but because the tools I reached for were wrong for the moment.',
      'Notes apps demanded full cognition. Typing in the dark destroyed the fragile hypnopompic state I was trying to preserve. Even when I captured something, I had no framework to do anything meaningful with it.',
    ],
    architecture: [
      'Dreamsea is a SwiftUI iOS app built around five epics: capture, AI generation, dream management, personalisation and analysis, and education.',
      'The pipeline starts with AVFoundation voice capture and Gemini multimodal audio-to-text transcription, then runs parallel generation for title, subtitle, four philosophy-specific interpretations, symbol extraction, and a Gemini Imagen watercolor image.',
      'The context layer is a curated Dream Wiki: Jungian, Persian, Egyptian, and Japanese dream philosophy. The same content the user reads is injected into the model as the interpretive lens.',
    ],
    approach: [
      'The obvious alternative was a static dream-symbol RAG database. I rejected that because the use case is not retrieval; it is philosophical translation.',
      'A Jungian interpretation is not good because it retrieves a matching symbol. It is good because the model reasons through the dream inside a coherent framework. That made curated philosophy-specific context more important than vector search.',
    ],
    tradeoffs: [
      'Speed gives way to depth. The app waits for a correctable transcript before any interpretation begins because the transcript is the source of truth for every downstream generation.',
      'Audio privacy wins over convenience. Audio is uploaded for transcription, then deleted immediately from cloud storage, which prevents server-side audio search or future audio-based aggregation.',
      'Social sharing is deferred. Sharing a dream publicly changes what people write, so Phase 1 earns private trust before asking for public exposure.',
    ],
    proof: [
      'Dreamsea is live on the App Store as an iPhone app in Health & Fitness.',
      'The public App Store listing showed version 2.5 at scrape time and identified Ramin Hoodeh as the developer.',
    ],
    improve: [
      'The most important next sprint is a transcription quality gate. If the whisper or recording is too short or unintelligible, the app should gently ask the user to re-record rather than generate a low-trust interpretation.',
      'The prompt system also needs a structured eval set across short recordings, non-English speech, unclear symbols, and dreams with no obvious symbolic content.',
    ],
    links: [{ label: 'App Store', href: 'https://apps.apple.com/us/app/dreamsea/id6761101193', sourceStatus: 'public-proof' }],
    chips: [
      { label: 'Model', value: 'Gemini transcription, text generation, and Imagen watercolor output', sourceStatus: 'local-primary' },
      { label: 'Privacy', value: 'Audio deleted from cloud after transcription', sourceStatus: 'local-primary' },
      { label: 'Proof', value: 'Public App Store listing', sourceStatus: 'public-proof' },
    ],
    architectureChips: [
      { label: 'Model', value: 'Turns voice capture into transcript, interpretation, symbols, and imagery' },
      { label: 'Context', value: 'Uses dream text plus tradition-specific philosophy as the lens' },
      { label: 'Orchestration', value: 'Captures first, then generates only after transcript review' },
      { label: 'Governance', value: 'Protects cost, privacy, storage, and access boundaries' },
      { label: 'Human', value: 'Lets expert curation shape the interpretive framework without code' },
    ],
    assetRequest: 'Needs App Store screenshots, product video, and a generation-pipeline diagram.',
  },
  {
    title: 'Qadam',
    tag: 'Trading intelligence',
    summary: 'Catalyst-driven macro intelligence for detecting physical-world signals before consensus narrative.',
    span: 'md:col-span-5',
    aspect: 'aspect-[1.12/1] md:aspect-[5/6]',
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=82',
    sourceStatus: 'local-primary',
    problem: [
      'Financial markets are information-processing machines, but they process information reactively. Physical events that move asset prices can register in the world hours to days before they enter the consensus narrative.',
      'The problem is not that data does not exist. Satellite thermal feeds, maritime AIS streams, conflict-event APIs, dark-pool order flow, and social narrative velocity all exist. The gap is a retail-accessible system that ingests, triages, and reasons over that data before the edge closes.',
    ],
    architecture: [
      'Qadam is structured as two connected layers. Layer A is the Intelligence Engine: local triage, frontier-model strategy, quantum-assisted weekly pattern recognition, and a deterministic Python orchestrator.',
      'Layer B is the Orchestration Layer: a paper-trading execution stack with hard-coded risk guardrails and human approval at the final signal filter.',
      'Five pipelines stream into a unified event schema: geopolitical/conflict, logistics/infrastructure/OSINT, economic/macro, market microstructure/order flow, and social/sentiment/narrative.',
    ],
    approach: [
      'The architecture separates workloads by the timescale that actually matters. Local inference handles high-throughput triage. Cloud reasoning handles deeper strategy. Quantum is a weekly oracle, not a real-time participant.',
      'That is architectural honesty: current quantum hardware is not reliable enough for real-time trading decisions, but a weekly batch cadence can still match the days-to-weeks catalyst window Qadam targets.',
    ],
    tradeoffs: [
      'The system uses a human gate on strategy, not emotional intervention on every trade. Once a signal is approved, the run stays statistically clean.',
      'The paper proof phase limits visible alpha and capital compounding, but a system that cannot prove its edge on paper should not be trusted with real capital.',
      'The current version has risk guardrails, but not a full production AI governance layer with formal model cards, output classifiers, and third-party audit trails.',
    ],
    proof: [
      'The public landing page at qadam.trade presents the project and its early-access positioning.',
      'The page positions Qadam as a hedge-fund team inside your laptop and describes 500+ live data feeds across five pipelines.',
    ],
    improve: [
      'The most important improvement is a rigorous eval suite covering historical catalyst cases by pipeline category, with documented false-positive rates per source.',
      'The web cockpit also needs to become a better human-in-the-loop decision surface: live catalyst map, similar Knowledge Graph precedents, and a plain-English one-sentence synthesis.',
    ],
    links: [{ label: 'Landing page', href: 'http://qadam.trade', sourceStatus: 'public-proof' }],
    chips: [
      { label: 'Pipelines', value: 'Geopolitical, logistics, macro, market microstructure, social narrative', sourceStatus: 'local-primary' },
      { label: 'Governance', value: 'Paper proof phase before live capital', sourceStatus: 'local-primary' },
      { label: 'Proof', value: 'Public landing page', sourceStatus: 'public-proof' },
    ],
    architectureChips: [
      { label: 'Model', value: 'Separates fast local triage from deeper strategic reasoning' },
      { label: 'Context', value: 'Connects catalysts, sources, assets, and prior outcomes' },
      { label: 'Orchestration', value: 'Normalises messy world events into a decision pipeline' },
      { label: 'Governance', value: 'Requires trust scores, paper proof, logs, and risk gates' },
      { label: 'Human', value: 'Keeps final signal approval tied to explicit reasoning' },
    ],
    assetRequest: 'Needs public-safe cockpit screenshot, World Monitor diagram, and proof/status note.',
  },
  {
    title: '24Seven Concierge',
    tag: 'Luxury AI concierge',
    summary: 'A catalog-grounded travel concierge that plans across Shopify inventory and hands off to a human agent.',
    span: 'md:col-span-7',
    aspect: 'aspect-[1.12/1] md:aspect-[7/5]',
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=82',
    sourceStatus: 'local-primary',
    problem: [
      'Luxury travel operators had built their service inventory in Shopify, but the discovery layer was broken. A client planning a yacht week in Ibiza followed by a villa in Marbella had to manually browse independent collection screens.',
      'After doing that work, the client still had to start a separate conversation with a concierge who had no record of the discovery session. The gap was the bridge between intent and transaction.',
    ],
    architecture: [
      'The app is built on Expo React Native with Expo Router, Shopify Storefront API, TanStack Query, Zustand filesystem persistence, and Gemini-powered planning.',
      'The AI concierge has two main Gemini paths: catalog-grounded conversational planning with recommended product handles, and a second WhatsApp-summary generation step that turns the conversation into a human-readable booking brief.',
      'The human concierge stays in the loop. The AI surfaces intent and itinerary structure; the WhatsApp handoff sends the final booking request to a real agent.',
    ],
    approach: [
      'The obvious alternative was semantic search over product embeddings. I rejected it because the catalog was small enough that full compressed catalog injection was simpler, more reliable, and better for cross-collection reasoning.',
      'A luxury request often crosses sparse constraints: date, location, guest count, yacht, villa, car, and experience. A retrieval system optimised for single-query similarity would miss products that only become relevant in combination.',
    ],
    tradeoffs: [
      'Full catalog injection is reliable at current scale, but it becomes a token-cost and latency problem as inventory grows.',
      'Chat history is client-side rather than server-side, which keeps infrastructure light but removes a server audit trail and a conversation data flywheel.',
      'The Dubai market launched with a client-side mock layer, which unblocked the visible market expansion but kept some inventory outside the Shopify editing workflow and AI context.',
    ],
    proof: [
      '24Seven Concierge is live on the App Store in the Travel category.',
      'The public listing showed version 1.2.4 at scrape time, with release notes mentioning Dubai, AI Concierge Chatbot, and a calendar booking system.',
    ],
    improve: [
      'The biggest gap is structured evaluation for the AI concierge: out-of-catalog references, multi-destination constraints, date conflicts, and malformed JSON.',
      'The second improvement is replacing WhatsApp-only conversion with a structured booking intake or Shopify checkout path that can capture a hold or enquiry against specific product variants.',
    ],
    links: [
      {
        label: 'App Store',
        href: 'https://apps.apple.com/us/app/24seven-concierge/id6663954162',
        sourceStatus: 'public-proof',
      },
    ],
    chips: [
      { label: 'Context', value: 'Full Shopify catalog compressed into Gemini prompt context', sourceStatus: 'local-primary' },
      { label: 'Human layer', value: 'AI plans; concierge closes the booking', sourceStatus: 'local-primary' },
      { label: 'Proof', value: 'Public App Store listing', sourceStatus: 'public-proof' },
    ],
    architectureChips: [
      { label: 'Model', value: 'Turns luxury intent into structured itinerary and recommendations' },
      { label: 'Context', value: 'Keeps Shopify inventory visible as the conversation evolves' },
      { label: 'Orchestration', value: 'Moves from request to catalog match to WhatsApp-ready handoff' },
      { label: 'Governance', value: 'Constrains recommendations to catalog-backed, parseable outputs' },
      { label: 'Human', value: 'Hands booking to a concierge instead of pretending full automation' },
    ],
    assetRequest: 'Needs App Store screenshots, catalog-to-itinerary diagram, and Loom walkthrough.',
  },
  {
    title: 'RazinFlix',
    tag: 'Personal film canon',
    summary: 'A personal streaming and curation system with AI enrichment, poster validation, and recommendations.',
    span: 'md:col-span-5',
    aspect: 'aspect-[1.12/1] md:aspect-[5/6]',
    image:
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=82',
    sourceStatus: 'local-primary',
    problem: [
      'I had been maintaining a personal film library as a spreadsheet for years: a flat list of titles, rough ratings, and half-remembered notes that became useless the moment I wanted to find something to watch.',
      'The problem was not that a spreadsheet cannot catalog films. It was that useful cataloguing - descriptions, trailers, accurate metadata, categorisation, posters, and recommendations - is manual work that stops happening once the library gets large.',
    ],
    architecture: [
      'The ingestion pipeline turns one title input into a fully enriched record using TMDB, Gemini, YouTube Data API, Google Cloud Vision OCR, and Supabase.',
      'Gemini rewrites descriptions and assigns films to an opinionated aesthetic taxonomy. YouTube resolves trailers. Vision checks whether the English title is visible on the poster artwork.',
      'The frontend adds Netflix-like browsing: hero billboard, category carousels, search, director/category click-to-search, keyboard navigation, update mode, and a client-side recommendation engine.',
    ],
    approach: [
      'The deliberate choice was to override generic TMDB genres. A personal streaming platform curated around taste needs a taxonomy that describes how a film feels, not just what genre it belongs to.',
      'The terminal-style ingestion log makes the wait feel like a serious enrichment pipeline rather than a spinner. It also exposes the system thinking: TMDB scan, Gemini synthesis, YouTube search, Vision scan, Supabase save.',
    ],
    tradeoffs: [
      'Vision OCR can false-negative on stylised posters where the title is visually obvious to a human but not machine-readable.',
      'The live Add Film path has no pre-insert idempotency guard, so duplicate titles can still be created and later cleaned by scripts.',
      'The admin layer is appropriate for a single-owner personal platform, but not for multi-user or role-based access.',
    ],
    proof: [
      'The project is accessible through the public nsso profile film route.',
      'The Add Film flow, category carousels, hero billboard, and film detail modals are documented in the project write-up.',
    ],
    improve: [
      'The biggest gap is observability after ingestion. The terminal log disappears when the modal closes, so a future ingestion_log JSONB column should preserve API responses and confidence flags per record.',
      'The category repair script also needs a human-reviewed flag so scheduled cleanup does not overwrite manual curation.',
    ],
    links: [{ label: 'Project page', href: 'https://nsso.me/film/razinflix', sourceStatus: 'public-proof' }],
    chips: [
      { label: 'Pipeline', value: 'TMDB, Gemini, YouTube, Vision, Supabase', sourceStatus: 'local-primary' },
      { label: 'Taste layer', value: 'Curated atmosphere-forward taxonomy', sourceStatus: 'local-primary' },
      { label: 'Asset', value: 'Needs stronger public screenshot or demo route', sourceStatus: 'asset-lead' },
    ],
    architectureChips: [
      { label: 'Model', value: 'Transforms a film title into useful description and taste category' },
      { label: 'Context', value: 'Grounds enrichment in TMDB metadata and a personal taxonomy' },
      { label: 'Orchestration', value: 'Runs metadata, trailer, poster, category, and save steps together' },
      { label: 'Governance', value: 'Checks poster quality and keeps categories constrained' },
      { label: 'Human', value: 'Preserves owner taste through admin review and correction' },
    ],
    assetRequest: 'Needs public screenshot, demo URL validation, and ingestion-pipeline diagram.',
  },
  {
    title: 'Mass Social Wisdom Agent',
    tag: 'Multi-agent workflow',
    summary: 'A multimodal extraction pipeline that turns messy links and screenshots into structured knowledge.',
    span: 'md:col-span-7',
    aspect: 'aspect-[1.12/1] md:aspect-[7/5]',
    image:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=82',
    sourceStatus: 'local-primary',
    problem: [
      'The knowledge I was accumulating across Instagram Reels, YouTube breakdowns, screenshots, and carousel posts had no coherent home.',
      'Bookmark managers preserved links. Notes apps stored fragments. What I needed was something that reached into the content, extracted the meaning, organised it, and exported it without an hour of manual cleanup.',
    ],
    architecture: [
      'The system runs a seven-stage autonomous pipeline inside a Flask server: Inspect, Route, Compose, Self-Assess, Categorise, Sort, Export.',
      'Gemini 2.5 Flash handles OCR, composition, quality scoring, categorisation, and similarity sorting. SociaVault supplies Instagram and YouTube transcripts and post metadata.',
      'A dual-column web UI streams live logs and extracted items while a background thread processes the run. The final output is a structured .docx file designed for Notion import.',
    ],
    approach: [
      'The obvious alternative was a RAG pipeline, but the use case is not retrieval. It is curation.',
      'After a session, the useful output is a structured knowledge document, not a semantic search corpus. That is why the system exports category-sorted prose with source links rather than asking the user to query it later.',
    ],
    tradeoffs: [
      'The job tracker is an in-memory dictionary, so a server restart clears state. That is acceptable for single-session extraction, but not for a durable knowledge product.',
      'Gemini Free Tier rate limits are handled with hardcoded sleeps rather than a proper queue, which keeps setup simple but slows large batches.',
      'The self-assessment loop has no formal eval coverage, even though Gemini is scoring its own outputs.',
    ],
    proof: [
      'The GitHub repository is public and includes the Flask app, Gemini integration, .docx export, mock demo server, and demo animation.',
      'The README evidence supports dual URL/image input, live log streaming, and Notion-compatible export.',
    ],
    improve: [
      'The first improvement is a labelled dataset of 40 to 60 extraction outputs with human quality scores and ground-truth categories, to measure the self-assessment loop.',
      'The second improvement is a request queue with exponential backoff, replacing sleep-based rate limiting and enabling concurrent URL processing.',
    ],
    links: [
      {
        label: 'GitHub',
        href: 'https://github.com/raminhoodeh/mass-social-wisdom-agent',
        sourceStatus: 'public-proof',
      },
    ],
    chips: [
      { label: 'Workflow', value: 'Inspect -> Route -> Compose -> Self-Assess -> Categorise -> Sort -> Export', sourceStatus: 'local-primary' },
      { label: 'Output', value: 'Structured .docx for Notion import', sourceStatus: 'local-primary' },
      { label: 'Proof', value: 'Public GitHub repo', sourceStatus: 'public-proof' },
    ],
    architectureChips: [
      { label: 'Model', value: 'Reads messy media inputs and extracts reusable knowledge' },
      { label: 'Context', value: 'Carries captions, transcripts, OCR, links, and category constraints' },
      { label: 'Orchestration', value: 'Moves each item through inspect, compose, score, sort, and export' },
      { label: 'Governance', value: 'Logs failures, sanitises URLs, rate-limits, and self-checks quality' },
      { label: 'Human', value: 'Lets the user supply mess and keep the finished knowledge document' },
    ],
    assetRequest: 'Needs demo GIF/video, workflow screenshot, and sample .docx output preview.',
  },
] as const satisfies readonly WorkCaseStudy[];

export const projectCaseStudies = works;

export const architectureLayers = [
  {
    label: 'Model',
    purpose: 'Choose the intelligence layer for the job.',
    examples: 'Gemini, frontier LLMs, local models, specialised classifiers',
  },
  {
    label: 'Context',
    purpose: 'Load the durable knowledge that makes the model specific.',
    examples: 'RAG, wiki injection, profile context, catalog injection',
  },
  {
    label: 'Orchestration',
    purpose: 'Wire the work into calls, jobs, stages, and interfaces.',
    examples: 'Tool calls, async jobs, workflow stages, structured outputs',
  },
  {
    label: 'Governance',
    purpose: 'Make trust, cost, and safety observable before scale.',
    examples: 'Evals, guardrails, privacy boundaries, cost controls, review mode',
  },
  {
    label: 'Human',
    purpose: 'Keep taste, judgment, and review boundaries explicit.',
    examples: 'Decision quality, accepted actions, rejected outputs, product taste',
  },
] as const satisfies readonly ArchitectureLayer[];

export const toolsAndSystems = [
  {
    title: 'AI-Native Product OS',
    systemType: 'Operating system',
    layer: 'Operating system',
    description:
      'The 5-layer stack and AI-native loop for product work: Model, Context, Orchestration, Governance, Human; Talk, Decide, Build, Observe, Iterate.',
    proof: 'Product thesis, course direction, and team operating framework.',
    assetSlot: 'Needs final stack and loop diagram.',
    modelLayer: 'Chooses intelligence deliberately instead of chasing model novelty.',
    contextLayer: 'Turns product, user, strategy, and voice into durable operating memory.',
    orchestrationLayer: 'Connects talk, decisions, builds, observation, and iteration.',
    governanceLayer: 'Installs evals, guardrails, traces, fallbacks, and cost caps.',
    humanLayer: 'Keeps vision, empathy, taste, and judgement as the advantage.',
    workflow: ['Talk', 'Decide', 'Build', 'Observe', 'Iterate'],
    sourceStatus: 'local-primary',
  },
  {
    title: 'Deity profile coach',
    systemType: 'Agentic profile coach',
    layer: 'Context and tools',
    description:
      'Agentic profile coaching with full profile context, RAG retrieval, completeness scoring, and reviewed profile mutations.',
    proof: 'Anchored in nsso and public profile context.',
    assetSlot: 'Needs RAG/tool-call flow diagram.',
    modelLayer: 'Turns profile reasoning into suggested mutations, not generic advice.',
    contextLayer: 'Reads live profile state, knowledge chunks, and query intent.',
    orchestrationLayer: 'Routes intent through retrieval, verification, tools, and review.',
    governanceLayer: 'Prevents guest writes and makes sensitive edits confirmable.',
    humanLayer: 'Lets the owner accept, reject, and shape public identity.',
    workflow: ['Classify intent', 'Retrieve context', 'Verify links', 'Propose action', 'Review'],
    sourceStatus: 'local-primary',
  },
  {
    title: 'Dreamsea generation pipeline',
    systemType: 'Multimodal generation',
    layer: 'Multimodal generation',
    description:
      'Voice capture, Gemini transcription, parallel title/subtitle/interpretation/symbol/image generation, and wiki-backed philosophy context.',
    proof: 'Public App Store listing and local architecture write-up.',
    assetSlot: 'Needs pipeline screenshot or sequence diagram.',
    modelLayer: 'Turns raw voice into transcript, meaning, symbols, and imagery.',
    contextLayer: 'Uses curated dream traditions as the interpretive lens.',
    orchestrationLayer: 'Sequences capture, transcript review, generation, and saving.',
    governanceLayer: 'Protects quota, privacy, RLS, and temporary audio storage.',
    humanLayer: 'Lets users correct transcripts and experts evolve the framework.',
    workflow: ['Record', 'Transcribe', 'Edit', 'Generate', 'Save'],
    sourceStatus: 'public-proof',
  },
  {
    title: '24Seven catalog concierge',
    systemType: 'Catalog-grounded concierge',
    layer: 'Catalog-grounded planning',
    description:
      'Shopify inventory, compressed catalog injection, Gemini itinerary generation, structured product recommendations, and WhatsApp handoff.',
    proof: 'Public App Store listing and version notes.',
    assetSlot: 'Needs catalog-to-itinerary diagram.',
    modelLayer: 'Turns open-ended travel intent into structured, machine-readable plans.',
    contextLayer: 'Keeps eligible catalog inventory present during planning.',
    orchestrationLayer: 'Moves request intake into itinerary, products, and handoff.',
    governanceLayer: 'Reduces hallucinated products through structured output constraints.',
    humanLayer: 'Keeps concierge expertise responsible for the final booking.',
    workflow: ['Capture request', 'Inject catalog', 'Generate itinerary', 'Recommend products', 'Handoff'],
    sourceStatus: 'public-proof',
  },
  {
    title: 'Mass Social Wisdom Agent',
    systemType: 'Autonomous extraction workflow',
    layer: 'Autonomous workflow',
    description:
      'Inspect, Route, Compose, Self-Assess, Categorise, Sort, Export: a multimodal extraction pipeline that extracts knowledge, not just links.',
    proof: 'Public GitHub repository with Flask, Gemini, demo animation, and .docx export.',
    assetSlot: 'Needs workflow screenshot or demo GIF capture.',
    modelLayer: 'Reads messy media inputs and extracts reusable knowledge.',
    contextLayer: 'Carries captions, transcripts, OCR, links, and category constraints.',
    orchestrationLayer: 'Moves each item through inspect, compose, score, sort, and export.',
    governanceLayer: 'Logs failures, sanitises URLs, rate-limits, and self-checks quality.',
    humanLayer: 'Lets the user supply mess and keep the finished knowledge document.',
    workflow: ['Inspect', 'Route', 'Compose', 'Self-Assess', 'Export'],
    sourceStatus: 'public-proof',
  },
  {
    title: 'AI Costs Dashboard',
    systemType: 'Observability and cost control',
    layer: 'Governance dashboard',
    description:
      'A planned dashboard layer for tracking AI API usage, cost, latency, and failure patterns across nsso, Dreamsea, and future AI products.',
    proof: 'Named in the portfolio structure as a tool to document; write-up and screenshot still needed.',
    assetSlot: 'Needs AI Costs Dashboard write-up, screenshot, or anonymised chart.',
    modelLayer: 'Turns model choice into a measurable cost and quality dimension.',
    contextLayer: 'Attaches product, feature, user segment, and request metadata.',
    orchestrationLayer: 'Collects usage events into daily and per-feature views.',
    governanceLayer: 'Surfaces spend, latency, failures, anomalies, and retry patterns.',
    humanLayer: 'Helps product decisions compare cost, quality, and user value.',
    workflow: ['Log call', 'Group usage', 'Detect anomaly', 'Review spend', 'Tune feature'],
    sourceStatus: 'manual-needed',
  },
  {
    title: 'RAG Pipeline',
    systemType: 'Reusable context infrastructure',
    layer: 'Context pipeline',
    description:
      'A reusable ingestion, embedding, retrieval, and ranking pattern for products where durable context is more important than one-off prompting.',
    proof: 'Pattern appears across nsso and Dreamsea; public-safe standalone write-up still needed.',
    assetSlot: 'Needs RAG Pipeline write-up, screenshots, and source-safe ingestion diagram.',
    modelLayer: 'Pairs retrieval and generation models around answer quality.',
    contextLayer: 'Builds owned source material into chunks, metadata, and embeddings.',
    orchestrationLayer: 'Ingests, retrieves, re-ranks, verifies, injects, and logs.',
    governanceLayer: 'Controls duplication, weak matches, bad links, and prompt injection.',
    humanLayer: 'Keeps corpus quality and usefulness under human judgment.',
    workflow: ['Ingest', 'Embed', 'Retrieve', 'Re-rank', 'Answer'],
    sourceStatus: 'manual-needed',
  },
] as const satisfies readonly ToolSystem[];
