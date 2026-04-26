const state = {
  version: '27.0.0',
  name: 'Revenue Engine Consolidation',
  currency: 'BRL',
  totals: {
    revenueToday: 24780.5,
    revenueMonth: 589347.82,
    activeClients: 1428,
    newLeads: 3215,
    averageTicket: 342.18,
    conversionRate: 18.7
  },
  pipeline: [
    { stage: 'Leads', count: 3215, value: 180000 },
    { stage: 'Qualificados', count: 1823, value: 248000 },
    { stage: 'Propostas', count: 847, value: 331000 },
    { stage: 'Negociação', count: 423, value: 410000 },
    { stage: 'Fechados', count: 172, value: 589347.82 }
  ],
  automations: [
    { id: 'lead-followup', name: 'Follow-up automático de leads', status: 'active' },
    { id: 'cart-recovery', name: 'Recuperação de carrinho', status: 'active' },
    { id: 'upsell', name: 'Upsell automático', status: 'active' },
    { id: 'proposal-ai', name: 'Propostas comerciais por IA', status: 'active' }
  ],
  alerts: [
    { level: 'warning', message: '7 pagamentos precisam de revisão' },
    { level: 'info', message: '3 leads aguardam contato humano' },
    { level: 'success', message: 'Revenue Engine operacional' }
  ]
};

function status() {
  return {
    ok: true,
    module: state.name,
    version: state.version,
    status: 'online',
    capabilities: [
      'financeiro consolidado',
      'CRM comercial',
      'funil de vendas',
      'ofertas IA',
      'follow-up automático',
      'dashboard CEO',
      'analytics de receita'
    ],
    timestamp: new Date().toISOString()
  };
}

function dashboard() {
  return { ok: true, data: state, timestamp: new Date().toISOString() };
}

function createOffer(input = {}) {
  const product = input.product || 'Oferta Megan OS';
  const audience = input.audience || 'empresas e profissionais';
  const price = input.price || 'R$ 297,00/mês';
  return {
    ok: true,
    offer: {
      title: `${product} — automação e crescimento com IA`,
      audience,
      price,
      promise: 'economizar tempo, aumentar vendas e organizar a operação com Megan OS',
      checkoutStatus: 'ready_to_connect',
      funnelSteps: ['Landing page', 'Checkout', 'Follow-up', 'Upsell', 'Relatório CEO'],
      copy: `Venda ${product} para ${audience} destacando automação, execução e resultado mensurável.`
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = { status, dashboard, createOffer };
