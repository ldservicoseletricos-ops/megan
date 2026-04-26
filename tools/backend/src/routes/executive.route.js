import express from "express";
import { buildExecutiveQueue, getExecutiveQueue } from "../services/executive-queue.service.js";

const router = express.Router();

router.get("/queue", (req, res) => res.json({ ok: true, queue: getExecutiveQueue() }));
router.post("/queue/rebuild", (req, res) => res.json({ ok: true, queue: buildExecutiveQueue() }));

export default router;
