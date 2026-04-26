import dotenv from 'dotenv';
dotenv.config();

export const env = {
  port: Number(process.env.PORT || 10000),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  databaseUrl: process.env.DATABASE_URL || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  jwtSecret: process.env.JWT_SECRET || '',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  renderDeployHookUrl: process.env.RENDER_DEPLOY_HOOK_URL || '',
  vercelDeployHookUrl: process.env.VERCEL_DEPLOY_HOOK_URL || '',
  vercelToken: process.env.VERCEL_TOKEN || '',
  vercelProjectId: process.env.VERCEL_PROJECT_ID || '',
  vercelTeamId: process.env.VERCEL_TEAM_ID || '',
};
