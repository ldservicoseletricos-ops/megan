import { Router } from 'express';
import { createDevPlan, generatePrompt, getDevStudioStatus } from '../services/devStudio.service.js';

const router = Router();

router.get('/status', (req, res) => {
  res.json(getDevStudioStatus());
});

router.post('/plan', (req, res) => {
  res.json(createDevPlan(req.body));
});

router.post('/prompt', (req, res) => {
  res.json(generatePrompt(req.body));
});

export default router;
