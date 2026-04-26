import { addPriorityQueueItem, getNextPriorityQueueItem, listPriorityQueue, updatePriorityQueueItem } from '../services/priority-queue.service.js';

function jsonError(res, status, message) {
  return res.status(status).type('application/json').send(JSON.stringify({ ok: false, error: message }));
}

export function getExecutionPriorityStateController(req, res) {
  try {
    const userId = String(req.query?.userId || 'anonymous');
    const state = listPriorityQueue({ userId, includeDone: req.query?.includeDone === 'true' });
    return res.status(200).type('application/json').send(JSON.stringify({ ok: true, state }));
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao carregar fila de prioridade');
  }
}

export function getExecutionPriorityNextController(req, res) {
  try {
    const userId = String(req.query?.userId || 'anonymous');
    const state = getNextPriorityQueueItem({ userId, includeBlocked: req.query?.includeBlocked === 'true' });
    return res.status(200).type('application/json').send(JSON.stringify({ ok: true, ...state }));
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao carregar próxima ação');
  }
}

export function enqueueExecutionPriorityController(req, res) {
  try {
    const result = addPriorityQueueItem(req.body || {});
    return res.status(200).type('application/json').send(JSON.stringify({ ok: true, ...result }));
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao adicionar item na fila');
  }
}

export function updateExecutionPriorityController(req, res) {
  try {
    const result = updatePriorityQueueItem(req.body || {});
    return res.status(200).type('application/json').send(JSON.stringify({ ok: true, ...result }));
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao atualizar item da fila');
  }
}
