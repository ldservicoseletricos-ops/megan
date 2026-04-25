import {
  createImprovementSuggestion,
  listImprovementSuggestions,
  updateImprovementSuggestion,
} from "../lib/store.js";

function dedupeByTitle(items = []) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.area}|${item.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildSuggestions({ userId, conversationId, intent, recurringFailures = [], execution, learning }) {
  const suggestions = [];

  for (const failure of recurringFailures) {
    const signature = String(failure?.signature || "");
    const count = Number(failure?.count || 0);

    if (count < 2) continue;

    if (signature.includes("needs_location")) {
      suggestions.push({
        userId,
        conversationId,
        area: "navigation",
        severity: count >= 4 ? "high" : "medium",
        confidence: 0.85,
        title: "Fortalecer captura de localização do aparelho",
        description:
          "Falhas recorrentes indicam ausência de deviceLocation em pedidos de navegação ou clima. Priorizar fallback de localização e avisos mais claros.",
        metadata: { signature, count },
      });
    }

    if (signature.includes("needs_better_destination") || signature.includes("destination_not_resolved")) {
      suggestions.push({
        userId,
        conversationId,
        area: "navigation",
        severity: count >= 4 ? "high" : "medium",
        confidence: 0.82,
        title: "Melhorar resolução de destinos e aliases",
        description:
          "Pedidos recorrentes não estão resolvendo bem o destino. Vale ampliar aliases, sugestões locais e fallback de busca.",
        metadata: { signature, count },
      });
    }

    if (signature.includes("route_failed") || signature.includes("route_not_ready")) {
      suggestions.push({
        userId,
        conversationId,
        area: "navigation",
        severity: "high",
        confidence: 0.88,
        title: "Adicionar fallback para cálculo de rota",
        description:
          "A Megan está encontrando rota com falha recorrente. Vale registrar tentativas e criar segundo provedor ou retry com parâmetros alternativos.",
        metadata: { signature, count },
      });
    }

    if (signature.includes("weather") && signature.includes("data_not_ready")) {
      suggestions.push({
        userId,
        conversationId,
        area: "weather",
        severity: "medium",
        confidence: 0.78,
        title: "Melhorar fallback do clima",
        description:
          "Clima nem sempre chega quando pedido explicitamente. Vale reforçar cache local e mensagens mais úteis quando a API falhar.",
        metadata: { signature, count },
      });
    }
  }

  if (!execution?.effects?.hasRoute && intent === "navigation") {
    suggestions.push({
      userId,
      conversationId,
      area: "planning",
      severity: "medium",
      confidence: 0.7,
      title: "Replanejar navegação quando a rota não vier pronta",
      description:
        "Quando a rota falhar, a Megan deve trocar para modo de recuperação em vez de responder de forma estática.",
      metadata: { intent },
    });
  }

  if (learning?.preferencesUpdated) {
    suggestions.push({
      userId,
      conversationId,
      area: "personalization",
      severity: "low",
      confidence: 0.9,
      title: "Aplicar preferência aprendida nas próximas respostas",
      description:
        "Uma preferência explícita de estilo de resposta foi detectada. Vale aplicar automaticamente nas próximas conversas.",
      metadata: { preferenceLearning: true },
      status: "approved",
    });
  }

  return dedupeByTitle(suggestions);
}

function createImprovementBacklogFromInteraction(input) {
  const suggestions = buildSuggestions(input);
  return suggestions.map((entry) => createImprovementSuggestion(entry));
}

function summarizeBacklog({ userId, limit = 10 } = {}) {
  const items = listImprovementSuggestions({ userId, limit });

  return {
    total: items.length,
    proposed: items.filter((item) => item.status === "proposed").length,
    approved: items.filter((item) => item.status === "approved").length,
    inProgress: items.filter((item) => item.status === "in_progress").length,
    done: items.filter((item) => item.status === "done").length,
    items,
  };
}

function changeBacklogStatus(id, status) {
  return updateImprovementSuggestion(id, (current) => ({ ...current, status }));
}

export {
  createImprovementBacklogFromInteraction,
  summarizeBacklog,
  changeBacklogStatus,
};