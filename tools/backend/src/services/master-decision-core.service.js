export function buildMasterDecisionCore({ intent = {}, route = null, blockers = [], autonomy = {} } = {}) {
  const action = route
    ? 'start_navigation'
    : blockers?.length
      ? 'replan'
      : autonomy?.nextAction
        ? 'continue_goal'
        : 'respond';

  return {
    ok: true,
    mode: 'master-decision-core-v7',
    primaryDecision: {
      action,
      severity: action === 'replan' ? 'high' : 'medium',
      reason: action === 'start_navigation'
        ? 'Rota disponível.'
        : action === 'replan'
          ? 'Bloqueios encontrados.'
          : action === 'continue_goal'
            ? 'Meta ativa detectada.'
            : 'Fluxo conversacional normal.',
    },
    blockers: Array.isArray(blockers) ? blockers : [],
    createdAt: new Date().toISOString(),
  };
}
