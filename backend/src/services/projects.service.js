import { getDb, updateDb } from "../lib/store.js";

function createProject({ projectId, name, description = "", ownerUserId = null, status = "active", priority = "high" } = {}) {
  const finalId = projectId || `proj_${Date.now()}`;
  const db = updateDb((draft) => {
    if (!draft.projects[finalId]) {
      draft.projects[finalId] = {
        projectId: finalId,
        name: name || finalId,
        description,
        ownerUserId,
        status,
        priority,
        tasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    return draft;
  });
  return db.projects[finalId];
}

function listProjects() {
  return Object.values(getDb().projects || {});
}

export { createProject, listProjects };
