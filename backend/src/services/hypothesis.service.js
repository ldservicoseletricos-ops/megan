function buildHypotheses(issues, state = {}) {
  const presets = {
    memory_core: ['Fortalecer retenção contextual', 'Aumentar prioridade da memória recente e do histórico aprovado.', 8, 'medium'],
    critic: ['Aplicar critic redundante', 'Executar critic principal + validação secundária em patches.', 8, 'medium'],
    tests: ['Expandir regressão crítica', 'Elevar cobertura obrigatória antes de promover patch.', 7, 'low'],
    rollback: ['Fortalecer rollback automático', 'Criar snapshot e restauração imediata antes de patch real.', 7, 'low'],
    sandbox: ['Reforçar sandbox de patch', 'Executar patch sempre em ambiente isolado antes da promoção.', 7, 'low'],
    real_patch: ['Ativar patch real controlado', 'Permitir replace controlado apenas em arquivos da whitelist.', 8, 'medium'],
    git: ['Ativar commit real controlado', 'Preparar commit local automático após patch aprovado.', 6, 'medium'],
    build: ['Rodar build real controlado', 'Executar npm run build antes do deploy.', 6, 'medium'],
    deploy: ['Criar deploy gate real', 'Liberar deploy somente acima do score mínimo e build ok.', 6, 'medium'],
    optimization_cycle: ['Otimização contínua', 'Gerar patch proativo para manter a autoevolução ativa mesmo sem incidentes.', 9, 'low'],
    observability: ['Expandir observabilidade', 'Registrar evidências estáveis para novos patches e decisões.', 8, 'low'],
    deploy_ready: ['Preparar promoção automática', 'Fortalecer a trilha que leva de patch aprovado até deploy liberado.', 8, 'low'],
  };

  if (!Array.isArray(issues) || issues.length === 0) {
    const readiness = Number(state?.readiness || 0);
    const basePriority = readiness >= 85 ? 96 : 82;
    return [
      {
        id: Date.now(),
        area: 'optimization_cycle',
        severity: 'medium',
        priorityScore: basePriority,
        title: presets.optimization_cycle[0],
        proposal: presets.optimization_cycle[1],
        expectedGain: presets.optimization_cycle[2],
        risk: presets.optimization_cycle[3],
        status: 'proposed',
        why: 'Nenhum gargalo crítico restante; o sistema deve continuar evoluindo de forma proativa.',
      },
      {
        id: Date.now() + 1,
        area: 'observability',
        severity: 'medium',
        priorityScore: basePriority - 2,
        title: presets.observability[0],
        proposal: presets.observability[1],
        expectedGain: presets.observability[2],
        risk: presets.observability[3],
        status: 'proposed',
        why: 'Sem incidentes ativos, a melhor ação é acumular sinais confiáveis para novos ciclos.',
      },
      {
        id: Date.now() + 2,
        area: 'deploy_ready',
        severity: 'medium',
        priorityScore: basePriority - 4,
        title: presets.deploy_ready[0],
        proposal: presets.deploy_ready[1],
        expectedGain: presets.deploy_ready[2],
        risk: presets.deploy_ready[3],
        status: 'proposed',
        why: 'Com o sistema estável, a trilha de promoção automática precisa permanecer ativa.',
      },
    ];
  }

  return issues.slice(0, 8).map((issue, index) => {
    const preset = presets[issue.area] || ['Melhorar área', 'Executar ajuste controlado.', 4, 'medium'];
    return {
      id: Date.now() + index,
      area: issue.area,
      severity: issue.severity,
      priorityScore: issue.score,
      title: preset[0],
      proposal: preset[1],
      expectedGain: preset[2],
      risk: preset[3],
      status: 'proposed',
      why: issue.why,
    };
  });
}

module.exports = { buildHypotheses };
