import { Router } from 'express';
import { getTacticalAdjusterStateController, runTacticalAdjusterController } from '../controllers/tactical-adjuster.controller.js';

const router = Router();
router.get('/state', getTacticalAdjusterStateController);
router.post('/run', runTacticalAdjusterController);
export default router;
