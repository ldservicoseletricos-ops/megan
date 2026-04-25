import { getMissionContinuityState, runMissionContinuity } from '../services/mission-continuity.service.js';

function jsonError(res, status, message) {
  return res.status(status).json({ ok: false, error: message });
}

export function getMissionContinuityStateController(req, res) {
  try {
    const userId = String(req.query?.userId || 'luiz');
    return res.json({ ok: true, state: getMissionContinuityState({ userId }) });
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao carregar mission continuity');
  }
}

export function runMissionContinuityController(req, res) {
  try {
    const userId = String(req.body?.userId || 'luiz');
    const source = req.body?.source ? String(req.body.source) : 'manual';
    return res.json(runMissionContinuity({ userId, source }));
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao executar mission continuity');
  }
}
