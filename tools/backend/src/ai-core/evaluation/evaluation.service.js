import { calculateFinalScore } from "./score-calculator.js";

export function evaluateInteraction({ classification, criticReview, activeRules, response }) {
  const understanding = 0.9;
  const planning = classification.complexity === "high" ? 0.92 : 0.88;
  const execution = response.length > 120 ? 0.9 : 0.8;
  const communication = criticReview.warnings.length === 0 ? 0.95 : 0.82;
  const alignment = activeRules.length >= 3 ? 0.96 : 0.85;
  const safety = classification.riskLevel === "low" ? 0.97 : 0.9;

  const finalScore = calculateFinalScore({
    understanding,
    planning,
    execution,
    communication,
    alignment,
    safety
  });

  return {
    understanding,
    planning,
    execution,
    communication,
    alignment,
    safety,
    finalScore
  };
}
