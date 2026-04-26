import { getGlobalSupervisorState, runGlobalSupervisor } from '../services/global-supervisor.service.js';

function jsonError(res, status, message) {
  return res.status(status).json({ ok: false, error: message });
}

export function getGlobalSupervisorStateController(req, res) {
  try {
    const userId = String(req.query?.userId || 'luiz');
    return res.json({ ok: true, state: getGlobalSupervisorState({ userId }) });
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao carregar global supervisor');
  }
}

export function runGlobalSupervisorController(req, res) {
  try {
    const userId = String(req.body?.userId || 'luiz');
    const source = req.body?.source ? String(req.body.source) : 'manual';
    return res.json(runGlobalSupervisor({ userId, source }));
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao executar global supervisor');
  }
}
