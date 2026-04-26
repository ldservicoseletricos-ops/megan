import { AI_CONFIG } from "../config/ai.config.js";

export function calculateFinalScore(scores) {
  const weights = AI_CONFIG.scoringWeights;
  const weightedTotal =
    (Number(scores.understanding) || 0) * weights.understanding +
    (Number(scores.planning) || 0) * weights.planning +
    (Number(scores.execution) || 0) * weights.execution +
    (Number(scores.communication) || 0) * weights.communication +
    (Number(scores.alignment) || 0) * weights.alignment +
    (Number(scores.safety) || 0) * weights.safety;

  return Number(weightedTotal.toFixed(3));
}
