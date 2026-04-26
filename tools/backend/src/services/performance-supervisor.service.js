import { getDb, updateDb, pushLimited } from "../lib/store.js";

function createPerformanceSnapshot(payload = {}) {
  const entry = {
    id: `perf_${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...payload
  };

  updateDb((draft) => {
    draft.performanceSnapshots = pushLimited(draft.performanceSnapshots, entry, 100);
    return draft;
  });

  return entry;
}

function listPerformanceSnapshots() {
  return getDb().performanceSnapshots || [];
}

export { createPerformanceSnapshot, listPerformanceSnapshots };
