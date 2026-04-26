const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../../../data');
const filePath = path.join(dataDir, 'autonomous-agents-state.json');

const initialState = {
  version: '4.6.0',
  status: 'active_supervised',
  title: 'Megan OS 4.6 — AGENTES AUTÔNOMOS REAIS',
  focus: 'Agentes executam ciclos recorrentes sem depender de comando manual, com limites de segurança e supervisão.',
  autonomyLevel: 82,
  safetyMode: 'supervisionado',
  agents: [
    { id: 'sales-agent', name: 'Agente Vendas', area: 'vendas', status: 'running', cadence: 'a cada 15 minutos', lastRun: null, nextAction: 'captar leads, qualificar oportunidades e iniciar follow-up', permissions: ['crm.read', 'crm.write', 'proposal.create', 'message.draft'], requiresApprovalFor: ['send_message', 'charge_customer'] },
    { id: 'support-agent', name: 'Agente Suporte', area: 'suporte', status: 'running', cadence: 'a cada 10 minutos', lastRun: null, nextAction: 'ler solicitações, responder dúvidas comuns e escalar casos críticos', permissions: ['inbox.read', 'ticket.write', 'message.draft'], requiresApprovalFor: ['refund', 'contract_change'] },
    { id: 'deploy-agent', name: 'Agente Deploy', area: 'deploy', status: 'standby', cadence: 'sob mudança aprovada', lastRun: null, nextAction: 'validar build, preparar publicação e acompanhar Render/Vercel/GitHub', permissions: ['github.read', 'render.status', 'vercel.status'], requiresApprovalFor: ['production_deploy', 'rollback'] },
    { id: 'finance-agent', name: 'Agente Financeiro', area: 'financeiro', status: 'running', cadence: 'diário às 08:00', lastRun: null, nextAction: 'acompanhar caixa, cobranças, vencimentos e alertas financeiros', permissions: ['stripe.read', 'billing.read', 'invoice.draft'], requiresApprovalFor: ['send_invoice', 'cancel_subscription'] }
  ],
  queue: [
    { id: 'task-sales-001', agentId: 'sales-agent', title: 'Qualificar leads quentes', priority: 96, status: 'ready', action: 'separar leads por intenção de compra e criar proposta inicial' },
    { id: 'task-support-001', agentId: 'support-agent', title: 'Responder solicitações pendentes', priority: 91, status: 'ready', action: 'gerar respostas seguras para dúvidas comuns' },
    { id: 'task-deploy-001', agentId: 'deploy-agent', title: 'Verificar saúde de produção', priority: 88, status: 'ready', action: 'checar backend, frontend, logs e variáveis críticas' },
    { id: 'task-finance-001', agentId: 'finance-agent', title: 'Acompanhar caixa e cobrança', priority: 93, status: 'ready', action: 'identificar pagamentos atrasados e preparar lembretes' }
  ],
  executions: [],
  approvals: [],
  policies: [
    'Nunca enviar cobrança real sem aprovação.',
    'Nunca publicar deploy de produção sem aprovação.',
    'Nunca apagar dados de clientes automaticamente.',
    'Mensagens externas podem ser geradas como rascunho antes do envio.',
    'Toda execução autônoma deve gerar log auditável.'
  ]
};

function ensureStore() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(filePath)) save(initialState);
}

function read() {
  ensureStore();
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch (_error) { save(initialState); return { ...initialState }; }
}

function save(state) {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(state, null, 2));
  return state;
}

module.exports = { read, save, initialState };
