import { listInteractions } from "../../db/repositories/interaction.repository.js";
import { insertAdaptationHistory, listAdaptationHistory } from "../../db/repositories/adaptation-history.repository.js";
import { getUserProfile, listUserProfiles, upsertUserProfile } from "../../db/repositories/user-profile.repository.js";
import { getSystemState, updateSystemState } from "../../db/repositories/system-state.repository.js";
import { listInternalGoals } from "../../db/repositories/internal-goal.repository.js";
import { buildUserProfile } from "./user-profile-engine.js";
import { selectAdaptiveProfile } from "./adaptive-profile-selector.js";
import { prioritizeAdaptiveFocus } from "./prioritization-engine.js";

export function resolveUserAdaptation({ userId, classification, memory, context = {} }) {
  const interactions = listInteractions();
  const activeGoals = listInternalGoals({ status: "active" });
  const existingProfile = getUserProfile(userId);
  const derivedProfile = buildUserProfile({
    userId,
    interactions,
    memory: {
      explicitPreferences: memory?.explicitPreferences || [],
      profileHints: memory?.profileHints || []
    }
  });

  const mergedProfile = upsertUserProfile({
    ...(existingProfile || {}),
    ...derivedProfile,
    userId
  });

  const systemState = getSystemState();
  const priorities = prioritizeAdaptiveFocus({
    diagnostics: systemState.lastDiagnostics || {},
    activeGoals,
    userProfile: mergedProfile
  });

  const selection = selectAdaptiveProfile({
    classification,
    userProfile: mergedProfile,
    context,
    activeGoals,
    priorities
  });

  const historyEntry = insertAdaptationHistory({
    userId,
    selectedMode: selection.selectedMode,
    responseFrame: selection.responseFrame,
    reasons: selection.reasons,
    priorities: priorities.map((item) => item.slug),
    profileConfidence: mergedProfile.confidence
  });

  updateSystemState({
    lastPriorities: priorities,
    lastAdaptiveReviewAt: new Date().toISOString(),
    autonomyLevel: "personalized-goal-driven"
  });

  return {
    userProfile: mergedProfile,
    adaptiveProfile: selection,
    priorities,
    adaptationHistoryEntry: historyEntry
  };
}

export function getUserAdaptationOverview(userId) {
  return {
    profile: getUserProfile(userId),
    recentAdaptations: listAdaptationHistory({ userId }).slice(-10)
  };
}

export function getGlobalAdaptationOverview() {
  return {
    profiles: listUserProfiles().slice(-20),
    recentAdaptations: listAdaptationHistory().slice(-20)
  };
}
