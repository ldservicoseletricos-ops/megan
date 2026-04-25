import { Router } from 'express';
import { getState, run } from '../controllers/decision-pipeline.controller.js';

const router = Router();
router.get('/state', getState);
router.post('/run', run);
export default router;
