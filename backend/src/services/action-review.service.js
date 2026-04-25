import { appendAgentReview, updateAgentTask } from "../lib/store.js";

function buildReviewForAgent(agent, score, status, notes, details = {}) {
  return {
    agent,
    score: Number(Math.max(0, Math.min(100, score)).toFixed(1)),
    status,
    notes,
    details,
  };
}

export function buildActionReview(context = {}) {
  const reviews = [];
  const tasks = Array.isArray(context.delegation?.tasks) ? context.delegation.tasks : [];
  const routeOk = Boolean(context.route);
  const weatherOk = Boolean(context.weather);
  const hasLocation = Boolean(context.hasLocation);
  const destinationOk = Boolean(context.destinationResolved);
  const reply = String(context.execution?.reply || "").trim();

  for (const task of tasks) {
    let status = "completed";
    let score = 84;
    let note = "Tarefa concluída dentro do esperado.";

    if (task.agent === "navigation") {
      if (task.type === "request_destination") {
        status = destinationOk ? "resolved_indirectly" : "waiting_user";
        score = destinationOk ? 72 : 58;
        note = destinationOk ? "Destino acabou resolvido no mesmo fluxo." : "Ainda depende do usuário informar o destino.";
      } else if (task.type === "request_location") {
        status = hasLocation ? "resolved_indirectly" : "waiting_user";
        score = hasLocation ? 72 : 56;
        note = hasLocation ? "Localização já estava disponível no fluxo." : "Ainda depende de localização do aparelho.";
      } else if (task.type === "calculate_route") {
        status = routeOk ? "completed" : "failed";
        score = routeOk ? 91 : 34;
        note = routeOk ? "Rota pronta para navegação." : "Rota não foi calculada.";
      } else if (task.type === "open_map") {
        status = routeOk ? "completed" : "blocked";
        score = routeOk ? 88 : 48;
        note = routeOk ? "Mapa pode ser aberto com confiança." : "Mapa ficou bloqueado por falta de rota.";
      }
    }

    if (task.agent === "weather") {
      status = weatherOk ? "completed" : "partial";
      score = weatherOk ? 82 : 52;
      note = weatherOk ? "Clima veio junto da resposta." : "Clima não ficou disponível nesta rodada.";
    }

    if (task.agent === "response") {
      status = reply ? "completed" : "failed";
      score = reply ? (reply.length <= 120 ? 90 : 76) : 25;
      note = reply ? "Resposta final gerada." : "Resposta final ausente.";
    }

    updateAgentTask(task.id, () => ({ status, reviewScore: score, reviewedAt: new Date().toISOString() }));
    reviews.push(
      appendAgentReview(
        buildReviewForAgent(task.agent, score, status, note, {
          taskId: task.id,
          conversationId: context.conversationId,
          intent: context.intent,
          summary: task.title,
        })
      )
    );
  }

  const averageScore = reviews.length
    ? Number((reviews.reduce((sum, item) => sum + Number(item.score || 0), 0) / reviews.length).toFixed(1))
    : 0;

  return {
    averageScore,
    reviews,
    outcome:
      averageScore >= 85
        ? "strong"
        : averageScore >= 65
        ? "acceptable"
        : "needs_attention",
  };
}
