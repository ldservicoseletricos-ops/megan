function normalizeText(value) {
  return String(value || "").trim();
}

function toKey(value) {
  return normalizeText(value).toLowerCase();
}

function getShortDestinationName(label = "", fallback = "") {
  const safeLabel = normalizeText(label);
  const safeFallback = normalizeText(fallback);
  if (!safeLabel) return safeFallback;
  return safeLabel.split(",")[0].trim() || safeFallback;
}

function buildLearningUpdate({
  currentMemory,
  text,
  intent,
  destinationText,
  destinationResolved,
  reflection,
  route,
  weather,
  action,
}) {
  const safeMemory = currentMemory && typeof currentMemory === "object" ? currentMemory : {};
  const safeText = normalizeText(text);
  const safeDestinationText = normalizeText(destinationText);
  const placeName = getShortDestinationName(destinationResolved?.label, safeDestinationText);
  const placeKey = toKey(placeName);

  const preferences = {
    ...(safeMemory.preferences || {}),
    responseStyle: safeMemory?.preferences?.responseStyle || "curta_e_direta",
    language: safeMemory?.preferences?.language || "pt-BR",
    prefersShortNavigationSpeech: true,
  };

  const knownPlaces = {
    ...(safeMemory.knownPlaces || {}),
  };

  if (destinationResolved && placeKey) {
    const currentEntry = knownPlaces[placeKey] || {};
    knownPlaces[placeKey] = {
      label: destinationResolved.label || placeName,
      shortName: placeName,
      latitude: destinationResolved.latitude ?? destinationResolved.lat ?? null,
      longitude: destinationResolved.longitude ?? destinationResolved.lon ?? null,
      useCount: Number(currentEntry.useCount || 0) + 1,
      lastUsedAt: new Date().toISOString(),
    };
  }

  const episodic = Array.isArray(safeMemory.episodicLearnings)
    ? [...safeMemory.episodicLearnings]
    : [];

  const newEpisode = {
    type: intent || action?.primaryAction || "general",
    text: safeText,
    outcome: reflection?.summary || "Interação registrada.",
    utilityScore: reflection?.utilityScore ?? null,
    frictionScore: reflection?.frictionScore ?? null,
    destination: placeName || null,
    createdAt: new Date().toISOString(),
  };

  episodic.push(newEpisode);

  const learningSignals = {
    totalInteractions: Number(safeMemory?.learningSignals?.totalInteractions || 0) + 1,
    successfulNavigations:
      Number(safeMemory?.learningSignals?.successfulNavigations || 0) +
      (route ? 1 : 0),
    successfulWeatherChecks:
      Number(safeMemory?.learningSignals?.successfulWeatherChecks || 0) +
      (weather?.temperature != null ? 1 : 0),
    averageUtilityScore: computeRollingAverage(
      safeMemory?.learningSignals?.averageUtilityScore,
      safeMemory?.learningSignals?.totalInteractions,
      reflection?.utilityScore
    ),
  };

  const improvementBacklog = Array.isArray(safeMemory.improvementBacklog)
    ? [...safeMemory.improvementBacklog]
    : [];

  for (const suggestion of reflection?.suggestions || []) {
    if (!improvementBacklog.includes(suggestion)) {
      improvementBacklog.push(suggestion);
    }
  }

  return {
    preferences,
    knownPlaces,
    episodicLearnings: episodic.slice(-30),
    learningSignals,
    improvementBacklog: improvementBacklog.slice(-20),
  };
}

function computeRollingAverage(previousAverage, previousCount, nextValue) {
  const safeNext = Number(nextValue);
  const safePrevAverage = Number(previousAverage);
  const safePrevCount = Number(previousCount);

  if (!Number.isFinite(safeNext)) {
    return Number.isFinite(safePrevAverage) ? safePrevAverage : null;
  }

  if (!Number.isFinite(safePrevAverage) || !Number.isFinite(safePrevCount) || safePrevCount <= 0) {
    return safeNext;
  }

  return Number((((safePrevAverage * safePrevCount) + safeNext) / (safePrevCount + 1)).toFixed(2));
}

export { buildLearningUpdate };
