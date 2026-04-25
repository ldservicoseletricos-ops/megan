const { readStore, writeStore, addActivity } = require('./autoempresa-store.service');

const VERSION = '4.3.0';

function money(value = 0) {
  return Number(value || 0);
}

function getMetrics() {
  const store = readStore();
  const leads = store.leads || [];
  const proposals = store.proposals || [];
  const billing = store.billing || [];
  const openPipeline = leads.reduce((sum, lead) => sum + money(lead.valueEstimate), 0);
  const proposalValue = proposals.reduce((sum, item) => sum + money(item.value), 0);
  const pendingBilling = billing
    .filter((item) => item.status !== 'paid')
    .reduce((sum, item) => sum + money(item.amount), 0);

  return {
    ok: true,
    version: VERSION,
    title: 'Megan OS 4.3 — AUTOEMPRESA',
    metrics: {
      leadsCaptured: leads.length,
      hotLeads: leads.filter((lead) => money(lead.score) >= 80).length,
      proposalsReady: proposals.length,
      followUpsScheduled: (store.followUps || []).length,
      billingActions: billing.length,
      openPipeline,
      proposalValue,
      pendingBilling,
      crmHealth: leads.length ? 'alive' : 'waiting_leads',
      automationMode: 'semi_autonomous_supervised',
    },
  };
}

function getCrmLive() {
  const store = readStore();
  return {
    ok: true,
    version: VERSION,
    title: 'CRM Vivo 4.3',
    stages: {
      new: (store.leads || []).filter((lead) => lead.stage === 'new'),
      qualified: (store.leads || []).filter((lead) => lead.stage === 'qualified'),
      proposal: (store.leads || []).filter((lead) => lead.stage === 'proposal'),
      follow_up: (store.leads || []).filter((lead) => lead.stage === 'follow_up'),
      billing: (store.leads || []).filter((lead) => lead.stage === 'billing'),
      won: (store.leads || []).filter((lead) => lead.stage === 'won'),
    },
    leads: store.leads || [],
    proposals: store.proposals || [],
    followUps: store.followUps || [],
    billing: store.billing || [],
    activity: store.activity || [],
  };
}

function getDashboard() {
  const metrics = getMetrics();
  const crm = getCrmLive();
  return {
    ok: true,
    version: VERSION,
    title: 'Megan OS 4.3 — AUTOEMPRESA',
    status: 'ready_to_sell_b2b',
    focus: 'Megan opera negócios semi-autônomos com supervisão humana.',
    value: 'Produto vendável para empresas: captação, atendimento, propostas, follow-up, cobrança, métricas e CRM vivo.',
    capabilities: [
      'captar leads',
      'responder clientes',
      'gerar propostas automáticas',
      'fazer follow-up',
      'organizar cobrança',
      'acompanhar métricas',
      'manter CRM vivo',
    ],
    safety: {
      defaultMode: 'supervisionado',
      realWorldExecution: 'integra com os conectores 4.2 quando credenciais estiverem configuradas',
      approval: 'ações sensíveis podem exigir aprovação antes do envio real',
    },
    metrics: metrics.metrics,
    crm,
  };
}

function captureLead(payload = {}) {
  const store = readStore();
  const valueEstimate = money(payload.valueEstimate || payload.value || 1500);
  const score = Math.min(100, Math.max(40, Number(payload.score || (valueEstimate >= 3000 ? 88 : 76))));
  const lead = {
    id: `lead_${Date.now()}`,
    name: payload.name || payload.company || 'Novo lead',
    company: payload.company || payload.name || 'Empresa sem nome',
    channel: payload.channel || 'Manual',
    email: payload.email || '',
    phone: payload.phone || '',
    need: payload.need || payload.message || 'Necessidade comercial ainda não detalhada',
    valueEstimate,
    stage: score >= 80 ? 'qualified' : 'new',
    score,
    createdAt: new Date().toISOString(),
    lastAction: 'Lead captado e qualificado pela Megan OS 4.3',
  };
  store.leads = [lead, ...(store.leads || [])];
  addActivity(store, 'lead', `Lead captado: ${lead.company}`);
  writeStore(store);
  return { ok: true, version: VERSION, lead, nextStep: score >= 80 ? 'gerar proposta automática' : 'enriquecer dados e iniciar atendimento' };
}

function replyCustomer(payload = {}) {
  const store = readStore();
  const lead = (store.leads || []).find((item) => item.id === payload.leadId) || (store.leads || [])[0] || {};
  const reply = {
    id: `reply_${Date.now()}`,
    leadId: payload.leadId || lead.id || null,
    channel: payload.channel || lead.channel || 'WhatsApp',
    subject: payload.subject || 'Resposta comercial Megan OS',
    message: payload.message || `Olá ${lead.name || 'cliente'}, a Megan analisou sua necessidade e pode preparar uma solução com atendimento, CRM, follow-up e cobrança automatizada. Posso te enviar uma proposta objetiva?`,
    status: payload.execute ? 'ready_to_send_real_channel' : 'draft_ready',
    createdAt: new Date().toISOString(),
  };
  store.replies = [reply, ...(store.replies || [])];
  addActivity(store, 'reply', `Resposta criada para ${lead.company || 'cliente'}`);
  writeStore(store);
  return { ok: true, version: VERSION, reply, mode: payload.execute ? 'real_channel_ready' : 'draft_supervised' };
}

function createProposal(payload = {}) {
  const store = readStore();
  const lead = (store.leads || []).find((item) => item.id === payload.leadId) || (store.leads || [])[0] || {};
  const value = money(payload.value || lead.valueEstimate || 2500);
  const proposal = {
    id: `proposal_${Date.now()}`,
    leadId: payload.leadId || lead.id || null,
    company: payload.company || lead.company || 'Empresa cliente',
    title: payload.title || 'Proposta Megan OS AUTOEMPRESA',
    value,
    recurrence: payload.recurrence || 'mensal',
    scope: payload.scope || [
      'CRM vivo com pipeline comercial',
      'Atendimento inicial automático',
      'Follow-up inteligente',
      'Métricas executivas',
      'Cobrança organizada',
    ],
    status: 'draft_ready',
    createdAt: new Date().toISOString(),
  };
  store.proposals = [proposal, ...(store.proposals || [])];
  store.leads = (store.leads || []).map((item) => item.id === proposal.leadId ? { ...item, stage: 'proposal', lastAction: 'Proposta automática gerada' } : item);
  addActivity(store, 'proposal', `Proposta criada para ${proposal.company}`);
  writeStore(store);
  return { ok: true, version: VERSION, proposal, nextStep: 'enviar proposta e programar follow-up' };
}

function createFollowUp(payload = {}) {
  const store = readStore();
  const lead = (store.leads || []).find((item) => item.id === payload.leadId) || (store.leads || [])[0] || {};
  const followUp = {
    id: `follow_${Date.now()}`,
    leadId: payload.leadId || lead.id || null,
    company: payload.company || lead.company || 'Cliente',
    channel: payload.channel || lead.channel || 'WhatsApp',
    when: payload.when || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    message: payload.message || 'Follow-up consultivo: confirmar recebimento da proposta e remover objeções.',
    status: 'scheduled',
    createdAt: new Date().toISOString(),
  };
  store.followUps = [followUp, ...(store.followUps || [])];
  store.leads = (store.leads || []).map((item) => item.id === followUp.leadId ? { ...item, stage: 'follow_up', lastAction: 'Follow-up agendado' } : item);
  addActivity(store, 'follow_up', `Follow-up agendado para ${followUp.company}`);
  writeStore(store);
  return { ok: true, version: VERSION, followUp };
}

function createBillingAction(payload = {}) {
  const store = readStore();
  const billing = {
    id: `billing_${Date.now()}`,
    leadId: payload.leadId || null,
    company: payload.company || 'Cliente',
    amount: money(payload.amount || payload.value || 1500),
    dueDate: payload.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    status: payload.status || 'pending',
    description: payload.description || 'Cobrança gerada pela Megan OS 4.3 AUTOEMPRESA',
    createdAt: new Date().toISOString(),
  };
  store.billing = [billing, ...(store.billing || [])];
  addActivity(store, 'billing', `Cobrança organizada para ${billing.company}`);
  writeStore(store);
  return { ok: true, version: VERSION, billing, nextStep: 'acompanhar pagamento e atualizar CRM' };
}

function runBusinessCycle(payload = {}) {
  const leadResult = captureLead(payload.lead || payload);
  const replyResult = replyCustomer({ leadId: leadResult.lead.id, channel: leadResult.lead.channel });
  const proposalResult = createProposal({ leadId: leadResult.lead.id, value: leadResult.lead.valueEstimate });
  const followUpResult = createFollowUp({ leadId: leadResult.lead.id });
  return {
    ok: true,
    version: VERSION,
    title: 'Ciclo AUTOEMPRESA executado',
    lead: leadResult.lead,
    reply: replyResult.reply,
    proposal: proposalResult.proposal,
    followUp: followUpResult.followUp,
    metrics: getMetrics().metrics,
  };
}

module.exports = {
  getDashboard,
  getMetrics,
  getCrmLive,
  captureLead,
  replyCustomer,
  createProposal,
  createFollowUp,
  createBillingAction,
  runBusinessCycle,
};
