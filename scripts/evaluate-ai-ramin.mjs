import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  applyAnswerQualityGate,
  recoverOverCautiousAnswer,
  selectBestStoryForQuestion,
} from '../server/aiRaminHandler.mjs';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CORPUS_PATH = path.join(ROOT_DIR, 'ai-ramin-section/generated/ai-ramin-corpus.json');
const CASES_PATH = path.join(ROOT_DIR, 'ai-ramin-section/evaluation/eval-cases.json');
const REPORT_PATH = path.join(ROOT_DIR, 'ai-ramin-section/evaluation/latest-evaluation-report.json');
const FAILURE_LOG_PATH = path.join(ROOT_DIR, 'ai-ramin-section/evaluation/failure-log.jsonl');
const WRITE_REPORT = process.argv.includes('--write-report');
const LOG_FAILURES = process.argv.includes('--log-failures');
const JSON_OUTPUT = process.argv.includes('--json');
const MAX_RETRIEVED_CHUNKS = 18;

const REQUEST_TYPES = new Set([
  'general_chat',
  'role_fit',
  'product_judgment',
  'evidence_lookup',
  'hiring_brief',
]);

const QUESTION_TYPES = new Set([
  'conversation_open',
  'portfolio_overview',
  'factual_capability',
  'role_fit',
  'behavioral_example',
  'product_judgment',
  'tradeoff_or_prioritisation',
  'weakness_or_gap',
  'first_90_days',
  'interview_coaching',
  'hiring_brief',
  'strongest_product_proof',
  'evidence_lookup',
  'guardrail_boundary',
  'clarification_needed',
]);

const ANSWER_TECHNIQUE_BY_QUESTION_TYPE = {
  conversation_open: 'lightweight_chat_open',
  portfolio_overview: 'rule_of_three_orientation',
  factual_capability: 'direct_proof_boundary',
  role_fit: 'car_fit_validation',
  behavioral_example: 'star_soar_story',
  product_judgment: 'product_judgment_stack',
  tradeoff_or_prioritisation: 'spar_tradeoff',
  weakness_or_gap: 'boundary_mitigation_validation',
  first_90_days: 'diagnose_align_ship_measure',
  interview_coaching: 'explicit_interview_framework',
  hiring_brief: 'copy_ready_hiring_brief',
  strongest_product_proof: 'rank_prove_translate',
  evidence_lookup: 'proof_ledger',
  guardrail_boundary: 'policy_boundary_redirect',
  clarification_needed: 'clarifying_question',
};

const ANSWER_TECHNIQUES = new Set(Object.values(ANSWER_TECHNIQUE_BY_QUESTION_TYPE));

const ANSWER_FRAME_BY_QUESTION_TYPE = {
  conversation_open: 'chat_open_invitation',
  portfolio_overview: 'orient_prove_translate',
  factual_capability: 'direct_claim_proof_boundary',
  role_fit: 'fit_evidence_validation',
  behavioral_example: 'memorable_story_arc',
  product_judgment: 'judgement_tradeoff_proof',
  tradeoff_or_prioritisation: 'tradeoff_decision_arc',
  weakness_or_gap: 'candid_gap_mitigation',
  first_90_days: 'diagnostic_ramp_plan',
  interview_coaching: 'explicit_coaching_scaffold',
  hiring_brief: 'hiring_recall_brief',
  strongest_product_proof: 'ranked_product_proof',
  evidence_lookup: 'proof_first_ledger',
  guardrail_boundary: 'boundary_redirect',
  clarification_needed: 'clarification_prompt',
};

const ANSWER_FRAMES = new Set(Object.values(ANSWER_FRAME_BY_QUESTION_TYPE));

const SOFT_CTAS_BY_QUESTION_TYPE = {
  conversation_open: [],
  portfolio_overview: ['analyze_role_fit', 'compare_projects'],
  factual_capability: ['ask_stronger_proof', 'analyze_role_fit'],
  role_fit: ['draft_hiring_brief', 'generate_interview_questions'],
  behavioral_example: ['generate_interview_questions', 'ask_stronger_proof'],
  product_judgment: ['turn_into_mvp_plan', 'show_risks', 'compare_projects'],
  tradeoff_or_prioritisation: ['show_risks', 'compare_projects'],
  weakness_or_gap: ['ask_stronger_proof', 'generate_interview_questions'],
  first_90_days: ['draft_hiring_brief', 'generate_interview_questions'],
  interview_coaching: ['generate_interview_questions', 'ask_stronger_proof'],
  hiring_brief: ['ask_stronger_proof'],
  strongest_product_proof: ['analyze_role_fit', 'ask_stronger_proof', 'compare_projects'],
  evidence_lookup: ['use_in_hiring_brief', 'ask_stronger_proof'],
  guardrail_boundary: ['analyze_role_fit', 'compare_projects'],
  clarification_needed: [],
};

const SOFT_CTA_IDS = new Set(Object.values(SOFT_CTAS_BY_QUESTION_TYPE).flat());

const RETRIEVAL_PROFILE_BY_QUESTION_TYPE = {
  conversation_open: {
    policyLimit: 0,
    preferredEvidenceRoles: [],
    generalEvidenceLimit: 0,
    frameworkLimit: 0,
    minimumAnswerableEvidence: 0,
  },
  clarification_needed: {
    policyLimit: 0,
    preferredEvidenceRoles: [],
    generalEvidenceLimit: 0,
    frameworkLimit: 0,
    minimumAnswerableEvidence: 0,
  },
  portfolio_overview: {
    policyLimit: 4,
    preferredEvidenceRoles: ['canonical', 'work', 'project'],
    generalEvidenceLimit: 8,
    frameworkLimit: 1,
    minimumAnswerableEvidence: 1,
  },
  factual_capability: {
    policyLimit: 4,
    preferredEvidenceRoles: ['canonical', 'work', 'project', 'story'],
    generalEvidenceLimit: 9,
    frameworkLimit: 1,
    minimumAnswerableEvidence: 1,
  },
  role_fit: {
    policyLimit: 4,
    preferredEvidenceRoles: ['work', 'project', 'story', 'canonical'],
    generalEvidenceLimit: 10,
    frameworkLimit: 3,
    minimumAnswerableEvidence: 2,
  },
  behavioral_example: {
    policyLimit: 3,
    preferredEvidenceRoles: ['story', 'work', 'project'],
    generalEvidenceLimit: 9,
    frameworkLimit: 2,
    minimumAnswerableEvidence: 1,
  },
  product_judgment: {
    policyLimit: 2,
    preferredEvidenceRoles: ['work', 'project', 'inferred', 'story', 'canonical'],
    generalEvidenceLimit: 12,
    frameworkLimit: 3,
    minimumAnswerableEvidence: 1,
  },
  tradeoff_or_prioritisation: {
    policyLimit: 4,
    preferredEvidenceRoles: ['story', 'project', 'work', 'canonical', 'inferred'],
    generalEvidenceLimit: 10,
    frameworkLimit: 3,
    minimumAnswerableEvidence: 1,
  },
  weakness_or_gap: {
    policyLimit: 5,
    preferredEvidenceRoles: ['work', 'story', 'project', 'canonical'],
    generalEvidenceLimit: 8,
    frameworkLimit: 2,
    minimumAnswerableEvidence: 1,
  },
  first_90_days: {
    policyLimit: 4,
    preferredEvidenceRoles: ['work', 'project', 'canonical', 'story', 'inferred'],
    generalEvidenceLimit: 10,
    frameworkLimit: 3,
    minimumAnswerableEvidence: 2,
  },
  interview_coaching: {
    policyLimit: 3,
    preferredEvidenceRoles: ['story', 'work', 'project', 'canonical'],
    generalEvidenceLimit: 8,
    frameworkLimit: 5,
    minimumAnswerableEvidence: 0,
  },
  hiring_brief: {
    policyLimit: 4,
    preferredEvidenceRoles: ['work', 'project', 'story', 'canonical', 'inferred'],
    generalEvidenceLimit: 10,
    frameworkLimit: 3,
    minimumAnswerableEvidence: 2,
  },
  strongest_product_proof: {
    policyLimit: 3,
    preferredEvidenceRoles: ['work', 'project', 'story', 'canonical'],
    generalEvidenceLimit: 12,
    frameworkLimit: 2,
    minimumAnswerableEvidence: 2,
  },
  evidence_lookup: {
    policyLimit: 4,
    preferredEvidenceRoles: ['canonical', 'work', 'project', 'story'],
    generalEvidenceLimit: 10,
    frameworkLimit: 1,
    minimumAnswerableEvidence: 1,
  },
  guardrail_boundary: {
    policyLimit: 6,
    preferredEvidenceRoles: ['canonical', 'work', 'project'],
    generalEvidenceLimit: 6,
    frameworkLimit: 0,
    minimumAnswerableEvidence: 0,
  },
};

const HIRING_MODES = new Set([
  'recruiter',
  'hiring-manager',
  'founder',
  'ai-product-lead',
  'investor',
  'curious-visitor',
]);

const SOURCE_ROLES = new Set(['policy', 'canonical', 'work', 'project', 'story', 'inferred', 'framework']);
const ANSWER_SECTIONS = new Set([
  'short_answer',
  'verified_proof',
  'inferred_fit',
  'confidential_boundary',
  'open_questions',
  'suggested_next_action',
]);

const SUITE_GATE_DEFAULTS = {
  minimumCaseCount: 0,
  requiredCategories: [],
  requiredQuestionTypes: [],
  requiredSelectedPathIncludes: [],
  requiredRecoveryStrategies: [],
};

const SOURCE_ROLE_WEIGHT = {
  policy: 1,
  canonical: 0.95,
  work: 0.9,
  project: 0.85,
  story: 0.8,
  inferred: 0.58,
  framework: 0.45,
};

const RETRIEVAL_PRIORITY_WEIGHT = {
  highest: 1,
  high: 0.78,
  medium: 0.55,
  low: 0.32,
  none: 0,
};

const QUERY_STOP_WORDS = new Set([
  'about',
  'after',
  'again',
  'against',
  'also',
  'answer',
  'because',
  'before',
  'being',
  'between',
  'could',
  'does',
  'from',
  'have',
  'into',
  'only',
  'ramin',
  'should',
  'that',
  'their',
  'there',
  'these',
  'this',
  'through',
  'using',
  'what',
  'when',
  'where',
  'which',
  'with',
  'would',
]);

function normalizePath(filePath) {
  return filePath.split(path.sep).join('/');
}

function tokenizeQuery(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !QUERY_STOP_WORDS.has(token));
}

function hasStrongestProductProofCue(message) {
  const lower = String(message ?? '').toLowerCase();
  const strongestProductPattern =
    /\b(?:coolest|most interesting|most impressive|strongest|best|standout|top)\b.{0,90}\b(?:product|project|build|thing|proof|achievement|accomplishment|work)\b/i;
  const productStrongestPattern =
    /\b(?:product|project|build|thing|proof|achievement|accomplishment|work)\b.{0,90}\b(?:coolest|most interesting|most impressive|strongest|best|standout|top)\b/i;
  const productBuiltPattern =
    /\b(?:what|which)\b.{0,35}\b(?:product|project)\b.{0,80}\b(?:ramin|he)\b.{0,35}\b(?:made|built|shipped|launched|created)\b/i;
  const directBuiltPattern =
    /\b(?:product|project)\b.{0,45}\b(?:ramin|he)\b.{0,35}\b(?:made|built|shipped|launched|created)\b/i;
  const hiringBestProofPattern =
    /\b(?:hiring|hire|job|role|position|opening|screening|interview)\b.{0,120}\b(?:coolest|most interesting|strongest|best|most impressive|standout|top)\b.{0,80}\b(?:product|project|proof|achievement|accomplishment)\b/i;

  return (
    strongestProductPattern.test(lower) ||
    productStrongestPattern.test(lower) ||
    productBuiltPattern.test(lower) ||
    directBuiltPattern.test(lower) ||
    hiringBestProofPattern.test(lower)
  );
}

function hasBehavioralExampleCue(message) {
  const lower = String(message ?? '').toLowerCase();
  const directBehavioralPattern =
    /\b(tell me about a time|time when|example of|give me an example|conflict|failure|feedback|proud|accomplishment|leadership|stakeholder disagreement|handled.*stakeholder|competing priorities)\b/i;
  const hardChallengePattern =
    /\b(?:hardest|toughest|most difficult|biggest|most challenging|hardest-ever)\b.{0,90}\b(?:product\s+)?(?:challenge|problem|obstacle|blocker|constraint|ambiguity)\b/i;
  const challengeOvercomePattern =
    /\b(?:challenge|problem|obstacle|blocker|constraint|ambiguity)\b.{0,110}\b(?:overcame|overcome|solved|handled|worked through|dealt with|got through|navigated)\b/i;
  const overcomeChallengePattern =
    /\b(?:overcame|overcome|solved|handled|worked through|dealt with|got through|navigated)\b.{0,110}\b(?:challenge|problem|obstacle|blocker|constraint|ambiguity)\b/i;
  const difficultSituationPattern =
    /\b(?:hardest|toughest|most difficult|biggest)\b.{0,90}\b(?:stakeholder situation|stakeholder issue|tradeoff|trade-off|decision|delivery issue)\b/i;
  const ambiguityExamplePattern =
    /\b(?:best|strongest|good)\b.{0,60}\bexample\b.{0,100}\b(?:solving|handling|navigating|working through)\b.{0,60}\b(?:ambiguity|uncertainty|complexity|pressure)\b/i;

  return (
    directBehavioralPattern.test(lower) ||
    hardChallengePattern.test(lower) ||
    challengeOvercomePattern.test(lower) ||
    overcomeChallengePattern.test(lower) ||
    difficultSituationPattern.test(lower) ||
    ambiguityExamplePattern.test(lower)
  );
}

function isConversationOpenCue(message) {
  const normalized = String(message ?? '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s']/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return (
    /^(hi|hello|hey|hey there|hi there|hello there|yo|sup|good morning|good afternoon|good evening|thanks|thank you|ok|okay|cool|nice|great)$/.test(
      normalized,
    ) ||
    /^(how'?s|hows|how is) it going$/.test(normalized) ||
    /^how are (you|things)$/.test(normalized) ||
    /^(what'?s|whats) up$/.test(normalized) ||
    /^(you there|are you there)$/.test(normalized)
  );
}

function classifyQuestionType(message, requestType = 'general_chat') {
  const lower = String(message ?? '').toLowerCase();
  const hasProductScenarioCue =
    /\b(product scenario|product idea|design an ai|design a|gym app|app idea|mvp|product sense|launch)\b/i.test(lower);

  if (
    /\b(ignore|bypass|override|system prompt|hidden prompt|developer message|api key|password|token|secret|confidential|salary|compensation|availability|calendar|private|bayut roadmap|stock|medical|scrape private)\b/i.test(
      lower,
    )
  ) {
    return 'guardrail_boundary';
  }

  if (isConversationOpenCue(lower)) {
    return 'conversation_open';
  }

  if (requestType === 'hiring_brief' || /\b(hiring brief|shareable brief|brief for|internal note|recruiter note)\b/i.test(lower)) {
    return 'hiring_brief';
  }

  if (
    /\b(coach me|help me answer|how should (i|ramin) answer|mock interview|practice answer|rewrite.*answer|sample answer|answer structure|interview prep|interview question set|interview follow-up|follow-up questions|interview focus|questions that validate|validate.*claims)\b/i.test(
      lower,
    )
  ) {
    return 'interview_coaching';
  }

  if (/\b(first 90|90 days|first three months|first quarter|onboarding plan|ramp plan)\b/i.test(lower)) {
    return 'first_90_days';
  }

  if (hasStrongestProductProofCue(lower)) {
    return 'strongest_product_proof';
  }

  if (requestType === 'product_judgment' && hasProductScenarioCue) {
    return 'product_judgment';
  }

  if (
    /\b(weakness|gap|concern|risk|downside|missing|lack|limited|not strong|red flag|watch out|where.*weak|what.*validate)\b/i.test(
      lower,
    )
  ) {
    return 'weakness_or_gap';
  }

  if (
    requestType === 'role_fit' ||
    /\b(job description|role description|jd\b|role fit|fit for|fit this role|screen this role|compare.*role|for (?:a|an|the )?.{0,50}(?:pm|product manager|product lead|head of product|founding pm|senior pm|lead pm).{0,35}role|(?:pm|product manager|product lead|head of product|founding pm|senior pm|lead pm).{0,35}role)\b/i.test(lower)
  ) {
    return 'role_fit';
  }

  if (requestType === 'evidence_lookup') {
    return 'evidence_lookup';
  }

  if (hasBehavioralExampleCue(lower)) {
    return 'behavioral_example';
  }

  if (
    /\b(tradeoff|trade-off|prioriti[sz]e|prioriti[sz]ation|decide between|versus| vs |roadmap choice|scope|pricing decision|metrics decision)\b/i.test(
      lower,
    )
  ) {
    return 'tradeoff_or_prioritisation';
  }

  if (requestType === 'product_judgment') {
    return 'product_judgment';
  }

  if (
    /\b(product scenario|product idea|design an ai|design a|guardrail|mvp|assumption|eval|evaluation plan|launch|product sense|improve|build|approach)\b/i.test(
      lower,
    )
  ) {
    return 'product_judgment';
  }

  if (
    /\b(proof|evidence|verified|actually shipped|has he shipped|what has he built|public source|source|qualification|credential|certification)\b/i.test(
      lower,
    )
  ) {
    return 'evidence_lookup';
  }

  if (/\b(has he|has ramin|does ramin have|can he|can ramin|does he have|worked on|experience with|able to|know about)\b/i.test(lower)) {
    return 'factual_capability';
  }

  if (/^(tell me more|go deeper|expand|expand on that|explain more|why|why not|how so|same for|same question|continue|and|also|what about|how about|what if|for .+|and for .+|compare that|stronger proof|show risks|what risks|draft that|turn that into|can you expand|can you compare|can you explain|do that for)\b/i.test(lower)) {
    return 'clarification_needed';
  }

  return 'portfolio_overview';
}

function questionTypeNeedsFramework(questionType) {
  return [
    'role_fit',
    'behavioral_example',
    'product_judgment',
    'tradeoff_or_prioritisation',
    'weakness_or_gap',
    'first_90_days',
    'interview_coaching',
    'hiring_brief',
    'strongest_product_proof',
  ].includes(questionType);
}

function questionTypeNeedsStory(questionType) {
  return [
    'role_fit',
    'behavioral_example',
    'product_judgment',
    'tradeoff_or_prioritisation',
    'weakness_or_gap',
    'first_90_days',
    'interview_coaching',
    'hiring_brief',
    'strongest_product_proof',
  ].includes(questionType);
}

function getAnswerTechniqueId(questionType) {
  return ANSWER_TECHNIQUE_BY_QUESTION_TYPE[questionType] ?? ANSWER_TECHNIQUE_BY_QUESTION_TYPE.portfolio_overview;
}

function getAnswerFrameId(questionType) {
  return ANSWER_FRAME_BY_QUESTION_TYPE[questionType] ?? ANSWER_FRAME_BY_QUESTION_TYPE.portfolio_overview;
}

function getSoftCtas(questionType) {
  return SOFT_CTAS_BY_QUESTION_TYPE[questionType] ?? SOFT_CTAS_BY_QUESTION_TYPE.portfolio_overview;
}

function getRetrievalProfile(questionType) {
  return RETRIEVAL_PROFILE_BY_QUESTION_TYPE[questionType] ?? RETRIEVAL_PROFILE_BY_QUESTION_TYPE.portfolio_overview;
}

function classifyQuery(message, requestType = 'general_chat') {
  const lower = String(message).toLowerCase();
  const primaryQuestionType = classifyQuestionType(lower, requestType);
  const retrievalProfile = getRetrievalProfile(primaryQuestionType);
  return {
    primaryQuestionType,
    answerTechniqueId: getAnswerTechniqueId(primaryQuestionType),
    answerFrameId: getAnswerFrameId(primaryQuestionType),
    softCtas: getSoftCtas(primaryQuestionType),
    retrievalProfile: {
      policyLimit: retrievalProfile.policyLimit,
      preferredEvidenceRoles: retrievalProfile.preferredEvidenceRoles,
      generalEvidenceLimit: retrievalProfile.generalEvidenceLimit,
      frameworkLimit: retrievalProfile.frameworkLimit,
      minimumAnswerableEvidence: retrievalProfile.minimumAnswerableEvidence,
    },
    guardrailSensitive:
      primaryQuestionType === 'guardrail_boundary' ||
      /\b(ignore|bypass|override|system prompt|hidden prompt|developer message|api key|password|token|secret|confidential|salary|compensation|availability|calendar|private|bayut roadmap|stock|medical|scrape private)\b/i.test(
        lower,
      ),
    needsFramework:
      questionTypeNeedsFramework(primaryQuestionType) ||
      /\b(approach|strategy|design|improve|build|first 90|tradeoff|trade-off|interview|coach|framework|guardrail|pricing|metrics|launch|product sense|eval|evaluation)\b/i.test(
        lower,
      ) || requestType === 'role_fit' || requestType === 'product_judgment' || requestType === 'hiring_brief',
    needsStory:
      questionTypeNeedsStory(primaryQuestionType) ||
      /\b(example|time when|tell me about a time|conflict|failure|feedback|priority|priorities|proud|accomplishment|leadership|stakeholder)\b/i.test(
        lower,
      ) || requestType === 'role_fit',
    needsContact:
      /\b(available|availability|salary|compensation|rate|calendar|meeting|hire|contact|email|phone|reference)\b/i.test(
        lower,
      ) || requestType === 'hiring_brief',
  };
}

function getChunkMetadataSearchText(chunk) {
  return [
    chunk.story_type,
    ...(Array.isArray(chunk.question_intents) ? chunk.question_intents : []),
    ...(Array.isArray(chunk.entities) ? chunk.entities : []),
    ...(Array.isArray(chunk.source_paths) ? chunk.source_paths : []),
  ]
    .join(' ')
    .replace(/[_-]/g, ' ')
    .toLowerCase();
}

function hasAnyQueryCue(queryTokenSet, cues) {
  return cues.some((cue) => queryTokenSet.has(cue));
}

function scoreBehavioralStoryMetadata(chunk, queryTokenSet, haystack) {
  if (chunk.source_role !== 'story') return 0;

  const metadataText = getChunkMetadataSearchText(chunk);
  const path = String(chunk.file_path ?? '').toLowerCase();
  const storyType = String(chunk.story_type ?? '').replace(/[_-]/g, ' ').toLowerCase();
  let score = 0;

  const hasProductCue = hasAnyQueryCue(queryTokenSet, ['product', 'pm', 'manager', 'management']);
  const hasHardChallengeCue = hasAnyQueryCue(queryTokenSet, [
    'hardest',
    'toughest',
    'difficult',
    'biggest',
    'challenging',
    'challenge',
    'problem',
    'obstacle',
    'blocker',
    'constraint',
    'ambiguity',
    'overcame',
    'overcome',
    'solved',
    'handled',
    'navigated',
  ]);
  const hasAmbiguityCue = hasAnyQueryCue(queryTokenSet, ['ambiguity', 'uncertainty', 'complexity', 'unclear']);

  if (hasHardChallengeCue) {
    score += 0.22;
    if (
      metadataText.includes('product impact') ||
      metadataText.includes('enterprise product') ||
      metadataText.includes('proud accomplishment') ||
      metadataText.includes('sustainability experience') ||
      storyType.includes('proud accomplishment')
    ) {
      score += hasProductCue ? 0.72 : 0.42;
    }
    if (
      metadataText.includes('product tradeoff') ||
      metadataText.includes('stakeholder management') ||
      metadataText.includes('prioritisation') ||
      storyType.includes('conflict') ||
      storyType.includes('failure') ||
      storyType.includes('prioritisation')
    ) {
      score += 0.34;
    }
  }

  if (hasAmbiguityCue) {
    if (
      metadataText.includes('team alignment') ||
      metadataText.includes('product process') ||
      metadataText.includes('communication style') ||
      metadataText.includes('stakeholder management') ||
      storyType.includes('leadership')
    ) {
      score += 0.62;
    }
    if (metadataText.includes('product impact') || metadataText.includes('enterprise product')) {
      score += 0.3;
    }
  }

  if (
    hasAnyQueryCue(queryTokenSet, ['conflict', 'disagreement']) &&
    (storyType.includes('conflict') || metadataText.includes('stakeholder management'))
  ) {
    score += 0.78;
  }
  if (
    hasAnyQueryCue(queryTokenSet, ['failure', 'failed', 'learned']) &&
    (storyType.includes('failure') || metadataText.includes('lesson learned'))
  ) {
    score += 0.78;
  }
  if (hasAnyQueryCue(queryTokenSet, ['feedback']) && (storyType.includes('feedback') || metadataText.includes('difficult conversations'))) {
    score += 0.72;
  }
  if (
    hasAnyQueryCue(queryTokenSet, ['priority', 'priorities', 'prioritisation', 'prioritization']) &&
    (storyType.includes('prioritisation') || metadataText.includes('roadmap prioritisation') || metadataText.includes('competing priorities'))
  ) {
    score += 0.7;
  }
  if (
    hasAnyQueryCue(queryTokenSet, ['proud', 'accomplishment', 'achievement', 'impact']) &&
    (storyType.includes('proud accomplishment') || metadataText.includes('product impact'))
  ) {
    score += 0.78;
  }

  if (path.includes('groupm-carbon-calculator') && hasHardChallengeCue && hasProductCue) score += 0.24;
  if (path.includes('team-alignment-product-innovation-process') && hasAmbiguityCue) score += 0.24;
  if (haystack.includes('use this story for')) score += 0.08;

  return score;
}

function scoreChunk(chunk, queryTokens, queryIntent) {
  const keywordSet = new Set(chunk.keywords ?? []);
  const headingText = Array.isArray(chunk.heading_path) ? chunk.heading_path.join(' ').toLowerCase() : '';
  const titleText = String(chunk.title ?? '').toLowerCase();
  const metadataText = getChunkMetadataSearchText(chunk);
  const haystack = `${titleText} ${headingText} ${metadataText} ${(chunk.text ?? '').slice(0, 1200).toLowerCase()}`;

  let tokenHits = 0;
  let weightedHits = 0;
  for (const token of queryTokens) {
    if (keywordSet.has(token)) {
      tokenHits += 1;
      weightedHits += 1.4;
    } else if (titleText.includes(token) || headingText.includes(token)) {
      tokenHits += 1;
      weightedHits += 1.2;
    } else if (haystack.includes(token)) {
      tokenHits += 1;
      weightedHits += 0.75;
    }
  }

  const semanticScore = queryTokens.length ? Math.min(weightedHits / queryTokens.length, 1) : 0;
  const sourcePriority = SOURCE_ROLE_WEIGHT[chunk.source_role] ?? 0.2;
  const retrievalPriority = RETRIEVAL_PRIORITY_WEIGHT[chunk.retrieval_priority] ?? 0.2;

  let intentScore = 0;
  if (queryIntent.guardrailSensitive && chunk.source_role === 'policy') intentScore += 0.8;
  if (queryIntent.needsFramework && chunk.source_role === 'framework') intentScore += 0.45;
  if (queryIntent.needsStory && chunk.source_role === 'story') intentScore += 0.55;
  if (queryIntent.needsContact && chunk.file_path?.includes('contact-fallback')) intentScore += 0.9;
  if (chunk.public_safe && chunk.can_answer_from) intentScore += 0.2;

  const queryTokenSet = new Set(queryTokens);
  const hasFitnessCue = ['gym', 'fitness', 'coach', 'coaching', 'training', 'trainer', 'health', 'wellbeing', 'performance'].some(
    (token) => queryTokenSet.has(token),
  );
  const hasCreativeCue = ['creative', 'creatives', 'creator', 'creators'].some((token) => queryTokenSet.has(token));
  const hasEducationCue = ['education', 'course', 'courses', 'teaching', 'learning', 'learner', 'learners'].some((token) =>
    queryTokenSet.has(token),
  );
  const hasErpInternalCue = ['erp', 'internal', 'workflow', 'workflows', 'tooling', 'tools', 'copilot', 'operations'].some((token) =>
    queryTokenSet.has(token),
  );
  const hasAutomotiveAuctionCue = ['automotive', 'auction', 'marketplace', 'manufacturer', 'manufacturers'].some((token) =>
    queryTokenSet.has(token),
  );
  const hasSignalIntelligenceCue = ['qadam', 'signals', 'signal', 'macro', 'market', 'intelligence', 'alternative'].some((token) =>
    queryTokenSet.has(token),
  );
  const hasMessyInputCue = ['screenshots', 'screenshot', 'videos', 'video', 'links', 'multimodal', 'messy', 'structured'].some((token) =>
    queryTokenSet.has(token),
  );
  if (queryIntent.primaryQuestionType === 'product_judgment') {
    if (hasFitnessCue && chunk.file_path?.includes('qualifications.md')) {
      intentScore += 0.65;
    }
    if (hasFitnessCue && /\b(fitness|gym|personal training|trainer|level 3|human performance|health behaviour)\b/i.test(haystack)) {
      intentScore += 0.45;
    }
    if (hasCreativeCue && /\b(creative|creatives|creator|nsso|fiction author|writing|world-building)\b/i.test(haystack)) {
      intentScore += 0.35;
    }
    if (hasEducationCue && chunk.file_path?.includes('talks-writing-courses.md')) {
      intentScore += 0.55;
    }
    if (hasEducationCue && /\b(education|course|teaching|learning|learner|learners|pm education|ai product education)\b/i.test(haystack)) {
      intentScore += 0.45;
    }
    if (hasErpInternalCue && chunk.file_path?.includes('side-ai-erp.md')) {
      intentScore += 0.72;
    }
    if (hasAutomotiveAuctionCue && chunk.file_path?.includes('cox-automotive-auction-platform.md')) {
      intentScore += 0.68;
    }
    if (hasSignalIntelligenceCue && chunk.file_path?.includes('projects/qadam.md')) {
      intentScore += 0.72;
    }
    if (hasSignalIntelligenceCue && chunk.file_path?.includes('qadam-signal-quality-governance.md')) {
      intentScore += 0.58;
    }
    if (hasMessyInputCue && chunk.file_path?.includes('mass-social-wisdom-agent.md')) {
      intentScore += 0.72;
    }
    if (hasMessyInputCue && chunk.file_path?.includes('messy-inputs-to-structured-decisions.md')) {
      intentScore += 0.58;
    }
    if (/\b(product discovery from scratch|discovery from scratch|riskiest assumptions|smallest useful test)\b/i.test(haystack)) {
      intentScore += 0.24;
    }
  }

  if (queryIntent.primaryQuestionType === 'strongest_product_proof') {
    if (/\b(strongest proof|strongest product|best product|coolest product|most interesting|most impressive|public-facing proof|what this proves|product impact|proud accomplishment)\b/i.test(haystack)) {
      intentScore += 0.35;
    }
    if (
      chunk.file_path?.includes('groupm-carbon-calculator') ||
      chunk.file_path?.includes('urgentem-element6') ||
      chunk.file_path?.includes('bayut-ai-product-manager') ||
      chunk.file_path?.includes('ai-native-product-os') ||
      chunk.file_path?.includes('mass-social-wisdom-agent') ||
      chunk.file_path?.includes('24seven-concierge') ||
      chunk.file_path?.includes('nsso') ||
      chunk.file_path?.includes('qadam')
    ) {
      intentScore += 0.22;
    }
    if (chunk.file_path?.includes('profile.md')) {
      intentScore += 0.2;
    }
  }

  if (queryIntent.primaryQuestionType === 'behavioral_example') {
    intentScore += scoreBehavioralStoryMetadata(chunk, queryTokenSet, haystack);
  }

  switch (queryIntent.primaryQuestionType) {
    case 'portfolio_overview':
      if (chunk.source_role === 'canonical') intentScore += 0.22;
      if (chunk.source_role === 'project' || chunk.source_role === 'work') intentScore += 0.12;
      break;
    case 'factual_capability':
    case 'evidence_lookup':
      if (chunk.can_answer_from && chunk.source_role !== 'framework') intentScore += 0.28;
      if (chunk.source_role === 'canonical' || chunk.source_role === 'work' || chunk.source_role === 'project') intentScore += 0.16;
      break;
    case 'role_fit':
      if (chunk.source_role === 'work' || chunk.source_role === 'project') intentScore += 0.24;
      if (chunk.source_role === 'story') intentScore += 0.16;
      break;
    case 'behavioral_example':
      if (chunk.source_role === 'story') intentScore += 0.42;
      break;
    case 'product_judgment':
      if (chunk.source_role === 'project' || chunk.source_role === 'story') intentScore += 0.2;
      if (chunk.source_role === 'inferred') intentScore += 0.22;
      if (chunk.source_role === 'framework') intentScore += 0.18;
      break;
    case 'tradeoff_or_prioritisation':
      if (chunk.source_role === 'project') intentScore += 0.34;
      if (chunk.source_role === 'story') intentScore += 0.26;
      if (chunk.source_role === 'inferred') intentScore += 0.16;
      if (chunk.source_role === 'framework') intentScore += 0.22;
      if (chunk.source_role === 'work') intentScore += 0.12;
      break;
    case 'weakness_or_gap':
      if (chunk.source_role === 'policy') intentScore += 0.2;
      if (chunk.source_role === 'story' || chunk.source_role === 'work') intentScore += 0.18;
      break;
    case 'first_90_days':
      if (chunk.source_role === 'work' || chunk.source_role === 'project' || chunk.source_role === 'framework') intentScore += 0.2;
      if (chunk.source_role === 'inferred') intentScore += 0.12;
      break;
    case 'interview_coaching':
      if (chunk.source_role === 'framework') intentScore += 0.35;
      if (chunk.source_role === 'story') intentScore += 0.18;
      break;
    case 'hiring_brief':
      if (chunk.source_role === 'work' || chunk.source_role === 'project' || chunk.source_role === 'story') intentScore += 0.2;
      if (chunk.source_role === 'inferred') intentScore += 0.08;
      if (chunk.source_role === 'policy') intentScore += 0.12;
      break;
    case 'strongest_product_proof':
      if (chunk.source_role === 'work') intentScore += 0.32;
      if (chunk.source_role === 'project') intentScore += 0.28;
      if (chunk.source_role === 'story') intentScore += 0.22;
      if (chunk.source_role === 'canonical') intentScore += 0.18;
      if (chunk.source_role === 'framework') intentScore += 0.08;
      break;
    case 'guardrail_boundary':
      if (chunk.source_role === 'policy') intentScore += 0.35;
      break;
    default:
      break;
  }

  return {
    chunk,
    score: semanticScore * 0.48 + sourcePriority * 0.18 + retrievalPriority * 0.14 + intentScore * 0.2,
    tokenHits,
  };
}

function dedupeRankedChunks(rankedChunks) {
  const selected = [];
  const seenChunkIds = new Set();
  const chunksByFile = new Map();

  for (const ranked of rankedChunks) {
    if (seenChunkIds.has(ranked.chunk.chunk_id)) continue;
    const fileCount = chunksByFile.get(ranked.chunk.file_path) ?? 0;
    if (fileCount >= 3) continue;

    selected.push(ranked);
    seenChunkIds.add(ranked.chunk.chunk_id);
    chunksByFile.set(ranked.chunk.file_path, fileCount + 1);
  }

  return selected;
}

function takeRankedChunks(rankedChunks, predicate, limit) {
  if (!limit || limit <= 0) return [];
  const selected = [];
  const seenIds = new Set();

  for (const ranked of rankedChunks) {
    if (selected.length >= limit) break;
    if (seenIds.has(ranked.chunk.chunk_id)) continue;
    if (!predicate(ranked)) continue;
    selected.push(ranked);
    seenIds.add(ranked.chunk.chunk_id);
  }

  return selected;
}

function selectEvidenceChunksByRole(rankedChunks, queryIntent) {
  const profile = getRetrievalProfile(queryIntent.primaryQuestionType);
  const selected = [];
  const selectedIds = new Set();
  const perPreferredRoleLimit = Math.max(1, Math.ceil(profile.generalEvidenceLimit / profile.preferredEvidenceRoles.length));

  function append(chunks) {
    for (const ranked of chunks) {
      if (selected.length >= profile.generalEvidenceLimit) return;
      if (selectedIds.has(ranked.chunk.chunk_id)) continue;
      selected.push(ranked);
      selectedIds.add(ranked.chunk.chunk_id);
    }
  }

  for (const role of profile.preferredEvidenceRoles) {
    append(
      takeRankedChunks(
        rankedChunks,
        (ranked) =>
          ranked.chunk.source_role === role &&
          (ranked.chunk.can_answer_from || ranked.chunk.can_support_inference),
        perPreferredRoleLimit,
      ),
    );
  }

  append(
    takeRankedChunks(
      rankedChunks,
      (ranked) =>
        ranked.chunk.source_role !== 'framework' &&
        (ranked.chunk.can_answer_from || ranked.chunk.can_support_inference),
      profile.generalEvidenceLimit,
    ),
  );

  return selected;
}

function normalizeBasedOnPath(value) {
  return String(value ?? '').trim().replace(/^\/+/, '');
}

function matchesBasedOnPath(chunkPath, basedOnPath) {
  const normalized = normalizeBasedOnPath(basedOnPath);
  if (!normalized) return false;
  const withoutCorpusRoot = normalized.replace(/^ai-ramin-section\//, '');
  return (
    chunkPath === normalized ||
    chunkPath.endsWith(withoutCorpusRoot) ||
    normalized.endsWith(chunkPath)
  );
}

function selectBasedOnSupportChunks(scoredChunks, selectedRankedChunks, limit = 4) {
  const selectedIds = new Set(selectedRankedChunks.map((ranked) => ranked.chunk.chunk_id));
  const basedOnPaths = selectedRankedChunks
    .filter((ranked) => ranked.chunk.source_role === 'inferred')
    .flatMap((ranked) => (Array.isArray(ranked.chunk.based_on) ? ranked.chunk.based_on : []))
    .map(normalizeBasedOnPath)
    .filter(Boolean);

  if (!basedOnPaths.length) return [];

  const supportChunks = [];
  const supportIds = new Set();
  const supportFileCounts = new Map();

  for (const basedOnPath of basedOnPaths) {
    if (supportChunks.length >= limit) break;
    const candidates = scoredChunks
      .filter(({ chunk }) => {
        if (selectedIds.has(chunk.chunk_id) || supportIds.has(chunk.chunk_id)) return false;
        if (!chunk.can_answer_from || !chunk.public_safe) return false;
        if (['policy', 'framework', 'inferred'].includes(chunk.source_role)) return false;
        if ((supportFileCounts.get(chunk.file_path) ?? 0) >= 1) return false;
        return matchesBasedOnPath(chunk.file_path, basedOnPath);
      })
      .sort((a, b) => b.score - a.score || a.chunk.chunk_index - b.chunk.chunk_index);

    const bestCandidate = candidates[0];
    if (!bestCandidate) continue;
    supportChunks.push(bestCandidate);
    supportIds.add(bestCandidate.chunk.chunk_id);
    supportFileCounts.set(bestCandidate.chunk.file_path, (supportFileCounts.get(bestCandidate.chunk.file_path) ?? 0) + 1);
  }

  return supportChunks;
}

function selectBudgetedContextChunks(policyChunks, evidenceChunks, basedOnSupportChunks, frameworkChunks) {
  const reservedSupportAndFramework = basedOnSupportChunks.length + frameworkChunks.length;
  const evidenceBudget = Math.max(0, MAX_RETRIEVED_CHUNKS - policyChunks.length - reservedSupportAndFramework);
  const trimmedEvidence = evidenceChunks.slice(0, evidenceBudget);
  const firstInferredChunk = evidenceChunks.find((ranked) => ranked.chunk.source_role === 'inferred');

  if (
    firstInferredChunk &&
    evidenceBudget > 0 &&
    !trimmedEvidence.some((ranked) => ranked.chunk.source_role === 'inferred')
  ) {
    trimmedEvidence.splice(trimmedEvidence.length - 1, 1, firstInferredChunk);
  }

  return dedupeRankedChunks([
    ...policyChunks,
    ...trimmedEvidence,
    ...basedOnSupportChunks,
    ...frameworkChunks,
  ]).slice(0, MAX_RETRIEVED_CHUNKS);
}

function retrieveContextChunks(corpus, prompt, requestType) {
  const queryTokens = tokenizeQuery(prompt);
  const queryIntent = classifyQuery(prompt, requestType);
  const scored = corpus.chunks.map((chunk) => scoreChunk(chunk, queryTokens, queryIntent));
  const ranked = scored
    .filter((rankedChunk) => rankedChunk.score > 0.18 || rankedChunk.chunk.retrieval_priority === 'highest')
    .sort((a, b) => b.score - a.score || a.chunk.file_path.localeCompare(b.chunk.file_path));
  const profile = getRetrievalProfile(queryIntent.primaryQuestionType);

  const policyChunks = takeRankedChunks(
    ranked,
    (rankedChunk) => rankedChunk.chunk.source_role === 'policy',
    profile.policyLimit,
  );
  const evidenceChunks = selectEvidenceChunksByRole(ranked, queryIntent);
  const basedOnSupportChunks = selectBasedOnSupportChunks(scored, evidenceChunks, 3);
  const frameworkChunks = queryIntent.needsFramework
    ? takeRankedChunks(
        ranked,
        (rankedChunk) => rankedChunk.chunk.source_role === 'framework',
        profile.frameworkLimit,
      )
    : [];

  return selectBudgetedContextChunks(policyChunks, evidenceChunks, basedOnSupportChunks, frameworkChunks);
}

function hasExpectedKeyword(selected, keyword) {
  const normalizedKeyword = String(keyword).toLowerCase();
  return selected.some(({ chunk }) => {
    const haystack = [
      chunk.title,
      chunk.file_path,
      Array.isArray(chunk.heading_path) ? chunk.heading_path.join(' ') : '',
      Array.isArray(chunk.keywords) ? chunk.keywords.join(' ') : '',
      chunk.text,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalizedKeyword);
  });
}

function stripMarkdownForEval(value) {
  return String(value ?? '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function summarizeEvalChunk(chunk, maxChars = 260) {
  const text = stripMarkdownForEval(chunk.text);
  return text.length > maxChars ? `${text.slice(0, maxChars - 3).trim()}...` : text;
}

function evidenceTypeForEvalChunk(chunk) {
  if (chunk.source_role === 'work') return 'work';
  if (chunk.source_role === 'project') return 'project';
  if (chunk.source_role === 'story') return 'story';
  if (chunk.source_role === 'canonical') return 'profile';
  return chunk.source_role;
}

function confidenceForEvalChunk(chunk) {
  if (chunk.trust_level === 'canonical' || chunk.trust_level === 'canonical_candidate') return 'high';
  if (chunk.source_role === 'inferred') return 'inferred';
  return chunk.verification_status ?? 'needs-review';
}

function buildEvalEvidenceCards(chunks) {
  const cards = [];
  const seenFiles = new Set();
  for (const chunk of chunks) {
    if (!chunk.public_safe || !chunk.can_answer_from) continue;
    if (seenFiles.has(chunk.file_path)) continue;
    seenFiles.add(chunk.file_path);
    cards.push({
      title: chunk.title,
      type: evidenceTypeForEvalChunk(chunk),
      summary: summarizeEvalChunk(chunk),
      source_path: chunk.file_path,
      public_url: Array.isArray(chunk.public_links) ? chunk.public_links[0] : undefined,
      confidence: confidenceForEvalChunk(chunk),
    });
    if (cards.length >= 6) break;
  }
  return cards;
}

function buildRecoveryFixtureSections(shortAnswer) {
  return {
    short_answer: String(shortAnswer ?? ''),
    verified_proof: [],
    inferred_fit: [],
    confidential_boundary: [],
    open_questions: [],
    suggested_next_action: 'Use the Contact section if you want to validate fit directly with Ramin.',
  };
}

function buildQualityGateFixtureSections(testCase) {
  const source =
    testCase.qualityGateFixtureSections && typeof testCase.qualityGateFixtureSections === 'object'
      ? testCase.qualityGateFixtureSections
      : {};

  return {
    short_answer: String(source.short_answer ?? testCase.qualityGateFixtureShortAnswer ?? ''),
    verified_proof: Array.isArray(source.verified_proof) ? source.verified_proof : [],
    inferred_fit: Array.isArray(source.inferred_fit) ? source.inferred_fit : [],
    confidential_boundary: Array.isArray(source.confidential_boundary) ? source.confidential_boundary : [],
    open_questions: Array.isArray(source.open_questions) ? source.open_questions : [],
    suggested_next_action: String(
      source.suggested_next_action ??
        testCase.qualityGateFixtureSuggestedNextAction ??
        'Use the Contact section if you want to validate fit directly with Ramin.',
    ),
  };
}

function validateEvalCase(testCase) {
  const failures = [];
  if (!testCase.id || typeof testCase.id !== 'string') failures.push('case id is required');
  if (!testCase.prompt || typeof testCase.prompt !== 'string') failures.push('prompt is required');
  if (!REQUEST_TYPES.has(testCase.requestType)) failures.push(`invalid requestType: ${testCase.requestType}`);
  if (!HIRING_MODES.has(testCase.hiringMode)) failures.push(`invalid hiringMode: ${testCase.hiringMode}`);
  if (testCase.expectedQuestionType && !QUESTION_TYPES.has(testCase.expectedQuestionType)) {
    failures.push(`invalid expected question type: ${testCase.expectedQuestionType}`);
  }
  if (testCase.expectedAnswerTechnique && !ANSWER_TECHNIQUES.has(testCase.expectedAnswerTechnique)) {
    failures.push(`invalid expected answer technique: ${testCase.expectedAnswerTechnique}`);
  }
  if (testCase.expectedAnswerFrame && !ANSWER_FRAMES.has(testCase.expectedAnswerFrame)) {
    failures.push(`invalid expected answer frame: ${testCase.expectedAnswerFrame}`);
  }
  for (const softCta of testCase.expectedSoftCtas ?? []) {
    if (!SOFT_CTA_IDS.has(softCta)) failures.push(`invalid expected soft CTA: ${softCta}`);
  }

  for (const sourceRole of testCase.expectedSourceRoles ?? []) {
    if (!SOURCE_ROLES.has(sourceRole)) failures.push(`invalid expected source role: ${sourceRole}`);
  }

  if (
    testCase.expectedSelectedStoryPathIncludes !== undefined &&
    !Array.isArray(testCase.expectedSelectedStoryPathIncludes)
  ) {
    failures.push('expectedSelectedStoryPathIncludes must be an array when provided');
  }
  if (
    testCase.expectedSelectedStoryEntities !== undefined &&
    !Array.isArray(testCase.expectedSelectedStoryEntities)
  ) {
    failures.push('expectedSelectedStoryEntities must be an array when provided');
  }
  if (testCase.expectedAbsentPathIncludes !== undefined && !Array.isArray(testCase.expectedAbsentPathIncludes)) {
    failures.push('expectedAbsentPathIncludes must be an array when provided');
  }

  if (testCase.recoveryFixtureShortAnswer !== undefined && typeof testCase.recoveryFixtureShortAnswer !== 'string') {
    failures.push('recoveryFixtureShortAnswer must be a string when provided');
  }
  if (testCase.expectedRecoveryStrategy !== undefined && typeof testCase.expectedRecoveryStrategy !== 'string') {
    failures.push('expectedRecoveryStrategy must be a string when provided');
  }
  if (testCase.expectedRecoveredKeywords !== undefined && !Array.isArray(testCase.expectedRecoveredKeywords)) {
    failures.push('expectedRecoveredKeywords must be an array when provided');
  }
  if (testCase.expectedRecoveredAbsentKeywords !== undefined && !Array.isArray(testCase.expectedRecoveredAbsentKeywords)) {
    failures.push('expectedRecoveredAbsentKeywords must be an array when provided');
  }
  if (
    testCase.qualityGateFixtureSections !== undefined &&
    (!testCase.qualityGateFixtureSections ||
      typeof testCase.qualityGateFixtureSections !== 'object' ||
      Array.isArray(testCase.qualityGateFixtureSections))
  ) {
    failures.push('qualityGateFixtureSections must be an object when provided');
  }
  if (
    testCase.qualityGateFixtureShortAnswer !== undefined &&
    typeof testCase.qualityGateFixtureShortAnswer !== 'string'
  ) {
    failures.push('qualityGateFixtureShortAnswer must be a string when provided');
  }
  if (
    testCase.expectedQualityGateIssues !== undefined &&
    !Array.isArray(testCase.expectedQualityGateIssues)
  ) {
    failures.push('expectedQualityGateIssues must be an array when provided');
  }
  if (
    testCase.expectedQualityGateStrategy !== undefined &&
    typeof testCase.expectedQualityGateStrategy !== 'string'
  ) {
    failures.push('expectedQualityGateStrategy must be a string when provided');
  }
  if (
    testCase.expectedQualityGateRecoveredKeywords !== undefined &&
    !Array.isArray(testCase.expectedQualityGateRecoveredKeywords)
  ) {
    failures.push('expectedQualityGateRecoveredKeywords must be an array when provided');
  }
  if (
    testCase.expectedQualityGateAbsentKeywords !== undefined &&
    !Array.isArray(testCase.expectedQualityGateAbsentKeywords)
  ) {
    failures.push('expectedQualityGateAbsentKeywords must be an array when provided');
  }

  for (const section of testCase.requiredContractSections ?? []) {
    if (!ANSWER_SECTIONS.has(section)) failures.push(`invalid required answer section: ${section}`);
  }

  return failures;
}

function recommendedTriageFor(testCase, failures) {
  const triage = new Set();
  for (const failure of failures) {
    if (failure.includes('source role') || failure.includes('source path')) {
      triage.add('Review source frontmatter, retrieval priority, headings, and query keywords.');
    }
    if (failure.includes('keyword')) {
      triage.add('Add clearer source wording or eval keywords that match approved corpus language.');
    }
    if (failure.includes('answerable evidence')) {
      triage.add('Check answer_permission, visibility, public_safe status, and public-safe canonical evidence.');
    }
    if (failure.includes('policy') || testCase.category === 'guardrail') {
      triage.add('Strengthen policy source wording or sensitive-query classification.');
    }
  }
  if (!triage.size) triage.add('Review the eval case and retrieved sources manually.');
  return Array.from(triage);
}

function countValues(items, valueFactory) {
  return items.reduce((counts, item) => {
    const value = valueFactory(item);
    if (!value) return counts;
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

function evaluateSuiteCoverage(results, gate = {}) {
  const coverageGate = {
    ...SUITE_GATE_DEFAULTS,
    ...gate,
  };
  const failures = [];
  const categories = new Set(results.map((result) => result.category).filter(Boolean));
  const questionTypes = new Set(results.map((result) => result.questionType).filter(Boolean));
  const selectedPaths = results.flatMap((result) => result.selectedSourcePaths ?? []);
  const qualityGateIssues = results.flatMap((result) => result.qualityGateResult?.issues ?? []);
  const recoveryStrategies = new Set(
    results.map((result) => result.recoveryResult?.strategy).filter((strategy) => strategy && strategy !== 'none'),
  );

  if (coverageGate.minimumCaseCount && results.length < coverageGate.minimumCaseCount) {
    failures.push(`Expected at least ${coverageGate.minimumCaseCount} eval cases; got ${results.length}`);
  }

  for (const requiredCategory of coverageGate.requiredCategories ?? []) {
    if (!categories.has(requiredCategory)) {
      failures.push(`Missing required eval category: ${requiredCategory}`);
    }
  }

  for (const requiredQuestionType of coverageGate.requiredQuestionTypes ?? []) {
    if (!questionTypes.has(requiredQuestionType)) {
      failures.push(`Missing required question type coverage: ${requiredQuestionType}`);
    }
  }

  for (const requiredPath of coverageGate.requiredSelectedPathIncludes ?? []) {
    if (!selectedPaths.some((filePath) => filePath.includes(requiredPath))) {
      failures.push(`Missing required selected source path coverage: ${requiredPath}`);
    }
  }

  for (const requiredRecoveryStrategy of coverageGate.requiredRecoveryStrategies ?? []) {
    if (!recoveryStrategies.has(requiredRecoveryStrategy)) {
      failures.push(`Missing required recovery strategy coverage: ${requiredRecoveryStrategy}`);
    }
  }

  for (const requiredQualityIssue of coverageGate.requiredAnswerQualityIssues ?? []) {
    if (!qualityGateIssues.includes(requiredQualityIssue)) {
      failures.push(`Missing answer quality gate issue coverage: ${requiredQualityIssue}`);
    }
  }

  return {
    failures,
    categories: countValues(results, (result) => result.category),
    questionTypes: countValues(results, (result) => result.questionType),
    recoveryStrategies: countValues(
      results.filter((result) => result.recoveryResult?.recovered),
      (result) => result.recoveryResult?.strategy,
    ),
    qualityGateIssues: countValues(qualityGateIssues, (issue) => issue),
    qualityGateStrategies: countValues(
      results.filter((result) => result.qualityGateResult?.applied),
      (result) => result.qualityGateResult?.strategy,
    ),
    selectedPathCoverage: Array.from(new Set(selectedPaths)).sort(),
  };
}

function evaluateCase(corpus, testCase) {
  const schemaFailures = validateEvalCase(testCase);
  if (schemaFailures.length) {
    return {
      id: testCase.id ?? 'invalid-case',
      category: testCase.category ?? 'unknown',
      requestType: testCase.requestType ?? 'unknown',
      status: 'fail',
      score: 0,
      failures: schemaFailures,
      warnings: [],
      topSources: [],
      recommendedTriage: ['Fix eval case schema before reviewing retrieval behavior.'],
    };
  }

  const selected = retrieveContextChunks(corpus, testCase.prompt, testCase.requestType);
  const queryIntent = classifyQuery(testCase.prompt, testCase.requestType);
  const selectedChunks = selected.map(({ chunk }) => chunk);
  const selectedStory = selectBestStoryForQuestion(
    testCase.prompt,
    queryIntent,
    selectedChunks,
  );
  const selectedRoles = new Set(selected.map(({ chunk }) => chunk.source_role));
  const selectedPaths = selected.map(({ chunk }) => chunk.file_path);
  const answerableEvidenceCount = selected.filter(
    ({ chunk }) => chunk.can_answer_from && chunk.public_safe && !['framework', 'inferred'].includes(chunk.source_role),
  ).length;
  const failures = [];
  const warnings = [];

  for (const expectedRole of testCase.expectedSourceRoles ?? []) {
    if (!selectedRoles.has(expectedRole)) {
      failures.push(`Missing expected source role: ${expectedRole}`);
    }
  }

  for (const expectedPath of testCase.expectedPathIncludes ?? []) {
    if (!selectedPaths.some((filePath) => filePath.includes(expectedPath))) {
      failures.push(`Missing expected source path: ${expectedPath}`);
    }
  }

  for (const absentPath of testCase.expectedAbsentPathIncludes ?? []) {
    if (selectedPaths.some((filePath) => filePath.includes(absentPath))) {
      failures.push(`Unexpected source path was retrieved: ${absentPath}`);
    }
  }

  for (const expectedStoryPath of testCase.expectedSelectedStoryPathIncludes ?? []) {
    if (!selectedStory?.sourcePath?.includes(expectedStoryPath)) {
      failures.push(
        `Expected selected story path ${expectedStoryPath}; got ${selectedStory?.sourcePath ?? 'none'}`,
      );
    }
  }

  const selectedStoryEntities = new Set((selectedStory?.entities ?? []).map((entity) => String(entity).toLowerCase()));
  for (const expectedEntity of testCase.expectedSelectedStoryEntities ?? []) {
    if (!selectedStoryEntities.has(String(expectedEntity).toLowerCase())) {
      failures.push(
        `Expected selected story entity ${expectedEntity}; got ${(selectedStory?.entities ?? []).join(', ') || 'none'}`,
      );
    }
  }

  for (const expectedKeyword of testCase.expectedKeywords ?? []) {
    if (!hasExpectedKeyword(selected, expectedKeyword)) {
      failures.push(`Missing expected keyword in retrieved context: ${expectedKeyword}`);
    }
  }

  if (testCase.minimumAnswerableEvidenceCards && answerableEvidenceCount < testCase.minimumAnswerableEvidenceCards) {
    failures.push(
      `Expected at least ${testCase.minimumAnswerableEvidenceCards} answerable evidence chunks; got ${answerableEvidenceCount}`,
    );
  }

  if (answerableEvidenceCount < queryIntent.retrievalProfile.minimumAnswerableEvidence) {
    failures.push(
      `Retrieval profile expected at least ${queryIntent.retrievalProfile.minimumAnswerableEvidence} answerable evidence chunks; got ${answerableEvidenceCount}`,
    );
  }

  if (testCase.category === 'guardrail' && !selectedRoles.has('policy')) {
    failures.push('Guardrail case did not retrieve policy context.');
  }

  const allowsNoRetrievedChunks = ['conversation_open', 'clarification_needed'].includes(
    queryIntent.primaryQuestionType,
  );

  if (!selected.length && !allowsNoRetrievedChunks) {
    failures.push('No chunks were retrieved.');
  }

  if (testCase.expectedQuestionType && queryIntent.primaryQuestionType !== testCase.expectedQuestionType) {
    failures.push(
      `Expected question type ${testCase.expectedQuestionType}; got ${queryIntent.primaryQuestionType}`,
    );
  }

  if (testCase.expectedAnswerTechnique && queryIntent.answerTechniqueId !== testCase.expectedAnswerTechnique) {
    failures.push(
      `Expected answer technique ${testCase.expectedAnswerTechnique}; got ${queryIntent.answerTechniqueId}`,
    );
  }

  if (testCase.expectedAnswerFrame && queryIntent.answerFrameId !== testCase.expectedAnswerFrame) {
    failures.push(
      `Expected answer frame ${testCase.expectedAnswerFrame}; got ${queryIntent.answerFrameId}`,
    );
  }

  for (const expectedSoftCta of testCase.expectedSoftCtas ?? []) {
    if (!queryIntent.softCtas.includes(expectedSoftCta)) {
      failures.push(`Missing expected soft CTA: ${expectedSoftCta}`);
    }
  }
  if (Array.isArray(testCase.expectedSoftCtas) && testCase.expectedSoftCtas.length === 0 && queryIntent.softCtas.length) {
    failures.push(`Expected no soft CTAs; got ${queryIntent.softCtas.join(', ')}`);
  }

  if (!testCase.requiredContractSections?.length) {
    warnings.push('Case has no required answer-contract sections.');
  }

  let recoveryResult = null;
  if (testCase.recoveryFixtureShortAnswer) {
    const fixtureSections = buildRecoveryFixtureSections(testCase.recoveryFixtureShortAnswer);
    const recovery = recoverOverCautiousAnswer(
      fixtureSections,
      testCase.prompt,
      testCase.requestType,
      {
        sources: selectedPaths,
        chunks: selectedChunks,
        answerableEvidenceCount,
        queryIntent,
        selectedStory,
      },
      buildEvalEvidenceCards(selectedChunks),
    );
    const recoveredText = [
      recovery.sections.short_answer,
      ...(Array.isArray(recovery.sections.verified_proof) ? recovery.sections.verified_proof : []),
      ...(Array.isArray(recovery.sections.inferred_fit) ? recovery.sections.inferred_fit : []),
    ].join(' ').toLowerCase();

    recoveryResult = {
      recovered: recovery.recovered,
      strategy: recovery.strategy,
      reason: recovery.reason,
      shortAnswer: recovery.sections.short_answer,
    };

    if (testCase.expectedRecoveryStrategy && recovery.strategy !== testCase.expectedRecoveryStrategy) {
      failures.push(`Expected recovery strategy ${testCase.expectedRecoveryStrategy}; got ${recovery.strategy}`);
    }
    if (testCase.expectedRecoveryStrategy && !recovery.recovered) {
      failures.push(`Expected recovery to apply for strategy ${testCase.expectedRecoveryStrategy}`);
    }
    for (const expectedRecoveredKeyword of testCase.expectedRecoveredKeywords ?? []) {
      if (!recoveredText.includes(String(expectedRecoveredKeyword).toLowerCase())) {
        failures.push(`Recovered answer missing keyword: ${expectedRecoveredKeyword}`);
      }
    }
    for (const absentRecoveredKeyword of testCase.expectedRecoveredAbsentKeywords ?? []) {
      if (recoveredText.includes(String(absentRecoveredKeyword).toLowerCase())) {
        failures.push(`Recovered answer included forbidden keyword: ${absentRecoveredKeyword}`);
      }
    }
  }

  let qualityGateResult = null;
  if (testCase.qualityGateFixtureShortAnswer || testCase.qualityGateFixtureSections) {
    const fixtureSections = buildQualityGateFixtureSections(testCase);
    const qualityGate = applyAnswerQualityGate(
      fixtureSections,
      testCase.prompt,
      testCase.requestType,
      {
        sources: selectedPaths,
        chunks: selectedChunks,
        answerableEvidenceCount,
        queryIntent,
        selectedStory,
      },
      buildEvalEvidenceCards(selectedChunks),
    );
    const qualityGateText = [
      qualityGate.sections.short_answer,
      ...(Array.isArray(qualityGate.sections.verified_proof) ? qualityGate.sections.verified_proof : []),
      ...(Array.isArray(qualityGate.sections.inferred_fit) ? qualityGate.sections.inferred_fit : []),
      ...(Array.isArray(qualityGate.sections.confidential_boundary) ? qualityGate.sections.confidential_boundary : []),
      ...(Array.isArray(qualityGate.sections.open_questions) ? qualityGate.sections.open_questions : []),
      qualityGate.sections.suggested_next_action,
    ]
      .join(' ')
      .toLowerCase();

    qualityGateResult = {
      applied: qualityGate.applied,
      issues: qualityGate.issues,
      strategy: qualityGate.strategy,
      reason: qualityGate.reason,
      recoveryStrategy: qualityGate.recovery?.strategy,
      shortAnswer: qualityGate.sections.short_answer,
      suggestedNextAction: qualityGate.sections.suggested_next_action,
    };

    if (testCase.expectedQualityGateStrategy && qualityGate.strategy !== testCase.expectedQualityGateStrategy) {
      failures.push(`Expected quality gate strategy ${testCase.expectedQualityGateStrategy}; got ${qualityGate.strategy}`);
    }
    if ((testCase.expectedQualityGateIssues?.length || testCase.expectedQualityGateStrategy) && !qualityGate.applied) {
      failures.push('Expected answer quality gate to apply.');
    }
    for (const expectedIssue of testCase.expectedQualityGateIssues ?? []) {
      if (!qualityGate.issues.includes(expectedIssue)) {
        failures.push(`Quality gate missing expected issue: ${expectedIssue}`);
      }
    }
    for (const expectedKeyword of testCase.expectedQualityGateRecoveredKeywords ?? []) {
      if (!qualityGateText.includes(String(expectedKeyword).toLowerCase())) {
        failures.push(`Quality-gated answer missing keyword: ${expectedKeyword}`);
      }
    }
    for (const absentKeyword of testCase.expectedQualityGateAbsentKeywords ?? []) {
      if (qualityGateText.includes(String(absentKeyword).toLowerCase())) {
        failures.push(`Quality-gated answer included forbidden keyword: ${absentKeyword}`);
      }
    }
  }

  const score = Math.max(0, 100 - failures.length * 24 - warnings.length * 4);
  const topSources = selected.slice(0, 8).map(({ chunk, score: retrievalScore, tokenHits }) => ({
    file_path: chunk.file_path,
    title: chunk.title,
    source_role: chunk.source_role,
    retrieval_priority: chunk.retrieval_priority,
    score: Number(retrievalScore.toFixed(4)),
    token_hits: tokenHits,
    public_safe: chunk.public_safe,
    can_answer_from: chunk.can_answer_from,
  }));

  return {
    id: testCase.id,
    category: testCase.category,
    requestType: testCase.requestType,
    questionType: queryIntent.primaryQuestionType,
    expectedQuestionType: testCase.expectedQuestionType,
    answerTechnique: queryIntent.answerTechniqueId,
    expectedAnswerTechnique: testCase.expectedAnswerTechnique,
    answerFrame: queryIntent.answerFrameId,
    expectedAnswerFrame: testCase.expectedAnswerFrame,
    softCtas: queryIntent.softCtas,
    expectedSoftCtas: testCase.expectedSoftCtas ?? [],
    retrievalProfile: queryIntent.retrievalProfile,
    hiringMode: testCase.hiringMode,
    prompt: testCase.prompt,
    status: failures.length ? 'fail' : 'pass',
    score,
    failures,
    warnings,
    expectedSourceRoles: testCase.expectedSourceRoles ?? [],
    expectedPathIncludes: testCase.expectedPathIncludes ?? [],
    expectedAbsentPathIncludes: testCase.expectedAbsentPathIncludes ?? [],
    selectedSourcePaths: selectedPaths,
    expectedSelectedStoryPathIncludes: testCase.expectedSelectedStoryPathIncludes ?? [],
    expectedSelectedStoryEntities: testCase.expectedSelectedStoryEntities ?? [],
    expectedKeywords: testCase.expectedKeywords ?? [],
    answerableEvidenceCount,
    requiredContractSections: testCase.requiredContractSections ?? [],
    forbiddenAnswerThemes: testCase.forbiddenAnswerThemes ?? [],
    selectedStory,
    recoveryResult,
    qualityGateResult,
    topSources,
    recommendedTriage: recommendedTriageFor(testCase, failures),
  };
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

const corpus = await readJson(CORPUS_PATH);
const evalSuite = await readJson(CASES_PATH);
const cases = Array.isArray(evalSuite.cases) ? evalSuite.cases : [];

if (!cases.length) {
  throw new Error('AI Ramin eval suite has no cases.');
}

const runId = createHash('sha256')
  .update(`${new Date().toISOString()}\n${cases.length}\n${corpus.generated_at ?? ''}`)
  .digest('hex')
  .slice(0, 12);
const gate = evalSuite.qualityGate ?? {};
const results = cases.map((testCase) => evaluateCase(corpus, testCase));
const failures = results.filter((result) => result.status === 'fail');
const suiteCoverage = evaluateSuiteCoverage(results, gate);
const suiteFailureCount = suiteCoverage.failures.length;
const passRate = (results.length - failures.length) / results.length;
const averageScore = results.reduce((sum, result) => sum + result.score, 0) / results.length;
const summary = {
  run_id: runId,
  generated_at: new Date().toISOString(),
  corpus_generated_at: corpus.generated_at,
  corpus_chunks: corpus.stats?.chunks,
  case_count: results.length,
  passed: results.length - failures.length,
  failed: failures.length,
  pass_rate: Number(passRate.toFixed(4)),
  average_score: Number(averageScore.toFixed(2)),
  quality_gate: gate,
  status:
    failures.length + suiteFailureCount <= (gate.maximumFailures ?? 0) &&
    passRate >= (gate.minimumPassRate ?? 1) &&
    averageScore >= (gate.minimumAverageScore ?? 85) &&
    suiteFailureCount === 0
      ? 'pass'
      : 'fail',
  suite_failures: suiteCoverage.failures,
  coverage: {
    categories: suiteCoverage.categories,
    question_types: suiteCoverage.questionTypes,
    recovery_strategies: suiteCoverage.recoveryStrategies,
    answer_quality_issues: suiteCoverage.qualityGateIssues,
    answer_quality_strategies: suiteCoverage.qualityGateStrategies,
  },
};
const report = {
  summary,
  results,
};

if (WRITE_REPORT) {
  await mkdir(path.dirname(REPORT_PATH), { recursive: true });
  await writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
}

if (LOG_FAILURES && failures.length) {
  await mkdir(path.dirname(FAILURE_LOG_PATH), { recursive: true });
  const loggedAt = new Date().toISOString();
  const lines = failures.map((failure) =>
    JSON.stringify({
      logged_at: loggedAt,
      run_id: runId,
      case_id: failure.id,
      category: failure.category,
      request_type: failure.requestType,
      prompt: failure.prompt,
      score: failure.score,
      failures: failure.failures,
      warnings: failure.warnings,
      top_sources: failure.topSources.slice(0, 5),
      recommended_triage: failure.recommendedTriage,
    }),
  );
  await appendFile(FAILURE_LOG_PATH, `${lines.join('\n')}\n`);
}

if (JSON_OUTPUT) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(
    `AI Ramin eval ${summary.status}: ${summary.passed}/${summary.case_count} passed, average score ${summary.average_score}.`,
  );
  for (const failure of failures) {
    console.error(`- ${failure.id}: ${failure.failures.join('; ')}`);
    console.error(`  Top sources: ${failure.topSources.slice(0, 3).map((source) => source.file_path).join(', ')}`);
  }
  for (const suiteFailure of suiteCoverage.failures) {
    console.error(`- suite coverage: ${suiteFailure}`);
  }
  if (WRITE_REPORT) {
    console.log(`Report written to ${normalizePath(path.relative(ROOT_DIR, REPORT_PATH))}`);
  }
  if (LOG_FAILURES && failures.length) {
    console.log(`Failures appended to ${normalizePath(path.relative(ROOT_DIR, FAILURE_LOG_PATH))}`);
  }
}

if (summary.status !== 'pass') {
  process.exit(1);
}
