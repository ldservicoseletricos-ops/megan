export function calculateProgress({ tasks = [], hasRoute = false, hasWeather = false } = {}) {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  if (!safeTasks.length) {
    return { progress: hasRoute || hasWeather ? 60 : 20, completed: 0, total: 0 };
  }

  const completed = safeTasks.filter((task) => task.status === "done").length;
  const ready = safeTasks.filter((task) => task.status === "ready").length;
  const total = safeTasks.length;
  const progress = Math.max(5, Math.min(100, Math.round(((completed + ready * 0.5) / total) * 100)));

  return { progress, completed, total };
}
