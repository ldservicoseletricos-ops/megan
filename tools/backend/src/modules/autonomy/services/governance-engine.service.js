function buildGovernance(state = {}) {
  const policies = state.policies || {};
  const layers = [
    {
      id: 'strategic',
      label: 'Camada estratégica',
      authority: 'define direção, limites globais e critérios de exceção',
      active: true,
      decisionsToday: 4,
    },
    {
      id: 'operational',
      label: 'Camada operacional',
      authority: 'coordena execução, timers, missões e recursos',
      active: true,
      decisionsToday: 7,
    },
    {
      id: 'guardian',
      label: 'Camada guardiã',
      authority: 'protege a base, controla risco e exige validação para ações sensíveis',
      active: true,
      decisionsToday: 5,
    },
  ];

  const governanceStatus = {
    mode: policies.currentMode || 'supervised_autonomy',
    voteRule: 'weighted_contextual_majority',
    escalationRule: 'guardian_override_for_critical_risk',
    consensusThreshold: 0.67,
    activePolicies: (policies.allowedWithoutApproval || []).length + (policies.allowedWithValidation || []).length,
  };

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    governanceStatus,
    layers,
    notes: [
      'Ações de baixo risco podem seguir fluxo validado.',
      'Ações críticas exigem peso maior da camada guardiã.',
      'Missões estratégicas favorecem voto da camada estratégica.',
    ],
  };
}

module.exports = { buildGovernance };
