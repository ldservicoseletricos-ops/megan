import { Router } from 'express';
import { createGoalController, getGoalsStateController, rebuildGoalController } from '../controllers/goals.controller.js';

const router = Router();

router.get('/state', getGoalsStateController);
router.post('/create', createGoalController);
router.post('/rebuild', rebuildGoalController);

export default router;
