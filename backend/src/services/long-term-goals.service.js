import crypto from "crypto";
import { getDbSnapshot, pushDbItem, updateDb } from "../lib/store.js";

function inferGoal({ intent }) {
  if (intent === "navigation") {
    return {
      type: "navigation_excellence",
      title: "Melhorar navegação e resolução de rotas",
      description: "Reduzir falhas de rota e deixar a resposta inicial mais objetiva.",
      priority: 100,
    };
  }

  if (intent === "weather") {
    return {
      type: "weather_short_answers",
      title: "Responder clima de forma curta",
      description: "Entregar clima útil com menos texto.",
      priority: 70,
    };
  }

  return {
    type: "general_assistance_quality",
    title: "Elevar qualidade geral da assistência",
    description: "Manter contexto, clareza e próximo passo útil.",
    priority: 50,
  };
}

export function upsertLongTermGoal({ conversationId, intent }) {
  const target = inferGoal({ intent });
  const db = getDbSnapshot();
  const existing = db.longTermGoals.find((item) => item.type === target.type);

  if (existing) {
    updateDb((draft) => {
      draft.longTermGoals = draft.longTermGoals.map((item) => {
        if (item.id !== existing.id) return item;
        return {
          ...item,
          priority: Math.min(100, Number(item.priority || 0) + 5),
          timesReinforced: Number(item.timesReinforced || 1) + 1,
          updatedAt: new Date().toISOString(),
          lastConversationId: conversationId || item.lastConversationId || null,
        };
      });
      return draft;
    });

    return getDbSnapshot().longTermGoals.find((item) => item.id === existing.id) || existing;
  }

  return pushDbItem("longTermGoals", {
    id: crypto.randomUUID(),
    conversationId: conversationId || null,
    status: "active",
    timesReinforced: 1,
    ...target,
  });
}
