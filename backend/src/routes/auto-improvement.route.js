import { Router } from 'express';
import { getAutoImprovementStateController, runAutoImprovementController } from '../controllers/auto-improvement.controller.js';

const router = Router();

router.get('/state', getAutoImprovementStateController);
router.post('/run', runAutoImprovementController);

export default router;
