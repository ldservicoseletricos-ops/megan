import { getDecisionPipelineState, runDecisionPipeline } from '../services/decision-pipeline.service.js';

export function getState(_req, res) {
  return res.json({ ok: true, state: getDecisionPipelineState() });
}

export function run(_req, res) {
  const state = runDecisionPipeline();
  return res.json({ ok: true, state });
}
