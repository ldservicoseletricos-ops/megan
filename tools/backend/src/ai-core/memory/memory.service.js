import { findMemoriesByLayer, insertMemory } from "../../db/repositories/ai-memory.repository.js";
import { getSessionMemories, saveSessionMemory } from "./layers/session-memory.js";
import { getProfileMemories, saveProfileMemory } from "./layers/profile-memory.js";

const repository = {
  findByLayer: findMemoriesByLayer,
  insert: insertMemory
};

function extractPreferenceHints(profileMemories = []) {
  const text = JSON.stringify(profileMemories).toLowerCase();
  const explicitPreferences = [];
  const profileHints = [];

  if (text.includes("arquivo completo") || text.includes("completo para colar") || text.includes("pronto para colar")) {
    explicitPreferences.push("respostas completas prontas para colar");
    profileHints.push("ready_to_apply");
  }

  if (text.includes("passo a passo")) {
    explicitPreferences.push("explicações passo a passo");
    profileHints.push("guided");
  }

  return {
    explicitPreferences: [...new Set(explicitPreferences)],
    profileHints: [...new Set(profileHints)]
  };
}

export function retrieveMemory({ userId, sessionId }) {
  const safeUserId = userId || "anonymous";
  const safeSessionId = sessionId || "default-session";

  const sessionMemories = getSessionMemories({
    repository,
    userId: safeUserId,
    sessionId: safeSessionId
  });

  const profileMemories = getProfileMemories({
    repository,
    userId: safeUserId
  });

  const preferenceHints = extractPreferenceHints(profileMemories);

  return {
    sessionMemories,
    profileMemories,
    explicitPreferences: preferenceHints.explicitPreferences,
    profileHints: preferenceHints.profileHints,
    summary: {
      sessionCount: Array.isArray(sessionMemories) ? sessionMemories.length : 0,
      profileCount: Array.isArray(profileMemories) ? profileMemories.length : 0
    }
  };
}

export function persistCoreMemories({ userId, sessionId, message, result }) {
  const safeUserId = userId || "anonymous";
  const safeSessionId = sessionId || "default-session";
  const safeMessage = String(message || "");

  const classification = result?.classification || {};
  const evaluation = result?.evaluation || {};
  const adaptiveProfile = result?.adaptiveContext?.adaptiveProfile || {};

  saveSessionMemory({
    repository,
    entry: {
      userId: safeUserId,
      sessionId: safeSessionId,
      key: "last_interaction_message",
      value: {
        message: safeMessage,
        category: classification.category || "unknown",
        score: typeof evaluation.finalScore === "number" ? evaluation.finalScore : 0,
        selectedMode: adaptiveProfile.selectedMode || "adaptive_balanced"
      }
    }
  });

  const normalizedMessage = safeMessage.toLowerCase();

  const needsProfileRule =
    normalizedMessage.includes("arquivo completo") ||
    normalizedMessage.includes("pronto para colar") ||
    normalizedMessage.includes("completo para colar") ||
    normalizedMessage.includes("colar");

  if (needsProfileRule) {
    saveProfileMemory({
      repository,
      entry: {
        userId: safeUserId,
        key: "response_preference_full_file",
        value: {
          enabled: true,
          reason: "Usuário pediu conteúdo completo para colar."
        }
      }
    });
  }

  if (adaptiveProfile.selectedMode) {
    saveProfileMemory({
      repository,
      entry: {
        userId: safeUserId,
        key: "last_adaptive_mode",
        value: {
          selectedMode: adaptiveProfile.selectedMode,
          responseFrame: adaptiveProfile.responseFrame || "balanced_assistance"
        }
      }
    });
  }
}
