import type { AiRaminPrototype } from './shared';

export const aiRaminPrototype = {
  status: 'Source-grounded portfolio chat',
  positioning:
    'A source-grounded AI Product Manager portfolio assistant that helps visitors evaluate Ramin\'s role fit, product judgment, relevant examples, and AI-native operating style.',
  headline: "Ask AI Ramin about product judgement, role fit, projects, or interview-style examples.",
  description:
    'AI Ramin answers from a curated portfolio corpus, separates verified evidence from inference, and makes the boundary clear when the context is not enough.',
  examplePrompts: [
    {
      label: 'I am hiring an AI Product Manager. How would Ramin approach the first 90 days?',
      prompt:
        'I am hiring an AI Product Manager for [company / marketplace context]. Here is the role description: [paste role description]. How would Ramin approach the first 90 days?',
    },
    {
      label: 'Here is a product idea. Which parts of Ramin\'s experience are relevant?',
      prompt:
        'Here is a product idea: [paste product idea]. Which parts of Ramin\'s experience are relevant, and what risks would he watch?',
    },
    {
      label: 'How would Ramin design guardrails for an AI concierge feature?',
      prompt:
        'How would Ramin design guardrails for [AI feature / concierge workflow] where the main user risk is [paste risk or misuse case], without slowing the product down?',
    },
    {
      label: 'Compare Ramin\'s self-ware projects against this role description.',
      prompt:
        'Compare Ramin\'s self-ware projects against this role description: [paste role description]. Identify the most relevant examples, likely gaps, and the best interview follow-up questions.',
    },
  ],
  excludedExperience:
    'Do not add cross-site "Ask about this" buttons in this upgrade. Keep the upgraded experience concentrated inside the AI Ramin page first.',
  hiringModes: [
    {
      id: 'recruiter',
      label: 'Recruiter',
      visitor: 'A recruiter screening quickly for role match, seniority, relevant examples, and gaps.',
      answerStyle: 'Concise, scannable, and evidence-first.',
      proofBias: ['role match', 'relevant examples', 'gaps to clarify', 'contact next step'],
    },
    {
      id: 'hiring-manager',
      label: 'Hiring Manager',
      visitor: 'A manager deciding whether Ramin can perform in a specific AI product role.',
      answerStyle: 'Specific, comparative, and grounded in work/project examples.',
      proofBias: ['delivery examples', 'first 90 days', 'tradeoffs', 'risk judgement'],
    },
    {
      id: 'founder',
      label: 'Founder',
      visitor: 'A founder looking for ownership, speed, ambiguity tolerance, and builder signal.',
      answerStyle: 'Direct, outcome-led, and focused on practical operating leverage.',
      proofBias: ['shipping speed', 'independent builds', 'ambiguous problems', 'commercial judgement'],
    },
    {
      id: 'ai-product-lead',
      label: 'AI Product Lead',
      visitor: 'An AI product leader testing depth across model, context, orchestration, governance, and human judgement.',
      answerStyle: 'Technically literate, structured, and explicit about governance.',
      proofBias: ['evals', 'guardrails', 'RAG', 'agents', 'MCP', 'cost/risk control'],
    },
    {
      id: 'investor',
      label: 'Investor',
      visitor: 'An investor evaluating product taste, systems thinking, and founder-like signal.',
      answerStyle: 'High signal, thesis-led, and focused on independent product evidence.',
      proofBias: ['market insight', 'systems thinking', 'selfware', 'taste', 'proof of initiative'],
    },
    {
      id: 'curious-visitor',
      label: 'Curious Visitor',
      visitor: 'Someone trying to understand Ramin, the portfolio, and how the work fits together.',
      answerStyle: 'Plain-English, warm, and low-jargon without losing specificity.',
      proofBias: ['overview', 'project explanations', 'teaching/writing context', 'where to explore next'],
    },
  ],
  requestTypes: [
    {
      id: 'general_chat',
      label: 'General portfolio chat',
      routeIntent: 'Answer a normal question about Ramin, his work, his projects, or the portfolio.',
    },
    {
      id: 'role_fit',
      label: 'Role-fit analyzer',
      routeIntent: 'Analyze a pasted job description, hiring need, or role context against Ramin\'s evidence.',
    },
    {
      id: 'product_judgment',
      label: 'Product judgment simulator',
      routeIntent: 'Apply Ramin\'s AI-Native Product OS to a visitor-supplied AI product scenario.',
    },
    {
      id: 'evidence_lookup',
      label: 'Evidence lookup',
      routeIntent: 'Find what Ramin has actually shipped, proven, written, taught, or worked on.',
    },
    {
      id: 'hiring_brief',
      label: 'Hiring brief',
      routeIntent: 'Create a concise, shareable hiring summary from the current context.',
    },
  ],
  upgradedExperiences: [
    {
      id: 'hiring-mode-selector',
      label: 'Hiring mode selector',
      goal: 'Let visitors set the lens before asking a question so the answer is useful for their evaluation context.',
      visitorInput: 'Visitor chooses recruiter, hiring manager, founder, AI product lead, investor, or curious visitor.',
      outputContract: [
        'Selected mode changes emphasis and depth.',
        'Selected mode never changes evidence truth.',
        'The response still follows the universal answer contract.',
      ],
    },
    {
      id: 'role-fit-analyzer',
      label: 'Role-fit analyzer',
      goal: 'Turn pasted job descriptions into honest fit analysis for an AI Product Manager role.',
      visitorInput: 'Job description, hiring need, company context, or role scorecard.',
      outputContract: [
        'Role summary',
        'Strongest matching work evidence',
        'Strongest matching project evidence',
        'AI Product Manager strengths',
        'Likely gaps or questions to clarify',
        'First 90-day operating approach',
        'Suggested interview questions',
        'Contact or hiring-brief next step',
      ],
    },
    {
      id: 'evidence-backed-answers',
      label: 'Evidence-backed answers',
      goal: 'Make every important claim inspectable through retrieved portfolio proof.',
      visitorInput: 'Any portfolio, hiring, work, project, or AI product question.',
      outputContract: [
        'Answer sections separate claim types.',
        'Evidence cards identify the source surface.',
        'Unsupported claims are withheld or marked as inference.',
      ],
    },
    {
      id: 'proof-inference-separation',
      label: 'Verified proof versus inference',
      goal: 'Show AI PM-quality truthfulness by separating what is known from what is reasonable to infer.',
      visitorInput: 'Any question that asks for fit, comparison, strengths, weaknesses, or capability.',
      outputContract: [
        'Verified proof is visibly distinct from inferred fit.',
        'Confidential boundaries are named when relevant.',
        'Open questions are used when the pasted context is insufficient.',
      ],
    },
    {
      id: 'product-judgment-simulator',
      label: 'Product judgment simulator',
      goal: 'Demonstrate how Ramin would reason through AI product scenarios.',
      visitorInput: 'AI product idea, feature brief, risk scenario, or product problem.',
      outputContract: [
        'Model, Context, Orchestration, Governance, Human structure',
        'Recommended MVP path',
        'Riskiest assumptions',
        'Eval and guardrail plan',
        'Key tradeoffs',
        'What Ramin would ask next',
      ],
    },
    {
      id: 'shareable-hiring-brief',
      label: 'Shareable hiring brief',
      goal: 'Create a concise internal note a recruiter or hiring manager can copy after a useful chat.',
      visitorInput: 'Current chat, role-fit analysis, or explicit request for a hiring brief.',
      outputContract: [
        'Why Ramin fits this role',
        'Most relevant proof',
        'Relevant projects',
        'AI Product Manager strengths',
        'Risks or questions to clarify',
        'Suggested interview focus',
        'Contact',
      ],
    },
  ],
  allowedSources: [
    'ai-ramin-context/canonical/*',
    'ai-ramin-context/story-bank/*',
    'ai-ramin-context/frameworks/*',
    'ai-ramin-context/policies/*',
    'ai-ramin-context/generated/ai-ramin-corpus.json',
    'Approved final portfolio copy',
  ],
  disallowedClaims: [
    'No invented metrics',
    'No inflated job scope',
    'No confidential Bayut or Side.inc detail',
    'No unverified public proof',
    'No pretending to know what the verified corpus does not confirm',
    'No raw scrape dumps as voice',
  ],
  responseTone: [
    'Precise',
    'Source-grounded',
    'Strategic',
    'Plain-English',
    'Calmly ambitious',
    'Honest about unknowns',
  ],
  sourceBoundaries: [
    'Use curated local portfolio files as memory.',
    'Treat public pages as proof and asset leads, not personality or voice.',
    'Prefer saying "not enough evidence" over making a confident claim.',
    'Separate verified proof, inferred fit, and next questions in every answer.',
  ],
  futureModes: [
    'Recruiter',
    'Hiring Manager',
    'Founder',
    'AI Product Lead',
    'Investor',
    'Curious Visitor',
  ],
  inputFlow: [
    {
      label: 'Paste context',
      detail: 'Role description, project brief, AI feature idea, or portfolio question.',
    },
    {
      label: 'Retrieve proof',
      detail: 'Search approved resume context, write-ups, source registry, and final site copy.',
    },
    {
      label: 'Separate confidence',
      detail: 'Split verified proof, inferred fit, risks, and open questions.',
    },
    {
      label: 'Return answer',
      detail: 'Give a concise, source-grounded recommendation without inflating claims.',
    },
  ],
  answerContract: [
    {
      key: 'short_answer',
      label: 'Short answer',
      purpose: 'Answer the visitor directly before showing evidence.',
      renderingRule: 'One to three sentences; no generic filler.',
    },
    {
      key: 'verified_proof',
      label: 'Verified proof',
      purpose: 'List claims supported by approved corpus or public proof.',
      renderingRule: 'Bullets or proof cards with confidence labels.',
    },
    {
      key: 'inferred_fit',
      label: 'Inferred fit',
      purpose: 'Explain reasonable implications without presenting them as facts.',
      renderingRule: 'Visibly separate from verified proof.',
    },
    {
      key: 'confidential_boundary',
      label: 'Confidential boundary',
      purpose: 'Name what cannot be exposed, claimed, or inferred.',
      renderingRule: 'Show only when relevant; keep it brief and specific.',
    },
    {
      key: 'open_questions',
      label: 'Open questions',
      purpose: 'Ask for missing information that materially improves the answer.',
      renderingRule: 'Maximum three questions; omit low-value follow-ups.',
    },
    {
      key: 'evidence_cards',
      label: 'Evidence cards',
      purpose: 'Attach proof from retrieved work, project, writing, course, talk, policy, or framework sources.',
      renderingRule: 'Generated from retrieved context only, never from model imagination.',
    },
    {
      key: 'suggested_next_action',
      label: 'Suggested next action',
      purpose: 'Guide the visitor to role-fit analysis, product simulator, hiring brief, project reader, or contact.',
      renderingRule: 'One concrete action.',
    },
  ],
  evidenceCardContract: {
    fields: [
      'title',
      'type',
      'summary',
      'source_path',
      'public_url',
      'confidence',
    ],
    confidenceRules: [
      {
        confidence: 'verified',
        rule: 'Use when the proof is public or explicitly approved.',
      },
      {
        confidence: 'local-primary',
        rule: 'Use when the claim is supported by curated local portfolio files but may still need public-facing review.',
      },
      {
        confidence: 'inferred',
        rule: 'Use only for role fit or implications, not factual claims.',
      },
      {
        confidence: 'needs-review',
        rule: 'Use when a useful claim exists but should not be shown as final public proof.',
      },
    ],
  },
  roleFitAnalyzerContract: [
    'Role summary',
    'Strongest matching work evidence',
    'Strongest matching project evidence',
    'AI Product Manager strengths',
    'Likely gaps or questions to clarify',
    'First 90-day operating approach',
    'Suggested interview questions',
    'Contact or hiring-brief call to action',
  ],
  productJudgmentSimulatorContract: [
    'Model',
    'Context',
    'Orchestration',
    'Governance',
    'Human',
    'Recommended MVP path',
    'Riskiest assumptions',
    'Eval and guardrail plan',
    'Key tradeoffs',
    'What Ramin would ask next',
  ],
  hiringBriefContract: [
    'Why Ramin fits this role',
    'Most relevant proof',
    'Relevant projects',
    'AI Product Manager strengths',
    'Risks or questions to clarify',
    'Suggested interview focus',
    'Contact',
  ],
  responseContract: [
    {
      label: 'Source boundary',
      detail: 'Name which approved sources the answer is allowed to use.',
    },
    {
      label: 'Relevant proof',
      detail: 'List the strongest matching projects, work examples, or public artifacts.',
    },
    {
      label: 'Approach',
      detail: 'Explain how Ramin would frame the problem across product, AI, and human judgement.',
    },
    {
      label: 'Guardrail',
      detail: 'Call out what cannot be claimed, inferred, or exposed.',
    },
    {
      label: 'Next question',
      detail: 'Ask only for missing information that would materially improve the answer.',
    },
  ],
  retrievalDesign: [
    {
      label: 'Memory',
      detail: 'Curated local files only; raw scrape dumps stay evidence and asset leads.',
    },
    {
      label: 'Citations',
      detail: 'Answers should cite source names or approved page labels, not vague authority.',
    },
    {
      label: 'Updates',
      detail: 'New projects, credentials, and copy must be approved before entering memory.',
    },
  ],
  sensitiveAreas: [
    'Company confidentiality',
    'Private client data',
    'Unreleased feature details',
    'Personal data',
    'Unverified role-fit claims',
  ],
  sampleResponse: [
    'Source boundary: I would answer from Ramin\'s resume context, project write-ups, source registry, and approved site copy.',
    'Relevant proof: Bayut for AI product leadership, Side.inc for AI-enabled internal transformation, nsso/Dreamsea/24Seven for shipped AI product architecture, and the AI-Native Product OS for operating model.',
    'Approach: map the problem across Model, Context, Orchestration, Governance, and Human layers before choosing the prototype path.',
    'Guardrail: I would not name confidential features, invent metrics, or imply live model integration where only a prototype exists.',
    'Next question: what market, user segment, and decision horizon should the answer optimise for?',
  ],
  phaseOneAcceptanceCriteria: [
    'The upgraded six-experience contract is documented.',
    'The universal answer contract is defined.',
    'Evidence card rules are defined.',
    'Role-fit analyzer, product simulator, and hiring brief contracts are defined.',
    'The AI Ramin experience is framed as an AI Product Manager portfolio assistant, not a general chatbot.',
  ],
  nextPhase:
    'Add visitor-facing answer feedback capture, review-queue triage, and production observability hooks for weak AI Ramin answers.',
} as const satisfies AiRaminPrototype;
