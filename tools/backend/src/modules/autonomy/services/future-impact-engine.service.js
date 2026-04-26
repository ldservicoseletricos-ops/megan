function buildFutureImpact({ ranking = [], adaptiveScores = {}, stages = [] }) {
  const top = ranking.slice(0, 3);
  const momentum = Math.round(((adaptiveScores.autonomy || 0) + (adaptiveScores.maturity || 0) + (adaptiveScores.resolutionVelocity || 0)) / 3);
  const riskPressure = Math.max(0, Math.min(100, Number(adaptiveScores.operationalRisk || 0)));
  const nextWindow = top.map((item, index) => ({
    horizon: index === 0 ? 'próximo ciclo' : index === 1 ? 'curto prazo' : 'médio prazo',
    missionId: item.mission.id,
    title: item.mission.title,
    expectedGain: Math.max(8, Math.round(item.impact.totalScore / 6)),
    confidence: Math.max(42, Math.min(94, 78 + Math.round((momentum - riskPressure) / 4) - index * 5)),
    rationale: item.impact.rationale,
  }));
  return {
    ok: true,
    momentum,
    riskPressure,
    roadmapCoverage: stages.length,
    nextWindow,
    summary: nextWindow[0]?.title ? `Maior ganho previsto: ${nextWindow[0].title}.` : 'Sem previsão disponível no momento.',
    generatedAt: new Date().toISOString(),
  };
}
module.exports = { buildFutureImpact };
