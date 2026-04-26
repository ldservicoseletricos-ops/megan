import { Router } from 'express';
import { advanceExecutionRoadmapController, failExecutionRoadmapController, getExecutionRoadmapStateController } from '../controllers/execution-roadmap.controller.js';

const router = Router();

router.get('/state', getExecutionRoadmapStateController);
router.post('/advance', advanceExecutionRoadmapController);
router.post('/fail', failExecutionRoadmapController);

export default router;
