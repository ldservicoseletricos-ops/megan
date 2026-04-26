function buildStrategicIdeas(state = {}, context = {}) {
  const baseSignals = [
    { id: 'idea-autonomy-ui', title: 'Painel autônomo por contexto', area: 'frontend', novelty: 72, impact: 81, risk: 24, reason: 'reduz bagunça visual e torna decisões mais claras para operação.' },
    { id: 'idea-self-healing-api', title: 'API de autocorreção guiada', area: 'backend', novelty: 78, impact: 88, risk: 34, reason: 'usa incidentes e memória episódica para sugerir reparos antes de falhas se repetirem.' },
    { id: 'idea-brain-coalition-playbooks', title: 'Playbooks de coalizões por missão', area: 'autonomy', novelty: 83, impact: 86, risk: 29, reason: 'transforma alianças entre cérebros em padrões reutilizáveis.' },
    { id: 'idea-deploy-guardian', title: 'Guardião de deploy e ambiente', area: 'deploy', novelty: 75, impact: 90, risk: 31, reason: 'evita que Render/Vercel/Git quebrem por variáveis, porta ou build inconsistente.' },
  ];
  const memoryBoost = (state.episodicMemory || []).length > 2 ? 4 : 0;
  return baseSignals.map((idea, index) => ({
    ...idea,
    score: Math.min(100, idea.impact + idea.novelty / 5 - idea.risk / 4 + memoryBoost - index),
    status: 'candidate',
    context: context.intent || 'evolução estratégica guiada',
  })).sort((a,b)=>b.score-a.score);
}
module.exports = { buildStrategicIdeas };
