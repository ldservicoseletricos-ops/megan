import { getTacticalAdjusterState, runTacticalAdjustment } from '../services/tactical-adjuster.service.js';

function jsonError(res, status, message) {
  return res.status(status).json({ ok: false, error: message });
}

export function getTacticalAdjusterStateController(req, res) {
  try {
    const userId = String(req.query?.userId || 'luiz');
    return res.json({ ok: true, state: getTacticalAdjusterState({ userId }) });
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao carregar tactical adjuster');
  }
}

export function runTacticalAdjusterController(req, res) {
  try {
    const result = runTacticalAdjustment(req.body || {});
    if (!result.ok) return jsonError(res, 400, result.error || 'Falha ao executar ajuste tático');
    return res.json(result);
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao executar ajuste tático');
  }
}
