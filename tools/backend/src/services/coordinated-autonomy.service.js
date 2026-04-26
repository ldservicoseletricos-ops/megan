export function runCoordinatedAutonomy({ goals = {}, planner = {}, blockers = [] } = {}) {
  const nextAction = planner?.nextAction || goals?.nextStep || null;
  return {
    ok: true,
    mode: 'coordinated-autonomy-v1',
    blockers: Array.isArray(blockers) ? blockers : [],
    nextAction,
    shouldReplan: Boolean((Array.isArray(blockers) ? blockers : []).length),
    createdAt: new Date().toISOString(),
  };
}
