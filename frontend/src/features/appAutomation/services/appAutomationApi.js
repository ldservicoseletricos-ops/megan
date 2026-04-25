import { apiGet, apiPost } from '../../../lib/api';
export const getAppAutomationDashboard = () => apiGet('/api/app-automation/dashboard');
export const createAppWorkflow = (goal) => apiPost('/api/app-automation/workflow', { goal });
export const runAppAutomation = (command) => apiPost('/api/app-automation/run', command);
export const getAppAutomationHistory = () => apiGet('/api/app-automation/history');
