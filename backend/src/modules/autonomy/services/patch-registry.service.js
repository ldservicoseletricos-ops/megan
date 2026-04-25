function randomId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createPatchEntry(payload = {}) {
  const now = new Date().toISOString();
  return {
    id: payload.id || randomId('patch'),
    title: payload.title || 'Patch seguro do núcleo autônomo',
    actionType: payload.actionType || 'update_autonomy_state',
    scope: payload.scope || 'autonomy_module',
    status: payload.status || 'prepared',
    missionId: payload.missionId || null,
    validationStatus: payload.validationStatus || 'pending',
    summary: payload.summary || 'Patch preparado dentro da política atual.',
    createdAt: payload.createdAt || now,
    updatedAt: now,
  };
}

function listPatchHistory(state = {}) {
  return state.patchHistory || [];
}

module.exports = { createPatchEntry, listPatchHistory };
