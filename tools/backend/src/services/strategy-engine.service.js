import { getDb, updateDb, pushLimited } from "../lib/store.js";
import { getExecutiveQueue } from "./executive-queue.service.js";
import { getPendingItems } from "./pending-tracker.service.js";

function buildStrategyReport() {
  const queue = getExecutiveQueue();
  const pending = getPendingItems();

  const report = {
    id: `strategy_${Date.now()}`,
    topPriority: queue[0] || null,
    pendingCount: pending.length,
    opportunities: pending.length ? ["reduzir pendências abertas"] : ["manter estabilidade"],
    createdAt: new Date().toISOString()
  };

  updateDb((draft) => {
    draft.strategyReports = pushLimited(draft.strategyReports, report, 100);
    return draft;
  });

  return report;
}

function getStrategyReport() {
  return (getDb().strategyReports || [])[0] || buildStrategyReport();
}

export { buildStrategyReport, getStrategyReport };
