function allocateFocus(goals = [], state = {}) {
  const sorted = [...goals].sort((a, b) => (b.score || 0) - (a.score || 0));
  const primary = sorted[0] || null;
  const secondary = sorted.slice(1, 3);
  const defer = sorted.slice(3);
  return { ok: true, mode: state?.state?.humanAdaptationMode || 'executive_focus', primaryFocus: primary, secondaryFocus: secondary, defer, eliminate: defer.filter((goal) => (goal.score || 0) < 45), recommendations: [primary ? `Executar primeiro: ${primary.title}` : 'Registrar uma prioridade humana principal.', 'Manter apenas 1 foco primário por ciclo para reduzir dispersão.', 'Delegar ou adiar metas com esforço alto e impacto menor.'], attentionBudget: { deepWork: primary ? 70 : 30, review: secondary.length ? 20 : 10, admin: 10 }, updatedAt: new Date().toISOString() };
}
module.exports = { allocateFocus };
