const ALLOWED_AUTO_FLAGS = new Set([
  "compactReplies",
  "autoOpenMapOnNavigation",
  "preferWeatherInline",
  "navigationPriorityBoost",
  "askLessDuringNavigation",
  "experimentalToneControl",
]);

const BLOCKED_SCOPES = new Set([
  "auth",
  "payments",
  "database_schema",
  "critical_navigation_core",
  "deploy",
  "data_deletion",
]);

export function scoreImprovementRisk(improvement = {}) {
  const patch = improvement.patch && typeof improvement.patch === "object" ? improvement.patch : {};
  const scope = String(improvement.scope || "behavior").trim();
  let score = 0.12;

  const keys = Object.keys(patch);
  if (keys.length > 2) score += 0.1;
  if (scope === "planner") score += 0.12;
  if (scope === "behavior") score += 0.04;
  if (scope === "navigation") score += 0.08;
  if (improvement.trigger === "repeated_failure") score += 0.05;
  if (!improvement.reversible) score += 0.2;

  return Math.min(0.95, Number(score.toFixed(2)));
}

export function evaluateImprovementPolicy(improvement = {}) {
  const scope = String(improvement.scope || "behavior").trim();
  const patch = improvement.patch && typeof improvement.patch === "object" ? improvement.patch : {};
  const keys = Object.keys(patch);
  const unknownFlags = keys.filter((key) => !ALLOWED_AUTO_FLAGS.has(key));
  const blocked = BLOCKED_SCOPES.has(scope);
  const risk = scoreImprovementRisk(improvement);

  const approvedAutomatically = !blocked && unknownFlags.length === 0 && risk <= 0.34;

  return {
    blocked,
    approvedAutomatically,
    risk,
    unknownFlags,
    rationale: blocked
      ? "Escopo crítico bloqueado para autoaplicação."
      : unknownFlags.length
      ? "Patch contém flags desconhecidas."
      : approvedAutomatically
      ? "Mudança segura e reversível."
      : "Mudança exige aprovação manual.",
  };
}

export function buildExperimentPolicySnapshot(improvement = {}) {
  const evaluation = evaluateImprovementPolicy(improvement);

  return {
    scope: improvement.scope || "behavior",
    reversible: improvement.reversible !== false,
    approvedAutomatically: evaluation.approvedAutomatically,
    risk: evaluation.risk,
    blocked: evaluation.blocked,
    rationale: evaluation.rationale,
  };
}
