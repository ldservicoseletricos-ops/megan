import { Router } from 'express';
import { getConsensusEngineStateController, runConsensusEngineController } from '../controllers/consensus-engine.controller.js';

const router = Router();
router.get('/state', getConsensusEngineStateController);
router.post('/run', runConsensusEngineController);
export default router;
