import { Router } from 'express';
import { getAdvancedMemoryStateController, syncAdvancedMemoryController } from '../controllers/advanced-memory.controller.js';

const router = Router();
router.get('/state', getAdvancedMemoryStateController);
router.post('/sync', syncAdvancedMemoryController);

export default router;
