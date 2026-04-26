import { env } from '../config/env.js';

export function getEnvChecklist() {
  return {
    SUPABASE_URL: Boolean(env.supabaseUrl),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(env.supabaseServiceRoleKey),
    DATABASE_URL: Boolean(env.databaseUrl),
    GEMINI_API_KEY: Boolean(env.geminiApiKey),
    JWT_SECRET: Boolean(env.jwtSecret),
    RENDER_DEPLOY_HOOK_URL: Boolean(env.renderDeployHookUrl),
    VERCEL_DEPLOY_HOOK_URL: Boolean(env.vercelDeployHookUrl),
    VERCEL_TOKEN: Boolean(env.vercelToken),
    VERCEL_PROJECT_ID: Boolean(env.vercelProjectId),
    VERCEL_TEAM_ID: Boolean(env.vercelTeamId),
  };
}

export function getReadiness(checklist) {
  const backendReady = checklist.SUPABASE_URL && checklist.SUPABASE_SERVICE_ROLE_KEY && checklist.DATABASE_URL && checklist.GEMINI_API_KEY && checklist.JWT_SECRET;
  const renderReady = checklist.RENDER_DEPLOY_HOOK_URL;
  const vercelReady = checklist.VERCEL_DEPLOY_HOOK_URL && checklist.VERCEL_TOKEN && checklist.VERCEL_PROJECT_ID;
  return {
    backendReady,
    renderReady,
    vercelReady,
    overallReady: backendReady && renderReady && vercelReady,
  };
}
