import { getAutomationSummary } from '../services/automation.service.js'; export function getAutomationController(req, res) { res.json({ ok: true, automation: getAutomationSummary() }); }
