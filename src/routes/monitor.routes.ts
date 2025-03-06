import { Router } from 'express';
import MonitorController from '../controllers/monitor.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();
const controller = new MonitorController();

router.get('/sync/:syncId', authenticateToken, controller.getSyncStatus);

export default router; 