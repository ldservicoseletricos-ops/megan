const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../../../data');
const STATE_FILE = path.join(DATA_DIR, 'megan-app-store-state.json');

function nowIso() { return new Date().toISOString(); }
function ensureDataDir() { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); }
function makeId(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`; }

function defaultCatalog() {
  return {
    themes: [
      { id: 'theme-executive-dark', type: 'tema', name: 'Executive Dark', price: 0, status: 'instalavel', category: 'visual', description: 'Tema premium escuro para painéis empresariais e comando global.' },
      { id: 'theme-personal-life', type: 'tema', name: 'Personal Life Focus', price: 9, status: 'instalavel', category: 'visual', description: 'Tema pessoal para rotina, foco, saúde e produtividade.' },
      { id: 'theme-white-label-clean', type: 'tema', name: 'White-label Clean', price: 29, status: 'instalavel', category: 'white_label', description: 'Tema limpo para revenda com marca de empresas clientes.' }
    ],
    agents: [
      { id: 'agent-sales-pro', type: 'agente', name: 'Agente Vendas PRO', price: 49, status: 'instalavel', category: 'vendas', description: 'Capta leads, qualifica oportunidades, cria propostas e agenda follow-up.' },
      { id: 'agent-support-pro', type: 'agente', name: 'Agente Suporte PRO', price: 39, status: 'instalavel', category: 'suporte', description: 'Responde clientes, classifica tickets e escala casos críticos.' },
      { id: 'agent-finance-pro', type: 'agente', name: 'Agente Financeiro PRO', price: 59, status: 'instalavel', category: 'financeiro', description: 'Acompanha caixa, cobranças, recorrência e alertas de risco.' },
      { id: 'agent-marketing-pro', type: 'agente', name: 'Agente Marketing PRO', price: 45, status: 'instalavel', category: 'marketing', description: 'Cria campanhas, calendário editorial e análise de conversão.' }
    ],
    automations: [
      { id: 'auto-lead-to-crm', type: 'automacao', name: 'Lead para CRM Vivo', price: 19, status: 'instalavel', category: 'crm', description: 'Envia novos leads para o CRM, cria tarefa e notifica o time.' },
      { id: 'auto-billing-followup', type: 'automacao', name: 'Cobrança + Follow-up', price: 25, status: 'instalavel', category: 'financeiro', description: 'Gera lembretes de cobrança e follow-ups automáticos supervisionados.' },
      { id: 'auto-daily-briefing', type: 'automacao', name: 'Briefing Diário', price: 15, status: 'instalavel', category: 'produtividade', description: 'Resume agenda, metas, alertas e tarefas prioritárias do dia.' }
    ],
    integrations: [
      { id: 'integration-gmail', type: 'integracao', name: 'Gmail', price: 0, status: 'conectavel', category: 'google_workspace', description: 'Conecta e-mail para leitura, respostas assistidas e follow-up.' },
      { id: 'integration-calendar', type: 'integracao', name: 'Google Calendar', price: 0, status: 'conectavel', category: 'google_workspace', description: 'Conecta agenda para eventos, foco diário e lembretes reais.' },
      { id: 'integration-whatsapp', type: 'integracao', name: 'WhatsApp Business', price: 29, status: 'conectavel', category: 'mensagens', description: 'Conecta atendimento e vendas por WhatsApp com confirmação humana.' },
      { id: 'integration-stripe', type: 'integracao', name: 'Stripe', price: 19, status: 'conectavel', category: 'pagamentos', description: 'Conecta planos, assinaturas, cobrança e métricas financeiras.' }
    ]
  };
}

function buildInitialState() {
  const now = nowIso();
  return {
    updatedAt: now,
    version: '5.5.0',
    title: 'Megan OS 5.5 — MEGAN APP STORE',
    focus: 'Loja de módulos para temas, agentes, automações e integrações.',
    mode: 'app_store_marketplace',
    readiness: { score: 95, status: 'pronto_para_venda_de_modulos', billing: 'compatível com planos mensais e compra por módulo', governance: 'instalações críticas ficam em modo supervisionado' },
    catalog: defaultCatalog(),
    installed: [
      { id: 'install-core-001', moduleId: 'theme-executive-dark', name: 'Executive Dark', type: 'tema', category: 'visual', status: 'ativo', installedAt: now },
      { id: 'install-core-002', moduleId: 'integration-gmail', name: 'Gmail', type: 'integracao', category: 'google_workspace', status: 'conectado', installedAt: now }
    ],
    purchases: [],
    activeTheme: 'Executive Dark',
    connectedIntegrations: ['Gmail'],
    enabledAutomations: [],
    activity: [{ id: 'store-act-001', type: 'store_boot', title: 'Megan App Store 5.5 iniciada', detail: 'Loja de temas, agentes, automações e integrações criada.', createdAt: now }]
  };
}

function ensureState() {
  ensureDataDir();
  if (!fs.existsSync(STATE_FILE)) fs.writeFileSync(STATE_FILE, JSON.stringify(buildInitialState(), null, 2));
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

function saveState(state) { state.updatedAt = nowIso(); fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2)); return state; }
function pushActivity(state, type, title, detail) { state.activity.unshift({ id: makeId('store-act'), type, title, detail, createdAt: nowIso() }); state.activity = state.activity.slice(0, 100); }
function flattenCatalog(catalog) { return [...catalog.themes, ...catalog.agents, ...catalog.automations, ...catalog.integrations]; }
function findCatalogItem(state, moduleId) { return flattenCatalog(state.catalog).find((item) => item.id === moduleId); }

function getDashboard() {
  const state = ensureState();
  const catalogItems = flattenCatalog(state.catalog);
  return { ok: true, ...state, summary: { totalModules: catalogItems.length, themes: state.catalog.themes.length, agents: state.catalog.agents.length, automations: state.catalog.automations.length, integrations: state.catalog.integrations.length, installed: state.installed.length, purchases: state.purchases.length, monthlyPotential: catalogItems.reduce((sum, item) => sum + Number(item.price || 0), 0) } };
}
function getCatalog() { const state = ensureState(); return { ok: true, catalog: state.catalog, installed: state.installed }; }
function installModule(payload = {}) {
  const state = ensureState();
  const item = findCatalogItem(state, payload.moduleId || payload.id);
  if (!item) return { ok: false, reason: 'Módulo não encontrado.', dashboard: getDashboard() };
  const existing = state.installed.find((entry) => entry.moduleId === item.id);
  if (existing) { existing.status = payload.status || existing.status || 'ativo'; existing.updatedAt = nowIso(); pushActivity(state, 'module_reinstalled', 'Módulo atualizado', `${item.name} já existia e foi atualizado.`); return { ok: true, installed: existing, dashboard: saveState(state) }; }
  const installed = { id: makeId('install'), moduleId: item.id, name: item.name, type: item.type, category: item.category, status: item.type === 'integracao' ? 'pendente_conexao' : 'ativo', installedAt: nowIso() };
  state.installed.unshift(installed);
  pushActivity(state, 'module_installed', 'Módulo instalado', `${item.name} foi instalado na Megan OS.`);
  return { ok: true, installed, dashboard: saveState(state) };
}
function purchaseModule(payload = {}) {
  const state = ensureState();
  const item = findCatalogItem(state, payload.moduleId || payload.id);
  if (!item) return { ok: false, reason: 'Módulo não encontrado para compra.', dashboard: getDashboard() };
  const purchase = { id: makeId('purchase'), moduleId: item.id, name: item.name, type: item.type, amount: Number(item.price || 0), currency: 'USD', status: item.price > 0 ? 'simulado_pronto_para_stripe' : 'gratuito_liberado', createdAt: nowIso() };
  state.purchases.unshift(purchase);
  pushActivity(state, 'module_purchased', 'Compra registrada', `${item.name} registrado para ativação no App Store.`);
  saveState(state);
  const installResult = installModule({ moduleId: item.id });
  return { ok: true, purchase, dashboard: installResult.dashboard };
}
function applyTheme(payload = {}) { const state = ensureState(); const item = findCatalogItem(state, payload.moduleId || 'theme-executive-dark'); if (!item || item.type !== 'tema') return { ok: false, reason: 'Tema não encontrado.', dashboard: getDashboard() }; state.activeTheme = item.name; pushActivity(state, 'theme_applied', 'Tema aplicado', `${item.name} agora é o tema ativo.`); return { ok: true, theme: item, dashboard: saveState(state) }; }
function enableAutomation(payload = {}) { const state = ensureState(); const item = findCatalogItem(state, payload.moduleId || 'auto-daily-briefing'); if (!item || item.type !== 'automacao') return { ok: false, reason: 'Automação não encontrada.', dashboard: getDashboard() }; if (!state.enabledAutomations.includes(item.name)) state.enabledAutomations.push(item.name); pushActivity(state, 'automation_enabled', 'Automação ativada', `${item.name} foi ativada em modo supervisionado.`); return { ok: true, automation: item, dashboard: saveState(state) }; }
function connectIntegration(payload = {}) { const state = ensureState(); const item = findCatalogItem(state, payload.moduleId || 'integration-gmail'); if (!item || item.type !== 'integracao') return { ok: false, reason: 'Integração não encontrada.', dashboard: getDashboard() }; if (!state.connectedIntegrations.includes(item.name)) state.connectedIntegrations.push(item.name); const installed = state.installed.find((entry) => entry.moduleId === item.id); if (installed) installed.status = 'conectado'; pushActivity(state, 'integration_connected', 'Integração conectada', `${item.name} conectada ao ecossistema Megan OS.`); return { ok: true, integration: item, dashboard: saveState(state) }; }

module.exports = { getDashboard, getCatalog, installModule, purchaseModule, applyTheme, enableAutomation, connectIntegration };
