const { getAgents, selectAgents } = require('./agent-registry.service');

function buildAgentPlan(message = '') {
  const selectedAgents = selectAgents(message);
  const primary = selectedAgents[0];
  const support = selectedAgents.slice(1);

  const executionPlan = [
    {
      step: 1,
      title: 'Classificar pedido',
      owner: primary.name,
      action: 'Identificar objetivo, risco, arquivos envolvidos e tipo de entrega necessária.',
    },
    {
      step: 2,
      title: 'Delegar especialistas',
      owner: support.length ? support.map((agent) => agent.name).join(' + ') : primary.name,
      action: 'Ativar agentes complementares somente quando agregarem valor real.',
    },
    {
      step: 3,
      title: 'Gerar resposta segura',
      owner: 'Megan OS 4.1',
      action: 'Entregar arquivos completos, preservar estrutura existente e evitar alterações desnecessárias.',
    },
    {
      step: 4,
      title: 'Validar antes de concluir',
      owner: 'Operadora de Execução',
      action: 'Conferir rotas, build, integridade do pacote e próximos passos de teste.',
    },
  ];

  return {
    ok: true,
    version: '4.2.0',
    mode: 'real_specialized_agents',
    primaryAgent: primary,
    supportAgents: support,
    selectedAgents,
    executionPlan,
    safetyPolicy: {
      autonomy: 'supervisionada',
      fileChanges: 'alterar somente o necessário',
      delivery: 'arquivos completos prontos para colar',
      destructiveActions: 'bloqueadas sem confirmação humana',
    },
    updatedAt: new Date().toISOString(),
  };
}

function getAgentsDashboard() {
  const agents = getAgents();
  const averagePriority = Math.round(agents.reduce((sum, agent) => sum + agent.priority, 0) / agents.length);
  return {
    ok: true,
    version: '4.2.0',
    title: 'Megan OS 4.2 — Orquestrador de Agentes Reais',
    status: 'online',
    totalAgents: agents.length,
    averagePriority,
    agents,
    pipeline: [
      'entrada do pedido',
      'classificação automática',
      'seleção de agente principal',
      'apoio de agentes secundários',
      'plano de execução',
      'resposta final validada',
    ],
  };
}

function runAgentMission(payload = {}) {
  const message = payload.message || payload.goal || 'Organizar próxima evolução da Megan OS';
  const plan = buildAgentPlan(message);
  return {
    ...plan,
    mission: {
      input: message,
      summary: `Pedido direcionado para ${plan.primaryAgent.name}.`,
      nextAction: plan.executionPlan[0].action,
    },
  };
}

module.exports = { getAgentsDashboard, buildAgentPlan, runAgentMission };
