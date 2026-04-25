import express from "express";
import { createTeam, listTeams, getTeam } from "../services/team.service.js";
import { getSharedMemoryByUser, addSharedFact } from "../services/shared-memory.service.js";
import { createSubAccount, listSubAccounts } from "../services/subaccounts.service.js";
import { listAuditLogs, appendAuditLog } from "../services/audit-log.service.js";

const router = express.Router();

router.get("/", (req, res) => res.json({ ok: true, teams: listTeams() }));
router.post("/", (req, res) => {
  const team = createTeam(req.body || {});
  appendAuditLog({ type: "team_created", payload: team });
  return res.json({ ok: true, team });
});
router.get("/:teamId", (req, res) => res.json({ ok: true, team: getTeam(req.params.teamId) }));
router.get("/users/:userId/shared-memory", (req, res) => res.json({ ok: true, sharedMemory: getSharedMemoryByUser(req.params.userId) }));
router.post("/users/:userId/shared-memory/facts", (req, res) => res.json({ ok: true, sharedMemory: addSharedFact(req.params.userId, (req.body || {}).fact) }));
router.post("/subaccounts", (req, res) => res.json({ ok: true, subAccounts: createSubAccount(req.body || {}) }));
router.get("/subaccounts/:parentUserId", (req, res) => res.json({ ok: true, subAccounts: listSubAccounts(req.params.parentUserId) }));
router.get("/audit/logs", (req, res) => res.json({ ok: true, logs: listAuditLogs() }));

export default router;
