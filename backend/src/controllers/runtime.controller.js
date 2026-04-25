import { getRuntimeStatus } from '../services/runtime.service.js'; export function getRuntimeController(req, res) { res.json({ ok: true, runtime: getRuntimeStatus() }); }
