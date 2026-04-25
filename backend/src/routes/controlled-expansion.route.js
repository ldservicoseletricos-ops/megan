import { Router } from 'express';
import { getControlledExpansionStateController, runControlledExpansionController } from '../controllers/controlled-expansion.controller.js';

const router = Router();
router.get('/state', getControlledExpansionStateController);
router.post('/run', runControlledExpansionController);
export default router;
