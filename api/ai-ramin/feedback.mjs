import { handleAiRaminFeedbackRequest } from '../../server/aiRaminHandler.mjs';

export default function handler(req, res) {
  return handleAiRaminFeedbackRequest(req, res);
}
