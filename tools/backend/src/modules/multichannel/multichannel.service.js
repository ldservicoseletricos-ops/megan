const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../../../data');
const STATE_FILE = path.join(DATA_DIR, 'multichannel-total-state.json');

function ensureState() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STATE_FILE)) {
    const now = new Date().toISOString();
    const initial = {
      updatedAt: now,
      channels: [
        { id: 'whatsapp', name: 'WhatsApp', status: 'ready', health: 96, purpose: 'Atendimento, vendas rápidas e follow-up em tempo real.', queue: 4 },
        { id: 'email', name: 'Email', status: 'ready', health: 94, purpose: 'Propostas, cobrança, respostas formais e nutrição.', queue: 7 },
        { id: 'telegram', name: 'Telegram', status: 'ready', health: 91, purpose: 'Alertas operacionais, grupos e comandos rápidos.', queue: 2 },
        { id: 'instagram', name: 'Instagram', status: 'configured_pending_token', health: 72, purpose: 'Captação social, DM, relacionamento e conteúdo.', queue: 5 },
        { id: 'site', name: 'Site', status: 'ready', health: 89, purpose: 'Chat web, formulários, landing pages e leads.', queue: 3 },
        { id: 'crm', name: 'CRM', status: 'ready', health: 93, purpose: 'Pipeline, histórico do cliente, tarefas e negócio vivo.', queue: 6 },
        { id: 'google_workspace', name: 'Google Workspace', status: 'ready', health: 92, purpose: 'Gmail, Calendar, Sheets, Drive e produtividade conectada.', queue: 8 }
      ],
      inbox: [
        { id: 'msg-001', channel: 'WhatsApp', contact: 'Lead empresa premium', intent: 'pedido_orcamento', priority: 'alta', text: 'Cliente pediu proposta para automação de atendimento.', status: 'triaged' },
        { id: 'msg-002', channel: 'Email', contact: 'Financeiro cliente ativo', intent: 'cobranca', priority: 'media', text: 'Solicitou segunda via e confirmação de pagamento.', status: 'triaged' },
        { id: 'msg-003', channel: 'Instagram', contact: 'Novo seguidor qualificado', intent: 'lead_social', priority: 'alta', text: 'Perguntou preço e prazo de implantação.', status: 'pending_token' },
        { id: 'msg-004', channel: 'Site', contact: 'Visitante landing page', intent: 'agendamento', priority: 'alta', text: 'Quer demonstração hoje.', status: 'ready_to_execute' }
      ],
      automations: [
        { id: 'auto-001', name: 'Lead multicanal para CRM', trigger: 'Nova mensagem com intenção comercial', action: 'Criar/atualizar contato, classificar oportunidade e iniciar follow-up.', status: 'active' },
        { id: 'auto-002', name: 'Proposta por Email + WhatsApp', trigger: 'Cliente pede orçamento', action: 'Gerar proposta, enviar por email e avisar no WhatsApp.', status: 'active' },
        { id: 'auto-003', name: 'Agenda Google automática', trigger: 'Cliente aceita demonstração', action: 'Criar evento no Calendar, registrar no CRM e confirmar por canal original.', status: 'active' },
        { id: 'auto-004', name: 'Sheets de métricas comerciais', trigger: 'Mudança no funil', action: 'Atualizar planilha de leads, receita prevista e conversão.', status: 'active' }
      ],
      metrics: {
        activeChannels: 7,
        connectedChannels: 6,
        queuedMessages: 35,
        routedToday: 18,
        responseCoverage: 91,
        averageResponseMinutes: 4
      },
      recentActions: [
        { id: 'act-001', title: 'Lead captado no site enviado ao CRM', result: 'pipeline atualizado', createdAt: now },
        { id: 'act-002', title: 'Follow-up preparado para WhatsApp', result: 'aguardando confirmação', createdAt: now },
        { id: 'act-003', title: 'Evento de demonstração sugerido no Calendar', result: 'slot encontrado', createdAt: now }
      ]
    };
    fs.writeFileSync(STATE_FILE, JSON.stringify(initial, null, 2));
  }
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

function saveState(state) {
  state.updatedAt = new Date().toISOString();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  return state;
}

function getDashboard() {
  const state = ensureState();
  return {
    ok: true,
    title: 'Megan OS 4.7 — MULTICANAL TOTAL',
    focus: 'Unificar WhatsApp, Email, Telegram, Instagram, Site, CRM e Google Workspace em uma central operacional.',
    status: 'multichannel_ready',
    ...state
  };
}

function routeMessage(payload = {}) {
  const state = ensureState();
  const channel = payload.channel || 'Site';
  const contact = payload.contact || 'Contato sem nome';
  const text = payload.text || 'Mensagem recebida pelo hub multicanal.';
  const lower = `${text} ${payload.intent || ''}`.toLowerCase();
  const intent = lower.includes('preço') || lower.includes('orcamento') || lower.includes('orçamento') ? 'pedido_orcamento'
    : lower.includes('agenda') || lower.includes('demo') ? 'agendamento'
    : lower.includes('cobran') || lower.includes('pagamento') ? 'cobranca'
    : 'atendimento';
  const priority = ['pedido_orcamento', 'agendamento'].includes(intent) ? 'alta' : 'media';
  const item = {
    id: `msg-${Date.now()}`,
    channel,
    contact,
    intent,
    priority,
    text,
    status: 'ready_to_execute'
  };
  state.inbox.unshift(item);
  state.metrics.queuedMessages += 1;
  state.metrics.routedToday += 1;
  state.recentActions.unshift({
    id: `act-${Date.now()}`,
    title: `Mensagem de ${channel} roteada para ${intent}`,
    result: `${contact} classificado com prioridade ${priority}`,
    createdAt: new Date().toISOString()
  });
  saveState(state);
  return { ok: true, routed: item, recommendedAction: buildRecommendedAction(item) };
}

function buildRecommendedAction(item) {
  const map = {
    pedido_orcamento: 'Criar oportunidade no CRM, gerar proposta e responder no canal original.',
    agendamento: 'Consultar Google Calendar, sugerir horários e registrar tarefa no CRM.',
    cobranca: 'Validar status financeiro, enviar segunda via e atualizar histórico do cliente.',
    atendimento: 'Responder dúvida, registrar contexto e criar follow-up se necessário.'
  };
  return map[item.intent] || map.atendimento;
}

function executeNext() {
  const state = ensureState();
  const item = state.inbox.find((message) => message.status === 'ready_to_execute' || message.status === 'triaged');
  if (!item) return { ok: true, executed: null, message: 'Nenhuma mensagem pronta para execução.' };
  item.status = 'executed';
  const action = {
    id: `act-${Date.now()}`,
    title: `Execução multicanal para ${item.contact}`,
    result: buildRecommendedAction(item),
    createdAt: new Date().toISOString()
  };
  state.recentActions.unshift(action);
  state.metrics.queuedMessages = Math.max(0, state.metrics.queuedMessages - 1);
  saveState(state);
  return { ok: true, executed: item, action };
}

module.exports = { getDashboard, routeMessage, executeNext };
