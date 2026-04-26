const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../../../data');
const STATE_FILE = path.join(DATA_DIR, 'business-cloud-state.json');

function nowIso() { return new Date().toISOString(); }
function ensureDataDir() { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); }
function money(value) { return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

function buildInitialState() {
  const now = nowIso();
  return {
    updatedAt: now,
    version: '5.2.0',
    title: 'Megan OS 5.2 — MEGAN BUSINESS CLOUD',
    focus: 'Versão empresa com dashboard executivo, times, CRM, financeiro, metas e BI para operação B2B vendável.',
    mode: 'business_cloud_enterprise',
    readiness: { score: 94, status: 'pronto_para_implantacao_empresa', risk: 'supervisionado_com_aprovacao_em_acoes_criticas', nextRelease: '5.3 portal do cliente + relatórios automáticos + contratos white-label' },
    executive: { company: 'Luiz Rosa Business Cloud', activeCompanies: 4, activeUsers: 27, activeTeams: 6, activeAgents: 13, mrr: 18420, pipelineValue: 92750, cashBalance: 43200, goalCompletion: 71, healthScore: 91, priority: 'Aumentar conversão de propostas e reduzir tempo de resposta do suporte.' },
    teams: [
      { id: 'team-sales', name: 'Vendas', owner: 'Diretor Comercial', members: 7, status: 'ativo', target: 'Fechar 18 propostas no mês', productivity: 88 },
      { id: 'team-support', name: 'Suporte', owner: 'Coordenador CX', members: 5, status: 'ativo', target: 'SLA abaixo de 2h', productivity: 92 },
      { id: 'team-finance', name: 'Financeiro', owner: 'Gestor Financeiro', members: 3, status: 'ativo', target: 'Reduzir inadimplência para 4%', productivity: 81 },
      { id: 'team-growth', name: 'Growth/Marketing', owner: 'Head Growth', members: 4, status: 'ativo', target: 'Gerar 320 leads qualificados', productivity: 84 },
      { id: 'team-ops', name: 'Operações', owner: 'COO', members: 6, status: 'ativo', target: 'Padronizar entrega empresarial', productivity: 86 },
      { id: 'team-bi', name: 'BI', owner: 'Analista BI', members: 2, status: 'ativo', target: 'Relatórios executivos semanais', productivity: 90 }
    ],
    crm: { leads: [
      { id: 'lead-001', company: 'Clínica Premium', contact: 'Ana Souza', channel: 'WhatsApp', stage: 'proposta', value: 12800, probability: 72, nextAction: 'Enviar proposta final com módulos Saúde + Suporte', owner: 'Vendas', updatedAt: now },
      { id: 'lead-002', company: 'Logística Rápida', contact: 'Carlos Lima', channel: 'Site', stage: 'diagnostico', value: 18600, probability: 58, nextAction: 'Agendar demonstração do módulo Logística', owner: 'Vendas', updatedAt: now },
      { id: 'lead-003', company: 'Escritório Jurídico Alpha', contact: 'Marina Costa', channel: 'Email', stage: 'negociacao', value: 9700, probability: 64, nextAction: 'Revisar condições white-label', owner: 'Vendas', updatedAt: now }
    ], stages: ['novo', 'diagnostico', 'proposta', 'negociacao', 'ganho', 'perdido'], slaHours: 2, conversionRate: 31 },
    finance: { revenue: 28450, expenses: 11980, profit: 16470, receivables: 22300, overdue: 3240, runwayMonths: 7.4, entries: [
      { id: 'fin-001', type: 'receita', label: 'Assinaturas Business Cloud', amount: 18420, status: 'confirmado', dueDate: now.slice(0, 10) },
      { id: 'fin-002', type: 'receita', label: 'Setup Enterprise', amount: 10030, status: 'previsto', dueDate: now.slice(0, 10) },
      { id: 'fin-003', type: 'despesa', label: 'Infraestrutura cloud', amount: 2980, status: 'confirmado', dueDate: now.slice(0, 10) },
      { id: 'fin-004', type: 'despesa', label: 'Ferramentas SaaS', amount: 1640, status: 'confirmado', dueDate: now.slice(0, 10) }
    ] },
    goals: [
      { id: 'goal-mrr', title: 'Atingir R$ 25.000 de MRR', area: 'executivo', progress: 74, target: 25000, current: 18420, deadline: '30 dias' },
      { id: 'goal-crm', title: 'Fechar 10 empresas novas', area: 'vendas', progress: 46, target: 10, current: 4.6, deadline: '30 dias' },
      { id: 'goal-sla', title: 'Manter SLA abaixo de 2 horas', area: 'suporte', progress: 82, target: 2, current: 1.6, deadline: 'contínuo' },
      { id: 'goal-profit', title: 'Margem operacional acima de 50%', area: 'financeiro', progress: 79, target: 50, current: 57, deadline: 'mensal' }
    ],
    bi: { insights: [
      { id: 'bi-001', severity: 'alta', title: 'Pipeline cobre 5x o MRR atual', detail: 'Priorizar propostas em estágio negociação para acelerar caixa.', impact: 'crescimento' },
      { id: 'bi-002', severity: 'media', title: 'Suporte com melhor produtividade', detail: 'Usar scripts do suporte como base para treinamento comercial.', impact: 'eficiência' },
      { id: 'bi-003', severity: 'media', title: 'Inadimplência controlável', detail: 'Acionar lembrete automático 5 dias antes do vencimento.', impact: 'financeiro' }
    ], reports: [
      { id: 'rep-001', name: 'Relatório executivo semanal', status: 'pronto', sections: ['MRR', 'Pipeline', 'Caixa', 'Metas', 'Riscos'] },
      { id: 'rep-002', name: 'Forecast comercial', status: 'pronto', sections: ['Leads', 'Probabilidade', 'Receita prevista'] },
      { id: 'rep-003', name: 'Saúde operacional', status: 'pronto', sections: ['Times', 'SLA', 'Produtividade', 'Alertas'] }
    ] },
    alerts: [
      { id: 'alert-001', level: 'atenção', title: '3 propostas paradas há mais de 5 dias', action: 'Executar follow-up comercial hoje.' },
      { id: 'alert-002', level: 'risco', title: 'R$ 3.240 em cobrança vencida', action: 'Enviar lembrete financeiro supervisionado.' },
      { id: 'alert-003', level: 'oportunidade', title: 'Segmento saúde com maior ticket', action: 'Criar oferta vertical Saúde Cloud.' }
    ],
    automation: [
      { id: 'auto-001', title: 'Follow-up CRM diário', status: 'ativo', owner: 'Agente Vendas', lastRun: now },
      { id: 'auto-002', title: 'Resumo financeiro semanal', status: 'ativo', owner: 'Agente Financeiro', lastRun: now },
      { id: 'auto-003', title: 'BI executivo segunda-feira', status: 'ativo', owner: 'Agente BI', lastRun: now }
    ],
    activity: [
      { id: 'act-001', type: 'business_cloud_boot', title: 'Business Cloud 5.2 iniciado', detail: 'Dashboard executivo, times, CRM, financeiro, metas e BI carregados.', createdAt: now },
      { id: 'act-002', type: 'enterprise_ready', title: 'Versão empresa pronta', detail: 'Base preparada para venda B2B com visão executiva integrada.', createdAt: now }
    ]
  };
}

function ensureState() { ensureDataDir(); if (!fs.existsSync(STATE_FILE)) fs.writeFileSync(STATE_FILE, JSON.stringify(buildInitialState(), null, 2)); return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); }
function pushActivity(state, type, title, detail) { state.activity.unshift({ id: `act-${Date.now()}`, type, title, detail, createdAt: nowIso() }); state.activity = state.activity.slice(0, 50); }
function recalc(state) {
  const revenue = state.finance.entries.filter((entry) => entry.type === 'receita').reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const expenses = state.finance.entries.filter((entry) => entry.type === 'despesa').reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const pipelineValue = state.crm.leads.reduce((sum, lead) => sum + Number(lead.value || 0), 0);
  const avgProbability = state.crm.leads.reduce((sum, lead) => sum + Number(lead.probability || 0), 0) / Math.max(1, state.crm.leads.length);
  const goalCompletion = state.goals.reduce((sum, goal) => sum + Number(goal.progress || 0), 0) / Math.max(1, state.goals.length);
  state.updatedAt = nowIso(); state.finance.revenue = revenue; state.finance.expenses = expenses; state.finance.profit = revenue - expenses;
  state.executive.pipelineValue = pipelineValue; state.executive.goalCompletion = Number(goalCompletion.toFixed(0));
  state.executive.healthScore = Number(Math.min(99, Math.max(1, (avgProbability * 0.35) + (goalCompletion * 0.45) + 25)).toFixed(0));
  state.executive.activeTeams = state.teams.length;
}
function saveState(state) { recalc(state); fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2)); return state; }
function getDashboard() { const state = ensureState(); recalc(state); return { ok: true, ...state, display: { mrr: money(state.executive.mrr), pipelineValue: money(state.executive.pipelineValue), cashBalance: money(state.executive.cashBalance), revenue: money(state.finance.revenue), expenses: money(state.finance.expenses), profit: money(state.finance.profit), receivables: money(state.finance.receivables), overdue: money(state.finance.overdue), goalCompletion: `${state.executive.goalCompletion}%`, healthScore: `${state.executive.healthScore}%` } }; }
function createTeam(payload = {}) { const state = ensureState(); const team = { id: `team-${Date.now()}`, name: payload.name || 'Novo Time Empresa', owner: payload.owner || 'Gestor responsável', members: Number(payload.members || 1), status: 'ativo', target: payload.target || 'Definir meta operacional', productivity: Number(payload.productivity || 75) }; state.teams.unshift(team); pushActivity(state, 'team_created', 'Time criado no Business Cloud', `${team.name} foi adicionado à operação empresarial.`); return { ok: true, team, dashboard: saveState(state) }; }
function createLead(payload = {}) { const state = ensureState(); const lead = { id: `lead-${Date.now()}`, company: payload.company || 'Empresa Nova', contact: payload.contact || 'Contato principal', channel: payload.channel || 'Site', stage: payload.stage || 'novo', value: Number(payload.value || 4500), probability: Number(payload.probability || 35), nextAction: payload.nextAction || 'Qualificar necessidade e agendar demonstração.', owner: payload.owner || 'Vendas', updatedAt: nowIso() }; state.crm.leads.unshift(lead); pushActivity(state, 'crm_lead_created', 'Lead criado no CRM vivo', `${lead.company} entrou no pipeline com valor ${money(lead.value)}.`); return { ok: true, lead, dashboard: saveState(state) }; }
function addFinanceEntry(payload = {}) { const state = ensureState(); const entry = { id: `fin-${Date.now()}`, type: payload.type === 'despesa' ? 'despesa' : 'receita', label: payload.label || 'Lançamento Business Cloud', amount: Number(payload.amount || 1000), status: payload.status || 'previsto', dueDate: payload.dueDate || nowIso().slice(0, 10) }; state.finance.entries.unshift(entry); pushActivity(state, 'finance_entry_created', 'Lançamento financeiro registrado', `${entry.label}: ${money(entry.amount)} (${entry.type}).`); return { ok: true, entry, dashboard: saveState(state) }; }
function updateGoalProgress(payload = {}) { const state = ensureState(); const goal = state.goals.find((item) => item.id === payload.goalId) || state.goals[0]; goal.progress = Math.max(0, Math.min(100, Number(payload.progress ?? goal.progress))); goal.current = Number(payload.current ?? goal.current ?? 0); pushActivity(state, 'goal_updated', 'Meta atualizada', `${goal.title} agora está em ${goal.progress}%.`); return { ok: true, goal, dashboard: saveState(state) }; }
function generateInsight(payload = {}) { const state = ensureState(); const insight = { id: `bi-${Date.now()}`, severity: payload.severity || 'media', title: payload.title || 'Insight executivo automático', detail: payload.detail || 'Megan identificou uma oportunidade de melhoria na operação empresarial.', impact: payload.impact || 'operação' }; state.bi.insights.unshift(insight); pushActivity(state, 'bi_insight_created', 'Insight BI gerado', `${insight.title}: ${insight.detail}`); return { ok: true, insight, dashboard: saveState(state) }; }

module.exports = { getDashboard, createTeam, createLead, addFinanceEntry, updateGoalProgress, generateInsight };
