import { listFailurePatterns, recordFailurePattern } from "../lib/store.js";

function normalizeText(value) {
  return String(value || "").trim();
}

function buildFailureEntries({
  intent,
  plan,
  text,
  hasLocation,
  hasDestinationResolved,
  hasRoute,
  hasWeather,
}) {
  const failures = [];
  const actions = Array.isArray(plan?.actions) ? plan.actions : [];

  for (const action of actions) {
    if (action.status && action.status !== "ready") {
      failures.push({
        signature: `${action.type}:${action.status}`,
        area: intent === "navigation" ? "navigation" : action.type,
        metadata: {
          type: action.type,
          status: action.status,
          priority: action.priority,
        },
      });
    }
  }

  if (!hasLocation && (intent === "navigation" || intent === "weather")) {
    failures.push({
      signature: `${intent}:needs_location`,
      area: intent,
      metadata: { intent },
    });
  }

  if (!hasDestinationResolved && intent === "navigation") {
    failures.push({
      signature: "navigation:destination_not_resolved",
      area: "navigation",
      metadata: { intent },
    });
  }

  if (!hasRoute && intent === "navigation" && hasDestinationResolved && hasLocation) {
    failures.push({
      signature: "navigation:route_not_ready",
      area: "navigation",
      metadata: { intent },
    });
  }

  if (!hasWeather && intent === "weather") {
    failures.push({
      signature: "weather:data_not_ready",
      area: "weather",
      metadata: { intent },
    });
  }

  return failures.map((item) => ({
    ...item,
    sampleMessage: normalizeText(text),
  }));
}

function listRelevantFailures({ userId, conversationId, intent, text, limit = 10 }) {
  const safeText = normalizeText(text).toLowerCase();
  const area = intent === "general" ? undefined : intent;
  const byUser = listFailurePatterns({ userId, area, limit: Math.max(limit, 10) });
  const byConversation = conversationId
    ? listFailurePatterns({ userId, conversationId, limit: Math.max(limit, 10) })
    : [];

  const merged = [...byConversation, ...byUser];
  const seen = new Set();

  return merged
    .filter((item) => {
      if (!item?.id || seen.has(item.id)) return false;
      seen.add(item.id);

      if (!safeText) return true;

      return (
        String(item.signature || "").includes(intent) ||
        String(item.sampleMessage || "").toLowerCase().includes(safeText.slice(0, 16)) ||
        Number(item.count || 0) >= 2
      );
    })
    .slice(0, limit);
}

function recordFailureMemory({
  userId,
  conversationId,
  intent,
  text,
  plan,
  hasLocation,
  hasDestinationResolved,
  hasRoute,
  hasWeather,
}) {
  const failureEntries = buildFailureEntries({
    intent,
    plan,
    text,
    hasLocation,
    hasDestinationResolved,
    hasRoute,
    hasWeather,
  });

  const recordedFailures = failureEntries.map((entry) =>
    recordFailurePattern({
      ...entry,
      userId,
      conversationId,
      scope: "conversation",
    })
  );

  const recurringFailures = listRelevantFailures({
    userId,
    conversationId,
    intent,
    text,
    limit: 10,
  });

  return {
    recordedFailures,
    recurringFailures,
    failureCount: recordedFailures.length,
  };
}

export { recordFailureMemory, listRelevantFailures };