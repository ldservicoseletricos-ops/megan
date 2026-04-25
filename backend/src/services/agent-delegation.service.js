import { appendAgentTask } from "../lib/store.js";

function uniqueBy(items = [], keyFn = (item) => item?.key) {
  const seen = new Set();
  return items.filter((item) => {
    const key = keyFn(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildTask(agent, type, title, priority, details = {}) {
  return {
    agent,
    type,
    title,
    priority,
    key: `${agent}:${type}:${details.key || title}`,
    ...details,
  };
}

export function buildAgentDelegation(context = {}) {
  const tasks = [];
  const conversationId = context.conversationId;
  const goals = Array.isArray(context.goals) ? context.goals : [];
  const topGoal = goals[0] || null;
  const planActions = Array.isArray(context.plan?.actions) ? context.plan.actions : [];

  if (context.intent === "navigation") {
    if (!context.destinationResolved) {
      tasks.push(buildTask("navigation", "request_destination", "Pedir destino com clareza", 100, { key: "destination", conversationId }));
    }
    if (!context.deviceLocation) {
      tasks.push(buildTask("navigation", "request_location", "Pedir localização do aparelho", 99, { key: "location", conversationId }));
    }
    if (context.destinationResolved && context.deviceLocation && !context.route) {
      tasks.push(buildTask("navigation", "calculate_route", "Preparar rota antes de abrir o mapa", 98, { key: "route", conversationId }));
    }
    if (context.route) {
      tasks.push(buildTask("navigation", "open_map", "Abrir mapa em modo navegação", 97, { key: "open_map", conversationId }));
    }
  }

  if (Array.isArray(planActions) && planActions.some((item) => item.type === "weather")) {
    tasks.push(buildTask("weather", "inline_weather", "Entregar clima junto da resposta principal", 70, { key: "weather", conversationId }));
  }

  tasks.push(buildTask("response", "final_reply", "Montar resposta final com baixa fricção", topGoal?.priority ? Math.max(60, topGoal.priority - 10) : 64, { key: "reply", conversationId }));

  const prepared = uniqueBy(tasks)
    .sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0))
    .map((task) => appendAgentTask({
      ...task,
      status: "queued",
      source: "phase7_delegation",
    }));

  return {
    primaryAgent: prepared[0]?.agent || "response",
    tasks: prepared,
    summary: prepared.map((task) => `${task.agent}:${task.type}`),
  };
}
