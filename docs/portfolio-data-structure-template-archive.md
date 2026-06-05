# Portfolio Data Structure Template

Populated from:

- `ramin-hoodeh-exp-context.md`
- `overall-structure-context.md`

Use this document as the content intake template before anything is moved into `src/data/portfolio.ts`.

Rules:

- `TBD` means the source files did not provide the detail.
- `needs-confirmation` means the detail is plausible from the source files but should be checked before publishing.
- `publicCopy` is the safe wording to display.
- `privateNotes` is for context that should not necessarily be displayed.

## Field Conventions

```yaml
asset:
  title:
  pathOrUrl:
  altText:
  type: image | gif | video | logo | diagram | document | spreadsheet | 3d-model
  status: ready | needed | optional | confidential | needs-confirmation
  sourceNotes:

link:
  label:
  url:
  status: ready | needed | private | broken | needs-confirmation

review:
  quote:
  reviewerName:
  reviewerRole:
  company:
  permissionStatus: approved | needs-approval | anonymous-only | TBD
  link:
```

## 1. Hero

```yaml
hero:
  name: Ramin Hoodeh
  fullNameFromCv: Ramin Tom Hoodeh
  primaryRole: Senior Product Manager
  identityLine: Senior Product Manager | AI Builder
  roles:
    - Product Manager
    - AI Builder
    - Teacher
    - Fiction Author
  headline: I use AI to research, design, and build AI-native features every single day.
  profilePicture:
    title: Ramin profile picture
    pathOrUrl: ramin-hoodeh-profile-pic.png
    altText: Ramin Hoodeh
    type: image
    status: needs-confirmation
    sourceNotes: File exists in repository root; confirm this is the preferred final profile image.
  thesisCta:
    label: My Product Thesis
    target: AI-Native Product OS
    links:
      - label: AI-Native Product OS
        url: https://www.notion.so/AI-Native-Product-OS-cfa6fe2ecf3783649ab68152765cc260?pvs=21
        status: ready
      - label: AI PM thesis/course structure
        url: https://www.notion.so/AI-PM-Course-Structure-3476fe2ecf3780efb887d6b533c95974?pvs=21
        status: needs-confirmation
  contact:
    email: raminhoodeh@gmail.com
    phone: "+44 7852890444"
    linkedin:
      label: LinkedIn
      url: http://bit.ly/raminlinkedin
      status: ready
    github:
      label: GitHub
      url: https://github.com/raminhoodeh
      status: ready
    oldPortfolio:
      label: Old portfolio
      url: http://www.ramin.vision/
      status: ready
```

## 2. Experience And Education

```yaml
experienceEducation:
  intro: Proven experience across multiple industries in start-ups, SMEs, and complex product environments.
```

### Companies

```yaml
companies:
  - companyName: Bayut
    companyLogo:
      title: Bayut logo
      pathOrUrl: "company-logos/bayut logo.webp"
      altText: Bayut logo
      type: logo
      status: ready
      sourceNotes: Provided in company-logos folder.
    productVideo:
      title: Bayut product video
      pathOrUrl: TBD
      altText: Bayut product video
      type: video
      status: needed
      sourceNotes:
    companyLink:
      label: Bayut
      url: https://www.bayut.com/
      status: ready
    location: TBD
    dateRange:
      startMonth: Jan
      startYear: 2026
      endMonth: Present
      endYear: Present
      displayLabel: Jan 2026 - Present
    jobTitle: AI Product Manager
    companyDescription: TBD
    industryTags:
      - Property search
      - Recommendations
      - Conversational AI
      - AI-native product
    productsWorkedOn:
      - productName: Property search AI features
        productDescription: Confidential AI-native features in property search.
        publicCopy: AI-native property search features built with model selection, eval suite design, guardrails, and MCP integration.
        privateNotes: Source says confidential; keep details public-safe.
      - productName: Recommendations
        productDescription: Confidential recommendation features.
        publicCopy: Recommendation features using AI-native product practices.
        privateNotes: Source says confidential.
      - productName: Conversational AI
        productDescription: Confidential conversational AI features.
        publicCopy: Conversational AI features built with evaluation, guardrail, and MCP considerations.
        privateNotes: Source says confidential.
    mainAchievements:
      - achievement: Built confidential AI-native features in property search, recommendations, and conversational AI.
        evidence: ramin-hoodeh-exp-context.md
        publicCopy: Built confidential AI-native product features across search, recommendations, and conversational AI.
        privateNotes:
      - achievement: Embedded the AI-Native Product OS as a standard framework across the wider Product team.
        evidence: ramin-hoodeh-exp-context.md
        publicCopy: Helped standardise AI-native product practice through the AI-Native Product OS.
        privateNotes:
    processesIntroducedManagerial:
      - processName: AI-Native Product OS
        description: Framework for product work using model selection, context, orchestration, governance, human judgement, evals, guardrails, and MCP integration.
        evidence: ramin-hoodeh-exp-context.md
    businessModel:
      - TBD
    customersClientTypes:
      - clientType: Property seekers and property marketplace users
        numberOfUsers: TBD
        sourceOrConfidence: inferred-from-company-context
    reviews: []
    confidentialityNotes: Keep specific product details confidential.

  - companyName: SIDE
    companyLogo:
      title: SIDE logo
      pathOrUrl: "company-logos/side logo.png"
      altText: SIDE logo
      type: logo
      status: ready
      sourceNotes: Provided in company-logos folder.
    productVideo:
      title: SIDE product video
      pathOrUrl: TBD
      altText: SIDE product video
      type: video
      status: needed
      sourceNotes:
    companyLink:
      label: Side.inc
      url: https://www.side.inc/
      status: ready
    location: TBD
    dateRange:
      startMonth: Mar
      startYear: 2025
      endMonth: Aug
      endYear: 2025
      displayLabel: Mar 2025 - Aug 2025
    jobTitle: Senior Product Manager; ERP
    companyDescription: TBD
    industryTags:
      - ERP
      - Internal tools
      - AI automation
      - Enterprise operations
    productsWorkedOn:
      - productName: AI-coded in-house ERP alternatives
        productDescription: Replaced multiple internal ERP products with AI-coded in-house alternatives.
        publicCopy: Built AI-coded internal ERP alternatives to reduce operational cost and improve speed from idea to feature.
        privateNotes:
      - productName: Windsurf integration
        productDescription: AI coding copilot integrated into engineering workflow.
        publicCopy: Integrated AI coding copilot workflows to shift engineering capacity toward innovation.
        privateNotes:
      - productName: Microsoft Enterprise Copilot with core ERP
        productDescription: Connected siloed Finance, Operations, and Sales data for leadership insight.
        publicCopy: Integrated Microsoft Enterprise Copilot with ERP data to improve reporting and decision-making.
        privateNotes:
    mainAchievements:
      - achievement: Reduced ERP operational costs by 20% over 4 months.
        evidence: ramin-hoodeh-exp-context.md
        publicCopy: Reduced ERP operational costs by 20% over 4 months.
        privateNotes:
      - achievement: Decreased idea-to-feature time by 90% for internal process improvement.
        evidence: ramin-hoodeh-exp-context.md
        publicCopy: Decreased idea-to-feature time by 90% for internal process improvement.
        privateNotes:
      - achievement: Shifted engineering resources from 60% Maintenance / 40% Innovation to 40% Maintenance / 60% Innovation.
        evidence: ramin-hoodeh-exp-context.md
        publicCopy: Helped shift engineering capacity toward innovation through AI coding copilot adoption.
        privateNotes:
      - achievement: Eliminated 30% of manual reporting overhead through Microsoft Enterprise Copilot and ERP integration.
        evidence: ramin-hoodeh-exp-context.md
        publicCopy: Reduced manual reporting overhead by 30% through ERP and Copilot integration.
        privateNotes:
    processesIntroducedManagerial:
      - processName: Company-wide AI and automation request point of contact
        description: Global point of contact for employees to explore and request new AI or automation tools across the organisation.
        evidence: ramin-hoodeh-exp-context.md
      - processName: Microsoft Enterprise Copilot ERP workflow
        description: Unified siloed Finance, Operations, and Sales data for real-time cross-functional insights.
        evidence: ramin-hoodeh-exp-context.md
    businessModel:
      - B2B
    customersClientTypes:
      - clientType: Internal employees and leadership
        numberOfUsers: TBD
        sourceOrConfidence: source-supported-general
    reviews: []
    confidentialityNotes: Source notes redundancy context; decide whether to include publicly.
    privateNotes: Made redundant due to clients replacing Side.inc human actor voices with AI replicas.

  - companyName: Perkbox Vivup
    companyLogo:
      title: Perkbox Vivup logo
      pathOrUrl: TBD
      altText: Perkbox Vivup logo
      type: logo
      status: needed
      sourceNotes: No matching Perkbox or Vivup logo found in company-logos folder during validation.
    productVideo:
      title: Vivup App product video
      pathOrUrl: TBD
      altText: Vivup App product video
      type: video
      status: needed
      sourceNotes:
    companyLink:
      label: Vivup Benefits
      url: https://vivupbenefits.co.uk/
      status: ready
    location: TBD
    dateRange:
      startMonth: Jan
      startYear: 2023
      endMonth: Nov
      endYear: 2024
      displayLabel: Jan 2023 - Nov 2024
    jobTitle: Senior Product Manager
    companyDescription: TBD
    industryTags:
      - Employee benefits
      - Mobile app
      - Marketplace
      - UX
      - Monetisation
    productsWorkedOn:
      - productName: Vivup App gateway UX
        productDescription: Gateway UX streamlined using qualitative user interview data.
        publicCopy: Improved the Vivup App gateway experience through qualitative user research and UX iteration.
        privateNotes:
      - productName: Savings monetisation feature
        productDescription: Introduced monetisation to an existing feature by capturing a margin of user savings.
        publicCopy: Introduced a savings-based monetisation model while maintaining user satisfaction.
        privateNotes:
      - productName: Order Guidance Wizard
        productDescription: New order guidance flow to reduce order form and checkout abandonment.
        publicCopy: Aligned stakeholders around a new Order Guidance Wizard to reduce abandonment.
        privateNotes:
    mainAchievements:
      - achievement: Increased Google Play Store rating by 0.6 and iPhone App Store rating by 1.2 within 3 months.
        evidence: ramin-hoodeh-exp-context.md
        publicCopy:
        privateNotes:
      - achievement: Grew product customer lifetime value by 19% over 5 months.
        evidence: ramin-hoodeh-exp-context.md
        publicCopy:
        privateNotes:
      - achievement: Decreased order form and checkout abandonment rate by 1/3 within the first month of delivery.
        evidence: ramin-hoodeh-exp-context.md
        publicCopy:
        privateNotes:
    processesIntroducedManagerial:
      - processName: Qualitative interview analysis for app UX
        description: Used qualitative user interview data to ideate and streamline gateway UX.
        evidence: ramin-hoodeh-exp-context.md
      - processName: Stakeholder alignment for Order Guidance Wizard
        description: Aligned stakeholders on design and development priorities for a new guided order flow.
        evidence: ramin-hoodeh-exp-context.md
    businessModel:
      - B2B2C
      - B2C
    customersClientTypes:
      - clientType: Employees using benefits products
        numberOfUsers: TBD
        sourceOrConfidence: inferred-from-company-context
    reviews: []
    confidentialityNotes:

  - companyName: GroupM
    companyLogo:
      title: GroupM logo
      pathOrUrl: "company-logos/groupm logo.webp"
      altText: GroupM logo
      type: logo
      status: ready
      sourceNotes: Provided in company-logos folder.
    productVideo:
      title: Carbon Calculator product video
      pathOrUrl: TBD
      altText: Carbon Calculator product video
      type: video
      status: needed
      sourceNotes:
    companyLink:
      label: GroupM
      url: TBD
      status: needed
    location: TBD
    dateRange:
      startMonth: Jan
      startYear: 2022
      endMonth: Dec
      endYear: 2022
      displayLabel: Jan 2022 - Dec 2022
    jobTitle: Product Manager
    companyDescription: TBD
    industryTags:
      - Media
      - Sustainability
      - Carbon calculator
      - Innovation
    productsWorkedOn:
      - productName: Carbon Calculator
        productDescription: Product specifications based on EY carbon emissions methodology with 300+ dataset variables.
        publicCopy: Translated EY's carbon emissions methodology into product specifications for a media carbon calculator.
        privateNotes:
      - productName: Product Innovation Process
        productDescription: Process used to manage product division of GroupM's Global Innovation Group.
        publicCopy: Implemented a Product Innovation Process for product strategy and user-centric development.
        privateNotes:
    mainAchievements:
      - achievement: Carbon Calculator measured the environmental impact of GBP 1bn+ of media investment in 2022.
        evidence: ramin-hoodeh-exp-context.md
        publicCopy:
        privateNotes:
      - achievement: The calculator remains the most widely used calculator in the media sector.
        evidence: ramin-hoodeh-exp-context.md
        publicCopy:
        privateNotes: Confirm current wording before publishing.
      - achievement: Mentored junior PMs and engineers in product strategy and user-centric mindsets.
        evidence: ramin-hoodeh-exp-context.md
        publicCopy:
        privateNotes:
    processesIntroducedManagerial:
      - processName: Product Innovation Process
        description: Managed product strategy and mentored junior PMs and engineers.
        evidence: https://www.ramin.vision/product.html
    businessModel:
      - B2B
    customersClientTypes:
      - clientType: Media investment teams and sustainability stakeholders
        numberOfUsers: TBD
        sourceOrConfidence: inferred-from-context
    links:
      - label: Product Innovation Process
        url: https://www.ramin.vision/product.html
        status: ready
      - label: Carbon Calculator proof
        url: https://www.mi-3.com.au/20-07-2022/carbon-footprint-different-media-distribution-options-will-increasingly-influence-where
        status: ready
    reviews: []

  - companyName: Cox Automotive
    companyLogo:
      title: Cox Automotive logo
      pathOrUrl: "company-logos/cox automotive logo.jpg"
      altText: Cox Automotive logo
      type: logo
      status: ready
      sourceNotes: Provided in company-logos folder.
    productVideo:
      title: Auction platform product video
      pathOrUrl: TBD
      altText: Auction platform product video
      type: video
      status: needed
      sourceNotes:
    companyLink:
      label: Cox Automotive
      url: TBD
      status: needed
    location: TBD
    dateRange:
      startMonth: Sept
      startYear: 2021
      endMonth: Dec
      endYear: 2021
      displayLabel: Sept 2021 - Dec 2021
    jobTitle: Product Owner; Auction Platform [Contract]
    companyDescription: TBD
    industryTags:
      - Automotive
      - Auction platform
      - Marketplace
      - Prioritisation
    productsWorkedOn:
      - productName: Manheim Express auction product
        productDescription: New auction product for car manufacturers.
        publicCopy: Prioritised backlog for a new auction product for car manufacturers.
        privateNotes:
      - productName: Feature Scoring Framework
        productDescription: Qualitative and data-driven framework for feature prioritisation.
        publicCopy: Created a feature scoring framework to prioritise a large product backlog.
        privateNotes:
    mainAchievements:
      - achievement: Halved stakeholder feedback cycles.
        evidence: ramin-hoodeh-exp-context.md
        publicCopy:
        privateNotes:
      - achievement: Increased alignment with user needs, resulting in a more user-centric roadmap.
        evidence: ramin-hoodeh-exp-context.md
        publicCopy:
        privateNotes:
    processesIntroducedManagerial:
      - processName: Feature Scoring Framework
        description: A qualitative and data-driven approach to prioritising a large feature backlog.
        evidence: https://www.ramin.vision/decision
    businessModel:
      - B2B
    customersClientTypes:
      - clientType: Car manufacturers
        numberOfUsers: TBD
        sourceOrConfidence: source-supported
    links:
      - label: Feature Scoring Framework
        url: https://www.ramin.vision/decision
        status: ready
      - label: Manheim Express
        url: https://www.manheim-express.eu/
        status: ready
    reviews: []

  - companyName: Ordnance Survey
    companyLogo:
      title: Ordnance Survey logo
      pathOrUrl: "company-logos/ordnance survey logo.jpg"
      altText: Ordnance Survey logo
      type: logo
      status: ready
      sourceNotes: Provided in company-logos folder.
    productVideo:
      title: Geospatial API product video
      pathOrUrl: TBD
      altText: Geospatial API product video
      type: video
      status: needed
      sourceNotes:
    companyLink:
      label: Ordnance Survey
      url: https://www.ordnancesurvey.co.uk/
      status: ready
    location: TBD
    dateRange:
      startMonth: Dec
      startYear: 2020
      endMonth: Sept
      endYear: 2021
      displayLabel: Dec 2020 - Sept 2021
    jobTitle: Product Manager; Geospatial API
    companyDescription: Worked within Geospatial Solutions Proposition and Innovation, gathering intelligence for positive impact and building a portfolio of next-generation geospatial solutions.
    industryTags:
      - Geospatial data
      - APIs
      - Sustainability
      - Microsoft Power Platform
      - National infrastructure
      - Defence and space
    productsWorkedOn:
      - productName: OS Maps API on Microsoft Power Platform
        productDescription: Geospatial API product on Microsoft Power Platform, developed within Geospatial Solutions Proposition and Innovation.
        publicCopy: Defined and launched a geospatial API product on Microsoft's Power Platform.
        privateNotes: User-provided update names this as OS Maps API; earlier CV context referenced OS Places connector. Confirm final product naming before publishing.
      - productName: Sustainability applications of geospatial data
        productDescription: Product concepts using geospatial intelligence for positive impact across energy, infrastructure, defence, and space contexts.
        publicCopy: Led discovery into sustainability and positive-impact applications of geospatial data.
        privateNotes:
    mainAchievements:
      - achievement: Led twelve discovery workshops with Propositions & Innovation team and client stakeholders.
        evidence: ramin-hoodeh-exp-context.md
        publicCopy:
        privateNotes:
      - achievement: Validated 3 product concepts for further investment.
        evidence: ramin-hoodeh-exp-context.md
        publicCopy:
        privateNotes:
      - achievement: Improved energy clients' ability to forecast carbon impacts on asset valuations by 25% within 6 months.
        evidence: ramin-hoodeh-exp-context.md
        publicCopy:
        privateNotes:
      - achievement: Increased geospatial data utilisation by 30% across 2 key accounts by Q3 2021.
        evidence: ramin-hoodeh-exp-context.md
        publicCopy:
        privateNotes:
    processesIntroducedManagerial:
      - processName: Discovery workshops
        description: Twelve workshops to discover sustainability applications of geospatial data.
        evidence: ramin-hoodeh-exp-context.md
    businessModel:
      - B2B
    customersClientTypes:
      - clientType: National energy clients
        numberOfUsers: TBD
        sourceOrConfidence: user-provided
      - clientType: Infrastructure clients
        numberOfUsers: TBD
        sourceOrConfidence: user-provided
      - clientType: Defence clients
        numberOfUsers: TBD
        sourceOrConfidence: user-provided
      - clientType: Space sector clients
        numberOfUsers: TBD
        sourceOrConfidence: user-provided
    links:
      - label: Ordnance Survey Places connector
        url: https://docs.microsoft.com/en-gb/connectors/ordnancesurveyplaces/
        status: ready
    reviews: []

  - companyName: Urgentem
    includeInRequestedStructure: needs-decision
    reasonForFlag: Present in source CV context but not listed in the requested company list.
    companyLogo:
      title: Urgentem logo
      pathOrUrl: "company-logos/urgentem logo.jpg"
      altText: Urgentem logo
      type: logo
      status: ready
      sourceNotes: Provided in company-logos folder.
    companyLink:
      label: Urgentem
      url: http://bit.ly/urgentemwebsite
      status: ready
    location: TBD
    dateRange:
      startMonth: Oct
      startYear: 2019
      endMonth: Nov
      endYear: 2020
      displayLabel: Oct 2019 - Nov 2020
    jobTitle: Product Manager; Climate Data Platform
    companyDescription: Climate risk analytics platform company helping investors measure and navigate climate-related risks and opportunities.
    industryTags:
      - Climate risk
      - ESG
      - Analytics platform
      - B2B SaaS
    productsWorkedOn:
      - productName: Element6 Climate Risk Platform
        productDescription: Climate risk platform for investors with portfolio and company-level scenario analysis, forward-looking metrics, and tools for holistic management of climate-related risks and opportunities.
        coreCapabilities:
          - Portfolio-level climate scenario analysis
          - Company-level climate scenario analysis
          - Forward-looking climate risk metrics
          - Climate-related risk and opportunity management tools
        publicCopy: Co-managed development and start-up launch of Element6, a climate risk platform for investors.
        privateNotes:
    mainAchievements:
      - achievement: Helped reduce climate-related risk by 20% across client portfolios totalling GBP 900m in AUM.
        evidence: ramin-hoodeh-exp-context.md
        publicCopy:
        privateNotes:
      - achievement: Featured in the Financial Times.
        evidence: https://www.ft.com/content/7b734848-1287-4106-b866-7d07bc9d7eb8
        publicCopy:
        privateNotes:
      - achievement: Improved Demo-to-Buy conversion rate by 30% over 4 months and reduced quarterly churn by 25%.
        evidence: ramin-hoodeh-exp-context.md
        publicCopy:
        privateNotes:
      - achievement: Increased ratio of story point development to feature usage by 25% over 8 months.
        evidence: ramin-hoodeh-exp-context.md
        publicCopy:
        privateNotes:
    processesIntroducedManagerial:
      - processName: Cross-regional SCRUM leadership
        description: Led carbon data analysts, developers, and UX designers to prioritise UX improvements from client feedback.
        evidence: ramin-hoodeh-exp-context.md
      - processName: Google Analytics feature uptake measurement
        description: Used analytics to remove under-used features and improve development-to-usage ratio.
        evidence: ramin-hoodeh-exp-context.md
      - processName: Cross-functional climate platform delivery
        description: Worked with carbon data analysts, a data scientist, a full-stack developer, a financial analyst, and sales engineers to deliver climate risk analytics.
        evidence: user-provided update
    teamWorkedWith:
      - Carbon data analysts x3
      - Data scientist
      - Full-stack developer
      - Financial analyst
      - Sales engineers x2
    businessModel:
      - B2B
    customersClientTypes:
      - clientType: Central bank
        namedClients:
          - European Central Bank
        numberOfUsers: TBD
        sourceOrConfidence: user-provided
      - clientType: Pension and investment organisations
        namedClients:
          - Ilmarinen
          - Local Pensions Partnership
          - Folksam
        numberOfUsers: Client portfolios totalling GBP 900m in AUM
        sourceOrConfidence: user-provided plus CV context

  - companyName: Deity AI
    companyLogo:
      title: Deity AI logo
      pathOrUrl: company-logos/deity-ai-logo.png
      altText: Deity AI logo
      type: logo
      status: ready
      sourceNotes: Provided in company-logos folder.
    companyLink:
      label: Deity AI
      url: http://www.deityai.org/
      status: ready
    location: TBD
    dateRange:
      startMonth: Jul
      startYear: 2017
      endMonth: Oct
      endYear: 2019
      displayLabel: Jul 2017 - Oct 2019
    jobTitle: Product Manager; Chatbot
    companyDescription: Circles by Deity recommended people and places to work remotely from, using a conversational mediator to help users move into deeper collaboration.
    industryTags:
      - Chatbot
      - Dating app
      - Conversational AI
      - Retention
      - Remote work
      - Hospitality discovery
      - Collaboration
    productsWorkedOn:
      - productName: Circles by Deity
        productDescription: Product recommending people and places to work remotely from.
        publicCopy: Built a recommendation experience for remote workers to discover relevant people and places to work from.
        privateNotes:
      - productName: Deity conversational chatbot mediator
        productDescription: Conversational mediator that helps users skip small talk, reach more meaningful dialogue, and receive relevant place recommendations to meet and collaborate.
        publicCopy: Ideated and implemented a conversational mediator that helped users move into meaningful dialogue and relevant collaboration settings.
        privateNotes:
    mainAchievements:
      - achievement: Improved chat retention rate by over 50% in first 3 months after release.
        evidence: ramin-hoodeh-exp-context.md
        publicCopy:
        privateNotes:
    processesIntroducedManagerial: []
    businessModel:
      - B2B
      - B2B2C
      - B2C
    customersClientTypes:
      - clientType: Hospitality SMEs in London
        numberOfUsers: TBD
        sourceOrConfidence: user-provided
      - clientType: Remote workers
        numberOfUsers: TBD
        sourceOrConfidence: user-provided
    links:
      - label: Conversation mediator chatbot
        url: https://drive.google.com/file/d/19Ln-UWxReuAFTFdDc4JBZHdDxzeBPmwt/view?usp=sharing
        status: ready
    reviews: []

  - companyName: ERM
    companyLogo:
      title: ERM logo
      pathOrUrl: "company-logos/erm logo.jpg"
      altText: ERM logo
      type: logo
      status: ready
      sourceNotes: Provided in company-logos folder.
    companyLink:
      label: ERM
      url: http://www.erm.com/
      status: ready
    location: TBD
    dateRange:
      startMonth: Dec
      startYear: 2018
      endMonth: Oct
      endYear: 2019
      displayLabel: Dec 2018 - Oct 2019
    jobTitle: Product Stewardship Consultant
    companyDescription: Sustainability consulting work focused on product stewardship, lifecycle assessment, and environmental/social risk research.
    industryTags:
      - Sustainability
      - Product lifecycle assessment
      - Satellite data
      - ESG research
      - Solar product lifecycle
    productsWorkedOn:
      - productName: DISC European Commission research project
        productDescription: Research identifying the social risks and benefits associated with the life cycle of new solar products, specifically double-side contacted cells with innovative carrier-selective contacts.
        publicCopy: Co-authored European Commission-funded research on the social risks and benefits of new solar product lifecycles.
        privateNotes: User clarified this is a research paper, not a product.
      - productName: Socio-economic value and benefits analysis
        productDescription: Research developed understanding of socio-economic value and benefits in Europe through direct operations and upstream and downstream value chain impacts.
        publicCopy: Assessed socio-economic value and value-chain benefits created by new solar product innovation in Europe.
        privateNotes:
      - productName: Satellite data use cases for RepRisk
        productDescription: Identified use cases to detect copper mines at risk of leaking waste into waterways.
        publicCopy: Identified satellite-data use cases for environmental risk detection.
        privateNotes:
    mainAchievements:
      - achievement: Co-authored a European Commission research paper.
        evidence: ramin-hoodeh-exp-context.md
        publicCopy:
        privateNotes:
      - achievement: Improved partner RepRisk product offering revenue by 10% over 6 months.
        evidence: ramin-hoodeh-exp-context.md
        publicCopy:
        privateNotes:
    processesIntroducedManagerial: []
    businessModel:
      - B2B
    customersClientTypes:
      - clientType: Institute for Solar Energy Research
        numberOfUsers: TBD
        sourceOrConfidence: user-provided
      - clientType: European Commission
        numberOfUsers: TBD
        sourceOrConfidence: user-provided
    links:
      - label: European Commission research paper
        url: https://ec.europa.eu/research/participants/documents/downloadPublic?documentIds=080166e5c80d5f80&appId=PPGMS
        status: ready
    reviews: []

  - companyName: Tesla
    companyLogo:
      title: Tesla logo
      pathOrUrl: "company-logos/tesla logo.png"
      altText: Tesla logo
      type: logo
      status: ready
      sourceNotes: Provided in company-logos folder.
    companyLink:
      label: Tesla proof link
      url: http://bit.ly/teslaramin
      status: ready
    location: TBD
    dateRange:
      startMonth: Apr
      startYear: 2017
      endMonth: Sept
      endYear: 2018
      displayLabel: Apr 2017 - Sept 2018
    jobTitle: Senior Product Specialist
    promotionNote: Promoted from Product Specialist
    companyDescription: TBD
    industryTags:
      - Electric vehicles
      - Energy products
      - Sales
      - Product storytelling
      - Mobile app
      - Home energy
    productsWorkedOn:
      - productName: Tesla app 3.23 Power Flow
        productDescription: Tesla app update introducing Power Flow, allowing users to see whether home electricity is coming from the grid, solar installation, or Powerwall, and set preferences to optimise for energy independence, outage protection, or savings.
        publicCopy: Worked around Tesla's energy product experience, including Power Flow visibility for grid, solar, and Powerwall energy usage.
        privateNotes: User-provided product context; verify exact personal contribution before public case-study wording.
      - productName: Tesla Model S
        productDescription: Sales and product specialist work.
        publicCopy: Product specialist work on Tesla Model S.
        privateNotes:
      - productName: Tesla Powerwall
        productDescription: Sold the first Tesla Powerwall to a residential customer in the UK.
        publicCopy: Sold the first Tesla Powerwall to a residential customer in the UK.
        privateNotes:
      - productName: Tesla / SpaceX marketing campaign
        productDescription: Campaign initiated through direct CEO communication.
        publicCopy: Initiated Tesla / SpaceX marketing campaign that more than doubled Owners Orientation attendance.
        privateNotes:
    mainAchievements:
      - achievement: More than doubled attendance of Owners Orientation events in Q1-Q3 2018.
        evidence: ramin-hoodeh-exp-context.md
        publicCopy:
        privateNotes:
      - achievement: Averaged 120% performance on Tesla Model S sales target from Q3 2017 to Q2 2018.
        evidence: ramin-hoodeh-exp-context.md
        publicCopy:
        privateNotes:
      - achievement: Sold the first Tesla Powerwall to a residential customer in the UK.
        evidence: ramin-hoodeh-exp-context.md
        publicCopy:
        privateNotes:
    processesIntroducedManagerial: []
    businessModel:
      - B2C
    customersClientTypes:
      - clientType: Tesla Powerwall owners
        numberOfUsers: TBD
        sourceOrConfidence: user-provided
      - clientType: Tesla Model 3 owners
        numberOfUsers: TBD
        sourceOrConfidence: user-provided
      - clientType: Tesla Model S owners
        numberOfUsers: TBD
        sourceOrConfidence: user-provided
      - clientType: Tesla Model X owners
        numberOfUsers: TBD
        sourceOrConfidence: user-provided
    reviews: []
```

### Qualifications

```yaml
qualifications:
  - institutionName: Imperial College London
    institutionLogo:
      title: Imperial College London logo
      pathOrUrl: TBD
      altText: Imperial College London logo
      type: logo
      status: needed
      sourceNotes:
    qualificationName: Environmental Technology
    qualificationType: MSc
    qualificationLink:
      label: TBD
      url: TBD
      status: needed
    gradeAchieved: Distinction
    dateRange: 2017
    modulesOrFocusAreas:
      - Environmental technology
      - Sustainability
      - ESG
    howThisHelpedAsProductManager: Built technical and sustainability literacy for climate, geospatial, lifecycle assessment, and ESG product work.
    evidence: ramin-hoodeh-exp-context.md
    privateNotes:

  - institutionName: University of Northampton
    institutionLogo:
      title: University of Northampton logo
      pathOrUrl: TBD
      altText: University of Northampton logo
      type: logo
      status: needed
      sourceNotes:
    qualificationName: Business and Marketing
    qualificationType: BA
    qualificationLink:
      label: TBD
      url: TBD
      status: needed
    gradeAchieved: 1st Class Honours
    dateRange: 2016
    modulesOrFocusAreas:
      - Business
      - Marketing
    howThisHelpedAsProductManager: Built commercial, customer, positioning, and go-to-market foundations.
    evidence: ramin-hoodeh-exp-context.md
    privateNotes:

  - institutionName: Nuclio Digital School
    includeInRequestedStructure: needs-decision
    sourceNotes: Mentioned in overall-structure-context.md as "PM Masters" but not in ramin-hoodeh-exp-context.md.
    qualificationName: PM Masters
    qualificationType: Other
    qualificationLink:
      label: TBD
      url: TBD
      status: needed
    gradeAchieved: TBD
    dateRange: TBD
    modulesOrFocusAreas: []
    howThisHelpedAsProductManager: TBD
    evidence: overall-structure-context.md
```

### Certifications

```yaml
certifications:
  - awardingBodyName: IBM
    awardingBodyLogo:
      title: IBM logo
      pathOrUrl: TBD
      altText: IBM logo
      type: logo
      status: needed
      sourceNotes:
    certificationName: AI Engineering Professional Certificate
    certificationLink:
      label: TBD
      url: TBD
      status: needed
    modulesIncluded: []
    dateAchieved: 2026
    howThisHelpedAsProductManager: Supports AI engineering literacy for AI-native product work.
    evidence: ramin-hoodeh-exp-context.md

  - awardingBodyName: Google AI School
    awardingBodyLogo:
      title: Google AI School logo
      pathOrUrl: TBD
      altText: Google AI School logo
      type: logo
      status: needed
      sourceNotes:
    certificationName: Professional Machine Learning Engineer
    certificationLink:
      label: TBD
      url: TBD
      status: needed
    modulesIncluded: []
    dateAchieved: 2026
    howThisHelpedAsProductManager: Supports machine-learning system literacy, evaluation thinking, and model-aware product decisions.
    evidence: ramin-hoodeh-exp-context.md

  - awardingBodyName: Google AI School
    awardingBodyLogo:
      title: Google AI School logo
      pathOrUrl: TBD
      altText: Google AI School logo
      type: logo
      status: needed
      sourceNotes:
    certificationName: Generative AI Leader Certification
    certificationLink:
      label: TBD
      url: TBD
      status: needed
    modulesIncluded: []
    dateAchieved: 2026
    howThisHelpedAsProductManager: Supports AI product leadership, model strategy, and organisational adoption.
    evidence: ramin-hoodeh-exp-context.md

  - awardingBodyName: Anthropic Academy
    awardingBodyLogo:
      title: Anthropic logo
      pathOrUrl: TBD
      altText: Anthropic logo
      type: logo
      status: needed
      sourceNotes:
    certificationName: MCP Protocols: Advanced Topics
    certificationLink:
      label: TBD
      url: TBD
      status: needed
    modulesIncluded: []
    dateAchieved: 2026
    howThisHelpedAsProductManager: Supports MCP integration literacy for AI-native product architectures and tool-connected workflows.
    evidence: ramin-hoodeh-exp-context.md

  - awardingBodyName: MBTi
    awardingBodyLogo:
      title: MBTi logo
      pathOrUrl: TBD
      altText: MBTi logo
      type: logo
      status: needed
      sourceNotes:
    certificationName: Leadership Development Programme
    certificationLink:
      label: TBD
      url: TBD
      status: needed
    modulesIncluded: []
    dateAchieved: 2024
    howThisHelpedAsProductManager: Supports leadership, stakeholder alignment, empathy, and team communication.
    evidence: ramin-hoodeh-exp-context.md
```

## 3. Personal Projects

### Reusable Project Fields

```yaml
project:
  projectName:
  category: selfware | tool
  projectType: App | Web App | Tool | Agent | Dashboard | Pipeline | Other
  mainPictureGif:
    title:
    pathOrUrl:
    altText:
    type: image | gif | video
    status:
    sourceNotes:
  secondaryPicture:
    title:
    pathOrUrl:
    altText:
    type: image | gif | video
    status:
    sourceNotes:
  briefDescription:
  technicalStack:
    - technology:
      roleInProject:
  domainExpertisePartner:
    appliesToSelfwareOnly: true
    name:
    picture:
      title:
      pathOrUrl:
      altText:
      type: image
      status:
      sourceNotes:
    shortBio:
  problemOneSentence:
  architectureOneSentence:
  whyThisApproachOneSentence:
  tradeoffsOneSentence:
  whatIWouldImproveOneSentence:
  liveLink:
    label:
    url:
    status:
  githubLink:
    label:
    url:
    status:
  fullWriteupLink:
    label:
    url:
    status:
  publicProof:
  privateNotes:
```

### Selfware

```yaml
selfware:
  - projectName: Qadam
    category: selfware
    projectType: App
    descriptor: autonomous trading agent
    briefDescription: A trading and personal intelligence app that ingests data from multiple APIs, including global tension mapping and tone analysis, to surface actionable insights and trading decisions.
    technicalStack:
      - technology: Multiple APIs
        roleInProject: Data ingestion
      - technology: Global tension mapping
        roleInProject: Market/context signal
      - technology: Tone analysis
        roleInProject: Sentiment/context signal
      - technology: Quantum computing backend via Q-CTRL or IBM
        roleInProject: Long-term direction
    domainExpertisePartner:
      appliesToSelfwareOnly: true
      name: TBD
      picture:
        title:
        pathOrUrl: TBD
        altText:
        type: image
        status: needed
        sourceNotes:
      shortBio: TBD
    problemOneSentence: Traders need richer context than price data alone, including global tensions and tone signals.
    architectureOneSentence: The app ingests multiple external APIs and processes global tension and tone signals into actionable trading insight.
    whyThisApproachOneSentence: A multi-signal intelligence layer can support better decisions than a single-market-data view.
    tradeoffsOneSentence: The breadth of signals increases data quality, weighting, and pipeline complexity.
    whatIWouldImproveOneSentence: Be specific about the data pipeline and future quantum-computing direction.
    liveLink:
      label: qadam.trade
      url: http://qadam.trade
      status: ready
    githubLink:
      label: GitHub
      url: TBD
      status: needed
    fullWriteupLink:
      label: Qadam Portfolio Write-Up
      url: Project Write-ups/Qadam - Portfolio Write-Up.md
      status: ready
    publicProof: Strongest section to lead with is Architecture.
    privateNotes:

  - projectName: Dreamsea
    category: selfware
    projectType: App
    descriptor: iOS app
    briefDescription: An AI-powered dream journaling and interpretation app built with Azin, drawing on Jungian, Freudian, Persian/Zoroastrian, Egyptian, and Japanese dream philosophy.
    technicalStack:
      - technology: AI interpretation
        roleInProject: Dream analysis
      - technology: iOS
        roleInProject: Mobile app platform
      - technology: Philosophical/cultural interpretation frameworks
        roleInProject: Interpretation layer
    domainExpertisePartner:
      appliesToSelfwareOnly: true
      name: Azin
      picture:
        title: Azin picture
        pathOrUrl: TBD
        altText: Azin
        type: image
        status: needed
        sourceNotes:
      shortBio: Domain expertise partner for Dreamsea; short bio TBD.
    problemOneSentence: People need a meaningful way to capture and interpret dreams across psychological and cultural traditions.
    architectureOneSentence: Dreamsea combines dream journaling with AI interpretation grounded in multiple dream-philosophy traditions.
    whyThisApproachOneSentence: Dreams are subjective and symbolic, so the product benefits from multiple interpretive lenses rather than a single generic answer.
    tradeoffsOneSentence: More interpretive depth can make output harder to keep concise and verifiable.
    whatIWouldImproveOneSentence: Make the demo URL/TestFlight/live link more prominent.
    liveLink:
      label: nsso.me/dreamsea
      url: http://nsso.me/dreamsea
      status: ready
    githubLink:
      label: GitHub
      url: TBD
      status: needed
    fullWriteupLink:
      label: Dreamsea Portfolio Write-up
      url: Project Write-ups/Dreamsea - Portfolio Write-up.md
      status: ready
    publicProof: Strongest sections to lead with are Problem and Tradeoffs.
    privateNotes:

  - projectName: nsso
    category: selfware
    projectType: Web App
    descriptor: web app
    briefDescription: A personal homepage creator that lets people discover and present different sides of themselves, personal and professional, in one efficient place online.
    technicalStack:
      - technology: Web app
        roleInProject: Product platform
      - technology: Glass-morphic design aesthetic
        roleInProject: Visual identity
    domainExpertisePartner:
      appliesToSelfwareOnly: true
      name: TBD
      picture:
        title:
        pathOrUrl: TBD
        altText:
        type: image
        status: needed
        sourceNotes:
      shortBio: TBD
    problemOneSentence: People need a better way to represent the many personal and professional sides of themselves online.
    architectureOneSentence: nsso structures identity into a personal homepage experience with distinct self-presentation surfaces.
    whyThisApproachOneSentence: A personal homepage can be more expressive and efficient than fragmented profiles across multiple platforms.
    tradeoffsOneSentence: Expressive identity design must balance beauty, clarity, and information density.
    whatIWouldImproveOneSentence: Add architecture depth on GitHub.
    liveLink:
      label: nsso
      url: TBD
      status: needed
    githubLink:
      label: GitHub
      url: TBD
      status: needed
    fullWriteupLink:
      label: nsso Portfolio Write-Up
      url: Project Write-ups/nsso - Portfolio Write-Up.md
      status: ready
    publicProof: Strongest section to lead with is Problem.
    privateNotes: Long-term vision includes the NY accelerator and Forbes 30-under-30.

  - projectName: RazinFlix
    category: selfware
    projectType: Web App
    descriptor: web app
    briefDescription: A curated personal film canon and watchlist project shared with Azin, exploring storytelling, cinema, visual language, and creative inspiration.
    technicalStack:
      - technology: Web app
        roleInProject: Curation experience
    domainExpertisePartner:
      appliesToSelfwareOnly: true
      name: Azin
      picture:
        title: Azin picture
        pathOrUrl: TBD
        altText: Azin
        type: image
        status: needed
        sourceNotes:
      shortBio: Creative/domain partner for film curation; short bio TBD.
    problemOneSentence: Mainstream streaming platforms cannot capture a truly personal taste or shared creative canon.
    architectureOneSentence: RazinFlix creates a private streaming-style curation experience around a personal film canon and watchlist.
    whyThisApproachOneSentence: A curated personal interface better reflects taste, meaning, and shared inspiration than generic recommendation feeds.
    tradeoffsOneSentence: A deeply personal curation product may be less broadly scalable than a generic watchlist.
    whatIWouldImproveOneSentence: Make at least one curated list publicly shareable.
    liveLink:
      label: RazinFlix
      url: TBD
      status: needed
    githubLink:
      label: GitHub
      url: TBD
      status: needed
    fullWriteupLink:
      label: RazinFlix Portfolio Write-up
      url: Project Write-ups/RazinFlix - Portfolio-Write-up.md
      status: ready
    publicProof: Strongest section to lead with is Problem.
    privateNotes:

  - projectName: 24Seven Concierge
    category: selfware
    projectType: App
    descriptor: iOS/Android app
    briefDescription: An AI concierge app: an always-on personal assistant that handles requests, research, and coordination around the clock.
    technicalStack:
      - technology: AI assistant
        roleInProject: Request handling and coordination
      - technology: iOS/Android
        roleInProject: Mobile app platform
    domainExpertisePartner:
      appliesToSelfwareOnly: true
      name: TBD
      picture:
        title:
        pathOrUrl: TBD
        altText:
        type: image
        status: needed
        sourceNotes:
      shortBio: TBD
    problemOneSentence: People need an always-on assistant for research, coordination, and practical requests.
    architectureOneSentence: The app packages AI request handling, research, and coordination into a mobile concierge experience.
    whyThisApproachOneSentence: A concierge metaphor makes AI assistance practical, service-oriented, and easy to understand.
    tradeoffsOneSentence: Broad concierge scope increases fulfilment complexity and reliability expectations.
    whatIWouldImproveOneSentence: Add demo URL or Loom walkthrough if not deployed.
    liveLink:
      label: 24Seven Concierge
      url: TBD
      status: needed
    githubLink:
      label: GitHub
      url: TBD
      status: needed
    fullWriteupLink:
      label: 24Seven Portfolio Write-up
      url: Project Write-ups/24Seven - Portfolio Write-up.md
      status: ready
    publicProof: Strongest section to lead with is Why This Approach.
    privateNotes:
```

### Tools

```yaml
tools:
  - projectName: AI Native Product OS
    category: tool
    projectType: Tool
    briefDescription: A full AI-native operating system for product work, structured as a 5-Layer Stack and AI Loop.
    technicalStack:
      - technology: 5-Layer Stack
        roleInProject: Model -> Context -> Orchestration -> Governance -> Human
      - technology: AI Loop
        roleInProject: Talk -> Decide -> Build -> Observe -> Iterate
      - technology: Udemy course
        roleInProject: Productised learning format
    problemOneSentence: Traditional PM frameworks were built for deterministic software, not probabilistic AI systems.
    architectureOneSentence: The OS combines Model, Context, Orchestration, Governance, and Human layers with a fast AI-native product loop.
    whyThisApproachOneSentence: AI product work needs a system that accounts for model capability, owned context, tool orchestration, guardrails, and human judgement.
    tradeoffsOneSentence: A fuller operating system creates more structure, but also requires teams to install governance and context deliberately.
    whatIWouldImproveOneSentence: Make the Udemy listing or landing page live before June 2026.
    liveLink:
      label: AI-Native Product OS
      url: https://www.notion.so/AI-Native-Product-OS-cfa6fe2ecf3783649ab68152765cc260?pvs=21
      status: ready
    githubLink:
      label: GitHub
      url: TBD
      status: needed
    fullWriteupLink:
      label: AI-Native Product OS write-up
      url: Project Write-ups/ai-native-product-os-ramins-ai-product-management-thesis.md
      status: ready
    publicProof: Strongest section to lead with is Why This Approach.
    plannedRelease: June 2026
    courseTitle: Transition from Product Manager to AI Product Manager

  - projectName: Mass Social Wisdom Agent
    category: tool
    projectType: Agent
    descriptor: multi-agent workflow
    briefDescription: Autonomous AI agent for social wisdom extraction and processing.
    technicalStack:
      - technology: Multi-agent workflow
        roleInProject: Social wisdom extraction and processing
    problemOneSentence: TBD - source says to make the manual task that broke first more personal.
    architectureOneSentence: A multi-agent workflow extracts and processes social wisdom from source material.
    whyThisApproachOneSentence: Multi-agent decomposition suits extraction, analysis, and synthesis tasks.
    tradeoffsOneSentence: Agent workflows can increase orchestration complexity and require guardrails around output quality.
    whatIWouldImproveOneSentence: Clarify the personal/manual workflow that motivated the tool.
    liveLink:
      label: TBD
      url: TBD
      status: needed
    githubLink:
      label: GitHub
      url: TBD
      status: needed
    fullWriteupLink:
      label: Mass Social Wisdom Agent Portfolio Write-up
      url: Project Write-ups/Mass Social Wisdom Agent - Portfolio Write-up.md
      status: ready
    publicProof: Strongest sections to lead with are Architecture and Tradeoffs.

  - projectName: AI Costs Dashboard
    category: tool
    projectType: Dashboard
    briefDescription: AI costs dashboard for nsso/Dreamsea APIs.
    technicalStack:
      - technology: API cost tracking
        roleInProject: Cost observability
    problemOneSentence: AI products need visibility into API costs as usage scales.
    architectureOneSentence: Dashboard tracks AI API cost data for nsso/Dreamsea usage.
    whyThisApproachOneSentence: Cost observability helps prevent runaway inference costs and supports product decision-making.
    tradeoffsOneSentence: Cost dashboards require reliable instrumentation and meaningful attribution.
    whatIWouldImproveOneSentence: TBD
    liveLink:
      label: TBD
      url: TBD
      status: needed
    githubLink:
      label: GitHub
      url: TBD
      status: needed
    fullWriteupLink:
      label: TBD
      url: TBD
      status: needed
    publicProof:

  - projectName: RAG Pipeline
    category: tool
    projectType: Pipeline
    descriptor: nsso/Dreamsea
    briefDescription: RAG pipeline for nsso/Dreamsea APIs.
    technicalStack:
      - technology: RAG
        roleInProject: Retrieval and context layer
      - technology: nsso/Dreamsea APIs
        roleInProject: Product integration
    problemOneSentence: AI apps need relevant context retrieval rather than generic model answers.
    architectureOneSentence: A retrieval-augmented pipeline connects nsso/Dreamsea APIs to contextual model responses.
    whyThisApproachOneSentence: RAG lets product-specific context improve AI output without relying only on base model knowledge.
    tradeoffsOneSentence: RAG quality depends on chunking, retrieval, ranking, evaluation, and observability.
    whatIWouldImproveOneSentence: TBD
    liveLink:
      label: TBD
      url: TBD
      status: needed
    githubLink:
      label: GitHub
      url: TBD
      status: needed
    fullWriteupLink:
      label: TBD
      url: TBD
      status: needed
```

## 4. Teaching, Speaking And Writing

### Teaching

```yaml
teaching:
  - courseTitle: Transition from Product Manager to AI Product Manager
    courseDescription: AI PM course productising the AI-Native Product OS and transition from traditional PM to AI-native product work.
    courseModules: []
    courseTrailer:
      title: AI PM course trailer
      pathOrUrl: TBD
      altText: AI PM course trailer
      type: video
      status: needed
      sourceNotes:
    courseLink:
      label: AI Product Manager Course
      url: http://link-coming-soon.com/
      status: needs-confirmation
    platform: Maven | Udemy
    tag: New
    plannedRelease: June 2026
    proof: overall-structure-context.md and ramin-hoodeh-exp-context.md
    privateNotes: Source mentions Maven link and Udemy packaging; confirm final platform.

  - courseTitle: The Fastest Way To Become A Product Manager
    courseDescription: Best-selling product course / full product development process course.
    courseModules: []
    courseTrailer:
      title: Product course trailer
      pathOrUrl: TBD
      altText: Product course trailer
      type: video
      status: needed
      sourceNotes:
    courseLink:
      label: Best-selling Product Course
      url: https://www.udemy.com/course/the-fastest-way-to-become-a-product-manager
      status: ready
    platform: Udemy
    tag: Highest-Rated
    proof: ramin-hoodeh-exp-context.md
    privateNotes: User calls this Full Product Development Process - Course; confirm final display title.
```

### Speaking

```yaml
speaking:
  - talkTitle: Existentially Viewing your Existential Crisis
    invitedBy: TEDx
    talkDescription: A talk reminding humanity of the beauty of our place in the cosmos using mindfulness and a universal perspective, to live a more harmonious and meaningful life.
    youtubeEmbedLink:
      label: TEDx Talk
      url: http://bit.ly/ramintedx
      status: ready
    eventDate: TBD
    location: TBD
    proof: ramin-hoodeh-exp-context.md and overall-structure-context.md
    privateNotes: Source labels strongest gap as demo URL / talk recording / speaker reel.

  - talkTitle: My Life Story
    invitedBy: University Talk
    talkDescription: TBD
    youtubeEmbedLink:
      label: University talk
      url: TBD
      status: needed
    eventDate: TBD
    location: TBD
    proof: overall-structure-context.md
    privateNotes:
```

### Writing: Books

```yaml
books:
  - bookName: The Proposition
    bookType: Fiction
    bookImage:
      title: The Proposition book image
      pathOrUrl: TBD
      altText: The Proposition book cover
      type: image
      status: needed
      sourceNotes:
    bookVideo:
      appliesTo: The Proposition only
      title: The Proposition book video
      pathOrUrl: TBD
      altText: The Proposition book video
      type: video
      status: needed
      sourceNotes:
    purchaseLink:
      label: Fiction Author / Amazon link
      url: https://www.amazon.co.uk/Purpose-Ramin-Hoodeh/dp/1527286185
      status: needs-confirmation
    previewLink:
      appliesTo: The Proposition only
      label: Preview
      url: TBD
      status: needed
    summaryLink:
      appliesTo: The Meaning of Life only
      label:
      url:
      status:
    fullText:
      appliesTo: The Meaning of Life only
      pathOrUrl:
      status:
    bookDescriptionBlurb: A spiritual fiction novel distilling years of metaphysical enquiry into a story about philosophy, consciousness, and the nature of reality.
    strongestSectionToLeadWith: Problem - years of metaphysical enquiry distilled into story.
    privateNotes: Source says long-term ambitions include bestseller and anime movie adaptation. Amazon link text says Fiction Author but URL slug says Purpose; confirm final book title/link.

  - bookName: The Meaning of Life
    bookType: Metaphysics
    bookImage:
      title: The Meaning of Life book image
      pathOrUrl: TBD
      altText: The Meaning of Life book cover
      type: image
      status: needed
      sourceNotes:
    bookVideo:
      appliesTo: The Proposition only
      title:
      pathOrUrl:
      altText:
      type: video
      status:
      sourceNotes:
    purchaseLink:
      label: TBD
      url: TBD
      status: needed
    previewLink:
      appliesTo: The Proposition only
      label:
      url:
      status:
    summaryLink:
      appliesTo: The Meaning of Life only
      label: Summary
      url: TBD
      status: needed
    fullText:
      appliesTo: The Meaning of Life only
      pathOrUrl: TBD
      status: needed
    bookDescriptionBlurb: TBD
    privateNotes: Not directly detailed in source files beyond related metaphysics themes.
```

### Writing: Metaphysics Articles

```yaml
metaphysicsArticles:
  - articleTitle: Framework of Metacognition
    articleContent: A way of thinking about thinking - organising stories, pitches, frameworks, and related information into a coherent inner architecture.
    articleSubHeadings: []
    articleDiagram:
      title: Stratetree image
      pathOrUrl: TBD
      altText: Framework of Metacognition diagram
      type: diagram
      status: needed
      sourceNotes: User requested stratetree image.
    link:
      label: Metacognition
      url: Project Write-ups/Framework of Metacognition.md
      status: ready
    privateNotes:

  - articleTitle: Framework of Reality
    articleContent: Foundational thinking exploring existence, the meaning of life, purpose, and how we should think and act.
    articleSubHeadings: []
    articleDiagram:
      title: Framework of Reality diagram
      pathOrUrl: TBD
      altText: Framework of Reality diagram
      type: diagram
      status: needed
      sourceNotes:
    link:
      label: TBD
      url: TBD
      status: needed
    privateNotes: Source says Framework of Reality course is not included in AI PM portfolio, but user requested Framework of Reality as an article; confirm inclusion.
```

### Writing: AI Native Product OS

```yaml
aiNativeProductOs:
  problemOneSentence: Traditional PM frameworks were built for deterministic software, not probabilistic AI systems.
  architectureOneSentence: A 5-Layer Stack (Model -> Context -> Orchestration -> Governance -> Human) and AI Loop (Talk -> Decide -> Build -> Observe -> Iterate) for AI-native product work.
  whyThisApproachOneSentence: AI-native products need model capability, owned context, tool orchestration, governance, and human judgement working as one system.
  tradeoffsOneSentence: The framework adds structure and governance overhead, but reduces risk when building probabilistic systems.
  whatIWouldImproveOneSentence: Finalise the public diagram, course landing page, and live proof before the planned June 2026 release.
  liveLink:
    label: AI-Native Product OS
    url: https://www.notion.so/AI-Native-Product-OS-cfa6fe2ecf3783649ab68152765cc260?pvs=21
    status: ready
  githubLink:
    label: GitHub
    url: TBD
    status: needed
  fullWriteupLink:
    label: AI Native Product OS write-up
    url: Project Write-ups/ai-native-product-os-ramins-ai-product-management-thesis.md
    status: ready
  diagrams:
    - title: 5-Layer Stack
      pathOrUrl: TBD
      altText: Model, Context, Orchestration, Governance, Human
      type: diagram
      status: needed
      sourceNotes:
    - title: AI Loop
      pathOrUrl: TBD
      altText: Talk, Decide, Build, Observe, Iterate
      type: diagram
      status: needed
      sourceNotes:
```

### Writing: Project Case Studies

```yaml
caseStudies:
  - projectName: Qadam
    writeupTitle: Qadam Portfolio Write-Up
    fullWriteupLink:
      label: Qadam Portfolio Write-Up
      url: Project Write-ups/Qadam - Portfolio Write-Up.md
      status: ready

  - projectName: Dreamsea
    writeupTitle: Dreamsea Portfolio Write-up
    fullWriteupLink:
      label: Dreamsea Portfolio Write-up
      url: Project Write-ups/Dreamsea - Portfolio Write-up.md
      status: ready

  - projectName: nsso
    writeupTitle: nsso Portfolio Write-Up
    fullWriteupLink:
      label: nsso Portfolio Write-Up
      url: Project Write-ups/nsso - Portfolio Write-Up.md
      status: ready

  - projectName: RazinFlix
    writeupTitle: RazinFlix Portfolio Write-up
    fullWriteupLink:
      label: RazinFlix Portfolio Write-up
      url: Project Write-ups/RazinFlix - Portfolio-Write-up.md
      status: ready

  - projectName: 24Seven Concierge
    writeupTitle: 24Seven Portfolio Write-up
    fullWriteupLink:
      label: 24Seven Portfolio Write-up
      url: Project Write-ups/24Seven - Portfolio Write-up.md
      status: ready

  - projectName: Mass Social Wisdom Agent
    writeupTitle: Mass Social Wisdom Agent Portfolio Write-up
    fullWriteupLink:
      label: Mass Social Wisdom Agent Portfolio Write-up
      url: Project Write-ups/Mass Social Wisdom Agent - Portfolio Write-up.md
      status: ready
```

## 5. Contact CTA

```yaml
contactCta:
  artisticHeroText: "CLARITY . JUDGEMENT . TASTE . EMPATHY . VISION"
  hook: Do you have a role in mind?
  headline: Let's create beautiful things that the world really needs
  ctaButtons:
    - type: email
      label: raminhoodeh@gmail.com
      href: mailto:raminhoodeh@gmail.com
      status: ready
    - type: whatsapp
      label: WhatsApp
      href: TBD
      status: needed
  socialLinks:
    - platform: LinkedIn
      label: LinkedIn
      url: http://bit.ly/raminlinkedin
      status: ready
    - platform: GitHub
      label: GitHub
      url: https://github.com/raminhoodeh
      status: ready
    - platform: Old Portfolio
      label: ramin.vision
      url: http://www.ramin.vision/
      status: ready
```

## 6. Bonus Section

```yaml
bonus:
  hook: Congratulations, you've reached the bonus section!
  body: As a reward for making it this far, click the magical rock 3 times to reveal 4 incredible gifts...
  trigger:
    elementName: Exploding magical rock
    elementDescription: 3D WebGL exploding rock element from the original Ventures website scrape.
    interaction: Click 3 times to explode/reveal gifts.
    asset:
      title: Exploding rock 3D model
      pathOrUrl: gl/global/rocks.glb
      altText: Magical 3D rock
      type: 3d-model
      status: ready
      sourceNotes: Asset exists in repository.
  gifts:
    - title: 100% coupon code for new AI PM Course
      displayText: AIPMFUTURE
      link:
        label: AI PM Course
        url: TBD
        status: needed
      instructions: Use coupon code AIPMFUTURE.
    - title: 30 minute AI Product consultation
      displayText:
      link:
        label: Google Meet Link
        url: TBD
        status: needed
      instructions: TBD
    - title: Lifetime membership to Dreamsea dream interpretation app
      displayText: iloverazin
      link:
        label: Dreamsea
        url: http://nsso.me/dreamsea
        status: ready
      instructions: Download and enter iloverazin as your username to activate the secret lifetime access.
    - title: AI Tools Database
      displayText: Organised list of over 350 AI tools, categorised by use case.
      link:
        label: Spreadsheet
        url: TBD
        status: needed
      instructions:
```

## 7. AI Ramin Chatbot

```yaml
aiRaminChatbot:
  status: coming soon
  modalTitle: AI Ramin
  floatingLauncher: true
  profilePicture:
    title: Ramin profile picture
    pathOrUrl: src/assets/ramin-profile-nav.webp
    altText: Ramin Hoodeh
    type: image
    status: ready
    sourceNotes: File exists in app assets and is used in current AI Ramin UI.
  purpose: User can paste in a job or project and see what approach Ramin would bring.
  textarea:
    label: Paste in a job or project
    placeholder: Paste a job description, project brief, or problem statement.
  modelSelector:
    - Claude Sonnet
    - Gemini Pro
    - Deepseek
    - GPT 5.5
  guardrails:
    - Be truthful to Ramin's skills and experience.
    - Separate verified proof from inference.
    - Do not expose confidential company or client information.
    - Do not invent metrics, links, roles, grades, logos, reviews, videos, or partner bios.
  answerModes:
    - modeName: Job fit
      description: Explain how Ramin would approach a role using verified experience.
    - modeName: Project approach
      description: Explain how Ramin would approach a project using his AI PM toolkit.
  privateNotes: Aesthetic placeholder for now.
```

## Skills And Tools Source List

```yaml
skillsAndTools:
  aiProduct:
    - LLM model selection and routing
    - Prompt engineering and system prompt design
    - Context Layer architecture
    - RAG
    - Memory
    - MCP integration
    - Eval suite design and continuous evaluation
    - Guardrails and AI safety implementation
    - Input/output classifiers
    - Refusal layers
    - AI observability and tracing
    - Fallback and failure mode design
    - Agent orchestration and workflow automation
    - AI-Native Loop execution
    - Rapid AI prototyping
    - Plain-English data querying via MCP
    - Exposure surface and risk management
    - Intelligence management
  productManagement:
    - UX wireframing
    - Data analytics
    - Road-mapping
    - Feature prioritisation
    - User science
    - A/B testing
    - User acceptance testing
    - Agile and lean product development
    - Specification and scope documentation
    - User story writing
    - ESG regulation
    - Process improvement
    - B2B and B2C sales
    - Public speaking
    - Leadership
    - Empathy
    - Judgment and product taste
  tools:
    - Asana
    - Jira
    - Monday.com
    - Azure DevOps
    - GitHub
    - Trello
    - Figma
    - Adobe Photoshop
    - Adobe XD
    - Excel VBA Macro
    - Typeform
    - Google Analytics
    - Firebase
    - Miro
  favouriteAiTools:
    label: Full list of my favourite AI tools
    url: https://docs.google.com/document/d/1jrt7pojR8eUTcejwCDPQUHIFRpvWcOCLGoBy01Lh3Qk/edit?usp=sharing
    status: ready
```

## Not Included In AI PM Portfolio

These were present in `overall-structure-context.md` but marked as not appropriate for this portfolio.

```yaml
excludedProjects:
  - name: PDFs & Databases
    reason: Not appropriate for AI PM portfolio use case.
    notes: Digital PDF products across Gumroad, Payhip, and Etsy.
  - name: Ultimate LLM Context Database
    reason: Not appropriate for AI PM portfolio use case.
    notes: Standalone curated intelligence database.
  - name: Personal Brand
    reason: Not appropriate for AI PM portfolio use case.
    notes: Instagram, LinkedIn, TikTok personal brand work.
  - name: Framework of Reality Course
    reason: Not appropriate for AI PM portfolio use case, although Framework of Reality article inclusion needs confirmation.
```

## Fill Priority

1. Confirm whether Urgentem should be included in the Experience section.
2. Add company logos, locations, product videos, and approved public-safe copy.
3. Add reviews/testimonials with permission status.
4. Add project screenshots/GIFs, GitHub links, and live links.
5. Add qualification/certification proof links and modules.
6. Add teaching/speaking media links.
7. Confirm book title/link mismatch for The Proposition / Purpose Amazon link.
8. Add WhatsApp deep link, Google Meet link, AI tools spreadsheet link, and AI PM course coupon destination.
