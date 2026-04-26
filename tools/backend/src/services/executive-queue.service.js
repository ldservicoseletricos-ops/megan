import { getDb, updateDb } from "../lib/store.js";
import { listProjects } from "./projects.service.js";

function buildExecutiveQueue() {
  const weight = { critical: 4, high: 3, medium: 2, low: 1 };

  const queue = listProjects()
    .map((project) => ({
      id: `queue_${project.projectId}`,
      projectId: project.projectId,
      name: project.name,
      priority: project.priority,
      status: project.status,
      score: (weight[project.priority] || 0) + ((project.tasks || []).length > 3 ? 1 : 0)
    }))
    .sort((a, b) => b.score - a.score);

  updateDb((draft) => {
    draft.executiveQueue = queue;
    return draft;
  });

  return queue;
}

function getExecutiveQueue() {
  const current = getDb().executiveQueue || [];
  return current.length ? current : buildExecutiveQueue();
}

export { buildExecutiveQueue, getExecutiveQueue };
