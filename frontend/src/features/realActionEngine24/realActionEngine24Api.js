import { apiFetch } from '../../lib/api';

export const getRealActionStatus = () => apiFetch('/api/real-action-engine-24/status');
export const getRealActionHistory = () => apiFetch('/api/real-action-engine-24/history');
export const getAllowedActions = () => apiFetch('/api/real-action-engine-24/actions');
export const sendRealActionMessage = (message, approval = null) => apiFetch('/api/real-action-engine-24/chat', {
  method: 'POST',
  body: JSON.stringify({ message, approval })
});
export const executeRealAction = (actionId, approval = null) => apiFetch('/api/real-action-engine-24/execute', {
  method: 'POST',
  body: JSON.stringify({ actionId, approval })
});
