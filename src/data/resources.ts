import { productMethodDiagramUrl, productWorkspaceHref } from './disxTalk';
import { aiProductCourseEvidence } from './teachingEvidence';

export const requestEmail = (subject: string) => `mailto:raminhoodeh@gmail.com?subject=${encodeURIComponent(subject)}`;

export const resourceStarterLinks = [
  {
    title: 'AI-Native Product OS workspace',
    description: 'The installable workspace, setup guidance and reusable product workflows.',
    label: 'Open the workspace', href: productWorkspaceHref,
  },
  {
    title: 'A worked evaluation example',
    description: 'A fictional Risk Brief Assistant: test inputs, expected behaviour, refusal cases and regression checks. A teaching example, rather than a production result.',
    label: 'Inspect the evaluation set',
    href: `${productWorkspaceHref}/blob/main/examples/fictional-ai-feature/governance/eval-set.md`,
  },
  {
    title: 'The Stack and Loop slide',
    description: 'The five areas of responsibility and development loop, on one readable slide.',
    label: 'Open the slide', href: productMethodDiagramUrl,
  },
] as const;

// These are access routes and enquiry options, not automatic entitlements.
// Bonus uses the same copy so its playful reveal cannot make a stronger offer.
export const resourceOffers = [
  {
    title: 'AI product management courses',
    detail: 'See current pricing and access on the course page. Ask Ramin whether a current promotion applies.',
    link: aiProductCourseEvidence.udemy.href,
    actionLabel: 'View the course',
    requestLink: requestEmail('AI product management course offer'),
    requestLabel: 'Ask about a current offer',
  },
  {
    title: 'Ask about a consultation',
    detail: 'Share your question, team and timeline. Scope and scheduling are confirmed directly with Ramin.',
    link: requestEmail('AI product consultation enquiry'),
    actionLabel: 'Discuss a consultation',
  },
  {
    title: 'Explore Dreamsea',
    detail: 'View current access options in the app. Any special access needs confirmation from Ramin.',
    link: 'https://apps.apple.com/us/app/dreamsea/id6761101193',
    actionLabel: 'View on the App Store',
    requestLink: requestEmail('Dreamsea access enquiry'),
    requestLabel: 'Ask about access',
  },
  {
    title: 'AI tools recommendations',
    detail: 'The earlier shared catalogue has no confirmed review date here. Ask for a focused starting point for your use case.',
    link: requestEmail('AI tools recommendations'),
    actionLabel: 'Ask for a starting point',
  },
] as const;
export type ResourceOffer = {
  title: string; detail: string; link: string; actionLabel: string;
  requestLink?: string; requestLabel?: string;
};

export const resourceContact = {
  email: 'raminhoodeh@gmail.com',
  linkedin: 'https://www.linkedin.com/in/raminhoodeh',
  purpose: 'For AI product roles, payments and embedded finance, or teaching and speaking enquiries, tell me the problem, team and timeline.',
  timezoneLabel: 'Dubai time · UTC+4',
  consultationHref: requestEmail('AI product consultation enquiry'),
} as const;

export const bonusResourceCopy = {
  hook: 'A little extra curiosity.',
  body: 'Tap the rock three times for a playful reveal, or open the same resources directly. Course access, consultations and special offers are confirmed through their linked destination.',
} as const;

// Link checks establish that material can be inspected, not that an offer is active.
export const resourceEvidence = {
  checkedOn: '2026-10-22',
  workspacePublic: true,
  evaluationExamplePublic: true,
  evaluationExampleScope: 'fictional teaching example',
  bookingAvailability: 'unconfirmed',
  coursePromotion: 'unconfirmed',
  dreamseaSpecialAccess: 'unconfirmed',
  toolsCatalogueReviewDate: null,
} as const;
