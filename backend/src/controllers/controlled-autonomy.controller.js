import { getControlledAutonomyState, runControlledAutonomy } from '../services/controlled-autonomy.service.js';

export function getState(_req, res) {
  return res.json({ ok: true, state: getControlledAutonomyState() });
}

export function run(req, res) {
  const state = runControlledAutonomy(req.body || {});
  return res.json({ ok: true, state });
}
