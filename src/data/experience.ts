import type { ExperienceEntry, Credential } from './shared';

export const experienceEntries = [
  {
    company: 'Bayut',
    role: 'AI Product Manager',
    dates: 'Jan 2026 - Present',
    domain: 'AI property search, recommendations, and conversational AI',
    outcome:
      'Confidential AI-native features in property search, recommendations, and conversational AI, built on model selection, eval suite design, guardrail implementation, and MCP integration.',
    proof:
      'Embeds the AI-Native Product OS as a standard framework across the wider Product team.',
    whatItProves:
      'Can lead AI-native product work where probabilistic behavior, safety, evaluation, and product taste all matter at once.',
    confidentiality:
      'Feature specifics stay confidential; the public version names only capability areas and operating-system patterns.',
    evidenceType: 'Confidential product work / public company link',
    sourceStatus: 'local-primary',
    links: [{ label: 'Bayut', href: 'https://www.bayut.com/', sourceStatus: 'public-proof' }],
    chips: ['Model selection', 'Eval suites', 'Guardrails', 'MCP', 'AI-Native OS'],
  },
  {
    company: 'Side.inc',
    role: 'Senior Product Manager; ERP',
    dates: 'Mar 2025 - Aug 2025',
    domain: 'Internal ERP and AI-coded process transformation',
    outcome:
      'Replaced multiple internal ERP products with AI-coded in-house alternatives, reducing ERP operational costs by 20% over 4 months and decreasing idea-to-feature time by 90%.',
    proof:
      'Global point of contact for employees exploring AI or automation tools; integrated Windsurf and Microsoft Enterprise Copilot with the core ERP.',
    whatItProves:
      'Can turn AI tooling into operational leverage, not just prototypes: lower cost, faster shipping, and clearer cross-functional data.',
    confidentiality:
      'Internal ERP and client process details stay summarized at transformation and tooling level.',
    evidenceType: 'Resume metrics / public company link',
    sourceStatus: 'local-primary',
    links: [{ label: 'Side.inc', href: 'https://www.side.inc/', sourceStatus: 'public-proof' }],
    chips: ['AI-coded ERP', '20% cost reduction', '90% faster idea-to-feature', 'Windsurf', 'Enterprise Copilot'],
  },
  {
    company: 'Perkbox Vivup',
    role: 'Senior Product Manager',
    dates: 'Jan 2023 - Nov 2024',
    domain: 'Employee benefits app UX, monetisation, and checkout guidance',
    outcome:
      'Streamlined the gateway UX of the Vivup App, increasing Google Play Store rating by 0.6 and iPhone App Store rating by 1.2 within 3 months.',
    proof:
      'Introduced monetisation to an existing feature, grew customer lifetime value by 19%, and decreased checkout abandonment by 1/3 after a new Order Guidance Wizard.',
    whatItProves:
      'Can improve user experience and commercial performance together without treating monetisation as separate from product quality.',
    confidentiality:
      'Metrics are resume-approved; detailed experiments and internal analytics stay out of the public surface.',
    evidenceType: 'Resume metrics / public company link',
    sourceStatus: 'local-primary',
    links: [{ label: 'Vivup Benefits', href: 'https://vivupbenefits.co.uk/', sourceStatus: 'public-proof' }],
    chips: ['App UX', 'Ratings uplift', 'CLV +19%', 'Checkout abandonment -1/3'],
  },
  {
    company: 'GroupM',
    role: 'Product Manager',
    dates: 'Jan 2022 - Dec 2022',
    domain: 'Media sustainability and carbon calculator productisation',
    outcome:
      "Translated EY's carbon emissions methodology, with 300+ dataset variables, into product specifications for a media carbon calculator.",
    proof:
      'The calculator measured the environmental impact of £1billion+ of media investment in 2022.',
    whatItProves:
      'Can translate expert methodology into a usable product system with enough rigor for enterprise-scale media decisions.',
    confidentiality:
      'Public proof links can carry the sustainability story; client-specific calculator data remains abstracted.',
    evidenceType: 'Public articles / resume metrics',
    sourceStatus: 'local-primary',
    links: [
      {
        label: 'Carbon calculator context',
        href: 'https://www.mi-3.com.au/20-07-2022/carbon-footprint-different-media-distribution-options-will-increasingly-influence-where',
        sourceStatus: 'public-proof',
      },
      {
        label: 'Green.org interview',
        href: 'https://green.org/2022/07/13/utilizing-media-to-build-a-sustainable-future/',
        sourceStatus: 'public-proof',
      },
    ],
    chips: ['Product Innovation Process', 'EY methodology', '300+ variables', 'GBP 1B+ measured'],
  },
  {
    company: 'Cox Automotive',
    role: 'Product Owner; Auction Platform',
    dates: 'Sept 2021 - Dec 2021',
    domain: 'Auction marketplace product and feature prioritisation',
    outcome:
      'Created a qualitative and data-driven Feature Scoring Framework to prioritise a large backlog for a new auction product for car manufacturers.',
    proof:
      'Halved stakeholder feedback cycles and increased roadmap alignment with user needs.',
    whatItProves:
      'Can bring structure to noisy enterprise backlogs and turn stakeholder tension into a more user-centric roadmap.',
    confidentiality:
      'Uses public product and framework references; manufacturer-specific roadmap details stay private.',
    evidenceType: 'Public product link / resume metric',
    sourceStatus: 'local-primary',
    links: [
      {
        label: 'Feature Scoring Framework',
        href: 'https://www.ramin.vision/decision',
        sourceStatus: 'public-proof',
      },
      {
        label: 'Auction product',
        href: 'https://www.manheim-express.eu/',
        sourceStatus: 'public-proof',
      },
    ],
    chips: ['Feature scoring', 'Auction product', 'Stakeholder cycles halved', 'Roadmap alignment'],
  },
  {
    company: 'Ordnance Survey',
    role: 'Product Manager; Geospatial API',
    dates: 'Dec 2020 - Sept 2021',
    domain: 'Geospatial data, sustainability discovery, and Microsoft Power Platform',
    outcome:
      'Led twelve discovery workshops to discover sustainability applications of geospatial data and validated 3 product concepts for further investment.',
    proof:
      "Defined and launched the first geospatial API on Microsoft's Power Platform.",
    whatItProves:
      'Can discover new markets for technical data platforms, validate concepts, and ship ecosystem integrations.',
    confidentiality:
      'Public connector proof is linked; client-specific sustainability and asset-valuation work stays summarized.',
    evidenceType: 'Public connector docs / resume metrics',
    sourceStatus: 'local-primary',
    links: [
      {
        label: 'Microsoft connector',
        href: 'https://docs.microsoft.com/en-gb/connectors/ordnancesurveyplaces/',
        sourceStatus: 'public-proof',
      },
    ],
    chips: ['12 workshops', '3 concepts validated', 'Power Platform API', 'Carbon impact forecasting'],
  },
  {
    company: 'Urgentem',
    role: 'Product Manager; Climate Data Platform',
    dates: 'Oct 2019 - Nov 2020',
    domain: 'Financial climate risk analytics',
    outcome:
      'Co-managed the development and start-up launch of Element6, a Financial Climate Risk Analytics platform.',
    proof:
      'Improved Demo-to-Buy conversion rate by 30% over 4 months and reduced quarterly churn rate by 25%.',
    whatItProves:
      'Can operate in data-heavy B2B environments where climate science, investor workflows, UX, and commercial adoption collide.',
    confidentiality:
      'Client portfolio details stay generalized; platform and public coverage can be referenced safely.',
    evidenceType: 'Resume metrics / public coverage',
    sourceStatus: 'local-primary',
    links: [
      { label: 'Urgentem', href: 'http://bit.ly/urgentemwebsite', sourceStatus: 'public-proof' },
      {
        label: 'Financial Times coverage',
        href: 'https://www.ft.com/content/7b734848-1287-4106-b866-7d07bc9d7eb8',
        sourceStatus: 'public-proof',
      },
    ],
    chips: ['Element6', 'GBP 900M AUM context', 'Demo-to-buy +30%', 'Churn -25%'],
  },
  {
    company: 'Deity AI',
    role: 'Product Manager; Chatbot',
    dates: 'Jul 2017 - Oct 2019',
    domain: 'Conversational AI for dating and profile interaction',
    outcome:
      'Ideated and implemented an AI conversation mediator chatbot inside a dating app.',
    proof:
      'Improved chat retention by over 50% in the first 3 months after release.',
    whatItProves:
      'Early, practical exposure to AI behavior inside a social product where trust, tone, and user motivation shape retention.',
    confidentiality:
      'Dating-app mechanics can be described at feature level; internal model, user, and retention data stay private.',
    evidenceType: 'Resume metric / demo asset needed',
    sourceStatus: 'local-primary',
    links: [
      { label: 'Deity AI', href: 'http://www.deityai.org/', sourceStatus: 'public-proof' },
      {
        label: 'Conversation mediator demo',
        href: 'https://drive.google.com/file/d/19Ln-UWxReuAFTFdDc4JBZHdDxzeBPmwt/view?usp=sharing',
        sourceStatus: 'manual-needed',
      },
    ],
    chips: ['Conversation mediator', 'Dating app', 'Chat retention +50%', 'Trust and tone'],
  },
  {
    company: 'ERM',
    role: 'Product Stewardship Consultant',
    dates: 'Dec 2018 - Oct 2019',
    domain: 'Product lifecycle assessment, ESG data, and satellite-data use cases',
    outcome:
      'Co-authored European Commission research on lifecycle assessment for double-sided solar panels and identified satellite-data use cases for copper-mine risk detection.',
    proof:
      "Improved partner RepRisk's product offering revenue by 10% over 6 months.",
    whatItProves:
      'Can bridge technical sustainability research, external partners, and commercially useful product opportunities.',
    confidentiality:
      'Public research can be cited; partner revenue and use-case details stay at approved summary level.',
    evidenceType: 'Public research paper / resume metric',
    sourceStatus: 'local-primary',
    links: [
      { label: 'ERM', href: 'http://www.erm.com/', sourceStatus: 'public-proof' },
      {
        label: 'European Commission paper',
        href: 'https://ec.europa.eu/research/participants/documents/downloadPublic?documentIds=080166e5c80d5f80&appId=PPGMS',
        sourceStatus: 'public-proof',
      },
    ],
    chips: ['Lifecycle assessment', 'Solar panels', 'Satellite data', 'RepRisk +10%'],
  },
  {
    company: 'Tesla',
    role: 'Senior Product Specialist',
    dates: 'Apr 2017 - Sept 2018',
    domain: 'EV sales, product education, and customer activation',
    outcome:
      'Initiated a Tesla / SpaceX marketing campaign through direct communication with the CEO, more than doubling Owners Orientation attendance in Q1-Q3 2018.',
    proof:
      'Averaged 120% performance on Tesla Model S sales target and sold the first Tesla Powerwall to a residential customer in the UK.',
    whatItProves:
      'Can sell and explain complex frontier products directly to customers, then turn field insight into higher-conviction activation.',
    confidentiality:
      'Uses resume-approved sales and campaign outcomes; customer identities and internal campaign mechanics stay private.',
    evidenceType: 'Resume metrics / public proof link',
    sourceStatus: 'local-primary',
    links: [{ label: 'Tesla proof', href: 'http://bit.ly/teslaramin', sourceStatus: 'public-proof' }],
    chips: ['Tesla / SpaceX campaign', 'Orientation 2x+', '120% target', 'First UK residential Powerwall'],
  },
] as const satisfies readonly ExperienceEntry[];

export const credentials = [
  {
    group: 'AI',
    title: 'AI Engineering Professional Certificate',
    issuer: 'IBM',
    year: '2026',
    note: 'Part of the current AI qualification layer backing the product work.',
    assetSlot: 'Needs IBM certificate image or verification link.',
    sourceStatus: 'local-primary',
  },
  {
    group: 'AI',
    title: 'Professional Machine Learning Engineer',
    issuer: 'Google AI School',
    year: '2026',
    note: 'Technical AI qualification to support model, data, and evaluation literacy.',
    assetSlot: 'Needs Google Professional Machine Learning Engineer badge or verification link.',
    sourceStatus: 'local-primary',
  },
  {
    group: 'AI',
    title: 'Generative AI Leader Certification',
    issuer: 'Google AI School',
    year: '2026',
    note: 'Leadership-side AI credential for applying generative AI in teams and products.',
    assetSlot: 'Needs Google Generative AI Leader badge or verification link.',
    sourceStatus: 'local-primary',
  },
  {
    group: 'AI',
    title: 'MCP Protocols: Advanced Topics',
    issuer: 'Anthropic Academy',
    year: '2026',
    note: 'Directly relevant to context, tool use, and AI product architecture.',
    assetSlot: 'Needs Anthropic Academy credential image or verification link.',
    sourceStatus: 'local-primary',
  },
  {
    group: 'Education',
    title: 'MSc in Environmental Technology with Distinction',
    issuer: 'Imperial College London',
    year: '2017',
    note: 'Systems, sustainability, and technical-commercial reasoning.',
    assetSlot: 'Needs Imperial certificate image, transcript proof, or approved text-only mark.',
    sourceStatus: 'local-primary',
  },
  {
    group: 'Education',
    title: 'BA in Business and Marketing with 1st Class Honours',
    issuer: 'University of Northampton',
    year: '2016',
    note: 'Commercial, strategic, and customer-facing foundation.',
    assetSlot: 'Needs University of Northampton proof or approved text-only mark.',
    sourceStatus: 'local-primary',
  },
  {
    group: 'Leadership',
    title: 'Leadership Development Programme',
    issuer: 'MBTi',
    year: '2024',
    note: 'Leadership judgement, communication, and team-facing growth.',
    assetSlot: 'Needs MBTi Leadership Development Programme proof.',
    sourceStatus: 'local-primary',
  },
] as const satisfies readonly Credential[];
