import { upsertBrainPerformance, listBrainPerformance } from "../../db/repositories/brain-performance.repository.js";

export function registerSwarmPerformance({ ranking = [], winnerBrainId = null }) {
  return ranking.map((item) =>
    upsertBrainPerformance({
      brainId: item.brainId,
      score: item.score,
      won: item.brainId === winnerBrainId
    })
  );
}

export function getBrainPerformanceOverview() {
  const ranking = listBrainPerformance();

  return {
    topBrains: ranking.slice(0, 10),
    totalBrainsTracked: ranking.length
  };
}
