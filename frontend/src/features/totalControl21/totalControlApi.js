import { apiFetch } from '../../lib/api';
export function getTotalControlStatus() { return apiFetch('/api/total-control-21/status'); }
export function auditTotalControlSystem() { return apiFetch('/api/total-control-21/audit'); }
export function sendTotalControlMessage(message, approval = null) { return apiFetch('/api/total-control-21/chat', { method: 'POST', body: JSON.stringify({ message, approval }) }); }
export function getTotalControlTasks() { return apiFetch('/api/total-control-21/tasks'); }
