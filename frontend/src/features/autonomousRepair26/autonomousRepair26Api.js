import { apiFetch } from '../../lib/api';

export function getAutonomousRepair26Status() {
  return apiFetch('/api/autonomous-repair-26/status');
}

export function runAutonomousRepair26Diagnosis() {
  return apiFetch('/api/autonomous-repair-26/diagnose', { method: 'POST' });
}

export function runAutonomousRepair26Heal() {
  return apiFetch('/api/autonomous-repair-26/heal', { method: 'POST' });
}

export function getAutonomousRepair26Logs() {
  return apiFetch('/api/autonomous-repair-26/logs');
}
