function rankScenarios(scenarios = [], probability = {}) {
  const matrix = probability.items || [];
  return scenarios.map((scenario) => {
    const odds = matrix.find((item) => item.scenarioId === scenario.id) || {};
    const score = Math.round((scenario.impact || 0) * 0.42 + (odds.success || scenario.probability || 0) * 0.38 - (scenario.risk || 0) * 0.20);
    return { ...scenario, success: odds.success, regression: odds.regression, expectedValue: odds.expectedValue, score };
  }).sort((a,b)=>b.score-a.score);
}
module.exports = { rankScenarios };
