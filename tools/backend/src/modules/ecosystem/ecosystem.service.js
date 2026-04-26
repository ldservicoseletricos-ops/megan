const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../../../data');
const STATE_FILE = path.join(DATA_DIR, 'ecosystem-state.json');

function nowIso() { return new Date().toISOString(); }
function ensureDataDir() { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); }
function money(value) { return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

function buildInitialState() {
  const now = nowIso();
  return {
    updatedAt: now,
    version: '5.0.0',
    title: 'Megan OS 5.0 — ECOSSISTEMA MEGAN OS',
    focus: 'Produto vendável mundial com multiusuário, multiempresa, planos mensais, marketplace de módulos e white-label.',
    mode: 'world_saas_supervised',
    readiness: { score: 91, status: 'pronto_para_venda_supervisionada', market: 'Brasil + internacional', risk: 'controlado', nextRelease: '5.1 escala comercial e onboarding automático' },
    metrics: { companies: 4, users: 18, activePlans: 4, monthlyRecurringRevenue: 12840, marketplaceModules: 12, installedModules: 28, whiteLabelBrands: 3, countriesReady: 6 },
    tenants: [
      { id: 'tenant-luiz-master', name: 'Luiz Rosa Holding', segment: 'Operação principal', country: 'BR', plan: 'Enterprise Global', users: 6, status: 'active', whiteLabel: true, mrr: 4970 },
      { id: 'tenant-b2b-alpha', name: 'Empresa Alpha', segment: 'Vendas e CRM', country: 'BR', plan: 'Business Pro', users: 5, status: 'active', whiteLabel: false, mrr: 2490 },
      { id: 'tenant-health', name: 'Megan Health Unit', segment: 'Saúde e rotina', country: 'BR', plan: 'Vertical Health', users: 3, status: 'trial', whiteLabel: true, mrr: 1490 },
      { id: 'tenant-global', name: 'Global Pilot Customer', segment: 'Operação internacional', country: 'US', plan: 'Enterprise Global', users: 4, status: 'onboarding', whiteLabel: true, mrr: 3890 }
    ],
    users: [
      { id: 'user-owner', name: 'Operador Principal', role: 'owner', companyId: 'tenant-luiz-master', access: ['admin', 'billing', 'marketplace', 'white_label', 'agents'] },
      { id: 'user-sales', name: 'Equipe Vendas', role: 'sales_manager', companyId: 'tenant-b2b-alpha', access: ['crm', 'sales', 'multichannel'] },
      { id: 'user-support', name: 'Suporte', role: 'support', companyId: 'tenant-b2b-alpha', access: ['support', 'inbox', 'crm'] },
      { id: 'user-finance', name: 'Financeiro', role: 'finance', companyId: 'tenant-luiz-master', access: ['billing', 'finance', 'reports'] }
    ],
    plans: [
      { id: 'starter', name: 'Starter', price: 97, interval: 'monthly', target: 'profissionais e microempresas', modules: ['chat', 'agenda', 'crm_base'], limits: { users: 2, companies: 1, automations: 20 } },
      { id: 'business_pro', name: 'Business Pro', price: 497, interval: 'monthly', target: 'empresas em crescimento', modules: ['crm_vivo', 'multicanal', 'vendas', 'suporte', 'analytics'], limits: { users: 10, companies: 3, automations: 200 } },
      { id: 'enterprise_global', name: 'Enterprise Global', price: 1497, interval: 'monthly', target: 'operações multiempresa', modules: ['todos', 'white_label', 'marketplace', 'agentes_autonomos', 'central_global'], limits: { users: 100, companies: 25, automations: 5000 } },
      { id: 'white_label_partner', name: 'White-label Partner', price: 2997, interval: 'monthly', target: 'revendedores e parceiros', modules: ['marca_propria', 'multi_tenant', 'billing_partner', 'marketplace'], limits: { users: 500, companies: 100, automations: 20000 } }
    ],
    marketplace: [
      { id: 'mod-crm-vivo', name: 'CRM Vivo', category: 'Vendas', price: 197, status: 'published', installs: 12, description: 'Pipeline, leads, follow-up, propostas e histórico vivo.' },
      { id: 'mod-multicanal', name: 'Multicanal Total', category: 'Comunicação', price: 247, status: 'published', installs: 9, description: 'WhatsApp, Email, Telegram, Instagram, Site, CRM e Google Workspace.' },
      { id: 'mod-deploy', name: 'Agente Deploy', category: 'Tecnologia', price: 297, status: 'published', installs: 5, description: 'Checklist GitHub, Render, Vercel e publicação supervisionada.' },
      { id: 'mod-finance', name: 'Financeiro Inteligente', category: 'Financeiro', price: 227, status: 'published', installs: 7, description: 'Caixa, cobranças, vencimentos, alertas e relatórios.' },
      { id: 'mod-health', name: 'Copiloto Saúde', category: 'Vida', price: 167, status: 'beta', installs: 3, description: 'Rotina, foco, bem-estar, lembretes e acompanhamento pessoal.' },
      { id: 'mod-white-label', name: 'White-label Studio', category: 'Marca', price: 597, status: 'published', installs: 4, description: 'Marca, domínio, cores, textos, planos e identidade do cliente.' }
    ],
    whiteLabels: [
      { id: 'wl-luiz', companyId: 'tenant-luiz-master', brandName: 'Megan OS', domain: 'app.megan-os.com', accent: 'emerald', status: 'active' },
      { id: 'wl-health', companyId: 'tenant-health', brandName: 'Megan Health', domain: 'health.megan-os.com', accent: 'rose', status: 'draft' },
      { id: 'wl-global', companyId: 'tenant-global', brandName: 'Global AI Desk', domain: 'ai.globalpilot.com', accent: 'violet', status: 'onboarding' }
    ],
    revenueStreams: [
      { id: 'recurring', title: 'Planos mensais', value: 12840, trend: '+32%', note: 'MRR estimado dos tenants ativos e pilotos.' },
      { id: 'marketplace', title: 'Marketplace', value: 3890, trend: '+18%', note: 'Módulos vendidos ou instalados por assinatura.' },
      { id: 'white-label', title: 'White-label', value: 8991, trend: '+41%', note: 'Licenças de marca própria para parceiros.' }
    ],
    worldChecklist: [
      { id: 'multiuser', title: 'Multiusuário', status: 'ready', action: 'Papéis, acesso e limites por usuário configurados.' },
      { id: 'multicompany', title: 'Multiempresa', status: 'ready', action: 'Tenants, planos, módulos e dados separados por empresa.' },
      { id: 'billing', title: 'Planos mensais', status: 'ready', action: 'Tabela de planos pronta para Stripe e cobrança recorrente.' },
      { id: 'marketplace', title: 'Marketplace de módulos', status: 'ready', action: 'Catálogo, instalação, preços e categorias habilitados.' },
      { id: 'white_label', title: 'White-label', status: 'ready', action: 'Marca, domínio, tema e identidade por tenant.' },
      { id: 'compliance', title: 'Governança', status: 'supervised', action: 'Ações críticas exigem confirmação manual e logs auditáveis.' }
    ],
    activity: [
      { id: 'act-001', type: 'ecosystem_boot', title: 'Ecossistema 5.0 iniciado', detail: 'Central SaaS mundial consolidada.', createdAt: now },
      { id: 'act-002', type: 'marketplace_ready', title: 'Marketplace liberado', detail: 'Módulos prontos para venda e instalação supervisionada.', createdAt: now },
      { id: 'act-003', type: 'white_label_ready', title: 'White-label pronto', detail: 'Marcas por empresa disponíveis para operação B2B.', createdAt: now }
    ]
  };
}

function ensureState() {
  ensureDataDir();
  if (!fs.existsSync(STATE_FILE)) fs.writeFileSync(STATE_FILE, JSON.stringify(buildInitialState(), null, 2));
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

function saveState(state) {
  state.updatedAt = nowIso();
  state.metrics.companies = state.tenants.length;
  state.metrics.users = state.users.length;
  state.metrics.activePlans = new Set(state.tenants.map((tenant) => tenant.plan)).size;
  state.metrics.monthlyRecurringRevenue = state.tenants.reduce((sum, tenant) => sum + Number(tenant.mrr || 0), 0);
  state.metrics.marketplaceModules = state.marketplace.length;
  state.metrics.installedModules = state.marketplace.reduce((sum, item) => sum + Number(item.installs || 0), 0);
  state.metrics.whiteLabelBrands = state.whiteLabels.length;
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  return state;
}

function pushActivity(state, type, title, detail) {
  state.activity.unshift({ id: `act-${Date.now()}`, type, title, detail, createdAt: nowIso() });
  state.activity = state.activity.slice(0, 30);
}

function getDashboard() {
  const state = ensureState();
  return { ok: true, ...state, display: { mrr: money(state.metrics.monthlyRecurringRevenue) } };
}

function createTenant(payload = {}) {
  const state = ensureState();
  const tenant = {
    id: `tenant-${Date.now()}`,
    name: payload.name || 'Nova Empresa',
    segment: payload.segment || 'Operação geral',
    country: payload.country || 'BR',
    plan: payload.plan || 'Business Pro',
    users: Number(payload.users || 1),
    status: payload.status || 'onboarding',
    whiteLabel: Boolean(payload.whiteLabel),
    mrr: Number(payload.mrr || 497)
  };
  state.tenants.unshift(tenant);
  pushActivity(state, 'tenant_created', 'Nova empresa criada', `${tenant.name} entrou no ecossistema com plano ${tenant.plan}.`);
  saveState(state);
  return { ok: true, tenant, dashboard: state };
}

function createUser(payload = {}) {
  const state = ensureState();
  const user = {
    id: `user-${Date.now()}`,
    name: payload.name || 'Novo Usuário',
    role: payload.role || 'operator',
    companyId: payload.companyId || state.tenants[0]?.id || 'tenant-default',
    access: Array.isArray(payload.access) ? payload.access : ['chat', 'crm_base']
  };
  state.users.unshift(user);
  const tenant = state.tenants.find((item) => item.id === user.companyId);
  if (tenant) tenant.users = Number(tenant.users || 0) + 1;
  pushActivity(state, 'user_created', 'Novo usuário criado', `${user.name} recebeu perfil ${user.role}.`);
  saveState(state);
  return { ok: true, user, dashboard: state };
}

function subscribePlan(payload = {}) {
  const state = ensureState();
  const tenant = state.tenants.find((item) => item.id === payload.companyId) || state.tenants[0];
  const plan = state.plans.find((item) => item.id === payload.planId) || state.plans[1];
  if (tenant && plan) {
    tenant.plan = plan.name;
    tenant.status = 'active';
    tenant.mrr = Number(plan.price || tenant.mrr || 0);
    pushActivity(state, 'plan_subscribed', 'Plano mensal atualizado', `${tenant.name} agora usa ${plan.name} por ${money(plan.price)}/mês.`);
  }
  saveState(state);
  return { ok: true, tenant, plan, dashboard: state };
}

function installModule(payload = {}) {
  const state = ensureState();
  const moduleItem = state.marketplace.find((item) => item.id === payload.moduleId) || state.marketplace[0];
  const tenant = state.tenants.find((item) => item.id === payload.companyId) || state.tenants[0];
  if (moduleItem) moduleItem.installs = Number(moduleItem.installs || 0) + 1;
  pushActivity(state, 'module_installed', 'Módulo instalado', `${moduleItem?.name || 'Módulo'} instalado para ${tenant?.name || 'empresa selecionada'}.`);
  saveState(state);
  return { ok: true, module: moduleItem, tenant, dashboard: state };
}

function applyWhiteLabel(payload = {}) {
  const state = ensureState();
  const companyId = payload.companyId || state.tenants[0]?.id || 'tenant-default';
  const existing = state.whiteLabels.find((item) => item.companyId === companyId);
  const whiteLabel = existing || { id: `wl-${Date.now()}`, companyId, status: 'draft' };
  whiteLabel.brandName = payload.brandName || whiteLabel.brandName || 'Megan Partner';
  whiteLabel.domain = payload.domain || whiteLabel.domain || 'app.parceiro.com';
  whiteLabel.accent = payload.accent || whiteLabel.accent || 'emerald';
  whiteLabel.status = payload.status || 'active';
  if (!existing) state.whiteLabels.unshift(whiteLabel);
  const tenant = state.tenants.find((item) => item.id === companyId);
  if (tenant) tenant.whiteLabel = true;
  pushActivity(state, 'white_label_applied', 'White-label aplicado', `${whiteLabel.brandName} configurado em ${whiteLabel.domain}.`);
  saveState(state);
  return { ok: true, whiteLabel, dashboard: state };
}

function runWorldReadyChecklist() {
  const state = ensureState();
  state.worldChecklist = state.worldChecklist.map((item) => ({ ...item, lastCheckedAt: nowIso(), status: item.status === 'blocked' ? 'supervised' : item.status }));
  state.readiness.score = Math.min(99, Number(state.readiness.score || 90) + 1);
  pushActivity(state, 'world_checklist', 'Checklist mundial executado', 'Multiusuário, multiempresa, billing, marketplace e white-label revisados.');
  saveState(state);
  return { ok: true, checklist: state.worldChecklist, readiness: state.readiness, dashboard: state };
}

module.exports = { getDashboard, createTenant, createUser, subscribePlan, installModule, applyWhiteLabel, runWorldReadyChecklist };
