const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../../../data');
const STATE_FILE = path.join(DATA_DIR, 'agent-marketplace-state.json');

function nowIso() { return new Date().toISOString(); }
function ensureDataDir() { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); }
function money(value) { return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

function buildInitialState() {
  const now = nowIso();
  return {
    updatedAt: now,
    version: '5.1.0',
    title: 'Megan OS 5.1 — MARKETPLACE DE AGENTES',
    focus: 'Usuários compram, instalam, agregam e operam agentes especializados por área de negócio.',
    mode: 'agent_marketplace_supervised',
    readiness: { score: 93, status: 'pronto_para_venda_de_agentes', risk: 'controlado_com_confirmacao_humana', nextRelease: '5.2 billing automático por uso e comissão de criadores' },
    metrics: { publishedAgents: 7, installedAgents: 31, activeSubscriptions: 14, monthlyAgentRevenue: 6843, averageRating: 4.8, supervisedRuns: 128, categories: 7 },
    categories: ['vendas', 'suporte', 'financeiro', 'marketing', 'jurídico', 'saúde', 'logística'],
    customers: [
      { id: 'tenant-luiz-master', name: 'Luiz Rosa Holding', plan: 'Enterprise Global', installedAgents: ['agent-sales-pro', 'agent-finance-cash', 'agent-marketing-growth'] },
      { id: 'tenant-b2b-alpha', name: 'Empresa Alpha', plan: 'Business Pro', installedAgents: ['agent-sales-pro', 'agent-support-omni'] },
      { id: 'tenant-health', name: 'Megan Health Unit', plan: 'Vertical Health', installedAgents: ['agent-health-routine'] }
    ],
    agents: [
      { id: 'agent-sales-pro', name: 'Agente Vendas Pro', category: 'vendas', price: 297, billing: 'mensal', status: 'published', installs: 9, rating: 4.9, risk: 'baixo', description: 'Capta leads, qualifica contatos, agenda reuniões, cria propostas e faz follow-up.', capabilities: ['captação de leads', 'qualificação', 'propostas', 'follow-up', 'CRM vivo'], requiresApproval: ['desconto acima de 15%', 'envio de contrato', 'alteração de preço'] },
      { id: 'agent-support-omni', name: 'Agente Suporte Omnicanal', category: 'suporte', price: 247, billing: 'mensal', status: 'published', installs: 7, rating: 4.8, risk: 'baixo', description: 'Responde clientes em canais integrados, classifica tickets e escala casos críticos.', capabilities: ['resposta automática', 'triagem', 'SLA', 'base de conhecimento', 'handoff humano'], requiresApproval: ['reembolso', 'cancelamento', 'mensagem sensível'] },
      { id: 'agent-finance-cash', name: 'Agente Financeiro Caixa', category: 'financeiro', price: 227, billing: 'mensal', status: 'published', installs: 5, rating: 4.7, risk: 'médio', description: 'Acompanha caixa, cobranças, vencimentos, inadimplência e previsões financeiras.', capabilities: ['fluxo de caixa', 'cobrança', 'alertas', 'relatórios', 'previsão'], requiresApproval: ['envio de cobrança formal', 'baixa manual', 'alteração de vencimento'] },
      { id: 'agent-marketing-growth', name: 'Agente Marketing Growth', category: 'marketing', price: 267, billing: 'mensal', status: 'published', installs: 4, rating: 4.8, risk: 'baixo', description: 'Planeja campanhas, cria variações, acompanha métricas e sugere ações de crescimento.', capabilities: ['campanhas', 'conteúdo', 'funil', 'métricas', 'testes A/B'], requiresApproval: ['publicação paga', 'mudança de orçamento', 'promessa comercial'] },
      { id: 'agent-legal-safe', name: 'Agente Jurídico Seguro', category: 'jurídico', price: 397, billing: 'mensal', status: 'supervised', installs: 2, rating: 4.6, risk: 'alto', description: 'Organiza documentos, identifica riscos e prepara minutas para revisão humana.', capabilities: ['análise documental', 'checklist', 'minutas', 'riscos', 'prazos'], requiresApproval: ['parecer final', 'assinatura', 'notificação extrajudicial'] },
      { id: 'agent-health-routine', name: 'Agente Saúde Rotina', category: 'saúde', price: 197, billing: 'mensal', status: 'supervised', installs: 3, rating: 4.7, risk: 'médio', description: 'Acompanha hábitos, lembretes, sinais gerais e organização de rotina saudável.', capabilities: ['hábitos', 'lembretes', 'rotina', 'registro', 'alertas não clínicos'], requiresApproval: ['orientação médica', 'diagnóstico', 'mudança de medicação'] },
      { id: 'agent-logistics-flow', name: 'Agente Logística Flow', category: 'logística', price: 287, billing: 'mensal', status: 'published', installs: 1, rating: 4.5, risk: 'médio', description: 'Monitora entregas, rotas, estoque, prioridades e atrasos operacionais.', capabilities: ['rotas', 'entregas', 'estoque', 'alertas', 'priorização'], requiresApproval: ['cancelar entrega', 'trocar transportadora', 'ajustar custo'] }
    ],
    installed: [
      { id: 'inst-001', agentId: 'agent-sales-pro', customerId: 'tenant-luiz-master', seat: 'equipe_vendas', status: 'active', monthlyValue: 297, installedAt: now },
      { id: 'inst-002', agentId: 'agent-support-omni', customerId: 'tenant-b2b-alpha', seat: 'suporte_n1', status: 'active', monthlyValue: 247, installedAt: now },
      { id: 'inst-003', agentId: 'agent-finance-cash', customerId: 'tenant-luiz-master', seat: 'financeiro', status: 'active', monthlyValue: 227, installedAt: now }
    ],
    workflow: [
      { id: 'wf-001', title: 'Descobrir agente', status: 'ready', detail: 'Usuário navega por categoria, preço, risco e avaliação.' },
      { id: 'wf-002', title: 'Comprar ou agregar', status: 'ready', detail: 'Assinatura mensal por agente, vinculada à empresa cliente.' },
      { id: 'wf-003', title: 'Instalar no tenant', status: 'ready', detail: 'Agente recebe escopo, canal, permissões e limites.' },
      { id: 'wf-004', title: 'Rodar supervisionado', status: 'ready', detail: 'Execuções reais ficam em log e ações críticas pedem aprovação.' },
      { id: 'wf-005', title: 'Medir resultado', status: 'ready', detail: 'Métricas de receita, uso, satisfação e risco por agente.' }
    ],
    activity: [
      { id: 'act-001', type: 'marketplace_boot', title: 'Marketplace de agentes iniciado', detail: 'Catálogo 5.1 carregado com 7 categorias vendáveis.', createdAt: now },
      { id: 'act-002', type: 'agent_published', title: 'Agentes publicados', detail: 'Vendas, suporte, financeiro, marketing, jurídico, saúde e logística disponíveis.', createdAt: now }
    ],
    demoRuns: []
  };
}

function ensureState() {
  ensureDataDir();
  if (!fs.existsSync(STATE_FILE)) fs.writeFileSync(STATE_FILE, JSON.stringify(buildInitialState(), null, 2));
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

function recalc(state) {
  state.updatedAt = nowIso();
  state.metrics.publishedAgents = state.agents.filter((agent) => agent.status === 'published' || agent.status === 'supervised').length;
  state.metrics.installedAgents = state.installed.length;
  state.metrics.activeSubscriptions = state.installed.filter((item) => item.status === 'active').length;
  state.metrics.monthlyAgentRevenue = state.installed.reduce((sum, item) => sum + Number(item.monthlyValue || 0), 0);
  state.metrics.averageRating = Number((state.agents.reduce((sum, item) => sum + Number(item.rating || 0), 0) / Math.max(1, state.agents.length)).toFixed(1));
  state.metrics.supervisedRuns = Number(state.metrics.supervisedRuns || 0) + state.demoRuns.length;
  state.metrics.categories = new Set(state.agents.map((agent) => agent.category)).size;
}

function saveState(state) {
  recalc(state);
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  return state;
}

function pushActivity(state, type, title, detail) {
  state.activity.unshift({ id: `act-${Date.now()}`, type, title, detail, createdAt: nowIso() });
  state.activity = state.activity.slice(0, 40);
}

function getDashboard() {
  const state = ensureState();
  recalc(state);
  return { ok: true, ...state, display: { monthlyAgentRevenue: money(state.metrics.monthlyAgentRevenue) } };
}

function pickAgent(state, agentId) {
  return state.agents.find((agent) => agent.id === agentId) || state.agents[0];
}

function pickCustomer(state, customerId) {
  return state.customers.find((customer) => customer.id === customerId) || state.customers[0];
}

function installAgent(payload = {}) {
  const state = ensureState();
  const agent = pickAgent(state, payload.agentId);
  const customer = pickCustomer(state, payload.customerId);
  const install = {
    id: `inst-${Date.now()}`,
    agentId: agent.id,
    customerId: customer.id,
    seat: payload.seat || agent.category,
    status: 'active',
    monthlyValue: Number(payload.monthlyValue || agent.price || 0),
    installedAt: nowIso()
  };
  state.installed.unshift(install);
  agent.installs = Number(agent.installs || 0) + 1;
  if (!customer.installedAgents.includes(agent.id)) customer.installedAgents.push(agent.id);
  pushActivity(state, 'agent_installed', 'Agente instalado', `${agent.name} instalado para ${customer.name}.`);
  saveState(state);
  return { ok: true, agent, customer, install, dashboard: state };
}

function purchaseAgent(payload = {}) {
  const result = installAgent(payload);
  result.purchase = { status: 'approved_supervised', billing: result.agent.billing, amount: result.install.monthlyValue, label: money(result.install.monthlyValue) };
  return result;
}

function assignAgent(payload = {}) {
  const state = ensureState();
  const install = state.installed.find((item) => item.id === payload.installId) || state.installed[0];
  if (install) {
    install.seat = payload.seat || install.seat || 'operacao';
    install.status = payload.status || 'active';
  }
  const agent = pickAgent(state, install?.agentId);
  pushActivity(state, 'agent_assigned', 'Agente atribuído', `${agent.name} atribuído para ${install?.seat || 'operação'}.`);
  saveState(state);
  return { ok: true, install, agent, dashboard: state };
}

function runDemo(payload = {}) {
  const state = ensureState();
  const agent = pickAgent(state, payload.agentId);
  const customer = pickCustomer(state, payload.customerId);
  const demo = {
    id: `run-${Date.now()}`,
    agentId: agent.id,
    customerId: customer.id,
    title: payload.title || `Execução supervisionada: ${agent.name}`,
    outcome: payload.outcome || `${agent.name} executou uma simulação segura para ${customer.name}.`,
    status: agent.risk === 'alto' ? 'aguardando_aprovacao' : 'completed_supervised',
    approvalsRequired: agent.requiresApproval || [],
    createdAt: nowIso()
  };
  state.demoRuns.unshift(demo);
  state.demoRuns = state.demoRuns.slice(0, 20);
  pushActivity(state, 'agent_demo_run', 'Execução de agente registrada', `${agent.name} rodou em modo ${demo.status}.`);
  saveState(state);
  return { ok: true, demo, agent, customer, dashboard: state };
}

function reviewAgent(payload = {}) {
  const state = ensureState();
  const agent = pickAgent(state, payload.agentId);
  const rating = Number(payload.rating || 5);
  agent.rating = Number(((Number(agent.rating || 4.7) + rating) / 2).toFixed(1));
  pushActivity(state, 'agent_reviewed', 'Avaliação recebida', `${agent.name} recebeu avaliação ${rating}.`);
  saveState(state);
  return { ok: true, agent, dashboard: state };
}

module.exports = { getDashboard, installAgent, purchaseAgent, assignAgent, runDemo, reviewAgent };
