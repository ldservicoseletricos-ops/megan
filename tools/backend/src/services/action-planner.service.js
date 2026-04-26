export function planAction({ message = "", destination = "", hasRoute = false } = {}) {
  const steps = [
    { id: "analyze_request", title: "Analisar pedido", status: "done" },
    { id: "prepare_execution", title: "Preparar execução", status: "ready" },
  ];

  if (destination) {
    steps.push({ id: "resolve_destination", title: "Resolver destino", status: "ready" });
    steps.push({ id: "route_execution", title: "Executar navegação", status: hasRoute ? "done" : "ready" });
  }

  if (message && !destination) {
    steps.push({ id: "define_goal", title: "Definir objetivo", status: "ready" });
  }

  return {
    ok: true,
    mode: "action-planner-fase5",
    primaryStep: steps.find((item) => item.status === "ready")?.id || "respond_user",
    steps,
  };
}
