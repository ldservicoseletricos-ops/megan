import { Router } from 'express';
import {
  runChatProcessController,
  streamChatProcessController,
  getAutonomyStateController,
  runAutonomyLoopController,
  getEnvStatusController,
  updateEnvConfigController,
  testGeminiConnectionController
} from '../controllers/chat.process.controller.js';

const router = Router();

router.get('/status', (_req, res) => {
  res.json({
    ok: true,
    version: '138.0.0',
    mode: 'Self Evolution Core',
    runtimeState: 'Operacional'
  });
});

router.get('/autonomy/state', getAutonomyStateController);
router.get('/config/env-status', getEnvStatusController);
router.post('/config/env', updateEnvConfigController);
router.post('/config/test-gemini', testGeminiConnectionController);
router.post('/autonomy/loop', runAutonomyLoopController);
router.post('/process', runChatProcessController);
router.post('/process/stream', streamChatProcessController);

export default router;
