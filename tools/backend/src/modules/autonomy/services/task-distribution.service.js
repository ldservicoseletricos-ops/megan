const { normalizeMembers } = require('./team-coordination.service');
function buildDefaultTasks(state = {}) {
  const missions = state.missions || state.missionQueue || [];
  const base = missions.slice(0, 4).map((mission, index) => ({ id: mission.id || `mission-task-${index + 1}`, title: mission.title || mission.name || `Missão ${index + 1}`, priority: mission.priority || (index === 0 ? 'high' : 'medium'), skill: mission.skill || (index % 2 === 0 ? 'backend' : 'frontend'), estimateHours: mission.estimateHours || 2 + index, status: mission.status || 'ready' }));
  if (base.length) return base;
  return [
    { id: 'task-autonomy-ux', title: 'Organizar painel de autonomia', priority: 'high', skill: 'frontend', estimateHours: 3, status: 'ready' },
    { id: 'task-backend-health', title: 'Validar rotas críticas do backend', priority: 'high', skill: 'backend', estimateHours: 2, status: 'ready' },
    { id: 'task-deploy-check', title: 'Conferir deploy e variáveis', priority: 'medium', skill: 'deploy', estimateHours: 2, status: 'ready' },
    { id: 'task-roadmap', title: 'Atualizar roadmap executivo', priority: 'medium', skill: 'strategy', estimateHours: 1, status: 'ready' },
  ];
}
function matchMember(task, members) {
  const skill = String(task.skill || '').toLowerCase();
  return members.map((member) => {
    const role = String(member.role || member.name || '').toLowerCase();
    const skillMatch = role.includes(skill) ? 28 : role.includes('strategy') && skill === 'strategy' ? 24 : role.includes('backend') && skill === 'deploy' ? 10 : 0;
    const availability = member.availability === 'available' ? 18 : member.availability === 'focused' ? 6 : -12;
    const score = Math.round(skillMatch + availability + Number(member.capacity || 60) * 0.45 - Number(member.workload || 0) * 0.35);
    return { member, score };
  }).sort((a, b) => b.score - a.score)[0];
}
function distributeTasks(state = {}, payload = {}) {
  const tasks = payload.tasks || buildDefaultTasks(state);
  const members = normalizeMembers(state);
  const assignments = tasks.map((task) => { const selected = matchMember(task, members); return { taskId: task.id, title: task.title, priority: task.priority, assignedTo: selected.member.name, assigneeId: selected.member.id, confidence: Math.max(50, Math.min(98, selected.score + 45)), rationale: `Selecionado por capacidade, disponibilidade e aderência a ${task.skill || 'missão'}.`, estimateHours: task.estimateHours }; });
  return { ok: true, version: '3.7.0', tasks, assignments, generatedAt: new Date().toISOString() };
}
module.exports = { buildDefaultTasks, distributeTasks };
