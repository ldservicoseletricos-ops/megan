import express from "express";
import { getOrgOverview, createDepartment, listDepartments, getDepartment, assignUserToDepartment } from "../services/org.service.js";

const router = express.Router();

router.get("/", (req, res) => res.json({ ok: true, org: getOrgOverview() }));
router.get("/departments", (req, res) => res.json({ ok: true, departments: listDepartments() }));
router.get("/departments/:departmentId", (req, res) => res.json({ ok: true, department: getDepartment(req.params.departmentId) }));
router.post("/departments", (req, res) => res.json({ ok: true, department: createDepartment(req.body || {}) }));
router.post("/users/assign", (req, res) => res.json({ ok: true, department: assignUserToDepartment(req.body || {}) }));

export default router;
