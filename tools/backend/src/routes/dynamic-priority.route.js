import { Router } from 'express';
import { getState, run } from '../controllers/dynamic-priority.controller.js';
const router=Router(); router.get('/state',getState); router.post('/run',run); export default router;