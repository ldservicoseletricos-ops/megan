import { Router } from 'express';
import {
  getUnifiedCycleOverviewController,
  runUnifiedCycleController
} from '../controllers/unified-cycle.controller.js';

const router = Router();
router.get('/overview', getUnifiedCycleOverviewController);
router.post('/run', runUnifiedCycleController);
export default router;
