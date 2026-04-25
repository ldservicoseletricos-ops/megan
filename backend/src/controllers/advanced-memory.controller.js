import { getAdvancedMemoryState, syncAdvancedMemoryFromAutonomy } from '../services/advanced-memory.service.js';
import { getAutonomyState } from '../services/autonomy-core.service.js';

function jsonError(res, status, message) {
  return res.status(status).type('application/json').send(JSON.stringify({ ok: false, error: message }));
}

export async function getAdvancedMemoryStateController(_req, res) {
  try {
    const state = await getAdvancedMemoryState();
    return res.status(200).type('application/json').send(JSON.stringify({ ok: true, state }));
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao carregar advanced memory');
  }
}

export async function syncAdvancedMemoryController(_req, res) {
  try {
    const autonomyState = await getAutonomyState();
    const state = await syncAdvancedMemoryFromAutonomy(autonomyState);
    return res.status(200).type('application/json').send(JSON.stringify({ ok: true, state }));
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao sincronizar advanced memory');
  }
}
