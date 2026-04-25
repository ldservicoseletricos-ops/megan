import { Router } from 'express';
import { getMissionContinuityStateController, runMissionContinuityController } from '../controllers/mission-continuity.controller.js';

const router = Router();
router.get('/state', getMissionContinuityStateController);
router.post('/run', runMissionContinuityController);
export default router;
