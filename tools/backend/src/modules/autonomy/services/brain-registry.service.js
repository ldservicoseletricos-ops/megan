function buildBrains(state = {}) {
  const custom = Array.isArray(state.internalBrains) ? state.internalBrains : [];
  const defaults = [
    {
      id: 'strategic',
      label: 'Strategic Brain',
      specialty: 'planejamento, metas compostas e priorização de impacto',
      status: 'online',
      autonomyLevel: 82,
      load: 54,
      preferredMissionTypes: ['composite_evolution', 'long_range_priority', 'roadmap'],
    },
    {
      id: 'operational',
      label: 'Operational Brain',
      specialty: 'execução segura, ciclo autônomo e rollback',
      status: 'online',
      autonomyLevel: 88,
      load: 63,
      preferredMissionTypes: ['stability', 'repair', 'validated_execution'],
    },
    {
      id: 'technical',
      label: 'Technical Brain',
      specialty: 'patch multiarquivo, dependências e integração backend/frontend',
      status: 'online',
      autonomyLevel: 84,
      load: 58,
      preferredMissionTypes: ['patch', 'integration', 'architecture'],
    },
    {
      id: 'guardian',
      label: 'Guardian Brain',
      specialty: 'política, risco, aprovação e proteção da base existente',
      status: 'online',
      autonomyLevel: 90,
      load: 37,
      preferredMissionTypes: ['risk', 'approval', 'rollback'],
    },
  ];
  if (!custom.length) return defaults;
  const byId = { ...Object.fromEntries(defaults.map((b) => [b.id, b])) };
  for (const item of custom) {
    byId[item.id] = { ...(byId[item.id] || {}), ...item };
  }
  return Object.values(byId);
}

function summarizeBrains(brains = []) {
  return {
    total: brains.length,
    online: brains.filter((item) => item.status === 'online').length,
    avgAutonomy: brains.length ? Math.round(brains.reduce((acc, item) => acc + Number(item.autonomyLevel || 0), 0) / brains.length) : 0,
    avgLoad: brains.length ? Math.round(brains.reduce((acc, item) => acc + Number(item.load || 0), 0) / brains.length) : 0,
  };
}

module.exports = { buildBrains, summarizeBrains };
