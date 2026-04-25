import { getActionNowState, runActionNow } from '../services/action-now.service.js';

export function getState(_req, res) {
  return res.json({ ok: true, state: getActionNowState() });
}

export function run(_req, res) {
  const state = runActionNow();
  return res.json({ ok: true, state });
}
