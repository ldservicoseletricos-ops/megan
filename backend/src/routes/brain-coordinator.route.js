import { Router } from 'express';
import { getBrainCoordinatorStateController, runBrainCoordinatorController } from '../controllers/brain-coordinator.controller.js';

const router = Router();
router.get('/state', getBrainCoordinatorStateController);
router.post('/run', runBrainCoordinatorController);
export default router;
