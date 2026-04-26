
const memory = require('./memory.service');

function prepareRollback(decision) {
  memory.addMemory('rollback_ready', 'rollback_service', `Rollback preparado para ${decision.patch.area}.`, 'high');
  return { ok: true, prepared: true };
}

module.exports = { prepareRollback };
