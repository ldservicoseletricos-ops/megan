import { getExecutiveOverview, getDecisionQueue, getOperationalTasks } from '../services/system.service.js';

export function systemController(req, res) {
  res.json({ ok: true, overview: getExecutiveOverview() });
}

export function decisionsController(req, res) {
  res.json({ ok: true, decisions: getDecisionQueue() });
}

export function tasksController(req, res) {
  res.json({ ok: true, tasks: getOperationalTasks() });
}
