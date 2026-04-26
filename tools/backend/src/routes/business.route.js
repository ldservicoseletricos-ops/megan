import express from "express";
import { getBusinessGoals, buildBusinessGoals } from "../services/goals-engine.service.js";
import { getGrowthReport, buildGrowthReport } from "../services/growth-engine.service.js";
import { getSalesReport, buildSalesReport } from "../services/sales-engine.service.js";
import { getMarketingReport, buildMarketingReport } from "../services/marketing-engine.service.js";
import { getCompanyPanel, buildCompanyPanel } from "../services/company-panel.service.js";

const router = express.Router();

router.get("/goals", (req, res) => res.json({ ok: true, goals: getBusinessGoals() }));
router.post("/goals/rebuild", (req, res) => res.json({ ok: true, goals: buildBusinessGoals() }));
router.get("/growth", (req, res) => res.json({ ok: true, growth: getGrowthReport() }));
router.post("/growth/rebuild", (req, res) => res.json({ ok: true, growth: buildGrowthReport() }));
router.get("/sales", (req, res) => res.json({ ok: true, sales: getSalesReport() }));
router.post("/sales/rebuild", (req, res) => res.json({ ok: true, sales: buildSalesReport() }));
router.get("/marketing", (req, res) => res.json({ ok: true, marketing: getMarketingReport() }));
router.post("/marketing/rebuild", (req, res) => res.json({ ok: true, marketing: buildMarketingReport() }));
router.get("/panel", (req, res) => res.json({ ok: true, panel: getCompanyPanel() }));
router.post("/panel/rebuild", (req, res) => res.json({ ok: true, panel: buildCompanyPanel() }));

export default router;
