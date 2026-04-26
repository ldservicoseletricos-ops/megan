import { env } from '../config/env.js';

const routines = [
  { id: 'routine-001', title: 'Verificar backend online', frequency: '5 min', status: 'running' },
  { id: 'routine-002', title: 'Monitorar integrações', frequency: '15 min', status: 'running' },
  { id: 'routine-003', title: 'Revisar fila de decisões', frequency: '30 min', status: 'planned' },
];

const alerts = [
  { id: 'alert-001', title: 'Supabase ainda não configurado', level: 'warning', active: !Boolean(env.supabaseUrl && env.supabaseServiceRoleKey) },
  { id: 'alert-002', title: 'Render hook pendente', level: 'warning', active: !Boolean(env.renderDeployHookUrl) },
  { id: 'alert-003', title: 'Vercel hook pendente', level: 'warning', active: !Boolean(env.vercelDeployHookUrl && env.vercelToken && env.vercelProjectId) },
];

export function getOperationsOverview() {
  return {
    project: 'Megan Master Fase 8 Operação Contínua 24H',
    status: 'continuous_operation_base',
    uptimeMode: '24h_base',
    integrations: {
      supabase: Boolean(env.supabaseUrl && env.supabaseServiceRoleKey),
      database: Boolean(env.databaseUrl),
      gemini: Boolean(env.geminiApiKey),
      stripe: Boolean(env.stripeSecretKey),
      render: Boolean(env.renderDeployHookUrl),
      vercel: Boolean(env.vercelDeployHookUrl && env.vercelToken && env.vercelProjectId),
    },
    routines,
    alerts,
    timestamp: new Date().toISOString(),
  };
}

export function getRoutines() {
  return routines;
}

export function getAlerts() {
  return alerts;
}
