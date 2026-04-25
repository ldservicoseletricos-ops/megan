import { getStrategicAutopriorityState, runStrategicAutopriority } from '../services/strategic-autopriority.service.js';

function jsonError(res, status, message) {
  return res.status(status).json({ ok: false, error: message });
}

export function getStrategicAutopriorityStateController(req, res) {
  try {
    const userId = String(req.query?.userId || 'luiz');
    return res.json({ ok: true, state: getStrategicAutopriorityState({ userId }) });
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao carregar strategic autopriority');
  }
}

export function runStrategicAutopriorityController(req, res) {
  try {
    const userId = String(req.body?.userId || 'luiz');
    const source = req.body?.source ? String(req.body.source) : 'manual';
    return res.json(runStrategicAutopriority({ userId, source }));
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao executar strategic autopriority');
  }
}
