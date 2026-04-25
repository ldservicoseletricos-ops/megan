import { getControlledExpansionState, runControlledExpansion } from '../services/controlled-expansion.service.js';

function jsonError(res, status, message) {
  return res.status(status).json({ ok: false, error: message });
}

export function getControlledExpansionStateController(req, res) {
  try {
    const userId = String(req.query?.userId || 'luiz');
    return res.json({ ok: true, state: getControlledExpansionState({ userId }) });
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao carregar controlled expansion');
  }
}

export function runControlledExpansionController(req, res) {
  try {
    const userId = String(req.body?.userId || 'luiz');
    const source = req.body?.source ? String(req.body.source) : 'manual';
    return res.json(runControlledExpansion({ userId, source }));
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao executar controlled expansion');
  }
}
