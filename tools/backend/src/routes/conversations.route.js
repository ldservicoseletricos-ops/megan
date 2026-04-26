import { Router } from "express";
import {
  listConversations,
  getConversation,
  createConversation,
  updateConversation,
  deleteConversation,
} from "../lib/store.js";

const router = Router();

function normalizeText(value) {
  return String(value || "").trim();
}

function buildConversationListItem(conversation) {
  const messages = Array.isArray(conversation?.messages) ? conversation.messages : [];
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  return {
    id: conversation.id,
    title: normalizeText(conversation.title) || "Nova conversa",
    createdAt: conversation.createdAt || null,
    updatedAt: conversation.updatedAt || null,
    memory: conversation.memory || null,
    lastMessage: lastMessage
      ? {
          role: lastMessage.role || "assistant",
          content: normalizeText(lastMessage.content),
          createdAt: lastMessage.createdAt || null,
        }
      : null,
    messageCount: messages.length,
  };
}

router.get("/", (req, res, next) => {
  try {
    const conversations = listConversations();
    const items = conversations.map(buildConversationListItem);

    return res.json({
      ok: true,
      items,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", (req, res, next) => {
  try {
    const rawTitle = normalizeText(req.body?.title);
    const title = rawTitle || "Nova conversa";

    const conversation = createConversation(title);

    return res.status(201).json({
      ok: true,
      id: conversation.id,
      item: buildConversationListItem(conversation),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", (req, res, next) => {
  try {
    const id = normalizeText(req.params?.id);

    if (!id) {
      return res.status(400).json({
        ok: false,
        error: "ID da conversa inválido.",
      });
    }

    const conversation = getConversation(id);

    if (!conversation) {
      return res.status(404).json({
        ok: false,
        error: "Conversa não encontrada.",
      });
    }

    return res.json({
      ok: true,
      ...conversation,
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", (req, res, next) => {
  try {
    const id = normalizeText(req.params?.id);

    if (!id) {
      return res.status(400).json({
        ok: false,
        error: "ID da conversa inválido.",
      });
    }

    const rawTitle = normalizeText(req.body?.title);

    if (!rawTitle) {
      return res.status(400).json({
        ok: false,
        error: "Título inválido.",
      });
    }

    const title = rawTitle.slice(0, 120);

    const updated = updateConversation(id, (current) => ({
      ...current,
      title,
    }));

    if (!updated) {
      return res.status(404).json({
        ok: false,
        error: "Conversa não encontrada.",
      });
    }

    return res.json({
      ok: true,
      id: updated.id,
      item: buildConversationListItem(updated),
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", (req, res, next) => {
  try {
    const id = normalizeText(req.params?.id);

    if (!id) {
      return res.status(400).json({
        ok: false,
        error: "ID da conversa inválido.",
      });
    }

    const removed = deleteConversation(id);

    if (!removed) {
      return res.status(404).json({
        ok: false,
        error: "Conversa não encontrada.",
      });
    }

    return res.json({
      ok: true,
      deleted: true,
      id,
    });
  } catch (error) {
    next(error);
  }
});

export default router;