function normalizeText(value) {
  return String(value || "").trim();
}

export function buildTaskChain({ message = "", destination = "", hasRoute = false } = {}) {
  const tasks = [];
  const safeMessage = normalizeText(message);
  const safeDestination = normalizeText(destination);

  tasks.push({ id: "analyze_request", title: "Analisar pedido", status: "done" });

  if (safeDestination) {
    tasks.push({ id: "resolve_destination", title: "Resolver destino", status: "ready" });
    tasks.push({ id: "calculate_route", title: "Calcular rota", status: hasRoute ? "done" : "ready" });
  }

  if (safeMessage && !safeDestination) {
    tasks.push({ id: "define_next_action", title: "Definir próxima ação", status: "ready" });
  }

  tasks.push({ id: "respond_user", title: "Responder usuário", status: "ready" });
  return tasks;
}
