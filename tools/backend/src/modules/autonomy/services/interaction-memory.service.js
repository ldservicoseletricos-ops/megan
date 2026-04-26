function appendInteraction(state = {}, interaction = {}) {
  const item = {
    id: `interaction-${Date.now()}`,
    type: interaction.type || 'human_context_update',
    summary: interaction.summary || 'Interação humana registrada para adaptação futura.',
    contextMode: interaction.contextMode || 'balanced_support',
    pressureScore: interaction.pressureScore || 0,
    createdAt: new Date().toISOString(),
  };
  const history = [item, ...(state.interactionMemory || [])].slice(0, 80);
  return { item, history };
}

function listInteractions(state = {}) {
  return {
    ok: true,
    version: '3.4.0',
    items: state.interactionMemory || [],
    count: (state.interactionMemory || []).length,
    generatedAt: new Date().toISOString(),
  };
}

module.exports = { appendInteraction, listInteractions };
