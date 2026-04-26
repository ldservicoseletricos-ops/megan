import { listAgentGoals, upsertAgentGoal } from "../lib/store.js";

function normalizeText(value) {
  return String(value || "").trim();
}

function buildGoal(agent, key, label, priority, details = {}) {
  return {
    agent,
    key,
    scope: details.scope || "global",
    label,
    priority,
    status: details.status || "active",
    metadata: details.metadata || {},
  };
}

export function syncAgentGoals(context = {}) {
  const goals = [];
  const intent = String(context.intent || "general");
  const hasLocation = Boolean(context.route || context.weather || context.destinationResolved || context.deviceLocation);
  const hasDestination = Boolean(normalizeText(context.destinationText) || context.destinationResolved);
  const repeatedRouteNeed = intent === "navigation";

  if (repeatedRouteNeed) {
    goals.push(
      buildGoal("navigation", "navigation_flow", "Conduzir o usuário com baixa fricção", 92, {
        scope: "conversation",
        metadata: {
          needsDestination: !hasDestination,
          needsLocation: !Boolean(context.deviceLocation),
          hasRoute: Boolean(context.route),
        },
      })
    );
  }

  if (/(clima|tempo|chuva|temperatura)/i.test(normalizeText(context.text))) {
    goals.push(
      buildGoal("weather", "weather_context", "Responder clima sem atrapalhar a ação principal", 68, {
        scope: "conversation",
      })
    );
  }

  goals.push(
    buildGoal("response", "clarity", "Responder com clareza e objetividade", intent === "navigation" ? 74 : 58, {
      scope: "global",
      metadata: { shortReplyPreferred: Boolean(context.strategy?.shouldKeepReplyShort) },
    })
  );

  if (context.conversation?.memory?.currentGoal) {
    goals.push(
      buildGoal("memory", "preserve_context", "Preservar objetivo atual da conversa", 61, {
        scope: "conversation",
        metadata: { currentGoal: context.conversation.memory.currentGoal },
      })
    );
  }

  if (Array.isArray(context.consensus?.dominantAgents) && context.consensus.dominantAgents.includes("improvement")) {
    goals.push(
      buildGoal("improvement", "reduce_friction", "Reduzir falhas repetidas", 72, {
        scope: "conversation",
        metadata: { repeatedFailures: true },
      })
    );
  }

  const stored = goals.map((goal) => upsertAgentGoal(goal));

  if (!stored.length) {
    return listAgentGoals({ status: "active" }).slice(-5);
  }

  return stored.sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0));
}
