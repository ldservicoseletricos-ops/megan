const express = require('express');
const service = require('./self-infrastructure.service');
const router = express.Router();
function asyncRoute(handler) { return async (req, res, next) => { try { await handler(req, res, next); } catch (error) { next(error); } }; }
router.get('/dashboard', (_req, res) => res.json(service.buildDashboard()));
router.post('/scan', asyncRoute(async (req, res) => res.json(await service.runScan(req.body || {}))));
router.get('/repair-plan', (_req, res) => res.json(service.buildRepairPlan()));
router.post('/repair-all', asyncRoute(async (req, res) => { const result = await service.repairAll(req.body || {}); res.status(result.needsConfirmation ? 202 : 200).json(result); }));
router.post('/monitor', (req, res) => res.json(service.setMonitor(Boolean(req.body?.enabled))));
module.exports = router;
