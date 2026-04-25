import { getDb, updateDb, pushLimited } from "../lib/store.js";
import { getExecutiveQueue } from "./executive-queue.service.js";
import { getPendingItems } from "./pending-tracker.service.js";
import { getAutonomousStatus } from "./autonomous-engine.service.js";
import { getGrowthReport } from "./growth-engine.service.js";
import { getSalesReport } from "./sales-engine.service.js";

function buildUnifiedDecision() {
  const queue = getExecutiveQueue();
  const pending = getPendingItems();
  const autonomous = getAutonomousStatus();
  const growth = getGrowthReport();
  const sales = getSalesReport();

  const decision = {
    id: `decision_${Date.now()}`,
    topOperationalPriority: queue[0] || null,
    pendingCount: pending.length,
    autonomousRuns: autonomous.totalRuns || 0,
    growthFocus: growth.focus,
    topOffer: sales.topOffer,
    suggestedAction: queue[0]?.name
      ? `Priorizar ${queue[0].name} e manter oferta ${sales.topOffer}`
      : `Priorizar crescimento com ${sales.topOffer}`,
    createdAt: new Date().toISOString()
  };

  updateDb((draft) => {
    draft.unifiedDecisions = pushLimited(draft.unifiedDecisions, decision, 100);
    return draft;
  });

  return decision;
}

function getUnifiedDecision() {
  return (getDb().unifiedDecisions || [])[0] || buildUnifiedDecision();
}

export { buildUnifiedDecision, getUnifiedDecision };
