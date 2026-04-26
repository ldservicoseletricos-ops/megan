import express from "express";
import { getUserProfile } from "../services/user-profile.service.js";
import { getUserMemory } from "../services/user-memory.service.js";
import { getPersonalizedSettings } from "../services/personalization.service.js";
import { getSessionMemory } from "../services/session-memory.service.js";
import { getUserPermissions } from "../services/permissions.service.js";

const router = express.Router();

router.get("/:userId/profile", (req, res) => res.json({ ok: true, profile: getUserProfile(req.params.userId) }));
router.get("/:userId/memory", (req, res) => res.json({ ok: true, memory: getUserMemory(req.params.userId) }));
router.get("/:userId/settings", (req, res) => res.json({ ok: true, settings: getPersonalizedSettings(req.params.userId) }));
router.get("/:userId/session", (req, res) => res.json({ ok: true, session: getSessionMemory(req.params.userId) }));
router.get("/:userId/permissions", (req, res) => res.json({ ok: true, permissions: getUserPermissions(req.params.userId) }));

export default router;
