export function replanIfNeeded({ execution = {}, autonomy = {} } = {}) {
  const blockers = autonomy?.plan?.goal?.blockers || [];
  const needsReplan = Boolean(blockers.length) || (!execution?.route && autonomy?.plan?.goal);

  return {
    ok: true,
    needsReplan,
    blockers,
    suggestion: needsReplan
      ? "Replanejar a próxima ação com base no bloqueio atual."
      : "Plano atual continua válido.",
  };
}
