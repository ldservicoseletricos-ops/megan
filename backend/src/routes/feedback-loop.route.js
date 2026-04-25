import { Router } from 'express';
import { getFeedbackLoopStateController, registerFeedbackController } from '../controllers/feedback-loop.controller.js';

const router = Router();
router.get('/state', getFeedbackLoopStateController);
router.post('/register', registerFeedbackController);
export default router;
