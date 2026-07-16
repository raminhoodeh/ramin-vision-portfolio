import { handleMassSocialWisdomRequest } from '../../../../server/massSocialWisdomHandler.mjs';

export default function handler(req, res) {
  return handleMassSocialWisdomRequest(req, res);
}
