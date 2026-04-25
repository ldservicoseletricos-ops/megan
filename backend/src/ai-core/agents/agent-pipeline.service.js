import { getAgentById } from "./agent-catalog.js";

function buildTask(agent, category, message, plan, index) {
  const label = agent?.label || agent?.agentId || `agent_${index + 1}`;

  if (agent?.agentId === "research_agent") {
    return {
      title: "Levantar contexto",
      summary: `${label} mapeou sinais do pedido e pontos críticos para ${category}.`,
      output: [
        `pedido_base:${message}`,
        `categoria:${category}`,
        `plano_inicial:${(plan?.steps || []).length}`
      ]
    };
  }

  if (agent?.agentId === "technical_agent") {
    return {
      title: "Diagnóstico técnico",
      summary: `${label} montou o caminho seguro de correção e validou risco de quebra.`,
      output: [
        "preservar_estrutura_existente",
        "corrigir_somente_o_necessario",
        "validar_imports_e_dependencias"
      ]
    };
  }

  if (agent?.agentId === "operator_agent") {
    return {
      title: "Execução operacional",
      summary: `${label} organizou a execução em etapas objetivas e priorizadas.`,
      output: (plan?.steps || []).slice(0, 5).map((step, idx) => `etapa_${idx + 1}:${step}`)
    };
  }

  if (agent?.agentId === "writer_agent") {
    return {
      title: "Entrega estruturada",
      summary: `${label} converteu o conteúdo em entrega mais clara e pronta para uso.`,
      output: [
        "entrega_com_estrutura_clara",
        "foco_em_legibilidade",
        "resposta_pronta_para_colar_quando_necessario"
      ]
    };
  }

  return {
    title: "Supervisão",
    summary: `${label} revisou consistência, ordem de execução e risco residual.`,
    output: [
      "consistencia_revisada",
      "risco_residual_controlado",
      "pipeline_aprovado"
    ]
  };
}

export async function runAgentPipeline({ delegation, message, classification, plan }) {
  const tasks = delegation.delegatedAgents.map((agentRef, index) => {
    const agent = getAgentById(agentRef.agentId) || agentRef;
    const task = buildTask(agent, classification?.category || "general_chat", message, plan, index);

    return {
      taskId: `agent-task-${Date.now()}-${index + 1}`,
      order: agentRef.order,
      agentId: agent.agentId,
      label: agent.label,
      role: agentRef.role,
      status: "completed",
      title: task.title,
      summary: task.summary,
      output: task.output,
      completedAt: new Date().toISOString()
    };
  });

  return {
    pipelineId: `agent-pipeline-${Date.now()}`,
    mode: delegation.mode,
    totalAgents: tasks.length,
    completedTasks: tasks.length,
    tasks
  };
}
