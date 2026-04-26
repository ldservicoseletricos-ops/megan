import { listQueue, updateQueueTask } from "./persistent-queue.service.js";

export function findResumableTasks(conversationId) {
  return listQueue(conversationId).filter((item) => item.status === "failed");
}

export function resumeFailedTasks(conversationId) {
  const resumable = findResumableTasks(conversationId);

  const resumed = resumable.map((item) =>
    updateQueueTask(item.id, (current) => ({
      ...current,
      status: "queued",
      resumeCount: Number(current.resumeCount || 0) + 1,
      lastError: "",
    }))
  );

  return resumed.filter(Boolean);
}
