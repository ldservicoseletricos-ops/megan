const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../../../data');
const STATE_FILE = path.join(DATA_DIR, 'personal-life-state.json');

function nowIso() { return new Date().toISOString(); }
function today() { return nowIso().slice(0, 10); }
function ensureDataDir() { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); }
function brl(value) { return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

function buildInitialState() {
  const now = nowIso();
  return {
    updatedAt: now,
    version: '5.3.0',
    title: 'Megan OS 5.3 — MEGAN PERSONAL LIFE OS',
    focus: 'Versão pessoal para rotina, metas, saúde, dinheiro, foco e produtividade em um painel diário.',
    mode: 'personal_life_os',
    readiness: {
      score: 93,
      status: 'pronto_para_uso_pessoal_diario',
      safety: 'ações sensíveis exigem confirmação do usuário',
      nextRelease: '5.4 automações pessoais conectadas com calendário, finanças e hábitos reais'
    },
    daily: {
      owner: 'Luiz Rosa',
      date: today(),
      lifeScore: 87,
      energy: 82,
      focusScore: 78,
      productivityScore: 84,
      financialScore: 81,
      healthScore: 86,
      priority: 'Proteger 2 blocos de foco e concluir a tarefa de maior impacto antes das 12h.',
      nextBestAction: 'Executar bloco de foco de 50 minutos no projeto Megan OS.'
    },
    routine: [
      { id: 'routine-001', title: 'Revisar agenda do dia', area: 'manhã', status: 'pendente', time: '08:00', impact: 'clareza' },
      { id: 'routine-002', title: 'Bloco de foco Megan OS', area: 'trabalho', status: 'pendente', time: '09:00', impact: 'progresso' },
      { id: 'routine-003', title: 'Checar finanças pessoais', area: 'dinheiro', status: 'pendente', time: '17:30', impact: 'controle' },
      { id: 'routine-004', title: 'Planejar amanhã', area: 'noite', status: 'pendente', time: '21:00', impact: 'organização' }
    ],
    goals: [
      { id: 'goal-life-001', title: 'Evoluir Megan OS diariamente', area: 'projeto', progress: 76, target: 100, current: 76, deadline: '30 dias', nextStep: 'Finalizar camada pessoal 5.3 e preparar 5.4.' },
      { id: 'goal-life-002', title: 'Aumentar produtividade semanal', area: 'produtividade', progress: 68, target: 100, current: 68, deadline: '7 dias', nextStep: 'Manter 2 blocos de foco por dia.' },
      { id: 'goal-life-003', title: 'Organizar dinheiro pessoal', area: 'dinheiro', progress: 61, target: 100, current: 61, deadline: '30 dias', nextStep: 'Registrar entradas e saídas diariamente.' },
      { id: 'goal-life-004', title: 'Manter saúde e energia', area: 'saúde', progress: 72, target: 100, current: 72, deadline: 'contínuo', nextStep: 'Adicionar check-in rápido no fim do dia.' }
    ],
    health: {
      checkins: [
        { id: 'health-001', date: today(), energy: 82, mood: 'focado', sleepHours: 7, water: 'médio', movement: 'leve', note: 'Dia bom para foco e decisões.' }
      ],
      habits: [
        { id: 'habit-001', title: 'Água', streak: 4, status: 'ativo' },
        { id: 'habit-002', title: 'Movimento', streak: 2, status: 'ativo' },
        { id: 'habit-003', title: 'Sono', streak: 3, status: 'ativo' }
      ]
    },
    money: {
      income: 6200,
      expenses: 3180,
      balance: 3020,
      savingsGoal: 12000,
      savingsCurrent: 7400,
      entries: [
        { id: 'money-001', type: 'entrada', label: 'Receita principal', amount: 5200, category: 'renda', date: today() },
        { id: 'money-002', type: 'entrada', label: 'Projeto digital', amount: 1000, category: 'extra', date: today() },
        { id: 'money-003', type: 'saida', label: 'Contas fixas', amount: 2180, category: 'fixo', date: today() },
        { id: 'money-004', type: 'saida', label: 'Ferramentas de trabalho', amount: 1000, category: 'projeto', date: today() }
      ]
    },
    focusCenter: {
      activeMode: 'deep_work',
      sessionsToday: 2,
      minutesToday: 100,
      distractionsBlocked: 6,
      sessions: [
        { id: 'focus-001', title: 'Megan OS evolução', minutes: 50, status: 'planejado', startedAt: null },
        { id: 'focus-002', title: 'Organização financeira', minutes: 25, status: 'planejado', startedAt: null }
      ]
    },
    productivity: {
      score: 84,
      completed: 7,
      pending: 4,
      actions: [
        { id: 'prod-001', title: 'Priorizar tarefa principal', status: 'recomendado', impact: 'alto' },
        { id: 'prod-002', title: 'Agrupar respostas e mensagens em 2 janelas', status: 'recomendado', impact: 'médio' },
        { id: 'prod-003', title: 'Revisar plano semanal no domingo', status: 'recomendado', impact: 'alto' }
      ]
    },
    decisions: [
      { id: 'decision-001', title: 'O que fazer primeiro hoje?', recommendation: 'Começar pelo bloco de foco Megan OS antes de abrir tarefas pequenas.', confidence: 91 },
      { id: 'decision-002', title: 'Como melhorar dinheiro?', recommendation: 'Registrar gastos por 7 dias e cortar ferramentas duplicadas.', confidence: 84 }
    ],
    alerts: [
      { id: 'alert-life-001', level: 'atenção', title: 'Rotina com muitos blocos abertos', action: 'Escolher 3 prioridades reais para hoje.' },
      { id: 'alert-life-002', level: 'oportunidade', title: 'Alta energia detectada', action: 'Usar a manhã para decisões difíceis.' }
    ],
    activity: [
      { id: 'act-life-001', type: 'personal_life_boot', title: 'Personal Life OS 5.3 iniciado', detail: 'Rotina, metas, saúde, dinheiro, foco e produtividade carregados.', createdAt: now }
    ]
  };
}

function ensureState() {
  ensureDataDir();
  if (!fs.existsSync(STATE_FILE)) fs.writeFileSync(STATE_FILE, JSON.stringify(buildInitialState(), null, 2));
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

function pushActivity(state, type, title, detail) {
  state.activity.unshift({ id: `act-life-${Date.now()}`, type, title, detail, createdAt: nowIso() });
  state.activity = state.activity.slice(0, 50);
}

function recalc(state) {
  const income = state.money.entries.filter((entry) => entry.type === 'entrada').reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const expenses = state.money.entries.filter((entry) => entry.type === 'saida').reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const goalAvg = state.goals.reduce((sum, goal) => sum + Number(goal.progress || 0), 0) / Math.max(1, state.goals.length);
  const latestHealth = state.health.checkins[0] || { energy: 70 };
  const focusScore = Math.min(100, 55 + Number(state.focusCenter.sessionsToday || 0) * 9 + Number(state.focusCenter.minutesToday || 0) / 8);
  const financialScore = Math.min(100, Math.max(1, 60 + ((income - expenses) / Math.max(1, income)) * 40));
  state.updatedAt = nowIso();
  state.daily.date = today();
  state.money.income = income;
  state.money.expenses = expenses;
  state.money.balance = income - expenses;
  state.daily.energy = Number(latestHealth.energy || state.daily.energy || 70);
  state.daily.focusScore = Number(focusScore.toFixed(0));
  state.daily.financialScore = Number(financialScore.toFixed(0));
  state.daily.productivityScore = Number(state.productivity.score || 80);
  state.daily.healthScore = Number(Math.min(100, Math.max(1, (Number(latestHealth.energy || 70) * 0.7) + 28)).toFixed(0));
  state.daily.lifeScore = Number(((goalAvg * 0.3) + (state.daily.focusScore * 0.2) + (state.daily.financialScore * 0.2) + (state.daily.healthScore * 0.2) + (state.daily.productivityScore * 0.1)).toFixed(0));
}

function saveState(state) { recalc(state); fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2)); return state; }

function getDashboard() {
  const state = ensureState();
  recalc(state);
  return {
    ok: true,
    ...state,
    display: {
      income: brl(state.money.income),
      expenses: brl(state.money.expenses),
      balance: brl(state.money.balance),
      savings: `${brl(state.money.savingsCurrent)} / ${brl(state.money.savingsGoal)}`,
      lifeScore: `${state.daily.lifeScore}%`,
      focusScore: `${state.daily.focusScore}%`,
      healthScore: `${state.daily.healthScore}%`,
      productivityScore: `${state.daily.productivityScore}%`
    }
  };
}

function addRoutineTask(payload = {}) {
  const state = ensureState();
  const task = { id: `routine-${Date.now()}`, title: payload.title || 'Nova tarefa da rotina', area: payload.area || 'rotina', status: payload.status || 'pendente', time: payload.time || '09:00', impact: payload.impact || 'organização' };
  state.routine.unshift(task);
  pushActivity(state, 'routine_task_created', 'Tarefa adicionada à rotina', `${task.title} foi adicionada para ${task.time}.`);
  return { ok: true, task, dashboard: saveState(state) };
}

function updateGoalProgress(payload = {}) {
  const state = ensureState();
  const goal = state.goals.find((item) => item.id === payload.goalId) || state.goals[0];
  goal.progress = Math.max(0, Math.min(100, Number(payload.progress ?? goal.progress)));
  goal.current = Number(payload.current ?? goal.current ?? goal.progress);
  goal.nextStep = payload.nextStep || goal.nextStep;
  pushActivity(state, 'goal_progress_updated', 'Meta pessoal atualizada', `${goal.title} agora está em ${goal.progress}%.`);
  return { ok: true, goal, dashboard: saveState(state) };
}

function addHealthCheckin(payload = {}) {
  const state = ensureState();
  const checkin = { id: `health-${Date.now()}`, date: payload.date || today(), energy: Number(payload.energy || 80), mood: payload.mood || 'equilibrado', sleepHours: Number(payload.sleepHours || 7), water: payload.water || 'médio', movement: payload.movement || 'leve', note: payload.note || 'Check-in registrado pela Megan.' };
  state.health.checkins.unshift(checkin);
  pushActivity(state, 'health_checkin_created', 'Check-in de saúde registrado', `${checkin.mood} com energia ${checkin.energy}%.`);
  return { ok: true, checkin, dashboard: saveState(state) };
}

function addMoneyEntry(payload = {}) {
  const state = ensureState();
  const entry = { id: `money-${Date.now()}`, type: payload.type === 'saida' ? 'saida' : 'entrada', label: payload.label || 'Lançamento pessoal', amount: Number(payload.amount || 100), category: payload.category || 'geral', date: payload.date || today() };
  state.money.entries.unshift(entry);
  pushActivity(state, 'money_entry_created', 'Lançamento financeiro pessoal', `${entry.label}: ${brl(entry.amount)} (${entry.type}).`);
  return { ok: true, entry, dashboard: saveState(state) };
}

function addFocusSession(payload = {}) {
  const state = ensureState();
  const session = { id: `focus-${Date.now()}`, title: payload.title || 'Sessão de foco', minutes: Number(payload.minutes || 50), status: payload.status || 'planejado', startedAt: payload.startedAt || null };
  state.focusCenter.sessions.unshift(session);
  state.focusCenter.sessionsToday += 1;
  state.focusCenter.minutesToday += session.minutes;
  pushActivity(state, 'focus_session_created', 'Sessão de foco adicionada', `${session.title} com ${session.minutes} minutos.`);
  return { ok: true, session, dashboard: saveState(state) };
}

function addProductivityAction(payload = {}) {
  const state = ensureState();
  const action = { id: `prod-${Date.now()}`, title: payload.title || 'Nova ação produtiva', status: payload.status || 'recomendado', impact: payload.impact || 'médio' };
  state.productivity.actions.unshift(action);
  state.productivity.pending += 1;
  pushActivity(state, 'productivity_action_created', 'Ação de produtividade criada', `${action.title} foi adicionada.`);
  return { ok: true, action, dashboard: saveState(state) };
}

module.exports = { getDashboard, addRoutineTask, updateGoalProgress, addHealthCheckin, addMoneyEntry, addFocusSession, addProductivityAction };
