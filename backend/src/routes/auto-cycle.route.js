import { Router } from 'express';
import {
  getAutoCycleOverviewController,
  runAutoCycleNowController,
  toggleAutoCycleController
} from '../controllers/auto-cycle.controller.js';

const router = Router();
router.get('/overview', getAutoCycleOverviewController);
router.post('/run', runAutoCycleNowController);
router.post('/toggle', toggleAutoCycleController);
export default router;
