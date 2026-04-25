import { getTraceFlowState, runTraceFlow } from '../services/trace-flow.service.js';

export function getState(_req, res) {
  return res.json({ ok: true, state: getTraceFlowState() });
}

export function run(_req, res) {
  const state = runTraceFlow();
  return res.json({ ok: true, state });
}
