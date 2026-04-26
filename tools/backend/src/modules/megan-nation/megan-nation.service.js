const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../../../data');
const STATE_FILE = path.join(DATA_DIR, 'megan-nation-state.json');

function nowIso() { return new Date().toISOString(); }
function ensureDataDir() { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); }
function makeId(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`; }

function buildInitialState() {
  const now = nowIso();
  return {
    updatedAt: now,
    version: '6.0.0',
    title: 'Megan OS 6.0 — MEGAN NATION',
    focus: 'Rede global de usuários com IA conectada, marketplace humano + IA, times formados por IA e jobs executados.',
    mode: 'global_ai_network',
    readiness: {
      score: 96,
      status: 'pronto_para_ecossistema_global',
      governance: 'jobs reais continuam supervisionados, auditáveis e com confirmação para ações críticas',
      monetization: 'preparado para assinatura, comissão por job, marketplace e white-label global'
    },
    community: {
      totalUsers: 12840,
      activeCreators: 940,
      activeCompanies: 312,
      countries: 18,
      circles: [
        { id: 'circle-founders', name: 'Fundadores Megan Nation', members: 220, focus: 'crescimento, produto e negócios com IA' },
        { id: 'circle-automation', name: 'Automação Total', members: 1860, focus: 'fluxos entre apps, vendas e atendimento' },
        { id: 'circle-agents', name: 'Agentes Especializados', members: 1440, focus: 'criação, venda e operação de agentes' },
        { id: 'circle-business', name: 'Empresas e Times', members: 980, focus: 'implantação B2B, CRM, BI e processos' }
      ],
      members: [
        { id: 'member-luiz-master', name: 'Luiz Rosa', role: 'fundador_operador', reputation: 100, status: 'online', skills: ['produto', 'negócios', 'Megan OS'] },
        { id: 'member-company-ops', name: 'Empresa Piloto', role: 'cliente_empresa', reputation: 88, status: 'ativo', skills: ['vendas', 'suporte', 'CRM'] },
        { id: 'member-creator-001', name: 'Criador de Automações', role: 'creator', reputation: 91, status: 'ativo', skills: ['Make', 'Gmail', 'Sheets'] }
      ]
    },
    marketplace: {
      categories: ['humano', 'ia', 'hibrido', 'consultoria', 'automacao', 'implantacao'],
      offers: [
        { id: 'offer-ai-sales-squad', type: 'ia', title: 'Squad IA de Vendas', price: 299, currency: 'USD', delivery: 'mensal', rating: 4.9, description: 'Agentes de captação, qualificação, proposta e follow-up para empresas.' },
        { id: 'offer-human-automation', type: 'humano', title: 'Especialista em Automação', price: 120, currency: 'USD', delivery: 'por_job', rating: 4.8, description: 'Configura integrações Gmail, Sheets, CRM, WhatsApp e Stripe.' },
        { id: 'offer-hybrid-business-cloud', type: 'hibrido', title: 'Implantação Megan Business Cloud', price: 799, currency: 'USD', delivery: 'projeto', rating: 5.0, description: 'Time humano + IA instala dashboard, metas, CRM, BI e rotina operacional.' },
        { id: 'offer-ai-support-agent', type: 'ia', title: 'Agente IA de Suporte 24/7', price: 199, currency: 'USD', delivery: 'mensal', rating: 4.7, description: 'Atende, classifica, responde e escala tickets com logs auditáveis.' }
      ]
    },
    aiTeams: [
      { id: 'team-growth-global', name: 'Time IA Growth Global', objective: 'gerar demanda, captar leads e converter empresas para Megan OS', status: 'operando_supervisionado', agents: ['estrategista', 'copywriter', 'closer', 'analista_crm', 'followup'], weeklyCapacity: 420, successRate: 87 },
      { id: 'team-ops-deploy', name: 'Time IA Deploy + Operações', objective: 'publicar, monitorar, corrigir e documentar implantações de clientes', status: 'pronto_para_execucao', agents: ['deploy', 'qa', 'documentador', 'suporte_tecnico'], weeklyCapacity: 160, successRate: 91 },
      { id: 'team-finance-admin', name: 'Time IA Financeiro Administrativo', objective: 'acompanhar caixa, cobrança, assinaturas, propostas e métricas', status: 'monitorando', agents: ['financeiro', 'cobranca', 'metricas', 'risco'], weeklyCapacity: 220, successRate: 84 }
    ],
    jobs: [
      { id: 'job-001', title: 'Implantar CRM vivo para cliente', type: 'implantacao', status: 'em_execucao_supervisionada', assignedTeam: 'Time IA Deploy + Operações', progress: 64, value: 450, currency: 'USD' },
      { id: 'job-002', title: 'Criar funil de vendas com agentes', type: 'growth', status: 'pronto_para_aprovacao', assignedTeam: 'Time IA Growth Global', progress: 78, value: 299, currency: 'USD' },
      { id: 'job-003', title: 'Conectar cobrança recorrente Stripe', type: 'financeiro', status: 'fila_prioritaria', assignedTeam: 'Time IA Financeiro Administrativo', progress: 35, value: 180, currency: 'USD' }
    ],
    activity: [
      { id: 'nation-act-001', type: 'nation_boot', title: 'Megan Nation 6.0 iniciada', detail: 'Rede global, marketplace humano + IA, times IA e jobs executados foram ativados.', createdAt: now }
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
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  return state;
}

function pushActivity(state, type, title, detail) {
  state.activity.unshift({ id: makeId('nation-act'), type, title, detail, createdAt: nowIso() });
  state.activity = state.activity.slice(0, 120);
}

function buildSummary(state) {
  const totalJobValue = state.jobs.reduce((sum, job) => sum + Number(job.value || 0), 0);
  const avgSuccess = Math.round(state.aiTeams.reduce((sum, team) => sum + Number(team.successRate || 0), 0) / Math.max(state.aiTeams.length, 1));
  return {
    users: state.community.totalUsers,
    companies: state.community.activeCompanies,
    countries: state.community.countries,
    offers: state.marketplace.offers.length,
    aiTeams: state.aiTeams.length,
    jobs: state.jobs.length,
    runningJobs: state.jobs.filter((job) => String(job.status).includes('execucao')).length,
    totalJobValue,
    avgSuccess
  };
}

function getDashboard() {
  const state = ensureState();
  return { ok: true, ...state, summary: buildSummary(state) };
}
function getCommunity() { const state = ensureState(); return { ok: true, community: state.community, summary: buildSummary(state) }; }
function getMarketplace() { const state = ensureState(); return { ok: true, marketplace: state.marketplace, summary: buildSummary(state) }; }
function getAiTeams() { const state = ensureState(); return { ok: true, aiTeams: state.aiTeams, summary: buildSummary(state) }; }
function getJobs() { const state = ensureState(); return { ok: true, jobs: state.jobs, summary: buildSummary(state) }; }

function joinCommunity(payload = {}) {
  const state = ensureState();
  const member = { id: makeId('member'), name: payload.name || 'Novo membro Megan Nation', role: payload.role || 'member', reputation: Number(payload.reputation || 70), status: 'ativo', skills: Array.isArray(payload.skills) && payload.skills.length ? payload.skills : ['Megan OS', 'IA conectada'] };
  state.community.members.unshift(member);
  state.community.totalUsers += 1;
  pushActivity(state, 'community_join', 'Novo membro na Megan Nation', `${member.name} entrou na rede global.`);
  return { ok: true, member, dashboard: saveState(state), summary: buildSummary(state) };
}

function createOffer(payload = {}) {
  const state = ensureState();
  const offer = { id: makeId('offer'), type: payload.type || 'hibrido', title: payload.title || 'Nova oferta Megan Nation', price: Number(payload.price || 99), currency: payload.currency || 'USD', delivery: payload.delivery || 'por_job', rating: Number(payload.rating || 5), description: payload.description || 'Oferta criada para o marketplace humano + IA.' };
  state.marketplace.offers.unshift(offer);
  pushActivity(state, 'marketplace_offer_created', 'Oferta criada no marketplace', `${offer.title} foi publicada para a rede.`);
  return { ok: true, offer, dashboard: saveState(state), summary: buildSummary(state) };
}

function formAiTeam(payload = {}) {
  const state = ensureState();
  const team = { id: makeId('team'), name: payload.name || 'Novo Time IA Especializado', objective: payload.objective || 'executar missão de negócio com agentes coordenados', status: 'pronto_para_execucao', agents: Array.isArray(payload.agents) && payload.agents.length ? payload.agents : ['coordenador', 'executor', 'analista', 'qa'], weeklyCapacity: Number(payload.weeklyCapacity || 100), successRate: Number(payload.successRate || 82) };
  state.aiTeams.unshift(team);
  pushActivity(state, 'ai_team_formed', 'Time IA formado', `${team.name} foi montado para executar jobs.`);
  return { ok: true, team, dashboard: saveState(state), summary: buildSummary(state) };
}

function executeJob(payload = {}) {
  const state = ensureState();
  const job = { id: makeId('job'), title: payload.title || 'Job Megan Nation executado', type: payload.type || 'operacional', status: payload.autoApprove ? 'em_execucao_supervisionada' : 'pronto_para_aprovacao', assignedTeam: payload.assignedTeam || state.aiTeams[0]?.name || 'Time IA Megan Nation', progress: Number(payload.progress || 12), value: Number(payload.value || 150), currency: payload.currency || 'USD' };
  state.jobs.unshift(job);
  pushActivity(state, 'job_created', 'Job criado para execução', `${job.title} foi atribuído para ${job.assignedTeam}.`);
  return { ok: true, job, dashboard: saveState(state), summary: buildSummary(state) };
}

module.exports = { getDashboard, getCommunity, getMarketplace, getAiTeams, getJobs, joinCommunity, createOffer, formAiTeam, executeJob };
