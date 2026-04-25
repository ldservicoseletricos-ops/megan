import { getUserProfile, updateUserProfile } from "../lib/store.js";

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeAlias(value) {
  return normalizeText(value).toLowerCase();
}

function inferKnownPlaceFromText({ userProfile, text, destinationText }) {
  const profile = userProfile || null;
  const knownPlaces = Array.isArray(profile?.knownPlaces) ? profile.knownPlaces : [];
  const combined = `${normalizeText(text)} ${normalizeText(destinationText)}`.toLowerCase();

  return (
    knownPlaces.find((place) => {
      const alias = normalizeAlias(place?.alias);
      return alias && new RegExp(`(^|\b)${alias}(\b|$)`, "i").test(combined);
    }) || null
  );
}

function learnFromInteraction({
  userId,
  text,
  destinationText,
  destinationResolved,
  execution,
  route,
  knownPlace,
}) {
  const profile = getUserProfile(userId);
  const safeText = normalizeText(text).toLowerCase();
  const effectiveDestination = normalizeText(destinationText);
  const reply = normalizeText(execution?.reply);
  const learning = {
    preferencesUpdated: false,
    placeLearned: false,
    routeHistoryUpdated: false,
    aliasUsed: knownPlace?.alias || null,
  };

  updateUserProfile(userId, (current) => {
    const next = {
      ...current,
      preferences: {
        ...(current.preferences || {}),
      },
      knownPlaces: Array.isArray(current.knownPlaces) ? [...current.knownPlaces] : [],
      routeHistory: Array.isArray(current.routeHistory) ? [...current.routeHistory] : [],
      learnedPatterns: Array.isArray(current.learnedPatterns)
        ? [...current.learnedPatterns]
        : [],
    };

    if (/(mais curto|resumido|objetivo|fale menos)/.test(safeText)) {
      next.preferences.replyStyle = "short";
      learning.preferencesUpdated = true;
    }

    if (/(detalhado|explique mais|mais completo)/.test(safeText)) {
      next.preferences.replyStyle = "detailed";
      learning.preferencesUpdated = true;
    }

    const saveMatch = safeText.match(/salvar\s+([a-zà-ú0-9_\- ]+)\s*:\s*(.+)$/i);
    if (saveMatch) {
      const alias = normalizeAlias(saveMatch[1]);
      const address = normalizeText(saveMatch[2]);

      if (alias && address) {
        const index = next.knownPlaces.findIndex((place) => normalizeAlias(place.alias) === alias);
        const place = {
          alias,
          address,
          updatedAt: new Date().toISOString(),
        };

        if (index >= 0) {
          next.knownPlaces[index] = { ...next.knownPlaces[index], ...place };
        } else {
          next.knownPlaces.unshift(place);
        }

        learning.placeLearned = true;
      }
    }

    if (effectiveDestination && destinationResolved && route) {
      next.routeHistory.unshift({
        destinationText: effectiveDestination,
        resolvedLabel: destinationResolved.label,
        distance: route.distance ?? null,
        duration: route.duration ?? null,
        createdAt: new Date().toISOString(),
      });
      next.routeHistory = next.routeHistory.slice(0, 50);
      learning.routeHistoryUpdated = true;
    }

    if (reply) {
      next.learnedPatterns.unshift({
        type: "last_reply_shape",
        sample: reply.slice(0, 120),
        createdAt: new Date().toISOString(),
      });
      next.learnedPatterns = next.learnedPatterns.slice(0, 50);
    }

    return next;
  });

  return {
    ...learning,
    profile: getUserProfile(userId) || profile || null,
  };
}

export { learnFromInteraction, inferKnownPlaceFromText };