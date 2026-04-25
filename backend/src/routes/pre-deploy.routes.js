import { Router } from 'express'; import { preDeployController } from '../controllers/pre-deploy.controller.js'; const r=Router(); r.get('/pre-deploy-check',preDeployController); export default r;
