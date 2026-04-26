import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';
let supabaseClient = null;
export function getSupabaseClient() {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) return null;
  if (!supabaseClient) supabaseClient = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  return supabaseClient;
}
export async function getSupabaseStatus() {
  const client = getSupabaseClient();
  if (!client) return { connected: false, authPrepared: false, databasePrepared: Boolean(env.databaseUrl), reason: 'SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausente' };
  return { connected: true, authPrepared: Boolean(env.supabaseJwtSecret), databasePrepared: Boolean(env.databaseUrl), reason: 'Cliente Supabase inicializado' };
}
