import express from "express";
import { listProjects, createProject } from "../services/projects.service.js";

const router = express.Router();

router.get("/", (req, res) => res.json({ ok: true, projects: listProjects() }));
router.post("/", (req, res) => res.json({ ok: true, project: createProject(req.body || {}) }));

export default router;
