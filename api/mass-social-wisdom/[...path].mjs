import { handleMassSocialWisdomRequest } from '../../server/massSocialWisdomHandler.mjs';
import { blockWhileMaintenance } from '../../server/siteMaintenance.mjs';

export default function handler(req, res) {
  if (blockWhileMaintenance(req, res)) return;
  return handleMassSocialWisdomRequest(req, res);
}
