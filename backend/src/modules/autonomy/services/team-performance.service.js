const { normalizeMembers } = require('./team-coordination.service');
function buildTeamPerformance(state = {}) {
  const rows = normalizeMembers(state).map((member, index) => { const delivery = Math.max(50, Math.min(98, member.capacity - member.workload * 0.18 + 12)); const reliability = Math.max(55, Math.min(99, member.capacity - (member.overloadRisk === 'high' ? 10 : 0))); return { id: member.id, name: member.name, deliveryScore: Math.round(delivery), reliabilityScore: Math.round(reliability), blockedItems: index % 3 === 0 ? 1 : 0, trend: delivery > 78 ? 'up' : delivery > 65 ? 'stable' : 'attention' }; });
  const average = Math.round(rows.reduce((sum, r) => sum + r.deliveryScore, 0) / Math.max(1, rows.length));
  return { ok: true, version: '3.7.0', averageDeliveryScore: average, members: rows, risk: average < 68 ? 'medium' : 'low' };
}
function buildWorkload(state = {}) {
  const workload = normalizeMembers(state).map((member) => ({ id: member.id, name: member.name, workload: member.workload, capacity: member.capacity, availableCapacity: Math.max(0, member.capacity - member.workload), status: member.workload > 72 ? 'overloaded' : member.workload > 55 ? 'busy' : 'available' }));
  return { ok: true, version: '3.7.0', workload, recommendation: 'Mover tarefas de membros busy/overloaded para disponíveis.' };
}
module.exports = { buildTeamPerformance, buildWorkload };
