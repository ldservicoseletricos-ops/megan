import { appendAgentRun, getSystemState } from "../lib/store.js";

function normalizeText(value) {
  return String(value || "").trim();
}

function lower(value) {
  return normalizeText(value).toLowerCase();
}

function boolScore(value, yes = 0.88, no = 0.26) {
  return value ? yes : no;
}

function summarizeMemory(conversation = {}) {
  const memory = conversation.memory && typeof conversation.memory === "object" ? conversation.memory : {};
  return {
    currentGoal: memory.currentGoal || "",
    currentProblem: memory.currentProblem || "",
    nextStep: memory.nextStep || "",
    category: memory.category || "Geral",
  };
}

function buildNavigationOpinion(context = {}, profile = {}) {
  const text = lower(context.text);
  const requested = /(rota|navega|ir para|me leva|como chegar|destino)/.test(text) || Boolean(normalizeText(context.destinationText));
  const hasLocation = Boolean(context.deviceLocation);
  const hasDestination = Boolean(context.destinationResolved || normalizeText(context.destinationText));
  const hasRoute = Boolean(context.route);
  const confidence = Math.max(0.12, Math.min(0.99, ((requested ? 0.55 : 0.18) + (hasLocation ? 0.18 : 0) + (hasDestination ? 0.18 : 0) + (hasRoute ? 0.08 : 0)) * (profile.weight || 1)));

  return {
    agent: "navigation",
    enabled: profile.enabled !== false,
    stance: requested ? "prioritize" : "neutral",
    confidence: Number(confidence.toFixed(2)),
    summary: requested
      ? hasRoute
        ? "Fluxo de navegação pronto para iniciar."
        : "Fluxo de navegação detectado, mas ainda falta completar parte da rota."
      : "Navegação não parece ser a ação dominante.",
    recommendations: [
      requested ? "navigation" : null,
      requested && !hasDestination ? "ask_destination" : null,
      requested && !hasLocation ? "ask_location" : null,
      requested && hasDestination && hasLocation && !hasRoute ? "calculate_route" : null,
      requested && hasRoute ? "open_map" : null,
    ].filter(Boolean),
  };
}

function buildWeatherOpinion(context = {}, profile = {}) {
  const text = lower(context.text);
  const requested = /(clima|tempo|chuva|temperatura|previs)/.test(text);
  const confidence = Math.max(0.1, Math.min(0.98, ((requested ? 0.62 : 0.18) + (context.weather ? 0.16 : 0) + (context.deviceLocation ? 0.08 : 0)) * (profile.weight || 1)));

  return {
    agent: "weather",
    enabled: profile.enabled !== false,
    stance: requested ? "support" : "neutral",
    confidence: Number(confidence.toFixed(2)),
    summary: requested ? "Clima relevante para a resposta atual." : "Clima não é prioridade clara.",
    recommendations: [requested ? "weather" : null, requested && !context.deviceLocation ? "ask_location" : null].filter(Boolean),
  };
}

function buildMemoryOpinion(context = {}, profile = {}) {
  const memory = summarizeMemory(context.conversation);
  const hasGoal = Boolean(memory.currentGoal);
  const confidence = Math.max(0.1, Math.min(0.95, ((hasGoal ? 0.55 : 0.22) + (context.conversation?.messages?.length ? 0.15 : 0)) * (profile.weight || 1)));

  return {
    agent: "memory",
    enabled: profile.enabled !== false,
    stance: "support",
    confidence: Number(confidence.toFixed(2)),
    summary: hasGoal
      ? `Memória ativa: objetivo atual = ${memory.currentGoal}`
      : "Sem objetivo forte salvo na memória.",
    memory,
    recommendations: [memory.currentGoal ? "respect_memory_goal" : null, memory.currentProblem ? "reduce_friction" : null].filter(Boolean),
  };
}

function buildResponseOpinion(context = {}, profile = {}) {
  const text = lower(context.text);
  const wantsFast = /(rápido|rapido|direto|curto|objetivo)/.test(text);
  const confidence = Math.max(0.1, Math.min(0.97, ((wantsFast ? 0.65 : 0.4) + (context.intent === "navigation" ? 0.12 : 0)) * (profile.weight || 1)));

  return {
    agent: "response",
    enabled: profile.enabled !== false,
    stance: "govern",
    confidence: Number(confidence.toFixed(2)),
    summary: wantsFast ? "Responder de forma curta e direta." : "Manter resposta clara com contexto essencial.",
    recommendations: [wantsFast ? "compact_reply" : "clear_reply"],
  };
}

function buildImprovementOpinion(context = {}, profile = {}) {
  const assistantMessages = Array.isArray(context.conversation?.messages)
    ? context.conversation.messages.filter((item) => item.role === "assistant").slice(-8)
    : [];
  const repeatedFailure = assistantMessages.some((item) => /não consegui|ative sua localização|diga o destino/i.test(item.content || ""));
  const confidence = Math.max(0.12, Math.min(0.94, ((repeatedFailure ? 0.64 : 0.22) + (context.intent === "navigation" ? 0.08 : 0)) * (profile.weight || 1)));

  return {
    agent: "improvement",
    enabled: profile.enabled !== false,
    stance: repeatedFailure ? "intervene" : "neutral",
    confidence: Number(confidence.toFixed(2)),
    summary: repeatedFailure
      ? "Falha recorrente detectada; reduzir fricção é prioridade."
      : "Sem falha recorrente forte nesta janela.",
    recommendations: [repeatedFailure ? "reduce_questions" : null, repeatedFailure ? "prioritize_navigation" : null].filter(Boolean),
  };
}

export function runSpecialistAgents(context = {}) {
  const profiles = getSystemState().agentProfiles || {};
  const candidates = [
    buildNavigationOpinion(context, profiles.navigation || {}),
    buildWeatherOpinion(context, profiles.weather || {}),
    buildMemoryOpinion(context, profiles.memory || {}),
    buildResponseOpinion(context, profiles.response || {}),
    buildImprovementOpinion(context, profiles.improvement || {}),
  ].filter((item) => item.enabled !== false);

  const run = appendAgentRun({
    type: "specialist_run",
    intent: context.intent || "general",
    text: normalizeText(context.text).slice(0, 240),
    agents: candidates,
  });

  return {
    runId: run.id,
    agents: candidates,
  };
}
