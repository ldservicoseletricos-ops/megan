import { getDb, updateDb, pushLimited } from "../lib/store.js";

function registerSelfUpgrade(payload = {}) {
  const item = {
    id: `upgrade_${Date.now()}`,
    target: payload.target || "planner",
    improvement: payload.improvement || "ajuste supervisionado",
    status: payload.status || "suggested",
    createdAt: new Date().toISOString()
  };

  updateDb((draft) => {
    draft.selfUpgrades = pushLimited(draft.selfUpgrades, item, 100);
    return draft;
  });

  return item;
}

function listSelfUpgrades() {
  return getDb().selfUpgrades || [];
}

export { registerSelfUpgrade, listSelfUpgrades };
