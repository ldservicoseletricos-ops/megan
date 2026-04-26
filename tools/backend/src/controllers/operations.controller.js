import { getOperationsOverview, getRoutines, getAlerts } from '../services/operations.service.js';

export function operationsController(req, res) {
  res.json({ ok: true, overview: getOperationsOverview() });
}

export function routinesController(req, res) {
  res.json({ ok: true, routines: getRoutines() });
}

export function alertsController(req, res) {
  res.json({ ok: true, alerts: getAlerts() });
}
