const { classifyPatchAction } = require('./patch-policy.service');
const { createPatchEntry } = require('./patch-registry.service');

function buildPatchResult({ state, actionType, mission, mode }) {
  const classification = classifyPatchAction(actionType, mode);
  const base = createPatchEntry({
    title: `Patch ${actionType}`,
    actionType,
    missionId: mission?.id || null,
    scope: actionType.includes('frontend') ? 'frontend_autonomy' : 'autonomy_module',
    summary: `Patch preparado para ${actionType} em modo ${mode}.`,
  });

  if (classification === 'blocked') {
    return {
      ok: false,
      patch: { ...base, status: 'blocked', validationStatus: 'blocked', updatedAt: new Date().toISOString() },
      classification,
      state,
      resultSummary: 'Política bloqueou este patch automaticamente.',
    };
  }

  const nextPatch = {
    ...base,
    status: classification === 'auto_allowed' ? 'applied' : 'awaiting_validation',
    validationStatus: classification === 'auto_allowed' ? 'approved' : 'required',
    updatedAt: new Date().toISOString(),
  };

  const nextState = {
    ...state,
    state: {
      ...state.state,
      lastPatch: nextPatch,
      lastPatchStatus: nextPatch.status,
      updatedAt: new Date().toISOString(),
    },
    patchHistory: [nextPatch, ...(state.patchHistory || [])].slice(0, 40),
  };

  if (classification === 'validation_required') {
    nextState.approvalBacklog = [{
      id: `apr-${Date.now()}`,
      title: nextPatch.title,
      actionType,
      status: 'pending',
      priority: 'medium',
      reason: 'Patch seguro exige validação antes da aplicação final.',
      createdAt: new Date().toISOString(),
    }, ...(nextState.approvalBacklog || [])].slice(0, 30);
  }

  return {
    ok: true,
    patch: nextPatch,
    classification,
    state: nextState,
    resultSummary: classification === 'auto_allowed'
      ? 'Patch seguro aplicado automaticamente dentro da política.'
      : 'Patch preparado e enviado para validação.',
  };
}

module.exports = { buildPatchResult };
