import { Router } from 'express';
import MonitorController from '../controllers/monitor.controller';

const router = Router();
const controller = new MonitorController();

router.get('/sync/:syncId', controller.getSyncStatus);

export default router; 