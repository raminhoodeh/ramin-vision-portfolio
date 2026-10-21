// Editorial summaries of the author's existing course curriculum and public teaching
// material. These are learning goals and example exercises, not measured outcomes or
// a claim that assignments/assets are identical across platform editions.
export const courseLearning = {
  'AI-Native Product OS': {
    audience: 'For product managers moving into AI and builders who want to make model behaviour, context and decision rights part of product design.',
    outcomes: [
      'Map an AI feature across Model, Context, Orchestration, Governance and Human responsibilities.',
      'Run Talk, Decide, Build, Observe and Iterate around a specific customer problem.',
      'Define evaluation cases, stopping conditions and a human escalation route before granting action authority.',
    ],
    preview: 'A useful recommendation is different from permission to act. In the governance lesson, the product question is what should happen when a plausible answer hides an unresolved risk. An evaluation case makes that failure repeatable; a rule outside the model enforces the stop.',
    exercise: 'Use the hypothetical DISx sanctions match: write the ambiguous input, expected escalation and prohibited action as one evaluation case. Then identify which system control must block the payment recommendation from becoming an authorised transfer.',
    artifact: 'A small evaluation case and an explicit authority boundary.',
    sampleLabel: 'Read the public worked example',
    sampleHref: '/talks/disx-dubai#worked-example',
    platformPreviews: ['Introduction: The New AI Product Management Operating System · 28:34', 'The Orchestration Layer · 37:01'],
    editionNote: 'Udemy and Coursera are separate platform editions. Coursera is offered by LearnKartS and lists 10 modules; use each listing for its curriculum, assignments and included material.',
  },
  'Product Innovation Process': {
    audience: 'For aspiring and practising product managers who want a clear route from discovery to release, with shared responsibilities and decisions.',
    outcomes: [
      'Connect a customer problem to strategic alignment, discovery evidence and a proposed solution.',
      'Turn the solution into personas, journeys, requirements and success criteria.',
      'Plan alpha, beta and live release checks, then use feedback to decide the next iteration.',
    ],
    preview: 'Before writing requirements, make the problem and its backstory explicit. Explain whose difficulty matters, what evidence supports it and how solving it serves the product direction. The process document gives the team one place to inspect that reasoning before moving to design.',
    exercise: 'Choose a real customer problem. Fill in its backstory, strategic alignment and problem/solution statement, then define one success criterion and the evidence you would need before a wider rollout.',
    artifact: 'A short discovery brief and a release-check decision.',
    sampleLabel: 'Open the process document',
    sampleHref: 'https://docs.google.com/document/d/1WA3bAjACbkhMYAi7xiZTq5UO29Tqxsb3/edit?usp=sharing&ouid=110264933146795409149&rtpof=true&sd=true',
    platformPreviews: ['Introduction to the Product Innovation Process · 18:49', 'Stage 1/5: Discovery · 10:53'],
    editionNote: 'This is the product-management foundation course on Udemy. Its five stages describe the process; they are not the module count of the AI course on Coursera.',
  },
} as const;

export type CourseLearningFramework = keyof typeof courseLearning;
