function buildRetirementQueue(state = {}) {
  const all = [...(state.internalBrains || []), ...(state.generatedBrains || [])];
  const items = all
    .map((brain) => ({
      id: `ret-${brain.id}`,
      brainId: brain.id,
      name: brain.name || brain.id,
      status: brain.status || 'online',
      score: Math.round((((brain.performance?.successRate || 0.58) * 100) + (brain.performance?.avgImpact || 40)) / 2),
      reason: (brain.performance?.successRate || 0.58) < 0.58 ? 'Baixa taxa de acerto recente.' : 'Capacidade redundante com baixo uso relativo.',
    }))
    .filter((item) => item.score < 58 || item.status === 'standby');
  return { ok: true, items: items.slice(0, 8), generatedAt: new Date().toISOString() };
}

function retireBrain(state = {}, payload = {}) {
  const brainId = payload.brainId;
  let retired = null;
  const touch = (items = []) => items.map((brain) => {
    if (brain.id !== brainId) return brain;
    retired = { ...brain, status: payload.status || 'retired', retiredAt: new Date().toISOString() };
    return retired;
  });
  state.internalBrains = touch(state.internalBrains || []);
  state.generatedBrains = touch(state.generatedBrains || []);
  state.retirementHistory = [{
    id: `ret-history-${Date.now()}`,
    brainId,
    status: retired?.status || 'retired',
    createdAt: new Date().toISOString(),
  }, ...(state.retirementHistory || [])].slice(0, 40);
  return { state, retired, items: state.retirementHistory };
}

module.exports = { buildRetirementQueue, retireBrain };
