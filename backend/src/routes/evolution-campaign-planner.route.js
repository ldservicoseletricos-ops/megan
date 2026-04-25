import { Router } from 'express';
import { getEvolutionCampaignPlannerStateController, runEvolutionCampaignPlannerController } from '../controllers/evolution-campaign-planner.controller.js';

const router = Router();
router.get('/state', getEvolutionCampaignPlannerStateController);
router.post('/run', runEvolutionCampaignPlannerController);
export default router;
