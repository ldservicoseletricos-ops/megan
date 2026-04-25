import { readAutomations, writeAutomations } from '../utils/file-state.js';
export const getAutomations = () => readAutomations();
export function createAutomation(payload) {
  const autos = readAutomations();
  const next = { id: `auto-${String(autos.length + 1).padStart(3, '0')}`, department: payload.department || 'Megan Prime', title: payload.title || 'Nova automação', status: payload.status || 'ready', frequency: payload.frequency || 'daily' };
  const all = [...autos, next];
  writeAutomations(all);
  return next;
}
