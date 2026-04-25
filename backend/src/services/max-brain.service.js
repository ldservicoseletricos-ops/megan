export function runMaxBrain({ message = "", memory = {}, goals = [] } = {}) {
  const text = String(message || "").toLowerCase();

  const agents = {
    strategist: text.includes("plano") || text.includes("estratégia") || text.includes("estrategia"),
    navigator: text.includes("rota") || text.includes("mapa") || text.includes("navega"),
    analyst: text.includes("analise") || text.includes("análise") || text.includes("diagnóstico") || text.includes("diagnostico"),
    assistant: true,
  };

  const priorities = [];

  if (agents.navigator) priorities.push("navigation");
  if (text.includes("clima") || text.includes("tempo")) priorities.push("weather");
  if (agents.analyst) priorities.push("analysis");
  if (agents.strategist) priorities.push("planning");
  if (!priorities.length) priorities.push("smart_reply");

  return {
    ok: true,
    agents,
    priorities,
    contextDepth: "high",
    goalsCount: Array.isArray(goals) ? goals.length : 0,
    memorySignals: Object.keys(memory || {}).length,
  };
}
