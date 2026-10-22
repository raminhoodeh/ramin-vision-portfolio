import { handleVisitorJourneyRequest } from '../server/visitorJourneyHandler.mjs';
import { blockWhileMaintenance } from '../server/siteMaintenance.mjs';

export default function handler(req, res) {
  if (blockWhileMaintenance(req, res)) return;
  return handleVisitorJourneyRequest(req, res);
}
