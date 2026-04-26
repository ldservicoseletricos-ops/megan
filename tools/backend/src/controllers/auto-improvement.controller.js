import { getAutoImprovementState, runAutoImprovement } from '../services/auto-improvement.service.js';

function jsonError(res, status, message) {
  return res.status(status).json({ ok: false, error: message });
}

export function getAutoImprovementStateController(req, res) {
  try {
    const userId = String(req.query?.userId || 'luiz');
    return res.json({ ok: true, state: getAutoImprovementState({ userId }) });
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao carregar auto improvement');
  }
}

export function runAutoImprovementController(req, res) {
  try {
    const userId = String(req.body?.userId || 'luiz');
    const regenerate = req.body?.regenerate !== false;
    return res.json(runAutoImprovement({ userId, regenerate }));
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao executar auto improvement');
  }
}
