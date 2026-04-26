export function classifyPriorities({
  message = "",
  memory = {},
  activeProject = null,
  signals = {}
} = {}) {
  const text = String(message || "").toLowerCase();

  const priorities = [];
  if (text.includes("rota") || text.includes("navega") || text.includes("mapa")) priorities.push("navigation");
  if (text.includes("clima")) priorities.push("weather");
  if (text.includes("erro") || text.includes("problema") || text.includes("corrigir")) priorities.push("fix_problem");
  if (text.includes("plano") || text.includes("estratégia") || text.includes("estrategia")) priorities.push("strategy");
  if (activeProject?.project?.nextStep) priorities.push("continue_project");
  if (signals?.hasAttachments) priorities.push("analyze_files");
  if (!priorities.length) priorities.push("smart_reply");

  return Array.from(new Set(priorities));
}

export function buildActionPlan({
  priorities = []
} = {}) {
  return priorities.map((priority, index) => ({
    id: `step_${index + 1}`,
    priority,
    status: "ready",
    order: index + 1
  }));
}

export function buildOperationalReply({
  plan = [],
  activeProject = null
} = {}) {
  const first = plan?.[0]?.priority || "smart_reply";
  const projectName = activeProject?.activeProjectId || "default";

  const map = {
    navigation: "Vou priorizar navegação e abrir o próximo fluxo operacional.",
    weather: "Vou priorizar clima e contexto imediato.",
    fix_problem: "Vou priorizar correção do problema atual.",
    strategy: "Vou priorizar estratégia e próximos passos.",
    continue_project: "Vou continuar o projeto ativo do ponto certo.",
    analyze_files: "Vou priorizar análise dos arquivos enviados.",
    smart_reply: "Vou responder com o melhor contexto disponível."
  };

  return {
    summary: map[first] || map.smart_reply,
    firstPriority: first,
    activeProjectId: projectName
  };
}
