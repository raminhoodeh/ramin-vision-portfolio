import { useCallback, useEffect, useMemo, useRef, useState, useId } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { aiRaminPrototype, portfolioContent } from '../data/portfolio';
import type {
  AiRaminEvidenceConfidence,
  AiRaminEvidenceType,
  AiRaminHiringMode,
  AiRaminHiringModeId,
  AiRaminRequestType,
} from '../data/portfolio';
import { createAiRaminMessageId } from '../lib/text';
import { SectionKicker, sectionMarkerMeta } from '../components/SectionHeader';
import profileImageUrl from '../assets/ramin-profile-nav.webp';

type AiRaminMessageRole = 'assistant' | 'user';
type AiRaminEvidenceCard = {
  title: string;
  type: AiRaminEvidenceType;
  summary: string;
  source_path?: string;
  public_url?: string;
  confidence: AiRaminEvidenceConfidence;
};
type AiRaminSelectedStory = {
  title?: string;
  sourcePath?: string;
  sourceRole?: string;
  storyType?: string;
  entities?: string[];
  questionIntents?: string[];
  selectionScore?: number;
  matchedCues?: string[];
  reason?: string;
  summary?: string;
};
type AiRaminDebugTrace = {
  traceId?: string;
  createdAt?: string;
  visitorMessagePreview?: string;
  request?: {
    hiringMode?: string;
    inferredRequestType?: string;
    model?: string;
    modelReturnedJson?: boolean;
  };
  intent?: {
    primaryQuestionType?: string;
    answerTechniqueId?: string;
    answerFrameId?: string;
    confidence?: number;
    fallthroughToPortfolioOverview?: boolean;
    needsFramework?: boolean;
    needsStory?: boolean;
    needsContact?: boolean;
    guardrailSensitive?: boolean;
    conversationContext?: AiRaminConversationContext | null;
  };
  intentRoute?: AiRaminIntentRoute;
  routing?: AiRaminRoutingTrace;
  sufficiency?: {
    answerableEvidenceCount?: number;
    minimumAnswerableEvidence?: number;
    verdict?: string;
    contextChunkCount?: number;
    contextTruncated?: boolean;
  };
  retrieval?: {
    contextSources?: string[];
    retrievalMessagePreview?: string;
    selectedChunkCount?: number;
    selectedChunksByRole?: Record<string, number>;
    selectedChunks?: Array<{
      title?: string;
      sourcePath?: string;
      sourceRole?: string;
      confidence?: string;
      retrievalPriority?: string;
      canAnswerFrom?: boolean;
      canSupportInference?: boolean;
    }>;
  };
  evidenceCards?: {
    count?: number;
    byConfidence?: Record<string, number>;
  };
  selectedStory?: AiRaminSelectedStory | null;
  recovery?: {
    applied?: boolean;
    strategy?: string;
    reason?: string;
  };
  qualityGate?: {
    applied?: boolean;
    issues?: string[];
    strategy?: string;
    reason?: string;
    shouldResetModelPayload?: boolean;
  };
  sections?: {
    rawWasInsufficientContext?: boolean;
    finalWasInsufficientContext?: boolean;
    rawShortAnswerPreview?: string;
    finalShortAnswerPreview?: string;
    finalSectionCounts?: Record<string, number | boolean>;
  };
};
type AiRaminConversationContext = {
  schemaVersion?: number;
  hasHistory?: boolean;
  isFollowUp?: boolean;
  followUpReason?: string;
  inheritedIntent?: string;
  inheritedQuestionType?: string;
  inheritedRequestType?: string;
  currentRequestType?: string;
  deterministicQuestionType?: string;
  contextualQuery?: string;
  previousUserMessagePreview?: string;
  previousAnswerPreview?: string;
  previousLeadStoryTitle?: string;
  previousEvidenceCardTitles?: string[];
};
type AiRaminRoutingTrace = {
  schemaVersion?: number;
  router?: string;
  classifier?: {
    provider?: string;
    model?: string | null;
    attempted?: boolean;
    used?: boolean;
    intent?: string | null;
    confidence?: number | null;
    acceptanceThreshold?: number | null;
    reason?: string;
    fallbackReason?: string;
    error?: string;
    rawPreview?: string;
  } | null;
  conversationContext?: AiRaminConversationContext | null;
  intentRoute?: AiRaminIntentRoute;
  messagePreview?: string;
  explicitRequestType?: string | null;
  inferredRequestType?: string;
  primaryQuestionType?: string;
  answerTechniqueId?: string;
  answerFrameId?: string;
  confidence?: number;
  reason?: string;
  fallthroughToPortfolioOverview?: boolean;
  fallbackReason?: string;
  isSubstantive?: boolean;
  needsEvidence?: boolean;
  needsRetrieval?: boolean;
  needsStructuredModules?: boolean;
  retrievalRan?: boolean;
  modelCalled?: boolean;
  contextChunkCount?: number;
  evidenceCardCount?: number;
  presentationPolicy?: {
    showEvidenceDisclosure?: boolean;
    showStructuredModules?: boolean;
    showFeedback?: boolean;
    showSoftCtas?: boolean;
    showSuggestions?: boolean;
  };
};
type AiRaminIntentRoute = {
  schemaVersion?: number;
  intent?:
    | 'casual_chat'
    | 'portfolio_overview'
    | 'role_fit'
    | 'product_judgment'
    | 'evidence_lookup'
    | 'behavioral_interview'
    | 'hiring_brief'
    | 'interview_coaching'
    | 'guardrail_boundary'
    | 'clarification_needed';
  confidence?: number;
  isSubstantive?: boolean;
  needsEvidence?: boolean;
  needsRetrieval?: boolean;
  needsStructuredModules?: boolean;
  suggestedTone?: 'casual' | 'professional' | 'hiring' | 'analytical';
  reason?: string;
  sourceQuestionType?: string;
  answerTechniqueId?: string;
  answerFrameId?: string;
  explicitRequestType?: string | null;
  inferredRequestType?: string;
  fallthroughToPortfolioOverview?: boolean;
  messagePreview?: string;
  presentationPolicy?: AiRaminRoutingTrace['presentationPolicy'];
};
type AiRaminResponseSections = {
  short_answer: string;
  verified_proof: string[];
  inferred_fit: string[];
  confidential_boundary: string[];
  open_questions: string[];
  suggested_next_action: string;
};
type AiRaminSourceMetadata = {
  contextSources: string[];
  contextChunkCount: number;
  contextTruncated: boolean;
  retrievalMessage?: string;
  conversationContext?: AiRaminConversationContext | null;
  corpusStats?: {
    chunks?: number;
    source_files_ingested?: number;
  };
  evidenceCardCount: number;
  answerableEvidenceCount?: number;
  recoveryApplied?: boolean;
  recoveryStrategy?: string;
  recoveryReason?: string;
  qualityGateApplied?: boolean;
  qualityGateIssues?: string[];
  qualityGateStrategy?: string;
  qualityGateReason?: string;
  qualityGateResetModelPayload?: boolean;
  selectedStory?: AiRaminSelectedStory | null;
  intentRoute?: AiRaminIntentRoute;
  routing?: AiRaminRoutingTrace;
  debugTrace?: AiRaminDebugTrace;
  answerShape?: {
    primaryQuestionType?: string;
    answerTechniqueId?: string;
    answerFrameId?: string;
    answerFamily?: string;
    softCtas?: string[];
  };
};
type AiRaminBriefSeed = {
  mode?: AiRaminHiringModeId;
  requestType?: AiRaminRequestType;
  headline?: string;
  whyRaminFits: string;
  mostRelevantProof: string[];
  relevantProjects?: string[];
  inferredStrengths: string[];
  risksOrQuestions: string[];
  evidenceCardTitles: string[];
  selectedProofAnchors?: string[];
  suggestedInterviewFocus: string[];
  contactCta: string;
} | null;
type AiRaminRoleFitAnalysis = {
  role_summary: string;
  strongest_work_evidence: string[];
  strongest_project_evidence: string[];
  ai_pm_strengths: string[];
  likely_gaps_or_questions: string[];
  first_90_days: string[];
  interview_questions: string[];
  hiring_brief_handoff: string;
} | null;
type AiRaminProductJudgmentAnalysis = {
  scenario_summary: string;
  model_layer: string[];
  context_layer: string[];
  orchestration_layer: string[];
  governance_layer: string[];
  human_layer: string[];
  recommended_mvp_path: string[];
  riskiest_assumptions: string[];
  eval_and_guardrail_plan: string[];
  key_tradeoffs: string[];
  next_questions: string[];
} | null;
type AiRaminEvidenceLookupAnalysis = {
  query_summary: string;
  strongest_verified_proof: string[];
  supporting_evidence: string[];
  public_links: string[];
  source_filters: string[];
  confidence_notes: string[];
  missing_evidence: string[];
  suggested_next_actions: string[];
} | null;
type AiRaminAnswerFrame = {
  id: string;
  answerFamily: string;
  openingMove: string;
  proofMove: string;
  interpretationMove: string;
  boundaryMove: string;
  followUpMove: string;
  softCtas?: string[];
};
type AiRaminStructuredResponse = {
  answer: string;
  mode: AiRaminHiringModeId;
  requestType: AiRaminRequestType;
  sections: AiRaminResponseSections;
  evidenceCards: AiRaminEvidenceCard[];
  roleFitAnalysis?: AiRaminRoleFitAnalysis;
  productJudgmentAnalysis?: AiRaminProductJudgmentAnalysis;
  evidenceLookupAnalysis?: AiRaminEvidenceLookupAnalysis;
  briefSeed: AiRaminBriefSeed;
  answerFrame?: AiRaminAnswerFrame;
  model: string;
  sourceMetadata?: AiRaminSourceMetadata;
};
type AiRaminApiResponse = AiRaminStructuredResponse & {
  error?: string;
};
type AiRaminMessage = {
  id: string;
  role: AiRaminMessageRole;
  content: string;
  isIntro?: boolean;
  response?: AiRaminStructuredResponse;
};
type AiRaminMarkdownBlock =
  | { type: 'heading'; level: number; content: string }
  | { type: 'paragraph'; content: string }
  | { type: 'unordered-list'; items: string[] }
  | { type: 'ordered-list'; items: string[] };
type AiRaminGlassButtonStyle = CSSProperties & {
  '--tahoe-glass-filter': string;
};
type AiRaminSendMessageOptions = {
  requestType?: AiRaminRequestType;
  hiringMode?: AiRaminHiringModeId;
};
type AiRaminFeedbackValue = 'helpful' | 'needs_review';
type AiRaminFeedbackStatus = 'idle' | 'submitting' | 'saved' | 'failed';
type AiRaminSoftCtaId =
  | 'analyze_role_fit'
  | 'draft_hiring_brief'
  | 'generate_interview_questions'
  | 'compare_projects'
  | 'turn_into_mvp_plan'
  | 'show_risks'
  | 'use_in_hiring_brief';
type AiRaminSoftCta = {
  id: AiRaminSoftCtaId;
  label: string;
};
type AiRaminAnswerPresentation = {
  isWeak: boolean;
  hasEvidenceTrail: boolean;
  shouldShowStructuredModules: boolean;
  shouldShowEvidenceDisclosure: boolean;
};
type AiRaminInlineModuleProps = {
  title: string;
  kicker?: string;
  defaultOpen?: boolean;
  className?: string;
  children: ReactNode;
};

const aiRaminBuildConsiderations = [
  {
    label: '01',
    title: 'RAG Context',
    chips: ['Curated corpus', 'Source metadata', 'Retrieval priority'],
    body:
      'The chatbot retrieves from canonical portfolio files, work/project evidence, story-bank examples, frameworks, and policy documents. Raw exports and messy notes are kept out of the answer path.',
    proof: [
      { label: 'Corpus', value: 'Generated from 50 curated files into 64 answerable chunks' },
      { label: 'Boundary', value: 'Each chunk carries source role, public-safety, and answer-permission metadata' },
    ],
  },
  {
    label: '02',
    title: 'Guardrails',
    chips: ['Truthfulness', 'Scope control', 'Contact fallback'],
    body:
      'The assistant is designed to stay inside the portfolio domain, refuse private or unsupported claims, and redirect hiring or sensitive requests to the Contact section when the corpus is not enough.',
    proof: [
      { label: 'Rules', value: 'No invented metrics, scope inflation, secrets, salary claims, or private Bayut details' },
      { label: 'UX', value: 'Guardrail-triggered answers should tell the visitor why the boundary was applied' },
    ],
  },
  {
    label: '03',
    title: 'Model Selection',
    chips: ['Gemini', 'Server-side key', 'Website chat'],
    body:
      'Gemini runs behind the local API route so the browser never receives the API key. The model can be swapped through environment configuration without changing the portfolio UI.',
    proof: [
      { label: 'Default', value: 'gemini-3.5-flash for answers and intent routing unless env overrides it' },
      { label: 'Integration', value: 'Answers return model, context-source count, and truncation metadata' },
    ],
  },
  {
    label: '04',
    title: 'Temperature',
    chips: ['0.45', 'Natural tone', 'Evidence first'],
    body:
      'Generation is tuned for conversational answers while keeping the portfolio evidence boundary intact. The goal is a useful chat, not a rigid source report.',
    proof: [
      { label: 'Config', value: 'temperature 0.45, topP 0.92, max output 1,300 to 1,800 tokens' },
      { label: 'Tradeoff', value: 'More natural phrasing, with factual discipline preserved by retrieval, JSON contracts, and quality gates' },
    ],
  },
  {
    label: '05',
    title: 'Answer Strategy',
    chips: ['STAR', 'Tradeoffs', 'Product judgement'],
    body:
      'Interview-style answers can be shaped with STAR, situation-complication-resolution, product-sense framing, and evidence-versus-inference separation.',
    proof: [
      { label: 'Use case', value: 'Role-fit, first-90-days, AI guardrails, leadership, and project-relevance questions' },
      { label: 'Output', value: 'Short answer first, then relevant context when it helps the visitor decide' },
    ],
  },
  {
    label: '06',
    title: 'Evaluation',
    chips: ['Question set', 'Failure modes', 'Iteration loop'],
    body:
      'The implementation plan includes evaluation prompts for profile, work, projects, behavioural examples, product judgement, and misuse attempts.',
    proof: [
      { label: 'Quality bar', value: 'Useful, grounded, concise, and honest about missing context' },
      { label: 'Next step', value: 'Log weak answers, improve source chunks, then re-run evaluation questions' },
    ],
  },
] as const;

const requestTypeLabels: Record<AiRaminRequestType, string> = {
  general_chat: 'General',
  role_fit: 'Role fit',
  product_judgment: 'Product judgment',
  evidence_lookup: 'Evidence lookup',
  hiring_brief: 'Hiring brief',
};

const requestTypeTemplates: Record<AiRaminRequestType, string> = {
  general_chat: '',
  role_fit:
    'Analyze this AI Product Manager role for Ramin. Role description: [paste role description]. Return relevant examples, gaps, and interview focus.',
  product_judgment:
    'Use Ramin\'s AI-Native Product OS on this product scenario: [paste AI product idea or risk]. Include Model, Context, Orchestration, Governance, and Human layers.',
  evidence_lookup:
    'What verified evidence does Ramin have for [paste capability, domain, project, or role requirement]?',
  hiring_brief:
    'Create a concise shareable hiring brief for Ramin based on this role/context: [paste role or hiring context].',
};

const aiRaminLoadingMessages = [
  'Reading the portfolio context...',
  'Pondering...',
  "Analysing Ramin's experiences...",
  'Mapping context to the question...',
  'Reviewing product judgement examples...',
  'Looking for the cleanest evidence...',
  'Separating evidence from inference...',
  'Checking the answer boundaries...',
  'Shaping the answer for this lens...',
  'Drafting a grounded answer...',
] as const;

const softCtaLabels: Record<AiRaminSoftCtaId, string> = {
  analyze_role_fit: 'Analyze a role',
  draft_hiring_brief: 'Draft brief',
  generate_interview_questions: 'Interview questions',
  compare_projects: 'Compare projects',
  turn_into_mvp_plan: 'MVP plan',
  show_risks: 'Show risks',
  use_in_hiring_brief: 'Use in brief',
};

const confidenceLabels: Record<AiRaminEvidenceConfidence, string> = {
  verified: 'Verified',
  'local-primary': 'Local primary',
  inferred: 'Inferred',
  'needs-review': 'Needs review',
};

const typeLabels: Record<AiRaminEvidenceType, string> = {
  work: 'Work',
  project: 'Project',
  writing: 'Writing',
  course: 'Course',
  talk: 'Talk',
  policy: 'Policy',
  framework: 'Framework',
};

function getRequestTypeLabel(requestType: AiRaminRequestType) {
  return requestTypeLabels[requestType] ?? requestType;
}

function getConfidenceLabel(confidence: AiRaminEvidenceConfidence) {
  return confidenceLabels[confidence] ?? confidence;
}

function getEvidenceTypeLabel(type: AiRaminEvidenceType) {
  return typeLabels[type] ?? type;
}

function formatAiRaminSourceCount(count: number) {
  return `${count} ${count === 1 ? 'source' : 'sources'}`;
}

const weakAnswerQualityIssues = new Set([
  'raw_json_short_answer',
  'local_source_path_leak',
  'internal_metadata_leak',
  'generic_behavioral_answer',
  'behavioral_story_missing',
  'over_cautious_with_sufficient_evidence',
]);

function isAiRaminInsufficientContextText(value: string) {
  return /\b(do not|don't|cannot|can't)\b.*\b(enough|sufficient|verified|portfolio context|context)\b/i.test(value);
}

function getAiRaminProofTrailCounts(response: AiRaminStructuredResponse) {
  const evidenceLookup = response.evidenceLookupAnalysis;
  const proofCount = response.sections.verified_proof.length;
  const inferenceCount = response.sections.inferred_fit.length;
  const boundaryCount = response.sections.confidential_boundary.length + response.sections.open_questions.length;
  const lookupCount =
    (evidenceLookup?.strongest_verified_proof.length ?? 0) +
    (evidenceLookup?.supporting_evidence.length ?? 0) +
    (evidenceLookup?.public_links.length ?? 0) +
    (evidenceLookup?.missing_evidence.length ?? 0);

  return {
    sourceCount: response.sourceMetadata?.evidenceCardCount ?? response.evidenceCards.length,
    answerableSourceCount: response.sourceMetadata?.answerableEvidenceCount ?? 0,
    proofCount,
    inferenceCount,
    boundaryCount,
    lookupCount,
    sourcedProofCount: response.evidenceCards.filter((card) => (
      card.confidence === 'verified' ||
      card.confidence === 'local-primary'
    )).length,
  };
}

function getAiRaminQuestionType(response: AiRaminStructuredResponse) {
  return (
    response.sourceMetadata?.intentRoute?.sourceQuestionType ||
    response.sourceMetadata?.routing?.intentRoute?.sourceQuestionType ||
    response.sourceMetadata?.routing?.primaryQuestionType ||
    response.sourceMetadata?.answerShape?.primaryQuestionType ||
    response.sourceMetadata?.debugTrace?.intent?.primaryQuestionType ||
    ''
  );
}

function getAiRaminIntentRoute(response: AiRaminStructuredResponse): AiRaminIntentRoute | null {
  return (
    response.sourceMetadata?.intentRoute ??
    response.sourceMetadata?.routing?.intentRoute ??
    response.sourceMetadata?.debugTrace?.intentRoute ??
    response.sourceMetadata?.debugTrace?.routing?.intentRoute ??
    null
  );
}

function getAiRaminPresentationPolicy(response: AiRaminStructuredResponse) {
  return getAiRaminIntentRoute(response)?.presentationPolicy ?? response.sourceMetadata?.routing?.presentationPolicy;
}

function isAiRaminConversationOpenResponse(response: AiRaminStructuredResponse) {
  const intent = getAiRaminIntentRoute(response)?.intent;
  const questionType = getAiRaminQuestionType(response);
  return intent === 'casual_chat' || intent === 'clarification_needed' || questionType === 'conversation_open' || questionType === 'clarification_needed';
}

function shouldShowAiRaminFeedback(response: AiRaminStructuredResponse) {
  return getAiRaminPresentationPolicy(response)?.showFeedback !== false && !isAiRaminConversationOpenResponse(response);
}

function getAiRaminAnswerPresentation(response: AiRaminStructuredResponse): AiRaminAnswerPresentation {
  const presentationPolicy = getAiRaminPresentationPolicy(response);

  if (isAiRaminConversationOpenResponse(response)) {
    return {
      isWeak: false,
      hasEvidenceTrail: false,
      shouldShowStructuredModules: false,
      shouldShowEvidenceDisclosure: false,
    };
  }

  const sourceMetadata = response.sourceMetadata;
  const qualityIssues = sourceMetadata?.qualityGateIssues ?? sourceMetadata?.debugTrace?.qualityGate?.issues ?? [];
  const hasCriticalQualityIssue = qualityIssues.some((issue) => weakAnswerQualityIssues.has(issue));
  const wasRecovered = Boolean(sourceMetadata?.recoveryApplied || sourceMetadata?.debugTrace?.recovery?.applied);
  const wasReset = Boolean(
    sourceMetadata?.qualityGateResetModelPayload ||
      sourceMetadata?.debugTrace?.qualityGate?.shouldResetModelPayload,
  );
  const counts = getAiRaminProofTrailCounts(response);
  const hasEvidenceTrail = counts.sourceCount > 0 || counts.proofCount > 0 || counts.lookupCount > 0;
  const isInsufficientContext = isAiRaminInsufficientContextText(response.sections.short_answer);
  const isWeak = wasReset || hasCriticalQualityIssue || wasRecovered || (isInsufficientContext && counts.proofCount === 0);
  const hasAnyDisclosureTrail = hasEvidenceTrail || counts.boundaryCount > 0 || (!isWeak && counts.inferenceCount > 0);
  const routeAllowsEvidence = presentationPolicy?.showEvidenceDisclosure ?? true;
  const routeAllowsStructuredModules = presentationPolicy?.showStructuredModules ?? true;

  return {
    isWeak,
    hasEvidenceTrail,
    shouldShowStructuredModules: !isWeak && routeAllowsStructuredModules,
    shouldShowEvidenceDisclosure: routeAllowsEvidence && hasAnyDisclosureTrail,
  };
}

function getAiRaminEvidenceDisclosureKicker(response: AiRaminStructuredResponse, presentation = getAiRaminAnswerPresentation(response)) {
  if (presentation.isWeak) {
    return presentation.hasEvidenceTrail ? 'source trail available' : 'boundary only';
  }

  const counts = getAiRaminProofTrailCounts(response);
  const sourceLabel = formatAiRaminSourceCount(counts.sourceCount);

  if (counts.proofCount > 0) {
    return `${sourceLabel} · ${counts.proofCount} ${counts.proofCount === 1 ? 'context note' : 'context notes'}`;
  }

  if (counts.sourcedProofCount > 0 || counts.answerableSourceCount > 0) {
    return `${sourceLabel} · source trail available`;
  }

  return `${sourceLabel} · no extra context surfaced`;
}

function getAiRaminMinimalWeakAnswerCtas(_response: AiRaminStructuredResponse): AiRaminSoftCta[] {
  return [];
}

function findHiringMode(mode: AiRaminHiringModeId): AiRaminHiringMode {
  return aiRaminPrototype.hiringModes.find((item) => item.id === mode) ?? aiRaminPrototype.hiringModes[1];
}

function makeSoftCta(id: AiRaminSoftCtaId): AiRaminSoftCta {
  return { id, label: softCtaLabels[id] };
}

function getAiRaminSoftCtas(response: AiRaminStructuredResponse): AiRaminSoftCta[] {
  if (isAiRaminConversationOpenResponse(response) || getAiRaminPresentationPolicy(response)?.showSoftCtas === false) {
    return [];
  }

  const presentation = getAiRaminAnswerPresentation(response);

  if (presentation.isWeak) {
    return getAiRaminMinimalWeakAnswerCtas(response);
  }

  const frameCtas = (response.answerFrame?.softCtas ?? [])
    .filter((id): id is AiRaminSoftCtaId => Object.prototype.hasOwnProperty.call(softCtaLabels, id))
    .map((id) => makeSoftCta(id));

  if (frameCtas.length) {
    return frameCtas.slice(0, 3);
  }

  if (response.requestType === 'role_fit') {
    return [
      makeSoftCta('draft_hiring_brief'),
      makeSoftCta('generate_interview_questions'),
    ].slice(0, 3);
  }

  if (response.requestType === 'product_judgment') {
    return [
      makeSoftCta('turn_into_mvp_plan'),
      makeSoftCta('show_risks'),
      makeSoftCta('compare_projects'),
    ];
  }

  if (response.requestType === 'evidence_lookup') {
    return [
      makeSoftCta('use_in_hiring_brief'),
    ].slice(0, 3);
  }

  return [
    makeSoftCta('analyze_role_fit'),
    makeSoftCta('compare_projects'),
  ].slice(0, 3);
}

function buildHiringBriefPrompt(roleContext: string, response: AiRaminStructuredResponse | null) {
  const roleFit = response?.roleFitAnalysis;
  const lines = [
    'Create a concise shareable hiring brief for Ramin.',
    '',
    'Role description, hiring context, or internal brief need:',
    roleContext || '[No extra context supplied. Use the retrieved evidence and any supplied prior analysis.]',
  ];

  if (roleFit) {
    lines.push(
      '',
      'Role-fit summary:',
      roleFit.role_summary,
      '',
      'Relevant examples:',
      ...[...roleFit.strongest_work_evidence, ...roleFit.strongest_project_evidence].map((item) => `- ${item}`),
      '',
      'Questions or gaps:',
      ...roleFit.likely_gaps_or_questions.map((item) => `- ${item}`),
    );
  }

  lines.push('', 'Return why Ramin fits, most relevant proof, risks or questions, suggested interview focus, and contact next step.');
  return lines.join('\n');
}

function buildHiringBriefContextFromResponse(response: AiRaminStructuredResponse | null, originalContext = '') {
  if (!response) return originalContext;

  const lines = [
    originalContext ? 'Original hiring context:' : '',
    originalContext,
    '',
    `Use the latest ${getRequestTypeLabel(response.requestType).toLowerCase()} response as source context for a hiring brief.`,
    '',
    'Short answer:',
    response.sections.short_answer,
  ].filter(Boolean);

  if (response.roleFitAnalysis) {
    lines.push(
      '',
      'Role-fit summary:',
      response.roleFitAnalysis.role_summary,
      '',
      'Strongest work evidence:',
      ...response.roleFitAnalysis.strongest_work_evidence.map((item) => `- ${item}`),
      '',
      'Strongest project evidence:',
      ...response.roleFitAnalysis.strongest_project_evidence.map((item) => `- ${item}`),
      '',
      'AI Product Manager strengths:',
      ...response.roleFitAnalysis.ai_pm_strengths.map((item) => `- ${item}`),
      '',
      'Risks or questions:',
      ...response.roleFitAnalysis.likely_gaps_or_questions.map((item) => `- ${item}`),
      '',
      'Interview focus:',
      ...response.roleFitAnalysis.interview_questions.map((item) => `- ${item}`),
    );
  } else {
    lines.push(
      '',
      'Verified proof:',
      ...response.sections.verified_proof.map((item) => `- ${item}`),
      '',
      'Inferred fit:',
      ...response.sections.inferred_fit.map((item) => `- ${item}`),
      '',
      'Open questions:',
      ...response.sections.open_questions.map((item) => `- ${item}`),
    );
  }

  if (response.evidenceCards.length) {
    lines.push(
      '',
      'Evidence card anchors:',
      ...response.evidenceCards.map((card) => `- ${card.title} (${getEvidenceTypeLabel(card.type)}, ${getConfidenceLabel(card.confidence)})`),
    );
  }

  return lines.join('\n');
}

function buildHiringBriefMarkdown(briefSeed: AiRaminBriefSeed) {
  if (!briefSeed) return '';

  const lines = [`# ${briefSeed.headline || 'Hiring brief: Ramin Hoodeh'}`, '', briefSeed.whyRaminFits];
  const appendSection = (label: string, items: string[] | undefined) => {
    if (!items?.length) return;
    lines.push('', `## ${label}`);
    items.forEach((item) => lines.push(`- ${item}`));
  };

  appendSection('Most relevant proof', briefSeed.mostRelevantProof);
  appendSection('Relevant projects', briefSeed.relevantProjects);
  appendSection('AI Product Manager strengths', briefSeed.inferredStrengths);
  appendSection('Risks or questions to clarify', briefSeed.risksOrQuestions);
  appendSection('Suggested interview focus', briefSeed.suggestedInterviewFocus);
  appendSection('Selected proof anchors', briefSeed.selectedProofAnchors ?? briefSeed.evidenceCardTitles);

  if (briefSeed.contactCta) {
    lines.push('', '## Contact', briefSeed.contactCta);
  }

  return lines.join('\n').trim();
}

function decodeAiRaminJsonString(value: string) {
  try {
    return JSON.parse(`"${value}"`).trim();
  } catch {
    return value.replace(/\\"/g, '"').replace(/\\n/g, '\n').trim();
  }
}

function extractAiRaminLooseStringField(text: string, key: string) {
  const match = new RegExp(`["']${key}["']\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`).exec(text);
  return match ? decodeAiRaminJsonString(match[1]) : '';
}

function extractAiRaminLooseArrayField(text: string, key: string, maxItems: number) {
  const match = new RegExp(`["']${key}["']\\s*:\\s*\\[`).exec(text);
  if (!match) return [];

  const start = match.index + match[0].length;
  let end = text.length;
  let inString = false;
  let escaped = false;

  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString && char === ']') {
      end = index;
      break;
    }
  }

  const items: string[] = [];
  const itemPattern = /"((?:\\.|[^"\\])*)"/g;
  let itemMatch: RegExpExecArray | null;
  while ((itemMatch = itemPattern.exec(text.slice(start, end))) && items.length < maxItems) {
    const item = decodeAiRaminJsonString(itemMatch[1]);
    if (item) items.push(item);
  }

  return items;
}

function parseAiRaminLooseStructuredContent(content: string): Partial<AiRaminResponseSections> | null {
  if (!/["']short_answer["']/.test(content)) return null;

  const shortAnswer = extractAiRaminLooseStringField(content, 'short_answer');
  if (!shortAnswer) return null;

  return {
    short_answer: shortAnswer,
    verified_proof: extractAiRaminLooseArrayField(content, 'verified_proof', 6),
    inferred_fit: extractAiRaminLooseArrayField(content, 'inferred_fit', 5),
    confidential_boundary: extractAiRaminLooseArrayField(content, 'confidential_boundary', 4),
    open_questions: extractAiRaminLooseArrayField(content, 'open_questions', 3),
    suggested_next_action: extractAiRaminLooseStringField(content, 'suggested_next_action'),
  };
}

function buildAiRaminAnswerMarkdownFromSections(sections: AiRaminResponseSections) {
  const lines = [sections.short_answer.trim()];

  if (sections.suggested_next_action) {
    lines.push('', `**Suggested next action:** ${sections.suggested_next_action}`);
  }

  return lines.join('\n').trim();
}

function normalizeAiRaminClientResponse(response: AiRaminApiResponse | null): AiRaminApiResponse | null {
  if (!response) return response;
  if (!response.sections) return response;

  const looseSections =
    parseAiRaminLooseStructuredContent(String(response.answer ?? '')) ||
    parseAiRaminLooseStructuredContent(String(response.sections?.short_answer ?? ''));

  if (!looseSections?.short_answer) return response;

  const sections: AiRaminResponseSections = {
    ...response.sections,
    short_answer: looseSections.short_answer,
    verified_proof: looseSections.verified_proof?.length ? looseSections.verified_proof : response.sections.verified_proof,
    inferred_fit: looseSections.inferred_fit?.length ? looseSections.inferred_fit : response.sections.inferred_fit,
    confidential_boundary: looseSections.confidential_boundary?.length
      ? looseSections.confidential_boundary
      : response.sections.confidential_boundary,
    open_questions: looseSections.open_questions?.length ? looseSections.open_questions : response.sections.open_questions,
    suggested_next_action: looseSections.suggested_next_action || response.sections.suggested_next_action,
  };

  return {
    ...response,
    sections,
    answer: buildAiRaminAnswerMarkdownFromSections(sections),
  };
}

async function copyAiRaminText(value: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fall through to the textarea fallback for browser contexts that block Clipboard API writes.
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const didCopy = document.execCommand('copy');
    textarea.remove();
    return didCopy;
  } catch {
    return false;
  }
}

function normalizeAiRaminMarkdownContent(content: string) {
  return content
    // Break a dash bullet the model glued onto the end of the prior sentence
    // ("...Carbon Calculator. - **Days 1–30:** ...") onto its own line so the first
    // list item renders as a bullet instead of trailing prose. Only same-line glue is
    // rewritten ([ \t]+, never a newline), so bullets already on their own line are left
    // untouched.
    .replace(/([.!?:](?:["'”’)\]])?)[ \t]+[-*][ \t]+(\*\*[A-Z0-9])/g, '$1\n- $2')
    .replace(/(:)\s+\*([A-Z0-9][^*\n]{2,90}:)\*\s+/g, '$1\n- **$2** ')
    .replace(/([.!?])\s+\*([A-Z0-9][^*\n]{2,90}:)\*\s+/g, '$1\n- **$2** ');
}

function normalizeAiRaminMarkdownLine(line: string) {
  const compactEmphasisBulletMatch = /^\*\s*([A-Z0-9][^*\n]{2,90}:)\*\s+(.+)$/.exec(line);
  if (compactEmphasisBulletMatch) {
    return `- **${compactEmphasisBulletMatch[1]}** ${compactEmphasisBulletMatch[2]}`;
  }

  const compactListEmphasisBulletMatch = /^[-*]\s*\*\s*([A-Z0-9][^*\n]{2,90}:)\*\s+(.+)$/.exec(line);
  if (compactListEmphasisBulletMatch) {
    return `- **${compactListEmphasisBulletMatch[1]}** ${compactListEmphasisBulletMatch[2]}`;
  }

  return line;
}

function parseAiRaminMarkdown(content: string): AiRaminMarkdownBlock[] {
  const blocks: AiRaminMarkdownBlock[] = [];
  const paragraphLines: string[] = [];
  let listBlock: Extract<AiRaminMarkdownBlock, { type: 'unordered-list' | 'ordered-list' }> | null = null;

  const flushParagraph = () => {
    if (!paragraphLines.length) return;
    blocks.push({ type: 'paragraph', content: paragraphLines.join(' ').trim() });
    paragraphLines.length = 0;
  };

  const flushList = () => {
    if (!listBlock) return;
    blocks.push(listBlock);
    listBlock = null;
  };

  normalizeAiRaminMarkdownContent(content).split(/\r?\n/).forEach((rawLine) => {
    const line = normalizeAiRaminMarkdownLine(rawLine.trim());

    if (!line) {
      flushParagraph();
      flushList();
      return;
    }

    const headingMatch = /^(#{1,6})\s+(.+)$/.exec(line);
    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push({
        type: 'heading',
        level: Math.min(6, headingMatch[1].length),
        content: headingMatch[2].trim(),
      });
      return;
    }

    const unorderedMatch = /^[-*]\s+(.+)$/.exec(line);
    if (unorderedMatch) {
      flushParagraph();
      if (!listBlock || listBlock.type !== 'unordered-list') {
        flushList();
        listBlock = { type: 'unordered-list', items: [] };
      }
      listBlock.items.push(unorderedMatch[1].trim());
      return;
    }

    const orderedMatch = /^\d+[.)]\s+(.+)$/.exec(line);
    if (orderedMatch) {
      flushParagraph();
      if (!listBlock || listBlock.type !== 'ordered-list') {
        flushList();
        listBlock = { type: 'ordered-list', items: [] };
      }
      listBlock.items.push(orderedMatch[1].trim());
      return;
    }

    flushList();
    paragraphLines.push(line);
  });

  flushParagraph();
  flushList();
  return blocks;
}

function renderAiRaminInlineMarkdown(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const tokenPattern = /(`[^`]+`|\*\*[\s\S]+?\*\*|\*[^*\n]+?\*|\[[^\]]+\]\((?:https?:\/\/|mailto:|#)[^)]+\)|https?:\/\/[^\s<>)]+)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(text))) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    const key = `${keyPrefix}-${match.index}`;
    if (token.startsWith('**') && token.endsWith('**')) {
      nodes.push(<strong key={key}>{renderAiRaminInlineMarkdown(token.slice(2, -2), key)}</strong>);
    } else if (token.startsWith('*') && token.endsWith('*')) {
      nodes.push(<em key={key}>{renderAiRaminInlineMarkdown(token.slice(1, -1), key)}</em>);
    } else if (token.startsWith('`') && token.endsWith('`')) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (linkMatch) {
        const href = linkMatch[2];
        const isExternal = /^https?:\/\//.test(href);
        nodes.push(
          <a key={key} href={href} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noreferrer' : undefined}>
            {linkMatch[1]}
          </a>,
        );
      } else if (/^https?:\/\//.test(token)) {
        const trailingPunctuationMatch = token.match(/[.,;:!?]+$/);
        const trailingPunctuation = trailingPunctuationMatch?.[0] ?? '';
        const href = trailingPunctuation ? token.slice(0, -trailingPunctuation.length) : token;
        nodes.push(
          <a key={key} href={href} target="_blank" rel="noreferrer">
            {href}
          </a>,
        );
        if (trailingPunctuation) nodes.push(trailingPunctuation);
      } else {
        nodes.push(token);
      }
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function AiRaminMessageMarkdown({ content }: { content: string }) {
  const blocks = useMemo(() => parseAiRaminMarkdown(content), [content]);

  return (
    <div className="ai-ramin-message-markdown">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          const HeadingTag = `h${Math.min(Math.max(block.level, 3), 4)}` as 'h3' | 'h4';
          return (
            <HeadingTag key={`heading-${index}`}>
              {renderAiRaminInlineMarkdown(block.content, `heading-${index}`)}
            </HeadingTag>
          );
        }

        if (block.type === 'unordered-list') {
          return (
            <ul key={`ul-${index}`}>
              {block.items.map((item, itemIndex) => (
                <li key={`ul-${index}-${itemIndex}`}>
                  {renderAiRaminInlineMarkdown(item, `ul-${index}-${itemIndex}`)}
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === 'ordered-list') {
          return (
            <ol key={`ol-${index}`}>
              {block.items.map((item, itemIndex) => (
                <li key={`ol-${index}-${itemIndex}`}>
                  {renderAiRaminInlineMarkdown(item, `ol-${index}-${itemIndex}`)}
                </li>
              ))}
            </ol>
          );
        }

        return <p key={`p-${index}`}>{renderAiRaminInlineMarkdown(block.content, `p-${index}`)}</p>;
      })}
    </div>
  );
}

function AiRaminMarkdownParagraph({
  content,
  className,
  keyPrefix,
}: {
  content: string;
  className?: string;
  keyPrefix: string;
}) {
  return <p className={className}>{renderAiRaminInlineMarkdown(content, keyPrefix)}</p>;
}

function AiRaminSoftCtaRow({
  response,
  disabled,
  onSelect,
}: {
  response: AiRaminStructuredResponse;
  disabled: boolean;
  onSelect: (action: AiRaminSoftCtaId, response: AiRaminStructuredResponse) => void;
}) {
  const ctas = useMemo(() => getAiRaminSoftCtas(response), [response]);
  const presentation = useMemo(() => getAiRaminAnswerPresentation(response), [response]);

  if (!ctas.length) return null;

  return (
    <div
      className={`ai-ramin-soft-cta-row ${presentation.isWeak ? 'is-minimal' : ''}`}
      aria-label="Suggested next actions"
    >
      {ctas.map((cta) => (
        <button
          key={cta.id}
          type="button"
          onClick={() => onSelect(cta.id, response)}
          disabled={disabled}
        >
          {cta.label}
        </button>
      ))}
    </div>
  );
}

function AiRaminAnswerFeedback({
  messageId,
  response,
  userPrompt,
  disabled,
}: {
  messageId: string;
  response: AiRaminStructuredResponse;
  userPrompt: string;
  disabled: boolean;
}) {
  const [selectedFeedback, setSelectedFeedback] = useState<AiRaminFeedbackValue | null>(null);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<AiRaminFeedbackStatus>('idle');
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  const submitFeedback = useCallback(
    async (feedback: AiRaminFeedbackValue, feedbackNote = '') => {
      if (disabled || status === 'submitting') return;

      setSelectedFeedback(feedback);
      setStatus('submitting');

      try {
        const sourceMetadata = response.sourceMetadata;
        const answerShape = sourceMetadata?.answerShape ?? {
          primaryQuestionType: undefined,
          answerTechniqueId: undefined,
          answerFrameId: response.answerFrame?.id,
          answerFamily: response.answerFrame?.answerFamily,
          softCtas: response.answerFrame?.softCtas,
        };
        const apiResponse = await fetch('/api/ai-ramin/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            feedback,
            note: feedbackNote,
            messageId,
            userPrompt,
            answer: response.sections.short_answer,
            requestType: response.requestType,
            mode: response.mode,
            model: response.model,
            answerShape,
            evidenceCardCount: sourceMetadata?.evidenceCardCount ?? response.evidenceCards.length,
            answerableEvidenceCount: sourceMetadata?.answerableEvidenceCount,
            contextChunkCount: sourceMetadata?.contextChunkCount,
            contextTruncated: sourceMetadata?.contextTruncated,
          }),
        });
        const payload = (await apiResponse.json().catch(() => null)) as { error?: string } | null;

        if (!apiResponse.ok) {
          throw new Error(payload?.error || 'Feedback could not be saved.');
        }

        setStatus('saved');
        setIsNoteOpen(false);
      } catch {
        setStatus('failed');
      }
    },
    [disabled, messageId, response, status, userPrompt],
  );

  const handleNeedsReview = useCallback(() => {
    setSelectedFeedback('needs_review');
    setIsNoteOpen(true);
    setStatus('idle');
  }, []);

  return (
    <div className="ai-ramin-answer-feedback" aria-label="Answer feedback">
      <div className="ai-ramin-answer-feedback-row">
        <span>{status === 'saved' ? 'Feedback saved' : status === 'failed' ? 'Feedback did not save' : 'Was this useful?'}</span>
        <button
          type="button"
          className={selectedFeedback === 'helpful' ? 'is-active' : ''}
          onClick={() => void submitFeedback('helpful')}
          disabled={disabled || status === 'submitting'}
        >
          Yes
        </button>
        <button
          type="button"
          className={selectedFeedback === 'needs_review' ? 'is-active' : ''}
          onClick={handleNeedsReview}
          disabled={disabled || status === 'submitting'}
        >
          Needs work
        </button>
      </div>
      {isNoteOpen ? (
        <div className="ai-ramin-answer-feedback-note">
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="What was missing or off?"
            rows={2}
            maxLength={1000}
          />
          <button
            type="button"
            onClick={() => void submitFeedback('needs_review', note)}
            disabled={disabled || status === 'submitting'}
          >
            {status === 'submitting' ? 'Saving' : 'Send feedback'}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function getInlineItems(items: string[] | undefined, limit = 3) {
  const seenItems = new Set<string>();
  const uniqueItems: string[] = [];

  for (const item of items ?? []) {
    const normalized = item.trim().replace(/\s+/g, ' ').toLowerCase();
    if (!normalized || seenItems.has(normalized)) continue;
    seenItems.add(normalized);
    uniqueItems.push(item);
  }

  return uniqueItems.slice(0, limit);
}

function AiRaminInlineModule({ title, kicker, defaultOpen = false, className = '', children }: AiRaminInlineModuleProps) {
  return (
    <details className={`ai-ramin-inline-module ${className}`.trim()} {...(defaultOpen ? { open: true } : {})}>
      <summary>
        <span>{title}</span>
        {kicker ? <small>{kicker}</small> : null}
      </summary>
      <div className="ai-ramin-inline-module-body">{children}</div>
    </details>
  );
}

function AiRaminInlineList({
  label,
  items,
  limit = 3,
}: {
  label: string;
  items: string[] | undefined;
  limit?: number;
}) {
  const visibleItems = getInlineItems(items, limit);
  if (!visibleItems.length) return null;

  return (
    <div className="ai-ramin-inline-list">
      <span>{label}</span>
      <ul>
        {visibleItems.map((item, index) => (
          <li key={`${label}-${index}`}>{renderAiRaminInlineMarkdown(item, `${label}-${index}`)}</li>
        ))}
      </ul>
      {getInlineItems(items, Number.POSITIVE_INFINITY).length > visibleItems.length ? (
        <small>+{getInlineItems(items, Number.POSITIVE_INFINITY).length - visibleItems.length} more in context</small>
      ) : null}
    </div>
  );
}

function AiRaminInlineEvidenceUsed({ cards }: { cards: AiRaminEvidenceCard[] }) {
  const visibleCards = cards.slice(0, 3);
  if (!visibleCards.length) return null;

  return (
    <div className="ai-ramin-inline-evidence-anchors" aria-label="Evidence anchors">
      {visibleCards.map((card) => {
        const label = `${getEvidenceTypeLabel(card.type)} · ${getConfidenceLabel(card.confidence)}`;
        const content = (
          <>
            <span>{label}</span>
            <strong>{card.title}</strong>
          </>
        );

        return card.public_url ? (
          <a key={`${card.source_path ?? card.title}-${card.confidence}`} href={card.public_url} target="_blank" rel="noreferrer">
            {content}
          </a>
        ) : (
          <div key={`${card.source_path ?? card.title}-${card.confidence}`}>
            {content}
          </div>
        );
      })}
      {cards.length > visibleCards.length ? <small>+{cards.length - visibleCards.length} more evidence anchors</small> : null}
    </div>
  );
}

function shouldRequestAiRaminDebugTrace() {
  return (
    import.meta.env.DEV &&
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('aiRaminDebug')
  );
}

function AiRaminInlineDebugDrawer({ response }: { response: AiRaminStructuredResponse }) {
  const shouldShowDebug = shouldRequestAiRaminDebugTrace();

  if (!shouldShowDebug || !response.sourceMetadata) return null;

  const sourceMetadata = response.sourceMetadata;
  const debugTrace = sourceMetadata.debugTrace;
  const routingTrace = debugTrace?.routing ?? sourceMetadata.routing;
  const intentRoute = debugTrace?.intentRoute ?? sourceMetadata.intentRoute ?? routingTrace?.intentRoute;
  const selectedStory = debugTrace?.selectedStory ?? sourceMetadata.selectedStory;
  const selectedChunks = debugTrace?.retrieval?.selectedChunks?.slice(0, 6) ?? [];

  return (
    <details className="ai-ramin-inline-debug-drawer">
      <summary>Debug context</summary>
      <div>
        <span>{response.model}</span>
        <span>{getRequestTypeLabel(response.requestType)}</span>
        <span>{sourceMetadata.contextChunkCount} chunks</span>
        <span>{sourceMetadata.evidenceCardCount ?? response.evidenceCards.length} cards</span>
        {sourceMetadata.answerShape?.primaryQuestionType ? <span>{sourceMetadata.answerShape.primaryQuestionType}</span> : null}
        {sourceMetadata.answerShape?.answerFrameId || response.answerFrame?.id ? (
          <span>{sourceMetadata.answerShape?.answerFrameId ?? response.answerFrame?.id}</span>
        ) : null}
        {sourceMetadata.answerShape?.answerFamily || response.answerFrame?.answerFamily ? (
          <span>{sourceMetadata.answerShape?.answerFamily ?? response.answerFrame?.answerFamily}</span>
        ) : null}
        <span>{sourceMetadata.contextTruncated ? 'truncated' : 'full context'}</span>
        {sourceMetadata.recoveryStrategy ? <span>{sourceMetadata.recoveryStrategy}</span> : null}
        {selectedStory?.title ? <span>lead story: {selectedStory.title}</span> : null}
      </div>
      {routingTrace ? (
        <div>
          <span>{routingTrace.router ?? 'router unknown'}</span>
          {intentRoute?.intent ? <span>intent {intentRoute.intent}</span> : null}
          {intentRoute?.suggestedTone ? <span>tone {intentRoute.suggestedTone}</span> : null}
          {typeof routingTrace.confidence === 'number' ? (
            <span>{Math.round(routingTrace.confidence * 100)}% route confidence</span>
          ) : null}
          {routingTrace.reason ? <span>{routingTrace.reason}</span> : null}
          {routingTrace.classifier ? (
            <span>
              classifier {routingTrace.classifier.attempted ? 'attempted' : 'skipped'}
              {routingTrace.classifier.used ? ' and used' : ''}
            </span>
          ) : null}
          {routingTrace.classifier?.fallbackReason ? <span>{routingTrace.classifier.fallbackReason}</span> : null}
          {typeof routingTrace.classifier?.acceptanceThreshold === 'number' ? (
            <span>{Math.round(routingTrace.classifier.acceptanceThreshold * 100)}% acceptance threshold</span>
          ) : null}
          {routingTrace.conversationContext?.isFollowUp ? (
            <span>
              follow-up from {routingTrace.conversationContext.inheritedIntent || 'prior context'}
            </span>
          ) : null}
          <span>{routingTrace.retrievalRan ? 'retrieval ran' : 'retrieval skipped'}</span>
          <span>{routingTrace.modelCalled ? 'model called' : 'model skipped'}</span>
          {routingTrace.fallthroughToPortfolioOverview ? <span>portfolio overview fallthrough</span> : null}
        </div>
      ) : null}
      {selectedStory ? (
        <div>
          {selectedStory.storyType ? <span>{selectedStory.storyType}</span> : null}
          {typeof selectedStory.selectionScore === 'number' ? <span>score {selectedStory.selectionScore}</span> : null}
          {selectedStory.reason ? <span>{selectedStory.reason}</span> : null}
          {selectedStory.sourcePath ? <code>{selectedStory.sourcePath}</code> : null}
        </div>
      ) : null}
      {debugTrace ? (
        <div>
          <span>trace {debugTrace.traceId}</span>
          <span>{debugTrace.sufficiency?.verdict ?? 'unknown'} evidence</span>
          <span>
            {debugTrace.sufficiency?.answerableEvidenceCount ?? sourceMetadata.answerableEvidenceCount ?? 0}/
            {debugTrace.sufficiency?.minimumAnswerableEvidence ?? '?'} answerable
          </span>
          <span>{debugTrace.recovery?.applied ? 'recovered' : 'not recovered'}</span>
          {debugTrace.recovery?.reason ? <span>{debugTrace.recovery.reason}</span> : null}
        </div>
      ) : null}
      {selectedChunks.length ? (
        <ol>
          {selectedChunks.map((chunk, index) => (
            <li key={`${chunk.sourcePath ?? chunk.title ?? 'chunk'}-${index}`}>
              <strong>{chunk.title ?? 'Untitled source'}</strong>
              <span>
                {chunk.sourceRole ?? 'source'} · {chunk.confidence ?? 'unknown'} · {chunk.retrievalPriority ?? 'priority n/a'}
              </span>
              {chunk.sourcePath ? <code>{chunk.sourcePath}</code> : null}
            </li>
          ))}
        </ol>
      ) : null}
      {debugTrace?.sections?.rawShortAnswerPreview ? (
        <p>{debugTrace.sections.rawShortAnswerPreview}</p>
      ) : null}
      {debugTrace?.sections?.finalShortAnswerPreview ? (
        <p>{debugTrace.sections.finalShortAnswerPreview}</p>
      ) : null}
      {debugTrace?.retrieval?.contextSources?.length ? (
        <div>
          {debugTrace.retrieval.contextSources.slice(0, 8).map((sourcePath) => (
            <code key={sourcePath}>{sourcePath}</code>
          ))}
        </div>
      ) : null}
      {(sourceMetadata.answerShape?.softCtas?.length || response.answerFrame?.softCtas?.length) ? (
        <div>
          {(sourceMetadata.answerShape?.softCtas ?? response.answerFrame?.softCtas ?? []).map((softCta) => (
            <span key={softCta}>{softCta}</span>
          ))}
        </div>
      ) : null}
    </details>
  );
}

function AiRaminInlineEvidenceDisclosure({
  response,
  presentation = getAiRaminAnswerPresentation(response),
}: {
  response: AiRaminStructuredResponse;
  presentation?: AiRaminAnswerPresentation;
}) {
  const evidenceLookup = response.evidenceLookupAnalysis;
  const proofItems = evidenceLookup?.strongest_verified_proof ?? response.sections.verified_proof;
  const supportingItems = evidenceLookup?.supporting_evidence ?? [];
  const publicLinks = evidenceLookup?.public_links ?? [];
  const boundaryItems = [
    ...response.sections.confidential_boundary,
    ...response.sections.open_questions,
    ...(evidenceLookup?.missing_evidence ?? []),
  ];

  if (!presentation.shouldShowEvidenceDisclosure) return null;

  const title = 'View evidence';
  const kicker = getAiRaminEvidenceDisclosureKicker(response, presentation);

  return (
    <AiRaminInlineModule
      title={title}
      kicker={kicker}
      defaultOpen={false}
      className={`ai-ramin-evidence-disclosure ${presentation.isWeak ? 'is-simplified' : ''}`}
    >
      {!presentation.isWeak && evidenceLookup?.source_filters?.length ? (
        <div className="ai-ramin-inline-source-row">
          {getInlineItems(evidenceLookup.source_filters, 5).map((sourceFilter, index) => (
            <small key={`${sourceFilter}-${index}`}>{sourceFilter}</small>
          ))}
        </div>
      ) : null}
      <div className="ai-ramin-evidence-disclosure-grid">
        {response.evidenceCards.length ? (
          <section className="ai-ramin-evidence-disclosure-section">
            <span>Evidence used</span>
            <AiRaminInlineEvidenceUsed cards={response.evidenceCards} />
          </section>
        ) : null}
        {proofItems.length ? (
          <section className="ai-ramin-evidence-disclosure-section">
            <span>Supporting context</span>
            <AiRaminInlineList label="Context" items={proofItems} limit={presentation.isWeak ? 2 : 3} />
          </section>
        ) : null}
        {!presentation.isWeak && supportingItems.length ? (
          <section className="ai-ramin-evidence-disclosure-section">
            <span>Supporting</span>
            <AiRaminInlineList label="Supporting" items={supportingItems} limit={2} />
          </section>
        ) : null}
        {publicLinks.length ? (
          <section className="ai-ramin-evidence-disclosure-section">
            <span>Links</span>
            <AiRaminInlineList label="Public links" items={publicLinks} limit={presentation.isWeak ? 2 : 3} />
          </section>
        ) : null}
        {!presentation.isWeak && response.sections.inferred_fit.length ? (
          <section className="ai-ramin-evidence-disclosure-section">
            <span>Inferred fit</span>
            <AiRaminInlineList label="Inferred" items={response.sections.inferred_fit} limit={3} />
          </section>
        ) : null}
        {boundaryItems.length ? (
          <section className="ai-ramin-evidence-disclosure-section">
            <span>Boundaries</span>
            <AiRaminInlineList label="Boundary" items={boundaryItems} limit={presentation.isWeak ? 2 : 3} />
          </section>
        ) : null}
      </div>
      <AiRaminInlineDebugDrawer response={response} />
    </AiRaminInlineModule>
  );
}

function AiRaminInlineRoleFitModule({ response }: { response: AiRaminStructuredResponse }) {
  const roleFit = response.roleFitAnalysis;
  if (!roleFit) return null;

  return (
    <AiRaminInlineModule title="Role fit" kicker="work proof, project proof, interview focus" defaultOpen>
      <AiRaminMarkdownParagraph
        content={roleFit.role_summary}
        className="ai-ramin-inline-summary"
        keyPrefix="role-fit-summary"
      />
      <div className="ai-ramin-inline-grid">
        <AiRaminInlineList label="Work proof" items={roleFit.strongest_work_evidence} limit={2} />
        <AiRaminInlineList label="Project proof" items={roleFit.strongest_project_evidence} limit={2} />
        <AiRaminInlineList label="Strengths" items={roleFit.ai_pm_strengths} limit={2} />
        <AiRaminInlineList label="Questions" items={roleFit.likely_gaps_or_questions} limit={2} />
        <AiRaminInlineList label="First 90 days" items={roleFit.first_90_days} limit={2} />
        <AiRaminInlineList label="Interview focus" items={roleFit.interview_questions} limit={2} />
      </div>
    </AiRaminInlineModule>
  );
}

function AiRaminInlineProductJudgmentModule({ response }: { response: AiRaminStructuredResponse }) {
  const productJudgment = response.productJudgmentAnalysis;
  if (!productJudgment) return null;

  return (
    <AiRaminInlineModule title="Product judgment" kicker="MVP, risks, evals" defaultOpen>
      <AiRaminMarkdownParagraph
        content={productJudgment.scenario_summary}
        className="ai-ramin-inline-summary"
        keyPrefix="product-judgment-summary"
      />
      <div className="ai-ramin-inline-layer-row" aria-label="AI product operating layers">
        {[
          ['Model', productJudgment.model_layer],
          ['Context', productJudgment.context_layer],
          ['Orchestration', productJudgment.orchestration_layer],
          ['Governance', productJudgment.governance_layer],
          ['Human', productJudgment.human_layer],
        ].map(([label, items]) => (
          <span key={label}>{`${label}: ${(items as string[])[0] ?? 'No note returned'}`}</span>
        ))}
      </div>
      <div className="ai-ramin-inline-grid">
        <AiRaminInlineList label="MVP path" items={productJudgment.recommended_mvp_path} limit={2} />
        <AiRaminInlineList label="Risks" items={productJudgment.riskiest_assumptions} limit={2} />
        <AiRaminInlineList label="Evals" items={productJudgment.eval_and_guardrail_plan} limit={2} />
        <AiRaminInlineList label="Tradeoffs" items={productJudgment.key_tradeoffs} limit={2} />
      </div>
    </AiRaminInlineModule>
  );
}

function AiRaminInlineBriefModule({ response }: { response: AiRaminStructuredResponse }) {
  const briefSeed = response.briefSeed;
  const copyReadyBrief = useMemo(() => buildHiringBriefMarkdown(briefSeed), [briefSeed]);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'manual'>('idle');
  const [isCopyFallbackOpen, setIsCopyFallbackOpen] = useState(false);
  const copyFallbackRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setCopyStatus('idle');
    setIsCopyFallbackOpen(false);
  }, [copyReadyBrief]);

  useEffect(() => {
    if (!isCopyFallbackOpen) return;

    window.requestAnimationFrame(() => {
      copyFallbackRef.current?.focus();
      copyFallbackRef.current?.select();
    });
  }, [isCopyFallbackOpen]);

  const handleCopyBrief = useCallback(async () => {
    if (!copyReadyBrief) return;

    if (await copyAiRaminText(copyReadyBrief)) {
      setCopyStatus('copied');
      setIsCopyFallbackOpen(false);
      return;
    }

    setCopyStatus('manual');
    setIsCopyFallbackOpen(true);
  }, [copyReadyBrief]);

  if (!briefSeed) return null;

  const proofAnchors = briefSeed.selectedProofAnchors?.length
    ? briefSeed.selectedProofAnchors
    : briefSeed.evidenceCardTitles;

  return (
    <AiRaminInlineModule title="Hiring brief" kicker="copy-ready summary" defaultOpen>
      <div className="ai-ramin-inline-brief-head">
        <div>
          <strong>{briefSeed.headline || 'Hiring brief: Ramin Hoodeh'}</strong>
          <AiRaminMarkdownParagraph content={briefSeed.whyRaminFits} keyPrefix="hiring-brief-why" />
        </div>
        <button type="button" onClick={handleCopyBrief} disabled={!copyReadyBrief}>
          {copyStatus === 'copied' ? 'Copied' : copyStatus === 'manual' ? 'Select text' : 'Copy brief'}
        </button>
      </div>
      {isCopyFallbackOpen ? (
        <textarea
          ref={copyFallbackRef}
          className="ai-ramin-inline-brief-copy-fallback"
          value={copyReadyBrief}
          aria-label="Copy-ready hiring brief"
          readOnly
          onFocus={(event) => event.currentTarget.select()}
        />
      ) : null}
      <div className="ai-ramin-inline-grid">
        <AiRaminInlineList label="Proof" items={briefSeed.mostRelevantProof} limit={2} />
        <AiRaminInlineList label="Projects" items={briefSeed.relevantProjects} limit={2} />
        <AiRaminInlineList label="Risks" items={briefSeed.risksOrQuestions} limit={2} />
        <AiRaminInlineList label="Interview" items={briefSeed.suggestedInterviewFocus} limit={2} />
      </div>
      {proofAnchors.length ? (
        <div className="ai-ramin-inline-source-row">
          {proofAnchors.slice(0, 4).map((anchor, index) => (
            <small key={`${anchor}-${index}`}>{anchor}</small>
          ))}
        </div>
      ) : null}
    </AiRaminInlineModule>
  );
}

function AiRaminInlineStructuredModules({
  response,
  presentation = getAiRaminAnswerPresentation(response),
}: {
  response: AiRaminStructuredResponse;
  presentation?: AiRaminAnswerPresentation;
}) {
  const showStructuredModules = presentation.shouldShowStructuredModules;
  const showEvidenceDisclosure = presentation.shouldShowEvidenceDisclosure;

  if (!showStructuredModules && !showEvidenceDisclosure) return null;

  return (
    <div
      className={`ai-ramin-inline-modules ${presentation.isWeak ? 'is-simplified' : ''}`}
      aria-label="Structured answer modules"
    >
      {showStructuredModules ? (
        <>
          <AiRaminInlineRoleFitModule response={response} />
          <AiRaminInlineProductJudgmentModule response={response} />
          <AiRaminInlineBriefModule response={response} />
        </>
      ) : null}
      {showEvidenceDisclosure ? <AiRaminInlineEvidenceDisclosure response={response} presentation={presentation} /> : null}
    </div>
  );
}

function AiRaminTahoeFilter({ id }: { id: string }) {
  return (
    <svg className="tahoe-glass-filter-defs" aria-hidden="true" focusable="false">
      <filter id={id} primitiveUnits="objectBoundingBox">
        <feTurbulence type="fractalNoise" baseFrequency="0.018 0.044" numOctaves="2" seed="23" result="grain" />
        <feColorMatrix
          in="grain"
          type="matrix"
          values="
            0.16 0 0 0 0.42
            0 0.16 0 0 0.42
            0 0 0.16 0 0.42
            0 0 0 1 0"
          result="map"
        />
        <feGaussianBlur in="SourceGraphic" stdDeviation="0.01" result="blur" />
        <feDisplacementMap in="blur" in2="map" scale="0.18" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}

function AiRaminConsiderationsPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <>
      <button
        type="button"
        className={`ai-ramin-considerations-backdrop ${isOpen ? 'is-open' : ''}`}
        aria-label="Close AI Ramin build considerations"
        aria-hidden={!isOpen}
        onClick={onClose}
        tabIndex={isOpen ? 0 : -1}
      />
      <aside
        id="ai-ramin-considerations"
        className={`ai-ramin-considerations-panel ${isOpen ? 'is-open' : ''}`}
        aria-hidden={!isOpen}
      >
        <div className="ai-ramin-considerations-header">
          <div>
            <p>Build logic</p>
            <h3>How AI Ramin works</h3>
          </div>
          <button type="button" onClick={onClose} tabIndex={isOpen ? 0 : -1}>
            Close
          </button>
        </div>
        <p className="ai-ramin-considerations-summary">
          This is the product-management layer behind the chatbot: what it can answer, how the context is structured,
          where the guardrails sit, and why the generation settings are deliberately conservative.
        </p>
        <div className="ai-ramin-considerations-list">
          {aiRaminBuildConsiderations.map((item) => (
            <article key={item.label} className="ai-ramin-consideration-card">
              <span className="ai-ramin-consideration-index">{item.label}</span>
              <div className="ai-ramin-consideration-main">
                <div className="ai-ramin-consideration-chip-row">
                  {item.chips.map((chip) => (
                    <span key={chip} className="case-writeup-chip">
                      {chip}
                    </span>
                  ))}
                </div>
                <h4>{item.title}</h4>
                <p>{item.body}</p>
                <div className="ai-ramin-consideration-proof">
                  {item.proof.map((proofItem) => (
                    <div key={proofItem.label}>
                      <span>{proofItem.label}</span>
                      <p>{proofItem.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </aside>
    </>
  );
}

function AiRaminModeSelector({
  selectedMode,
  onSelectMode,
}: {
  selectedMode: AiRaminHiringModeId;
  onSelectMode: (mode: AiRaminHiringModeId) => void;
}) {
  return (
    <div className="ai-ramin-control-group">
      <div className="ai-ramin-control-heading">
        <span>Visitor lens</span>
        <strong>{findHiringMode(selectedMode).label}</strong>
      </div>
      <div className="ai-ramin-mode-grid" role="radiogroup" aria-label="AI Ramin visitor lens">
        {aiRaminPrototype.hiringModes.map((mode) => (
          <button
            key={mode.id}
            type="button"
            className={`ai-ramin-mode-button ${selectedMode === mode.id ? 'is-active' : ''}`}
            aria-checked={selectedMode === mode.id}
            role="radio"
            onClick={() => onSelectMode(mode.id)}
          >
            <span>{mode.label}</span>
            <small>{mode.proofBias.slice(0, 2).join(' / ')}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

function AiRaminComposerLensControl({
  selectedMode,
  selectedRequestType,
  isOpen,
  onOpen,
}: {
  selectedMode: AiRaminHiringModeId;
  selectedRequestType: AiRaminRequestType;
  isOpen: boolean;
  onOpen: () => void;
}) {
  const modeLabel = findHiringMode(selectedMode).label;
  const requestLabel = getRequestTypeLabel(selectedRequestType);

  return (
    <button
      type="button"
      className={`ai-ramin-composer-lens ${isOpen ? 'is-active' : ''}`}
      aria-expanded={isOpen}
      aria-controls="ai-ramin-context-panel"
      onClick={onOpen}
    >
      <span>Lens</span>
      <strong>{modeLabel}</strong>
      <small>{requestLabel}</small>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d={isOpen ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6'} />
      </svg>
    </button>
  );
}

function AiRaminRequestTypeSelector({
  selectedRequestType,
  onSelectRequestType,
}: {
  selectedRequestType: AiRaminRequestType;
  onSelectRequestType: (requestType: AiRaminRequestType) => void;
}) {
  return (
    <div className="ai-ramin-control-group">
      <div className="ai-ramin-control-heading">
        <span>Request type</span>
        <strong>{getRequestTypeLabel(selectedRequestType)}</strong>
      </div>
      <div className="ai-ramin-request-grid">
        {aiRaminPrototype.requestTypes.map((requestType) => (
          <button
            key={requestType.id}
            type="button"
            className={`ai-ramin-request-button ${selectedRequestType === requestType.id ? 'is-active' : ''}`}
            onClick={() => onSelectRequestType(requestType.id)}
          >
            <span>{requestType.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function AiRaminContextPanel({
  isOpen,
  onClose,
  selectedMode,
  onSelectMode,
  selectedRequestType,
  onSelectRequestType,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedMode: AiRaminHiringModeId;
  onSelectMode: (mode: AiRaminHiringModeId) => void;
  selectedRequestType: AiRaminRequestType;
  onSelectRequestType: (requestType: AiRaminRequestType) => void;
}) {
  return (
    <>
      <button
        type="button"
        className={`ai-ramin-context-backdrop ${isOpen ? 'is-open' : ''}`}
        aria-label="Close AI Ramin lens panel"
        aria-hidden={!isOpen}
        onClick={onClose}
        tabIndex={isOpen ? 0 : -1}
      />
      <aside
        id="ai-ramin-context-panel"
        className={`ai-ramin-context-panel ${isOpen ? 'is-open' : ''}`}
        aria-hidden={!isOpen}
      >
        <div className="ai-ramin-context-panel-header">
          <div>
            <p>Context</p>
            <h3>Lens and request</h3>
          </div>
          <button type="button" onClick={onClose} tabIndex={isOpen ? 0 : -1}>
            Close
          </button>
        </div>
        <div className="ai-ramin-context-panel-body">
          <div className="ai-ramin-control-panel" aria-label="AI Ramin controls">
            <AiRaminModeSelector selectedMode={selectedMode} onSelectMode={onSelectMode} />
            <AiRaminRequestTypeSelector
              selectedRequestType={selectedRequestType}
              onSelectRequestType={onSelectRequestType}
            />
          </div>
        </div>
      </aside>
    </>
  );
}

export function AiRaminSection() {
  const chatbot = portfolioContent.aiRaminChatbot;
  const [prompt, setPrompt] = useState('');
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(true);
  const [selectedMode, setSelectedMode] = useState<AiRaminHiringModeId>('hiring-manager');
  const [selectedRequestType, setSelectedRequestType] = useState<AiRaminRequestType>('general_chat');
  const [messages, setMessages] = useState<AiRaminMessage[]>(() => [
    {
      id: 'assistant-intro',
      role: 'assistant',
      content: `${aiRaminPrototype.headline}\n\n${aiRaminPrototype.description}`,
      isIntro: true,
    },
  ]);
  const [isSending, setIsSending] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [chatError, setChatError] = useState<string | null>(null);
  const [isConsiderationsOpen, setIsConsiderationsOpen] = useState(false);
  const [isContextPanelOpen, setIsContextPanelOpen] = useState(false);
  const promptInputRef = useRef<HTMLTextAreaElement | null>(null);
  const threadEndRef = useRef<HTMLDivElement | null>(null);
  const examplePrompts = aiRaminPrototype.examplePrompts.slice(0, 4);
  const hasChatStarted = messages.some((message) => !message.isIntro);
  const visibleMessages = useMemo(
    () => messages.filter((message) => !message.isIntro || !hasChatStarted),
    [hasChatStarted, messages],
  );
  const isStructuredRequest =
    selectedRequestType === 'role_fit' ||
    selectedRequestType === 'product_judgment' ||
    selectedRequestType === 'evidence_lookup' ||
    selectedRequestType === 'hiring_brief';
  const eyebrowFilterId = `ai-ramin-tahoe-eyebrow-${useId().replace(/:/g, '')}`;
  const eyebrowFilterStyle: AiRaminGlassButtonStyle = { '--tahoe-glass-filter': `url(#${eyebrowFilterId})` };
  const loadingMessage = aiRaminLoadingMessages[loadingMessageIndex] ?? aiRaminLoadingMessages[0];

  useEffect(() => {
    const input = promptInputRef.current;
    if (!input) return;

    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 132)}px`;
  }, [prompt]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [messages, isSending, chatError]);

  useEffect(() => {
    if (!isSending) {
      setLoadingMessageIndex(0);
      return undefined;
    }

    setLoadingMessageIndex(0);
    const loadingTextTimer = window.setInterval(() => {
      setLoadingMessageIndex((currentIndex) => (currentIndex + 1) % aiRaminLoadingMessages.length);
    }, 1800);

    return () => window.clearInterval(loadingTextTimer);
  }, [isSending]);

  const sendMessage = useCallback(
    async (messageOverride?: string, options?: AiRaminSendMessageOptions) => {
      const messageText = (messageOverride ?? prompt).trim();
      if (!messageText || isSending) return;
      const requestMode = options?.hiringMode ?? selectedMode;
      const requestType = options?.requestType ?? selectedRequestType;

      const requestHistory = messages
        .filter((message) => !message.isIntro)
        .map((message) => ({
          role: message.role,
          content: message.content,
          metadata: message.response
            ? {
                requestType: message.response.requestType,
                mode: message.response.mode,
                intentRoute: message.response.sourceMetadata?.intentRoute ?? message.response.sourceMetadata?.routing?.intentRoute,
                answerShape: message.response.sourceMetadata?.answerShape,
                selectedStory: message.response.sourceMetadata?.selectedStory,
                evidenceCardTitles: message.response.evidenceCards.map((card) => card.title).slice(0, 6),
              }
            : undefined,
        }));
      const userMessage: AiRaminMessage = {
        id: createAiRaminMessageId('user'),
        role: 'user',
        content: messageText,
      };

      setMessages((currentMessages) => [...currentMessages, userMessage]);
      setPrompt('');
      setChatError(null);
      setIsSuggestionsOpen(false);
      setIsSending(true);

      try {
        const response = await fetch('/api/ai-ramin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: messageText,
            history: requestHistory,
            hiringMode: requestMode,
            requestType: requestType === 'general_chat' ? undefined : requestType,
            debug: shouldRequestAiRaminDebugTrace(),
          }),
        });
        const responsePayload = normalizeAiRaminClientResponse(
          (await response.json().catch(() => null)) as AiRaminApiResponse | null,
        );

        if (!response.ok) {
          throw new Error(responsePayload?.error || 'AI Ramin could not answer that yet.');
        }

        if (responsePayload?.mode) setSelectedMode(responsePayload.mode);
        if (responsePayload?.requestType) setSelectedRequestType(responsePayload.requestType);
        const responseIntent =
          responsePayload?.sourceMetadata?.intentRoute?.intent ||
          responsePayload?.sourceMetadata?.routing?.intentRoute?.intent;
        const responseQuestionType =
          responsePayload?.sourceMetadata?.intentRoute?.sourceQuestionType ||
          responsePayload?.sourceMetadata?.routing?.primaryQuestionType ||
          responsePayload?.sourceMetadata?.answerShape?.primaryQuestionType ||
          responsePayload?.sourceMetadata?.debugTrace?.intent?.primaryQuestionType;

        setMessages((currentMessages) => [
          ...currentMessages,
          {
            id: createAiRaminMessageId('assistant'),
            role: 'assistant',
            content: String(responsePayload?.answer || '').trim(),
            response: responsePayload ?? undefined,
          },
        ]);
        if (
          responseIntent === 'casual_chat' ||
          responseIntent === 'clarification_needed' ||
          responseQuestionType === 'conversation_open' ||
          responseQuestionType === 'clarification_needed'
        ) {
          setIsSuggestionsOpen(true);
        }
      } catch (error) {
        setChatError(error instanceof Error ? error.message : 'AI Ramin could not answer that yet.');
      } finally {
        setIsSending(false);
      }
    },
    [isSending, messages, prompt, selectedMode, selectedRequestType],
  );

  const insertExamplePrompt = useCallback((examplePrompt: string) => {
    setPrompt(examplePrompt);
    setChatError(null);
    setIsSuggestionsOpen(false);

    window.requestAnimationFrame(() => {
      const input = promptInputRef.current;
      if (!input) return;

      input.focus();
      const placeholderStart = examplePrompt.indexOf('[');
      const placeholderEnd = examplePrompt.indexOf(']', placeholderStart);
      if (placeholderStart >= 0 && placeholderEnd > placeholderStart) {
        input.setSelectionRange(placeholderStart, placeholderEnd + 1);
      } else {
        input.setSelectionRange(examplePrompt.length, examplePrompt.length);
      }
    });
  }, []);

  const fillComposer = useCallback((nextPrompt: string) => {
    setPrompt(nextPrompt);
    setChatError(null);
    setIsSuggestionsOpen(false);

    window.requestAnimationFrame(() => {
      const input = promptInputRef.current;
      if (!input) return;

      input.focus();
      const placeholderStart = nextPrompt.indexOf('[');
      const placeholderEnd = nextPrompt.indexOf(']', placeholderStart);
      if (placeholderStart >= 0 && placeholderEnd > placeholderStart) {
        input.setSelectionRange(placeholderStart, placeholderEnd + 1);
      } else {
        input.setSelectionRange(nextPrompt.length, nextPrompt.length);
      }
    });
  }, []);

  const handleRequestTypeSelect = useCallback((requestType: AiRaminRequestType) => {
    setSelectedRequestType(requestType);
    const isStructuredRequestType =
      requestType === 'role_fit' ||
      requestType === 'product_judgment' ||
      requestType === 'evidence_lookup' ||
      requestType === 'hiring_brief';
    setIsSuggestionsOpen(!isStructuredRequestType);

    const template = requestTypeTemplates[requestType];
    if (template) {
      setPrompt((currentPrompt) => currentPrompt.trim() ? currentPrompt : template);
      window.requestAnimationFrame(() => {
        const input = promptInputRef.current;
        if (!input) return;

        input.focus();
        const placeholderStart = template.indexOf('[');
        const placeholderEnd = template.indexOf(']', placeholderStart);
        if (placeholderStart >= 0 && placeholderEnd > placeholderStart) {
          input.setSelectionRange(placeholderStart, placeholderEnd + 1);
        }
      });
    }
  }, []);

  const handleSoftCta = useCallback(
    (action: AiRaminSoftCtaId, response: AiRaminStructuredResponse) => {
      setChatError(null);

      if (action === 'analyze_role_fit') {
        setSelectedRequestType('general_chat');
        fillComposer(
          'Analyze this role for Ramin. Role description: [paste role description]. Return relevant examples, likely gaps, and interview focus.',
        );
        return;
      }

      if (action === 'draft_hiring_brief' || action === 'use_in_hiring_brief') {
        const briefContext = buildHiringBriefContextFromResponse(response);
        setSelectedRequestType('hiring_brief');
        setIsSuggestionsOpen(false);
        void sendMessage(buildHiringBriefPrompt(briefContext, response), { requestType: 'hiring_brief' });
        return;
      }

      if (action === 'generate_interview_questions') {
        const answerContext = response.roleFitAnalysis?.role_summary || response.sections.short_answer;
        void sendMessage(
          [
            'Generate a concise interview follow-up set for a hiring manager based on this AI Ramin answer.',
            '',
            'Answer context:',
            answerContext,
            '',
            'Focus on questions that validate the strongest claims, clarify boundaries, and reveal whether the fit holds in the actual role context.',
          ].join('\n'),
          { requestType: 'general_chat' },
        );
        return;
      }

      if (action === 'turn_into_mvp_plan') {
        const scenarioSummary = response.productJudgmentAnalysis?.scenario_summary || response.sections.short_answer;
        void sendMessage(
          [
            'Turn the latest AI product judgment answer into a concise MVP plan.',
            '',
            'Scenario context:',
            scenarioSummary,
            '',
            'Include build sequence, success metrics, evals, guardrails, and the first human review point.',
          ].join('\n'),
          { requestType: 'product_judgment' },
        );
        return;
      }

      if (action === 'show_risks') {
        const scenarioSummary = response.productJudgmentAnalysis?.scenario_summary || response.sections.short_answer;
        void sendMessage(
          [
            'Expand only the risks and tradeoffs from the latest product judgment answer.',
            '',
            'Scenario context:',
            scenarioSummary,
            '',
            'Prioritise riskiest assumptions, model failure modes, governance issues, and user trust risks.',
          ].join('\n'),
          { requestType: 'product_judgment' },
        );
        return;
      }

      if (action === 'compare_projects') {
        const comparisonContext = response.sections.short_answer;
        void sendMessage(
          [
            "Compare Ramin's most relevant projects against this context.",
            '',
            'Context:',
            comparisonContext,
            '',
            'Return the most relevant matching projects, useful context, and gaps or questions.',
          ].join('\n'),
          { requestType: 'evidence_lookup' },
        );
        return;
      }
    },
    [fillComposer, sendMessage],
  );

  return (
    <section id="ai-ramin" className="ai-ramin-section ai-ramin-thoughts-background relative isolate h-full min-h-full overflow-hidden">
      <div className="ai-ramin-ambient" aria-hidden="true" />
      <div className="ai-ramin-page-shell relative z-10 mx-auto flex h-full min-h-0 w-full flex-col px-5 py-8 sm:px-8 md:px-12 lg:px-16">
        <SectionKicker {...sectionMarkerMeta['ai-ramin']} className="ai-ramin-section-eyebrow self-start" />
        <header className="ai-ramin-header">
          <div className="ai-ramin-header-avatar">
            <span className="ai-ramin-avatar">
              <img src={profileImageUrl} alt="" decoding="async" />
            </span>
          </div>
          <div className="ai-ramin-title-lockup">
            <h2 className="ai-ramin-title-window">{chatbot.modalTitle}</h2>
          </div>
          <div className="ai-ramin-header-action">
            <button
              type="button"
              className={`ai-ramin-eyebrow-button ${isConsiderationsOpen ? 'is-active' : ''}`}
              style={eyebrowFilterStyle}
              aria-expanded={isConsiderationsOpen}
              aria-controls="ai-ramin-considerations"
              onClick={() => setIsConsiderationsOpen((current) => !current)}
            >
              <AiRaminTahoeFilter id={eyebrowFilterId} />
              <span className="tahoe-glass-nav-lens" aria-hidden="true" />
              <span className="ai-ramin-eyebrow-label">
                <span>How it works</span>
                <svg className="ai-ramin-eyebrow-arrow" viewBox="0 0 24 24" aria-hidden="true">
                  <path d={isConsiderationsOpen ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6'} />
                </svg>
              </span>
            </button>
          </div>
        </header>

        <AiRaminConsiderationsPanel
          isOpen={isConsiderationsOpen}
          onClose={() => setIsConsiderationsOpen(false)}
        />

        <AiRaminContextPanel
          isOpen={isContextPanelOpen}
          onClose={() => setIsContextPanelOpen(false)}
          selectedMode={selectedMode}
          onSelectMode={setSelectedMode}
          selectedRequestType={selectedRequestType}
          onSelectRequestType={handleRequestTypeSelect}
        />

        <div className="ai-ramin-workspace">
          <div className="ai-ramin-chat-stage">
            <div className="ai-ramin-chat relative flex min-h-0 flex-1 flex-col">
              <div className="ai-ramin-thread" aria-live="polite">
                {visibleMessages.map((message, messageIndex) => {
                  const previousUserPrompt =
                    message.role === 'assistant'
                      ? visibleMessages
                          .slice(0, messageIndex)
                          .reverse()
                          .find((candidate) => candidate.role === 'user')?.content ?? ''
                      : '';
                  const answerPresentation = message.response ? getAiRaminAnswerPresentation(message.response) : null;
                  const shouldShowFeedback = message.response ? shouldShowAiRaminFeedback(message.response) : false;

                  return (
                    <div
                      key={message.id}
                      className={`ai-ramin-message-row ai-ramin-message-row-${message.role} ${
                        message.isIntro ? 'ai-ramin-message-row-intro' : ''
                      } ${answerPresentation?.isWeak ? 'ai-ramin-message-row-weak-answer' : ''}`}
                    >
                      {message.role === 'assistant' ? (
                        <span className="ai-ramin-avatar ai-ramin-avatar-small">
                          <img src={profileImageUrl} alt="" decoding="async" />
                        </span>
                      ) : null}
                      <div className="ai-ramin-message-stack">
                        <div
                          className={`ai-ramin-message ${message.role === 'user' ? 'ai-ramin-user-bubble' : ''} ${
                            message.isIntro ? 'ai-ramin-message-intro' : ''
                          }`}
                        >
                          <AiRaminMessageMarkdown content={message.content} />
                        </div>
                        {message.role === 'assistant' && message.response ? (
                          <>
                            <AiRaminInlineStructuredModules
                              response={message.response}
                              presentation={answerPresentation ?? undefined}
                            />
                            <AiRaminSoftCtaRow
                              response={message.response}
                              disabled={isSending}
                              onSelect={handleSoftCta}
                            />
                            {shouldShowFeedback ? (
                              <AiRaminAnswerFeedback
                                messageId={message.id}
                                response={message.response}
                                userPrompt={previousUserPrompt}
                                disabled={isSending}
                              />
                            ) : null}
                          </>
                        ) : null}
                      </div>
                    </div>
                  );
                })}

                {isSending ? (
                  <div className="ai-ramin-message-row ai-ramin-message-row-assistant">
                    <span className="ai-ramin-avatar ai-ramin-avatar-small">
                      <img src={profileImageUrl} alt="" decoding="async" />
                    </span>
                    <div className="ai-ramin-message ai-ramin-message-compact">
                      <span className="ai-ramin-thinking-dots" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                      </span>
                      <span className="ai-ramin-loading-message" aria-live="polite">
                        {loadingMessage}
                      </span>
                    </div>
                  </div>
                ) : null}

                {chatError ? (
                  <div className="ai-ramin-chat-error" role="alert">
                    {chatError}
                  </div>
                ) : null}

                <div ref={threadEndRef} />
              </div>

              {!isStructuredRequest ? (
                <div className={`ai-ramin-suggestion-tray ${isSuggestionsOpen ? 'is-open' : ''}`} aria-hidden={!isSuggestionsOpen}>
                  <div className="ai-ramin-example-grid">
                    {examplePrompts.map((example, index) => (
                      <button
                        key={example.prompt}
                        type="button"
                        className={`ai-ramin-example-field ${index === 1 || index === 3 ? 'is-wide' : ''}`}
                        onClick={() => insertExamplePrompt(example.prompt)}
                        disabled={isSending}
                        tabIndex={isSuggestionsOpen ? 0 : -1}
                      >
                        <span>{example.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="ai-ramin-composer-stack">
                <div className="ai-ramin-composer-context" aria-label="AI Ramin answer context">
                  <AiRaminComposerLensControl
                    selectedMode={selectedMode}
                    selectedRequestType={selectedRequestType}
                    isOpen={isContextPanelOpen}
                    onOpen={() => setIsContextPanelOpen((current) => !current)}
                  />
                </div>
                <form
                  className="ai-ramin-composer"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void sendMessage();
                  }}
                >
                  {!isStructuredRequest ? (
                    <button
                      type="button"
                      className="ai-ramin-suggestion-toggle"
                      aria-expanded={isSuggestionsOpen}
                      onClick={() => setIsSuggestionsOpen((current) => !current)}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d={isSuggestionsOpen ? 'm6 9 6 6 6-6' : 'm6 15 6-6 6 6'} />
                      </svg>
                      <span>{isSuggestionsOpen ? 'Hide suggestions' : 'Suggestions'}</span>
                    </button>
                  ) : null}
                  <label htmlFor="ai-ramin-page-prompt" className="sr-only">
                    {chatbot.textarea.label}
                  </label>
                  <textarea
                    id="ai-ramin-page-prompt"
                    ref={promptInputRef}
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        void sendMessage();
                      }
                    }}
                    placeholder="Message AI Ramin"
                    className="ai-ramin-composer-input"
                    autoComplete="off"
                    rows={1}
                  />
                  <button
                    type="submit"
                    className="ai-ramin-send-button"
                    aria-label="Send message"
                    disabled={isSending || !prompt.trim()}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12h13" />
                      <path d="m13 6 6 6-6 6" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
