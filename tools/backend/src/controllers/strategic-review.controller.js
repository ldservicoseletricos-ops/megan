import { getStrategicReviewState, runStrategicReview } from '../services/strategic-review.service.js';

function jsonError(res, status, message) {
  return res.status(status).json({ ok: false, error: message });
}

export function getStrategicReviewStateController(req, res) {
  try {
    const userId = String(req.query?.userId || 'luiz');
    return res.json({ ok: true, state: getStrategicReviewState({ userId }) });
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao carregar strategic review');
  }
}

export function runStrategicReviewController(req, res) {
  try {
    const userId = String(req.body?.userId || 'luiz');
    const source = req.body?.source ? String(req.body.source) : 'manual';
    return res.json(runStrategicReview({ userId, source }));
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao executar strategic review');
  }
}
