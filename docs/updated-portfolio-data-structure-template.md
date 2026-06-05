# Portfolio Data Structure Template

Populated with inspiration from:

- `ramin-hoodeh-exp-context.md`
- `overall-structure-context.md`
- 'Ramin Hoodeh, manual entry'

Use this document as the content intake template before anything is moved into `src/data/portfolio.ts`.
This is the absolute source of truth for any content on the website. 

Rules:

- `TBD` means the source files did not provide the detail.
- `needs-confirmation` means the detail is plausible from the source files but should be checked before publishing.
- Everything in this template is intended as website content unless it is inside `privateNotes`.
- `privateNotes` is the only non-public field. Use it for context, caveats, or source notes that should not be displayed on the website.
- Product items should stay simple: `name`, `description`, optional `links`, optional `privateNotes`.
- Company impact belongs at the company/job-role level, not inside each product.

## Field Conventions

```yaml
productsWorkedOnItem:
  name:
  description:
  links:
    - label:
      url:
      status: ready | needed | broken | needs-confirmation
  privateNotes:

companyImpact:
  -

asset:
  title:
  pathOrUrl:
  altText:
  type: image | gif | video | logo | diagram | document | spreadsheet | 3d-model
  status: ready | needed | optional | needs-confirmation
  sourceNotes:

link:
  label:
  url:
  status: ready | needed | broken | needs-confirmation

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
  identityLine: Product [Manager/Engineer/Teacher] and Fiction Author
  headline: I use AI to research, design, and build AI-native features every single day.
  profilePicture:
    title: Ramin profile picture
    pathOrUrl: ramin-hoodeh-profile-pic.png
    altText: Ramin Hoodeh
    type: image
    sourceNotes: File exists in repository root.
    label: My Product Thesis
    target: AI-Native Product OS full screen page
    links:
      - label: AI-Native Product OS
        url: Go to AI-Native Product OS full screen page in website, under "Thoughts" section
      - label: Say hi ->
        url: Go to contact me section

```

## 2. Experience And Education

```yaml
experienceEducation:
  intro: 8+ years of proven experience in complex product environments across fintech, climate, geospatial and e-commerce sectors at start-ups, SMEs, governments and corporates. 
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
      sourceNotes: Provided in company-videos folder.
    companyLink:
      label: Bayut
      url: https://www.bayut.com/
      status: ready
    location: Dubai, UAE
    dateRange:
      startMonth: Jan
      startYear: 2026
      endMonth: Present
      endYear: Present
      displayLabel: Jan 2026 - Present
    jobTitle: AI Product Manager
    companyDescription: Bayut is the market-leading property website in the UAE, that connects buyers, sellers, landlords, tenants and agents. Our website hosts listings for properties in the UAE with extensive inventory from more than 3,500 agencies.
    industryTags:
      - PropTech SaaS
      - eCommerce
    productsWorkedOn:
      - name: Bayut web, Bayut App, Profolio app
        description: Bespoke property listing management platform for UAE real estate agents registered on Bayut, alongside AI-native property search features.
    impact:
      - [Confidential] Built AI-native property search features with model selection, eval suite design, guardrails, and MCP integration - supporting property search, recommendations, and insights from conversational AI.
    processesIntroducedManagerial:
      - processName: AI-Native Product OS
        description: I introduced my AI-native Product OS to the wider product team, creating a shared context layer that helped PMs to integrate greater design and engineering into their work, moving from idea to workable prototypes faster, synthesize user insights more effectively and spot dependencies with greater speed and clarity.
    businessModel:
      - B2B
      - B2C
    customersClientTypes:
      - clientType: Property seekers, Property Owners, Real Estate Brokers

  - companyName: SIDE.inc
    companyLogo:
      title: SIDE logo
      pathOrUrl: "company-logos/side logo.png"
      altText: SIDE logo
      type: logo
      status: ready
      sourceNotes: Provided in company-logos folder.
    productVideo:
      title: SIDE product video
      pathOrUrl: provided in company-videos folder
      altText: SIDE product video
      type: video
      status: needed
      sourceNotes:
    companyLink:
      label: Side.inc
      url: https://www.side.inc/
      status: ready
    location: London, UK
    dateRange:
      startMonth: Mar
      startYear: 2025
      endMonth: Aug
      endYear: 2025
      displayLabel: Mar 2025 - Aug 2025
    jobTitle: Senior Product Manager
    companyDescription: Side (side.inc) is a global game development and services provider that delivers technical and creative solutions to major video game studios worldwide
    industryTags:
      - Audio
      - ERP
    productsWorkedOn:
      - name: AI-engineered in-house ERP alternatives, Windsurf integration, Microsoft Enterprise Copilot with core ERP
        description: Replaced multiple internal ERP products with AI-coded in-house alternatives to reduce operational cost and improve speed from idea to feature. Integrated AI coding copilot workflows into engineering practice. Connected siloed Finance, Operations, and Sales data with Microsoft Enterprise Copilot and core ERP systems for leadership insight.
        privateNotes:
    impact:
      - Reduced ERP operational costs by 20% over 4 months.
      - Decreased idea-to-feature time by 90% for internal process improvement.
      - Shifted engineering resources from 60% Maintenance / 40% Innovation to 40% Maintenance / 60% Innovation.
      - Eliminated 30% of manual reporting overhead through Microsoft Enterprise Copilot and ERP integration.
    processesIntroducedManagerial:
      - processName: Internal Forward Deployment Engineer
        description: Global point of contact for employees to explore and request new AI or automation tools across the organisation. Responsible for corporate GPT rollout and integration.
    businessModel:
      - B2B
    customersClientTypes:
      - clientType: Global SIDE.inc team across London, Paris and LA.

  - companyName: Perkbox Vivup
    companyLogo:
      title: Perkbox Vivup logo
      pathOrUrl: TBD
      altText: Perkbox Vivup logo
      type: logo
      status: in company logos folder
    productVideo:
      title: Vivup App product video
      pathOrUrl: TBD
      altText: Vivup App product video
      type: video
      status: needed
      sourceNotes: In company videos folder
    companyLink:
      label: Website
      url: https://www.perkbox.com/
      status: ready
    location: London, UK
    dateRange:
      startMonth: Jan
      startYear: 2023
      endMonth: Nov
      endYear: 2024
      displayLabel: Jan 2023 - Nov 2024
    jobTitle: Senior Product Manager
    companyDescription: Perkbox is a global employee benefits and rewards platform. It provides companies with a centralized app to help motivate, celebrate, and care for their teams.
    industryTags:
      - Employee Benefits SaaS
    productsWorkedOn:
      - name: Highfive Recognition App, FamilyCare
        description: The Vivup Highfive Recognition and Reward app enables continuous appreciation through a simple recognition experience aligned with company values. FamilyCare is the first platform in the UK that allows employees to utilize salary sacrifice to pay for childcare costs. 
    impact:
      - Improved the App gateway experience through qualitative user research and UX iteration.
      - Increased Google Play Store rating by 0.6 and iPhone App Store rating by 1.2 within 3 months.
      - Grew product customer lifetime value by 19% over 5 months.
      - Decreased order form and checkout abandonment rate by 1/3 within the first month of delivery.
    businessModel:
      - B2B2C
    customersClientTypes:
      - clientType: HR Leaders, Ministry of Justice Employees

  - companyName: WPP Media
    companyLogo:
      title: WPP Media logo
      pathOrUrl: "company-logos/wpp-media-logo"
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
      url: https://www.wppmedia.com/
      status: needed
    location: TBD
    dateRange:
      startMonth: Jan
      startYear: 2022
      endMonth: Dec
      endYear: 2022
      displayLabel: Jan 2022 - Dec 2022
    jobTitle: Product Manager
    companyDescription: [Formerly GroupM] WPP Media is WPP's global media collective, built for the AI era. It unifies data, technology, and human expertise to deliver measurable outcomes and intelligent growth for brands in over 80 markets.
    industryTags:
      - Climate
      - AdTech
    productsWorkedOn:
      - name: Carbon Calculator
        description: The media sector's most widely used carbon calculation tool, comparing the CO2 emissions of over 7 types of physical and digital formats. Providing intelligent recommendations on high advertisement reach against environmental impact for global brands. 
        privateNotes:
      - name: Product Innovation Process
        description: 
        privateNotes:
    impact:
      - Translated EY's carbon emissions methodology with over 300+ dataset variables and 20+ climate APIs into product specifications for a worlds-first media carbon calculator.
      - Carbon Calculator measured the environmental impact of GBP 1bn+ of media investment in 2022, remaining the most widely used calculator in the media sector.
    processesIntroducedManagerial:
      - processName: Product Innovation Process
        description: Managed product strategy and mentored junior PMs and engineers. Implemented my Product Innovation process used to define manage the product division of WPP Media's Global Innovation Group.
    businessModel:
      - B2B
    customersClientTypes:
      - clientType: Media investment teams, sustainability stakeholders
      - label: Carbon Calculator reference
        url: https://www.mi-3.com.au/20-07-2022/carbon-footprint-different-media-distribution-options-will-increasingly-influence-where


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
      url: https://www.coxautoinc.com/
      status: needed
    location: London, UK
    dateRange:
      startMonth: Sept
      startYear: 2021
      endMonth: Dec
      endYear: 2021
      displayLabel: Sept 2021 - Dec 2021
    jobTitle: Product Owner [Contract]
    companyDescription: Cox Automotive is a global automotive services and technology company that provides digital marketing, wholesale auction, software, and financial services to automobile dealers, manufacturers, and consumers.
    industryTags:
      - Automotive SaaS
    productsWorkedOn:
      - name: Manheim Express 
        description: Manheim Express is a digital B2B auction platform designed for commercial used car trading with an industry-first auction monetization functionality for dealers. 
    impact:
- Introduced a feature scoring framework that turned a large, ambiguous auction-platform backlog into a ranked delivery roadmap.
  - Reduced stakeholder feedback cycles by 50% by creating clearer acceptance criteria, decision records, and prioritisation rituals.
  - Improved roadmap confidence by tying backlog decisions to manufacturer needs, user evidence, commercial value, and delivery complexity.
    processesIntroducedManagerial:
      - processName: Product Decision Matrix
        description: A qualitative and data-driven approach to prioritising a large feature backlog. Qualitative and data-driven framework for feature alignment and prioritisation.
        Access: https://docs.google.com/spreadsheets/d/19unnxIX1GxI9PXj-Xsu7_q19W6Qy03Ae/edit?usp=sharing&ouid=110264933146795409149&rtpof=true&sd=true 
    businessModel:
      - B2B
    customersClientTypes:
      - clientType: Automotive manufacturers, Automotive Dealerships

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
      - Geospatial
      - Climate
    productsWorkedOn:
      - name: OS Maps API on Microsoft Power Platform, Sustainability applications of geospatial data
        description: The OS Places API provides a detailed view of an address and its life cycle. Created new product concepts using geospatial intelligence for positive impact across energy, infrastructure, defence, and space sector clients.
        privateNotes:
    impact:
      - Defined and launched the first geospatial API product on Microsoft's Power Platform.
      - Increased geospatial data utilisation by 30% across 2 key accounts by Q3 2021.
      - Led twelve discovery workshops for  client stakeholders, validating 3 product concepts approved for further investment.
      - Improved energy clients' ability to forecast carbon impacts on asset valuations by 25% within 6 months.
    processesIntroducedManagerial:
      - processName: "Rapid Design" Sprint
        description: Created and implemented cross-functional "rapid design" sprints that turned sustainability discovery into sector-specific geospatial propositions with a clear innovation roadmap for launch. 
    businessModel:
      - Government
    customersClientTypes:
      - clientType: National energy, Infrastructure, Defence & Space sector clients
   
    links:
      - label: OS Maps API
        url: https://docs.microsoft.com/en-gb/connectors/ordnancesurveyplaces/
        status: ready
    reviews: []

  - companyName: Urgentem
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
    location: London, UK
    dateRange:
      startMonth: Oct
      startYear: 2019
      endMonth: Nov
      endYear: 2020
      displayLabel: Oct 2019 - Nov 2020
    jobTitle: Product Manager
    companyDescription: Climate risk analytics platform company helping investors measure and navigate climate-related risks and opportunities.
    industryTags:
      - Fintech
      - SaaS
    productsWorkedOn:
      - name: Element6
        description: Climate risk platform for investors with portfolio and company-level scenario analysis, forward-looking metrics, and tools for holistic management of climate-related risks and opportunities.
        privateNotes:
    impact:
      - Co-managed development and start-up launch of [now acquired] Element6, a climate risk platform for investors.
      - Helped reduce climate-related risk by 20% across client portfolios totalling GBP 900m in AUM.
      - Featured in the Financial Times.
      - Improved Demo-to-Buy conversion rate by 30% over 4 months and reduced quarterly churn by 25%.
      - Increased ratio of story point development to feature usage by 25% over 8 months.
    processesIntroducedManagerial:
      - processName: Sprint planning & SCRUM setup
        description: Introduced sprint planning to early founding team to prioritize and implement agile and prioritization best practices. 
    businessModel:
      - B2B
    customersClientTypes:
      - clientType: Central bank
        namedClients:
          - European Central Bank, Ilmarinen, Folksam, Pension and investment organisations
        sourceOrConfidence: Financial Times link: https://www.ft.com/content/7b734848-1287-4106-b866-7d07bc9d7eb8

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
      url: http://www.deity.ai/
      status: ready
    location: London, UK
    dateRange:
      startMonth: Jul
      startYear: 2017
      endMonth: Oct
      endYear: 2019
      displayLabel: Jul 2017 - Oct 2019
    jobTitle: Product Manager
    companyDescription: Deity is a social impact start-up that recommends people and places to work remotely from, using a conversational mediator to help users move into deeper collaboration.
    industryTags:
      - Social Networking
    productsWorkedOn:
      - name: Circles by Deity, Deity conversational chatbot mediator
        description: Product recommending people and places to work remotely from, in partnership with local cafes and co-working spaces. 
        description: Conversational mediator that helps users skip small talk, reach more meaningful dialogue, and receive relevant place recommendations to meet and collaborate. Built a recommendation experience for remote workers to discover relevant people and places to work from.
        privateNotes:
    impact:
      - Increased footfall from partnering venues by 15% over a sustained period of 7 months. 
      - Improved chat retention rate by over 50% in first 3 months after "Deity mediator" release.
    businessModel:
      - B2B
      - B2C
    customersClientTypes:
      - clientType: Hospitality SMEs, Digital nomad
    links:
      - label: Conversation mediator chatbot demo
        url: https://drive.google.com/file/d/19Ln-UWxReuAFTFdDc4JBZHdDxzeBPmwt/view?usp=sharing
        status: ready

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
    companyDescription: ERM is the world's leading sustainability consultancy, helping organizations manage risk, improve performance, and accelerate the transition to a sustainable future.
    industryTags:
      - Climate
    productsWorkedOn: [not product, this role was research]
      - name: DISC European Commission research project
        description: Research identifying the social risks and benefits associated with the life cycle of new solar products, specifically double-side contacted cells with innovative carrier-selective contacts.
        privateNotes: User clarified this is a research paper, not a product.
        privateNotes:
    impact:
      - Co-authored European Commission-funded research on the social risks and benefits of new solar product lifecycles.
      - Assessed socio-economic value and value-chain benefits created by new solar product innovation in Europe.
      - Identified satellite-data use cases for environmental risk detection, including detecting copper mines at risk of leaking waste into waterways.
      - Improved partner RepRisk product offering revenue by 10% over 6 months.
    processesIntroducedManagerial: []
    businessModel:
      - B2B
    customersClientTypes:
      - clientType: Institute for Solar Energy Research
        numberOfUsers: TBD
        sourceOrConfidence: user-provided
      - clientType: European Commission
        sourceOrConfidence: user-provided
    links:
      - label: European Commission research paper
        url: https://ec.europa.eu/research/participants/documents/downloadPublic?documentIds=080166e5c80d5f80&appId=PPGMS

  - companyName: Tesla
    companyLogo:
      title: Tesla logo
      pathOrUrl: "company-logos/tesla logo.png"
      altText: Tesla logo
      type: logo
      status: ready
      sourceNotes: Provided in company-logos folder.
    companyLink:
      label: Tesla reference link
      url: http://www.tesla.com
      status: ready
    location: London, UK & Amsterdam, Netherlands
    dateRange:
      startMonth: Apr
      startYear: 2017
      endMonth: Sept
      endYear: 2018
      displayLabel: Apr 2017 - Sept 2018
    jobTitle: Senior Product Specialist
    companyDescription: Tesla is an American automotive and clean energy company that designs, manufactures, and sells electric vehicles, battery energy storage systems, and solar energy products to accelerate the world's transition to sustainable energy.
    industryTags:
      - Energy
- Automotive
    productsWorkedOn:
      - name: Tesla app 3.23 Power Flow
        description: Tesla app update introducing Power Flow, allowing users to see whether home electricity is coming from the grid, solar installation, or Powerwall, and set preferences to optimise for energy independence, outage protection, or savings.
    impact:
      - Worked around Tesla's energy product experience, including Power Flow visibility for grid, solar, and Powerwall energy usage.
      - Ideated and initiated a Tesla / SpaceX marketing campaign through direct communication with the CEO, leading to more than double the attendance of Owners Orientation events in Q1-Q3 2018
      - Averaged 120% performance on Tesla Model S sales target from Q3 2017 to Q2 2018.
      - Sold the first Tesla Powerwall to a residential customer in the UK.
    businessModel:
      - B2C, B2B
    customersClientTypes:
      - clientType: Commercial & Residential property owners and Drivers
   
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
    howThisHelpedAsProductManager: Trained me to think like a systems-led Product Manager: understanding the real-world problem first, then applying the right technology in a way that is practical, measurable, and environmentally meaningful.

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
    howThisHelpedAsProductManager: Built commercial, customer, positioning, and go-to-market strategy theory. With a thesis on consumer behaviour, my research focused on the of why people buy products, translating 
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
      sourceNotes: Add IBM logo or certificate badge when available.
    certificationName: AI Engineering Professional Certificate
    certificationLink:
      label: TBD
      url: TBD
      status: needed
    modulesCovered:
      - Classical machine learning with Python
      - Deep learning with Keras, TensorFlow, and PyTorch
      - Neural networks
      - Transformer architectures and LLM data preparation
      - Generative AI fine-tuning
      - RAG, LangChain, and AI agents
      - Generative AI application development
    dateAchieved: 2026
    howThisHelpedAsProductManager: Helped me turn AI ideas into real product architecture. On nsso, it shaped the chatbot/profile coach concept: treating profile data, RAG, retrieval, and reviewed profile mutations as product infrastructure rather than just chatbot copy. In Dreamsea, the same thinking helped me design dream interpretation as a model pipeline - capture, transcription, interpretation, symbol extraction, and image generation - where model behaviour and context quality shape the user experience. For Mass Social Wisdom Agent, it informed the multi-step agent orchestration, RAG/LangChain-style workflow, and generated document output as a reliable system.
    evidence: ramin-hoodeh-exp-context.md

  - awardingBodyName: Google AI School
    awardingBodyLogo:
      title: Google AI School logo
      pathOrUrl: TBD
      altText: Google AI School logo
      type: logo
      status: needed
      sourceNotes: Add Google AI School logo or certification badge when available.
    certificationName: Professional Machine Learning Engineer
    certificationLink:
      label: TBD
      url: TBD
      status: needed
    modulesCovered:
      - Google Cloud AI and machine learning foundations
      - Data preparation and feature engineering
      - BigQuery ML and Vertex AI notebooks
      - TensorFlow and Keras model development
      - Production ML systems
      - MLOps, model evaluation, and monitoring
      - Generative AI applications
      - Responsible AI, fairness, bias, interpretability, privacy, and safety
    dateAchieved: 2026
    howThisHelpedAsProductManager: Helped me bring production ML discipline into my current AI Product Manager role. It informs how I approach model evaluation, automation, and quality checks for AI property search, recommendations, and conversational AI: not just whether the feature works in a demo, but whether the data is ready, outputs can be evaluated, latency is acceptable, failures are observable, and the model is improving the business/user outcome. It also supports my product judgement around AI Costs Dashboard and RAG Pipeline work, where monitoring, attribution, and evaluation matter as much as generation quality.
    evidence: ramin-hoodeh-exp-context.md

  - awardingBodyName: Google AI School
    awardingBodyLogo:
      title: Google AI School logo
      pathOrUrl: TBD
      altText: Google AI School logo
      type: logo
      status: needed
      sourceNotes: Add Google AI School logo or certification badge when available. Modules need confirmation from certificate transcript.
    certificationName: Generative AI Leader Certification
    certificationLink:
      label: TBD
      url: TBD
      status: needed
    modulesCovered:
      - Generative AI strategy
      - AI product opportunity framing
      - Organisational AI adoption
      - Responsible AI leadership
      - Value, risk, and governance tradeoffs
      - Human-in-the-loop AI workflows
    dateAchieved: 2026
    howThisHelpedAsProductManager: Helped me decide how generative AI should behave inside a product, not just where to add it. In 24Seven Concierge, that meant designing an experience where AI can generate itineraries and recommendations, while the human concierge remains part of the fulfilment and trust layer. In Dreamsea, it translated into guardrails for dream interpretation generation: the output needs to feel reflective, safe, and tonally careful rather than acting like an unconstrained oracle. In my current AI PM work, it helps me frame where AI should automate, where humans should review, and how to lead teams through that tradeoff.
    evidence: ramin-hoodeh-exp-context.md

  - awardingBodyName: Anthropic Academy
    awardingBodyLogo:
      title: Anthropic logo
      pathOrUrl: TBD
      altText: Anthropic logo
      type: logo
      status: needed
      sourceNotes: Add Anthropic Academy logo or credential badge when available.
    certificationName: MCP Protocols: Advanced Topics
    certificationLink:
      label: TBD
      url: TBD
      status: needed
    modulesCovered:
      - Core MCP features
      - Sampling
      - Log and progress notifications
      - Roots
      - JSON message types
      - STDIO transport
      - StreamableHTTP transport
      - Stateful MCP communication
      - MCP client-server architecture
    dateAchieved: 2026
    howThisHelpedAsProductManager: Helped me understand how to design AI products that connect to tools, not just chat interfaces. Practically, that applies to MCP-connected workflows such as connecting an AI assistant into Figma for nsso design work, allowing product or operational data to be queried in plain English, and designing controlled tool access where an AI agent can propose or retrieve information without being allowed to act unsafely. It also maps onto the nsso chatbot profile mutation flow, where the AI can suggest profile changes, but review, permissions, and user confirmation must sit around the tool call.
    evidence: ramin-hoodeh-exp-context.md

  - awardingBodyName: MBTi
    awardingBodyLogo:
      title: MBTi logo
      pathOrUrl: TBD
      altText: MBTi logo
      type: logo
      status: needed
      sourceNotes: Add MBTi logo or programme proof when available. Modules need confirmation from programme materials.
    certificationName: Leadership Development Programme
    certificationLink:
      label: TBD
      url: TBD
      status: needed
    modulesCovered:
      - Leadership self-awareness
      - Communication styles
      - Team motivation
      - Stakeholder alignment
      - Empathy and conflict awareness
      - Decision-making in groups
    dateAchieved: 2024
    howThisHelpedAsProductManager: Helped me become more deliberate about the human operating system around product work. At Side.inc, it supported the alignment work around AI/automation tools such as Windsurf and Microsoft Enterprise Copilot. At Perkbox Vivup, it was relevant when aligning stakeholders around fundamental changes to our web app and app's user journey. It supports the part of product management that is not just deciding what to build, but bringing people with different motivations, communication styles, and risk appetites into shared commitment.
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
  whereToSeeIt:
    - label:
      url:
      status:
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
    whereToSeeIt:
      - label: qadam.trade
        url: http://qadam.trade
        status: ready
    privateNotes: Strongest section to lead with is Architecture.

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
    whereToSeeIt:
      - label: nsso.me/dreamsea
        url: http://nsso.me/dreamsea
        status: ready
    privateNotes: Strongest sections to lead with are Problem and Tradeoffs.

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
    whereToSeeIt:
      - label: nsso
        url: TBD
        status: needed
    privateNotes: Strongest section to lead with is Problem. Long-term vision includes the NY accelerator and Forbes 30-under-30.

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
    whereToSeeIt:
      - label: RazinFlix
        url: TBD
        status: needed
    privateNotes: Strongest section to lead with is Problem.

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
    whereToSeeIt:
      - label: 24Seven Concierge
        url: TBD
        status: needed
    privateNotes: Strongest section to lead with is Why This Approach.
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
    whereToSeeIt:
      - label: AI-Native Product OS
        url: https://www.notion.so/AI-Native-Product-OS-cfa6fe2ecf3783649ab68152765cc260?pvs=21
        status: ready
    privateNotes: Strongest section to lead with is Why This Approach.
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
    whereToSeeIt:
      - label: Mass Social Wisdom Agent
        url: TBD
        status: needed
    privateNotes: Strongest sections to lead with are Architecture and Tradeoffs.

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
    whereToSeeIt:
      - label: AI Costs Dashboard
        url: TBD
        status: needed

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
    whereToSeeIt:
      - label: RAG Pipeline
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
    evidence: overall-structure-context.md and ramin-hoodeh-exp-context.md
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
    evidence: ramin-hoodeh-exp-context.md
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
    evidence: ramin-hoodeh-exp-context.md and overall-structure-context.md
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
    evidence: overall-structure-context.md
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
  whatIWouldImproveOneSentence: Finalise the public diagram, course landing page, and live URL before the planned June 2026 release.
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
  socialLinks [PAGE FOOTER]:
    - platform: LinkedIn
      label: LinkedIn
      url: http://bit.ly/raminlinkedin
      status: ready
    - platform: GitHub
      label: GitHub
      url: https://github.com/raminhoodeh
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
    - Separate verified sources from inference.
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
2. Add company logos, locations, product videos, and website-ready copy.
3. Add reviews/testimonials with permission status.
4. Add project screenshots/GIFs, GitHub links, and live links.
5. Add qualification/certification source links and modules.
6. Add teaching/speaking media links.
7. Confirm book title/link mismatch for The Proposition / Purpose Amazon link.
8. Add WhatsApp deep link, Google Meet link, AI tools spreadsheet link, and AI PM course coupon destination.
