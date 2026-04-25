function normalizeText(value) {
  return String(value || "").trim();
}

function slugifyPlace(value) {
  return normalizeText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "destino";
}

function shortName(label = "", fallback = "") {
  const safe = normalizeText(label) || normalizeText(fallback);
  return safe.split(",")[0].trim() || safe;
}

function buildRouteLearningUpdate({ currentProfile, destinationResolved, destinationText, route, intent }) {
  const profile = currentProfile && typeof currentProfile === "object" ? currentProfile : {};
  const knownPlaces = {
    ...(profile.knownPlaces || {}),
  };
  const routeLearning = {
    ...(profile.routeLearning || {}),
    favorites: Array.isArray(profile?.routeLearning?.favorites) ? [...profile.routeLearning.favorites] : [],
    history: Array.isArray(profile?.routeLearning?.history) ? [...profile.routeLearning.history] : [],
  };

  const label = destinationResolved?.label || destinationText || "";
  const safeShortName = shortName(label, destinationText);
  const placeKey = slugifyPlace(safeShortName);
  const isNavigation = intent === "navigation" || Boolean(destinationText);

  if (!isNavigation || !safeShortName) {
    return {
      knownPlaces,
      routeLearning,
    };
  }

  const existingPlace = knownPlaces[placeKey] || {};
  const useCount = Number(existingPlace.useCount || 0) + 1;

  knownPlaces[placeKey] = {
    alias: existingPlace.alias || inferAliasFromPlace(safeShortName),
    label: destinationResolved?.label || existingPlace.label || safeShortName,
    shortName: safeShortName,
    latitude: destinationResolved?.latitude ?? destinationResolved?.lat ?? existingPlace.latitude ?? null,
    longitude: destinationResolved?.longitude ?? destinationResolved?.lon ?? existingPlace.longitude ?? null,
    lastUsedAt: new Date().toISOString(),
    useCount,
  };

  routeLearning.totalRoutes = Number(routeLearning.totalRoutes || 0) + 1;
  routeLearning.successfulRoutes = Number(routeLearning.successfulRoutes || 0) + (route ? 1 : 0);
  routeLearning.failedRoutes = Number(routeLearning.failedRoutes || 0) + (route ? 0 : 1);
  routeLearning.lastRouteAt = new Date().toISOString();

  const historyEntry = {
    shortName: safeShortName,
    label: destinationResolved?.label || safeShortName,
    distance: route?.distance ?? null,
    duration: route?.duration ?? null,
    success: Boolean(route),
    createdAt: new Date().toISOString(),
  };

  routeLearning.history.push(historyEntry);
  routeLearning.history = routeLearning.history.slice(-40);

  const favoritesMap = new Map();
  for (const entry of routeLearning.favorites || []) {
    favoritesMap.set(entry.key, entry);
  }

  favoritesMap.set(placeKey, {
    key: placeKey,
    alias: knownPlaces[placeKey].alias || placeKey,
    shortName: safeShortName,
    label: destinationResolved?.label || safeShortName,
    useCount,
    lastUsedAt: new Date().toISOString(),
  });

  routeLearning.favorites = [...favoritesMap.values()]
    .sort((a, b) => Number(b.useCount || 0) - Number(a.useCount || 0))
    .slice(0, 12);

  return {
    knownPlaces,
    routeLearning,
  };
}

function inferAliasFromPlace(name) {
  const safe = normalizeText(name).toLowerCase();

  if (/casa|home|lar/.test(safe)) return "casa";
  if (/trabalho|empresa|escritorio|office/.test(safe)) return "trabalho";
  if (/mercado|supermercado/.test(safe)) return "mercado";

  return safe;
}

export { buildRouteLearningUpdate, slugifyPlace, shortName };
