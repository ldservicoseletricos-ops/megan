import { Router } from 'express';
import { getState, run } from '../controllers/bottleneck-detector.controller.js';

const router = Router();

router.get('/state', getState);
router.post('/run', run);

export default router;
