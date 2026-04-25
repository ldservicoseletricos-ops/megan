import { readGoals, writeGoals } from '../utils/file-state.js';
export const getGoals = () => readGoals();
export function createGoal(payload) {
  const goals = readGoals();
  const next = { id: `goal-${String(goals.length + 1).padStart(3, '0')}`, department: payload.department || 'Megan Prime', title: payload.title || 'Nova meta', target: payload.target || 'definir', status: payload.status || 'active' };
  const all = [...goals, next];
  writeGoals(all);
  return next;
}
