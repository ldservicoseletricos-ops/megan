import { Router } from 'express';
import { getContinuousAutonomyStateController, runContinuousAutonomyController } from '../controllers/continuous-autonomy.controller.js';

const router = Router();
router.get('/state', getContinuousAutonomyStateController);
router.post('/run', runContinuousAutonomyController);
export default router;
