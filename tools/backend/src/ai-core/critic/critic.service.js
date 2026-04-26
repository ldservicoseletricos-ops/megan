import { AI_CONFIG } from "../config/ai.config.js";

export function reviewOutput({ classification, execution }) {
  const warnings = [];
  const responseLength = execution.response ? execution.response.length : 0;

  if (responseLength < AI_CONFIG.reviewThresholds.minimumGeneralResponseLength) {
    warnings.push("Resposta curta demais.");
  }

  if (
    classification.complexity === "high" &&
    responseLength < AI_CONFIG.reviewThresholds.minimumComplexResponseLength
  ) {
    warnings.push("Resposta pode estar superficial para tarefa complexa.");
  }

  if (classification.category === "technical_fix" && !execution.response.toLowerCase().includes("plano")) {
    warnings.push("Resposta técnica deveria deixar o plano mais explícito.");
  }

  return {
    warnings,
    passed: warnings.length === 0,
    responseLength
  };
}
