
import { Router } from 'express';
import {
  getIntelligentExecutionOverviewController,
  runIntelligentExecutionNowController,
  toggleIntelligentExecutionController
} from '../controllers/intelligent-execution.controller.js';

const router = Router();
router.get('/overview', getIntelligentExecutionOverviewController);
router.post('/run', runIntelligentExecutionNowController);
router.post('/toggle', toggleIntelligentExecutionController);
export default router;
