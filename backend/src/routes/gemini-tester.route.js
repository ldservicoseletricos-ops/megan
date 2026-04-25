
import { Router } from 'express';
import {
  getGeminiTesterOverviewController,
  runGeminiTesterController
} from '../controllers/gemini-tester.controller.js';

const router = Router();

router.get('/overview', getGeminiTesterOverviewController);
router.post('/run', runGeminiTesterController);

export default router;
