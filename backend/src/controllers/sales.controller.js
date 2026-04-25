import { getSalesAiOffers } from '../services/sales-ai.service.js'; export function getSalesController(req, res) { res.json({ ok: true, offers: getSalesAiOffers() }); }
