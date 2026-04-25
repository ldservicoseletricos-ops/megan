function runBreakthrough(state = {}, payload = {}) {
  const blocker = payload.blocker || 'evolução travada por complexidade acumulada';
  const paths = [
    { id: 'path-isolate', title: 'Isolar módulo crítico', action: 'separar mudança em pacote menor e validável', risk: 18, speed: 74, impact: 80 },
    { id: 'path-rebuild-layer', title: 'Reconstruir camada externa', action: 'manter core e refazer apenas interface/integração', risk: 27, speed: 68, impact: 86 },
    { id: 'path-policy-first', title: 'Aplicar política antes do patch', action: 'validar autorização, rollback e dependências antes de qualquer alteração', risk: 14, speed: 59, impact: 77 },
  ];
  const ranked = paths.map(p => ({ ...p, score: Math.round(p.impact + p.speed/5 - p.risk/2) })).sort((a,b)=>b.score-a.score);
  return { ok: true, blocker, bestPath: ranked[0], alternatives: ranked, createdAt: new Date().toISOString() };
}
module.exports = { runBreakthrough };
