export const sourceStatuses = ['local-primary', 'public-proof', 'asset-lead', 'manual-needed'] as const;

export type SourceStatus = (typeof sourceStatuses)[number];

export type PlaceholderLabel =
  | 'Logo needed'
  | 'Video needed'
  | 'Link needed'
  | 'Review needed'
  | 'Detail needed';

export type PlaceholderValue = {
  kind: 'placeholder';
  label: PlaceholderLabel;
};

export const placeholder = (label: PlaceholderLabel): PlaceholderValue => ({
  kind: 'placeholder',
  label,
});

export type ProofChip = {
  label: string;
  value: string;
  sourceStatus: SourceStatus;
};

export type SourceLink = {
  label: string;
  href: string;
  sourceStatus: SourceStatus;
};

export type AssetSlot = {
  label: string;
  note: string;
  sourceStatus: SourceStatus;
};

export type DeepDive = {
  slug: string;
  eyebrow: string;
  title: string;
  dek: string;
  readTime: string;
  status: string;
  year: string;
  index: readonly string[];
  metadata: readonly { label: string; value: string }[];
  related: readonly string[];
  proofChips: readonly ProofChip[];
  sourceLinks: readonly SourceLink[];
  assetSlots: readonly AssetSlot[];
  sections: readonly { heading: string; body: readonly string[] }[];
};

export type WorkCaseStudy = {
  title: string;
  tag: string;
  summary: string;
  span: string;
  aspect: string;
  image: string;
  sourceStatus: SourceStatus;
  problem: readonly string[];
  architecture: readonly string[];
  approach: readonly string[];
  tradeoffs: readonly string[];
  proof: readonly string[];
  improve: readonly string[];
  links: readonly SourceLink[];
  chips: readonly ProofChip[];
  architectureChips: readonly { label: string; value: string }[];
  assetRequest: string;
};

export type ExperienceEntry = {
  company: string;
  role: string;
  dates: string;
  domain: string;
  outcome: string;
  proof: string;
  whatItProves: string;
  confidentiality: string;
  evidenceType: string;
  sourceStatus: SourceStatus;
  links: readonly SourceLink[];
  chips: readonly string[];
};

export type ToolSystem = {
  title: string;
  systemType: string;
  layer: string;
  description: string;
  proof: string;
  assetSlot: string;
  modelLayer: string;
  contextLayer: string;
  orchestrationLayer: string;
  governanceLayer: string;
  humanLayer: string;
  workflow: readonly string[];
  sourceStatus: SourceStatus;
};

export type ArchitectureLayer = {
  label: string;
  purpose: string;
  examples: string;
};

export type Credential = {
  group: 'AI' | 'Education' | 'Leadership';
  title: string;
  issuer: string;
  year: string;
  note: string;
  assetSlot: string;
  sourceStatus: SourceStatus;
};

export type TeachingWritingItem = {
  type: string;
  title: string;
  subtitle: string;
  proof: string;
  whyItMatters: string;
  href: string;
  assetSlot: string;
  sourceStatus: SourceStatus;
  chips: readonly string[];
};

export type AiRaminHiringModeId =
  | 'recruiter'
  | 'hiring-manager'
  | 'founder'
  | 'ai-product-lead'
  | 'investor'
  | 'curious-visitor';

export type AiRaminRequestType =
  | 'general_chat'
  | 'role_fit'
  | 'product_judgment'
  | 'evidence_lookup'
  | 'hiring_brief';

export type AiRaminAnswerSectionKey =
  | 'short_answer'
  | 'verified_proof'
  | 'inferred_fit'
  | 'confidential_boundary'
  | 'open_questions'
  | 'evidence_cards'
  | 'suggested_next_action';

export type AiRaminEvidenceType =
  | 'work'
  | 'project'
  | 'writing'
  | 'course'
  | 'talk'
  | 'policy'
  | 'framework';

export type AiRaminEvidenceConfidence =
  | 'verified'
  | 'local-primary'
  | 'inferred'
  | 'needs-review';

export type AiRaminHiringMode = {
  id: AiRaminHiringModeId;
  label: string;
  visitor: string;
  answerStyle: string;
  proofBias: readonly string[];
};

export type AiRaminUpgradedExperience = {
  id: string;
  label: string;
  goal: string;
  visitorInput: string;
  outputContract: readonly string[];
};

export type AiRaminAnswerContractSection = {
  key: AiRaminAnswerSectionKey;
  label: string;
  purpose: string;
  renderingRule: string;
};

export type AiRaminEvidenceCardContract = {
  fields: readonly string[];
  confidenceRules: readonly {
    confidence: AiRaminEvidenceConfidence;
    rule: string;
  }[];
};

export type AiRaminPrototype = {
  status: string;
  positioning: string;
  headline: string;
  description: string;
  examplePrompts: readonly {
    label: string;
    prompt: string;
  }[];
  excludedExperience: string;
  hiringModes: readonly AiRaminHiringMode[];
  requestTypes: readonly {
    id: AiRaminRequestType;
    label: string;
    routeIntent: string;
  }[];
  upgradedExperiences: readonly AiRaminUpgradedExperience[];
  allowedSources: readonly string[];
  disallowedClaims: readonly string[];
  responseTone: readonly string[];
  sourceBoundaries: readonly string[];
  futureModes: readonly string[];
  inputFlow: readonly { label: string; detail: string }[];
  answerContract: readonly AiRaminAnswerContractSection[];
  evidenceCardContract: AiRaminEvidenceCardContract;
  roleFitAnalyzerContract: readonly string[];
  productJudgmentSimulatorContract: readonly string[];
  hiringBriefContract: readonly string[];
  responseContract: readonly { label: string; detail: string }[];
  retrievalDesign: readonly { label: string; detail: string }[];
  sensitiveAreas: readonly string[];
  sampleResponse: readonly string[];
  phaseOneAcceptanceCriteria: readonly string[];
  nextPhase: string;
};

export type AssetRequest = {
  section: string;
  requests: readonly string[];
};
