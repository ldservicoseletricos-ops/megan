import { addMessage, listMessages } from '../services/store.service.js';

export function chatController(req, res) {
  const { message = '' } = req.body || {};
  const reply = {
    id: Date.now().toString(),
    user: message,
    assistant: `Resposta consolidada da Megan para: ${message}`,
  };
  addMessage(reply);
  res.json({ ok: true, reply });
}

export function memoryController(req, res) {
  res.json({ ok: true, memory: listMessages() });
}
