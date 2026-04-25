import express from 'express';
import { runPhase7Orchestrator } from '../services/core-orchestrator.service.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { intent = { kind: 'general' }, memory = {}, execution = {}, planner = {}, blockers = [], history = [] } = req.body || {};
    const orchestration = runPhase7Orchestrator({ intent, memory, execution, planner, blockers, history });

    return res.json({
      ok: true,
      reply: 'Megan Fase 7 ativa. Orquestração suprema carregada.',
      orchestration,
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'Falha na Fase 7.' });
  }
});

export default router;
