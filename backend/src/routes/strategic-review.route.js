import { Router } from 'express';
import { getStrategicReviewStateController, runStrategicReviewController } from '../controllers/strategic-review.controller.js';

const router = Router();
router.get('/state', getStrategicReviewStateController);
router.post('/run', runStrategicReviewController);
export default router;
