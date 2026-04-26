import {
  appendExperiment,
  appendImprovementApplied,
  appendRiskScore,
  listExperiments,
  updateExperiment,
} from "../lib/store.js";
import { applyFeatureFlagPatch, getFeatureFlags } from "./feature-flags.service.js";
import { buildExperimentPolicySnapshot, evaluateImprovementPolicy } from "./policy-engine.service.js";

function normalizeText(value) {
  return String(value || "").trim();
}

function buildSuggestions(context = {}) {
  const suggestions = [];
  const reply = normalizeText(context.execution?.reply);
  const hasRoute = Boolean(context.route);
  const hasLocation = Boolean(context.deviceLocation);
  const destinationRequested = Boolean(normalizeText(context.destinationText));
  const destinationResolved = Boolean(context.destinationResolved);

  if (reply.length > 120) {
    suggestions.push({
      type: "compact_replies",
      scope: "behavior",
      trigger: "long_reply",
      patch: { compactReplies: true },
      reversible: true,
      title: "Reduzir respostas longas",
      description: "Ativar respostas compactas quando Megan falar demais.",
    });
  }

  if ((context.intent === "navigation" || context.intent === "start_navigation") && !hasRoute) {
    suggestions.push({
      type: "navigation_priority_boost",
      scope: "planner",
      trigger: "repeated_failure",
      patch: {
        navigationPriorityBoost: true,
        autoOpenMapOnNavigation: true,
        askLessDuringNavigation: true,
      },
      reversible: true,
      title: "Priorizar navegação com menos fricção",
      description: "Abrir mapa automaticamente e reduzir perguntas extras em fluxos de rota.",
    });
  }

  if (destinationRequested && !destinationResolved) {
    suggestions.push({
      type: "compact_navigation_recovery",
      scope: "behavior",
      trigger: "destination_not_found",
      patch: { compactReplies: true, askLessDuringNavigation: true },
      reversible: true,
      title: "Responder de forma mais direta quando destino falhar",
      description: "Megan reduz explicações e pede apenas o dado crítico quando não encontra o destino.",
    });
  }

  if (context.intent === "weather" && hasLocation && !context.weather) {
    suggestions.push({
      type: "prefer_weather_inline",
      scope: "behavior",
      trigger: "weather_unavailable",
      patch: { preferWeatherInline: true },
      reversible: true,
      title: "Preferir clima direto quando disponível",
      description: "Se o clima estiver acessível, Megan responde direto sem rodeios.",
    });
  }

  return suggestions;
}

function findSimilarOpenExperiment(suggestion) {
  return listExperiments().find(
    (item) =>
      item.status !== "rolled_back" &&
      item.status !== "rejected" &&
      item.type === suggestion.type &&
      JSON.stringify(item.patch || {}) === JSON.stringify(suggestion.patch || {})
  );
}

export function analyzeSelfImprovement(context = {}) {
  const suggestions = buildSuggestions(context);
  const created = [];
  const applied = [];
  const currentFlags = getFeatureFlags();

  for (const suggestion of suggestions) {
    const duplicate = findSimilarOpenExperiment(suggestion);
    if (duplicate) {
      continue;
    }

    const policy = evaluateImprovementPolicy(suggestion);
    const experiment = appendExperiment({
      ...suggestion,
      patch: suggestion.patch,
      flagsBefore: currentFlags,
      status: policy.approvedAutomatically ? "running" : "proposed",
      policy: buildExperimentPolicySnapshot(suggestion),
      metrics: {
        replyLength: normalizeText(context.execution?.reply).length,
        hasRoute: Boolean(context.route),
        hasWeather: Boolean(context.weather),
      },
    });

    appendRiskScore({
      experimentId: experiment.id,
      type: suggestion.type,
      risk: policy.risk,
      scope: suggestion.scope,
    });

    created.push(experiment);

    if (policy.approvedAutomatically) {
      const patchResult = applyFeatureFlagPatch(suggestion.patch, {
        reason: `auto_experiment:${experiment.id}`,
        trigger: suggestion.trigger,
      });

      updateExperiment(experiment.id, () => ({
        status: "applied",
        appliedAt: new Date().toISOString(),
        flagsAfter: patchResult.after,
      }));

      const appliedEntry = appendImprovementApplied({
        experimentId: experiment.id,
        type: suggestion.type,
        patch: suggestion.patch,
        mode: "automatic",
      });

      applied.push({
        experimentId: experiment.id,
        patchResult,
        appliedEntry,
      });
    }
  }

  return {
    currentFlags,
    suggestions,
    created,
    applied,
  };
}
