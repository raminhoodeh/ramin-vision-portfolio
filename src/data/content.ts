import profilePictureUrl from '../assets/ramin-profile-nav.webp';
import { thoughtsAssets } from '../assets/thoughts';
import { placeholder } from './shared';
import type { AssetRequest, SourceStatus, PlaceholderValue } from './shared';
import { pmOsThesisUrl } from './nav';
import { deepDives, projectCaseStudies, architectureLayers, toolsAndSystems } from './projects';
import { experienceEntries } from './experience';
import { teachingWritingItems } from './teaching';

export const assetRequests = [
  {
    section: 'Global',
    requests: [
      'Preferred profile image',
      'Personal logo, or approval to keep the RH monogram',
      'Final email and social links',
      'Any global confidentiality rules',
    ],
  },
  {
    section: 'Identity, Bio & AI PM Thesis',
    requests: [
      'AI-Native Product OS diagram or permission to create one',
      'Talk -> Decide -> Build -> Observe -> Iterate loop visual',
      'Notion/source links that are safe to reference',
      'Preferred final wording for the thesis',
    ],
  },
  {
    section: 'Product Management Experience',
    requests: [
      'Company logos or permission to use text-only marks',
      'Which roles can mention metrics publicly',
      'Confidential exclusions for Bayut and Side.inc',
      'Any approved product screenshots or public-safe diagrams',
    ],
  },
  {
    section: 'Projects / Self-ware',
    requests: [
      'Logo, hero screenshot, demo URL, repo URL, and video walkthrough for each project',
      'One-line description, problem statement, proof/status, and confidentiality notes per project',
      'Screenshots for nsso, Dreamsea, Qadam, 24Seven, RazinFlix, and Mass Social Wisdom Agent',
    ],
  },
  {
    section: 'Tools & Systems',
    requests: [
      'AI-Native Product OS stack and loop diagrams',
      'Deity RAG/tool-call flow diagram',
      'Dreamsea generation pipeline screenshot or sequence diagram',
      '24Seven catalog-to-itinerary diagram',
      'Mass Social Wisdom Agent workflow screenshot or demo GIF',
      'AI Costs Dashboard screenshot, routing-decision diagram, or anonymised chart',
      'RAG Pipeline source-safe ingestion/retrieval diagram',
      'Source links for public RAG, agent, or evaluation systems',
    ],
  },
  {
    section: 'Qualifications',
    requests: [
      'Certificate images or credential badges',
      'Verification links',
      'Institution logos, if allowed',
    ],
  },
  {
    section: 'Thoughts / Teaching, Speaking, Writing',
    requests: [
      'Course links and thumbnails',
      'TEDx link and preferred thumbnail',
      'Book cover and Amazon link',
      'Essay links or inline draft copy',
    ],
  },
  {
    section: 'Ramin.AI Prototype',
    requests: [
      'Final allowed knowledge source list',
      'Disallowed claims and sensitive areas',
      'Preferred response tone',
      'Example prompts for role fit, project critique, and AI feature design',
      'Decision on static, retrieval-backed, or live model implementation',
      'Model/provider preference later',
    ],
  },
] as const;

export const contentReadiness = {
  title: 'Content Readiness',
  accessHint: 'Append ?intake=1 to review missing evidence without changing the public section hierarchy.',
  groups: [
    {
      sectionNumber: '01',
      section: 'Hero',
      target: 'hero',
      priority: 'High',
      sourceNote: 'Hero is structurally complete; final approval is mostly about identity assets and thesis destination.',
      requests: [
        { item: 'Final preferred profile picture', sourceStatus: 'asset-lead' as SourceStatus },
        { item: 'Approval to keep the RH monogram or provide a personal logo', sourceStatus: 'manual-needed' as SourceStatus },
        { item: 'Confirm PM OS Thesis destination remains the Notion course-structure URL', sourceStatus: 'manual-needed' as SourceStatus },
      ],
    },
    {
      sectionNumber: '02',
      section: 'Experience & Education',
      target: 'experience-education',
      priority: 'High',
      sourceNote: 'The ten-company experience structure plus formal education and certifications are complete; evidence assets and public-safe wording are the main gaps.',
      requests: [
        { item: 'Company logos or approval to use text-only marks', sourceStatus: 'manual-needed' as SourceStatus },
        { item: 'Product videos, screenshots, or safe placeholder diagrams for each company', sourceStatus: 'manual-needed' as SourceStatus },
        { item: 'Locations, market type, customer/client type, and user-number wording for each role', sourceStatus: 'manual-needed' as SourceStatus },
        { item: 'Reviews or testimonials that are safe to show', sourceStatus: 'manual-needed' as SourceStatus },
        { item: 'Confidential exclusions for Bayut, SIDE, and any sensitive client work', sourceStatus: 'manual-needed' as SourceStatus },
        { item: 'Institution logos or approval for text-only institution marks', sourceStatus: 'manual-needed' as SourceStatus },
        { item: 'Certificate images, badge images, or verification links', sourceStatus: 'manual-needed' as SourceStatus },
        { item: 'Modules included for each certification', sourceStatus: 'manual-needed' as SourceStatus },
        { item: 'Final wording for how each qualification helped you as a PM', sourceStatus: 'asset-lead' as SourceStatus },
      ],
    },
    {
      sectionNumber: '03',
      section: 'Personal Projects (Tools & Selfware)',
      target: 'projects',
      priority: 'High',
      sourceNote: 'The project taxonomy and shared card structure are complete; approved media and links are still needed.',
      requests: [
        { item: 'Main picture/GIF and secondary picture for every Selfware and Tools item', sourceStatus: 'asset-lead' as SourceStatus },
        { item: 'Live links and GitHub links where safe to publish', sourceStatus: 'manual-needed' as SourceStatus },
        { item: 'Domain expertise partner picture and short bio for Selfware projects', sourceStatus: 'manual-needed' as SourceStatus },
        { item: 'Full write-up links for every project and tool case study', sourceStatus: 'manual-needed' as SourceStatus },
        { item: 'Architecture diagrams for AI Native Product OS, Mass Social Wisdom Agent, AI Costs Dashboard, and RAG Pipeline', sourceStatus: 'manual-needed' as SourceStatus },
      ],
    },
    {
      sectionNumber: '04',
      section: 'Teaching, Speaking & Writing',
      target: 'teaching-speaking-writing',
      priority: 'High',
      sourceNote: 'All required sub-categories exist; media, article content, diagrams, and write-up links need completion.',
      requests: [
        { item: 'Course trailers, course links, and module lists for both courses', sourceStatus: 'manual-needed' as SourceStatus },
        { item: 'YouTube/embed links and thumbnails for both talks', sourceStatus: 'manual-needed' as SourceStatus },
        { item: 'Book images, The Proposition video, purchase/preview/summary/full-text links as applicable', sourceStatus: 'manual-needed' as SourceStatus },
        { item: 'Framework of Metacognition and Framework of Reality final article copy plus diagrams', sourceStatus: 'manual-needed' as SourceStatus },
        { item: 'AI-Native Product OS workflow diagram, layer-lenses overview visual, and full write-up link', sourceStatus: 'manual-needed' as SourceStatus },
      ],
    },
    {
      sectionNumber: '05',
      section: 'Contact CTA',
      target: 'contact',
      priority: 'Medium',
      sourceNote: 'Email and WhatsApp deep link are present; final availability wording still needs approval.',
      requests: [
        { item: 'Confirm public email label', sourceStatus: 'asset-lead' as SourceStatus },
        { item: 'Confirm availability wording and social links', sourceStatus: 'asset-lead' as SourceStatus },
      ],
    },
    {
      sectionNumber: '06',
      section: 'Bonus Section',
      target: 'bonus',
      priority: 'Medium',
      sourceNote: 'The 3D rock interaction exists; gift destinations still need real links.',
      requests: [
        { item: 'AI PM Course coupon destination or redemption instructions', sourceStatus: 'manual-needed' as SourceStatus },
        { item: 'Google Meet link for the 30-minute consultation', sourceStatus: 'manual-needed' as SourceStatus },
        { item: 'Dreamsea lifetime-access instructions and app link', sourceStatus: 'manual-needed' as SourceStatus },
        { item: 'AI Tools Database spreadsheet link', sourceStatus: 'manual-needed' as SourceStatus },
      ],
    },
    {
      sectionNumber: '07',
      section: 'AI Ramin Chatbot',
      target: 'ai-ramin-modal',
      priority: 'Medium',
      sourceNote: 'Aesthetic modal placeholder exists; future implementation needs approved memory and guardrails.',
      requests: [
        { item: 'Final allowed knowledge-source list', sourceStatus: 'manual-needed' as SourceStatus },
        { item: 'Disallowed claims, sensitive areas, and confidentiality rules', sourceStatus: 'manual-needed' as SourceStatus },
        { item: 'Example prompts for role fit, project critique, AI feature design, and proof retrieval', sourceStatus: 'manual-needed' as SourceStatus },
        { item: 'Decision on static, retrieval-backed, or live model implementation', sourceStatus: 'manual-needed' as SourceStatus },
      ],
    },
  ],
} as const;

export const stats = [
  { value: '10', label: 'Product environments' },
  { value: '4', label: 'AI certifications' },
  { value: '£1B+', label: 'Media investment measured' },
] as const;

export const socialLinks = [
  { label: 'LinkedIn', href: 'http://bit.ly/raminlinkedin' },
  { label: 'GitHub', href: 'https://github.com/raminhoodeh' },
  { label: 'Book', href: 'https://author.vision/' },
] as const;

const detailNeeded = () => placeholder('Detail needed');
const logoNeeded = () => placeholder('Logo needed');
const videoNeeded = () => placeholder('Video needed');
const linkNeeded = () => placeholder('Link needed');
const reviewNeeded = () => placeholder('Review needed');
const qualificationLogoPath = {
  anthropic: 'work-section/qualification-logos/anthropic-logo.png',
  google: 'work-section/qualification-logos/google-logo.jpeg',
  ibm: 'work-section/qualification-logos/ibm-logo.png',
  imperial: 'work-section/qualification-logos/imperial-college-logo.jpeg',
  mbti: 'work-section/qualification-logos/mbti.png',
} as const;
const companyLogoPath = {
  bayut: 'work-section/company-logos/bayut logo.webp',
  coxAutomotive: 'work-section/company-logos/cox automotive logo.jpg',
  deityAi: 'work-section/company-logos/deity-ai-logo.png',
  erm: 'work-section/company-logos/erm logo.jpg',
  groupm: 'work-section/company-logos/groupm logo.webp',
  ordnanceSurvey: 'work-section/company-logos/ordnance survey logo.jpg',
  perkbox: 'work-section/company-logos/perkbox.com.png',
  side: 'work-section/company-logos/side logo.png',
  tesla: 'work-section/company-logos/tesla logo.png',
  urgentem: 'work-section/company-logos/urgentem logo.jpg',
} as const;
const companyVideoPath = {
  bayut: 'work-section/company-videos/bayut-work-video.mov',
  coxAutomotive: 'work-section/company-videos/cox-auto-work-video.mov',
  deityAi: 'work-section/company-videos/deity-work-video.mov',
  erm: 'work-section/company-videos/erm-work-video.mov',
  groupm: 'work-section/company-videos/groupm-work-video.mp4',
  ordnanceSurvey: 'work-section/company-videos/ordnance-survey-video.mov',
  perkbox: 'work-section/company-videos/perkbox-work-video.mov',
  side: 'work-section/company-videos/side-work-video.mov',
  tesla: 'work-section/company-videos/tesla-work-video.mov',
  urgentem: 'work-section/company-videos/urgentem-work-video.mov',
} as const;

const firstSentence = (items?: readonly string[]) => items?.[0] ?? detailNeeded();
const findExperience = (company: string) => experienceEntries.find((item) => item.company === company);
const findProject = (title: string) => projectCaseStudies.find((item) => item.title === title);
const findTool = (title: string) => toolsAndSystems.find((item) => item.title === title);
const findTeachingWriting = (title: string) => teachingWritingItems.find((item) => item.title === title);

type SourceLink = { label: string; href: string; sourceStatus: SourceStatus };
const firstLink = (links?: readonly SourceLink[]) => links?.[0]?.href ?? linkNeeded();
const githubLink = (links?: readonly SourceLink[]) =>
  links?.find((link) => /github/i.test(link.label))?.href ?? linkNeeded();
const projectGithubLinks: Record<string, string> = {
  'AI-Native Product Manager OS': 'https://github.com/raminhoodeh/AI-Native-Product-OS',
  'Mass Social Wisdom Agent': 'https://github.com/raminhoodeh/mass-social-wisdom-agent',
  'AI Costs Dashboard': 'https://github.com/raminhoodeh/ai-costs-dashboard',
  'RAG Pipeline': 'https://github.com/raminhoodeh/unified-rag-pipeline',
};

const createWorkExperience = (companyName: string, sourceCompany: string) => {
  const source = findExperience(sourceCompany);

  return {
    companyLogo: logoNeeded(),
    companyName,
    productVideo: videoNeeded(),
    location: detailNeeded(),
    monthYearRangeWorked: source?.dates ?? detailNeeded(),
    jobTitle: source?.role ?? detailNeeded(),
    companyDescription: source?.domain ?? detailNeeded(),
    industryTag: source?.chips[0] ?? detailNeeded(),
    productsWorkedOn: source?.chips ?? [detailNeeded()],
    mainAchievements: source ? [source.outcome, source.proof] : [detailNeeded()],
    processesIntroducedManagerial: source?.whatItProves ? [source.whatItProves] : [detailNeeded()],
    marketType: detailNeeded(),
    customerClientTypesAndUserNumbers: detailNeeded(),
    reviews: [reviewNeeded()],
  };
};

const createProjectEntry = (
  projectName: string,
  sourceTitle: string,
  type: 'App' | 'iOS App' | 'Web App' | 'Tool' | 'Agent',
  sourceKind: 'case-study' | 'tool',
) => {
  const caseStudy = findProject(sourceTitle);
  const tool = sourceKind === 'tool' ? findTool(sourceTitle) : undefined;

  return {
    projectName,
    mainPictureGif: caseStudy?.image ?? detailNeeded(),
    secondaryPicture: detailNeeded(),
    briefDescription: caseStudy?.summary ?? tool?.description ?? detailNeeded(),
    type,
    technicalStack: caseStudy
      ? caseStudy.architectureChips.map((chip) => `${chip.label}: ${chip.value}`)
      : tool
        ? [
            `Model: ${tool.modelLayer}`,
            `Context: ${tool.contextLayer}`,
            `Orchestration: ${tool.orchestrationLayer}`,
            `Governance: ${tool.governanceLayer}`,
            `Human: ${tool.humanLayer}`,
          ]
        : [detailNeeded()],
    domainExpertisePartner:
      sourceKind === 'case-study'
        ? {
            partnerPicture: logoNeeded(),
            shortBio: detailNeeded(),
          }
        : undefined,
    problem: caseStudy ? firstSentence(caseStudy.problem) : tool?.description ?? detailNeeded(),
    architecture: caseStudy ? firstSentence(caseStudy.architecture) : tool?.layer ?? detailNeeded(),
    whyThisApproach: caseStudy ? firstSentence(caseStudy.approach) : detailNeeded(),
    tradeoffs: caseStudy ? firstSentence(caseStudy.tradeoffs) : detailNeeded(),
    whatIWouldImprove: caseStudy ? firstSentence(caseStudy.improve) : detailNeeded(),
    liveLink: firstLink(caseStudy?.links),
    githubLink: projectGithubLinks[projectName] ?? githubLink(caseStudy?.links),
    fullWriteupLink: linkNeeded(),
  };
};

const createTeachingEntry = (courseTitle: string, sourceTitle: string, tag: 'Highest-Rated' | 'New') => {
  const source = findTeachingWriting(sourceTitle);

  return {
    courseTitle,
    courseDescription: source?.subtitle ?? detailNeeded(),
    courseModules: [detailNeeded()],
    courseTrailer: videoNeeded(),
    courseLink: source?.href ?? linkNeeded(),
    tag,
  };
};

const createSpeakingEntry = (talkTitle: string, sourceTitle: string, invitedBy: string | PlaceholderValue) => {
  const source = findTeachingWriting(sourceTitle);

  return {
    talkTitle,
    invitedBy,
    talkDescription: source?.subtitle ?? detailNeeded(),
    youtubeEmbeddedLink: source?.href ?? linkNeeded(),
  };
};

const thoughtQuoteLines = {
  formation: 'You are not defined by what you do. You are shaped by what you create.',
  orientation: 'And to direct ourselves to where we want to be, we have to first know where we are.',
  talkPrinciple: 'What they need to hear is more important than what you want to say.',
  noisyWorld: 'The devil makes the world noisy so that men can no longer hear themselves.',
} as const;

const thoughtPageFrame = {
  headline: 'My theories, talks, books and courses',
  kicker: 'How thought becomes formation, expression, and built systems',
  formationQuote: thoughtQuoteLines.formation,
  body: '',
  heroBridge:
    'I build products by first clarifying the human situation, then designing the system that helps people act with better judgment.',
  thesisSpine: [
    {
      label: 'How I think.',
      body: 'Reduce overinformation, know where we are, and find the values that make judgment possible.',
    },
    {
      label: 'How I express it.',
      body: 'Speak what people need to hear, write symbolic stories, and turn inner clarity into memorable form.',
    },
    {
      label: 'What it builds.',
      body: 'Design operating systems, AI workflows, and products that make clearer action easier.',
    },
  ],
  quoteThread: {
    eyebrow: 'Quote thread',
    title: 'The lines I keep returning to.',
    body:
      'Formation, orientation, speaking, and clarity are not separate themes to me. They are different ways of protecting the same inner direction.',
    items: [
      {
        label: 'Formation',
        quote: thoughtQuoteLines.formation,
        source: 'Original Thoughts thesis',
        role: 'Creation is not just output. It is one of the ways I discover what I am becoming.',
      },
      {
        label: 'Orientation',
        quote: thoughtQuoteLines.orientation,
        source: 'General thoughts / metaphysics and product management',
        role: 'Decision quality depends on knowing where you are before deciding where to go.',
      },
      {
        label: 'Speaking',
        quote: thoughtQuoteLines.talkPrinciple,
        source: 'University talk principle',
        role: 'A talk is judged by what the room needs to receive, not by what the speaker wants to perform.',
      },
      {
        label: 'Clarity',
        quote: thoughtQuoteLines.noisyWorld,
        source: 'The Proposition / Framework of Reality',
        role: 'The core problem is noise; the work is to restore the conditions for judgment, conscience, and action.',
      },
    ],
  },
  formationBody:
    'Creation is not output alone. Every talk, book, system, and product has changed the way I think while becoming useful to other people.',
  formatIntros: {
    talks: {
      title: 'What do I value? Zoom out first.',
      quote: thoughtQuoteLines.talkPrinciple,
      body:
        'The TEDx talk answers the next question after clarity: if I need values to choose well, I have to widen the frame enough to see what actually matters.',
      expression: {
        eyebrow: 'What do I value?',
        title: 'Cosmic perspective as a value-finding tool.',
        body:
          'The TEDx talk turns metaphysics into an embodied exercise. Instead of telling people to value better things, it asks them to feel their place in existence, then return to ordinary decisions from that larger scale.',
        links: [
          {
            label: 'Perspective',
            body: 'The everyday problem becomes smaller when seen against the reality of existence.',
          },
          {
            label: 'Embodiment',
            body: 'Mindfulness and imagination make the idea felt, not only understood.',
          },
          {
            label: 'Decision',
            body: 'A wider frame changes the flow of what feels worth choosing.',
          },
        ],
      },
    },
    books: {
      title: 'For me, values become storytelling and beautiful products.',
      body:
        'The answer to what I value is not only a belief. It becomes a way of making: stories that make metaphysics memorable, and products that make identity clearer, more beautiful, and more future-proof.',
      expression: {
        eyebrow: 'Storycraft',
        title: 'Storytelling and product craft are the same impulse.',
        body:
          'The books carry the inner search through myth, symbolism, characters, and practical guides. nsso carries the same instinct into product form: a beautiful identity surface that lets people gather their scattered selves into one coherent public story.',
        links: [
          {
            label: 'Story',
            body: 'The Proposition turns dense metaphysical enquiry into a fictional world, so wisdom can be remembered as a lived scene rather than a lecture.',
          },
          {
            label: 'Guide',
            body: 'The Meaning of Life compresses the same search into five existential questions and a practical path back to purpose.',
          },
          {
            label: 'Product',
            body: 'nsso turns personal story into infrastructure: profile, projects, products, links, AI coaching, and a future-proof identity system.',
          },
        ],
      },
      personalExpression: {
        eyebrow: 'For me',
        title: 'Storytelling. Beautiful products. Future-proof identity.',
        quote:
          'I want to write stories; beautiful stories about the mystery of this life and the wonders of our existence.',
        thesis:
          'When I ask what matters from a wider perspective, I keep returning to the same answer: make meaning clear through story, then make that clarity usable through products.',
        pillars: [
          {
            label: 'Storytelling',
            body:
              'The books are not side projects. They are the metaphysical work in narrative form: characters, symbols, purpose guides, and worlds that make abstract wisdom easier to carry.',
          },
          {
            label: 'Beauty',
            body:
              'Beauty is not decoration here. It is what makes a thing feel worth approaching, remembering, and believing in long enough to use.',
          },
          {
            label: 'Future-proofing',
            body:
              'The professional world is becoming more independent, AI-mediated, and identity-driven, so people need a clearer, more owned, more adaptive identity surface.',
          },
        ],
        nsso: {
          eyebrow: 'Product bridge / nsso',
          title: 'All of you, all in one place.',
          body:
            'nsso is where the same storytelling instinct becomes product architecture: a dynamic profile, storefront, project surface, public identity system, and AI-assisted profile coach for expressing your whole professional story from one URL.',
          productThesis:
            'Professional identity online is a fragmentation problem masquerading as a presentation problem.',
          designThesis:
            'The product uses glassmorphic surfaces, cloud-like typography, and the "Clarify / Organise / Future-Proof Yourself / Present / Discover" language to make identity feel spatial, calm, and high-value.',
          links: [
            { label: 'nsso', href: 'https://www.nsso.me/' },
            { label: 'Ramin profile', href: 'https://nsso.me/ramin' },
            { label: 'Refractive design video', href: 'https://youtu.be/n9-WjzJlq-Q?si=x5QBE6cMl2bNN4Tw' },
          ],
          stack: [
            'Personal profile',
            'Projects and products',
            'Hosted sales pages',
            'AI profile coach',
            'Future-proof identity',
          ],
        },
      },
    },
    courses: {
      title: 'The old process became the new loop.',
      body:
        'Product Innovation Process made product work legible for teams. AI-Native Product OS updates that same instinct for probabilistic systems, where context, governance, orchestration, and human judgment become the operating model.',
      systemsStage: {
        eyebrow: 'Systems',
        title: 'The old process became the new loop.',
        thesis:
          'This is where metacognition becomes operational: first as a shared product process for stakeholder alignment, then as an AI-native loop for building, evaluating, and governing living systems.',
        question: 'What systems could I make to support the way I think and build?',
        evolution: [
          {
            label: 'Original system',
            name: 'Product Innovation Process',
            shape: 'Discovery -> Product Design -> Alpha -> Beta -> Live',
            body:
              'A deterministic product process: one vision, one source of truth, one agreed language for cross-functional teams moving from idea to launch.',
            humanEmphasis: 'Stakeholder alignment',
          },
          {
            label: 'Evolved system',
            name: 'AI-Native Product OS',
            shape: 'Talk -> Decide -> Build -> Observe -> Iterate',
            body:
              'A probabilistic product loop: fast prototypes, owned context, orchestration, evals, guardrails, and the human layer directing the system.',
            humanEmphasis: 'Human layer',
          },
        ],
        comparison: [
          {
            axis: 'Material',
            before: 'Deterministic software that can be specified, built, tested, and shipped through stage-gates.',
            after: 'Probabilistic AI systems that must be observed, measured, corrected, and improved through loops.',
          },
          {
            axis: 'Coordination problem',
            before: 'Teams, stakeholders, and departments drift when there is no single source of truth.',
            after: 'Models, tools, context, and agents drift when there is no operating stack or governance discipline.',
          },
          {
            axis: 'Core empathy',
            before: 'Stakeholder alignment: helping people see the same product story and move in the same direction.',
            after: 'Human layer: vision, empathy, taste, communication, and judgment guiding cheap execution.',
          },
          {
            axis: 'Teaching method',
            before: 'Checklist-led walkthroughs, stage-gate templates, and real product examples.',
            after: 'Systems thinking, live demos, reusable assets, and example stories that install a durable mental map.',
          },
        ],
        synthesis: {
          title: 'The empathy survives the upgrade.',
          body:
            'The Product Innovation Process was never only about documentation; it was about reducing stress by getting people aligned. The AI-Native Product OS keeps that same human purpose, but upgrades the shape of the work for AI: faster loops, clearer context, measurable governance, and better judgment.',
        },
      },
      expression: {
        eyebrow: 'Systems 05 / Operational method',
        title: 'The frameworks made teachable.',
        body:
          'Courses are where the thinking becomes transferable. Product Innovation Process turns ambiguity into a shared source of truth for teams. AI Product Manager OS updates that method for probabilistic AI work, where context, governance, orchestration, and human judgment become the product manager\'s real operating system.',
        links: [
          {
            label: 'Metacognition',
            body: 'Experience becomes method: idea, context, decision, build, measurement, iteration.',
          },
          {
            label: 'Product OS',
            body: 'The course format turns judgment into loops, templates, modules, and usable assets.',
          },
          {
            label: 'Transfer',
            body: 'The goal is not just to explain what I know, but to make others capable of using it.',
          },
        ],
      },
    },
  },
} as const;

const thoughtAssetSources = {
  talks: {
    tedx: {
      path: thoughtsAssets.talks.tedxTalk,
      sourcePath: 'thoughts-section/talks/tedx final final.png',
      alt: 'Ramin Hoodeh speaking at TEDx Imperial College London.',
      orientation: 'wide',
    },
    university: {
      path: thoughtsAssets.talks.universityTalk,
      sourcePath: 'thoughts-section/talks/University-Talk-picture.jpg',
      alt: 'Ramin Hoodeh giving a university talk.',
      orientation: 'portrait',
    },
  },
  courses: {
    aiProductManager: {
      path: thoughtsAssets.courses.aiProductManagerCourse,
      sourcePath: 'thoughts-section/courses/ai-product-manager-course-thumbnail.png',
      alt: 'Transition from Product Manager to AI Product Manager course thumbnail.',
      orientation: 'wide',
    },
    productInnovationThumbnail: {
      path: thoughtsAssets.courses.productInnovationCourse,
      sourcePath: 'thoughts-section/courses/product-innovation-course-thumbnail.jpg',
      alt: 'Product Innovation Process course thumbnail.',
      orientation: 'wide',
    },
    productInnovationMockup: {
      path: thoughtsAssets.courses.productInnovationLaptop,
      sourcePath: 'thoughts-section/courses/product-innovation-process-course-laptop-mockup.jpg',
      alt: 'Product Innovation Process laptop mockup.',
      orientation: 'wide',
    },
  },
  books: {
    proposition: [
      {
        path: thoughtsAssets.books.proposition.bookCover,
        sourcePath: 'thoughts-section/books/the-proposition-pictures/the-proposition-book-picture.jpg',
        alt: 'The Proposition book cover photographed as a physical artifact.',
        role: 'cover',
      },
      {
        path: thoughtsAssets.books.proposition.bookOpen,
        sourcePath: 'thoughts-section/books/the-proposition-pictures/the-proposition-book-opened-picture.jpg',
        alt: 'The Proposition opened book photograph.',
        role: 'interior',
      },
      {
        path: thoughtsAssets.books.proposition.triptych,
        sourcePath: 'thoughts-section/books/the-proposition-pictures/Triptich Final.png',
        alt: 'Triptych artwork from The Proposition.',
        role: 'world',
      },
      {
        path: thoughtsAssets.books.proposition.adamMeetsGod,
        sourcePath: 'thoughts-section/books/the-proposition-pictures/adam-meets-god.png',
        alt: 'Adam meets God illustration from The Proposition visual world.',
        role: 'world',
      },
      {
        path: thoughtsAssets.books.proposition.adamEveCharacter,
        sourcePath: 'thoughts-section/books/the-proposition-pictures/adam-eve-character.png',
        alt: 'Adam and Eve character artwork from The Proposition.',
        role: 'character',
      },
      {
        path: thoughtsAssets.books.proposition.bookCharacter,
        sourcePath: 'thoughts-section/books/the-proposition-pictures/the-proposition-book-character-picture.jpg',
        alt: 'The Proposition character book photograph.',
        role: 'cover',
      },
      {
        path: thoughtsAssets.books.proposition.frontCoverExtended,
        sourcePath: 'thoughts-section/books/the-proposition-pictures/the proposition-front-cover-extended-background.jpg',
        alt: 'The Proposition extended cover artwork.',
        role: 'cover',
      },
      {
        path: thoughtsAssets.books.proposition.gardenOfEden,
        sourcePath: 'thoughts-section/books/the-proposition-pictures/garden-of-eden.jpg',
        alt: 'Garden of Eden artwork from The Proposition.',
        role: 'world',
      },
      {
        path: thoughtsAssets.books.proposition.loverCharacter,
        sourcePath: 'thoughts-section/books/the-proposition-pictures/lover-character.png',
        alt: 'Lover character artwork from The Proposition.',
        role: 'character',
      },
      {
        path: thoughtsAssets.books.proposition.magicianCharacter,
        sourcePath: 'thoughts-section/books/the-proposition-pictures/magician-character.png',
        alt: 'Magician character artwork from The Proposition.',
        role: 'character',
      },
      {
        path: thoughtsAssets.books.proposition.warriorCharacter,
        sourcePath: 'thoughts-section/books/the-proposition-pictures/warrior-character.png',
        alt: 'Warrior character artwork from The Proposition.',
        role: 'character',
      },
    ],
    meaningOfLife: [
      {
        path: thoughtsAssets.books.meaningOfLife.bookCover,
        sourcePath: 'thoughts-section/books/the-meaning-of-life-book-pictures/the-meaning-of-life-book-picture.jpg',
        alt: 'The Meaning of Life book photographed as a physical artifact.',
        role: 'cover',
      },
      {
        path: thoughtsAssets.books.meaningOfLife.bookWidescreen,
        sourcePath: 'thoughts-section/books/the-meaning-of-life-book-pictures/the-meaning-of-life-book-widescreen-animated.jpg',
        alt: 'The Meaning of Life widescreen artwork.',
        role: 'world',
      },
      {
        path: thoughtsAssets.books.meaningOfLife.quotePage,
        sourcePath: 'thoughts-section/books/the-meaning-of-life-book-pictures/the-meaning-of-life-book-page-quote-screenshot.png',
        alt: 'A page quote screenshot from The Meaning of Life.',
        role: 'quote',
      },
      {
        path: thoughtsAssets.books.meaningOfLife.serpentWidescreen,
        sourcePath: 'thoughts-section/books/the-meaning-of-life-book-pictures/the-meaning-of-life-serpent-image-widescreen.png',
        alt: 'The Meaning of Life serpent widescreen artwork.',
        role: 'world',
      },
      {
        path: thoughtsAssets.books.meaningOfLife.bookAnimatedPortrait,
        sourcePath: 'thoughts-section/books/the-meaning-of-life-book-pictures/the-meaning-of-life-book-animated-portrait.png',
        alt: 'The Meaning of Life animated portrait artwork.',
        role: 'cover',
      },
      {
        path: thoughtsAssets.books.meaningOfLife.edenGardenPortrait,
        sourcePath: 'thoughts-section/books/the-meaning-of-life-book-pictures/the-meaning-of-life-eden-garden-image-portrait.png',
        alt: 'The Meaning of Life Eden garden portrait artwork.',
        role: 'world',
      },
      {
        path: thoughtsAssets.books.meaningOfLife.snakePortrait,
        sourcePath: 'thoughts-section/books/the-meaning-of-life-book-pictures/the-meaning-of-life-snake-portrait-imge.png',
        alt: 'The Meaning of Life snake portrait artwork.',
        role: 'world',
      },
    ],
  },
} as const;

const thoughtTalks = [
  {
    ...createSpeakingEntry(
      'Existentially Viewing your Existential Crisis',
      'Existentially viewing your existential crisis',
      'TEDx / Imperial College London',
    ),
    displayTitle: 'Existentially Viewing Your Existential Crisis',
    venue: 'Imperial College London',
    formatRole: 'Cosmic perspective talk',
    media: thoughtAssetSources.talks.tedx,
    youtubeEmbeddedLink: 'https://www.ted.com/talks/ramin_hoodeh_existentially_viewing_your_existential_crisis',
    coreIdea:
      'A guided attempt to help people make decisions from the reality of existence rather than from daily noise alone.',
    audienceTakeaway:
      'Use mindfulness and imagination to temporarily see life from a wider cosmic perspective, then let that perspective reorder what matters.',
    whyItShapedMe:
      'It turned a private metaphysical instinct into a public experience and showed that abstract reflection can be made visceral for an audience.',
    liveMoment:
      'The talk included a guided visualization exercise, asking the room to experience a version of the astronaut or spiritual-guru perspective without leaving Earth.',
    valueStage: {
      eyebrow: 'What do I value?',
      question: 'So how do I find what I value?',
      title: 'To find what you value, first understand where and what you are.',
      thesis:
        'For me, TEDx was the practical continuation of Framework of Reality: if fulfilment depends on clear values, then the first task is to become conscious of where I am and what kind of being I am.',
      bridge:
        'I use the talk to do exactly what the framework asks for: zoom out from daily noise, become aware of Earth, consciousness, scale, beauty, fragility, and responsibility, then return to ordinary decisions with clearer values.',
      valueLens: [
        {
          label: 'Where am I?',
          body: 'On a rare, fragile Earth inside a vast energetic universe, not just inside the pressure of the current week.',
        },
        {
          label: 'What am I?',
          body: 'A conscious human made from the same material and energy as the world I am trying to understand.',
        },
        {
          label: 'What matters?',
          body: 'Beauty, mindfulness, planning, and decisions that respect the significance of being alive.',
        },
        {
          label: 'What changes?',
          body: 'Even one visualization can alter the flow of later decisions by making trivial concerns feel proportionate again.',
        },
      ],
      method: [
        {
          label: 'Astronaut view',
          body: 'Use scale to feel the beauty and fragility of Earth.',
        },
        {
          label: 'Inner view',
          body: 'Use mindfulness to experience the same unity without leaving ordinary life.',
        },
        {
          label: 'Return',
          body: 'Come back to daily choices with clearer values and a larger sense of responsibility.',
        },
      ],
      outcome:
        'The point is not escapism. The point is to return from the wider view with a more truthful sense of what deserves attention.',
    },
    tags: ['TEDx', 'Mindfulness', 'Decision-making', 'Cosmic perspective'],
    sourceLinks: [
      {
        label: 'Watch TEDx talk',
        href: 'https://www.ted.com/talks/ramin_hoodeh_existentially_viewing_your_existential_crisis',
        sourceStatus: 'public-proof' as SourceStatus,
      },
    ],
  },
  {
    ...createSpeakingEntry('My Story', 'My Life Story', 'University talk'),
    venue: 'University audience',
    formatRole: 'Origin story talk',
    media: thoughtAssetSources.talks.university,
    youtubeEmbeddedLink: 'https://www.youtube.com/watch?v=fpNNyHFUKzM',
    coreIdea:
      'A personal account of turning a fragmented life and career path into a middle-way system where professional work and creative purpose reinforce each other.',
    audienceTakeaway:
      'Build a clear story around your experiences, use your 9-5 and your personal projects to compound each other, and create from the vision that keeps you moving through mundane work.',
    whyItShapedMe:
      'It forced the full arc into one story: family, migration, faith-adjacent meaning, Tesla, TEDx, sustainability, product management, books, nsso, and teaching.',
    liveMoment:
      'The talk connects practical career advice with the deeper argument that reducing noise helps people hear the inner voice that knows what they value.',
    integrationStage: {
      eyebrow: 'Integration',
      question: 'How do personal passions and professional skills reinforce each other?',
      title: 'Make the real-life job and the fantasy dream compound.',
      thesis:
        'The University talk is the practical bridge between values, expression, and systems: do work that funds, sharpens, and proves the thing you actually want to create.',
      quote:
        'The best way to turn a potentially boring existence into something beautiful is to see how your mundane tasks are getting you closer to a more magical vision or goal.',
      bridge:
        'Career, family, creative ambition, and product judgment are not separate identities to me. They become stronger when I arrange them around one clear end result.',
      principles: [
        {
          label: '9-5 vision',
          body: 'The job needs a direction beyond status or survival: what skill, credibility, and leverage is it giving you?',
        },
        {
          label: 'Personal vision',
          body: 'The passion project gives mundane work a larger horizon, whether the dream is publishing, building, or simply providing for people you love.',
        },
        {
          label: 'Middle way',
          body: 'Professional work and personal projects should compound: each one gives the other proof, story, skill, money, and authority.',
        },
      ],
      arc: [
        {
          label: 'Merdad Collection',
          body: 'Family business taught product, process, people, brand character, and the discipline of thinking about the end result.',
        },
        {
          label: 'Tesla + TEDx',
          body: 'Sustainability, space, and the wider view turned career choices into questions of objective place, purpose, and values.',
        },
        {
          label: 'Startups to PM',
          body: 'Working for free, rejection, and the OS role translated creative instincts into product management.',
        },
        {
          label: 'Book + nsso',
          body: 'The book proved storytelling, the career gave authority, and nsso became the place where fragmented sides could be presented together.',
        },
      ],
      synthesis: {
        title: 'The middle way',
        body:
          'Loving my work is less about constant enjoyment and more about seeing how each task moves me toward a clearer personal and professional vision. Once I understand the pattern, I can teach it, repeat it, and build it into products.',
      },
    },
    tags: ['Storytelling', 'Career clarity', 'Middle way', 'Personal operating system'],
    sourceLinks: [
      {
        label: 'Watch on YouTube',
        href: 'https://www.youtube.com/watch?v=fpNNyHFUKzM',
        sourceStatus: 'public-proof' as SourceStatus,
      },
    ],
  },
] as const;

const thoughtCourses = [
  {
    ...createTeachingEntry(
      'Transitioning to AI Product Management',
      'Transition from Product Manager to AI Product Manager',
      'New',
    ),
    displayTitle: 'Transition from Product Manager to AI Product Manager',
    courseDescription:
      'A practical AI-native product course that uses systems thinking, real-life demos, and example stories to install a durable operating system for probabilistic software.',
    courseModules: [
      'End of PM: old line, new loop, and the full AI-native stack',
      'Model layer: capability, latency, cost, updates, and model judgment',
      'Context layer: owned context files, memory, prompts, RAG, and product/user knowledge',
      'Orchestration layer: agents, MCPs, tools, workflows, and the conductor posture',
      'Governance layer: evals, guardrails, observability, fallbacks, and audit trails',
      'Human layer: vision, empathy, taste, communication, judgment, and the professional posture when execution is cheap',
    ],
    courseTrailer: pmOsThesisUrl,
    courseLink: pmOsThesisUrl,
    media: [thoughtAssetSources.courses.aiProductManager],
    positioning:
      'The successor to the deterministic Product Innovation Process: old stage-gates become a loop because AI systems are probabilistic.',
    framework: {
      name: 'AI-Native Product OS',
      loop: ['Talk', 'Decide', 'Build', 'Observe', 'Iterate'],
      stack: ['Model', 'Context', 'Orchestration', 'Governance', 'Human'],
      durableClaim:
        'Models change fast, but the stack gives every future model, tool, or workflow a permanent shelf in your head.',
    },
    includedAssets: [
      'Installable AI-Native Product OS',
      'Eval templates and governance scaffolds',
      'Prompt library',
      'AI tools database',
      'Vibe coding guide',
      'PM database',
      'Accelerators and investors database',
      'Original Product Innovation Process course included as foundation',
    ],
    stats: [
      { label: 'Lessons', value: '6' },
      { label: 'Core loop', value: '5 verbs' },
      { label: 'Stack', value: '5 layers' },
    ],
    sourceLinks: [
      { label: 'AI PM course structure', href: pmOsThesisUrl, sourceStatus: 'local-primary' as SourceStatus },
      { label: 'GitHub OS assets', href: 'https://github.com/raminhoodeh?tab=repositories', sourceStatus: 'public-proof' as SourceStatus },
    ],
    tags: ['AI PM', 'Probabilistic systems', '5-layer stack', 'Product judgment'],
  },
  {
    ...createTeachingEntry('Full Product Development Process', 'The Fastest Path to Product Management', 'Highest-Rated'),
    courseDescription:
      'A start-to-finish product management walkthrough built around the Product Innovation Process: a shared source of truth for stakeholder alignment from idea to launch.',
    courseModules: [
      'Introduction to the Product Innovation Process',
      'Discovery: idea, problem, backstory, strategic alignment, competition, and feedback',
      'Product Design: problem/solution statement, personas, journeys, requirements, KPIs, architecture, and business requirements',
      'Alpha: internal proof of concept, team testing, success criteria, and early access feedback',
      'Beta: external MVP testing, iteration, rollout, development documentation, and go-live checklist',
      'Live: staging, North Star metric, continuous iteration, roadmap, release workflow, adoption, and handover',
    ],
    courseTrailer: 'https://www.udemy.com/course/the-fastest-way-to-become-a-product-manager/',
    courseLink: 'https://www.udemy.com/course/the-fastest-way-to-become-a-product-manager/',
    media: [thoughtAssetSources.courses.productInnovationThumbnail, thoughtAssetSources.courses.productInnovationMockup],
    positioning:
      'A deterministic-era product operating system for aligning cross-functional teams around one vision, one process, and one source of truth.',
    framework: {
      name: 'Product Innovation Process',
      loop: ['Discovery', 'Product Design', 'Alpha', 'Beta', 'Live'],
      stack: ['Vision', 'Mission', 'Strategy', 'Tactics', 'Products and services'],
      durableClaim:
        'Teams move faster when everyone can see the same product story, decision history, responsibilities, and next stage-gate.',
    },
    includedAssets: [
      'Product Innovation Process document',
      'Stage-gate checklists',
      'Strategic alignment prompts',
      'Product requirements templates',
      'Persona and user-story templates',
      'KPI and North Star metric guidance',
      'Roadmap and release workflow guidance',
    ],
    stats: [
      { label: 'Rating', value: '4.8' },
      { label: 'Students', value: '4,871' },
      { label: 'Reviews', value: '162' },
    ],
    sourceLinks: [
      {
        label: 'Udemy course',
        href: 'https://www.udemy.com/course/the-fastest-way-to-become-a-product-manager/',
        sourceStatus: 'public-proof' as SourceStatus,
      },
      {
        label: 'Process document',
        href: 'https://docs.google.com/document/d/1WA3bAjACbkhMYAi7xiZTq5UO29Tqxsb3/edit?usp=sharing&ouid=110264933146795409149&rtpof=true&sd=true',
        sourceStatus: 'public-proof' as SourceStatus,
      },
    ],
    tags: ['Product management', 'Source of truth', 'Process design', 'Team alignment'],
  },
] as const;

const thoughtBooks = [
  {
    bookName: 'The Proposition',
    bookType: 'Spiritual fiction',
    bookImage: thoughtsAssets.books.proposition.bookCover,
    bookVideo: undefined,
    purchaseLink: 'https://www.amazon.co.uk/Purpose-Ramin-Hoodeh/dp/1527286185',
    previewLink: 'https://author.vision/',
    summaryLink: undefined,
    fullText:
      'https://docs.google.com/document/d/1zibHuBmxwThGVPb82qCtJOY5wJFXyQTq/preview?usp=drive_link&ouid=110264933146795409149&rtpof=true&sd=true',
    bookDescription:
      'A spiritual fiction novel about Ali, an imprisoned poet whose conversations, visions, and refusal to betray his principles turn confinement into a journey toward inner freedom and purpose.',
    media: thoughtAssetSources.books.proposition,
    premise:
      'A poet imprisoned for his words is ordered to translate sacred texts, forms an unexpected bond with a young guard, and discovers that his immediate purpose may be to pass on wisdom rather than escape.',
    coreQuestion: 'Can ancient wisdom become clear enough to guide a modern person through confusion, grief, ego, and purpose?',
    readerUse:
      'Read it as a story, carry it as an oracle book, and use the Purpose Guide to turn metaphysical insight into a practical life plan.',
    includedGuide: 'Purpose Guide for turning the book\'s wisdom into a personal two-year plan.',
    shapedMe:
      'It shaped my belief that dense metaphysical enquiry becomes more usable when it is carried through story, symbolism, character, and humour.',
    tags: ['Spiritual fiction', 'Purpose', 'Ancient wisdom', 'Oracle book'],
    visualInventory: {
      cover: thoughtsAssets.books.proposition.bookCover,
      openedBook: thoughtsAssets.books.proposition.bookOpen,
      world: [
        thoughtsAssets.books.proposition.triptych,
        thoughtsAssets.books.proposition.adamMeetsGod,
        thoughtsAssets.books.proposition.gardenOfEden,
      ],
      characters: [
        thoughtsAssets.books.proposition.adamEveCharacter,
        thoughtsAssets.books.proposition.loverCharacter,
        thoughtsAssets.books.proposition.magicianCharacter,
        thoughtsAssets.books.proposition.warriorCharacter,
      ],
      supporting: [
        thoughtsAssets.books.proposition.serpent,
        thoughtsAssets.books.proposition.snakeFinal,
        thoughtsAssets.books.proposition.backCover,
      ],
    },
    sourceLinks: [
      { label: 'Amazon page', href: 'https://www.amazon.co.uk/Purpose-Ramin-Hoodeh/dp/1527286185', sourceStatus: 'public-proof' as SourceStatus },
      { label: 'Author site', href: 'https://author.vision/', sourceStatus: 'public-proof' as SourceStatus },
    ],
  },
  {
    bookName: 'The Meaning of Life',
    bookType: 'Metaphysical companion',
    bookImage: thoughtsAssets.books.meaningOfLife.bookCover,
    bookVideo: undefined,
    purchaseLink: 'https://author.vision/',
    previewLink: 'https://drive.google.com/drive/folders/1Vgbf3l5pmJeGYLzYOWP1mcn7aED9zOPD?usp=sharing',
    summaryLink: 'https://drive.google.com/file/d/10Rzdgz9dFOHOgjUiP-tKUoxCPuRCRsN7/view?usp=sharing',
    fullText: 'https://drive.google.com/drive/folders/1Vgbf3l5pmJeGYLzYOWP1mcn7aED9zOPD?usp=sharing',
    bookDescription:
      'A shorter metaphysical companion to The Proposition, told through Adam and Eve, that distills life\'s biggest questions into a clear frame of reality and a practical 3-Day Purpose Guide.',
    media: thoughtAssetSources.books.meaningOfLife,
    premise:
      'Adam searches through the overwhelming library of existence and finds that metaphysical clarity can be organized through five fundamental questions.',
    coreQuestion: 'Where did I come from, who am I, why do I exist, how should I be, and what should I do now?',
    readerUse:
      'Use it as a concise map for existential clarity, then work through the 3-Day Purpose Guide to connect meaning to present action.',
    includedGuide: '3-Day Purpose Guide for knowing yourself, going deep, letting go, and getting specific.',
    shapedMe:
      'It shaped the clearest version of my belief that meaning comes from organizing knowledge into a state of being, not collecting more information.',
    tags: ['Metaphysics', 'Adam and Eve', 'Purpose Guide', 'Audiobook'],
    visualInventory: {
      cover: thoughtsAssets.books.meaningOfLife.bookCover,
      world: [
        thoughtsAssets.books.meaningOfLife.bookWidescreen,
        thoughtsAssets.books.meaningOfLife.serpentWidescreen,
        thoughtsAssets.books.meaningOfLife.edenGardenPortrait,
      ],
      portrait: [
        thoughtsAssets.books.meaningOfLife.bookAnimatedPortrait,
        thoughtsAssets.books.meaningOfLife.snakePortrait,
      ],
      quote: thoughtsAssets.books.meaningOfLife.quotePage,
    },
    sourceLinks: [
      {
        label: 'Audiobook',
        href: 'https://drive.google.com/file/d/1NsfY8UMPmYrcyfvB9hlPyRhMjHyyCgGm/view?usp=sharing',
        sourceStatus: 'local-primary' as SourceStatus,
      },
      {
        label: 'Book folder',
        href: 'https://drive.google.com/drive/folders/1Vgbf3l5pmJeGYLzYOWP1mcn7aED9zOPD?usp=sharing',
        sourceStatus: 'local-primary' as SourceStatus,
      },
    ],
  },
] as const;

const workExperienceData = [
  {
    companyLogo: companyLogoPath.bayut,
    companyLogoAsset: {
      title: 'Bayut logo',
      pathOrUrl: companyLogoPath.bayut,
      altText: 'Bayut logo',
      type: 'logo',
      status: 'ready',
      sourceNotes: 'Provided in company-logos folder.',
    },
    companyName: 'Bayut',
    productVideo: companyVideoPath.bayut,
    productVideoAsset: {
      title: 'Bayut product video',
      pathOrUrl: companyVideoPath.bayut,
      altText: 'Bayut product video',
      type: 'video',
      status: 'ready',
      sourceNotes: 'Provided in company-videos folder.',
    },
    companyLink: 'https://www.bayut.com/',
    location: 'Dubai, UAE',
    monthYearRangeWorked: 'Jan 2026 - Present',
    jobTitle: 'AI Product Manager',
    companyDescription:
      'Bayut is a UAE real estate portal, part of Dubizzle Group, that connects buyers, renters, sellers, tenants, agents, and brokers across property search and listings.',
    industryTag: 'PropTech SaaS',
    industryTags: ['PropTech SaaS', 'eCommerce'],
    productsWorkedOn: ['Bayut web', 'Bayut App', 'Profolio app'],
    productDetails: [
      {
        name: 'Bayut web, Bayut App, Profolio app',
        description:
          'Bespoke property listing management platform for UAE real estate agents registered on Bayut, alongside AI-native property search features.',
      },
    ],
    mainAchievements: [
      '[Confidential] Built AI-native property search features with model selection, eval suite design, guardrails, and MCP integration - supporting property search, recommendations, and insights from conversational AI.',
    ],
    impact: [
      '[Confidential] Built AI-native property search features with model selection, eval suite design, guardrails, and MCP integration - supporting property search, recommendations, and insights from conversational AI.',
    ],
    processesIntroducedManagerial: [
      'Introduced the AI-Native Product OS to the wider product team, creating a shared context layer that helped PMs integrate more design and engineering into their work, move from idea to workable prototypes faster, synthesize user insights more effectively, and spot dependencies with greater speed and clarity.',
    ],
    businessModel: ['B2B', 'B2C'],
    marketType: 'B2B / B2C',
    customersClientTypes: ['Property seekers', 'Property owners', 'Real estate brokers'],
    customerClientTypesAndUserNumbers: 'Property seekers, property owners, and real estate brokers.',
    reviews: [reviewNeeded()],
    links: [{ label: 'Bayut', url: 'https://www.bayut.com/', status: 'ready' }],
  },
  {
    companyLogo: companyLogoPath.side,
    companyLogoAsset: {
      title: 'SIDE logo',
      pathOrUrl: companyLogoPath.side,
      altText: 'SIDE logo',
      type: 'logo',
      status: 'ready',
      sourceNotes: 'Provided in company-logos folder.',
    },
    companyName: 'SIDE',
    productVideo: companyVideoPath.side,
    productVideoAsset: {
      title: 'SIDE product video',
      pathOrUrl: companyVideoPath.side,
      altText: 'SIDE product video',
      type: 'video',
      status: 'ready',
      sourceNotes: 'Provided in company-videos folder.',
    },
    companyLink: 'https://www.side.inc/',
    location: 'London, UK',
    monthYearRangeWorked: 'Mar 2025 - Aug 2025',
    jobTitle: 'Senior Product Manager',
    companyDescription:
      'SIDE is a global video game services company that helps developers and publishers scale game development, art, audio, QA, localization, player support, datasets, testing, and IT services.',
    industryTag: 'Audio',
    industryTags: ['Audio', 'ERP'],
    productsWorkedOn: [
      'AI-engineered in-house ERP alternatives',
      'Windsurf integration',
      'Microsoft Enterprise Copilot with core ERP',
    ],
    productDetails: [
      {
        name: 'AI-engineered in-house ERP alternatives, Windsurf integration, Microsoft Enterprise Copilot with core ERP',
        description:
          'Replaced multiple internal ERP products with AI-coded in-house alternatives to reduce operational cost and improve speed from idea to feature. Integrated AI coding copilot workflows into engineering practice. Connected siloed Finance, Operations, and Sales data with Microsoft Enterprise Copilot and core ERP systems for leadership insight.',
      },
    ],
    mainAchievements: [
      'Reduced ERP operational costs by 20% over 4 months.',
      'Decreased idea-to-feature time by 90% for internal process improvement.',
      'Shifted engineering resources from 60% Maintenance / 40% Innovation to 40% Maintenance / 60% Innovation.',
      'Eliminated 30% of manual reporting overhead through Microsoft Enterprise Copilot and ERP integration.',
    ],
    impact: [
      'Reduced ERP operational costs by 20% over 4 months.',
      'Decreased idea-to-feature time by 90% for internal process improvement.',
      'Shifted engineering resources from 60% Maintenance / 40% Innovation to 40% Maintenance / 60% Innovation.',
      'Eliminated 30% of manual reporting overhead through Microsoft Enterprise Copilot and ERP integration.',
    ],
    processesIntroducedManagerial: [
      'Internal Forward Deployment Engineer: global point of contact for employees to explore and request new AI or automation tools across the organisation, responsible for corporate GPT rollout and integration.',
    ],
    businessModel: ['B2B'],
    marketType: 'B2B',
    customersClientTypes: ['Global SIDE.inc team across London, Paris and LA'],
    customerClientTypesAndUserNumbers: 'Global SIDE.inc team across London, Paris and LA.',
    reviews: [reviewNeeded()],
    links: [{ label: 'Side.inc', url: 'https://www.side.inc/', status: 'ready' }],
  },
  {
    companyLogo: companyLogoPath.perkbox,
    companyLogoAsset: {
      title: 'Perkbox logo',
      pathOrUrl: companyLogoPath.perkbox,
      altText: 'Perkbox logo',
      type: 'logo',
      status: 'ready',
      sourceNotes: 'Provided in company-logos folder.',
    },
    companyName: 'Perkbox Vivup',
    productVideo: companyVideoPath.perkbox,
    productVideoAsset: {
      title: 'Vivup App product video',
      pathOrUrl: companyVideoPath.perkbox,
      altText: 'Vivup App product video',
      type: 'video',
      status: 'ready',
      sourceNotes: 'Provided in company-videos folder.',
    },
    companyLink: 'https://www.perkbox.com/',
    location: 'London, UK',
    monthYearRangeWorked: 'Jan 2023 - Nov 2024',
    jobTitle: 'Senior Product Manager',
    companyDescription:
      'Perkbox and Vivup combined to form an employee wellbeing, benefits, rewards, and engagement platform for employers, HR teams, and their employees.',
    industryTag: 'Employee Benefits SaaS',
    industryTags: ['Employee Benefits SaaS'],
    productsWorkedOn: ['Highfive Recognition App', 'FamilyCare'],
    productDetails: [
      {
        name: 'Highfive Recognition App, FamilyCare',
        description:
          'The Vivup Highfive Recognition and Reward app enables continuous appreciation through a simple recognition experience aligned with company values. FamilyCare is the first platform in the UK that allows employees to use salary sacrifice to pay for childcare costs.',
      },
    ],
    mainAchievements: [
      'Improved the App gateway experience through qualitative user research and UX iteration.',
      'Increased Google Play Store rating by 0.6 and iPhone App Store rating by 1.2 within 3 months.',
      'Grew product customer lifetime value by 19% over 5 months.',
      'Decreased order form and checkout abandonment rate by 1/3 within the first month of delivery.',
    ],
    impact: [
      'Improved the App gateway experience through qualitative user research and UX iteration.',
      'Increased Google Play Store rating by 0.6 and iPhone App Store rating by 1.2 within 3 months.',
      'Grew product customer lifetime value by 19% over 5 months.',
      'Decreased order form and checkout abandonment rate by 1/3 within the first month of delivery.',
    ],
    processesIntroducedManagerial: [
      'Qualitative user research and stakeholder alignment around the Order Guidance Wizard and app UX improvements.',
    ],
    businessModel: ['B2B2C'],
    marketType: 'B2B2C',
    customersClientTypes: ['HR leaders', 'Ministry of Justice employees'],
    customerClientTypesAndUserNumbers: 'HR leaders and Ministry of Justice employees.',
    reviews: [reviewNeeded()],
    links: [{ label: 'Website', url: 'https://www.perkbox.com/', status: 'ready' }],
  },
  {
    companyLogo: companyLogoPath.groupm,
    companyLogoAsset: {
      title: 'WPP Media logo',
      pathOrUrl: companyLogoPath.groupm,
      altText: 'WPP Media logo',
      type: 'logo',
      status: 'needs-confirmation',
      sourceNotes: 'Only the GroupM logo asset is present; replace with WPP Media logo when supplied.',
    },
    companyName: 'WPP Media',
    previousCompanyName: 'GroupM',
    productVideo: companyVideoPath.groupm,
    productVideoAsset: {
      title: 'Carbon Calculator product video',
      pathOrUrl: companyVideoPath.groupm,
      altText: 'Carbon Calculator product video',
      type: 'video',
      status: 'ready',
      sourceNotes: 'Provided in company-videos folder.',
    },
    companyLink: 'https://www.wppmedia.com/',
    location: detailNeeded(),
    monthYearRangeWorked: 'Jan 2022 - Dec 2022',
    jobTitle: 'Product Manager',
    companyDescription:
      "WPP Media is WPP's global media collective, formerly GroupM, combining media agencies, data, technology, and partners to deliver growth for brands across more than 80 markets.",
    industryTag: 'Climate',
    industryTags: ['Climate', 'AdTech'],
    productsWorkedOn: ['Carbon Calculator', 'Product Innovation Process'],
    productDetails: [
      {
        name: 'Carbon Calculator',
        description:
          "The media sector's most widely used carbon calculation tool, comparing the CO2 emissions of over 7 physical and digital formats and providing recommendations on advertisement reach against environmental impact for global brands.",
      },
      {
        name: 'Product Innovation Process',
        description:
          "Process used to define and manage the product division of WPP Media's Global Innovation Group.",
      },
    ],
    mainAchievements: [
      "Translated EY's carbon emissions methodology with over 300+ dataset variables and 20+ climate APIs into product specifications for a world-first media carbon calculator.",
      'Carbon Calculator measured the environmental impact of GBP 1bn+ of media investment in 2022, remaining the most widely used calculator in the media sector.',
    ],
    impact: [
      "Translated EY's carbon emissions methodology with over 300+ dataset variables and 20+ climate APIs into product specifications for a world-first media carbon calculator.",
      'Carbon Calculator measured the environmental impact of GBP 1bn+ of media investment in 2022, remaining the most widely used calculator in the media sector.',
    ],
    processesIntroducedManagerial: [
      "Product Innovation Process: managed product strategy, mentored junior PMs and engineers, and defined the product division of WPP Media's Global Innovation Group.",
    ],
    businessModel: ['B2B'],
    marketType: 'B2B',
    customersClientTypes: ['Media investment teams', 'Sustainability stakeholders'],
    customerClientTypesAndUserNumbers: 'Media investment teams and sustainability stakeholders.',
    reviews: [reviewNeeded()],
    links: [
      { label: 'WPP Media', url: 'https://www.wppmedia.com/', status: 'ready' },
      {
        label: 'Carbon Calculator reference',
        url: 'https://www.mi-3.com.au/20-07-2022/carbon-footprint-different-media-distribution-options-will-increasingly-influence-where',
        status: 'ready',
      },
    ],
  },
  {
    companyLogo: companyLogoPath.coxAutomotive,
    companyLogoAsset: {
      title: 'Cox Automotive logo',
      pathOrUrl: companyLogoPath.coxAutomotive,
      altText: 'Cox Automotive logo',
      type: 'logo',
      status: 'ready',
      sourceNotes: 'Provided in company-logos folder.',
    },
    companyName: 'Cox Auto',
    fullCompanyName: 'Cox Automotive',
    productVideo: companyVideoPath.coxAutomotive,
    productVideoAsset: {
      title: 'Auction platform product video',
      pathOrUrl: companyVideoPath.coxAutomotive,
      altText: 'Auction platform product video',
      type: 'video',
      status: 'ready',
      sourceNotes: 'Provided in company-videos folder.',
    },
    companyLink: 'https://www.coxautoinc.com/',
    location: 'London, UK',
    monthYearRangeWorked: 'Sept 2021 - Dec 2021',
    jobTitle: 'Product Owner [Contract]',
    companyDescription:
      'Cox Automotive is a global automotive services and software company, part of Cox Enterprises, whose brands and technology support how vehicles are bought, sold, owned, and used.',
    industryTag: 'Automotive SaaS',
    industryTags: ['Automotive SaaS'],
    productsWorkedOn: ['Manheim Express'],
    productDetails: [
      {
        name: 'Manheim Express',
        description:
          'Manheim Express is a digital B2B auction platform designed for commercial used car trading with an industry-first auction monetization functionality for dealers.',
      },
    ],
    mainAchievements: [
      'Introduced a feature scoring framework that turned a large, ambiguous auction-platform backlog into a ranked delivery roadmap.',
      'Reduced stakeholder feedback cycles by 50% by creating clearer acceptance criteria, decision records, and prioritisation rituals.',
      'Improved roadmap confidence by tying backlog decisions to manufacturer needs, user evidence, commercial value, and delivery complexity.',
    ],
    impact: [
      'Introduced a feature scoring framework that turned a large, ambiguous auction-platform backlog into a ranked delivery roadmap.',
      'Reduced stakeholder feedback cycles by 50% by creating clearer acceptance criteria, decision records, and prioritisation rituals.',
      'Improved roadmap confidence by tying backlog decisions to manufacturer needs, user evidence, commercial value, and delivery complexity.',
    ],
    processesIntroducedManagerial: [
      'Product Decision Matrix: a qualitative and data-driven approach to prioritising a large feature backlog.',
    ],
    businessModel: ['B2B'],
    marketType: 'B2B',
    customersClientTypes: ['Automotive manufacturers', 'Automotive dealerships'],
    customerClientTypesAndUserNumbers: 'Automotive manufacturers and automotive dealerships.',
    reviews: [reviewNeeded()],
    links: [
      { label: 'Cox Automotive', url: 'https://www.coxautoinc.com/', status: 'ready' },
      {
        label: 'Product Decision Matrix',
        url: 'https://docs.google.com/spreadsheets/d/19unnxIX1GxI9PXj-Xsu7_q19W6Qy03Ae/edit?usp=sharing&ouid=110264933146795409149&rtpof=true&sd=true',
        status: 'ready',
      },
    ],
  },
  {
    companyLogo: companyLogoPath.ordnanceSurvey,
    companyLogoAsset: {
      title: 'Ordnance Survey logo',
      pathOrUrl: companyLogoPath.ordnanceSurvey,
      altText: 'Ordnance Survey logo',
      type: 'logo',
      status: 'ready',
      sourceNotes: 'Provided in company-logos folder.',
    },
    companyName: 'Ordnance Survey',
    productVideo: companyVideoPath.ordnanceSurvey,
    productVideoAsset: {
      title: 'Geospatial API product video',
      pathOrUrl: companyVideoPath.ordnanceSurvey,
      altText: 'Geospatial API product video',
      type: 'video',
      status: 'ready',
      sourceNotes: 'Provided in company-videos folder.',
    },
    companyLink: 'https://www.ordnancesurvey.co.uk/',
    location: detailNeeded(),
    monthYearRangeWorked: 'Dec 2020 - Sept 2021',
    jobTitle: 'Product Manager; Geospatial API',
    companyDescription:
      "Ordnance Survey is Britain's Geospatial Intelligence agency, maintaining trusted geographic data, maps, APIs, and location products used by government, business, and the public.",
    industryTag: 'Geospatial',
    industryTags: ['Geospatial', 'Climate'],
    productsWorkedOn: ['OS Maps API on Microsoft Power Platform', 'Sustainability applications of geospatial data'],
    productDetails: [
      {
        name: 'OS Maps API on Microsoft Power Platform, Sustainability applications of geospatial data',
        description:
          'The OS Places API provides a detailed view of an address and its life cycle. Created new product concepts using geospatial intelligence for positive impact across energy, infrastructure, defence, and space sector clients.',
      },
    ],
    mainAchievements: [
      "Defined and launched the first geospatial API product on Microsoft's Power Platform.",
      'Increased geospatial data utilisation by 30% across 2 key accounts by Q3 2021.',
      'Led twelve discovery workshops for client stakeholders, validating 3 product concepts approved for further investment.',
      "Improved energy clients' ability to forecast carbon impacts on asset valuations by 25% within 6 months.",
    ],
    impact: [
      "Defined and launched the first geospatial API product on Microsoft's Power Platform.",
      'Increased geospatial data utilisation by 30% across 2 key accounts by Q3 2021.',
      'Led twelve discovery workshops for client stakeholders, validating 3 product concepts approved for further investment.',
      "Improved energy clients' ability to forecast carbon impacts on asset valuations by 25% within 6 months.",
    ],
    processesIntroducedManagerial: [
      'Rapid Design Sprint: created and implemented cross-functional rapid design sprints that turned sustainability discovery into sector-specific geospatial propositions with a clear innovation roadmap for launch.',
    ],
    businessModel: ['Government'],
    marketType: 'Government',
    customersClientTypes: ['National energy clients', 'Infrastructure clients', 'Defence clients', 'Space sector clients'],
    customerClientTypesAndUserNumbers: 'National energy, infrastructure, defence, and space sector clients.',
    reviews: [reviewNeeded()],
    links: [
      { label: 'Ordnance Survey', url: 'https://www.ordnancesurvey.co.uk/', status: 'ready' },
      {
        label: 'OS Maps API',
        url: 'https://docs.microsoft.com/en-gb/connectors/ordnancesurveyplaces/',
        status: 'ready',
      },
    ],
  },
  {
    companyLogo: companyLogoPath.urgentem,
    companyLogoAsset: {
      title: 'Urgentem logo',
      pathOrUrl: companyLogoPath.urgentem,
      altText: 'Urgentem logo',
      type: 'logo',
      status: 'ready',
      sourceNotes: 'Provided in company-logos folder.',
    },
    companyName: 'Urgentem',
    productVideo: companyVideoPath.urgentem,
    productVideoAsset: {
      title: 'Element6 product video',
      pathOrUrl: companyVideoPath.urgentem,
      altText: 'Element6 product video',
      type: 'video',
      status: 'ready',
      sourceNotes: 'Provided in company-videos folder.',
    },
    companyLink: 'http://bit.ly/urgentemwebsite',
    location: 'London, UK',
    monthYearRangeWorked: 'Oct 2019 - Nov 2020',
    jobTitle: 'Product Manager',
    companyDescription:
      'Urgentem was a London climate data and analytics company, now acquired by ICE, providing emissions data and climate risk analytics for financial institutions and investors.',
    industryTag: 'Fintech',
    industryTags: ['Fintech', 'SaaS'],
    productsWorkedOn: ['Element6'],
    productDetails: [
      {
        name: 'Element6',
        description:
          'Climate risk platform for investors with portfolio and company-level scenario analysis, forward-looking metrics, and tools for holistic management of climate-related risks and opportunities.',
      },
    ],
    mainAchievements: [
      'Co-managed development and start-up launch of [now acquired] Element6, a climate risk platform for investors.',
      'Helped reduce climate-related risk by 20% across client portfolios totalling GBP 900m in AUM.',
      'Featured in the Financial Times.',
      'Improved Demo-to-Buy conversion rate by 30% over 4 months and reduced quarterly churn by 25%.',
      'Increased ratio of story point development to feature usage by 25% over 8 months.',
    ],
    impact: [
      'Co-managed development and start-up launch of [now acquired] Element6, a climate risk platform for investors.',
      'Helped reduce climate-related risk by 20% across client portfolios totalling GBP 900m in AUM.',
      'Featured in the Financial Times.',
      'Improved Demo-to-Buy conversion rate by 30% over 4 months and reduced quarterly churn by 25%.',
      'Increased ratio of story point development to feature usage by 25% over 8 months.',
    ],
    processesIntroducedManagerial: [
      'Sprint planning and SCRUM setup: introduced sprint planning to the early founding team to prioritize and implement agile and prioritization best practices.',
    ],
    businessModel: ['B2B'],
    marketType: 'B2B',
    customersClientTypes: ['European Central Bank', 'Ilmarinen', 'Folksam', 'Pension and investment organisations'],
    customerClientTypesAndUserNumbers:
      'Central bank, pension, and investment organisations including European Central Bank, Ilmarinen, Folksam, and client portfolios totalling GBP 900m in AUM.',
    reviews: [reviewNeeded()],
    links: [
      { label: 'Urgentem', url: 'http://bit.ly/urgentemwebsite', status: 'ready' },
      {
        label: 'Financial Times coverage',
        url: 'https://www.ft.com/content/7b734848-1287-4106-b866-7d07bc9d7eb8',
        status: 'ready',
      },
    ],
  },
  {
    companyLogo: companyLogoPath.deityAi,
    companyLogoAsset: {
      title: 'Deity AI logo',
      pathOrUrl: companyLogoPath.deityAi,
      altText: 'Deity AI logo',
      type: 'logo',
      status: 'ready',
      sourceNotes: 'Provided in company-logos folder.',
    },
    companyName: 'Deity AI',
    productVideo: companyVideoPath.deityAi,
    productVideoAsset: {
      title: 'Deity product video',
      pathOrUrl: companyVideoPath.deityAi,
      altText: 'Deity product video',
      type: 'video',
      status: 'ready',
      sourceNotes: 'Provided in company-videos folder.',
    },
    companyLink: 'http://www.deity.ai/',
    location: 'London, UK',
    monthYearRangeWorked: 'Jul 2017 - Oct 2019',
    jobTitle: 'Product Manager',
    companyDescription:
      'Deity AI was a London information-services startup building technology for social discovery, connecting people, places, and partner businesses through data-led digital and physical experiences.',
    industryTag: 'Social Networking',
    industryTags: ['Social Networking'],
    productsWorkedOn: ['Circles by Deity', 'Deity conversational chatbot mediator'],
    productDetails: [
      {
        name: 'Circles by Deity, Deity conversational chatbot mediator',
        description:
          'Product recommending people and places to work remotely from in partnership with local cafes and co-working spaces. Conversational mediator helped users skip small talk, reach more meaningful dialogue, and receive relevant place recommendations to meet and collaborate.',
      },
    ],
    mainAchievements: [
      'Increased footfall from partnering venues by 15% over a sustained period of 7 months.',
      'Improved chat retention rate by over 50% in first 3 months after Deity mediator release.',
    ],
    impact: [
      'Increased footfall from partnering venues by 15% over a sustained period of 7 months.',
      'Improved chat retention rate by over 50% in first 3 months after Deity mediator release.',
    ],
    processesIntroducedManagerial: [detailNeeded()],
    businessModel: ['B2B', 'B2C'],
    marketType: 'B2B / B2C',
    customersClientTypes: ['Hospitality SMEs', 'Digital nomads'],
    customerClientTypesAndUserNumbers: 'Hospitality SMEs and digital nomads.',
    reviews: [reviewNeeded()],
    links: [
      { label: 'Deity AI', url: 'http://www.deity.ai/', status: 'ready' },
      {
        label: 'Conversation mediator chatbot demo',
        url: 'https://drive.google.com/file/d/19Ln-UWxReuAFTFdDc4JBZHdDxzeBPmwt/view?usp=sharing',
        status: 'ready',
      },
    ],
  },
  {
    companyLogo: companyLogoPath.erm,
    companyLogoAsset: {
      title: 'ERM logo',
      pathOrUrl: companyLogoPath.erm,
      altText: 'ERM logo',
      type: 'logo',
      status: 'ready',
      sourceNotes: 'Provided in company-logos folder.',
    },
    companyName: 'ERM',
    productVideo: companyVideoPath.erm,
    productVideoAsset: {
      title: 'ERM research proof video',
      pathOrUrl: companyVideoPath.erm,
      altText: 'ERM research proof video',
      type: 'video',
      status: 'ready',
      sourceNotes: 'Provided in company-videos folder.',
    },
    companyLink: 'http://www.erm.com/',
    location: detailNeeded(),
    monthYearRangeWorked: 'Dec 2018 - Oct 2019',
    jobTitle: 'Product Stewardship Consultant',
    companyDescription:
      'ERM is a global sustainability consultancy helping organizations with environmental, health, safety, risk, social, climate, and sustainability work.',
    industryTag: 'Climate',
    industryTags: ['Climate'],
    productsWorkedOn: ['DISC European Commission research project'],
    productDetails: [
      {
        name: 'DISC European Commission research project',
        description:
          'Research identifying the social risks and benefits associated with the life cycle of new solar products, specifically double-side contacted cells with innovative carrier-selective contacts.',
      },
    ],
    mainAchievements: [
      'Co-authored European Commission-funded research on the social risks and benefits of new solar product lifecycles.',
      'Assessed socio-economic value and value-chain benefits created by new solar product innovation in Europe.',
      'Identified satellite-data use cases for environmental risk detection, including detecting copper mines at risk of leaking waste into waterways.',
      'Improved partner RepRisk product offering revenue by 10% over 6 months.',
    ],
    impact: [
      'Co-authored European Commission-funded research on the social risks and benefits of new solar product lifecycles.',
      'Assessed socio-economic value and value-chain benefits created by new solar product innovation in Europe.',
      'Identified satellite-data use cases for environmental risk detection, including detecting copper mines at risk of leaking waste into waterways.',
      'Improved partner RepRisk product offering revenue by 10% over 6 months.',
    ],
    processesIntroducedManagerial: [detailNeeded()],
    businessModel: ['B2B'],
    marketType: 'B2B',
    customersClientTypes: ['Institute for Solar Energy Research', 'European Commission'],
    customerClientTypesAndUserNumbers: 'Institute for Solar Energy Research and European Commission.',
    reviews: [reviewNeeded()],
    links: [
      { label: 'ERM', url: 'http://www.erm.com/', status: 'ready' },
      {
        label: 'European Commission research paper',
        url: 'https://ec.europa.eu/research/participants/documents/downloadPublic?documentIds=080166e5c80d5f80&appId=PPGMS',
        status: 'ready',
      },
    ],
  },
  {
    companyLogo: companyLogoPath.tesla,
    companyLogoAsset: {
      title: 'Tesla logo',
      pathOrUrl: companyLogoPath.tesla,
      altText: 'Tesla logo',
      type: 'logo',
      status: 'ready',
      sourceNotes: 'Provided in company-logos folder.',
    },
    companyName: 'Tesla',
    productVideo: companyVideoPath.tesla,
    productVideoAsset: {
      title: 'Tesla product video',
      pathOrUrl: companyVideoPath.tesla,
      altText: 'Tesla product video',
      type: 'video',
      status: 'ready',
      sourceNotes: 'Provided in company-videos folder.',
    },
    companyLink: 'http://www.tesla.com',
    location: 'London, UK & Amsterdam, Netherlands',
    monthYearRangeWorked: 'Apr 2017 - Sept 2018',
    jobTitle: 'Senior Product Specialist',
    companyDescription:
      'Tesla is an automotive and clean-energy company building electric vehicles, energy storage, solar, charging, and supporting software around the transition to sustainable energy.',
    industryTag: 'Energy',
    industryTags: ['Energy', 'Automotive'],
    productsWorkedOn: ['Tesla app 3.23 Power Flow', 'Tesla Model S', 'Tesla Powerwall', 'Tesla / SpaceX marketing campaign'],
    productDetails: [
      {
        name: 'Tesla app 3.23 Power Flow',
        description:
          'Tesla app update introducing Power Flow, allowing users to see whether home electricity is coming from the grid, solar installation, or Powerwall, and set preferences to optimise for energy independence, outage protection, or savings.',
      },
    ],
    mainAchievements: [
      "Worked around Tesla's energy product experience, including Power Flow visibility for grid, solar, and Powerwall energy usage.",
      'Ideated and initiated a Tesla / SpaceX marketing campaign through direct communication with the CEO, leading to more than double the attendance of Owners Orientation events in Q1-Q3 2018.',
      'Averaged 120% performance on Tesla Model S sales target from Q3 2017 to Q2 2018.',
      'Sold the first Tesla Powerwall to a residential customer in the UK.',
    ],
    impact: [
      "Worked around Tesla's energy product experience, including Power Flow visibility for grid, solar, and Powerwall energy usage.",
      'Ideated and initiated a Tesla / SpaceX marketing campaign through direct communication with the CEO, leading to more than double the attendance of Owners Orientation events in Q1-Q3 2018.',
      'Averaged 120% performance on Tesla Model S sales target from Q3 2017 to Q2 2018.',
      'Sold the first Tesla Powerwall to a residential customer in the UK.',
    ],
    processesIntroducedManagerial: [detailNeeded()],
    businessModel: ['B2C', 'B2B'],
    marketType: 'B2C / B2B',
    customersClientTypes: ['Commercial property owners', 'Residential property owners', 'Drivers'],
    customerClientTypesAndUserNumbers: 'Commercial and residential property owners and drivers.',
    reviews: [reviewNeeded()],
    links: [{ label: 'Tesla reference link', url: 'http://www.tesla.com', status: 'ready' }],
  },
] as const;

const degreeData = [
  {
    institutionLogo: qualificationLogoPath.imperial,
    institutionLogoAsset: {
      title: 'Imperial College London logo',
      pathOrUrl: qualificationLogoPath.imperial,
      altText: 'Imperial College London logo',
      type: 'logo',
      status: 'ready',
      sourceNotes: 'Local logo asset from work-section/work-section-logos.',
    },
    institutionName: 'Imperial College London',
    qualification: 'MSc Environmental Technology',
    qualificationType: 'MSc',
    qualificationLink: linkNeeded(),
    gradeAchieved: 'Distinction',
    dateAchieved: '2017',
    modulesOrFocusAreas: ['Environmental technology', 'Sustainability', 'ESG'],
    howThisHasHelpedYouAsAPM:
      'Trained me to think like a systems-led Product Manager: understanding the real-world problem first, then applying the right technology in a way that is practical, measurable, and environmentally meaningful.',
  },
  {
    institutionLogo: logoNeeded(),
    institutionLogoAsset: {
      title: 'University of Northampton logo',
      pathOrUrl: logoNeeded(),
      altText: 'University of Northampton logo',
      type: 'logo',
      status: 'needed',
      sourceNotes: 'Institution logo or approved text-only mark needed.',
    },
    institutionName: 'University of Northampton',
    qualification: 'BA Business and Marketing',
    qualificationType: 'BA',
    qualificationLink: linkNeeded(),
    gradeAchieved: '1st Class Honours',
    dateAchieved: '2016',
    modulesOrFocusAreas: ['Business', 'Marketing'],
    howThisHasHelpedYouAsAPM:
      'Built commercial, customer, positioning, and go-to-market strategy theory. With a thesis on consumer behaviour, my research focused on why people buy products and how positioning, motivation, and value perception shape adoption.',
  },
] as const;

const certificationData = [
  {
    awardingBodyLogo: qualificationLogoPath.ibm,
    awardingBodyLogoAsset: {
      title: 'IBM logo',
      pathOrUrl: qualificationLogoPath.ibm,
      altText: 'IBM logo',
      type: 'logo',
      status: 'ready',
      sourceNotes: 'Local logo asset from work-section/work-section-logos.',
    },
    awardingBodyName: 'IBM',
    certificationName: 'AI Engineer Certification',
    certificationLink: linkNeeded(),
    modulesIncluded: [
      'Classical machine learning with Python',
      'Deep learning with Keras, TensorFlow, and PyTorch',
      'Neural networks',
      'Transformer architectures and LLM data preparation',
      'Generative AI fine-tuning',
      'RAG, LangChain, and AI agents',
      'Generative AI application development',
    ],
    dateAchieved: '2026',
    howThisHasHelpedYouAsAPM:
      'Helped me turn AI ideas into real product architecture. On nsso, it shaped the chatbot/profile coach concept: treating profile data, RAG, retrieval, and reviewed profile mutations as product infrastructure rather than just chatbot copy. In Dreamsea, the same thinking helped me design dream interpretation as a model pipeline - capture, transcription, interpretation, symbol extraction, and image generation - where model behaviour and context quality shape the user experience. For Mass Social Wisdom Agent, it informed the multi-step agent orchestration, RAG/LangChain-style workflow, and generated document output as a reliable system.',
  },
  {
    awardingBodyLogo: qualificationLogoPath.google,
    awardingBodyLogoAsset: {
      title: 'Google AI School logo',
      pathOrUrl: qualificationLogoPath.google,
      altText: 'Google AI School logo',
      type: 'logo',
      status: 'ready',
      sourceNotes: 'Local logo asset from work-section/work-section-logos.',
    },
    awardingBodyName: 'Google AI School',
    certificationName: 'Professional Machine Learning Engineer',
    certificationLink: linkNeeded(),
    modulesIncluded: [
      'Google Cloud AI and machine learning foundations',
      'Data preparation and feature engineering',
      'BigQuery ML and Vertex AI notebooks',
      'TensorFlow and Keras model development',
      'Production ML systems',
      'MLOps, model evaluation, and monitoring',
      'Generative AI applications',
      'Responsible AI, fairness, bias, interpretability, privacy, and safety',
    ],
    dateAchieved: '2026',
    howThisHasHelpedYouAsAPM:
      'Helped me bring production ML discipline into my current AI Product Manager role. It informs how I approach model evaluation, automation, and quality checks for AI property search, recommendations, and conversational AI: not just whether the feature works in a demo, but whether the data is ready, outputs can be evaluated, latency is acceptable, failures are observable, and the model is improving the business/user outcome. It also supports my product judgement around AI Costs Dashboard and RAG Pipeline work, where monitoring, attribution, and evaluation matter as much as generation quality.',
  },
  {
    awardingBodyLogo: qualificationLogoPath.google,
    awardingBodyLogoAsset: {
      title: 'Google AI School logo',
      pathOrUrl: qualificationLogoPath.google,
      altText: 'Google AI School logo',
      type: 'logo',
      status: 'ready',
      sourceNotes: 'Local logo asset from work-section/work-section-logos. Modules need confirmation from certificate transcript.',
    },
    awardingBodyName: 'Google AI School',
    certificationName: 'Generative AI Leader',
    certificationLink: linkNeeded(),
    modulesIncluded: [
      'Generative AI strategy',
      'AI product opportunity framing',
      'Organisational AI adoption',
      'Responsible AI leadership',
      'Value, risk, and governance tradeoffs',
      'Human-in-the-loop AI workflows',
    ],
    dateAchieved: '2026',
    howThisHasHelpedYouAsAPM:
      'Helped me decide how generative AI should behave inside a product, not just where to add it. In 24Seven Concierge, that meant designing an experience where AI can generate itineraries and recommendations, while the human concierge remains part of the fulfilment and trust layer. In Dreamsea, it translated into guardrails for dream interpretation generation: the output needs to feel reflective, safe, and tonally careful rather than acting like an unconstrained oracle. In my current AI PM work, it helps me frame where AI should automate, where humans should review, and how to lead teams through that tradeoff.',
  },
  {
    awardingBodyLogo: qualificationLogoPath.anthropic,
    awardingBodyLogoAsset: {
      title: 'Anthropic logo',
      pathOrUrl: qualificationLogoPath.anthropic,
      altText: 'Anthropic logo',
      type: 'logo',
      status: 'ready',
      sourceNotes: 'Local logo asset from work-section/work-section-logos.',
    },
    awardingBodyName: 'Anthropic Academy',
    certificationName: 'MCP Advanced Topics',
    certificationLink: linkNeeded(),
    modulesIncluded: [
      'Core MCP features',
      'Sampling',
      'Log and progress notifications',
      'Roots',
      'JSON message types',
      'STDIO transport',
      'StreamableHTTP transport',
      'Stateful MCP communication',
      'MCP client-server architecture',
    ],
    dateAchieved: '2026',
    howThisHasHelpedYouAsAPM:
      'Helped me understand how to design AI products that connect to tools, not just chat interfaces. Practically, that applies to MCP-connected workflows such as connecting an AI assistant into Figma for nsso design work, allowing product or operational data to be queried in plain English, and designing controlled tool access where an AI agent can propose or retrieve information without being allowed to act unsafely. It also maps onto the nsso chatbot profile mutation flow, where the AI can suggest profile changes, but review, permissions, and user confirmation must sit around the tool call.',
  },
  {
    awardingBodyLogo: qualificationLogoPath.mbti,
    awardingBodyLogoAsset: {
      title: 'MBTi logo',
      pathOrUrl: qualificationLogoPath.mbti,
      altText: 'MBTi logo',
      type: 'logo',
      status: 'ready',
      sourceNotes: 'Local logo asset from work-section/work-section-logos. Modules need confirmation from programme materials.',
    },
    awardingBodyName: 'MBTi',
    certificationName: 'MBTi Leadership Development Programme',
    certificationLink: linkNeeded(),
    modulesIncluded: [
      'Leadership self-awareness',
      'Communication styles',
      'Team motivation',
      'Stakeholder alignment',
      'Empathy and conflict awareness',
      'Decision-making in groups',
    ],
    dateAchieved: '2024',
    howThisHasHelpedYouAsAPM:
      "Helped me become more deliberate about the human operating system around product work. At Side.inc, it supported the alignment work around AI/automation tools such as Windsurf and Microsoft Enterprise Copilot. At Perkbox Vivup, it was relevant when aligning stakeholders around fundamental changes to our web app and app's user journey. It supports the part of product management that is not just deciding what to build, but bringing people with different motivations, communication styles, and risk appetites into shared commitment.",
  },
] as const;

const selfwareProjects = [
  createProjectEntry('nsso', 'nsso', 'Web App', 'case-study'),
  createProjectEntry('Qadam', 'Qadam', 'Agent', 'case-study'),
  createProjectEntry('Dreamsea', 'Dreamsea', 'iOS App', 'case-study'),
  createProjectEntry('24Seven Concierge', '24Seven Concierge', 'App', 'case-study'),
  createProjectEntry('RazinFlix', 'RazinFlix', 'Web App', 'case-study'),
] as const;

const toolProjects = [
  createProjectEntry('AI-Native Product Manager OS', 'AI-Native Product Manager OS', 'Tool', 'case-study'),
  createProjectEntry('Mass Social Wisdom Agent', 'Mass Social Wisdom Agent', 'Agent', 'case-study'),
  createProjectEntry('AI Costs Dashboard', 'AI Costs Dashboard', 'Tool', 'case-study'),
  createProjectEntry('RAG Pipeline', 'RAG Pipeline', 'Tool', 'case-study'),
] as const;

const aiNativeProductOsSource = deepDives.find((item) => item.slug === 'ai-native-product-os');
const aiNativeProductOsToolSource = findTool('AI-Native Product OS');
const frameworkOfMetacognitionSource = findTeachingWriting('Framework of Metacognition');
const productManagementCourseSource = findTeachingWriting('The Fastest Path to Product Management');
const aiProductManagementCourseSource = findTeachingWriting('Transition from Product Manager to AI Product Manager');

const thoughtFoundationalThinking = {
  eyebrow: '01 / How I approach life',
  title: 'How I approach life',
  stageQuestion: 'How can I feel clear, overcome over-information, and stay focused in a noisy world?',
  intro:
    'The first move is orientation: reduce over-information, understand where I am, understand what I can become, then choose from values rather than noise.',
  metaphysicsBridge: {
    eyebrow: 'Metaphysics and product judgment',
    title: 'Clarity starts by knowing where you are.',
    quote: thoughtQuoteLines.orientation,
    body:
      'The same logic appears in life and product work. A decision is only good if it moves toward the goal it set out to achieve. To choose that goal, you first need knowledge of yourself, your capabilities, and your place in the world.',
    points: [
      {
        label: 'Where am I?',
        body:
          'Good judgment starts with an honest map of the current reality: situation, constraints, context, and place.',
      },
      {
        label: 'What can I become?',
        body:
          'Fulfilment depends on setting a vision that reflects the maximum possible achievement of present and future capabilities.',
      },
      {
        label: 'What should I do?',
        body:
          'Metaphysics turns orientation into action by asking who we are, why we are here, how we should act, and what must be done now.',
      },
    ],
  },
  clarityMotif: {
    eyebrow: 'Noise is the obstacle',
    title: 'Metaphysical wisdom becomes useful when it helps you hear yourself again.',
    quote: thoughtQuoteLines.noisyWorld,
    source: 'The Proposition / Framework of Reality',
    body:
      'Noise is not just distraction. It is the condition that makes people lose contact with conscience, values, and judgment. I care about metaphysical wisdom because it restores enough silence and structure for a person to hear what is true again.',
    bridge:
      'That same move appears in product work: reduce the noise, understand the real context, define the right outcome, and build the system that helps people act clearly.',
    principles: [
      {
        label: 'Over-information',
        body: 'Too much input creates paralysis, imitation, and borrowed desire.',
      },
      {
        label: 'Conscience',
        body: 'Silence and restraint make values audible again, so action can come from inner conviction.',
      },
      {
        label: 'Direction',
        body: 'Once values are clear, vision, strategy, and practical action can be chosen with less borrowed noise.',
      },
    ],
  },
  valuesConclusion: {
    eyebrow: 'The conclusion',
    title: 'Clarity ends in values: your why.',
    body:
      'Framework of Metacognition orders thought from experience into values, vision, strategy, and tactics. Framework of Reality applies that same movement to life itself: meaning becomes values, values become purpose, purpose becomes principles, and principles return you to the present moment.',
    ladder: [
      {
        label: 'Experience',
        body: 'Notice what life, work, and memory are actually showing you.',
      },
      {
        label: 'Values',
        body: 'Extract what those experiences reveal about what matters.',
      },
      {
        label: 'Why',
        body: 'Turn values into a direction worth serving.',
      },
      {
        label: 'Action',
        body: 'Make decisions and systems that protect that direction.',
      },
    ],
  },
  stratetree: {
    eyebrow: 'Metacognitive Stratetree',
    title: 'Values need a route into products.',
    body:
      'Stratetree is the company and product expression of my metacognitive framework. I use it to move from experience into values, vision, mission, strategy, tactics, and finally the products and services that make the philosophy real.',
    bridge:
      'Framework of Reality helps me understand what matters. Stratetree turns that understanding into direction a team, product, or company can actually use.',
    levels: [
      {
        index: '01',
        label: 'Backstory',
        metaphor: 'The soil',
        body: 'The experiences and stories that explain why the work exists in the first place.',
      },
      {
        index: '02',
        label: 'Values',
        metaphor: 'The roots',
        body: 'The principles extracted from that story: what matters enough to protect.',
      },
      {
        index: '03',
        label: 'Vision',
        metaphor: 'The trunk',
        body: 'The clear identity of what the work could become if it lived by those values.',
      },
      {
        index: '04',
        label: 'Mission',
        metaphor: 'The thickest branch',
        body: 'The goals I set in order to make the vision real.',
      },
      {
        index: '05',
        label: 'Strategy',
        metaphor: 'The second branch',
        body: 'The decision-making approach that serves the mission.',
      },
      {
        index: '06',
        label: 'Tactics',
        metaphor: 'The third branch',
        body: 'The daily operations and practical moves that keep decisions aligned.',
      },
      {
        index: '07',
        label: 'Products & Services',
        metaphor: 'The fruits and flowers',
        body: 'The visible creations that deliver meaningful value from the whole philosophy.',
      },
    ],
  },
  foundations: [
    {
      id: 'metacognition',
      index: '01',
      title: 'Framework of Metacognition',
      role: 'How I structure thought',
      sourceLabel: frameworkOfMetacognitionSource?.title ?? 'Framework of Metacognition',
      thesis:
        frameworkOfMetacognitionSource?.whyItMatters ??
        'Messy experience becomes values, vision, strategy, and tactics when it is placed in the right order.',
      body:
        'This is the intellectual skeleton underneath how I think. Stories, pitches, product decisions, and spiritual ideas all become clearer when I can trace the same movement: what happened, what it says about who we are, why it matters, how we should act, and what we should do now.',
      sequence: [
        { label: 'Experience / Story', detail: 'The raw material: lived events, observations, questions, evidence, and stories.' },
        { label: 'Values / Who', detail: 'The meaning extracted from experience becomes what a person or system stands for.' },
        { label: 'Vision / Why', detail: 'Values become a direction, purpose, or outcome worth moving toward.' },
        { label: 'Strategy / How', detail: 'The path for acting in alignment with the vision.' },
        { label: 'Tactics / What', detail: 'The concrete actions that make the strategy real.' },
      ],
      application:
        'This is why I do not see my work as isolated output. Each creation records how experience became judgment.',
    },
    {
      id: 'reality',
      index: '02',
      title: 'Framework of Reality',
      role: 'How metaphysics becomes clarity',
      sourceLabel: 'Framework of Reality',
      thesis:
        'A metacognitive approach to metaphysics: organize existential knowledge into one practical frame for meaning, values, purpose, principles, and presence.',
      body:
        'Framework of Reality applies the same strategic structure to life itself. It takes scattered religious, philosophical, and spiritual information and turns it into a clear map for knowing who you are, why you exist, how to act, and what to do in the present moment.',
      sequence: [
        { label: 'Meaning', detail: 'Look back at the experiences where life felt meaningful, connected, or growth-producing.' },
        { label: 'Values', detail: 'Extract the values implied by those meaningful experiences.' },
        { label: 'Purpose', detail: 'Turn values into a direction for growth, connection, love, learning, and creation.' },
        { label: 'Principles', detail: 'Use those values to make decisions with clearer conscience and intent.' },
        { label: 'Presence', detail: 'Return to the present as the practical tactic for hearing yourself and acting clearly.' },
      ],
      application:
        'This is the bridge from spiritual inquiry to product judgment: both are attempts to create a clear operating frame when the surrounding world is noisy.',
    },
    {
      id: 'ai-native-product-os',
      index: '03',
      title: 'AI-Native Product OS',
      role: 'How clarity becomes architecture',
      sourceLabel: aiNativeProductOsSource?.title ?? 'AI-Native Product OS',
      thesis:
        aiNativeProductOsSource?.dek ??
        'The product operating system changes when the material changes from deterministic software to probabilistic AI.',
      body:
        'The AI-Native Product OS turns the same clarity instinct into architecture. The old linear product process worked for deterministic software. Probabilistic systems require a loop, a context layer, governance, orchestration, and stronger human judgment.',
      sequence: [
        { label: 'Talk', detail: 'Human plus context: ask, frame, and load what the model needs to see.' },
        { label: 'Decide', detail: 'Human plus governance: make judgment calls against explicit standards.' },
        { label: 'Build', detail: 'Model plus orchestration: generate, wire tools, and make the workflow physically possible.' },
        { label: 'Observe', detail: 'Governance: measure outputs, failures, traces, safety, and cost.' },
        { label: 'Iterate', detail: 'All five layers feeding what was learned back into the next loop.' },
      ],
      stack: ['Model', 'Context', 'Orchestration', 'Governance', 'Human'],
      application:
        'This becomes the architecture lens behind the AI products and case studies: not "add AI," but design the operating system that lets AI become useful, measured, and human-directed.',
    },
  ],
} as const;

const thoughtArchitectureBridge = {
  eyebrow: '03 / What it builds',
  title: 'Where systems become product architecture',
  body:
    'This is where the internal method becomes visible: a form of noise appears, a thinking frame clarifies what matters, and the clarity becomes an architecture decision.',
  thesis:
    'The same pattern repeats across the work: clarify the human situation, choose the right operating frame, then build the system that makes better judgment easier.',
  flow: [
    {
      label: 'Noise',
      body: 'A person, team, or market is overloaded by information, unclear identity, weak context, or unstructured intent.',
    },
    {
      label: 'Frame',
      body: 'Metacognition, Framework of Reality, or AI-Native Product OS gives the ambiguity a usable order.',
    },
    {
      label: 'Decision',
      body: 'The frame determines the product judgment: what to capture, what context to load, what to automate, and what a human must still own.',
    },
    {
      label: 'System',
      body: 'The final product becomes a decision surface: a place where thought turns into action.',
    },
  ],
  applications: [
    {
      projectName: 'Dreamsea',
      type: 'Dream interpretation app',
      ambiguity: 'Vivid dreams are meaningful but fragile; they disappear before they can become reflection.',
      foundation: 'Framework of Reality',
      lens:
        'Dreams are treated as symbolic experience: capture the story, preserve the feeling, then interpret it through coherent metaphysical traditions.',
      architecture:
        'Voice capture becomes transcript, transcript becomes philosophy-specific context, and context drives interpretation, symbol extraction, and visual generation.',
      outcome: 'A private reflection system for turning inner material into self-knowledge.',
    },
    {
      projectName: 'nsso',
      type: 'Identity and personal homepage',
      ambiguity: 'Modern professional identity is fragmented across CVs, social links, work, projects, offers, and personal story.',
      foundation: 'Framework of Metacognition',
      lens:
        'Identity becomes clearer when experience, values, work, story, and offerings are organized into one coherent profile.',
      architecture:
        'The product gathers scattered professional signals into a unified homepage, with AI assistance around profile clarity and controlled profile mutation.',
      outcome: 'A public identity surface that helps someone understand and present where they fit in the professional world.',
    },
    {
      projectName: '24Seven Concierge',
      type: 'Luxury AI concierge',
      ambiguity: 'Luxury travel intent is often sparse, multi-step, and spread across products that do not naturally reason together.',
      foundation: 'AI-Native Product OS',
      lens:
        'The work is to load enough catalog and conversational context for AI to reason, while keeping human concierge judgment in the fulfilment layer.',
      architecture:
        'Shopify inventory becomes compressed context for Gemini planning, then the resulting itinerary becomes a WhatsApp-ready human handoff.',
      outcome: 'A concierge flow where AI clarifies intent and humans preserve trust at the point of transaction.',
    },
    {
      projectName: 'Mass Social Wisdom Agent',
      type: 'Social knowledge agent',
      ambiguity: 'Social feeds produce too much unstructured wisdom, insight, and noise to preserve manually.',
      foundation: 'Framework of Metacognition',
      lens:
        'Useful social knowledge needs a hierarchy: inspect the material, identify the kind of insight, compose it cleanly, then sort it into a usable memory system.',
      architecture:
        'The agent inspects, routes, composes, self-assesses, categorizes, sorts, and exports social knowledge into structured destinations.',
      outcome: 'A system for turning over-information into an organized knowledge base.',
    },
    {
      projectName: 'AI Costs Dashboard',
      type: 'AI governance dashboard',
      ambiguity:
        'AI features become hard to steer when model usage, cost, latency, and failure patterns are invisible to product judgment.',
      foundation: 'AI-Native Product OS',
      lens:
        'Governance is part of the product architecture, not a report added after launch. Cost, quality, and value need to be comparable before scaling.',
      architecture:
        'Provider, model, feature, endpoint, environment, latency, and failure events become a review surface for cost caps, anomaly alerts, and tuning decisions.',
      outcome: 'A governance layer for making AI product spend visible enough to manage responsibly.',
    },
    {
      projectName: 'RAG Pipeline',
      type: 'Reusable context infrastructure',
      ambiguity:
        'AI products lose coherence when every answer depends on one-off prompting instead of durable, curated, retrievable context.',
      foundation: 'AI-Native Product OS',
      lens:
        'Context is architecture. The product must decide what knowledge is trusted, how it is retrieved, how it is ranked, and when it should be ignored.',
      architecture:
        'Ingestion, chunking, embeddings, retrieval, re-ranking, verification, context injection, and logging become a reusable pattern across products.',
      outcome: 'A context layer that lets AI systems reason from grounded material instead of generic memory.',
    },
    {
      projectName: 'Qadam',
      type: 'Physical-world market intelligence',
      ambiguity: 'Markets react to consensus narratives, but the physical world often moves before the narrative catches up.',
      foundation: 'AI-Native Product OS',
      lens:
        'Know where you are before deciding what to do: ingest the world state, triage signal quality, then make strategy legible before action.',
      architecture:
        'Physical, social, macro, logistics, and market feeds become a unified catalyst intelligence system with paper-trading governance.',
      outcome: 'A decision engine for turning external-world signals into market judgment.',
    },
    {
      projectName: 'RazinFlix',
      type: 'Film discovery system',
      ambiguity: 'Taste is personal but often hidden inside weak recommendation interfaces and generic plot descriptions.',
      foundation: 'Framework of Metacognition',
      lens:
        'Taste becomes useful when preferences, emotional resonance, and story signals are made legible enough to guide discovery.',
      architecture:
        'TMDB data, Gemini enrichment, YouTube trailers, and saved user context create a richer discovery surface around film preference.',
      outcome: 'A media experience that makes personal taste easier to understand and act on.',
    },
  ],
} as const;

export const portfolioContent = {
  hero: {
    name: 'Ramin Hoodeh',
    role: 'Product Teacher and Fiction Author',
    headline: 'I use AI to research, design, and build beautiful things that the world really needs. I\'ve shipped 6 live AI products and a framework for building them.',
    profilePicture: {
      src: profilePictureUrl,
      alt: 'Ramin Hoodeh profile picture',
    },
    pmOsThesisCta: {
      label: 'My Product Thesis',
      href: pmOsThesisUrl,
    },
  },
  productManagementWorkExperiences: {
    intro:
      '8+ years of proven experience in complex product environments across fintech, climate, geospatial and e-commerce sectors at start-ups, SMEs, governments and corporates.',
    companies: workExperienceData,
  },
  personalProjects: {
    selfware: selfwareProjects,
    tools: toolProjects,
    architectureAcrossTools: {
      title: 'Each project uses its own implementation stack while sharing the same AI product pattern.',
      expandable: true,
      layers: [
        {
          layer: 'Model',
          purpose: architectureLayers.find((item) => item.label === 'Model')?.purpose ?? detailNeeded(),
          examples: architectureLayers.find((item) => item.label === 'Model')?.examples ?? detailNeeded(),
        },
        {
          layer: 'Context',
          purpose: architectureLayers.find((item) => item.label === 'Context')?.purpose ?? detailNeeded(),
          examples: architectureLayers.find((item) => item.label === 'Context')?.examples ?? detailNeeded(),
        },
        {
          layer: 'Orchestration',
          purpose: architectureLayers.find((item) => item.label === 'Orchestration')?.purpose ?? detailNeeded(),
          examples: architectureLayers.find((item) => item.label === 'Orchestration')?.examples ?? detailNeeded(),
        },
        {
          layer: 'Governance',
          purpose: architectureLayers.find((item) => item.label === 'Governance')?.purpose ?? detailNeeded(),
          examples: architectureLayers.find((item) => item.label === 'Governance')?.examples ?? detailNeeded(),
        },
        {
          layer: 'Human',
          purpose: architectureLayers.find((item) => item.label === 'Human')?.purpose ?? detailNeeded(),
          examples: architectureLayers.find((item) => item.label === 'Human')?.examples ?? detailNeeded(),
        },
      ],
    },
  },
  qualifications: {
    qualifications: degreeData,
    certifications: certificationData,
  },
  teachingSpeakingWriting: {
    frame: thoughtPageFrame,
    foundations: thoughtFoundationalThinking,
    architectureBridge: thoughtArchitectureBridge,
    teaching: thoughtCourses,
    speaking: thoughtTalks,
    writing: {
      books: thoughtBooks,
      articles: [
        {
          articleTitle: 'Framework of Metacognition',
          articleContent: frameworkOfMetacognitionSource?.subtitle ?? detailNeeded(),
          articleSubHeadings: ['Experience', 'Who', 'Why', 'How', 'What'],
          articleDiagram: detailNeeded(),
          horizontalStages: ['Experience', 'Who', 'Why', 'How', 'What'],
        },
        {
          articleTitle: 'Framework of Reality',
          articleContent: detailNeeded(),
          articleSubHeadings: [detailNeeded()],
          articleDiagram: detailNeeded(),
        },
      ],
      aiNativeProductOs: {
        problem: aiNativeProductOsSource?.sections.find((section) => section.heading.startsWith('Context'))?.body[0] ?? detailNeeded(),
        architecture:
          aiNativeProductOsSource?.sections.find((section) => section.heading.startsWith('Architecture'))?.body[0] ??
          aiNativeProductOsToolSource?.description ??
          detailNeeded(),
        whyThisApproach:
          aiNativeProductOsSource?.sections.find((section) => section.heading.startsWith('Why This Approach'))?.body[0] ??
          detailNeeded(),
        tradeoffs:
          aiNativeProductOsSource?.sections.find((section) => section.heading.startsWith('Tradeoffs'))?.body[0] ??
          detailNeeded(),
        whatIWouldImprove:
          aiNativeProductOsSource?.sections.find((section) => section.heading.startsWith('What I Would Improve'))?.body[0] ??
          detailNeeded(),
        liveLink: productManagementCourseSource?.href ?? aiProductManagementCourseSource?.href ?? linkNeeded(),
        githubLink: linkNeeded(),
        fullWriteupLink:
          aiNativeProductOsSource?.sourceLinks.find((link) => link.label === 'AI-Native Product OS')?.href ??
          linkNeeded(),
        workflowDiagram: ['Talk', 'Decide', 'Build', 'Observe', 'Iterate'],
        layerLensesOverview: ['Model', 'Context', 'Orchestration', 'Governance', 'Human'],
      },
      caseStudies: [...selfwareProjects, ...toolProjects].map((project) => ({
        projectName: project.projectName,
        problem: project.problem,
        architecture: project.architecture,
        whyThisApproach: project.whyThisApproach,
        tradeoffs: project.tradeoffs,
        whatIWouldImprove: project.whatIWouldImprove,
        liveLink: project.liveLink,
        githubLink: project.githubLink,
        fullWriteupLink: project.fullWriteupLink,
      })),
    },
  },
  contactCta: {
    artisticHeroText: 'CLARITY . JUDGEMENT . TASTE . EMPATHY . VISION',
    hook: 'Do you have a role in mind?',
    headline: "Let's create beautiful things that the world really needs",
    ctaButtons: [
      {
        label: 'raminhoodeh@gmail.com',
        href: 'raminhoodeh@gmail.com',
      },
      {
        label: 'WhatsApp',
        href: 'https://wa.link/7g31wi',
      },
    ],
  },
  bonus: {
    hook: 'Congratulations, you\'ve reached the bonus section',
    body: 'As a reward for making it this far, click the magical rock 3 times to reveal 4 incredible gifts…',
    trigger: {
      element: '3D webGL exploding rock element from the original Ventures website scrape',
      interaction: 'Three clicks to explode and reveal gifts',
    },
    gifts: [
      {
        title: '100% coupon code for new AI PM Course',
        detail: 'Use the code FUTUREPM',
        link: 'https://www.udemy.com/course/from-product-manager-to-ai-product-manager/?couponCode=FUTUREPM',
      },
      {
        title: '30 minute AI Product consultation',
        detail: 'Google Meet link',
        link: 'https://calendar.app.google/ritTa9aSxXNpz5Df8',
      },
      {
        title: 'Lifetime membership to Dreamsea dream interpretation app',
        detail: 'Set your username as "iloverazin" to activate',
        link: 'https://apps.apple.com/us/app/dreamsea/id6761101193',
      },
      {
        title: 'AI Tools Database',
        detail: 'An organised list of over 350 AI tools, categorised by use case',
        link: 'https://docs.google.com/spreadsheets/d/16MHU2CgFHK4LoyvgPa9jf3lIw2udxSDESD0UZ4A_lKU/edit?usp=sharing',
      },
    ],
  },
  aiRaminChatbot: {
    floatingLauncher: true,
    modalTitle: 'AI Ramin',
    comingSoonState: 'Coming soon',
    textarea: {
      label: 'Paste in a job or project',
      placeholder: 'Paste a job description, project brief, or problem statement.',
    },
    modelSelector: ['Claude Sonnet', 'Gemini Pro', 'Deepseek', 'GPT 5.5'],
    guardrails: [
      'Be truthful to Ramin\'s skills and experience.',
      'Separate verified proof from inference.',
      'Do not expose confidential company or client information.',
      'Do not invent metrics, links, roles, grades, logos, reviews, videos, or partner bios.',
    ],
  },
} as const;
