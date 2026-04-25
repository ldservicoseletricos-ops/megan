import { Router } from 'express';
import { getLearningStateController, runLearningCycleController } from '../controllers/learning.controller.js';

const router = Router();
router.get('/state', getLearningStateController);
router.post('/run', runLearningCycleController);

export default router;
