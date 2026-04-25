const { buildResourceStatus } = require('./resource-economy.service');
function rebalanceResources(state = {}) {
  const resources = buildResourceStatus(state);
  state.resourceBudget = { totalUnits: resources.totalUnits, utilizedUnits: resources.utilizedUnits, availableUnits: resources.availableUnits, updatedAt: new Date().toISOString() };
  state.resourceAllocations = resources.items;
  state.resourceHistory = [{ id: `res-${Date.now()}`, createdAt: new Date().toISOString(), score: resources.score }, ...(state.resourceHistory || [])].slice(0, 20);
  return { state, resources };
}
module.exports = { rebalanceResources };
