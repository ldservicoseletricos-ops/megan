import { Router } from 'express';
import { getMemoryStateController, rememberController, recallController } from '../controllers/memory.controller.js';

const router = Router();
router.get('/state', getMemoryStateController);
router.post('/remember', rememberController);
router.post('/recall', recallController);

export default router;
