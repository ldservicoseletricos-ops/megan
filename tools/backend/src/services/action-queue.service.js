function cloneSteps(steps = []) {
  return Array.isArray(steps)
    ? steps.map((step) => ({
        ...step,
        dependsOn: Array.isArray(step.dependsOn) ? [...step.dependsOn] : [],
        attempts: Number(step.attempts || 0),
        result: step.result || null,
      }))
    : [];
}

function createActionQueue(plan = {}) {
  return {
    createdAt: new Date().toISOString(),
    status: "pending",
    steps: cloneSteps(plan.steps || []),
  };
}

function isDependencyDone(queue, dependencyId) {
  const dep = queue.steps.find((item) => item.id === dependencyId);
  return dep ? dep.status === "done" : false;
}

function getNextReadyStep(queue) {
  if (!queue || !Array.isArray(queue.steps)) return null;

  return (
    queue.steps.find((step) => {
      if (step.status !== "ready") return false;
      return (step.dependsOn || []).every((dependencyId) => isDependencyDone(queue, dependencyId));
    }) || null
  );
}

function markStep(queue, stepId, nextStatus, result = null) {
  if (!queue || !Array.isArray(queue.steps)) return queue;

  queue.steps = queue.steps.map((step) => {
    if (step.id !== stepId) return step;

    return {
      ...step,
      attempts: Number(step.attempts || 0) + 1,
      status: nextStatus,
      result,
      updatedAt: new Date().toISOString(),
    };
  });

  const pending = queue.steps.some((step) => step.status === "ready");
  const blocked = queue.steps.some((step) => ["blocked", "needs_location", "needs_destination", "needs_better_destination", "route_failed", "fetch_failed"].includes(step.status));
  const failed = queue.steps.some((step) => step.status === "failed");

  queue.status = failed ? "failed" : pending ? "running" : blocked ? "partial" : "done";
  return queue;
}

function summarizeQueue(queue) {
  const steps = Array.isArray(queue?.steps) ? queue.steps : [];
  return {
    status: queue?.status || "pending",
    totalSteps: steps.length,
    doneSteps: steps.filter((step) => step.status === "done").length,
    readySteps: steps.filter((step) => step.status === "ready").length,
    blockedSteps: steps.filter((step) => ["blocked", "needs_location", "needs_destination", "needs_better_destination", "route_failed", "fetch_failed"].includes(step.status)).length,
    failedSteps: steps.filter((step) => step.status === "failed").length,
  };
}

export { createActionQueue, getNextReadyStep, markStep, summarizeQueue };
