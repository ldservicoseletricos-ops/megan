import { getActionPriority } from '../services/action-priority.service.js'; export function actionPriorityController(req, res) { res.json({ ok: true, actionPriority: getActionPriority() }); }
