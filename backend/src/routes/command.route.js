import express from "express";
import { getUnifiedDecision, buildUnifiedDecision } from "../services/unified-decision.service.js";
import { getCommandCenter, buildCommandCenter } from "../services/command-center.service.js";

const router = express.Router();

router.get("/decision", (req, res) => res.json({ ok: true, decision: getUnifiedDecision() }));
router.post("/decision/rebuild", (req, res) => res.json({ ok: true, decision: buildUnifiedDecision() }));
router.get("/center", (req, res) => res.json({ ok: true, center: getCommandCenter() }));
router.post("/center/rebuild", (req, res) => res.json({ ok: true, center: buildCommandCenter() }));

export default router;
