import { Router } from "express";
import { listImprovementSuggestions } from "../lib/store.js";
import { changeBacklogStatus, summarizeBacklog } from "../services/backlog.service.js";

const router = Router();

router.get("/", (req, res) => {
  const userId = String(req.query.userId || "luiz").trim().toLowerCase() || "luiz";
  const status = req.query.status ? String(req.query.status).trim() : undefined;
  const limit = Number(req.query.limit || 50);

  return res.json({
    ok: true,
    userId,
    summary: summarizeBacklog({ userId, limit }),
    items: listImprovementSuggestions({ userId, status, limit }),
  });
});

router.patch("/:id", (req, res) => {
  const updated = changeBacklogStatus(req.params.id, String(req.body?.status || "proposed"));

  if (!updated) {
    return res.status(404).json({ ok: false, error: "Melhoria não encontrada." });
  }

  return res.json({ ok: true, item: updated });
});

export default router;