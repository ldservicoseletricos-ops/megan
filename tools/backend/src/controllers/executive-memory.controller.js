import { getExecutiveMemoryState, runExecutiveMemory } from '../services/executive-memory.service.js';

export function getState(_req, res) {
  return res.json({ ok: true, state: getExecutiveMemoryState() });
}

export function run(req, res) {
  const state = runExecutiveMemory(req.body || {});
  return res.json({ ok: true, state });
}
