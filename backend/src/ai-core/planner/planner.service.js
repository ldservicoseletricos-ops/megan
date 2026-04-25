export function buildPlan({ classification, message, adaptiveContext, brainConsensus, swarmExecution, swarmVoting }) {
  const steps = [];

  if (classification.category === "self_evolution") {
    steps.push(
      "Entender objetivo de autoevolução da Megan",
      "Executar swarm paralelo entre cérebros estratégicos e de qualidade",
      "Comparar votos internos e escolher líder dinâmico",
      "Consultar memórias, metas ativas e prioridades do usuário",
      "Montar resposta estratégica estruturada",
      "Avaliar a qualidade da resposta",
      "Registrar lições e possíveis melhorias"
    );
  } else if (classification.category === "technical_fix") {
    steps.push(
      "Identificar origem provável do erro",
      "Acionar swarm técnico com guardião de qualidade",
      "Votar internamente na correção de maior impacto",
      "Revisar risco de quebrar partes existentes",
      "Entregar correção estruturada pronta para aplicar"
    );
  } else {
    steps.push(
      "Entender pedido do usuário",
      "Selecionar cérebros especialistas úteis para o contexto",
      "Executar contribuições paralelas",
      "Votar no melhor líder para a resposta",
      "Adaptar profundidade ao perfil do usuário",
      "Responder de forma clara e útil"
    );
  }

  return {
    objective: message,
    strategy: classification.category,
    adaptiveMode: adaptiveContext?.adaptiveProfile?.selectedMode || "adaptive_balanced",
    brainLead: brainConsensus?.leadBrain || "general_coordinator",
    leaderBeforeVote: brainConsensus?.leaderBeforeVote || brainConsensus?.leadBrain || "general_coordinator",
    supportingBrains: brainConsensus?.supportingBrains || [],
    priorities: adaptiveContext?.priorities || [],
    swarmMode: swarmExecution?.mode || "single_specialist",
    swarmActivatedBrains: swarmExecution?.totalBrainsActivated || 1,
    votingWinner: swarmVoting?.winner?.brainId || brainConsensus?.leadBrain || "general_coordinator",
    steps,
    checkpoints: [
      "clareza",
      "aderência ao objetivo",
      "segurança",
      "utilidade",
      "adaptação ao usuário",
      "consenso entre cérebros",
      "votação swarm"
    ]
  };
}
