import { getContinuousAutonomyState, runContinuousAutonomy } from '../services/continuous-autonomy.service.js';

function jsonError(res, status, message) {
  return res.status(status).json({ ok: false, error: message });
}

export function getContinuousAutonomyStateController(req, res) {
  try {
    const userId = String(req.query?.userId || 'luiz');
    return res.json({ ok: true, state: getContinuousAutonomyState({ userId }) });
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao carregar continuous autonomy');
  }
}

export function runContinuousAutonomyController(req, res) {
  try {
    const userId = String(req.body?.userId || 'luiz');
    const source = req.body?.source ? String(req.body.source) : 'manual';
    return res.json(runContinuousAutonomy({ userId, source }));
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao executar continuous autonomy');
  }
}
