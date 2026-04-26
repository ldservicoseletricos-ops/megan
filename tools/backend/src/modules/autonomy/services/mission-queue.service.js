function sortMissions(missions = []) {
  const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
  return [...missions].sort((a, b) => {
    const aWeight = priorityWeight[a.priority] || 0;
    const bWeight = priorityWeight[b.priority] || 0;
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (b.status === 'active' && a.status !== 'active') return 1;
    if (bWeight !== aWeight) return bWeight - aWeight;
    return String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || ''));
  });
}

function normalizeMission(payload = {}, status = 'queued') {
  const now = new Date().toISOString();
  return {
    id: payload.id || `mission-${Date.now()}`,
    title: payload.title || 'Missão sem título',
    summary: payload.summary || 'Missão criada pelo núcleo autônomo.',
    status: payload.status || status,
    priority: payload.priority || 'high',
    progress: Number.isFinite(payload.progress) ? payload.progress : 0,
    owner: payload.owner || 'autonomy',
    blocker: Boolean(payload.blocker),
    dependencies: Array.isArray(payload.dependencies) ? payload.dependencies : [],
    createdAt: payload.createdAt || now,
    updatedAt: now,
  };
}

function getMissionOverview(missions = []) {
  const sorted = sortMissions(missions);
  return {
    active: sorted.find((mission) => mission.status === 'active') || null,
    queued: sorted.filter((mission) => mission.status === 'queued'),
    completed: sorted.filter((mission) => mission.status === 'completed').slice(0, 10),
    all: sorted,
  };
}

function enqueueMission(missions = [], payload = {}) {
  const next = normalizeMission(payload, payload.activate ? 'active' : 'queued');
  const updated = missions
    .filter((item) => item.id !== next.id)
    .map((item) => payload.activate && item.status === 'active' ? { ...item, status: 'queued', updatedAt: next.updatedAt } : item);
  return sortMissions([next, ...updated]);
}

function activateMission(missions = [], missionId) {
  const now = new Date().toISOString();
  return sortMissions(missions.map((mission) => ({
    ...mission,
    status: mission.id === missionId ? 'active' : mission.status === 'active' ? 'queued' : mission.status,
    updatedAt: mission.id === missionId ? now : mission.updatedAt,
  })));
}

function completeMission(missions = [], missionId) {
  const now = new Date().toISOString();
  return sortMissions(missions.map((mission) => mission.id === missionId ? { ...mission, status: 'completed', progress: 100, updatedAt: now } : mission));
}

module.exports = {
  sortMissions,
  normalizeMission,
  getMissionOverview,
  enqueueMission,
  activateMission,
  completeMission,
};
