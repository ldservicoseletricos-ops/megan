const { readStore, writeStore, addActivity } = require('./personal-copilot-store.service');

const VERSION = '4.4.0';

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getMetrics() {
  const store = readStore();
  const agenda = store.agenda || [];
  const goals = store.goals || [];
  const health = store.health || [];
  const finances = store.finances || [];
  const reminders = store.reminders || [];
  const income = finances.filter((item) => item.type === 'income').reduce((sum, item) => sum + number(item.amount), 0);
  const expense = finances.filter((item) => item.type === 'expense').reduce((sum, item) => sum + number(item.amount), 0);
  const lastHealth = health[0] || {};
  const avgGoalProgress = goals.length ? Math.round(goals.reduce((sum, goal) => sum + number(goal.progress), 0) / goals.length) : 0;

  return {
    ok: true,
    version: VERSION,
    title: 'Megan OS 4.4 — Copiloto Pessoal Total',
    metrics: {
      agendaItems: agenda.length,
      openGoals: goals.filter((goal) => number(goal.progress) < 100).length,
      focusScore: Math.min(100, Math.round((avgGoalProgress * 0.55) + (number(lastHealth.energy, 70) * 0.45))),
      healthEnergy: number(lastHealth.energy, 0),
      remindersScheduled: reminders.filter((item) => item.status !== 'done').length,
      personalBalance: income - expense,
      income,
      expense,
      decisionsAssisted: (store.decisions || []).length,
      operatingMode: 'personal_copilot_supervised'
    }
  };
}

function getAgenda() {
  const store = readStore();
  return {
    ok: true,
    version: VERSION,
    title: 'Agenda Inteligente 4.4',
    agenda: store.agenda || [],
    goals: store.goals || [],
    health: store.health || [],
    finances: store.finances || [],
    reminders: store.reminders || [],
    decisions: store.decisions || [],
    activity: store.activity || []
  };
}

function getDashboard() {
  const metrics = getMetrics();
  const agenda = getAgenda();
  return {
    ok: true,
    version: VERSION,
    title: 'Megan OS 4.4 — COPILOTO PESSOAL TOTAL',
    status: 'life_organization_ready',
    focus: 'Sua vida organizada com agenda inteligente, metas, foco diário, saúde, finanças, lembretes e decisões assistidas.',
    value: 'Megan ajuda Luiz a manter clareza diária, priorizar melhor, lembrar do que importa e agir com menos sobrecarga.',
    capabilities: ['agenda inteligente', 'metas', 'foco diário', 'saúde', 'finanças pessoais', 'lembretes reais', 'decisões assistidas'],
    safety: {
      defaultMode: 'supervisionado',
      reminders: 'pode ser conectado aos apps da fase 4.2 para notificações reais',
      health: 'apoio organizacional, sem substituir profissional de saúde',
      finance: 'apoio organizacional, sem substituir consultoria financeira'
    },
    metrics: metrics.metrics,
    life: agenda
  };
}

function createDailyFocus(payload = {}) {
  const store = readStore();
  const mainGoal = payload.mainGoal || (store.goals || [])[0]?.title || 'Organizar o dia com clareza';
  const focus = {
    id: `focus_${Date.now()}`,
    title: payload.title || `Foco principal: ${mainGoal}`,
    priority: payload.priority || 'alta',
    blocks: payload.blocks || ['Escolher uma prioridade principal', 'Executar um bloco profundo sem distrações', 'Revisar progresso no fim do dia'],
    createdAt: new Date().toISOString()
  };
  store.agenda = [{ id: `agenda_${Date.now()}`, title: focus.title, time: payload.time || '09:00', type: 'foco', status: 'planned', date: new Date().toISOString().slice(0, 10) }, ...(store.agenda || [])];
  addActivity(store, 'focus', `Foco diário criado: ${focus.title}`);
  writeStore(store);
  return { ok: true, version: VERSION, focus, agenda: store.agenda };
}

function createGoal(payload = {}) {
  const store = readStore();
  const goal = { id: `goal_${Date.now()}`, title: payload.title || 'Nova meta pessoal', area: payload.area || 'vida', progress: number(payload.progress, 0), priority: payload.priority || 'media', nextStep: payload.nextStep || 'definir próximo passo prático', createdAt: new Date().toISOString() };
  store.goals = [goal, ...(store.goals || [])];
  addActivity(store, 'goal', `Meta criada: ${goal.title}`);
  writeStore(store);
  return { ok: true, version: VERSION, goal };
}

function createHealthCheckin(payload = {}) {
  const store = readStore();
  const checkin = { id: `health_${Date.now()}`, mood: payload.mood || 'estável', energy: Math.min(100, Math.max(0, number(payload.energy, 70))), sleepHours: number(payload.sleepHours, 7), water: number(payload.water, 0), note: payload.note || 'Check-in registrado pela Megan OS 4.4.', createdAt: new Date().toISOString() };
  store.health = [checkin, ...(store.health || [])].slice(0, 100);
  addActivity(store, 'health', `Check-in de saúde registrado: energia ${checkin.energy}`);
  writeStore(store);
  return { ok: true, version: VERSION, checkin };
}

function addFinanceItem(payload = {}) {
  const store = readStore();
  const item = { id: `fin_${Date.now()}`, title: payload.title || 'Movimento financeiro', type: payload.type === 'income' ? 'income' : 'expense', amount: number(payload.amount, 0), category: payload.category || 'geral', dueDate: payload.dueDate || new Date().toISOString().slice(0, 10), status: payload.status || 'pending', createdAt: new Date().toISOString() };
  store.finances = [item, ...(store.finances || [])];
  addActivity(store, 'finance', `${item.type === 'income' ? 'Entrada' : 'Despesa'} registrada: ${item.title}`);
  writeStore(store);
  return { ok: true, version: VERSION, item, metrics: getMetrics().metrics };
}

function createReminder(payload = {}) {
  const store = readStore();
  const reminder = { id: `rem_${Date.now()}`, title: payload.title || 'Lembrete Megan OS', when: payload.when || new Date(Date.now() + 60 * 60 * 1000).toISOString(), channel: payload.channel || 'in_app', status: 'scheduled', createdAt: new Date().toISOString() };
  store.reminders = [reminder, ...(store.reminders || [])];
  addActivity(store, 'reminder', `Lembrete criado: ${reminder.title}`);
  writeStore(store);
  return { ok: true, version: VERSION, reminder };
}

function assistDecision(payload = {}) {
  const store = readStore();
  const options = Array.isArray(payload.options) && payload.options.length ? payload.options : ['seguir agora', 'adiar com data', 'dividir em passos menores'];
  const decision = { id: `decision_${Date.now()}`, question: payload.question || 'Qual é a melhor decisão agora?', options, recommendation: payload.recommendation || options[0], reason: payload.reason || 'Recomendação baseada em prioridade, energia disponível, impacto e risco de atraso.', nextStep: payload.nextStep || 'executar um primeiro passo pequeno e revisar o resultado', createdAt: new Date().toISOString() };
  store.decisions = [decision, ...(store.decisions || [])];
  addActivity(store, 'decision', `Decisão assistida: ${decision.question}`);
  writeStore(store);
  return { ok: true, version: VERSION, decision };
}

function runLifeCycle(payload = {}) {
  const focus = createDailyFocus({ mainGoal: payload.mainGoal || 'organizar vida e projeto', time: payload.time || '09:00' }).focus;
  const goal = payload.createGoal ? createGoal(payload.goal || {}).goal : null;
  const health = createHealthCheckin(payload.health || { energy: 76, mood: 'focado', sleepHours: 7, water: 3 }).checkin;
  const reminder = createReminder(payload.reminder || { title: 'Revisar foco diário e próximos passos' }).reminder;
  const decision = assistDecision(payload.decision || { question: 'Qual prioridade devo executar hoje?' }).decision;
  return { ok: true, version: VERSION, title: 'Ciclo pessoal 4.4 executado', focus, goal, health, reminder, decision, metrics: getMetrics().metrics, dashboard: getDashboard() };
}

module.exports = { getDashboard, getAgenda, getMetrics, createDailyFocus, createGoal, createHealthCheckin, addFinanceItem, createReminder, assistDecision, runLifeCycle };
