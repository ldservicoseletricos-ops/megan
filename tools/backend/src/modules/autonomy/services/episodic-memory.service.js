function buildEpisodeId(prefix = 'episode') { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
function normalizeEpisode(payload = {}, state = {}) {
  const now = new Date().toISOString();
  const activeMission = (state.missions || []).find((mission) => mission.status === 'active');
  const decision = payload.decision || state.state?.lastDecision?.actionType || 'autonomy_continuity_review';
  const result = payload.result || state.state?.lastValidation?.status || 'recorded';
  return { id: payload.id || buildEpisodeId(), title: payload.title || `Episódio de aprendizado: ${decision}`, type: payload.type || 'operational_learning', context: payload.context || { mission: activeMission?.title || state.state?.currentMission || 'Evolução contínua da Megan OS', mode: state.state?.mode || 'supervised_autonomy', riskLevel: state.state?.riskLevel || 'medium', activeBrain: state.state?.activeBrain || 'autonomy' }, decision, result, impact: payload.impact || 'medium', lesson: payload.lesson || 'Registrar contexto, decisão e resultado melhora decisões futuras.', tags: payload.tags || ['autonomy', 'learning', 'episode'], createdAt: payload.createdAt || now };
}
function listEpisodes(state = {}) {
  const stored = Array.isArray(state.episodicMemory) ? state.episodicMemory : [];
  if (stored.length) return stored;
  return [normalizeEpisode({ title: 'Consolidação do organismo cognitivo 3.0', decision: 'unify_cognition_layers', result: 'organism_status_created', impact: 'high', lesson: 'A Megan evolui melhor quando coordenação, governança e emergência operam como um organismo único.', tags: ['3.0', 'organism', 'coordination'] }, state), normalizeEpisode({ title: 'Organização visual antes de novas expansões', decision: 'prioritize_ui_organization', result: 'visual_noise_reduced', impact: 'high', lesson: 'Crescimento modular precisa ser acompanhado por hierarquia visual para não virar bagunça operacional.', tags: ['frontend', 'ui', 'organization'] }, state)];
}
function recordEpisode(state = {}, payload = {}) { const episode = normalizeEpisode(payload, state); const next = [episode, ...listEpisodes(state)].slice(0, 80); return { episode, episodes: next }; }
module.exports = { listEpisodes, recordEpisode, normalizeEpisode };
