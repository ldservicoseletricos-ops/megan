import { env } from '../config/env.js';

const decisions = [
  { id: 'decision-001', title: 'Priorizar integração Supabase', priority: 'alta', status: 'pending' },
  { id: 'decision-002', title: 'Ativar deploy supervisionado', priority: 'alta', status: 'pending' },
  { id: 'decision-003', title: 'Preparar campanha de lançamento', priority: 'media', status: 'planned' },
];

const tasks = [
  { id: 'task-001', title: 'Validar backend online', owner: 'operations', status: 'running' },
  { id: 'task-002', title: 'Revisar painel executivo', owner: 'admin', status: 'planned' },
  { id: 'task-003', title: 'Preparar billing base', owner: 'billing', status: 'planned' },
];

export function getExecutiveOverview() {
  return {
    project: 'Megan Master Fase 7 Autonomia Empresarial Real',
    status: 'autonomy_base_online',
    integrations: {
      supabase: Boolean(env.supabaseUrl && env.supabaseServiceRoleKey),
      database: Boolean(env.databaseUrl),
      gemini: Boolean(env.geminiApiKey),
      stripe: Boolean(env.stripeSecretKey),
      render: Boolean(env.renderDeployHookUrl),
      vercel: Boolean(env.vercelDeployHookUrl && env.vercelToken && env.vercelProjectId),
    },
    departments: [
      { key: 'admin', status: 'online' },
      { key: 'billing', status: 'base' },
      { key: 'memory', status: 'base' },
      { key: 'auth', status: 'base' },
      { key: 'ai-core', status: 'base' },
      { key: 'operations', status: 'online' },
      { key: 'marketing', status: 'planned' },
    ],
    decisions,
    tasks,
    timestamp: new Date().toISOString(),
  };
}

export function getDecisionQueue() {
  return decisions;
}

export function getOperationalTasks() {
  return tasks;
}
