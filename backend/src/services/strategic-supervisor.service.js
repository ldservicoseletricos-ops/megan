import { pushDbItem } from "../lib/store.js";

function pickFocus({ intent, route, weather, destinationText, conversation }) {
  const lastMessages = Array.isArray(conversation?.messages)
    ? conversation.messages.slice(-6)
    : [];

  if (intent === "navigation" || destinationText || route) {
    return "navigation_flow";
  }

  if (intent === "weather" || weather) {
    return "weather_support";
  }

  const repeatedQuestions = lastMessages.filter((item) => item?.role === "user").length >= 3;
  if (repeatedQuestions) {
    return "friction_reduction";
  }

  return "general_assistance";
}

function buildActions(focus) {
  switch (focus) {
    case "navigation_flow":
      return [
        "Reduzir texto antes de abrir o mapa.",
        "Priorizar destino, localização e rota nessa ordem.",
        "Manter resposta curta quando a rota estiver pronta.",
      ];
    case "weather_support":
      return [
        "Entregar clima em formato curto.",
        "Se não houver localização, pedir isso rapidamente.",
      ];
    case "friction_reduction":
      return [
        "Evitar repetir instruções longas.",
        "Priorizar o próximo passo exato para o usuário.",
      ];
    default:
      return [
        "Responder com clareza.",
        "Preservar contexto da conversa.",
      ];
  }
}

export function runStrategicSupervisor(input = {}) {
  const focus = pickFocus(input);
  const actions = buildActions(focus);

  const summary = {
    focus,
    actions,
    confidence:
      focus === "general_assistance"
        ? 0.62
        : focus === "friction_reduction"
        ? 0.78
        : 0.84,
    nextStrategicStep: actions[0] || "Continuar atendendo.",
  };

  const entry = pushDbItem("strategicSupervisorRuns", {
    conversationId: input.conversationId || null,
    intent: input.intent || "general",
    focus,
    summary,
  });

  return {
    ...summary,
    entry,
  };
}
