const { buildDefaultTasks } = require('./task-distribution.service');
function buildTeamPriority(state = {}) { const weight = { critical: 100, high: 82, medium: 55, low: 30 }; const priorities = buildDefaultTasks(state).map((task) => ({ ...task, score: (weight[task.priority] || 50) + (task.skill === 'backend' ? 8 : task.skill === 'frontend' ? 6 : 3) })).sort((a, b) => b.score - a.score); return { ok: true, version: '3.7.0', priorities, next: priorities[0] || null }; }
module.exports = { buildTeamPriority };
