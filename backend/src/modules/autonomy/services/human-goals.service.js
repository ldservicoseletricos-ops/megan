function normalizeHumanGoal(payload = {}) {
  const now = new Date().toISOString();
  const title = String(payload.title || payload.goal || 'Organizar prioridades humanas').trim();
  const urgency = Number(payload.urgency ?? 72);
  const impact = Number(payload.impact ?? 84);
  const effort = Number(payload.effort ?? 42);
  const strategicValue = Number(payload.strategicValue ?? 80);
  const score = Math.max(1, Math.min(100, Math.round((urgency * 0.3) + (impact * 0.35) + (strategicValue * 0.25) - (effort * 0.1))));
  return { id: payload.id || `human-goal-${Date.now()}`, title, description: payload.description || 'Meta humana registrada para autopriorização executiva.', urgency, impact, effort, strategicValue, score, status: payload.status || 'active', owner: payload.owner || 'Luiz Rosa', createdAt: payload.createdAt || now, updatedAt: now };
}
function buildDefaultHumanGoals(state = {}) {
  const stored = Array.isArray(state.humanGoals) ? state.humanGoals : [];
  if (stored.length) return stored.slice().sort((a, b) => (b.score || 0) - (a.score || 0));
  return [
    normalizeHumanGoal({ title: 'Manter Megan OS online e estável', urgency: 92, impact: 96, effort: 55, strategicValue: 98, description: 'Prioridade humana principal: estabilidade operacional antes de novas expansões.' }),
    normalizeHumanGoal({ title: 'Organizar deploy backend + frontend', urgency: 84, impact: 91, effort: 48, strategicValue: 90, description: 'Garantir que Git, Render e Vercel estejam alinhados.' }),
    normalizeHumanGoal({ title: 'Limpar experiência visual do Autonomy Center', urgency: 70, impact: 82, effort: 38, strategicValue: 78, description: 'Reduzir bagunça visual e manter leitura executiva.' }),
  ];
}
function addHumanGoal(state = {}, payload = {}) {
  const current = buildDefaultHumanGoals(state);
  const goal = normalizeHumanGoal(payload);
  const items = [goal, ...current.filter((item) => item.id !== goal.id)].slice(0, 30).sort((a, b) => (b.score || 0) - (a.score || 0));
  return { goal, items };
}
function summarizeHumanGoals(goals = []) {
  const active = goals.filter((goal) => goal.status !== 'done');
  const top = active[0] || null;
  const averageScore = Math.round((goals.reduce((sum, goal) => sum + (goal.score || 0), 0) / Math.max(goals.length, 1)) || 0);
  return { total: goals.length, active: active.length, completed: goals.length - active.length, averageScore, topPriority: top, executiveSignal: top ? `Foco principal: ${top.title}` : 'Nenhuma prioridade humana ativa.' };
}
module.exports = { normalizeHumanGoal, buildDefaultHumanGoals, addHumanGoal, summarizeHumanGoals };
