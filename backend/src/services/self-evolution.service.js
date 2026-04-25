const fs = require('fs');
const path = require('path');

const dataDir = path.resolve(__dirname, '..', 'data');
const stateFile = path.join(dataDir, 'self-evolution-state.json');

const defaultState = {
  score: 78,
  mode: 'assisted_live',
  lastScanAt: null,
  lastRunAt: null,
  weeklyGoal: 'Aumentar conversão do Money Mode e estabilizar operação online.',
  focus: 'Comercial + estabilidade + autonomia assistida',
  observers: [
    { id: 'backend', name: 'Backend uptime', status: 'watching', summary: 'API online e respondendo health/overview.' },
    { id: 'frontend', name: 'Frontend UX', status: 'watching', summary: 'Validar percepção premium e densidade visual.' },
    { id: 'money', name: 'Money Mode', status: 'watching', summary: 'Medir leads, trials e checkouts gerados.' },
    { id: 'deploy', name: 'Deploy monitor', status: 'watching', summary: 'Confirmar estabilidade Render/Vercel.' }
  ],
  detectedIssues: [
    { id: 'issue-1', severity: 'medium', title: 'Percepção visual inconsistente', description: 'Algumas telas ainda parecem protótipo e reduzem percepção de valor.', owner: 'design-system' },
    { id: 'issue-2', severity: 'medium', title: 'Fluxo comercial ainda depende de operação manual', description: 'Checkout e CRM existem, mas faltam automações para onboarding e follow-up.', owner: 'money-mode' },
    { id: 'issue-3', severity: 'low', title: 'Autonomia total ainda não habilitada', description: 'A Megan já observa e sugere, mas ainda não fecha o ciclo completo sozinha.', owner: 'self-evolution' }
  ],
  suggestedUpgrades: [
    { id: 'upgrade-1', lane: 'product', title: 'Refinar narrativa premium da Megan', impact: 'high', effort: 'medium', action: 'ajustar visual + copy de venda + prova operacional' },
    { id: 'upgrade-2', lane: 'money', title: 'Automatizar follow-up de trial', impact: 'high', effort: 'medium', action: 'ligar CRM + estágio + playbook de conversão' },
    { id: 'upgrade-3', lane: 'ops', title: 'Ativar smoke checks periódicos', impact: 'medium', effort: 'low', action: 'executar health + overview + stripe config em rotina' }
  ],
  actionQueue: [
    { id: 'action-1', type: 'execute_cycle', title: 'Executar ciclo técnico', status: 'pending', lane: 'dev' },
    { id: 'action-2', type: 'refresh_money_board', title: 'Reavaliar Money Mode', status: 'pending', lane: 'revenue' },
    { id: 'action-3', type: 'plan_autonomy', title: 'Planejar autonomia', status: 'pending', lane: 'core' }
  ],
  learningLog: [
    { id: 'learn-1', createdAt: new Date().toISOString(), title: 'Online real ativado', summary: 'A Megan passou a operar com frontend e backend públicos.' },
    { id: 'learn-2', createdAt: new Date().toISOString(), title: 'Money Mode validado', summary: 'Leads, trials e checkouts começaram a rodar na base comercial.' }
  ],
  lastExecutions: []
};

function ensureDir() {
  fs.mkdirSync(dataDir, { recursive: true });
}

function readState() {
  ensureDir();
  if (!fs.existsSync(stateFile)) {
    fs.writeFileSync(stateFile, JSON.stringify(defaultState, null, 2));
    return JSON.parse(JSON.stringify(defaultState));
  }

  try {
    const raw = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
    return { ...defaultState, ...raw };
  } catch {
    fs.writeFileSync(stateFile, JSON.stringify(defaultState, null, 2));
    return JSON.parse(JSON.stringify(defaultState));
  }
}

function writeState(state) {
  ensureDir();
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
  return state;
}

function getDashboard() {
  const state = readState();
  return {
    score: state.score,
    mode: state.mode,
    focus: state.focus,
    weeklyGoal: state.weeklyGoal,
    observersWatching: (state.observers || []).filter((item) => item.status === 'watching').length,
    issueCount: (state.detectedIssues || []).length,
    upgradeCount: (state.suggestedUpgrades || []).length,
    pendingActions: (state.actionQueue || []).filter((item) => item.status === 'pending').length,
    learningCount: (state.learningLog || []).length,
    lastScanAt: state.lastScanAt,
    lastRunAt: state.lastRunAt,
  };
}

function scan(snapshot = {}) {
  const state = readState();
  const readiness = Number(snapshot?.readiness || 0);
  const leads = Number(snapshot?.leads || 0);
  const backendOnline = Boolean(snapshot?.backendOnline);

  state.lastScanAt = new Date().toISOString();
  state.score = Math.max(0, Math.min(100, 62 + Math.round(readiness * 0.25) + (backendOnline ? 8 : -10) + Math.min(leads, 12)));
  state.focus = leads > 0
    ? 'Converter trials e checkouts em cliente ativo'
    : 'Gerar captação e percepção premium para vender a Megan';

  state.detectedIssues = [
    !backendOnline ? {
      id: 'issue-backend-offline', severity: 'critical', title: 'Backend offline', description: 'A API principal não respondeu no último scan.', owner: 'ops'
    } : null,
    readiness < 75 ? {
      id: 'issue-readiness', severity: 'medium', title: 'Readiness abaixo do ideal', description: `Readiness atual em ${readiness}%. Ainda há espaço para consolidar produto e operação.`, owner: 'core'
    } : null,
    leads < 3 ? {
      id: 'issue-leads', severity: 'medium', title: 'Captação ainda baixa', description: 'O Money Mode já existe, mas ainda precisa de mais tráfego e prova de valor.', owner: 'revenue'
    } : null,
  ].filter(Boolean);

  state.suggestedUpgrades = [
    {
      id: 'upgrade-scan-1',
      lane: 'revenue',
      title: leads > 0 ? 'Automatizar conversão dos leads atuais' : 'Aumentar geração de leads qualificados',
      impact: 'high',
      effort: 'medium',
      action: leads > 0 ? 'ligar CRM + follow-up + oferta Pro' : 'reforçar landing, CTA e tráfego de aquisição'
    },
    {
      id: 'upgrade-scan-2',
      lane: 'product',
      title: readiness < 75 ? 'Aumentar percepção premium do produto' : 'Consolidar narrativa executiva da Megan',
      impact: 'high',
      effort: 'medium',
      action: 'refinar interface, copy, KPIs e prova operacional'
    },
    {
      id: 'upgrade-scan-3',
      lane: 'ops',
      title: backendOnline ? 'Automatizar checks de saúde' : 'Recuperar estabilidade do core',
      impact: 'medium',
      effort: 'low',
      action: backendOnline ? 'rodar scans periódicos e logs de evolução' : 'restabelecer backend e retestar endpoints'
    }
  ];

  state.actionQueue = [
    { id: 'queued-1', type: 'execute_cycle', title: 'Executar ciclo técnico e reavaliar readiness', status: 'pending', lane: 'dev' },
    { id: 'queued-2', type: 'improve_revenue', title: 'Atualizar motor comercial e follow-up', status: 'pending', lane: 'revenue' },
    { id: 'queued-3', type: 'plan_autonomy', title: 'Replanejar autonomia operacional', status: 'pending', lane: 'core' }
  ];

  state.learningLog.unshift({
    id: `learn-${Date.now()}`,
    createdAt: new Date().toISOString(),
    title: 'Scan executado',
    summary: `Readiness ${readiness}% • leads ${leads} • backend ${backendOnline ? 'online' : 'offline'}.`
  });
  state.learningLog = state.learningLog.slice(0, 20);

  writeState(state);
  return { ok: true, dashboard: getDashboard(), issues: state.detectedIssues, upgrades: state.suggestedUpgrades, queue: state.actionQueue };
}

function run(action = 'scan') {
  const state = readState();
  const now = new Date().toISOString();
  state.lastRunAt = now;
  state.lastExecutions.unshift({ id: `exec-${Date.now()}`, action, status: 'done', createdAt: now });
  state.lastExecutions = state.lastExecutions.slice(0, 20);
  writeState(state);
  return { ok: true, action, executedAt: now, status: 'done' };
}

module.exports = {
  getState: readState,
  getDashboard,
  scan,
  run,
};
