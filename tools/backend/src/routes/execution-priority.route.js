import { Router } from 'express';
import {
  getExecutionPriorityStateController,
  getExecutionPriorityNextController,
  enqueueExecutionPriorityController,
  updateExecutionPriorityController
} from '../controllers/execution-priority.controller.js';

const router = Router();
router.get('/state', getExecutionPriorityStateController);
router.get('/next', getExecutionPriorityNextController);
router.post('/enqueue', enqueueExecutionPriorityController);
router.post('/update', updateExecutionPriorityController);

export default router;
