import { Router } from 'express';
import {
  getSelfEvaluationOverviewController,
  runSelfEvaluationController
} from '../controllers/self-evaluation.controller.js';

const router = Router();
router.get('/overview', getSelfEvaluationOverviewController);
router.post('/run', runSelfEvaluationController);
export default router;
