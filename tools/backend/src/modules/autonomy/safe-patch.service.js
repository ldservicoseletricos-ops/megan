const { canRun } = require('./approval-policy.service');

function listSafePatches() {
  return {
    ok: true,
    patches: [
      {
        id: 'patch-route-export-check',
        title: 'Verificar export de rota recém-criada',
        risk: 'low',
        mode: 'approval_required',
        description: 'Confere se a rota nova está registrada e exportada corretamente antes de entregar pacote.',
      },
      {
        id: 'patch-runtime-fallback',
        title: 'Ativar fallback de runtime',
        risk: 'low',
        mode: 'automatic',
        description: 'Troca para modo degradado quando um endpoint auxiliar falha, preservando o core.',
      },
      {
        id: 'patch-port-isolation',
        title: 'Isolar porta de validação',
        risk: 'low',
        mode: 'automatic',
        description: 'Usa porta de teste alternativa durante validações para evitar colisões locais.',
      },
    ],
    generatedAt: new Date().toISOString(),
  };
}

function applySafePatch(actionType = 'patch_runtime_fallback') {
  const mapped = {
    patch_runtime_fallback: 'fallback_safe_mode',
    patch_port_isolation: 'retry_health_checks',
    patch_route_export_check: 'patch_application',
  };
  const policy = canRun(mapped[actionType] || actionType);
  return {
    ok: policy.allowed,
    actionType,
    mode: policy.mode,
    resultSummary: policy.allowed
      ? 'Patch seguro marcado como executável dentro da política atual.'
      : 'Patch exige aprovação manual antes da execução.',
    executedAt: new Date().toISOString(),
  };
}

module.exports = { listSafePatches, applySafePatch };
