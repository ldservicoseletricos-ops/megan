import { readTasks, writeTasks } from '../utils/file-state.js';
export const getTasks = () => readTasks();
export function createTask(payload) {
  const tasks = readTasks();
  const nextTask = { id: `task-${String(tasks.length + 1).padStart(3, '0')}`, title: payload.title || 'Nova task', status: payload.status || 'pending', owner: payload.owner || 'Megan Ops AI', priority: payload.priority || 'medium' };
  const next = [...tasks, nextTask];
  writeTasks(next);
  return nextTask;
}
