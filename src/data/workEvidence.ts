export type WorkEvidence = {
  summary: string;
  label: string;
  scopeNote: string;
};

// Public-safe summaries of the existing canonical work-experience records.
// Employer metrics remain supplied career claims, rather than independent audits.
// Do not fill a missing metric definition or software contribution by inference.
export const workEvidenceByCompany: Record<string, WorkEvidence> = {
  Bayut: {
    label: 'Public remit',
    summary: 'AI product work in property search, recommendations and conversational AI.',
    scopeNote: 'Feature details, internal metrics and roadmaps remain confidential. Introducing a framework does not establish measured team-wide adoption.',
  },
  SIDE: {
    label: 'Reported employer outcome',
    summary: '20% lower ERP operating costs over four months through targeted internal-tool replacement.',
    scopeNote: 'Ramin owned product decisions with Engineering, Finance, Operations and Sales; Finance retained posting approval. The four-month window applies to ERP costs. Separate reporting and delivery figures have no public measurement windows or independently audited baselines.',
  },
  'Perkbox Vivup': {
    label: 'Reported employer outcome',
    summary: 'One-third lower checkout abandonment within 30 days through Order Guidance.',
    scopeNote: 'Checkout guidance and benefit-savings monetisation were separate initiatives. The reported 19% customer-lifetime-value increase covers five months. Cohorts, sample sizes and internal analytics are not public.',
  },
  GroupM: {
    label: 'Product contribution',
    summary: 'Translated carbon methodology into product specifications for a media Carbon Calculator.',
    scopeNote: 'GroupM is the role-era name for the 2022 engagement. The reported £1bn+ describes media investment assessed by the calculator in 2022; it is a product-usage context, with no independently audited personal revenue attribution.',
  },
  'Cox Automotive': {
    label: 'Prioritisation decision',
    summary: 'Turned an ambiguous auction-platform backlog into a ranked roadmap with a Feature Scoring Framework.',
    scopeNote: 'This was a contract Product Owner role. The reported halving of stakeholder feedback cycles has no defined baseline or measurement window in the public record; manufacturer-specific roadmap details remain private.',
  },
  'Ordnance Survey': {
    label: 'Discovery contribution',
    summary: 'Led 12 discovery workshops and helped validate three product concepts for further investment.',
    scopeNote: 'The linked Microsoft documentation identifies the OS Places connector. Discovery counts are supplied career claims; the separate data-utilisation and forecasting improvements lack public metric definitions and baselines.',
  },
  Urgentem: {
    label: 'Reported product and commercial contribution',
    summary: 'Co-managed Element6’s launch; reported demo-to-buy conversion rose 30% over four months.',
    scopeNote: 'The latest supplied CV reports £900m in client-portfolio AUM; this describes clients’ portfolios, rather than assets Ramin managed. The separate climate-risk reduction lacks a defined measure. Outcomes remain supplied employer claims, with shared cross-functional ownership.',
  },
  'Deity AI': {
    label: 'Historical conversational product',
    summary: 'Ideated and implemented a conversation mediator for a dating/social product in 2017–2019.',
    scopeNote: 'This historical product is separate from the newer Deity profile coach in nsso. The reported chat-retention improvement covers the first three months; cohort, retention definition and model architecture are not established in the public account.',
  },
  ERM: {
    label: 'Research and advisory contribution',
    summary: 'Co-authored lifecycle research and identified environmental-risk uses for satellite data.',
    scopeNote: 'The reported 10% product revenue growth over six months concerns partner RepRisk. Ramin contributed use cases; the underlying commercial attribution is not public or independently audited.',
  },
  Tesla: {
    label: 'Customer and commercial foundation',
    summary: 'Progressed from Product Specialist to Senior Product Specialist across Model S and Powerwall customer work.',
    scopeNote: 'The career record supports customer education, sales and Powerwall market work. It does not establish software product ownership or Ramin’s specific contribution to a Power Flow app release.',
  },
};

export function getWorkEvidence(companyName: string): WorkEvidence | undefined {
  const aliases: Record<string, string> = {
    'Side.inc': 'SIDE',
    Vivup: 'Perkbox Vivup',
    'Work&Life Partners': 'Perkbox Vivup',
    'Vivup / Work&Life Partners': 'Perkbox Vivup',
    'WPP Media': 'GroupM',
    'GroupM / WPP Media': 'GroupM',
    'Cox Auto': 'Cox Automotive',
  };
  return workEvidenceByCompany[aliases[companyName] ?? companyName];
}
