import { handleAiRaminFeedbackRequest } from '../../server/aiRaminHandler.mjs';
import { blockWhileMaintenance } from '../../server/siteMaintenance.mjs';

export default function handler(req, res) {
  if (blockWhileMaintenance(req, res)) return;
  return handleAiRaminFeedbackRequest(req, res);
}
