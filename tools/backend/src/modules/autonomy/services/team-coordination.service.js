function normalizeMembers(state = {}) {
  const generated = (state.generatedBrains || []).slice(0, 5).map((brain, index) => ({
    id: brain.id || `brain-${index + 1}`,
    name: brain.name || brain.title || `Brain ${index + 1}`,
    role: brain.specialty || brain.role || 'especialista interno',
    capacity: Math.max(55, Math.min(96, brain.confidence || brain.trust || 72)),
    availability: index % 2 === 0 ? 'available' : 'focused',
    workload: 34 + index * 9,
  }));
  const defaults = [
    { id: 'human-lead', name: 'Luiz Rosa', role: 'dono do produto', capacity: 92, availability: 'decision_only', workload: 58 },
    { id: 'strategy-core', name: 'Strategy Core', role: 'priorização e estratégia', capacity: 88, availability: 'available', workload: 43 },
    { id: 'backend-stability', name: 'Backend Stability', role: 'robustez e APIs', capacity: 84, availability: 'available', workload: 49 },
    { id: 'frontend-optimizer', name: 'Frontend Optimizer', role: 'UX e organização visual', capacity: 81, availability: 'focused', workload: 62 },
  ];
  return [...defaults, ...generated].map((member) => ({ ...member, overloadRisk: member.workload > 70 ? 'high' : member.workload > 55 ? 'medium' : 'low' }));
}
function buildTeamStatus(state = {}) {
  const members = normalizeMembers(state);
  const available = members.filter((m) => m.availability === 'available').length;
  const overloaded = members.filter((m) => m.overloadRisk === 'high').length;
  return { ok: true, version: '3.7.0', mode: 'team_coordination', summary: { members: members.length, available, overloaded, coordinationScore: Math.round(members.reduce((sum, m) => sum + m.capacity - Math.max(0, m.workload - 50) * 0.35, 0) / members.length) }, members, recommendation: overloaded ? 'Redistribuir carga antes de iniciar missão crítica.' : 'Equipe pronta para execução coordenada.' };
}
function addTeamMember(state = {}, payload = {}) {
  return { id: payload.id || `member-${Date.now()}`, name: payload.name || 'Novo membro operacional', role: payload.role || payload.specialty || 'apoio operacional', capacity: Number(payload.capacity || 70), availability: payload.availability || 'available', workload: Number(payload.workload || 30), createdAt: new Date().toISOString() };
}
module.exports = { buildTeamStatus, addTeamMember, normalizeMembers };
