import { getBrainCoordinatorState, runBrainCoordination } from '../services/brain-coordinator.service.js';

function jsonError(res, status, message) {
  return res.status(status).json({ ok: false, error: message });
}

export async function getBrainCoordinatorStateController(req, res) {
  try {
    const userId = String(req.query?.userId || 'luiz');
    return res.json({ ok: true, state: await getBrainCoordinatorState({ userId }) });
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao carregar brain coordinator');
  }
}

export async function runBrainCoordinatorController(req, res) {
  try {
    const result = await runBrainCoordination(req.body || {});
    if (!result.ok) return jsonError(res, 400, result.error || 'Falha ao executar coordenação');
    return res.json(result);
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao executar coordenação');
  }
}
