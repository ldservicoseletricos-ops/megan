const INTEGRATIONS = [
  ['gmail','Gmail','communication',['GMAIL_ACCESS_TOKEN','GMAIL_FROM_EMAIL'],['check_status','send_email']],
  ['whatsapp','WhatsApp Cloud API','communication',['WHATSAPP_TOKEN','WHATSAPP_PHONE_NUMBER_ID'],['check_status','send_message']],
  ['google_calendar','Google Calendar','calendar',['GOOGLE_ACCESS_TOKEN','GOOGLE_CALENDAR_ID'],['check_status','create_event']],
  ['google_sheets','Google Sheets','data',['GOOGLE_ACCESS_TOKEN','GOOGLE_SHEET_ID'],['check_status','append_row']],
  ['stripe','Stripe','billing',['STRIPE_SECRET_KEY'],['check_status','list_customers']],
  ['supabase','Supabase','database',['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY'],['check_status','insert_row']],
  ['render','Render','deploy',['RENDER_API_KEY'],['check_status','list_services']],
  ['vercel','Vercel','deploy',['VERCEL_TOKEN'],['check_status','list_projects']],
  ['github','GitHub','code',['GITHUB_TOKEN','GITHUB_OWNER','GITHUB_REPO'],['check_status','create_issue']],
  ['telegram','Telegram','communication',['TELEGRAM_BOT_TOKEN','TELEGRAM_CHAT_ID'],['check_status','send_message']],
  ['external_crm','CRM Externo','sales',['CRM_API_URL','CRM_API_KEY'],['check_status','create_lead']],
].map(([id,name,category,env,actions]) => ({ id, name, category, env, actions, description: name + ' conectado ao executor seguro da Megan OS 4.2.' }));
function hasValue(name) { return Boolean(process.env[name] && String(process.env[name]).trim()); }
function mask(name) { const v = process.env[name]; if (!v) return null; return v.length <= 8 ? '********' : v.slice(0,4) + '********' + v.slice(-4); }
function getIntegrationStatus(item) { const configuredEnv = item.env.filter(hasValue); const missingEnv = item.env.filter((name) => !hasValue(name)); return { ...item, configured: missingEnv.length === 0, readiness: Math.round((configuredEnv.length / item.env.length) * 100), configuredEnv: configuredEnv.map((name) => ({ name, value: mask(name) })), missingEnv, status: missingEnv.length === 0 ? 'ready_for_real_execution' : 'waiting_credentials' }; }
function getIntegrations() { return INTEGRATIONS.map(getIntegrationStatus); }
function findIntegration(id) { return getIntegrations().find((item) => item.id === id); }
module.exports = { INTEGRATIONS, getIntegrations, findIntegration };
