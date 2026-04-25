const { buildResourceStatus } = require('./resource-economy.service');
const { buildBudgetStatus } = require('./cognitive-budget.service');
const { buildEnergyStatus } = require('./energy-optimization.service');
function buildEfficiencyLedger(state = {}) {
  const resources = buildResourceStatus(state);
  const budget = buildBudgetStatus(state);
  const energy = buildEnergyStatus(state);
  const efficiencyScore = Math.max(45, Math.min(99, Math.round(resources.score * 0.45 + (100 - energy.energyConsumption) * 0.35 + budget.executionBudget * 0.2)));
  return { ok: true, efficiencyScore, resources, budget, energy, summary: { strongestAllocation: resources.items[0] ? resources.items[0].name : null, energyStatus: energy.status, budgetPressure: budget.pressure }, updatedAt: new Date().toISOString() };
}
module.exports = { buildEfficiencyLedger };
