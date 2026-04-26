import { slugifyPlace } from "./route-learning.service.js";
import { getRecentMemoryEntries } from "./memory.service.js";

function normalizeText(value) {
  return String(value || "").trim();
}

function getShortName(label = "", fallback = "") {
  const safe = normalizeText(label) || normalizeText(fallback);
  return safe.split(",")[0].trim() || safe;
}

function resolveDestinationFromMemory({ destinationText, profile }) {
  const safeDestination = normalizeText(destinationText);
  const knownPlaces = profile?.knownPlaces && typeof profile.knownPlaces === "object" ? profile.knownPlaces : {};

  if (!safeDestination) {
    return {
      resolvedText: "",
      memoryDestination: null,
      matchedAlias: null,
    };
  }

  const normalized = safeDestination.toLowerCase();
  const candidates = Object.values(knownPlaces);

  const byAlias = candidates.find((place) => normalizeText(place.alias).toLowerCase() === normalized);
  if (byAlias) {
    return {
      resolvedText: byAlias.label || byAlias.shortName || safeDestination,
      memoryDestination: byAlias,
      matchedAlias: byAlias.alias || null,
    };
  }

  const slugKey = slugifyPlace(safeDestination);
  if (knownPlaces[slugKey]) {
    const place = knownPlaces[slugKey];
    return {
      resolvedText: place.label || place.shortName || safeDestination,
      memoryDestination: place,
      matchedAlias: place.alias || null,
    };
  }

  return {
    resolvedText: safeDestination,
    memoryDestination: null,
    matchedAlias: null,
  };
}

function buildProfileMemoryContext(profile) {
  const safeProfile = profile && typeof profile === "object" ? profile : {};
  const favorites = Array.isArray(safeProfile?.routeLearning?.favorites)
    ? safeProfile.routeLearning.favorites.slice(0, 5)
    : [];
  const recentNotes = Array.isArray(safeProfile.memoryNotes)
    ? safeProfile.memoryNotes.slice(-5)
    : [];

  return {
    preferences: safeProfile.preferences || {},
    favoriteDestinations: favorites.map((item) => ({
      alias: item.alias || item.key,
      shortName: item.shortName || getShortName(item.label, item.key),
      useCount: item.useCount || 0,
    })),
    recentNotes,
    improvementBacklog: Array.isArray(safeProfile.improvementBacklog)
      ? safeProfile.improvementBacklog.slice(-8)
      : [],
  };
}

function scoreMemoryEntry(entry = {}, query = "") {
  const safeQuery = normalizeText(query).toLowerCase();
  const content = normalizeText(entry?.content).toLowerCase();
  let score = Number(entry?.priority || 0);

  if (safeQuery && content.includes(safeQuery)) score += 40;
  if (safeQuery && safeQuery.split(/\s+/).some((token) => token && content.includes(token))) score += 20;
  if (entry?.type === "preference") score += 10;
  if (entry?.type === "project") score += 8;
  return score;
}

function retrieveRankedMemories({ userId = "default", query = "", limit = 8 } = {}) {
  const items = getRecentMemoryEntries({ userId, limit: 200 });
  return items
    .map((item) => ({ ...item, score: scoreMemoryEntry(item, query) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, Math.min(20, limit)));
}

export { resolveDestinationFromMemory, buildProfileMemoryContext, retrieveRankedMemories, scoreMemoryEntry };
