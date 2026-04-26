import { getDb, updateDb } from "../lib/store.js";
import { getProjectDashboard } from "./project-dashboard.service.js";

function runOperationalSupervisor(projectId) {
  const dashboard = getProjectDashboard(projectId);
  if (!dashboard) return null;

  const status = {
    projectId,
    blocker: dashboard.blocker,
    nextStep: dashboard.nextStep,
    openTasksCount: dashboard.openTasksCount,
    riskLevel: dashboard.blocker ? "high" : dashboard.openTasksCount > 5 ? "medium" : "low",
    reviewedAt: new Date().toISOString()
  };

  updateDb((draft) => {
    draft.operationalSupervision[projectId] = status;
    return draft;
  });

  return status;
}

function getOperationalSupervisor(projectId) {
  return getDb().operationalSupervision[projectId] || runOperationalSupervisor(projectId);
}

export { runOperationalSupervisor, getOperationalSupervisor };
