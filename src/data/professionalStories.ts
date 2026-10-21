export type ProfessionalStory = {
  slug: string;
  company: string;
  companyNames: readonly string[];
  title: string;
  period: string;
  role: string;
  highlight: string;
  problem: string;
  ownership: string;
  decision: readonly string[];
  results: readonly string[];
  limitations: string;
  links: readonly { label: string; href: string }[];
  sourceRefs: readonly string[];
};

export const professionalStories = [
  {
    slug: 'side',
    company: 'SIDE',
    companyNames: ['SIDE', 'Side.inc'],
    title: 'Build targeted tools; keep Finance in control.',
    period: 'Mar – Aug 2025',
    role: 'Senior Product Manager · ERP and operational transformation',
    highlight: '20% lower ERP operating costs within four months.',
    problem: 'Internal ERP modules carried operating costs, while Finance, Operations and Sales worked across disconnected data. Reporting and process changes still required substantial manual effort.',
    ownership: 'I owned product work on internal ERP alternatives and AI-assisted reporting, working across Engineering, Finance, Operations and Sales. This was a cross-functional delivery effort, rather than a claim that I built or operated every financial component myself.',
    decision: [
      'Replace selected third-party modules with Windsurf-assisted internal reporting and reconciliation applications, rather than rebuilding the entire financial system. The ERP remained the system of record.',
      'Use Microsoft Enterprise Copilot for aggregation and exception triage across commercial deals, bookings and ledger data. Finance retained approval over postings: AI could help prepare the work without acquiring accounting authority.',
    ],
    results: [
      'ERP operating costs reduced by 20% within four months.',
      'Manual financial reporting reduced by 30% during the Mar–Aug 2025 engagement.',
      'Reported idea-to-feature time fell 90%, with engineering capacity allocated to innovation increasing from 40% to 60%.',
    ],
    limitations: 'These are employer-work outcomes reported in my CV, not independently audited measurements. Internal dashboards, cost baselines and the underlying before/after samples are not public. The 30% reporting and 90% delivery figures do not have separate measurement windows in the public record; the four-month window applies to ERP operating costs.',
    links: [
      { label: 'SIDE company context', href: 'https://www.side.inc/' },
      { label: 'Read my CV', href: '/cv' },
    ],
    sourceRefs: [
      'ai-ramin-section/canonical/work-experiences/side-ai-erp.md',
      'Supplied Payments & Embedded Finance CV 2026: SIDE experience',
    ],
  },
  {
    slug: 'vivup',
    company: 'Vivup / Work&Life Partners',
    companyNames: ['Perkbox Vivup', 'Vivup', 'Work&Life Partners'],
    title: 'Reduce checkout friction without giving up monetisation.',
    period: 'Jan 2023 – Nov 2024',
    role: 'Senior Product Manager · Employee benefits and checkout',
    highlight: 'One-third lower checkout abandonment within 30 days.',
    problem: 'Employee benefits were reached through fragmented app journeys and separate order forms. At the same time, the business needed a stronger commercial model in a market where competitors offered more for free.',
    ownership: 'I analysed user-interview findings, aligned stakeholders around Order Guidance and owned product decisions across checkout and monetisation. I defined the platform-margin model for capturing a share of employee benefit savings.',
    decision: [
      'Make the purchase journey easier to understand: replace separate benefit forms with unified checkout guidance across supported payroll deductions, cards and reward balances.',
      'Treat monetisation as a product decision alongside experience quality. Introduce a take rate on benefit savings while maintaining checkout conversion and user satisfaction, rather than treating revenue as an isolated pricing change.',
    ],
    results: [
      'Order-form and checkout abandonment reduced by one third within 30 days of delivery.',
      'Customer lifetime value increased 19% over five months after the benefit-savings monetisation change.',
    ],
    limitations: 'These are employer-work outcomes reported in my CV, not independently audited measurements. Checkout guidance and monetisation were separate initiatives in the same role; the figures should not be combined into one experiment or a single causal claim. Cohort definitions, sample sizes and internal analytics are not public.',
    links: [
      { label: 'Perkbox company context', href: 'https://www.perkbox.com/' },
      { label: 'Read my CV', href: '/cv' },
    ],
    sourceRefs: [
      'ai-ramin-section/canonical/work-experiences/perkbox-vivup.md',
      'Supplied Payments & Embedded Finance CV 2026: Vivup / Work&Life Partners experience',
    ],
  },
] as const satisfies readonly ProfessionalStory[];
