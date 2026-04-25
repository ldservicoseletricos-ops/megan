import { getEvolutionModeState, setEvolutionMode } from '../services/evolution-mode.service.js';

function jsonError(res, status, message) {
  return res.status(status).json({ ok: false, error: message });
}

export function getEvolutionModeStateController(req, res) {
  try {
    const userId = String(req.query?.userId || 'luiz');
    return res.json({ ok: true, state: getEvolutionModeState({ userId }) });
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao carregar modo de evolução');
  }
}

export function setEvolutionModeController(req, res) {
  try {
    const userId = String(req.body?.userId || 'luiz');
    const mode = String(req.body?.mode || 'guided_safe');
    return res.json(setEvolutionMode({ userId, mode }));
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao alterar modo de evolução');
  }
}
