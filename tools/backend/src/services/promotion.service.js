
const stateService = require('./state.service');
const memory = require('./memory.service');

function promote(after, decision) {
  if (!decision.approved) {
    memory.addMemory('rejected_patch', 'promotion_service', `Patch rejeitado em ${decision.patch.area}. ${decision.reason}`, 'medium');
    return { promoted: false };
  }

  const current = stateService.getState();
  stateService.saveState({
    ...after,
    patchApprovalRate: Math.min(100, current.patchApprovalRate + 5),
    updatedAt: new Date().toISOString()
  });

  memory.addMemory('promoted_patch', 'promotion_service', `Patch promovido em ${decision.patch.area}. ${decision.reason}`, 'high');
  return { promoted: true };
}

module.exports = { promote };
