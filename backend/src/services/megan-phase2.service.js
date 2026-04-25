import { getConversationById, upsertConversation, appendConversationMessage } from "../lib/store.js";
import { orchestrateChatTurn } from "./core-orchestrator.service.js";

function ensureConversation({ conversationId = null, userId = "default" } = {}) {
  const existing = conversationId ? getConversationById(conversationId) : null;
  if (existing) return existing;

  const created = {
    id: conversationId || `conv_${Date.now()}`,
    userId,
    title: "Nova conversa",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [],
    memory: {},
    profile: {},
    settings: {},
    agents: {},
  };

  upsertConversation(created);
  return created;
}

export async function runMeganPhase2({
  userId = "default",
  conversationId = null,
  message = "",
  destination = "",
  deviceLocation = null,
} = {}) {
  let conversation = ensureConversation({ conversationId, userId });

  if (message) {
    appendConversationMessage(conversation.id, {
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
    });
    conversation = getConversationById(conversation.id) || conversation;
  }

  const result = await orchestrateChatTurn({
    conversation,
    text: message,
    destination,
    deviceLocation,
    profile: conversation.profile || {},
    currentMemory: conversation.memory || {},
    settings: conversation.settings || {},
    agents: conversation.agents || {},
  });

  appendConversationMessage(conversation.id, {
    role: "assistant",
    content: result.reply,
    createdAt: new Date().toISOString(),
  });

  const updatedConversation = {
    ...(getConversationById(conversation.id) || conversation),
    memory: result.memory || conversation.memory || {},
    updatedAt: new Date().toISOString(),
  };

  upsertConversation(updatedConversation);

  return {
    ok: true,
    conversationId: updatedConversation.id,
    conversation: updatedConversation,
    reply: result.reply,
    planner: result.planner,
    decision: result.decision,
    unified: result.unified,
    toolData: {
      weather: result.weather,
      destinationResolved: result.destinationResolved,
      route: result.route,
      ui: result.ui,
    },
  };
}
