function buildDecisionForecast(ranking = []) {
  const best = ranking[0] || null;
  const conservative = ranking.find((item) => item.strategy === 'conservative') || ranking[ranking.length - 1] || null;
  const aggressive = ranking.find((item) => item.strategy === 'aggressive') || null;
  const balanced = ranking.find((item) => item.strategy === 'balanced') || best;
  return { ok: true, version: '3.2.0', bestPath: best, plans: { conservative, balanced, aggressive }, recommendation: best ? `Executar o caminho ${best.title} porque combina impacto ${best.impact} com probabilidade ${best.success || best.probability}%.` : 'Sem cenário suficiente para previsão.', generatedAt: new Date().toISOString() };
}
module.exports = { buildDecisionForecast };
