import { getSystemState, updateSystemState, appendImprovementApplied } from "../lib/store.js";

const DEFAULT_FLAGS = {
  compactReplies: false,
  autoOpenMapOnNavigation: true,
  preferWeatherInline: false,
  navigationPriorityBoost: true,
  askLessDuringNavigation: true,
  experimentalToneControl: false,
};

function normalizeFlags(flags) {
  return {
    ...DEFAULT_FLAGS,
    ...(flags && typeof flags === "object" ? flags : {}),
  };
}

export function getFeatureFlags() {
  const system = getSystemState();
  return normalizeFlags(system.featureFlags);
}

export function getEffectiveFeatureFlags(context = {}) {
  const baseFlags = getFeatureFlags();
  const effective = { ...baseFlags };

  if (context.intent === "navigation" || context.intent === "start_navigation") {
    effective.autoOpenMapOnNavigation = true;
  }

  if (context.repeatedFailures >= 2) {
    effective.askLessDuringNavigation = true;
    effective.navigationPriorityBoost = true;
  }

  if (context.userPreference === "compact") {
    effective.compactReplies = true;
  }

  return effective;
}

export function setFeatureFlags(partialFlags, reason = "manual_update") {
  const nextFlags = normalizeFlags(partialFlags);

  const system = updateSystemState((current) => ({
    ...current,
    featureFlags: {
      ...normalizeFlags(current.featureFlags),
      ...nextFlags,
    },
  }));

  appendImprovementApplied({
    type: "feature_flags_update",
    reason,
    flags: nextFlags,
  });

  return normalizeFlags(system.featureFlags);
}

export function applyFeatureFlagPatch(patch = {}, metadata = {}) {
  const before = getFeatureFlags();
  const after = setFeatureFlags(patch, metadata.reason || "auto_patch");

  return {
    before,
    after,
    patch,
    metadata,
  };
}

export function formatReplyByFlags(reply, flags, context = {}) {
  const safeReply = String(reply || "").trim();
  if (!safeReply) return safeReply;

  if (flags.compactReplies && safeReply.length > 95) {
    const compact = safeReply.split(/[.!?]\s+/)[0]?.trim();
    if (compact) {
      return /[.!?]$/.test(compact) ? compact : `${compact}.`;
    }
  }

  if (
    flags.askLessDuringNavigation &&
    (context.intent === "navigation" || context.intent === "start_navigation") &&
    /Pode me dizer melhor|Como quer que eu continue/i.test(safeReply)
  ) {
    return "Diga o destino ou ative sua localização.";
  }

  return safeReply;
}
