import { getDb, updateDb, pushLimited } from "../lib/store.js";
import { getExecutiveQueue } from "./executive-queue.service.js";
import { getPendingItems } from "./pending-tracker.service.js";
import { getStrategyReport } from "./strategy-engine.service.js";

function buildCeoPanel() {
  const queue = getExecutiveQueue();
  const pending = getPendingItems();
  const strategy = getStrategyReport();

  const panel = {
    id: `ceo_${Date.now()}`,
    topPriority: queue[0] || null,
    pendingCount: pending.length,
    opportunities: strategy.opportunities || [],
    summary: pending.length
      ? `Há ${pending.length} pendências e a prioridade atual é ${queue[0]?.name || "indefinida"}.`
      : "Sem pendências críticas no momento.",
    createdAt: new Date().toISOString()
  };

  updateDb((draft) => {
    draft.ceoPanels = pushLimited(draft.ceoPanels, panel, 100);
    return draft;
  });

  return panel;
}

function getCeoPanel() {
  return (getDb().ceoPanels || [])[0] || buildCeoPanel();
}

export { buildCeoPanel, getCeoPanel };
