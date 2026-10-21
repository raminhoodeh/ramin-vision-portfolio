// Finite categories only. Never add free text, URLs, prompts, identifiers or headers.
export const JOURNEY_SURFACES = ['home', 'work', 'projects', 'teaching', 'about', 'resources', 'ai', 'contact', 'bonus', 'method', 'thesis', 'talk', 'case', 'other'];
export const JOURNEY_TARGETS = {
  page_view: JOURNEY_SURFACES,
  case_open: ['nsso', 'dreamsea', 'qadam', '24seven-concierge', 'razinflix', 'ai-native-product-manager-os', 'mass-social-wisdom-agent', 'ai-costs-dashboard', 'rag-pipeline', 'product-thesis', 'metacognition', 'side', 'vivup'],
  evidence_follow: ['product', 'repository', 'source', 'presentation', 'book'],
  cv_open: ['cv'],
  course_open: ['udemy', 'coursera'],
  talk_open: ['disx', 'tedx', 'other'],
  ai_request: ['general_chat', 'role_fit', 'product_judgment', 'evidence_lookup', 'hiring_brief'],
  ai_result: ['success', 'unavailable'],
  contact_open: ['email_copy', 'email', 'linkedin', 'whatsapp', 'booking', 'other'],
};
export const JOURNEY_EVENTS = Object.keys(JOURNEY_TARGETS);
export function validateJourneyPayload(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).length === 5
    && ['schemaVersion', 'event', 'surface', 'target', 'audience'].every((key) => Object.hasOwn(value, key))
    && value.schemaVersion === 1 && JOURNEY_SURFACES.includes(value.surface)
    && Object.hasOwn(JOURNEY_TARGETS, value.event) && JOURNEY_TARGETS[value.event].includes(value.target)
    && ['visitor', 'qa'].includes(value.audience));
}
