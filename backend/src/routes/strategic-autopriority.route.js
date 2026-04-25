import { Router } from 'express';
import { getStrategicAutopriorityStateController, runStrategicAutopriorityController } from '../controllers/strategic-autopriority.controller.js';

const router = Router();
router.get('/state', getStrategicAutopriorityStateController);
router.post('/run', runStrategicAutopriorityController);
export default router;
