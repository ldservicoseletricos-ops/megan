import { Router } from 'express';
import {
  getAutonomyOverviewController,
  runAutonomyPulseController,
  toggleAutonomyController,
  getFounderController,
  toggleFounderController,
  runFounderController,
  getRevenueController,
  toggleRevenueController,
  runRevenueController,
  getExpansionController,
  toggleExpansionController,
  runExpansionController,
  getSchedulerController,
  startSchedulerController,
  stopSchedulerController
} from '../controllers/autonomy.controller.js';

const router = Router();

router.get('/overview', getAutonomyOverviewController);
router.post('/pulse', runAutonomyPulseController);
router.post('/toggle', toggleAutonomyController);

router.get('/founder', getFounderController);
router.post('/founder/toggle', toggleFounderController);
router.post('/founder/run', runFounderController);

router.get('/revenue', getRevenueController);
router.post('/revenue/toggle', toggleRevenueController);
router.post('/revenue/run', runRevenueController);

router.get('/expansion', getExpansionController);
router.post('/expansion/toggle', toggleExpansionController);
router.post('/expansion/run', runExpansionController);

router.get('/scheduler', getSchedulerController);
router.post('/scheduler/start', startSchedulerController);
router.post('/scheduler/stop', stopSchedulerController);

export default router;
