import { getConsensusEngineState, runConsensusEvaluation } from '../services/consensus-engine.service.js';

function jsonError(res, status, message) {
  return res.status(status).json({ ok: false, error: message });
}

export async function getConsensusEngineStateController(req, res) {
  try {
    const userId = String(req.query?.userId || 'luiz');
    return res.json({ ok: true, state: await getConsensusEngineState({ userId }) });
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao carregar consensus engine');
  }
}

export async function runConsensusEngineController(req, res) {
  try {
    const result = await runConsensusEvaluation(req.body || {});
    if (!result.ok) return jsonError(res, 400, result.error || 'Falha ao executar consenso');
    return res.json(result);
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao executar consenso');
  }
}
