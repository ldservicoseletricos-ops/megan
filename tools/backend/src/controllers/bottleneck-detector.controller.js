import { getBottleneckDetectorState, runBottleneckDetector } from '../services/bottleneck-detector.service.js';

export function getState(_req, res) {
  return res.json({ ok: true, state: getBottleneckDetectorState() });
}

export function run(req, res) {
  const state = runBottleneckDetector(req.body || {});
  return res.json({ ok: true, state });
}
