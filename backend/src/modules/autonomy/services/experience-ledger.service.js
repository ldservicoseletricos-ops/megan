function buildExperienceLedger(state = {}) {
  const interactions = state.interactionMemory || [];
  const latest = interactions[0] || null;
  return {
    ok: true,
    version: '3.4.0',
    summary: {
      totalInteractions: interactions.length,
      currentHumanAdaptation: state.state?.humanAdaptationMode || 'premium_guided_mode',
      lastPressureScore: latest?.pressureScore || state.state?.lastHumanPressureScore || 0,
    },
    items: interactions.slice(0, 30),
    lessons: [
      'quando houver erro de download, gerar nome novo e validar integridade',
      'quando a interface ficar poluída, priorizar organização antes de adicionar módulos',
      'quando backend não responder, diagnosticar conexão antes de mexer no login',
    ],
    generatedAt: new Date().toISOString(),
  };
}

module.exports = { buildExperienceLedger };
