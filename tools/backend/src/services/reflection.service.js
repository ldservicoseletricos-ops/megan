function normalizeText(value) {
  return String(value || "").trim();
}

function clamp(value, min = 0, max = 100) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.max(min, Math.min(max, number));
}

function scoreFromAction(action = {}) {
  if (!action || typeof action !== "object") return 45;

  if (action.primaryAction === "start_navigation" && action.reason === "navigation_ready") {
    return 92;
  }

  if (action.primaryAction === "weather" && action.reason === "weather_ready") {
    return 86;
  }

  if (action.primaryAction === "map") {
    return 82;
  }

  if (action.requiresDestination || action.requiresLocation) {
    return 48;
  }

  if (action.reason && /failed|not_found|without_/i.test(action.reason)) {
    return 42;
  }

  if (action.primaryAction === "greeting") {
    return 90;
  }

  return 68;
}

function scoreReply(reply, text) {
  const safeReply = normalizeText(reply);
  const safeText = normalizeText(text);

  if (!safeReply) return 10;

  let score = 70;

  if (safeReply.length <= 120) score += 10;
  if (safeReply.length > 220) score -= 12;
  if (safeText && safeReply.toLowerCase().includes(safeText.toLowerCase())) score -= 8;
  if (/n[aã]o consegui|atíve|ative sua localiza/i.test(safeReply)) score -= 5;
  if (/navega[cç][aã]o iniciada|mapa aberto|°c agora|oi, luiz/i.test(safeReply)) score += 8;

  return clamp(score);
}

function buildReflection({
  text,
  intent,
  action,
  plan,
  execution,
  weather,
  destinationResolved,
  route,
  hasLocation,
}) {
  const safeText = normalizeText(text);
  const safeReply = normalizeText(execution?.reply);

  const actionScore = scoreFromAction(action);
  const replyScore = scoreReply(safeReply, safeText);

  let utilityScore = Math.round((actionScore + replyScore) / 2);
  let frictionScore = 12;
  const issues = [];
  const wins = [];
  const suggestions = [];

  if (!safeReply) {
    frictionScore += 35;
    issues.push("A Megan ficou sem resposta útil.");
    suggestions.push("Garantir resposta final sempre preenchida.");
  } else {
    wins.push("A Megan entregou uma resposta final.");
  }

  if (action?.requiresDestination) {
    frictionScore += 20;
    issues.push("A ação precisava de um destino mais claro.");
    suggestions.push("Aprender destinos frequentes e aliases como casa e trabalho.");
  }

  if (action?.requiresLocation) {
    frictionScore += 15;
    issues.push("A ação dependia de localização do aparelho.");
    suggestions.push("Priorizar o pedido de permissão de localização quando necessário.");
  }

  if (intent === "navigation" && route) {
    wins.push("A rota foi calculada com sucesso.");
    utilityScore += 6;
  }

  if (intent === "weather" && weather?.temperature != null) {
    wins.push("O clima foi obtido com sucesso.");
    utilityScore += 4;
  }

  if (intent === "navigation" && !route) {
    frictionScore += 18;
    issues.push("O usuário queria navegação, mas a rota não ficou pronta.");
    suggestions.push("Criar fallback melhor quando o roteamento falhar.");
  }

  if (intent === "weather" && hasLocation && !weather) {
    frictionScore += 12;
    issues.push("A localização existia, mas o clima não foi carregado.");
    suggestions.push("Registrar e monitorar falhas do clima para retry futuro.");
  }

  if (destinationResolved) {
    wins.push("O destino foi resolvido com sucesso.");
  }

  const primaryPlan = Array.isArray(plan?.actions) ? plan.actions[0] : null;

  if (primaryPlan?.status && primaryPlan.status !== "ready") {
    frictionScore += 8;
    suggestions.push(`Melhorar fluxo quando o status principal for ${primaryPlan.status}.`);
  }

  utilityScore = clamp(utilityScore);
  frictionScore = clamp(frictionScore);

  return {
    summary:
      wins[0] || issues[0] || "Interação processada sem eventos relevantes.",
    utilityScore,
    frictionScore,
    actionScore,
    replyScore,
    wins,
    issues,
    suggestions: [...new Set(suggestions)].slice(0, 5),
    createdAt: new Date().toISOString(),
  };
}

export { buildReflection };
