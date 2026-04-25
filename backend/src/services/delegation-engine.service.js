import { getDb, updateDb } from "../lib/store.js";
import { getProject, addProjectTask } from "./projects.service.js";

function delegateTask({ projectId, title, assignedTo = null, priority = "high", reason = "manual" } = {}) {
  const project = getProject(projectId);
  if (!project || !title) return null;

  addProjectTask(projectId, {
    title,
    assignedTo,
    status: "pending"
  });

  return updateDb((draft) => {
    draft.delegationRuns.unshift({
      id: `deleg_${Date.now()}`,
      projectId,
      title,
      assignedTo,
      priority,
      reason,
      createdAt: new Date().toISOString()
    });
    draft.delegationRuns = draft.delegationRuns.slice(0, 100);
    return draft;
  }).delegationRuns[0];
}

function listDelegations() {
  return getDb().delegationRuns || [];
}

export { delegateTask, listDelegations };
