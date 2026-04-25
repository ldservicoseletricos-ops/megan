import { apiGet, apiPost } from '../../../lib/api';

export function getAgentsDashboard() {
  return apiGet('/api/agents/dashboard');
}

export function createAgentPlan(message) {
  return apiPost('/api/agents/plan', { message });
}

export function runAgentMission(message) {
  return apiPost('/api/agents/run', { message });
}

export function orchestrateAgentMission(message) {
  return apiPost('/api/agents/orchestrate', { message });
}

export function createAgentConsensus(message) {
  return apiPost('/api/agents/consensus', { message });
}

export function createAgentTimeline(message) {
  return apiPost('/api/agents/timeline', { message });
}
