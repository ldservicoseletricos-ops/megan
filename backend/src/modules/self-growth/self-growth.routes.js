const express = require("express");
const service = require("./self-growth.service");
const router = express.Router();
function asyncRoute(handler){ return async (req,res,next)=>{ try{ await handler(req,res,next); } catch(error){ next(error); } }; }
router.get("/dashboard", (_req,res)=>res.json(service.buildDashboard()));
router.post("/analyze", asyncRoute(async (_req,res)=>res.json(service.runAnalysis())));
router.get("/plan", (_req,res)=>res.json(service.createGrowthPlan()));
router.post("/execute-safe", asyncRoute(async (req,res)=>{ const result=service.executeSafeActions(req.body||{}); res.status(result.needsConfirmation?202:200).json(result); }));
router.post("/mode", (req,res)=>res.json(service.setMode(req.body?.mode)));
module.exports = router;
