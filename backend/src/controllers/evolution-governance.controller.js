import { evaluateEvolutionGovernance, getEvolutionGovernanceState } from '../services/evolution-governance.service.js';

function jsonError(res, status, message) {
  return res.status(status).json({ ok: false, error: message });
}

export function getEvolutionGovernanceStateController(req, res) {
  try {
    const userId = String(req.query?.userId || 'luiz');
    return res.json({ ok: true, state: getEvolutionGovernanceState({ userId }) });
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao carregar governança de evolução');
  }
}

export function evaluateEvolutionGovernanceController(req, res) {
  try {
    const userId = String(req.body?.userId || 'luiz');
    const mode = req.body?.mode ? String(req.body.mode) : undefined;
    return res.json(evaluateEvolutionGovernance({ userId, mode }));
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao avaliar governança de evolução');
  }
}
