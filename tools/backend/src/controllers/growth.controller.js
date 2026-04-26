import { getGrowthForecast } from '../services/growth-prediction.service.js'; export function getGrowthController(req, res) { res.json({ ok: true, forecast: getGrowthForecast() }); }
