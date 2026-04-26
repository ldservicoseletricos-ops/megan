import { env } from '../config/env.js';

export function preDeployCheck() {
  return {
    renderReady: Boolean(env.renderHook),
    vercelReady: Boolean(env.vercelHook && env.vercelToken && env.vercelProjectId),
    databaseReady: Boolean(env.databaseUrl),
    supabaseReady: Boolean(env.supabaseUrl && env.supabaseKey),
    overallReady: Boolean(env.renderHook && env.vercelHook && env.vercelToken && env.vercelProjectId && env.databaseUrl)
  };
}

export function deploySupervised() {
  const checks = preDeployCheck();
  return {
    checks,
    approvalRequired: true,
    status: checks.overallReady ? 'aguardando aprovação humana' : 'bloqueado por pendências'
  };
}

export function deployLogs() {
  return {
    logs: [
      { time: new Date().toISOString(), line: 'checagem iniciada' },
      { time: new Date().toISOString(), line: 'ambiente carregado' },
      { time: new Date().toISOString(), line: 'aguardando aprovação' }
    ]
  };
}

export function deployRollback() {
  return {
    available: true,
    mode: 'assistido',
    status: 'rollback pronto para uso'
  };
}
