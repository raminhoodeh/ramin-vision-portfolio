import { homepageOutcomes, homepagePositioning } from './homepage';

const side = homepageOutcomes.find(({ id }) => id === 'side-erp-cost')!;
const checkout = homepageOutcomes.find(({ id }) => id === 'vivup-checkout')!;

// These are distinct commercial results, with company and measurement context.
// In particular, the Vivup monetisation result is not relabelled as an AI result.
export const commercialProofs = [
  { title: homepagePositioning.strengthCommercial, detail: homepagePositioning.strengthCommercialDetail },
  { title: `${side.metric} ${side.outcome}`, detail: 'SIDE · AI-assisted tooling · four months' },
  { title: `${checkout.metric} ${checkout.outcome}`, detail: 'Vivup · Order Guidance · first month' },
] as const;
