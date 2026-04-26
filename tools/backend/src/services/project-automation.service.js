import { getDb, updateDb } from "../lib/store.js";

function ensureProjectAutomation(projectId) {
  const db = getDb();
  if (!db.projectAutomations[projectId]) {
    updateDb((draft) => {
      draft.projectAutomations[projectId] = {
        projectId,
        rules: [],
        runs: [],
        updatedAt: new Date().toISOString()
      };
      return draft;
    });
  }
  return getDb().projectAutomations[projectId];
}

function getProjectAutomation(projectId) {
  return ensureProjectAutomation(projectId);
}

export { ensureProjectAutomation, getProjectAutomation };
