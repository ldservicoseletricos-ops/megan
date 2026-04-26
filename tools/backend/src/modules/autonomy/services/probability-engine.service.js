function normalize(value, min = 0, max = 100) { return Math.max(min, Math.min(max, Math.round(value || 0))); }
function buildProbabilityMatrix(scenarios = [], state = {}) {
  const stability = state.state?.stabilityScore || state.projectHealth?.stability || 70;
  const autonomy = state.state?.autonomyScore || 60;
  const items = scenarios.map((scenario) => {
    const success = normalize((scenario.probability || 70) + stability * 0.08 + autonomy * 0.05 - (scenario.risk || 30) * 0.12);
    const failure = normalize(100 - success + (scenario.risk || 0) * 0.08);
    const regression = normalize((scenario.risk || 25) * 0.45 - stability * 0.08);
    const expectedValue = normalize((scenario.impact || 60) * (success / 100) - regression * 0.25);
    return { scenarioId: scenario.id, title: scenario.title, success, failure, regression, expectedValue, confidence: normalize((success + expectedValue) / 2) };
  });
  return { ok: true, version: '3.2.0', items, summary: { averageSuccess: normalize(items.reduce((s,i)=>s+i.success,0)/Math.max(items.length,1)), averageRegression: normalize(items.reduce((s,i)=>s+i.regression,0)/Math.max(items.length,1)), bestExpectedValue: items.reduce((b,i)=>i.expectedValue > (b?.expectedValue || 0) ? i : b, null) }, generatedAt: new Date().toISOString() };
}
module.exports = { buildProbabilityMatrix };
