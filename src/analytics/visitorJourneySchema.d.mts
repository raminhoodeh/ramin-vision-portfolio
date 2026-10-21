export type JourneySurface = 'home' | 'work' | 'projects' | 'teaching' | 'about' | 'resources' | 'ai' | 'contact' | 'bonus' | 'method' | 'thesis' | 'talk' | 'case' | 'other';
export type JourneyEvent = 'page_view' | 'case_open' | 'evidence_follow' | 'cv_open' | 'course_open' | 'talk_open' | 'ai_request' | 'ai_result' | 'contact_open';
export type JourneyPayload = { schemaVersion: 1; event: JourneyEvent; surface: JourneySurface; target: string; audience: 'visitor' | 'qa' };
export const JOURNEY_SURFACES: JourneySurface[];
export const JOURNEY_EVENTS: JourneyEvent[];
export const JOURNEY_TARGETS: Record<JourneyEvent, string[]>;
export function validateJourneyPayload(value: unknown): value is JourneyPayload;
