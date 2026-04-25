import { getFeedbackLoopState, registerFeedback } from '../services/feedback-loop.service.js';

function jsonError(res, status, message) {
  return res.status(status).json({ ok: false, error: message });
}

export function getFeedbackLoopStateController(req, res) {
  try {
    const userId = String(req.query?.userId || 'luiz');
    return res.json({ ok: true, state: getFeedbackLoopState({ userId }) });
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao carregar feedback loop');
  }
}

export function registerFeedbackController(req, res) {
  try {
    const result = registerFeedback(req.body || {});
    if (!result.ok) return jsonError(res, 400, result.error || 'Falha ao registrar feedback');
    return res.json(result);
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao registrar feedback');
  }
}
