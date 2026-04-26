import { getProject } from "./projects.service.js";
import { getProjectMemory } from "./project-memory.service.js";

function buildProjectPlan(projectId) {
  const project = getProject(projectId);
  const memory = getProjectMemory(projectId);
  if (!project) return null;

  return {
    projectId,
    projectName: project.name,
    status: project.status,
    priority: project.priority,
    blockers: memory.blockers || [],
    nextSteps: memory.nextSteps || [],
    openTasks: (project.tasks || []).filter((item) => item.status !== "done")
  };
}

export { buildProjectPlan };
