function buildAllianceStrategy(state = {}) {
  const alliances = state.alliances || [];
  const coalitions = state.coalitions || [];
  return { ok: true, recommendation: alliances.length ? 'Fortalecer alianças ativas e usar coalizões por missão.' : 'Criar primeira aliança entre cérebros complementares.', allianceScore: Math.min(100, 52 + alliances.length * 7 + coalitions.length * 5), coalitionReadiness: Math.min(100, 48 + coalitions.length * 9), generatedAt: new Date().toISOString() };
}
module.exports = { buildAllianceStrategy };
