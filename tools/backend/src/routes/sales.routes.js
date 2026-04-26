import { Router } from 'express'; import { getSalesController } from '../controllers/sales.controller.js'; const router = Router(); router.get('/sales', getSalesController); export default router;
