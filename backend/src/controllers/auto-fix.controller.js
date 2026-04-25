import { getAutoFixSuggestions } from '../services/auto-fix.service.js'; export function autoFixController(req, res) { res.json({ ok: true, autoFix: getAutoFixSuggestions() }); }
