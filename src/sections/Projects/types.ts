import {
  deepDives,
  portfolioContent,
  projectCaseStudies,
  toolsAndSystems,
} from '../../data/portfolio';
import {
  type DeepDiveItem,
  type WorkItem,
  type CaseStudyEntry,
} from '../types';
import { slugifyTitle, readableSectionLabel } from '../../lib/text';

export function toProjectCaseStudyEntry(work: WorkItem): CaseStudyEntry {
  return {
    id: `project-${slugifyTitle(work.title)}`,
    typeLabel: 'Project Case Study',
    eyebrow: work.tag,
    title: work.title,
    summary: work.summary,
    readTime: 'Case study',
    year: '2026',
    status: 'Project write-up',
    sourceStatus: work.sourceStatus,
    heroImage: work.image,
    cardSpan: work.span,
    cardAspect: work.aspect,
    sections: [
      { label: 'Problem', body: work.problem },
      { label: 'Architecture', body: work.architecture },
      { label: 'Why this approach', body: work.approach },
      { label: 'Tradeoffs', body: work.tradeoffs },
      { label: 'Demo / proof', body: work.proof },
      { label: 'What I would improve', body: work.improve },
    ],
    chips: work.chips,
    structure: work.architectureChips,
    links: work.links,
    assetSlots: [{ label: 'Next asset needed', note: work.assetRequest, sourceStatus: 'manual-needed' }],
    related: work.architectureChips.map((chip) => chip.label),
  };
}

export function toDeepDiveCaseStudyEntry(item: DeepDiveItem, typeLabel = 'Portfolio Write-up'): CaseStudyEntry {
  return {
    id: `writeup-${item.slug}`,
    typeLabel,
    eyebrow: item.eyebrow,
    title: item.title,
    summary: item.dek,
    readTime: item.readTime,
    year: item.year,
    status: item.status,
    sourceStatus: item.proofChips[0]?.sourceStatus ?? 'local-primary',
    sections: item.sections.map((section) => ({
      label: readableSectionLabel(section.heading),
      body: section.body,
    })),
    chips: item.proofChips,
    structure: item.metadata,
    links: item.sourceLinks,
    assetSlots: item.assetSlots,
    related: item.related,
  };
}

export const metacognitionCaseStudy: CaseStudyEntry = {
  id: 'framework-of-metacognition',
  typeLabel: 'Framework Case Study',
  eyebrow: 'Signature Framework',
  title: 'Framework of Metacognition',
  summary:
    'A hierarchy for turning lived experience into values, values into vision, vision into strategy, and strategy into daily tactics.',
  readTime: '5 min read',
  year: '2026',
  status: 'Draft source',
  sourceStatus: 'manual-needed',
  sections: [
    {
      label: 'Problem',
      body: [
        'People often have strong stories, skills, and ambitions, but no clean architecture for turning them into a coherent public identity or product direction.',
        'The gap is metacognitive: knowing what happened is not the same as knowing what it means, what it proves, or how it should shape the next decision.',
      ],
    },
    {
      label: 'Architecture',
      body: [
        'The framework moves from Experience to Who, Why, How, and What: story becomes values, values become vision, vision becomes strategy, and strategy becomes tactics.',
        'That hierarchy prevents tactics from floating loose. Daily action is connected back to identity, meaning, and long-range direction.',
      ],
    },
    {
      label: 'Why this approach',
      body: [
        'The structure is useful because it works across formats: a pitch, a portfolio, a personal operating system, a course, or a novel can all be organised through the same inner architecture.',
        'It is the conceptual bridge between Product Manager, Engineer, Teacher, and Fiction Author: four surfaces, one underlying way of organising meaning.',
      ],
    },
    {
      label: 'Tradeoffs',
      body: [
        'The framework favours coherence over speed. It asks for enough reflection to avoid shipping a polished surface with no real centre.',
        'It can become too abstract if it is not tied back to examples, proof, and concrete choices. The structure only works when it changes what gets built, said, or prioritised.',
      ],
    },
    {
      label: 'Demo / proof',
      body: [
        'On this site, the framework explains why the same person can credibly hold product work, AI systems, teaching, and fiction inside one portfolio.',
        'The public thought layer already contains the proof surfaces: courses, TEDx, The Proposition, and the AI-Native Product OS.',
      ],
    },
    {
      label: 'What I would improve',
      body: [
        'The next version should become a dedicated essay with a clear diagram and one worked example: taking an experience and tracing it all the way down to a tactical choice.',
        'It should also show how the framework can be used by teams, not just individuals, to translate narrative, values, and strategy into product decisions.',
      ],
    },
  ],
  chips: [
    { label: 'Shape', value: 'Experience -> Who -> Why -> How -> What', sourceStatus: 'local-primary' },
    { label: 'Bridge', value: 'Unifies Manager, Engineer, Teacher, and Author', sourceStatus: 'manual-needed' },
    { label: 'Use', value: 'Organises stories, pitches, frameworks, and related information', sourceStatus: 'manual-needed' },
  ],
  structure: [
    { label: 'Experience', value: 'Story' },
    { label: 'Who', value: 'Values' },
    { label: 'Why', value: 'Vision' },
    { label: 'How', value: 'Strategy' },
    { label: 'What', value: 'Tactics' },
  ],
  links: [
    { label: 'Author site', href: 'https://author.vision/', sourceStatus: 'public-proof' },
    {
      label: 'Product course',
      href: 'https://www.udemy.com/course/the-fastest-way-to-become-a-product-manager/',
      sourceStatus: 'public-proof',
    },
  ],
  assetSlots: [
    { label: 'Framework diagram', note: 'Needs a polished visual hierarchy for the five levels.', sourceStatus: 'manual-needed' },
    { label: 'Worked example', note: 'Needs one concrete story-to-tactic example.', sourceStatus: 'manual-needed' },
  ],
  related: ['AI-Native Product OS', 'Teaching', 'The Proposition', 'Portfolio structure'],
};

export const projectCaseStudyEntries = projectCaseStudies.map(toProjectCaseStudyEntry);
const massSocialWisdomProjectCaseStudy = projectCaseStudyEntries.find((item) => item.title === 'Mass Social Wisdom Agent');

export const massSocialWisdomThoughtsCaseStudy: CaseStudyEntry = {
  id: 'writeup-mass-social-wisdom-agent',
  typeLabel: 'Tool Case Study',
  eyebrow: massSocialWisdomProjectCaseStudy?.eyebrow ?? 'Multi-agent workflow',
  title: 'Mass Social Wisdom Agent',
  summary:
    'A multimodal extraction pipeline that turns social URLs, screenshots, transcripts, captions, and carousel posts into structured knowledge.',
  readTime: massSocialWisdomProjectCaseStudy?.readTime ?? 'Case study',
  year: massSocialWisdomProjectCaseStudy?.year ?? '2026',
  status: 'Portfolio write-up',
  sourceStatus: massSocialWisdomProjectCaseStudy?.sourceStatus ?? 'local-primary',
  heroImage: massSocialWisdomProjectCaseStudy?.heroImage,
  cardSpan: massSocialWisdomProjectCaseStudy?.cardSpan,
  cardAspect: massSocialWisdomProjectCaseStudy?.cardAspect,
  sections: [
    {
      label: 'Problem',
      body: [
        'I kept running into the same moment: scrolling past an Instagram Reel from a tech creator breaking down something genuinely new, a YouTube video from a builder walking through a technique nobody else was talking about yet, or a thread from someone on X.com sharing a hard-won lesson from actually shipping something. The advice was real, niche, current - the kind that has not made it into a blog post yet. And the same pattern kept repeating across every product I was building. For Dreamsea, my partner would send me reels of other creators who were posting genuinely good dream interpretation methods I wanted feeding into the Dream Wiki. For nsso\'s Deity chatbot, LinkedIn was full of business strategy and positioning advice Deity\'s knowledge base could use. For Qadam, real trading advice from people who actually trade well kept surfacing in the same feeds I was already scrolling.',
        'The problem was what happened after I found it. I would screenshot the slide, forward the reel to myself on WhatsApp, or leave a dozen tabs open "to go through later." Later rarely came, and when it did, I was manually transcribing a carousel post by hand or trying to remember what a video had actually said. Every piece of content that could have made one of my products\' Context layer smarter instead sat as a dead link or an unread screenshot that I would manually manage throughout my Notion second brain. What I wanted was much simpler than what I had been doing: dump a list of URLs in one place, have the actual insight get pulled out and sorted into the right category automatically, and hand it back to me as something I could check once and then run straight through the RAG pipeline that already feeds my Notion, Dreamsea, nsso, and Qadam.',
      ],
    },
    {
      label: 'Architecture',
      body: [
        'Model: the model doing all the thinking is Google Gemini 2.5 Flash. It is given five different jobs across the pipeline: reading the text out of screenshots and slides, writing up a clean summary of what a post or video actually said, grading how good that summary is, sorting it into the right topic, and grouping similar pieces of content together. Rather than needing five separate specialised tools for those five jobs, one model handles the whole pipeline end to end.',
        'Context: the context comes from two places. The first is the actual social media content the user drops in - the URLs, screenshots, and slides themselves, whether that is a video transcript, a caption, or text sitting on top of an image. The second is a system-level prompt: built-in instructions that tell the agent exactly how to clean up a messy transcription or OCR scan into something readable, and how to sort that cleaned-up insight into the right topic. Separate prompt profiles govern the standard composition pass versus the lenient retry pass. The quality-assessment prompt is structured to return a single digit from 1 to 5, so there is no ambiguity in reading the result, and the prompt that sorts content into topics lists all eight categories by name and tells the model to reply with just the category name, nothing else.',
        'Orchestration: orchestration is the plumbing that keeps everything moving in the background while the user waits. Each batch of links gets processed as its own background job, so the app does not freeze up while it works. A shared tracker keeps tabs on every job in progress, and the page checks in automatically every two seconds to pull the latest results, so the user watches items appear one by one in real time instead of staring at a loading spinner with no feedback. A stop button is also wired in, so a run can be cancelled partway through if needed.',
        'Governance: governance is the set of guardrails that keep the output accurate and the whole thing running smoothly without supervision. For a couple of topics, such as Finance and Romantic Relationships, a manual list of obvious keywords sorts a post into the right category directly, rather than leaving that judgement entirely to the model. Every URL is cleaned up automatically before it is used: tracking codes get stripped out, redirect links get unwrapped to the real destination, and small formatting differences between link types get normalised, so messy, real-world links from Instagram do not trip up the pipeline. If a link fails to process, it is automatically saved to a separate file so it can be retried later instead of silently disappearing. Built-in pauses between requests keep the agent within the free usage limits of the underlying AI model, without the user needing to manage that themselves.',
        'The live version hosted on this portfolio site adds a further layer of cost and usage guardrails, capping how much processing a visitor can trigger so that a spike in web traffic cannot run up token consumption on the underlying AI model.',
        'Human: the user pastes in raw, unorganised material - a WhatsApp conversation, a Notion page, or just a wall of URLs surrounded by other text - and the agent finds every valid link inside it, removes duplicates, and works through all of them without needing anything cleaned up first. The Scan folder is a second way in: the user can drop screenshots, presentation slides, or chart images there before running the agent, and it will read and summarise those images too, sorting them into the same categories and the same final document as everything pulled from a URL.',
      ],
    },
    {
      label: 'Why this approach',
      body: [
        'The most obvious alternative was a RAG pipeline: embed every piece of content into a vector database and let the user query it semantically later. That approach was rejected because the use case is not retrieval - it is curation. The user wants a structured knowledge document after each session; something more useful than a searchable corpus to interrogate. A flat, category-sorted .docx that imports cleanly into Notion or Google Docs is more useful than a query interface, because the user can either read it back at their own leisure or at least be confident that the wisdom was extracted successfully.',
        'The second deliberate decision was to use a single model, Gemini 2.5 Flash, for all five reasoning tasks: OCR, composition, quality scoring, categorisation, and similarity sorting, rather than specialised models per task. At this scale and latency profile, context-switching between model providers adds operational overhead without meaningful accuracy gains. Gemini 2.5 Flash\'s multimodal capability means the same API call handles both text reasoning and image analysis, which eliminates an entire integration layer.',
      ],
    },
    {
      label: 'Tradeoffs',
      body: [
        'The first tradeoff I made was statelessness over persistence. The job tracker is an in-memory Python dictionary, so every server restart clears all session state. This was a deliberate v1 choice: a database layer such as SQLite or Supabase was deferred because the target workflow is single-session extraction runs, not a longitudinal knowledge graph. The cost is that a crash mid-run loses the job log and any already-processed items that had not been exported yet.',
        'The second tradeoff is managing the Gemini Free Tier rate limits with a sleep timer rather than a proper queue. The 4-second inter-URL delay and 3-second inter-slide delay are hardcoded constants, so at 10 URLs with multi-slide carousels, a session can take 5 to 8 minutes. A token-bucket or exponential-backoff queue would handle this more elegantly and scale to paid-tier rate limits without code changes, but the current approach trades that sophistication for zero configuration overhead.',
        'Third, there is no eval coverage for the self-assessment loop. The quality-scoring function returns a 1 to 5 integer from a free-text Gemini response, and the retry threshold is fixed at 3. There is no evaluation suite validating that the quality scores are internally consistent across content types, that the lenient retry reliably produces higher-scoring output, or that the "keep higher result" comparison logic behaves as intended in edge cases, making this the most significant governance gap in v1.',
        'Finally, categorisation accuracy is bounded by eight fixed categories. The category list reflects the specific content diet of the initial user, so content that spans categories - like an AI-powered trading tool breakdown - defaults to whichever keyword override fires first. There is no multi-label support and no confidence threshold, so every item receives exactly one category regardless of ambiguity.',
      ],
    },
    {
      label: 'Demo / proof',
      body: [
        'The proof is split into two routes: the live portfolio demo for trying the workflow, and the GitHub repository for inspecting the Flask and Gemini implementation.',
        'The repository includes mock_demo_server.py, a self-contained Flask server that replays a realistic extraction session with pre-baked log entries and sample output items, requiring no API keys. The demo-animation.gif in the README root shows a full end-to-end session: URL paste, real-time log streaming, quality score annotation, and the final .docx download. The production deployment configuration, including Dockerfile and Cloud Run-compatible PORT environment variable binding, is included for reference.',
      ],
    },
    {
      label: 'What I would improve',
      body: [
        'The self-assessment loop is the most intellectually interesting part of the system and also its least validated component. The quality scoring relies on Gemini evaluating its own output, a known reliability concern, and the eval suite currently has no formal test cases. Before expanding the agent to a broader user base, the immediate priority would be building a labelled dataset of 40 to 60 extraction outputs with manually assigned quality scores from 1 to 5 and ground-truth categories, then measuring how often the agent\'s self-assigned score agrees with the human score within one point.',
        'The second improvement would be replacing the hardcoded sleep-based rate-limit strategy with a proper request queue and exponential backoff, which would also unlock concurrent URL processing and cut session time by roughly 60 to 70 percent for large batches.',
        'The third gap is the .docx output format itself. While functional and Notion-compatible, it is a one-directional export with no metadata attached to each entry. Adding source type, processing timestamp, quality score, and word count per entry as document properties would make the output auditable and allow downstream filtering without re-running the agent.',
      ],
    },
  ],
  chips: massSocialWisdomProjectCaseStudy?.chips ?? [
    { label: 'Workflow', value: 'Inspect -> Route -> Compose -> Self-Assess -> Categorise -> Sort -> Export', sourceStatus: 'local-primary' },
    { label: 'Output', value: 'Structured .docx for Notion import', sourceStatus: 'local-primary' },
    { label: 'Proof', value: 'Public GitHub repo and live portfolio demo', sourceStatus: 'public-proof' },
  ],
  structure: massSocialWisdomProjectCaseStudy?.structure ?? [
    { label: 'Model', value: 'Gemini 2.5 Flash for OCR, extraction, scoring, categorisation, and sorting' },
    { label: 'Context', value: 'Source URLs, captions, transcripts, screenshots, OCR text, and category rules' },
    { label: 'Orchestration', value: 'Background jobs, live polling, run cancellation, and document export' },
    { label: 'Governance', value: 'URL sanitisation, keyword overrides, failure logs, rate-limit pauses, and visitor caps' },
    { label: 'Human', value: 'The user decides what messy source material is worth turning into structured knowledge' },
  ],
  links: [
    { label: 'Live demo', href: 'https://ramin.vision/projects/mass-social-wisdom-agent', sourceStatus: 'public-proof' },
    { label: 'GitHub', href: 'https://github.com/raminhoodeh/mass-social-wisdom-agent', sourceStatus: 'public-proof' },
  ],
  assetSlots: massSocialWisdomProjectCaseStudy?.assetSlots ?? [
    { label: 'Next asset needed', note: 'Needs workflow screenshot or sample .docx output preview.', sourceStatus: 'manual-needed' },
  ],
  related: massSocialWisdomProjectCaseStudy?.related ?? ['Model', 'Context', 'Orchestration', 'Governance', 'Human'],
};

export const caseStudyByDeepDiveSlug = new Map<string, CaseStudyEntry>([
  ...deepDives.map((item) => [
    item.slug,
    toDeepDiveCaseStudyEntry(item, item.slug === 'ai-native-product-os' ? 'Thesis Case Study' : 'Portfolio Write-up'),
  ] as const),
  ['mass-social-wisdom-agent', massSocialWisdomThoughtsCaseStudy],
]);

export const caseStudyByProjectName = new Map(projectCaseStudyEntries.map((item) => [item.title, item]));
export const workCaseStudyByTitle = new Map(projectCaseStudies.map((item) => [item.title, item]));

export function getProjectReader(projectName: string) {
  if (projectName === 'AI Native Product OS') return caseStudyByDeepDiveSlug.get('ai-native-product-os');
  if (projectName === 'Mass Social Wisdom Agent') return massSocialWisdomThoughtsCaseStudy;
  return caseStudyByProjectName.get(projectName);
}

export const projectExperienceGroups = [
  {
    label: 'Apps',
    shortLabel: 'App',
    indexLabel: '02A',
    description: 'Mobile and app-store products with live user-facing surfaces.',
    titles: ['Dreamsea', '24Seven Concierge'],
  },
  {
    label: 'Web Apps',
    shortLabel: 'Web App',
    indexLabel: '02B',
    description: 'Browser-based self-ware, identity systems, intelligence surfaces, and curation products.',
    titles: ['nsso', 'Qadam', 'RazinFlix'],
  },
  {
    label: 'Tools',
    shortLabel: 'Tool',
    indexLabel: '02C',
    description: 'Agents, extraction workflows, dashboards, and reusable operating systems.',
    titles: ['AI-Native Product Manager OS', 'Mass Social Wisdom Agent', 'AI Costs Dashboard', 'RAG Pipeline'],
  },
] as const;

export const toolsSystemSignals = [
  {
    label: 'Context ownership',
    detail: 'Profile context, catalog context, dream traditions, source URLs, and curated corpora become the defensible product layer.',
    proof: 'RAG / wiki injection / catalog compression',
  },
  {
    label: 'Workflow motion',
    detail: 'Each tool turns a prompt into a repeatable sequence: classify, retrieve, generate, verify, review, export, or hand off.',
    proof: 'Tool calls / jobs / structured outputs',
  },
  {
    label: 'Governance visibility',
    detail: 'The useful architecture exposes cost, evals, privacy, refusal, review mode, and failure logs before scale.',
    proof: 'Evals / guardrails / observability',
  },
  {
    label: 'Human boundary',
    detail: 'The system can propose, compose, and route work; the user still owns taste, identity, acceptance, and final judgement.',
    proof: 'Review cards / handoffs / accepted actions',
  },
] as const;

export const layerValueKeys = {
  Model: 'modelLayer',
  Context: 'contextLayer',
  Orchestration: 'orchestrationLayer',
  Governance: 'governanceLayer',
  Human: 'humanLayer',
} as const;

export const thoughtArchitectureByProject = new Map(
  portfolioContent.teachingSpeakingWriting.architectureBridge.applications.map((application) => [
    application.projectName,
    application,
  ]),
);

export const toolSystemBySlug = new Map(toolsAndSystems.map((system) => [slugifyTitle(system.title), system]));

export const projectActNavItems = [
  { id: 'projects', label: 'Intro', index: '00' },
  { id: 'projects-selfware-stack', label: 'Selfware', index: '01' },
  { id: 'projects-tools', label: 'Tools', index: '02' },
  { id: 'projects-architecture', label: 'Architecture', index: '03' },
] as const;

export const thoughtFormatNavGroups = [
  {
    index: '01',
    label: 'Method',
    items: [
      {
        id: 'thoughts-foundations',
        label: 'Stratetree',
        detail: 'First-principles metacognition mapped to product.',
      },
      {
        id: 'thoughts-talks',
        label: 'Values',
        detail: 'How a cosmic perspective produces clear values.',
      },
    ],
  },
  {
    index: '02',
    label: 'Formation',
    items: [
      {
        id: 'thoughts-passions',
        label: 'Passions',
        detail: 'Storytelling, teaching, and building - the materials.',
      },
      {
        id: 'thoughts-integration',
        label: 'Teaching it',
        detail: 'How I help others integrate passions into career.',
      },
    ],
  },
  {
    index: '03',
    label: 'Integration',
    items: [
      {
        id: 'thoughts-work-narrative',
        label: 'Product management & AI product management frameworks',
        detail: 'What changed at OS, GroupM, and Vivup.',
      },
      {
        id: 'thoughts-case-studies',
        label: 'Case studies',
        detail: 'Products and tools - the argument made physical.',
      },
    ],
  },
] as const;
