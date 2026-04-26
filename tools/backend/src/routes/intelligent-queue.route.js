
import { Router } from 'express';
import {
  getIntelligentQueueOverviewController,
  runIntelligentQueueRebuildController
} from '../controllers/intelligent-queue.controller.js';

const router = Router();
router.get('/overview', getIntelligentQueueOverviewController);
router.post('/rebuild', runIntelligentQueueRebuildController);
export default router;
