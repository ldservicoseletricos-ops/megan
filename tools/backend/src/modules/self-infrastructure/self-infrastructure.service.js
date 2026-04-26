const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');
const integrations = require('../deploy-autopilot/integrations-store.service');

const dataDir = path.join(process.cwd(), 'data', 'self-infrastructure');
const statePath = path.join(dataDir, 'self-infrastructure-state.json');
const REQUIRED = ['github', 'render', 'vercel', 'supabase'];
const SERVICES = [
  { id: 'github', name: 'GitHub', required: true, purpose: 'repositórios, commits, branches e versionamento' },
  { id: 'render', name: 'Render', required: true, purpose: 'backend Node.js, logs e redeploy' },
  { id: 'vercel', name: 'Vercel', required: true, purpose: 'frontend React/Vite, previews e produção' },
  { id: 'supabase', name: 'Supabase', required: true, purpose: 'PostgreSQL, storage e variáveis do banco' },
  { id: 'google', name: 'Google / Gemini', required: false, purpose: 'IA, Maps e recursos Google' },
  { id: 'stripe', name: 'Stripe', required: false, purpose: 'assinaturas, checkout e billing' },
];

function now() { return new Date().toISOString(); }
function ensureDataDir() { fs.mkdirSync(dataDir, { recursive: true }); }
function defaultState() {
  return { version: '8.0.0', mode: 'supervisionado', autoMonitorEnabled: false, lastScanAt: null, lastRepairAt: null, checks: [], incidents: [], actions: [], riskPolicy: { lowRiskAutoExecute: true, highRiskRequiresApproval: true, neverDeleteWithoutApproval: true } };
}
function readState() {
  ensureDataDir();
  if (!fs.existsSync(statePath)) return defaultState();
  try { return { ...defaultState(), ...JSON.parse(fs.readFileSync(statePath, 'utf8')) }; } catch (_e) { return defaultState(); }
}
function writeState(state) { ensureDataDir(); fs.writeFileSync(statePath, JSON.stringify(state, null, 2)); return state; }
function httpJson({ url, headers = {}, timeoutMs = 12000 }) {
  return new Promise((resolve, reject) => {
    const target = new URL(url);
    const req = https.request({ method: 'GET', hostname: target.hostname, port: target.port || 443, path: `${target.pathname}${target.search}`, headers: { Accept: 'application/json', 'User-Agent': 'Megan-OS-Self-Infrastructure/8.0', ...headers }, timeout: timeoutMs }, (res) => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => { let data = raw; try { data = raw ? JSON.parse(raw) : null; } catch (_e) {} resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, statusCode: res.statusCode, data }); });
    });
    req.on('timeout', () => req.destroy(new Error('Tempo limite na verificação.')));
    req.on('error', reject);
    req.end();
  });
}
function buildDashboard() {
  const state = readState();
  const list = integrations.listIntegrations();
  const providers = list.providers || [];
  const requiredProviders = providers.filter((p) => REQUIRED.includes(p.id));
  const requiredConnected = requiredProviders.filter((p) => p.connected).length;
  const healthScore = Math.min(100, Math.round((requiredConnected / Math.max(REQUIRED.length, 1)) * 70 + (state.lastScanAt ? 20 : 0) + (state.autoMonitorEnabled ? 10 : 0)));
  const services = SERVICES.map((service) => {
    const provider = providers.find((p) => p.id === service.id) || {};
    const lastCheck = (state.checks || []).find((check) => check.provider === service.id) || null;
    return { ...service, connected: Boolean(provider.connected), configuredFields: provider.configuredFields || [], missingFields: provider.missingFields || [], lastCheck, status: provider.connected ? (lastCheck?.ok === false ? 'attention' : 'ready') : 'missing' };
  });
  return { ok: true, version: state.version, mode: state.mode, autoMonitorEnabled: state.autoMonitorEnabled, healthScore, lastScanAt: state.lastScanAt, lastRepairAt: state.lastRepairAt, riskPolicy: state.riskPolicy, summary: { services: SERVICES.length, connected: services.filter((s) => s.connected).length, requiredConnected, requiredTotal: REQUIRED.length, openIncidents: (state.incidents || []).filter((i) => i.status !== 'resolved').length, actionsLogged: (state.actions || []).length }, services, incidents: (state.incidents || []).slice(0, 30), actions: (state.actions || []).slice(0, 40) };
}
async function checkProvider(providerId) {
  const config = integrations.getIntegrationConfig(providerId) || {};
  const startedAt = now();
  if (!config.token) return { provider: providerId, ok: false, status: 'missing_token', startedAt, finishedAt: now(), message: 'Token não configurado no painel.' };
  try {
    if (providerId === 'github') {
      const r = await httpJson({ url: 'https://api.github.com/user', headers: { Authorization: `Bearer ${config.token}`, 'X-GitHub-Api-Version': '2022-11-28' } });
      return { provider: providerId, ok: r.ok, status: r.ok ? 'online' : 'api_error', statusCode: r.statusCode, startedAt, finishedAt: now(), message: r.ok ? `GitHub conectado: ${r.data?.login || 'conta validada'}` : 'GitHub retornou erro.' };
    }
    if (providerId === 'render') {
      const r = await httpJson({ url: 'https://api.render.com/v1/services?limit=1', headers: { Authorization: `Bearer ${config.token}` } });
      return { provider: providerId, ok: r.ok, status: r.ok ? 'online' : 'api_error', statusCode: r.statusCode, startedAt, finishedAt: now(), message: r.ok ? 'Render API validada.' : 'Render retornou erro.' };
    }
    if (providerId === 'vercel') {
      const r = await httpJson({ url: 'https://api.vercel.com/v2/user', headers: { Authorization: `Bearer ${config.token}` } });
      return { provider: providerId, ok: r.ok, status: r.ok ? 'online' : 'api_error', statusCode: r.statusCode, startedAt, finishedAt: now(), message: r.ok ? `Vercel conectada: ${r.data?.user?.email || r.data?.user?.username || 'conta validada'}` : 'Vercel retornou erro.' };
    }
    if (providerId === 'supabase') {
      const r = await httpJson({ url: 'https://api.supabase.com/v1/projects', headers: { Authorization: `Bearer ${config.token}` } });
      return { provider: providerId, ok: r.ok, status: r.ok ? 'online' : 'api_error', statusCode: r.statusCode, startedAt, finishedAt: now(), message: r.ok ? 'Supabase API validada.' : 'Supabase retornou erro.' };
    }
    if (providerId === 'stripe') {
      const r = await httpJson({ url: 'https://api.stripe.com/v1/account', headers: { Authorization: `Bearer ${config.token}` } });
      return { provider: providerId, ok: r.ok, status: r.ok ? 'online' : 'api_error', statusCode: r.statusCode, startedAt, finishedAt: now(), message: r.ok ? `Stripe conectada: ${r.data?.id || 'conta validada'}` : 'Stripe retornou erro.' };
    }
    if (providerId === 'google') return { provider: providerId, ok: true, status: 'saved_key', startedAt, finishedAt: now(), message: 'Chave Google/Gemini salva. Teste profundo depende do serviço habilitado.' };
    return { provider: providerId, ok: false, status: 'unknown_provider', startedAt, finishedAt: now(), message: 'Provedor desconhecido.' };
  } catch (error) {
    return { provider: providerId, ok: false, status: 'network_error', startedAt, finishedAt: now(), message: error.message || 'Falha na rede.' };
  }
}
async function runScan(options = {}) {
  const providers = options.providers?.length ? options.providers : SERVICES.map((s) => s.id);
  const checks = [];
  for (const providerId of providers) checks.push(await checkProvider(providerId));
  const state = readState();
  const scannedAt = now();
  const incidents = checks.filter((c) => !c.ok).map((c) => ({ id: `${c.provider}-${Date.now()}`, provider: c.provider, title: `${c.provider} precisa de atenção`, severity: c.status === 'missing_token' ? 'medium' : 'high', status: 'open', reason: c.message, createdAt: scannedAt, recommendedAction: c.status === 'missing_token' ? 'Conectar token no painel de integrações.' : 'Testar token, ler logs e executar correção supervisionada.' }));
  state.lastScanAt = scannedAt;
  state.checks = checks;
  state.incidents = [...incidents, ...(state.incidents || [])].slice(0, 80);
  state.actions = [{ id: `scan-${Date.now()}`, type: 'scan', title: 'Verificação completa executada', result: incidents.length ? 'attention' : 'healthy', createdAt: scannedAt, details: { checked: checks.length, incidents: incidents.length } }, ...(state.actions || [])].slice(0, 100);
  writeState(state);
  return { ok: true, scannedAt, checks, incidents, dashboard: buildDashboard() };
}
function buildRepairPlan() {
  const dashboard = buildDashboard();
  const steps = [];
  dashboard.services.forEach((service) => {
    if (!service.connected) steps.push({ id: `${service.id}-connect`, provider: service.id, risk: 'low', title: `Conectar ${service.name}`, action: 'Solicitar token no painel e salvar criptografado.', canAutoExecute: false });
    else if (service.status === 'attention') {
      steps.push({ id: `${service.id}-retest`, provider: service.id, risk: 'low', title: `Retestar ${service.name}`, action: 'Executar novo teste de API e registrar resultado.', canAutoExecute: true });
      steps.push({ id: `${service.id}-logs`, provider: service.id, risk: 'medium', title: `Coletar diagnóstico ${service.name}`, action: 'Buscar logs/serviços quando IDs estiverem configurados.', canAutoExecute: false });
    }
  });
  if (!steps.length) steps.push({ id: 'system-healthy', provider: 'all', risk: 'none', title: 'Sistema saudável', action: 'Manter monitoramento ativo e registrar snapshots.', canAutoExecute: true });
  return { ok: true, version: '8.0.0', generatedAt: now(), mode: 'supervisionado', steps, approvalRequired: steps.some((s) => s.risk === 'medium' || s.risk === 'high' || !s.canAutoExecute) };
}
async function repairAll(payload = {}) {
  const plan = buildRepairPlan();
  const createdAt = now();
  if (plan.approvalRequired && !payload.confirm) {
    const state = readState();
    state.actions = [{ id: `repair-awaiting-${Date.now()}`, type: 'repair_plan', title: 'Plano de correção preparado aguardando aprovação', result: 'waiting_confirmation', createdAt, details: { steps: plan.steps.length } }, ...(state.actions || [])].slice(0, 100);
    writeState(state);
    return { ok: true, needsConfirmation: true, plan, message: 'Plano preparado. Confirme para executar as ações seguras.' };
  }
  const results = [];
  for (const step of plan.steps.filter((s) => s.canAutoExecute)) {
    if (step.id.endsWith('-retest')) results.push(await checkProvider(step.provider));
    else results.push({ provider: step.provider, ok: true, status: 'recorded', message: step.action });
  }
  const state = readState();
  state.lastRepairAt = createdAt;
  state.actions = [{ id: `repair-${Date.now()}`, type: 'repair', title: 'Correção supervisionada executada', result: results.every((r) => r.ok) ? 'success' : 'attention', createdAt, details: { results } }, ...(state.actions || [])].slice(0, 100);
  if (results.length) state.checks = results;
  writeState(state);
  return { ok: true, executed: true, plan, results, dashboard: buildDashboard(), message: 'Correção supervisionada concluída.' };
}
function setMonitor(enabled) {
  const state = readState();
  const createdAt = now();
  state.autoMonitorEnabled = Boolean(enabled);
  state.actions = [{ id: `monitor-${Date.now()}`, type: 'monitor', title: enabled ? 'Monitoramento automático ativado' : 'Monitoramento automático pausado', result: enabled ? 'enabled' : 'disabled', createdAt }, ...(state.actions || [])].slice(0, 100);
  writeState(state);
  return { ok: true, autoMonitorEnabled: state.autoMonitorEnabled, dashboard: buildDashboard() };
}
module.exports = { buildDashboard, runScan, buildRepairPlan, repairAll, setMonitor };
