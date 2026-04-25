import express from "express";
import { buildPendingItems, getPendingItems } from "../services/pending-tracker.service.js";

const router = express.Router();

router.get("/pending", (req, res) => res.json({ ok: true, pending: getPendingItems() }));
router.post("/pending/rebuild", (req, res) => res.json({ ok: true, pending: buildPendingItems() }));

export default router;
