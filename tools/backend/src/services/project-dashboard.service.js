import { getDb, updateDb } from "../lib/store.js";
import { getProject } from "./projects.service.js";
import { getProjectMemory } from "./project-memory.service.js";

function buildProjectDashboard(projectId) {
  const project = getProject(projectId);
  const memory = getProjectMemory(projectId);
  if (!project) return null;

  const dashboard = {
    projectId,
    projectName: project.name,
    status: project.status,
    priority: project.priority,
    blocker: (memory.blockers || [])[0] || null,
    nextStep: (memory.nextSteps || [])[0] || null,
    openTasksCount: (project.tasks || []).filter((item) => item.status !== "done").length,
    generatedAt: new Date().toISOString()
  };

  updateDb((draft) => {
    draft.projectDashboards[projectId] = dashboard;
    return draft;
  });

  return dashboard;
}

function getProjectDashboard(projectId) {
  const db = getDb();
  return db.projectDashboards[projectId] || buildProjectDashboard(projectId);
}

export { buildProjectDashboard, getProjectDashboard };
