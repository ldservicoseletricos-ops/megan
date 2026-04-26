function buildLayeredPolicies(state = {}) {
  const policies = state.policies || {};
  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    layers: [
      {
        id: 'base',
        label: 'Base segura',
        scope: ['analyze_system', 'record_learning', 'update_internal_state'],
        execution: 'automatic',
      },
      {
        id: 'validated',
        label: 'Execução validada',
        scope: policies.allowedWithValidation || [],
        execution: 'validated_execution',
      },
      {
        id: 'restricted',
        label: 'Proteção crítica',
        scope: policies.blockedWithoutExplicitApproval || [],
        execution: 'blocked_without_explicit_approval',
      },
    ],
  };
}

function buildPolicyMatrix(state = {}) {
  const layered = buildLayeredPolicies(state);
  return layered.layers.map((layer) => ({
    layer: layer.label,
    actions: layer.scope.length,
    execution: layer.execution,
  }));
}

module.exports = { buildLayeredPolicies, buildPolicyMatrix };
