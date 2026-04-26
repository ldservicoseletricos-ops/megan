export function createExecutionQueue({plan=[]}={}) {
  return (Array.isArray(plan)?plan:[]).map((item,index)=>({
    id:item.id || `step_${index+1}`,
    priority:item.priority || "smart_reply",
    status:"queued",
    attempts:0,
    order:index+1
  }));
}

export function runExecutionQueue({queue=[]}={}) {
  const safeQueue = Array.isArray(queue) ? queue : [];
  const processed = safeQueue.map((item, index) => {
    const shouldFallback = item.priority === "navigation" && index > 0;

    return {
      ...item,
      attempts: item.attempts + 1,
      status: shouldFallback ? "fallback_ready" : "done",
      result: shouldFallback
        ? "route_service_delayed"
        : `${item.priority}_completed`
    };
  });

  const nextAction =
    processed.find(x => x.status === "fallback_ready") ||
    processed.find(x => x.status !== "done") ||
    null;

  return {
    ok:true,
    queue:processed,
    completed:processed.filter(x=>x.status==="done").length,
    pending:processed.filter(x=>x.status!=="done").length,
    nextAction
  };
}

export function buildExecutionReply({execution={}}={}) {
  const completed = execution?.completed || 0;
  const pending = execution?.pending || 0;

  if (pending > 0) {
    return `Executei ${completed} etapa(s). Restam ${pending} com fallback preparado.`;
  }

  return `Todas as ${completed} etapa(s) foram executadas com sucesso.`;
}
