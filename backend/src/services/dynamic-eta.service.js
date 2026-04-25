export function buildDynamicEtaState({
  baseEtaMinutes = null,
  trafficLevel = "normal",
  incidents = [],
  rerouteSuggested = false
} = {}) {
  const safeBaseEta = typeof baseEtaMinutes === "number" ? baseEtaMinutes : null;
  const safeIncidents = Array.isArray(incidents) ? incidents : [];

  const trafficImpact =
    trafficLevel === "pesado"
      ? 12
      : trafficLevel === "moderado"
      ? 6
      : trafficLevel === "leve"
      ? 2
      : 0;

  const incidentImpact = safeIncidents.length * 2;
  const totalImpact = trafficImpact + incidentImpact;
  const dynamicEtaMinutes =
    typeof safeBaseEta === "number" ? safeBaseEta + totalImpact : null;

  return {
    ok: true,
    trafficLevel,
    incidentCount: safeIncidents.length,
    trafficImpactMinutes: trafficImpact,
    incidentImpactMinutes: incidentImpact,
    totalImpactMinutes: totalImpact,
    dynamicEtaMinutes,
    rerouteSuggested: Boolean(rerouteSuggested)
  };
}

export function buildHumanNavigationText({
  nextInstructionText = "",
  nextInstructionDistanceMeters = null,
  trafficLevel = "normal",
  rerouteSuggested = false
} = {}) {
  const instruction = String(nextInstructionText || "").trim() || "Siga em frente.";
  const distanceText =
    typeof nextInstructionDistanceMeters === "number" && nextInstructionDistanceMeters > 0
      ? ` em ${Math.round(nextInstructionDistanceMeters)} metros`
      : "";

  if (rerouteSuggested) {
    return `Trânsito à frente. Vou recalcular a melhor rota. ${instruction}${distanceText}.`;
  }

  if (trafficLevel === "pesado") {
    return `Trânsito pesado à frente. ${instruction}${distanceText}.`;
  }

  return `${instruction}${distanceText}.`;
}
