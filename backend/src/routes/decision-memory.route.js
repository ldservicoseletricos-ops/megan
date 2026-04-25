import { Router } from 'express';
import { getDecisionMemoryStateController, syncDecisionMemoryController } from '../controllers/decision-memory.controller.js';

const router = Router();
router.get('/state', getDecisionMemoryStateController);
router.post('/sync', syncDecisionMemoryController);

export default router;
