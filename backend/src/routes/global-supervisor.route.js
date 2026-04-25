import { Router } from 'express';
import { getGlobalSupervisorStateController, runGlobalSupervisorController } from '../controllers/global-supervisor.controller.js';

const router = Router();
router.get('/state', getGlobalSupervisorStateController);
router.post('/run', runGlobalSupervisorController);
export default router;
