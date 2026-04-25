function orchestrateAgents({
  text,
  intent,
  action,
  plan,
  destinationResolved,
  weather,
  route,
  reflection,
}) {
  const activeAgents = [];

  activeAgents.push({
    name: "planner",
    status: plan?.actions?.length ? "active" : "idle",
    detail: plan?.primaryAction || "reply",
  });

  if (intent === "navigation" || route || destinationResolved) {
    activeAgents.push({
      name: "navigation",
      status: route ? "ready" : destinationResolved ? "resolving" : "idle",
      detail: destinationResolved?.label || "Sem destino resolvido",
    });
  }

  if (intent === "weather" || weather) {
    activeAgents.push({
      name: "weather",
      status: weather?.temperature != null ? "ready" : "waiting",
      detail:
        weather?.temperature != null ? `${weather.temperature}°C` : "Sem dados climáticos",
    });
  }

  activeAgents.push({
    name: "reflection",
    status: reflection ? "active" : "idle",
    detail: reflection?.summary || "Sem avaliação",
  });

  activeAgents.push({
    name: "memory",
    status: "active",
    detail: action?.assistantMode || intent || "general",
  });

  return {
    activeAgents,
    orchestrationSummary:
      activeAgents.map((agent) => `${agent.name}:${agent.status}`).join(" | ") ||
      "Sem agentes ativos.",
    sourceText: String(text || "").trim(),
  };
}

export { orchestrateAgents };
