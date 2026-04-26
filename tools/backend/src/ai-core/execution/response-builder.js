function section(title, lines = []) {
  return [title, "", ...lines, ""].join("\n");
}

function buildHeader({ adaptiveContext, brainConsensus }) {
  const mode = adaptiveContext?.adaptiveProfile?.selectedMode || "adaptive_balanced";
  const detailLevel = adaptiveContext?.userProfile?.detailLevel || "balanced";
  const leadBrain = brainConsensus?.leadLabel || brainConsensus?.leadBrain || "Coordenador Geral";
  const support = (brainConsensus?.supportingBrains || []).join(", ") || "nenhum";
  return [
    `Modo adaptativo ativo: ${mode}`,
    `Profundidade: ${detailLevel}`,
    `Cérebro líder: ${leadBrain}`,
    `Cérebros de apoio: ${support}`
  ].join("\n");
}

function buildSwarmSummary({ swarmExecution, swarmVoting }) {
  return section("Swarm interno da Megan:", [
    `- modo: ${swarmExecution?.mode || "single_specialist"}`,
    `- cérebros ativados: ${swarmExecution?.totalBrainsActivated || 1}`,
    `- vencedor da votação: ${swarmVoting?.winner?.label || swarmVoting?.winner?.brainId || "Coordenador Geral"}`,
    `- score vencedor: ${swarmVoting?.winner?.score ?? 0.8}`
  ]);
}

function buildAgentSummary({ agentDelegation, agentPipeline, agentSupervisor }) {
  return section("Agentes autônomos da Megan:", [
    `- modo: ${agentDelegation?.mode || "compact_pipeline"}`,
    `- agentes delegados: ${agentDelegation?.delegatedAgents?.length || 0}`,
    `- tarefas concluídas: ${agentPipeline?.completedTasks || 0}/${agentPipeline?.totalAgents || 0}`,
    `- supervisor final: ${agentSupervisor?.supervisorAgentId || "supervisor_agent"}`,
    `- aprovação: ${agentSupervisor?.approval || "approved"}`
  ]);
}

function buildSelfEvolutionResponse({ input, memorySummary, plan, activeRules, adaptiveContext, brainConsensus, swarmExecution, swarmVoting, agentDelegation, agentPipeline, agentSupervisor }) {
  const priorities = adaptiveContext?.priorities || [];
  return [
    buildHeader({ adaptiveContext, brainConsensus }),
    "",
    buildSwarmSummary({ swarmExecution, swarmVoting }),
    buildAgentSummary({ agentDelegation, agentPipeline, agentSupervisor }),
    section("Plano máximo da Megan para evoluir sozinha com segurança:", [
      `Objetivo interpretado: ${input.message}`,
      `Perfil de resposta selecionado: ${adaptiveContext?.adaptiveProfile?.responseFrame || "strategic_depth"}`,
      `Estratégia multi-cérebros: ${brainConsensus?.responseStyle || "adaptive_structured"}`
    ]),
    section("Camadas ativadas agora:", [
      "- memória estruturada",
      "- perfil adaptativo por usuário",
      "- roteador de cérebros especialistas",
      "- swarm paralelo",
      "- votação interna entre cérebros",
      "- ranking automático por performance",
      "- agentes autônomos especializados",
      "- supervisor interno de pipeline",
      "- classificador",
      "- planner",
      "- crítico interno",
      "- avaliação",
      "- aprendizado",
      "- autoevolução controlada"
    ]),
    section(
      "Prioridades automáticas deste ciclo:",
      priorities.length
        ? priorities.map((item, index) => `${index + 1}. ${item.title} (${item.slug})`)
        : ["- manter estabilidade e observar dados"]
    ),
    section("Próximos movimentos da inteligência:", plan.steps.map((step, index) => `${index + 1}. ${step}`)),
    section("Memória relevante encontrada:", [
      `- perfil: ${memorySummary.profileCount}`,
      `- sessão: ${memorySummary.sessionCount}`,
      `- regras ativas: ${activeRules.length}`
    ]),
    section("Consenso entre cérebros:", brainConsensus?.rationale || ["- consenso padrão aplicado"]),
    section(
      "Pipeline de agentes:",
      (agentPipeline?.tasks || []).map((task, index) => `${index + 1}. ${task.label}: ${task.title}`)
    )
  ].join("\n");
}

function buildTechnicalFixResponse({ input, plan, adaptiveContext, brainConsensus, swarmExecution, swarmVoting, agentDelegation, agentPipeline, agentSupervisor }) {
  const priorities = adaptiveContext?.priorities || [];
  const explicitPreferences = adaptiveContext?.userProfile?.explicitPreferences || [];

  return [
    buildHeader({ adaptiveContext, brainConsensus }),
    "",
    buildSwarmSummary({ swarmExecution, swarmVoting }),
    buildAgentSummary({ agentDelegation, agentPipeline, agentSupervisor }),
    section("Diagnóstico inicial da Megan:", [`Pedido: ${input.message}`]),
    section("Plano de ação:", plan.steps.map((step, index) => `${index + 1}. ${step}`)),
    section(
      "Cérebros acionados:",
      (brainConsensus?.selectedBrains || []).map((item, index) => `${index + 1}. ${item.label} - ${item.specialty}`)
    ),
    section(
      "Agentes acionados:",
      (agentDelegation?.delegatedAgents || []).map((item, index) => `${index + 1}. ${item.label} - ${item.role}`)
    ),
    section(
      "Prioridade técnica agora:",
      priorities.length
        ? priorities.map((item, index) => `${index + 1}. ${item.title}`)
        : ["1. resolver o erro sem quebrar o restante"]
    ),
    section("Diretriz fixa:", [
      "- corrigir somente o necessário",
      "- preservar o que já funciona",
      "- entregar solução estruturada",
      ...(explicitPreferences.includes("respostas completas prontas para colar")
        ? ["- preferir saída completa pronta para colar"]
        : [])
    ])
  ].join("\n");
}

function buildGeneralResponse({ input, plan, adaptiveContext, brainConsensus, swarmExecution, swarmVoting, agentDelegation, agentPipeline, agentSupervisor }) {
  const mode = adaptiveContext?.adaptiveProfile?.selectedMode || "adaptive_balanced";
  const userObjectives = adaptiveContext?.userProfile?.recurringObjectives || [];
  const intro =
    mode === "direct_executor"
      ? "Resposta objetiva da Megan:"
      : mode === "deep_specialist" || mode === "strategic_architect"
      ? "Resposta contextual da Megan:"
      : "Resposta da Megan:";

  return [
    buildHeader({ adaptiveContext, brainConsensus }),
    "",
    buildSwarmSummary({ swarmExecution, swarmVoting }),
    buildAgentSummary({ agentDelegation, agentPipeline, agentSupervisor }),
    section(intro, [`Entendi: ${input.message}`]),
    section("Plano aplicado:", plan.steps.map((step, index) => `${index + 1}. ${step}`)),
    section("Contexto adaptativo:", [
      `- modo selecionado: ${mode}`,
      `- objetivos recorrentes mapeados: ${userObjectives.length}`,
      `- prioridades ativas: ${(adaptiveContext?.priorities || []).length}`,
      `- resposta orquestrada por: ${brainConsensus?.leadLabel || brainConsensus?.leadBrain || "Coordenador Geral"}`
    ]),
    section(
      "Ranking da votação interna:",
      (swarmVoting?.ranking || []).length
        ? swarmVoting.ranking.map((item, index) => `${index + 1}. ${item.label} (${item.brainId}) - score ${item.score}`)
        : ["- sem votação adicional"]
    ),
    section(
      "Pipeline de agentes:",
      (agentPipeline?.tasks || []).length
        ? agentPipeline.tasks.map((item, index) => `${index + 1}. ${item.label}: ${item.summary}`)
        : ["- sem pipeline adicional"]
    )
  ].join("\n");
}

export function buildResponse({ input, classification, plan, memorySummary, activeRules, adaptiveContext, brainConsensus, swarmExecution, swarmVoting, agentDelegation, agentPipeline, agentSupervisor }) {
  if (classification.category === "self_evolution") {
    return buildSelfEvolutionResponse({ input, memorySummary, plan, activeRules, adaptiveContext, brainConsensus, swarmExecution, swarmVoting, agentDelegation, agentPipeline, agentSupervisor });
  }

  if (classification.category === "technical_fix") {
    return buildTechnicalFixResponse({ input, plan, adaptiveContext, brainConsensus, swarmExecution, swarmVoting, agentDelegation, agentPipeline, agentSupervisor });
  }

  return buildGeneralResponse({ input, plan, adaptiveContext, brainConsensus, swarmExecution, swarmVoting, agentDelegation, agentPipeline, agentSupervisor });
}
