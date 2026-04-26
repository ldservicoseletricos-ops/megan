function normalizeText(value) {
  return String(value || "").trim();
}

function resolveGoalState({ intent, destinationText, route, weather, hasLocation }) {
  const safeDestination = normalizeText(destinationText);

  if (intent === "navigation") {
    return {
      activeGoal: safeDestination
        ? `Levar o usuário para ${safeDestination}`
        : "Entender o destino da navegação",
      currentProblem: safeDestination
        ? route
          ? "Rota pronta."
          : hasLocation
          ? "Rota ainda não calculada."
          : "Localização do aparelho indisponível."
        : "Destino ainda não informado.",
      nextStep: safeDestination
        ? route
          ? "Abrir mapa e iniciar navegação."
          : "Tentar calcular a rota novamente."
        : "Pedir o destino de forma objetiva.",
      status: route ? "Pronta" : "Em análise",
    };
  }

  if (intent === "weather") {
    return {
      activeGoal: "Informar o clima atual com rapidez.",
      currentProblem: hasLocation
        ? weather
          ? "Nenhum problema detectado."
          : "Clima indisponível no momento."
        : "Localização ainda não disponível.",
      nextStep: hasLocation ? "Responder com o clima." : "Solicitar localização.",
      status: weather ? "Pronta" : "Em análise",
    };
  }

  if (intent === "map") {
    return {
      activeGoal: safeDestination
        ? `Mostrar mapa de ${safeDestination}`
        : "Abrir o mapa solicitado",
      currentProblem: "Nenhum problema detectado.",
      nextStep: "Exibir mapa na interface.",
      status: "Pronta",
    };
  }

  return {
    activeGoal: "Ajudar o usuário com clareza e rapidez.",
    currentProblem: "Nenhum problema detectado.",
    nextStep: "Responder a solicitação atual.",
    status: "Ativa",
  };
}

export { resolveGoalState };
