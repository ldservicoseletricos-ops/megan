
import { Router } from 'express';
import {
  getClosedLoopOverviewController,
  runClosedLoopCycleController,
  toggleClosedLoopController
} from '../controllers/closed-loop.controller.js';

const router = Router();
router.get('/overview', getClosedLoopOverviewController);
router.post('/run', runClosedLoopCycleController);
router.post('/toggle', toggleClosedLoopController);
export default router;
