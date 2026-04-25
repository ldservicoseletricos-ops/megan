import { getTacticalExecutorState, runTacticalExecutor } from '../services/tactical-executor.service.js';

export function getState(_req, res) {
  return res.json({ ok: true, state: getTacticalExecutorState() });
}

export function run(req, res) {
  const state = runTacticalExecutor(req.body || {});
  return res.json({ ok: true, state });
}
