function listGeneratedBrains(state = {}) {
  const items = (state.internalBrains || []).filter((item) => item.generated);
  return { ok: true, items, generatedAt: new Date().toISOString() };
}

function createBrain(state = {}, payload = {}) {
  const brain = {
    id: payload.id || `brain-${Date.now()}`,
    name: payload.name || payload.specialty || 'adaptive-specialist',
    specialty: payload.specialty || payload.area || 'general-optimization',
    status: 'online',
    autonomyLevel: payload.autonomyLevel || 71,
    load: payload.load || 18,
    trustScore: payload.trustScore || 0.68,
    generated: true,
    rationale: payload.rationale || 'Criado automaticamente para ampliar cobertura operacional.',
    createdAt: new Date().toISOString(),
  };
  state.internalBrains = [brain, ...((state.internalBrains)||[])].slice(0, 25);
  state.state.activeBrain = state.state.activeBrain || brain.id;
  state.history = [{
    id: `hist-${Date.now()}`,
    decision: { title: 'Novo cérebro especializado criado', actionType: 'create_specialized_brain' },
    execution: { status: 'completed', summary: `${brain.name} criado para ${brain.specialty}.` },
    validation: { approved: true, summary: 'Criação registrada e sem impacto destrutivo.' },
    createdAt: brain.createdAt,
  }, ...((state.history)||[])].slice(0,80);
  return { ok: true, state, brain, items: (state.internalBrains || []).filter((item) => item.generated) };
}

module.exports = { listGeneratedBrains, createBrain };
