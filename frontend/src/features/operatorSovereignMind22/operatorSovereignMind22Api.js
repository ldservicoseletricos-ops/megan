import { apiFetch } from '../../lib/api';
export const getSovereignStatus = () => apiFetch('/api/operator-sovereign-mind-22/status');
export const auditSovereignSystem = () => apiFetch('/api/operator-sovereign-mind-22/audit');
export const getSovereignTasks = () => apiFetch('/api/operator-sovereign-mind-22/tasks');
export const getSovereignDecisions = () => apiFetch('/api/operator-sovereign-mind-22/decisions');
export const sendSovereignMessage = (message, approval = null) => apiFetch('/api/operator-sovereign-mind-22/chat', { method: 'POST', body: JSON.stringify({ message, approval }) });
