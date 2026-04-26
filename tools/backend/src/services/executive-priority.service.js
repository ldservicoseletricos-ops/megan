import { getDb, updateDb } from "../lib/store.js";
import { listProjects } from "./projects.service.js";

function buildExecutivePriorities(teamId = null) {
  const projects = listProjects().filter((item) => !teamId || item.teamId === teamId);
  const weight = { critical: 4, high: 3, medium: 2, low: 1 };

  const ranked = [...projects]
    .sort((a, b) => (weight[b.priority] || 0) - (weight[a.priority] || 0))
    .map((project, index) => ({
      rank: index + 1,
      projectId: project.projectId,
      name: project.name,
      priority: project.priority,
      status: project.status
    }));

  const key = teamId || "global";

  updateDb((draft) => {
    draft.executivePriorities[key] = {
      scope: key,
      items: ranked,
      generatedAt: new Date().toISOString()
    };
    return draft;
  });

  return getDb().executivePriorities[key];
}

function getExecutivePriorities(teamId = null) {
  const key = teamId || "global";
  return getDb().executivePriorities[key] || buildExecutivePriorities(teamId);
}

export { buildExecutivePriorities, getExecutivePriorities };
