import { getFusionLearningState, runFusionLearningCycle } from '../services/self-learning-fusion.service.js';

function jsonError(res, status, message) {
  return res.status(status).type('application/json').send(JSON.stringify({ ok: false, error: message }));
}

export async function getLearningStateController(_req, res) {
  try {
    const state = await getFusionLearningState();
    return res.status(200).type('application/json').send(JSON.stringify({ ok: true, state }));
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao carregar learning');
  }
}

export async function runLearningCycleController(req, res) {
  try {
    const state = await runFusionLearningCycle({ userId: String(req.body?.userId || 'anonymous') });
    return res.status(200).type('application/json').send(JSON.stringify({ ok: true, state }));
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao executar learning');
  }
}
