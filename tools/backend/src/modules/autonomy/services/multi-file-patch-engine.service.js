const { buildChangeImpactMap } = require('./change-impact-mapper.service');
const { validateDependencies } = require('./dependency-validator.service');
const { classifyPatchAction } = require('./patch-policy.service');
const { createPatchEntry } = require('./patch-registry.service');

function buildDefaultPlan(payload = {}) {
  return {
    title: payload.title || 'Patch multiarquivo validado',
    actionType: payload.actionType || 'apply_multi_file_patch',
    summary: payload.summary || 'Atualização coordenada de backend e frontend no núcleo de autonomia.',
    files: Array.isArray(payload.files) && payload.files.length ? payload.files : [
      { path: 'backend/src/modules/autonomy/autonomy.routes.js', role: 'update' },
      { path: 'backend/src/modules/autonomy/autonomy.controller.js', role: 'update' },
      { path: 'backend/src/modules/autonomy/autonomy.service.js', role: 'update' },
      { path: 'frontend/src/features/autonomy/services/autonomyApi.js', role: 'update' },
      { path: 'frontend/src/features/autonomy/pages/AutonomyCenterPage.jsx', role: 'update' },
    ],
  };
}

function buildMultiFilePatch({ state, payload = {}, mission = null, mode = 'validated_execution' }) {
  const plan = buildDefaultPlan(payload);
  const classification = classifyPatchAction(payload.actionType || plan.actionType, mode);
  const impactMap = buildChangeImpactMap(plan);
  const dependencyValidation = validateDependencies(plan);
  const now = new Date().toISOString();
  const base = createPatchEntry({
    title: plan.title,
    actionType: plan.actionType,
    missionId: mission?.id || null,
    scope: impactMap.affectedAreas.join('+') || 'autonomy_module',
    summary: plan.summary,
  });

  const status = classification === 'blocked' ? 'blocked' : dependencyValidation.ok ? (classification === 'auto_allowed' ? 'applied' : 'awaiting_validation') : 'blocked';
  const patch = {
    ...base,
    kind: 'multi_file',
    files: impactMap.files,
    affectedAreas: impactMap.affectedAreas,
    impactScore: impactMap.totalImpact,
    complexity: impactMap.complexity,
    dependencyValidation,
    status,
    validationStatus: status === 'applied' ? 'approved' : status === 'awaiting_validation' ? 'required' : 'blocked',
    updatedAt: now,
  };

  const nextState = {
    ...state,
    patchHistory: [patch, ...(state.patchHistory || [])].slice(0, 60),
    state: {
      ...state.state,
      lastPatch: patch,
      lastPatchStatus: patch.status,
      lastMultiPatch: patch,
      lastMultiPatchStatus: patch.status,
      updatedAt: now,
    },
  };

  if (status === 'awaiting_validation') {
    nextState.approvalBacklog = [{
      id: `apr-${Date.now()}`,
      title: patch.title,
      actionType: plan.actionType,
      status: 'pending',
      priority: impactMap.totalImpact >= 90 ? 'high' : 'medium',
      reason: 'Patch multiarquivo requer validação antes da aplicação final.',
      createdAt: now,
    }, ...(nextState.approvalBacklog || [])].slice(0, 40);
  }

  return {
    ok: status !== 'blocked',
    patch,
    classification,
    validation: dependencyValidation,
    state: nextState,
    resultSummary: status === 'applied' ? 'Patch multiarquivo validado e aplicado dentro da política atual.' : status === 'awaiting_validation' ? 'Patch multiarquivo preparado e enviado para validação.' : 'Patch multiarquivo bloqueado por política ou dependências.',
  };
}

module.exports = { buildMultiFilePatch };
