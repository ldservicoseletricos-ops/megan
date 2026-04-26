import { Router } from 'express';
import {
  getPriorityActionOverviewController,
  runPriorityActionController
} from '../controllers/priority-action.controller.js';

const router = Router();
router.get('/overview', getPriorityActionOverviewController);
router.post('/run', runPriorityActionController);
export default router;
