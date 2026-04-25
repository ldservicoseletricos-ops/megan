import { getDecisionMemoryState, syncDecisionMemoryFromAutonomy } from '../services/decision-memory.service.js';

function jsonError(res, status, message) {
  return res.status(status).type('application/json').send(JSON.stringify({ ok: false, error: message }));
}

export async function getDecisionMemoryStateController(_req, res) {
  try {
    const state = await getDecisionMemoryState();
    return res.status(200).type('application/json').send(JSON.stringify({ ok: true, state }));
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao carregar decision memory');
  }
}

export async function syncDecisionMemoryController(_req, res) {
  try {
    const state = await syncDecisionMemoryFromAutonomy();
    return res.status(200).type('application/json').send(JSON.stringify({ ok: true, state }));
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao sincronizar decision memory');
  }
}
