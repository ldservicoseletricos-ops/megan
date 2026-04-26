import { getFinalCheck } from '../services/final-check.service.js'; export function finalCheckController(req, res) { res.json({ ok: true, finalCheck: getFinalCheck() }); }
