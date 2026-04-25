
const fs = require('fs');
const path = require('path');

const stateService = require('./state.service');
const repoService = require('./repo.service');
const moneyService = require('./money.service');
const selfEvolution = require('./self-evolution.service');
const gitOps = require('./git-ops.service');
const deployOrchestrator = require('./deploy-orchestrator.service');

const dataDir = path.resolve(__dirname, '..', 'data');
const filePath = path.join(dataDir, 'omega-final-state.json');

const defaultState = {
  mode: 'omega_final_supervised',
  score: 82,
  weeklyNorthStar: 'Concluir a autonomia total da Megan com segurança, receita e estabilidade.',
  currentDirective: 'Executar loop autônomo, validar testes e preparar publicação supervisionada sem quebrar a operação.',
  observers: [
    { id: 'git', title: 'Git Evolution Engine', status: 'watching', owner: 'dev', summary: 'Preparar mudanças seguras e validar repositório antes de publicar.' },
    { id: 'tests', title: 'Auto Test Engine', status: 'watching', owner: 'qa', summary: 'Executar health, build e smoke checks das rotas críticas.' },
    { id: 'deploy', title: 'Deploy Guardian', status: 'watching', owner: 'ops', summary: 'Decidir se a base está pronta para deploy sem quebrar produção.' },
    { id: 'product', title: 'Product Decision Brain', status: 'watching', owner: 'product', summary: 'Priorizar UX, valor percebido e foco de produto.' },
    { id: 'revenue', title: 'Revenue Brain', status: 'watching', owner: 'revenue', summary: 'Mover leads, trials e checkouts em direção a cliente ativo.' }
  ],
  queue: [
    { id: 'q1', title: 'Executar scan de autonomia', lane: 'core', status: 'pending', priority: 'alta' },
    { id: 'q2', title: 'Rodar validação de repo', lane: 'dev', status: 'pending', priority: 'alta' },
    { id: 'q3', title: 'Atualizar pipeline comercial', lane: 'revenue', status: 'pending', priority: 'média' },
    { id: 'q4', title: 'Verificar deploy antes da próxima publicação', lane: 'ops', status: 'pending', priority: 'média' }
  ],
  learningLog: [],
  actionHistory: [],
  lastScanAt: null,
  lastActionAt: null,
  lastAction: null
};

function ensureDir() {
  fs.mkdirSync(dataDir, { recursive: true });
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readState() {
  ensureDir();
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultState, null, 2));
    return clone(defaultState);
  }

  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return { ...clone(defaultState), ...raw };
  } catch {
    fs.writeFileSync(filePath, JSON.stringify(defaultState, null, 2));
    return clone(defaultState);
  }
}

function writeState(state) {
  ensureDir();
  fs.writeFileSync(filePath, JSON.stringify(state, null, 2));
  return state;
}

function buildSnapshot() {
  const platform = stateService.getState();
  const repo = repoService.getRepo();
  let money = { totals: {} };
  let selfDash = { score: 0 };
  let git = { ok: false };
  let deploy = { score: platform.deployReadiness || 0, summary: 'Pré-flight indisponível.' };
  try { money = moneyService.getDashboard() || { totals: {} }; } catch {}
  try { selfDash = selfEvolution.getDashboard() || { score: 0 }; } catch {}
  try { git = gitOps.inspectRepository() || { ok: false }; } catch {}
  try { deploy = deployOrchestrator.preflight ? (deployOrchestrator.preflight() || deploy) : deploy; } catch {}

  return {
    readiness: Number(platform?.readiness || 0),
    buildReadiness: Number(platform?.buildReadiness || 0),
    deployReadiness: Number(platform?.deployReadiness || 0),
    gitReady: git?.ok ? 100 : Math.max(20, Number(platform?.gitReadiness || 0)),
    leads: Number(money?.totals?.leads || 0),
    activeTrials: Number(money?.totals?.activeTrials || 0),
    revenuePotential: Number(money?.totals?.revenuePotential || 0),
    repoConnected: Boolean(repo?.connected),
    repoPath: repo?.repoPath || '',
    selfEvolutionScore: Number(selfDash?.score || 0),
    telemetryMode: platform?.telemetryMode || 'real',
    nextBestAction: platform?.nextBestAction || 'Consolidar autonomia supervisionada.',
    deploySummary: deploy?.summary || 'Sem resumo de deploy.',
    gitSummary: git?.ok ? `Branch ${git.branch || '---'} pronta.` : 'Git ainda não está pronto.'
  };
}

function scoreFromSnapshot(snapshot) {
  return Math.max(0, Math.min(100, Math.round(
    snapshot.readiness * 0.26 +
    snapshot.buildReadiness * 0.16 +
    snapshot.deployReadiness * 0.16 +
    snapshot.gitReady * 0.16 +
    snapshot.selfEvolutionScore * 0.12 +
    Math.min(snapshot.leads * 3, 15) +
    Math.min(snapshot.activeTrials * 4, 15)
  )));
}

function buildDashboard() {
  const persisted = readState();
  const snapshot = buildSnapshot();
  const score = scoreFromSnapshot(snapshot);
  const autonomyLevel = score >= 90 ? 'alto' : score >= 75 ? 'supervisionado_forte' : 'assistido';

  return {
    score,
    mode: persisted.mode,
    autonomyLevel,
    weeklyNorthStar: persisted.weeklyNorthStar,
    currentDirective: persisted.currentDirective,
    lastScanAt: persisted.lastScanAt,
    lastActionAt: persisted.lastActionAt,
    lastAction: persisted.lastAction,
    snapshot,
    observers: persisted.observers,
    queue: persisted.queue,
    learningLog: persisted.learningLog.slice(0, 8),
    actionHistory: persisted.actionHistory.slice(0, 10),
    pillars: [
      { id: 'git', title: 'Git Evolution Engine', score: snapshot.gitReady, status: snapshot.repoConnected ? 'ativo' : 'pendente', summary: snapshot.gitSummary },
      { id: 'tests', title: 'Auto Test Engine', score: snapshot.buildReadiness, status: snapshot.buildReadiness >= 70 ? 'ativo' : 'atenção', summary: `Build readiness ${snapshot.buildReadiness}%.` },
      { id: 'deploy', title: 'Deploy Guardian', score: snapshot.deployReadiness, status: snapshot.deployReadiness >= 70 ? 'ativo' : 'atenção', summary: snapshot.deploySummary },
      { id: 'product', title: 'Product Decision Brain', score: snapshot.readiness, status: snapshot.readiness >= 70 ? 'ativo' : 'atenção', summary: snapshot.nextBestAction },
      { id: 'revenue', title: 'Revenue Brain', score: Math.max(20, Math.min(100, snapshot.leads * 10 + snapshot.activeTrials * 12)), status: snapshot.leads > 0 ? 'ativo' : 'vazio', summary: `${snapshot.leads} leads • ${snapshot.activeTrials} trials • potencial R$ ${snapshot.revenuePotential}.` }
    ],
    squads: [
      {
        id: 'dev', title: 'Squad Dev Autônomo', command: 'Preparar melhorias com segurança e sem quebrar produção.', kpiLabel: 'Readiness', kpiValue: snapshot.readiness,
        members: [
          { id: 'm1', initials: 'GC', name: 'Git Core', role: 'branch + commit + PR', status: snapshot.repoConnected ? 'ativo' : 'standby', tone: 'blue', score: snapshot.gitReady, kpiLabel: 'Git', kpi: snapshot.gitReady, queue: 3, focus: snapshot.gitSummary, command: 'Validar repo e preparar próximo patch.', actions: [{ key: 'repo-validate', label: 'Validar repo', path: '/api/master/repo/validate', method: 'POST', body: {}, variant: 'primary' }] },
          { id: 'm2', initials: 'AT', name: 'Auto Test', role: 'health + build + smoke', status: 'ativo', tone: 'green', score: snapshot.buildReadiness, kpiLabel: 'Build', kpi: snapshot.buildReadiness, queue: 2, focus: `Build readiness ${snapshot.buildReadiness}%`, command: 'Rodar scan de autonomia e observar falhas.', actions: [{ key: 'autonomy-scan', label: 'Rodar scan', path: '/api/autonomy-core/scan', method: 'POST', body: {}, variant: 'secondary' }] }
        ],
        tasks: [
          { title: 'Confirmar repo e branch atuais', owner: 'Git Core', priority: 'alta', status: 'ativo' },
          { title: 'Rodar verificação da saúde técnica', owner: 'Auto Test', priority: 'alta', status: 'ativo' }
        ]
      },
      {
        id: 'ops', title: 'Squad Ops Guardian', command: 'Publicar somente quando a base estiver pronta e segura.', kpiLabel: 'Deploy', kpiValue: snapshot.deployReadiness,
        members: [
          { id: 'm3', initials: 'DG', name: 'Deploy Guardian', role: 'readiness + publicação', status: 'ativo', tone: 'purple', score: snapshot.deployReadiness, kpiLabel: 'Deploy', kpi: snapshot.deployReadiness, queue: 2, focus: snapshot.deploySummary, command: 'Verificar deploy antes de recomendar publicação.', actions: [{ key: 'deploy-preflight', label: 'Verificar deploy', path: '/api/master/deploy/preflight', method: 'GET', variant: 'primary' }] },
          { id: 'm4', initials: 'LA', name: 'Live Autonomy', role: 'incidente + resposta', status: 'ativo', tone: 'orange', score: snapshot.selfEvolutionScore, kpiLabel: 'Live', kpi: snapshot.selfEvolutionScore, queue: 2, focus: 'Manter operação observável e responder incidentes.', command: 'Planejar autonomia e revisar incidentes.', actions: [{ key: 'plan-autonomy', label: 'Planejar autonomia', path: '/api/master/autonomy/plan', method: 'POST', variant: 'secondary' }] }
        ],
        tasks: [
          { title: 'Executar pré-flight de deploy', owner: 'Deploy Guardian', priority: 'alta', status: 'ativo' },
          { title: 'Atualizar plano de autonomia', owner: 'Live Autonomy', priority: 'média', status: 'pendente' }
        ]
      },
      {
        id: 'revenue', title: 'Squad Revenue Brain', command: 'Mover trials e checkouts em direção a cliente ativo.', kpiLabel: 'Leads', kpiValue: Math.min(100, snapshot.leads * 10 + snapshot.activeTrials * 10),
        members: [
          { id: 'm5', initials: 'RB', name: 'Revenue Brain', role: 'lead + trial + checkout', status: snapshot.leads > 0 ? 'ativo' : 'standby', tone: 'gold', score: Math.min(100, snapshot.leads * 10 + snapshot.activeTrials * 10), kpiLabel: 'Trials', kpi: snapshot.activeTrials * 10, queue: 4, focus: `${snapshot.leads} leads e ${snapshot.activeTrials} trials ativos`, command: 'Repriorizar pipeline comercial.', actions: [{ key: 'refresh-money', label: 'Atualizar pipeline', path: '/api/autonomy-core/run', method: 'POST', body: { action: 'refresh_revenue' }, variant: 'primary' }] },
          { id: 'm6', initials: 'PD', name: 'Product Brain', role: 'oferta + retenção + UX', status: 'ativo', tone: 'cyan', score: snapshot.readiness, kpiLabel: 'Produto', kpi: snapshot.readiness, queue: 3, focus: snapshot.nextBestAction, command: 'Priorizar melhorias que aumentem valor percebido.', actions: [{ key: 'plan-multibrain', label: 'Planejar multibrain', path: '/api/master/multibrain/plan', method: 'POST', variant: 'secondary' }] }
        ],
        tasks: [
          { title: 'Revisar estágio dos leads do CRM', owner: 'Revenue Brain', priority: 'alta', status: 'ativo' },
          { title: 'Refinar proposta premium da Megan', owner: 'Product Brain', priority: 'média', status: 'pendente' }
        ]
      }
    ]
  };
}

function appendLearning(state, title, summary) {
  state.learningLog.unshift({ id: `learn-${Date.now()}`, createdAt: new Date().toISOString(), title, summary });
  state.learningLog = state.learningLog.slice(0, 20);
}

function appendAction(state, action, resultSummary) {
  const now = new Date().toISOString();
  state.lastActionAt = now;
  state.lastAction = action;
  state.actionHistory.unshift({ id: `action-${Date.now()}`, action, resultSummary, createdAt: now });
  state.actionHistory = state.actionHistory.slice(0, 20);
}

function scan() {
  const state = readState();
  const dashboard = buildDashboard();
  state.lastScanAt = new Date().toISOString();
  state.score = dashboard.score;
  state.currentDirective = dashboard.snapshot.nextBestAction;
  state.queue = dashboard.queue;
  appendLearning(state, 'Scan de autonomia executado', `Score ${dashboard.score} • readiness ${dashboard.snapshot.readiness}% • leads ${dashboard.snapshot.leads}.`);
  writeState(state);
  return { ok: true, dashboard: buildDashboard(), state: readState() };
}

function runAction(action, payload = {}) {
  const state = readState();
  let resultSummary = `Ação ${action} executada.`;
  if (action === 'scan') {
    resultSummary = `Scan concluído com score ${buildDashboard().score}.`;
  } else if (action === 'refresh_revenue') {
    const money = moneyService.getDashboard();
    resultSummary = `Pipeline comercial atualizado com ${money?.totals?.leads || 0} leads.`;
  } else if (action === 'execute_cycle') {
    resultSummary = 'Ciclo técnico solicitado pelo núcleo de autonomia.';
  } else if (action === 'validate_repo') {
    resultSummary = 'Validação de repositório disparada pelo núcleo de autonomia.';
  } else if (action === 'preflight_deploy') {
    resultSummary = 'Pré-flight de deploy executado.';
  }
  appendAction(state, action, resultSummary);
  appendLearning(state, 'Ação de autonomia executada', resultSummary);
  writeState(state);
  return { ok: true, action, resultSummary, payload, dashboard: buildDashboard(), state: readState() };
}

module.exports = { getState: readState, buildDashboard, scan, runAction };
