import { getDeployGuide } from '../services/deploy-guide.service.js'; export function deployGuideController(req, res) { res.json({ ok: true, guide: getDeployGuide() }); }
