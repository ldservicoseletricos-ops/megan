function buildCapabilities(state = {}) {
  const brains = state.internalBrains || [];
  const capabilityMap = [
    { id: 'cycle-automation', name: 'Automação de ciclos', area: 'autonomy', level: 84, sourceBrain: 'operational', status: 'online' },
    { id: 'strategic-memory', name: 'Memória estratégica', area: 'strategy', level: 78, sourceBrain: 'strategic', status: 'online' },
    { id: 'safe-patching', name: 'Patch seguro por política', area: 'technical', level: 73, sourceBrain: 'technical', status: 'online' },
  ];
  const generated = brains.filter((brain) => Boolean(brain.generated));
  return { ok: true, items: capabilityMap.concat((state.generatedCapabilities || [])), generatedBrains: generated, generatedAt: new Date().toISOString() };
}

function expandCapabilities(state = {}, payload = {}) {
  const need = payload.need || payload.area || 'coordination';
  const newCapability = {
    id: `cap-${Date.now()}`,
    name: payload.name || `Capacidade adaptativa para ${need}`,
    area: payload.area || need,
    level: payload.level || 61,
    sourceBrain: payload.sourceBrain || 'autonomy',
    status: 'online',
    rationale: payload.rationale || 'Criada automaticamente para cobrir gargalo recorrente.',
    createdAt: new Date().toISOString(),
  };
  state.generatedCapabilities = [newCapability, ...((state.generatedCapabilities)||[])].slice(0, 40);
  state.history = [{
    id: `hist-${Date.now()}`,
    decision: { title: 'Expansão de capacidade', actionType: 'capability_expand' },
    execution: { status: 'completed', summary: `Nova capacidade criada: ${newCapability.name}.` },
    validation: { approved: true, summary: 'Capacidade registrada com segurança.' },
    createdAt: newCapability.createdAt,
  }, ...((state.history)||[])].slice(0,80);
  return { ok: true, state, capability: newCapability, items: state.generatedCapabilities };
}

module.exports = { buildCapabilities, expandCapabilities };
