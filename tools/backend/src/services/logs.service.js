import { readLogs, writeLogs } from '../utils/file-state.js';
export const getLogs = () => readLogs();
export function appendLog(payload) {
  const logs = readLogs();
  const nextLog = { id: `log-${String(logs.length + 1).padStart(3, '0')}`, level: payload.level || 'info', message: payload.message || 'Novo log Megan' };
  const next = [...logs, nextLog];
  writeLogs(next);
  return nextLog;
}
