function buildPriorityCalendar(goals = [], focus = {}) {
  const today = new Date();
  const iso = (offset) => { const d = new Date(today); d.setDate(d.getDate() + offset); return d.toISOString().slice(0, 10); };
  const primary = focus.primaryFocus || goals[0] || null;
  const secondary = focus.secondaryFocus || goals.slice(1, 3);
  return { ok: true, timezone: 'America/Sao_Paulo', items: [
    { date: iso(0), window: 'manha', type: 'deep_work', title: primary?.title || 'Definir prioridade humana principal', priority: 'critical', durationMinutes: 90 },
    { date: iso(0), window: 'tarde', type: 'execution_review', title: secondary[0]?.title || 'Revisar execução do núcleo Megan', priority: 'high', durationMinutes: 45 },
    { date: iso(1), window: 'manha', type: 'follow_up', title: secondary[1]?.title || 'Conectar deploy e validações', priority: 'high', durationMinutes: 60 },
    { date: iso(2), window: 'tarde', type: 'strategic_review', title: 'Revisar progresso executivo e ajustar foco', priority: 'medium', durationMinutes: 40 },
  ], rules: ['Não abrir nova fase antes de validar backend e frontend locais.', 'Tratar falha de download/build como prioridade operacional.', 'Separar evolução técnica de reorganização visual quando houver bagunça.'], updatedAt: new Date().toISOString() };
}
module.exports = { buildPriorityCalendar };
