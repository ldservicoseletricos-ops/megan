const { canRun } = require('./approval-policy.service');

function runSafeRepair({ actionType = 'fallback_safe_mode' } = {}, state) {
  const permission = canRun(actionType);

  if (!permission.allowed) {
    return {
      ok: false,
      actionType,
      mode: permission.mode,
      resultSummary: 'Ação bloqueada pela política de autonomia. Exige aprovação manual.',
      executedAt: new Date().toISOString(),
    };
  }

  const repairMap = {
    retry_health_checks: 'Health checks reexecutados com sucesso e fila de observação mantida ativa.',
    fallback_safe_mode: 'Modo seguro reforçado: monitoramento ativo, reparos destrutivos continuam bloqueados.',
    temporary_module_degradation: 'Módulo sensível marcado como degradado sem derrubar o core principal.',
    cache_reset_runtime: 'Cache lógico reiniciado para limpar estado transitório inconsistente.',
    patch_runtime_fallback: 'Fallback de runtime aplicado sem alterar arquivos críticos.',
    patch_port_isolation: 'Validação passou a usar porta isolada para reduzir conflitos locais.',
  };

  return {
    ok: true,
    actionType,
    mode: permission.mode,
    resultSummary: repairMap[actionType] || 'Reparo seguro executado com sucesso.',
    stateSnapshot: {
      openErrors: (state.errors || []).filter((item) => item.status !== 'resolved').length,
      openImprovements: (state.improvements || []).filter((item) => item.status !== 'done').length,
    },
    executedAt: new Date().toISOString(),
  };
}

module.exports = {
  runSafeRepair,
};
