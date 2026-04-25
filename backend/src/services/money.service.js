
const fs = require('fs');
const path = require('path');

let Stripe = null;
try {
  Stripe = require('stripe');
} catch (_error) {
  Stripe = null;
}

const dataDir = path.resolve(__dirname, '..', 'data');
const leadsFile = path.join(dataDir, 'money-leads.json');
const trialsFile = path.join(dataDir, 'money-trials.json');
const checkoutsFile = path.join(dataDir, 'money-checkouts.json');
const crmFile = path.join(dataDir, 'money-crm.json');

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 97,
    currency: 'BRL',
    cycle: 'month',
    badge: 'Entrada rápida',
    description: 'Para quem quer usar a Megan como central de operação e comando.',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 297,
    currency: 'BRL',
    cycle: 'month',
    badge: 'Mais forte',
    description: 'Para operação real com squads, automações e rotina de crescimento.',
    featured: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 1490,
    currency: 'BRL',
    cycle: 'month',
    badge: 'Operação premium',
    description: 'Para empresas que querem implantar a Megan como sistema operacional interno.',
  },
];

const crmStages = [
  { id: 'new', name: 'Novo lead' },
  { id: 'qualified', name: 'Qualificado' },
  { id: 'proposal', name: 'Proposta' },
  { id: 'negotiation', name: 'Negociação' },
  { id: 'won', name: 'Cliente ativo' },
  { id: 'lost', name: 'Perdido' },
];

function ensureFile(filePath, initialValue) {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(initialValue, null, 2), 'utf-8');
  }
}

function readJson(filePath, fallback) {
  ensureFile(filePath, fallback);
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (_error) {
    return fallback;
  }
}

function writeJson(filePath, value) {
  ensureFile(filePath, []);
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf-8');
  return value;
}

function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizePlan(input) {
  const key = String(input || '').trim().toLowerCase();
  return plans.find((plan) => plan.id === key) || plans[1];
}

function listLeads() {
  return readJson(leadsFile, []);
}

function listTrials() {
  return readJson(trialsFile, []);
}

function listCheckouts() {
  return readJson(checkoutsFile, []);
}

function listCrm() {
  return readJson(crmFile, []);
}

function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY || !Stripe) {
    return null;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function getPlanPriceId(planId) {
  const map = {
    starter: process.env.STRIPE_PRICE_ID_STARTER || '',
    pro: process.env.STRIPE_PRICE_ID_PRO || '',
    enterprise: process.env.STRIPE_PRICE_ID_ENTERPRISE || '',
  };
  return map[planId] || '';
}

function ensureCrmEntryForLead(lead) {
  const crm = listCrm();
  const existing = crm.find((item) => item.leadId === lead.id);
  if (existing) {
    return existing;
  }

  const entry = {
    id: uid('crm'),
    leadId: lead.id,
    leadName: lead.name,
    email: lead.email,
    company: lead.company,
    planId: lead.planId,
    stage: 'new',
    owner: 'Megan Sales',
    temperature: 'warm',
    notes: lead.notes || '',
    nextAction: 'Realizar contato inicial em até 24h',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  crm.unshift(entry);
  writeJson(crmFile, crm);
  return entry;
}

function createLead(payload = {}) {
  const lead = {
    id: uid('lead'),
    name: String(payload.name || '').trim(),
    email: String(payload.email || '').trim().toLowerCase(),
    company: String(payload.company || '').trim(),
    segment: String(payload.segment || 'empresa').trim(),
    interest: String(payload.interest || 'trial').trim(),
    planId: normalizePlan(payload.planId).id,
    notes: String(payload.notes || '').trim(),
    source: String(payload.source || 'money-mode').trim(),
    status: 'new',
    createdAt: new Date().toISOString(),
  };

  if (!lead.name) {
    throw new Error('Nome é obrigatório.');
  }
  if (!lead.email || !lead.email.includes('@')) {
    throw new Error('Email válido é obrigatório.');
  }

  const leads = listLeads();
  leads.unshift(lead);
  writeJson(leadsFile, leads);
  const crmEntry = ensureCrmEntryForLead(lead);
  return { ...lead, crmId: crmEntry.id };
}

function startTrial(payload = {}) {
  const plan = normalizePlan(payload.planId);
  const lead = createLead({ ...payload, interest: 'trial', planId: plan.id });
  const now = new Date();
  const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const trial = {
    id: uid('trial'),
    leadId: lead.id,
    planId: plan.id,
    planName: plan.name,
    status: 'active',
    startedAt: now.toISOString(),
    endsAt: end.toISOString(),
    activationChecklist: [
      'Criar onboarding inicial',
      'Executar demo guiada',
      'Validar percepção de valor',
    ],
  };
  const trials = listTrials();
  trials.unshift(trial);
  writeJson(trialsFile, trials);
  updateCrmStageByLead(lead.id, {
    stage: 'qualified',
    nextAction: 'Conduzir trial e mapear dores prioritárias',
    notes: 'Lead entrou em trial ativo.',
  });
  return { lead, trial };
}

function createCheckout(payload = {}) {
  const plan = normalizePlan(payload.planId);
  const lead = createLead({ ...payload, interest: 'checkout', planId: plan.id });
  const hasStripe = Boolean(getStripeClient());
  const checkout = {
    id: uid('checkout'),
    leadId: lead.id,
    planId: plan.id,
    planName: plan.name,
    amount: plan.price,
    currency: plan.currency,
    status: 'pending',
    provider: hasStripe ? 'stripe' : 'simulation',
    checkoutUrl: hasStripe
      ? `/api/money/checkouts/${uid('placeholder')}/stripe-session`
      : `/checkout/${plan.id}/${lead.id}`,
    stripeSessionId: '',
    stripePriceId: getPlanPriceId(plan.id),
    createdAt: new Date().toISOString(),
  };
  const checkouts = listCheckouts();
  checkouts.unshift(checkout);
  writeJson(checkoutsFile, checkouts);
  updateCrmStageByLead(lead.id, {
    stage: 'proposal',
    nextAction: 'Follow-up de checkout e proposta comercial',
    notes: `Checkout iniciado no modo ${checkout.provider}.`,
  });
  return { lead, checkout };
}

function updateCheckoutRecord(updated) {
  const checkouts = listCheckouts();
  const index = checkouts.findIndex((item) => item.id === updated.id);
  if (index === -1) {
    throw new Error('Checkout não encontrado.');
  }
  checkouts[index] = { ...checkouts[index], ...updated, updatedAt: new Date().toISOString() };
  writeJson(checkoutsFile, checkouts);
  return checkouts[index];
}

function updateCheckoutStatus(checkoutId, status) {
  const checkouts = listCheckouts();
  const index = checkouts.findIndex((item) => item.id === checkoutId);
  if (index === -1) {
    throw new Error('Checkout não encontrado.');
  }

  checkouts[index] = {
    ...checkouts[index],
    status: String(status || 'pending').trim() || 'pending',
    updatedAt: new Date().toISOString(),
  };
  writeJson(checkoutsFile, checkouts);

  const stage = checkouts[index].status === 'paid' ? 'won' : 'negotiation';
  const nextAction = checkouts[index].status === 'paid'
    ? 'Iniciar onboarding pago e ativação do cliente.'
    : 'Executar contato comercial para fechar checkout.';
  updateCrmStageByLead(checkouts[index].leadId, {
    stage,
    nextAction,
    notes: `Checkout atualizado para ${checkouts[index].status}.`,
  });

  return checkouts[index];
}

function activatePaidCheckoutBySession(sessionId, paymentStatus = 'paid') {
  const checkouts = listCheckouts();
  const checkout = checkouts.find((item) => item.stripeSessionId === sessionId);
  if (!checkout) {
    return null;
  }
  return updateCheckoutStatus(checkout.id, paymentStatus === 'paid' ? 'paid' : 'negotiation');
}

async function createStripeCheckoutSession(checkoutId, payload = {}) {
  const checkouts = listCheckouts();
  const checkout = checkouts.find((item) => item.id === checkoutId);
  if (!checkout) {
    throw new Error('Checkout não encontrado.');
  }

  const stripe = getStripeClient();
  const appBaseUrl = String(process.env.APP_BASE_URL || payload.appBaseUrl || 'http://localhost:5173').replace(/\/+$/, '');

  if (!stripe) {
    const simulated = updateCheckoutRecord({
      ...checkout,
      provider: 'simulation',
      checkoutUrl: `${appBaseUrl}/checkout/simulado/${checkout.id}`,
    });

    return {
      mode: 'simulation',
      checkout: simulated,
      url: simulated.checkoutUrl,
    };
  }

  const priceId = checkout.stripePriceId || getPlanPriceId(checkout.planId);
  if (!priceId) {
    throw new Error(`Stripe configurado, mas o price id do plano ${checkout.planId} não foi informado.`);
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: payload.successUrl || `${appBaseUrl}/?checkout=success`,
    cancel_url: payload.cancelUrl || `${appBaseUrl}/?checkout=cancelled`,
    customer_email: payload.email || undefined,
    metadata: {
      checkoutId: checkout.id,
      leadId: checkout.leadId,
      planId: checkout.planId,
    },
  });

  const updated = updateCheckoutRecord({
    ...checkout,
    provider: 'stripe',
    stripeSessionId: session.id,
    checkoutUrl: session.url,
  });

  return {
    mode: 'stripe',
    checkout: updated,
    url: session.url,
    sessionId: session.id,
  };
}

function updateCrmStage(entryId, payload = {}) {
  const crm = listCrm();
  const index = crm.findIndex((item) => item.id === entryId);
  if (index === -1) {
    throw new Error('Item CRM não encontrado.');
  }

  const stage = String(payload.stage || crm[index].stage).trim();
  if (!crmStages.some((item) => item.id === stage)) {
    throw new Error('Stage CRM inválido.');
  }

  crm[index] = {
    ...crm[index],
    stage,
    owner: String(payload.owner || crm[index].owner || 'Megan Sales').trim(),
    temperature: String(payload.temperature || crm[index].temperature || 'warm').trim(),
    nextAction: String(payload.nextAction || crm[index].nextAction || '').trim(),
    notes: String(payload.notes || crm[index].notes || '').trim(),
    updatedAt: new Date().toISOString(),
  };

  writeJson(crmFile, crm);
  return crm[index];
}

function updateCrmStageByLead(leadId, payload = {}) {
  const crm = listCrm();
  const existing = crm.find((item) => item.leadId === leadId);
  if (!existing) {
    return null;
  }
  return updateCrmStage(existing.id, payload);
}

function getStripeConfig() {
  const stripeEnabled = Boolean(process.env.STRIPE_SECRET_KEY && Stripe);
  return {
    enabled: stripeEnabled,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhookConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    priceIds: {
      starter: process.env.STRIPE_PRICE_ID_STARTER || '',
      pro: process.env.STRIPE_PRICE_ID_PRO || '',
      enterprise: process.env.STRIPE_PRICE_ID_ENTERPRISE || '',
    },
    mode: stripeEnabled ? 'ready_for_live_checkout' : 'simulation',
  };
}

function buildWebhookSummary(event) {
  return {
    id: event?.id || uid('evt'),
    type: event?.type || 'unknown',
    livemode: Boolean(event?.livemode),
    receivedAt: new Date().toISOString(),
  };
}

function parseWebhookBody(bodyBuffer) {
  try {
    return JSON.parse(Buffer.isBuffer(bodyBuffer) ? bodyBuffer.toString('utf-8') : String(bodyBuffer || '{}'));
  } catch (_error) {
    return {};
  }
}

function processStripeWebhook({ rawBody, signature }) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  let event;

  if (stripe && webhookSecret && rawBody && signature) {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } else {
    event = parseWebhookBody(rawBody);
  }

  let checkout = null;
  if (event?.type === 'checkout.session.completed') {
    const sessionId = event?.data?.object?.id || event?.id || '';
    checkout = activatePaidCheckoutBySession(sessionId, 'paid');
  }

  return {
    summary: buildWebhookSummary(event),
    checkout,
  };
}

function getDashboard() {
  const leads = listLeads();
  const trials = listTrials();
  const checkouts = listCheckouts();
  const crm = listCrm();

  const revenuePotential = checkouts
    .filter((item) => item.status === 'pending')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const paidRevenue = checkouts
    .filter((item) => item.status === 'paid')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return {
    totals: {
      leads: leads.length,
      activeTrials: trials.filter((item) => item.status === 'active').length,
      pendingCheckouts: checkouts.filter((item) => item.status === 'pending').length,
      revenuePotential,
      paidRevenue,
      crmOpen: crm.filter((item) => !['won', 'lost'].includes(item.stage)).length,
    },
    latestLead: leads[0] || null,
    latestTrial: trials[0] || null,
    latestCheckout: checkouts[0] || null,
    crmStages: crmStages.map((stage) => ({
      ...stage,
      count: crm.filter((item) => item.stage === stage.id).length,
    })),
    plans,
    stripe: getStripeConfig(),
  };
}

module.exports = {
  plans,
  crmStages,
  listPlans: () => plans,
  listLeads,
  listTrials,
  listCheckouts,
  listCrm,
  createLead,
  startTrial,
  createCheckout,
  createStripeCheckoutSession,
  updateCheckoutStatus,
  updateCrmStage,
  getDashboard,
  getStripeConfig,
  processStripeWebhook,
};
