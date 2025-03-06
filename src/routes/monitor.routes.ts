import { Router } from 'express';
import MonitorController from '../controllers/monitor.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();
const controller = new MonitorController();

// Protect all routes
router.use(authenticateToken);

router.get('/sync/:syncId', controller.getSyncStatus);

export default router; 