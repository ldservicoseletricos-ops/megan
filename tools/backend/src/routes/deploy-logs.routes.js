import { Router } from 'express'; import { deployLogsController } from '../controllers/deploy-logs.controller.js'; const r=Router(); r.get('/deploy-logs',deployLogsController); export default r;
