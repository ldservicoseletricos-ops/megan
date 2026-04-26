import express from "express";
import { getAutonomousStatus, runAutonomousEngine } from "../services/autonomous-engine.service.js";
import { getStrategyReport, buildStrategyReport } from "../services/strategy-engine.service.js";
import { getCeoPanel, buildCeoPanel } from "../services/ceo-panel.service.js";
import { learnFromResult, listLearningLogs } from "../services/learning-engine.service.js";
import { registerSelfUpgrade, listSelfUpgrades } from "../services/self-upgrade.service.js";

const router = express.Router();

router.get("/status", (req, res) => res.json({ ok: true, status: getAutonomousStatus() }));
router.post("/run", (req, res) => res.json({ ok: true, run: runAutonomousEngine(req.body || {}) }));
router.get("/strategy", (req, res) => res.json({ ok: true, strategy: getStrategyReport() }));
router.post("/strategy/rebuild", (req, res) => res.json({ ok: true, strategy: buildStrategyReport() }));
router.get("/ceo", (req, res) => res.json({ ok: true, ceo: getCeoPanel() }));
router.post("/ceo/rebuild", (req, res) => res.json({ ok: true, ceo: buildCeoPanel() }));
router.post("/learn", (req, res) => res.json({ ok: true, learning: learnFromResult(req.body || {}) }));
router.get("/learn", (req, res) => res.json({ ok: true, logs: listLearningLogs() }));
router.post("/upgrade", (req, res) => res.json({ ok: true, upgrade: registerSelfUpgrade(req.body || {}) }));
router.get("/upgrade", (req, res) => res.json({ ok: true, upgrades: listSelfUpgrades() }));

export default router;
