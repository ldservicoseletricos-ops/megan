import { Router } from 'express'; import { adminController } from '../controllers/admin.controller.js'; const r=Router(); r.get('/admin', adminController); export default r;
