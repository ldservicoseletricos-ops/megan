const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../../../data');
const STATE_FILE = path.join(DATA_DIR, 'global-command-center-state.json');

function nowIso() { return new Date().toISOString(); }
function ensureDataDir() { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); }

function buildInitialState() {
  const now = nowIso();
  return {
    updatedAt: now,
    mode: 'global_command_center_supervised',
    title: 'Megan OS 4.9 — CENTRAL DE COMANDO GLOBAL',
    focus: 'Painel único para vida, empresas, equipes, vendas, alertas, metas e agentes.',
    health: { globalScore: 93, operationMode: 'online_supervisionado', riskLevel: 'controlado', lastSync: now },
    areas: [
      { id: 'vida', title: 'Vida', status: 'organized', score: 91, trend: '+8%', summary: 'Agenda, foco diário, saúde, finanças pessoais e lembretes reais em uma visão única.' },
      { id: 'empresas', title: 'Empresas', status: 'operating', score: 89, trend: '+12%', summary: 'Negócios, propostas, cobranças, contratos e entregas monitorados pela Megan.' },
      { id: 'equipes', title: 'Equipes', status: 'aligned', score: 86, trend: '+6%', summary: 'Demandas, responsáveis, prazos, bloqueios e prioridades organizadas.' },
      { id: 'vendas', title: 'Vendas', status: 'active_pipeline', score: 94, trend: '+18%', summary: 'Leads, follow-up, propostas, oportunidades e clientes sem resposta.' },
      { id: 'alertas', title: 'Alertas', status: 'watching', score: 97, trend: 'estável', summary: 'Riscos, atrasos, cobranças, deploys, integrações e pendências críticas.' },
      { id: 'metas', title: 'Metas', status: 'tracking', score: 88, trend: '+9%', summary: 'Metas pessoais, empresariais e operacionais com acompanhamento diário.' },
      { id: 'agentes', title: 'Agentes', status: 'supervised_autonomy', score: 92, trend: '+15%', summary: 'Vendas, suporte, deploy, financeiro, CRM, agenda e aprendizado trabalhando em conjunto.' }
    ],
    metrics: { activeAreas: 7, alertsOpen: 5, goalsTracked: 12, agentsOnline: 8, salesPipeline: 27, teamTasks: 34, personalFocus: 91, companyPulse: 89 },
    alerts: [
      { id: 'alert-001', level: 'high', area: 'vendas', title: 'Clientes sem resposta há mais de 24h', action: 'Acionar agente vendas para follow-up supervisionado.', status: 'open', createdAt: now },
      { id: 'alert-002', level: 'medium', area: 'financeiro', title: 'Cobranças próximas do vencimento', action: 'Preparar mensagens de cobrança e registrar no CRM.', status: 'open', createdAt: now },
      { id: 'alert-003', level: 'medium', area: 'deploy', title: 'Publicação aguardando validação', action: 'Executar checklist Render/Vercel/GitHub antes de publicar.', status: 'waiting_confirmation', createdAt: now },
      { id: 'alert-004', level: 'low', area: 'vida', title: 'Foco diário ainda não revisado', action: 'Montar plano do dia com agenda, metas e lembretes.', status: 'open', createdAt: now },
      { id: 'alert-005', level: 'high', area: 'equipes', title: 'Tarefas sem responsável definido', action: 'Distribuir prioridades e solicitar confirmação.', status: 'open', createdAt: now }
    ],
    goals: [
      { id: 'goal-001', area: 'empresas', title: 'Fechar 3 clientes B2B', progress: 68, nextStep: 'Enviar propostas automáticas para leads quentes.' },
      { id: 'goal-002', area: 'vendas', title: 'Aumentar conversão do funil', progress: 74, nextStep: 'Responder leads parados e medir retorno.' },
      { id: 'goal-003', area: 'vida', title: 'Organizar rotina semanal', progress: 82, nextStep: 'Revisar agenda, saúde, finanças e foco diário.' },
      { id: 'goal-004', area: 'agentes', title: 'Ativar operação semi-autônoma', progress: 61, nextStep: 'Liberar execução supervisionada por agente.' }
    ],
    agents: [
      { id: 'agent-sales', name: 'Agente Vendas', status: 'online', autonomy: 84, currentTask: 'Captar leads, responder clientes e gerar propostas.' },
      { id: 'agent-support', name: 'Agente Suporte', status: 'online', autonomy: 78, currentTask: 'Responder dúvidas e classificar urgências.' },
      { id: 'agent-finance', name: 'Agente Financeiro', status: 'watching', autonomy: 73, currentTask: 'Acompanhar caixa, cobranças e vencimentos.' },
      { id: 'agent-deploy', name: 'Agente Deploy', status: 'waiting_confirmation', autonomy: 66, currentTask: 'Preparar publicação em GitHub, Render e Vercel.' },
      { id: 'agent-life', name: 'Agente Vida', status: 'online', autonomy: 81, currentTask: 'Agenda, saúde, metas e lembretes pessoais.' },
      { id: 'agent-crm', name: 'Agente CRM Vivo', status: 'online', autonomy: 88, currentTask: 'Atualizar pipeline, contatos, histórico e oportunidades.' }
    ],
    commandTimeline: [
      { id: 'cmd-001', command: 'Abrir visão global', result: 'Central consolidada com áreas críticas.', status: 'completed', createdAt: now },
      { id: 'cmd-002', command: 'Priorizar vendas e cobranças', result: 'Alertas de vendas e financeiro destacados.', status: 'completed', createdAt: now }
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
  state.health.lastSync = state.updatedAt;
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  return state;
}

function getDashboard() { return { ok: true, ...ensureState() }; }

function classifyGlobalCommand(command = '') {
  const text = String(command).toLowerCase();
  if (text.includes('venda') || text.includes('lead') || text.includes('cliente')) return { area: 'vendas', risk: 'medium', agent: 'Agente Vendas', result: 'Priorizei leads, clientes sem resposta, propostas e follow-up.' };
  if (text.includes('cobran') || text.includes('finance') || text.includes('caixa')) return { area: 'empresas', risk: 'medium', agent: 'Agente Financeiro', result: 'Analisei cobranças, vencimentos e riscos do caixa.' };
  if (text.includes('agenda') || text.includes('vida') || text.includes('foco')) return { area: 'vida', risk: 'low', agent: 'Agente Vida', result: 'Organizei foco diário, agenda, metas e lembretes.' };
  if (text.includes('deploy') || text.includes('publicar') || text.includes('render') || text.includes('vercel')) return { area: 'agentes', risk: 'high', agent: 'Agente Deploy', result: 'Preparei checklist de deploy e bloqueei publicação até confirmação manual.' };
  if (text.includes('equipe') || text.includes('tarefa')) return { area: 'equipes', risk: 'medium', agent: 'Agente Operacional', result: 'Organizei tarefas, responsáveis, prioridades e bloqueios.' };
  return { area: 'alertas', risk: 'low', agent: 'Orquestrador Global', result: 'Atualizei a visão global e destaquei prioridades.' };
}

function runGlobalCommand(payload = {}) {
  const state = ensureState();
  const command = payload.command || 'Megan, mostrar visão global e próximos passos';
  const classified = classifyGlobalCommand(command);
  const item = { id: `cmd-${Date.now()}`, command, area: classified.area, agent: classified.agent, risk: classified.risk, result: classified.result, status: classified.risk === 'high' ? 'waiting_confirmation' : 'completed', createdAt: nowIso() };
  state.commandTimeline.unshift(item);
  state.health.globalScore = Math.min(99, Number(state.health.globalScore || 90) + 1);
  if (classified.risk === 'high') {
    state.alerts.unshift({ id: `alert-${Date.now()}`, level: 'high', area: classified.area, title: 'Ação crítica exige confirmação', action: classified.result, status: 'waiting_confirmation', createdAt: nowIso() });
  }
  state.metrics.alertsOpen = state.alerts.filter((alert) => alert.status !== 'resolved_supervised').length;
  saveState(state);
  return { ok: true, command: item, dashboard: state };
}

function createGoal(payload = {}) {
  const state = ensureState();
  const goal = { id: `goal-${Date.now()}`, area: payload.area || 'metas', title: payload.title || 'Nova meta global', progress: Number(payload.progress || 0), nextStep: payload.nextStep || 'Definir próximo passo supervisionado.' };
  state.goals.unshift(goal);
  state.metrics.goalsTracked = state.goals.length;
  saveState(state);
  return { ok: true, goal };
}

function resolveAlert(payload = {}) {
  const state = ensureState();
  const alert = state.alerts.find((item) => item.id === payload.alertId) || state.alerts[0];
  if (alert) {
    alert.status = 'resolved_supervised';
    alert.resolvedAt = nowIso();
  }
  state.metrics.alertsOpen = state.alerts.filter((item) => item.status !== 'resolved_supervised').length;
  saveState(state);
  return { ok: true, alert };
}

module.exports = { getDashboard, runGlobalCommand, createGoal, resolveAlert };
