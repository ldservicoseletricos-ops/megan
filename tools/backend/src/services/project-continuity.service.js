export function inferProjectContinuity({
  message = "",
  memory = {}
} = {}) {
  const text = String(message || "").trim();
  const lower = text.toLowerCase();

  const activeProjectId = memory?.activeProjectId || "default";
  const currentProject = memory?.projects?.[activeProjectId] || {};

  let objective = currentProject?.objective || "";
  let currentProblem = currentProject?.currentProblem || "";
  let nextStep = currentProject?.nextStep || "";

  if (lower.includes("objetivo")) {
    objective = text;
  }

  if (lower.includes("problema") || lower.includes("erro")) {
    currentProblem = text;
  }

  if (lower.includes("próximo passo") || lower.includes("proximo passo")) {
    nextStep = text;
  }

  return {
    activeProjectId,
    objective,
    currentProblem,
    nextStep
  };
}
