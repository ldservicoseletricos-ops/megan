function buildContinuousOrganism(state = {}) {
  const timer = state.timer || state.state || {};
  const crisis = state.crisisMode?.active === true;
  return { ok: true, active: true, mode: crisis ? 'crisis_continuity' : 'continuous_supervised_autonomy', cyclePolicy: crisis ? 'protect_and_recover' : 'observe_decide_validate_learn', loop: [
    { step: 1, name: 'Observar', status: 'ready' },
    { step: 2, name: 'Decidir', status: 'ready' },
    { step: 3, name: 'Executar com política', status: 'guarded' },
    { step: 4, name: 'Validar', status: 'required' },
    { step: 5, name: 'Aprender', status: 'ready' }
  ], cadence: { timerEnabled: Boolean(timer.timerEnabled || timer.continuousMode), intervalMs: timer.timerIntervalMs || 30000, lastRunAt: timer.lastTimerRunAt || state.state?.updatedAt || null }, safeguards: ['policy-engine', 'constitutional-review', 'emergency-containment', 'rollback-queue'], generatedAt: new Date().toISOString() };
}
module.exports = { buildContinuousOrganism };
