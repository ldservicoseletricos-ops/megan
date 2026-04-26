import { getAutoDelegationState, runAutoDelegation } from '../services/auto-delegation.service.js';

export function getState(_req, res) {
  return res.json({ ok: true, state: getAutoDelegationState() });
}

export function run(req, res) {
  const state = runAutoDelegation(req.body || {});
  return res.json({ ok: true, state });
}
