import { getSafeAutoRun } from '../services/safe-auto-run.service.js'; export function safeAutoRunController(req, res) { res.json({ ok: true, safeAutoRun: getSafeAutoRun() }); }
