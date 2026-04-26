import { getNextReadyStep, markStep, summarizeQueue } from "./action-queue.service.js";

function normalizeText(value) {
  return String(value || "").trim();
}

function getShortDestinationName(label = "", fallback = "destino") {
  const safeLabel = normalizeText(label);
  const safeFallback = normalizeText(fallback) || "destino";

  if (!safeLabel) return safeFallback;

  return safeLabel.split(",")[0].trim() || safeFallback;
}

function buildWeatherReply(weather, hasLocation) {
  if (!hasLocation) return "Ative sua localização para ver o clima.";
  if (!weather || weather.temperature == null) return "Não consegui obter o clima agora.";
  return `${weather.temperature}°C agora.`;
}

function buildNavigationReply({ destinationResolved, destinationText, route, hasLocation }) {
  const hasDestinationText = Boolean(normalizeText(destinationText));
  if (!hasDestinationText) return "Diga o destino.";
  if (!destinationResolved) return "Não encontrei o destino.";
  if (!hasLocation) return "Ative sua localização.";
  if (!route) return "Não consegui calcular a rota.";

  const shortName = getShortDestinationName(destinationResolved?.label, destinationText || "destino");
  return `Navegação iniciada para ${shortName}.`;
}

function buildFinalReply({ queue, plan, text, weather, destinationResolved, route, hasLocation, destinationText }) {
  const executedIds = new Set((queue?.steps || []).filter((step) => step.status === "done").map((step) => step.id));

  if (executedIds.has("start_navigation")) {
    let reply = buildNavigationReply({ destinationResolved, destinationText, route, hasLocation });
    if (executedIds.has("fetch_weather") && weather?.temperature != null) {
      reply += ` Clima atual: ${weather.temperature}°C.`;
    }
    return reply;
  }

  if (executedIds.has("fetch_weather")) {
    return buildWeatherReply(weather, hasLocation);
  }

  if (executedIds.has("open_map") || executedIds.has("open_map_navigation")) {
    return destinationResolved
      ? `Mapa aberto para ${getShortDestinationName(destinationResolved?.label, destinationText || "destino")}.`
      : "Mapa aberto.";
  }

  if (plan?.primaryAction === "greeting") {
    return "Oi, Luiz.";
  }

  if ((queue?.steps || []).some((step) => step.status === "needs_destination")) {
    return "Diga o destino.";
  }

  if ((queue?.steps || []).some((step) => step.status === "needs_location")) {
    return "Ative sua localização.";
  }

  if ((queue?.steps || []).some((step) => step.status === "needs_better_destination")) {
    return "Não encontrei o destino com precisão.";
  }

  if ((queue?.steps || []).some((step) => step.status === "route_failed")) {
    return "Não consegui calcular a rota.";
  }

  return normalizeText(text) ? "Pode me dizer melhor o que você precisa?" : "Estou pronta para ajudar.";
}

function executePlanQueue({ queue, plan, text, weather, destinationResolved, route, hasLocation, destinationText }) {
  const executedActions = [];
  let currentStep = getNextReadyStep(queue);

  while (currentStep) {
    let result = null;

    switch (currentStep.id) {
      case "greet_user":
      case "reply_user":
        result = { ok: true };
        markStep(queue, currentStep.id, "done", result);
        break;
      case "fetch_weather":
        result = weather ? { ok: true, weather } : { ok: false };
        markStep(queue, currentStep.id, weather ? "done" : "failed", result);
        break;
      case "resolve_destination":
        result = destinationResolved ? { ok: true, destinationResolved } : { ok: false };
        markStep(queue, currentStep.id, destinationResolved ? "done" : "failed", result);
        break;
      case "compute_route":
        result = route ? { ok: true, route } : { ok: false };
        markStep(queue, currentStep.id, route ? "done" : "failed", result);
        break;
      case "open_map":
      case "open_map_navigation":
        result = { ok: true, openMap: true };
        markStep(queue, currentStep.id, "done", result);
        break;
      case "start_navigation":
        result = destinationResolved && route && hasLocation ? { ok: true, route } : { ok: false };
        markStep(queue, currentStep.id, destinationResolved && route && hasLocation ? "done" : "failed", result);
        break;
      default:
        markStep(queue, currentStep.id, "failed", { ok: false, reason: "unknown_step" });
        break;
    }

    executedActions.push({
      stepId: currentStep.id,
      type: currentStep.type,
      status: queue.steps.find((step) => step.id === currentStep.id)?.status || "failed",
      result,
    });

    currentStep = getNextReadyStep(queue);
  }

  const reply = buildFinalReply({ queue, plan, text, weather, destinationResolved, route, hasLocation, destinationText });
  const summary = summarizeQueue(queue);
  const openMap = queue.steps.some((step) => ["open_map", "open_map_navigation", "start_navigation"].includes(step.id) && step.status === "done");

  return {
    reply,
    queue,
    queueSummary: summary,
    effects: {
      openMap,
      hasRoute: Boolean(route),
      hasWeather: Boolean(weather),
      hasDestination: Boolean(destinationResolved),
      queueStatus: summary.status,
    },
    executedActions,
  };
}

export { executePlanQueue };
