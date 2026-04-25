import { getDb, updateDb } from "../lib/store.js";
import { listProjects } from "./projects.service.js";

function buildPendingItems() {
  const items = [];

  for (const project of listProjects()) {
    const tasks = project.tasks || [];
    const openTasks = tasks.filter((item) => item.status !== "done");
    if (openTasks.length) {
      items.push({
        id: `pending_open_${project.projectId}`,
        type: "open_tasks",
        projectId: project.projectId,
        projectName: project.name,
        count: openTasks.length
      });
    }
  }

  updateDb((draft) => {
    draft.pendingItems = items;
    return draft;
  });

  return items;
}

function getPendingItems() {
  const current = getDb().pendingItems || [];
  return current.length ? current : buildPendingItems();
}

export { buildPendingItems, getPendingItems };
