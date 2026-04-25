import { getDb, updateDb, pushLimited } from "../lib/store.js";
import { buildExecutiveQueue } from "./executive-queue.service.js";
import { buildPendingItems } from "./pending-tracker.service.js";

function runAutonomousEngine(payload = {}) {
  const queue = buildExecutiveQueue();
  const pending = buildPendingItems();

  const result = {
    id: `auto_${Date.now()}`,
    trigger: payload.trigger || "manual",
    actions: ["refresh_executive_queue", "refresh_pending_items"],
    queueTop: queue[0] || null,
    pendingCount: pending.length,
    createdAt: new Date().toISOString()
  };

  updateDb((draft) => {
    draft.autonomousRuns = pushLimited(draft.autonomousRuns, result, 100);
    return draft;
  });

  return result;
}

function getAutonomousStatus() {
  return {
    lastRun: (getDb().autonomousRuns || [])[0] || null,
    totalRuns: (getDb().autonomousRuns || []).length
  };
}

export { runAutonomousEngine, getAutonomousStatus };
