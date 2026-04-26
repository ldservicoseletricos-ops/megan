import { Router } from 'express';
import {
  getCycleLearningOverviewController,
  runCycleLearningRecordController
} from '../controllers/cycle-learning.controller.js';

const router = Router();
router.get('/overview', getCycleLearningOverviewController);
router.post('/record', runCycleLearningRecordController);
export default router;
