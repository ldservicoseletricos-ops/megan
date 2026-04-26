import { getResourceOptimizerState, runResourceOptimizer } from '../services/resource-optimizer.service.js';

function jsonError(res, status, message) {
  return res.status(status).json({ ok: false, error: message });
}

export function getResourceOptimizerStateController(req, res) {
  try {
    const userId = String(req.query?.userId || 'luiz');
    return res.json({ ok: true, state: getResourceOptimizerState({ userId }) });
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao carregar resource optimizer');
  }
}

export function runResourceOptimizerController(req, res) {
  try {
    const userId = String(req.body?.userId || 'luiz');
    const source = req.body?.source ? String(req.body.source) : 'manual';
    return res.json(runResourceOptimizer({ userId, source }));
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao executar resource optimizer');
  }
}
