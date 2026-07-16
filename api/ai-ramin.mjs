import { handleAiRaminRequest } from '../server/aiRaminHandler.mjs';

export default function handler(req, res) {
  return handleAiRaminRequest(req, res);
}
