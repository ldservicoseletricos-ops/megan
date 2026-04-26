import { Router } from 'express';
import { getResourceOptimizerStateController, runResourceOptimizerController } from '../controllers/resource-optimizer.controller.js';

const router = Router();
router.get('/state', getResourceOptimizerStateController);
router.post('/run', runResourceOptimizerController);
export default router;
