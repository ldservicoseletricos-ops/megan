import { Router } from 'express';
import {
  getImprovementProposalsStateController,
  generateImprovementProposalsController,
  applyImprovementProposalController
} from '../controllers/improvement-proposals.controller.js';

const router = Router();

router.get('/state', getImprovementProposalsStateController);
router.post('/generate', generateImprovementProposalsController);
router.post('/apply', applyImprovementProposalController);

export default router;
