import { aiProductCourseEvidence, disxTalkEvidence } from './teachingEvidence';

export const homepagePositioning = {
  name: 'Ramin Hoodeh',
  role: 'AI Product Manager',
  specialism: 'Payments & Embedded Finance',
  moneyMovement: 'Moving money where it hasn’t moved before.',
  intro: 'I build AI products proven to grow revenue, and teach the judgment behind them.',
  experience:
    'Eight-plus years delivering commercial products across payments, marketplaces and financial data.',
  strengthCommercial: 'Product decisions that grow revenue, improve conversion and reduce operating costs.',
  strengthBuilding: 'AI products I build hands-on, from the customer experience to context, workflows and evals.',
  strengthTeaching: 'My AI-Native Product OS, taught on Coursera and Udemy and presented at DISx Dubai.',
  recognition: [
    { label: 'Creator of the AI-Native Product OS', href: '/product-thesis' },
    { label: 'Coursera & Udemy instructor', href: '/thoughts/courses' },
    { label: 'DISx Dubai speaker', href: '/talks/disx-dubai' },
  ],
  personalNote: 'Also a fiction author.',
} as const;

// Existing public career figures, with role dates kept separate from each
// outcome's measurement window. These are not independently audited results.
export const homepageOutcomes = [
  {
    id: 'side-erp-cost',
    company: 'SIDE',
    metric: '20%',
    outcome: 'lower ERP operating costs',
    context: 'Internal reporting and reconciliation tools',
    responsibility: 'I led the replacement of third-party ERP modules with AI-assisted internal tools.',
    role: 'Senior Product Manager',
    rolePeriod: 'Mar–Aug 2025',
    measurementPeriod: 'Over four months',
    href: '/work/side',
  },
  {
    id: 'vivup-checkout',
    company: 'Vivup',
    metric: '1/3',
    outcome: 'less checkout abandonment',
    context: 'Order Guidance for employee benefits',
    responsibility: 'I aligned stakeholders around Order Guidance and a simpler checkout journey.',
    role: 'Senior Product Manager',
    rolePeriod: 'Jan 2023–Nov 2024',
    measurementPeriod: 'First month after delivery',
    href: '/work/vivup',
  },
  {
    id: 'vivup-customer-value',
    company: 'Vivup',
    metric: '19%',
    outcome: 'higher customer lifetime value',
    context: 'Monetisation of employee benefit savings',
    responsibility: 'I introduced a take rate on benefit savings, balancing platform margin with user satisfaction.',
    role: 'Senior Product Manager',
    rolePeriod: 'Jan 2023–Nov 2024',
    measurementPeriod: 'Over five months',
    href: '/work/vivup',
  },
] as const;

export const homepageProducts = [
  {
    name: 'nsso',
    kind: 'Independent web product',
    focus: 'Reviewed agent actions',
    description: 'An AI profile coach that proposes changes for the owner to review before saving.',
    href: '/projects/nsso',
    publicHref: 'https://nsso.me/',
    publicLabel: 'Open nsso',
  },
  {
    name: '24Seven Concierge',
    kind: 'Client AI enhancement · iOS app',
    focus: 'Catalogue-led planning',
    description: 'Travel requests become visual catalogue suggestions and a brief for a human concierge.',
    href: '/projects/24seven-concierge',
    publicHref: 'https://apps.apple.com/us/app/24seven-concierge/id6663954162',
    publicLabel: 'App Store',
  },
  {
    name: 'Dreamsea',
    kind: 'Independent iOS product',
    focus: 'Voice and multimodal AI',
    description: 'Voice-first dream capture, symbolic interpretation and imagery, with resumable generation.',
    href: '/projects/dreamsea',
    publicHref: 'https://apps.apple.com/us/app/dreamsea/id6761101193',
    publicLabel: 'App Store',
  },
] as const;

export const homepageRecognition = {
  teaching: {
    title: 'Making AI product practice teachable.',
    description: `The AI-Native Product OS is taught on Udemy and on Coursera through ${aiProductCourseEvidence.coursera.provider}.`,
    udemy: aiProductCourseEvidence.udemy,
    coursera: aiProductCourseEvidence.coursera,
  },
  speaking: {
    title: disxTalkEvidence.title,
    event: disxTalkEvidence.event,
    dateLabel: disxTalkEvidence.dateLabel,
    description:
      'I presented the Product OS in Dubai and applied it to a hypothetical high-stakes payments decision.',
    href: '/talks/disx-dubai',
    source: disxTalkEvidence.sources[0],
  },
} as const;

export const homepageWriting = {
  title: 'Stories are part of the work, too.',
  description: 'I write fiction about meaning, identity and the choices people make.',
  href: '/thoughts/books',
  label: 'Explore the writing',
} as const;
