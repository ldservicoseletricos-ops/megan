import { getStrategicForecastState, runStrategicForecast } from '../services/strategic-forecast.service.js';

export function getState(_req, res) {
  return res.json({ ok: true, state: getStrategicForecastState() });
}

export function run(req, res) {
  const state = runStrategicForecast(req.body || {});
  return res.json({ ok: true, state });
}
