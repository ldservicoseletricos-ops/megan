import { Router } from 'express';
import { evaluateEvolutionGovernanceController, getEvolutionGovernanceStateController } from '../controllers/evolution-governance.controller.js';

const router = Router();
router.get('/state', getEvolutionGovernanceStateController);
router.post('/evaluate', evaluateEvolutionGovernanceController);
export default router;
