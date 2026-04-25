function appendForecastLedger(state = {}, forecast = {}) {
  const entry = { id: `forecast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, bestPath: forecast.bestPath?.title || 'sem caminho', recommendation: forecast.recommendation || '', score: forecast.bestPath?.score || 0, createdAt: new Date().toISOString() };
  return { entry, history: [entry, ...(state.forecastLedger || [])].slice(0, 60) };
}
function buildForecastHistory(state = {}) { return { ok: true, version: '3.2.0', items: state.forecastLedger || [], generatedAt: new Date().toISOString() }; }
module.exports = { appendForecastLedger, buildForecastHistory };
