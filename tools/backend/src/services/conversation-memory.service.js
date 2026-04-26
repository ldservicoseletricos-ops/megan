import { getConversation, updateConversation } from "../lib/store.js";

function normalizeText(value) {
  return String(value || "").trim();
}

export function buildConversationSummary({ conversationId = null, messages = [], intent = null } = {}) {
  const safeMessages = Array.isArray(messages) ? messages : [];
  const lastUserMessage = [...safeMessages].reverse().find((item) => item?.role === "user");
  const lastAssistantMessage = [...safeMessages].reverse().find((item) => item?.role === "assistant");

  return {
    conversationId,
    intent,
    summary: [
      normalizeText(lastUserMessage?.content),
      normalizeText(lastAssistantMessage?.content),
    ].filter(Boolean).join(" | ").slice(0, 300),
    messageCount: safeMessages.length,
    updatedAt: new Date().toISOString(),
  };
}

export function saveConversationMemory({ conversationId = null, memory = {} } = {}) {
  const safeConversationId = normalizeText(conversationId);
  if (!safeConversationId) return null;

  const current = getConversation(safeConversationId);
  if (!current) return null;

  return updateConversation(safeConversationId, {
    ...current,
    memory: {
      ...(current.memory || {}),
      ...(memory || {}),
      updatedAt: new Date().toISOString(),
    },
  });
}
