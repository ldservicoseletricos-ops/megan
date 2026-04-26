import { getUserProfile } from "./user-profile.service.js";
import { getPersonalizedSettings } from "./personalization.service.js";
import { getUserMemory } from "./user-memory.service.js";

function runProfileAgents(userId = "default", message = "", permissions = {}) {
  const profile = getUserProfile(userId);
  const settings = getPersonalizedSettings(userId);
  const memory = getUserMemory(userId);

  const agents = {
    profileAgent: { role: profile.role || "user", preferredMode: profile.preferredMode },
    personalizationAgent: { responseStyle: settings.responseStyle, mode: settings.mode },
    memoryAgent: { factsCount: (memory.facts || []).length, aliasesCount: Object.keys(memory.aliases || {}).length },
    permissionAgent: { permissions }
  };

  const lower = String(message || "").toLowerCase();
  let consensus = "response";
  if (lower.includes("centro de comando") || lower.includes("command center") || lower.includes("decisão")) consensus = "unified";
  else if (lower.includes("meta") || lower.includes("crescimento") || lower.includes("vendas") || lower.includes("marketing")) consensus = "business";
  else if (lower.includes("autônoma") || lower.includes("autonoma")) consensus = "autonomous";
  else if (lower.includes("executivo")) consensus = "executive";

  return { agents, consensus };
}

export { runProfileAgents };
