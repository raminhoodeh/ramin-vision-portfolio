import { handleAiRaminRequest } from '../server/aiRaminHandler.mjs';
import { blockWhileMaintenance } from '../server/siteMaintenance.mjs';

export default function handler(req, res) {
  if (blockWhileMaintenance(req, res)) return;
  return handleAiRaminRequest(req, res);
}
