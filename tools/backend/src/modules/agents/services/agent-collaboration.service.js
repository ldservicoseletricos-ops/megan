const { selectAgents } = require('./agent-registry.service');
const baseOrchestrator = require('./agent-orchestrator.service');

function createSpecialistVote(agent, missionText, index) {
  const focusByType = {
    technical_architecture: 'proteger arquitetura, dependências, rotas e compatibilidade entre backend e frontend',
    frontend_experience: 'organizar interface, clareza visual, responsividade e experiência do operador',
    backend_execution: 'garantir endpoints, serviços, validações e respostas previsíveis da API',
    controlled_autonomy: 'manter autonomia supervisionada, ciclos seguros, validação e rollback',
    business_strategy: 'conectar entrega técnica com produto, planos e valor comercial',
    content_creation: 'estruturar conteúdo, comunicação e material pronto para publicação',
    operational_execution: 'transformar a missão em passos claros, testáveis e prontos para execução',
  };

  const risksByType = {
    technical_architecture: 'alterar estrutura funcionando sem necessidade',
    frontend_experience: 'perder o visual atual ou quebrar navegação das abas',
    backend_execution: 'criar rota sem validação ou resposta inconsistente',
    controlled_autonomy: 'executar ação destrutiva sem supervisão humana',
    business_strategy: 'criar recurso sem utilidade comercial clara',
    content_creation: 'gerar conteúdo fora do objetivo do projeto',
    operational_execution: 'entregar instrução parcial ou arquivo incompleto',
  };

  return {
    agentId: agent.id,
    agentName: agent.name,
    vote: index === 0 ? 'lead' : 'support',
    confidence: Math.min(99, Math.max(72, agent.score || agent.priority || 80)),
    focus: focusByType[agent.type] || 'apoiar a missão principal com segurança',
    risk: risksByType[agent.type] || 'executar sem validação suficiente',
    recommendation: `Atuar em ${missionText ? 'missão informada' : 'missão padrão'} preservando arquivos existentes e mudando somente o necessário.`,
  };
}

function buildConsensus(votes) {
  const lead = votes.find((vote) => vote.vote === 'lead') || votes[0];
  const averageConfidence = votes.length
    ? Math.round(votes.reduce((sum, vote) => sum + vote.confidence, 0) / votes.length)
    : 0;

  return {
    decision: `Agente líder: ${lead?.agentName || 'Megan OS'}`,
    confidence: averageConfidence,
    approval: averageConfidence >= 80 ? 'approved_supervised' : 'needs_human_review',
    rule: 'nenhuma ação destrutiva, nenhuma exclusão automática e nenhuma alteração fora do escopo',
  };
}

function buildOrchestration(payload = {}) {
  const missionText = payload.message || payload.goal || 'Organizar próxima evolução da Megan OS';
  const selectedAgents = selectAgents(missionText).slice(0, 5);
  const basePlan = baseOrchestrator.buildAgentPlan(missionText);
  const votes = selectedAgents.map((agent, index) => createSpecialistVote(agent, missionText, index));
  const consensus = buildConsensus(votes);

  const collaborationFlow = [
    {
      step: 1,
      phase: 'triage',
      owner: selectedAgents[0]?.name || 'Megan OS',
      action: 'Classificar a missão, escopo, risco e arquivos envolvidos antes de qualquer mudança.',
      status: 'ready',
    },
    {
      step: 2,
      phase: 'parallel_review',
      owner: selectedAgents.slice(1).map((agent) => agent.name).join(' + ') || selectedAgents[0]?.name || 'Megan OS',
      action: 'Cada agente especialista revisa a missão pelo seu ponto de vista e registra foco, risco e recomendação.',
      status: 'ready',
    },
    {
      step: 3,
      phase: 'consensus',
      owner: 'Conselho de Agentes 4.2',
      action: 'Consolidar votos, definir agente líder e bloquear ações inseguras.',
      status: consensus.approval === 'approved_supervised' ? 'approved' : 'review_required',
    },
    {
      step: 4,
      phase: 'execution_plan',
      owner: 'Operadora de Execução',
      action: 'Converter a decisão em checklist, endpoints, telas e arquivos completos prontos para colar.',
      status: 'ready',
    },
    {
      step: 5,
      phase: 'validation',
      owner: 'Validadora Técnica',
      action: 'Validar inicialização, rotas principais, build do frontend e integridade do ZIP antes da entrega.',
      status: 'required',
    },
  ];

  return {
    ok: true,
    version: '4.2.0',
    mode: 'multi_agent_orchestration',
    title: 'Megan OS 4.2 — Orquestrador de Agentes Reais',
    mission: {
      input: missionText,
      summary: `Missão orquestrada por ${selectedAgents.length} agentes com consenso supervisionado.`,
      nextAction: collaborationFlow[0].action,
    },
    primaryAgent: basePlan.primaryAgent,
    supportAgents: basePlan.supportAgents,
    selectedAgents,
    votes,
    consensus,
    collaborationFlow,
    executionPlan: basePlan.executionPlan,
    safetyPolicy: {
      autonomy: 'supervisionada por consenso',
      approvals: 'ações críticas exigem revisão humana',
      fileChanges: 'alterar somente o necessário e preservar o restante',
      delivery: 'arquivos completos prontos para colar',
      destructiveActions: 'bloqueadas por padrão',
    },
    updatedAt: new Date().toISOString(),
  };
}

function buildConsensusOnly(payload = {}) {
  const orchestration = buildOrchestration(payload);
  return {
    ok: true,
    version: orchestration.version,
    mission: orchestration.mission,
    consensus: orchestration.consensus,
    votes: orchestration.votes,
    safetyPolicy: orchestration.safetyPolicy,
    updatedAt: orchestration.updatedAt,
  };
}

function buildTimeline(payload = {}) {
  const orchestration = buildOrchestration(payload);
  return {
    ok: true,
    version: orchestration.version,
    mission: orchestration.mission,
    timeline: orchestration.collaborationFlow.map((item) => ({
      ...item,
      checkpoint: item.step === 5 ? 'obrigatório antes de entregar ZIP' : 'controle interno',
    })),
    updatedAt: orchestration.updatedAt,
  };
}

module.exports = {
  buildOrchestration,
  buildConsensusOnly,
  buildTimeline,
};
