import { Router } from 'express'; import { healthController } from '../controllers/health.controller.js'; const r=Router(); r.get('/health', healthController); export default r;
