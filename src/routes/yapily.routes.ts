import { Router } from 'express';
import YapilyController from '../controllers/yapily.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();
const controller = new YapilyController();

router.get('/institutions', authenticateToken, controller.getInstitutions);
router.post('/consent', authenticateToken, controller.initiateConsent);
router.get('/auth/callback', controller.handleCallback);
router.get('/accounts', authenticateToken, controller.getAccounts);
router.post('/accounts/:accountId/transactions/fetch', authenticateToken, controller.fetchTransactions);
router.get('/accounts/:accountId/transactions', authenticateToken, controller.getTransactions);

export default router; 