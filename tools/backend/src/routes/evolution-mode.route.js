import { Router } from 'express';
import { getEvolutionModeStateController, setEvolutionModeController } from '../controllers/evolution-mode.controller.js';

const router = Router();
router.get('/state', getEvolutionModeStateController);
router.post('/set', setEvolutionModeController);
export default router;
