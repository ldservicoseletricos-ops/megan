export function analyzeExecution({execution={}}={}) {
  const queue = Array.isArray(execution?.queue) ? execution.queue : [];
  const failed = queue.filter(x => String(x.status).includes("fallback"));
  const done = queue.filter(x => x.status === "done");

  return {
    total: queue.length,
    completed: done.length,
    failed: failed.length,
    score: queue.length ? Math.round((done.length / queue.length) * 100) : 100,
    recurrentIssue: failed.length ? failed[0].priority : null
  };
}

export function buildAutoCorrection({analysis={}}={}) {
  const fixes = [];

  if (analysis?.recurrentIssue === "navigation") {
    fixes.push("usar_rota_reserva");
    fixes.push("reduzir_timeout_mapa");
  }

  if ((analysis?.score || 0) < 80) {
    fixes.push("simplificar_plano");
  }

  if (!fixes.length) fixes.push("manter_configuracao");

  return {
    ok:true,
    fixes,
    mode:"adaptive"
  };
}

export function buildReflectionReply({analysis={}, correction={}}={}) {
  return `Score ${analysis.score}%. Ajustes preparados: ${correction.fixes.join(", ")}.`;
}
