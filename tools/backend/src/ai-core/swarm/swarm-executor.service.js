function buildBrainPerspective({ brain, message, classification, adaptiveContext = {} }) {
  const style = adaptiveContext?.adaptiveProfile?.responseFrame || "structured";
  const text = String(message || "");

  const templates = {
    general_coordinator: `Coordenar a melhor resposta final para: ${text}`,
    technical_operator: `Diagnosticar a causa raiz e propor correção segura para: ${text}`,
    strategic_architect: `Definir impacto, fase ideal e arquitetura de evolução para: ${text}`,
    creative_editor: `Melhorar clareza, linguagem e apresentação da resposta sobre: ${text}`,
    operations_orchestrator: `Transformar a solução em passos executáveis para: ${text}`,
    quality_guardian: `Revisar risco, regressão e segurança da solução para: ${text}`
  };

  const recommendation =
    templates[brain.brainId] ||
    `Gerar contribuição especializada para a categoria ${classification.category || "general_chat"} sobre: ${text}`;

  return {
    brainId: brain.brainId,
    label: brain.label,
    specialty: brain.specialty,
    confidence: brain.weight || 0.5,
    recommendation,
    responseStyle: style,
    category: classification.category || "general_chat"
  };
}

export async function executeSwarm({ message, classification = {}, adaptiveContext = {}, selectedBrains = [] }) {
  const workers = Array.isArray(selectedBrains) && selectedBrains.length
    ? selectedBrains
    : [{
        brainId: "general_coordinator",
        label: "Coordenador Geral",
        specialty: "coordenação da resposta final",
        weight: 0.7
      }];

  const outputs = await Promise.all(
    workers.map(async (brain) => buildBrainPerspective({
      brain,
      message,
      classification,
      adaptiveContext
    }))
  );

  return {
    mode: outputs.length > 1 ? "parallel_swarm" : "single_specialist",
    totalBrainsActivated: outputs.length,
    outputs
  };
}
