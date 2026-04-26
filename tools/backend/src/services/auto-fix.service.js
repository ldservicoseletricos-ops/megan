import { getEnvChecklist, getReadiness } from './env-check.service.js';

export function getAutoFixSuggestions() {
  const checklist = getEnvChecklist();
  const readiness = getReadiness(checklist);
  const suggestions = [];

  if (!checklist.SUPABASE_URL) suggestions.push({ id: 'fix-001', problem: 'SUPABASE_URL ausente', action: 'Preencher SUPABASE_URL no backend/.env', priority: 'alta', impact: 'backend não conecta' });
  if (!checklist.SUPABASE_SERVICE_ROLE_KEY) suggestions.push({ id: 'fix-002', problem: 'SUPABASE_SERVICE_ROLE_KEY ausente', action: 'Preencher SUPABASE_SERVICE_ROLE_KEY no backend/.env', priority: 'alta', impact: 'sem acesso ao Supabase' });
  if (!checklist.DATABASE_URL) suggestions.push({ id: 'fix-003', problem: 'DATABASE_URL ausente', action: 'Preencher DATABASE_URL no backend/.env', priority: 'alta', impact: 'persistência indisponível' });
  if (!checklist.GEMINI_API_KEY) suggestions.push({ id: 'fix-004', problem: 'GEMINI_API_KEY ausente', action: 'Preencher GEMINI_API_KEY no backend/.env', priority: 'alta', impact: 'IA indisponível' });
  if (!checklist.JWT_SECRET) suggestions.push({ id: 'fix-005', problem: 'JWT_SECRET ausente', action: 'Preencher JWT_SECRET no backend/.env', priority: 'alta', impact: 'auth inseguro' });
  if (!checklist.RENDER_DEPLOY_HOOK_URL) suggestions.push({ id: 'fix-006', problem: 'RENDER_DEPLOY_HOOK_URL ausente', action: 'Criar deploy hook no Render', priority: 'média', impact: 'deploy backend manual' });
  if (!checklist.VERCEL_DEPLOY_HOOK_URL || !checklist.VERCEL_TOKEN || !checklist.VERCEL_PROJECT_ID) suggestions.push({ id: 'fix-007', problem: 'Dados da Vercel incompletos', action: 'Preencher variáveis Vercel no backend/.env', priority: 'média', impact: 'deploy frontend manual' });

  return {
    checklist,
    readiness,
    suggestions,
    autoFixStatus: suggestions.length === 0 ? 'sem correções pendentes' : 'correções guiadas disponíveis',
  };
}
