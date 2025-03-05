import { Router } from 'express';
import YapilyController from '../controllers/yapily.controller';

const router = Router();
const controller = new YapilyController();

router.get('/institutions', controller.getInstitutions);
router.post('/consent', controller.initiateConsent);
router.get('/auth/callback', controller.handleCallback);
router.get('/accounts', controller.getAccounts);
router.post('/accounts/:accountId/transactions/fetch', controller.fetchTransactions);
router.get('/accounts/:accountId/transactions', controller.getTransactions);

export default router; 