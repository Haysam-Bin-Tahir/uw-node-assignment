/**
 * Yapily Integration Controller
 * Handles bank integration operations.
 */
import { Request, Response } from 'express';
import YapilyService from '../services/yapily.service';
import AccountModel from '../models/account.model';
import TransactionModel from '../models/transaction.model';
import SyncStatusModel from '../models/sync-status.model';
import { syncTransactions } from '../services/sync.service';
import { Account } from '../interfaces/yapily.interface';

export default class YapilyController {

  async getInstitutions(req: Request, res: Response) {
    try {
      const institutions = await YapilyService.getInstitutions();
      res.json(institutions);
    } catch (error) {
      console.error('Failed to fetch institutions:', error);
      res.status(500).json({ 
        message: 'Failed to fetch institutions',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async initiateConsent(req: Request, res: Response) {
    try {
      const { institutionId } = req.body;
      if (!institutionId) {
        return res.status(400).json({ error: 'Institution ID is required' });
      }

      const consent = await YapilyService.createConsent(institutionId, req.user!._id.toString());
      res.json(consent);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }

  async handleCallback(req: Request, res: Response) {
    try {
      const { consent, 'application-user-id': userId } = req.query;
      
      if (!consent) {
        return res.status(400).json({ message: 'Consent token is required' });
      }

      const response = await YapilyService.getAccounts(consent as string);

      if (!response?.data) {
        return res.status(400).json({ message: 'No accounts data received' });
      }

      const accounts = await Promise.all(response.data.map((account: Account) => 
        AccountModel.findOneAndUpdate(
          { id: account.id, userId },
          { ...account, userId },
          { upsert: true, new: true }
        )
      ));

      res.json({ 
        message: 'Accounts synced successfully',
        accounts 
      });
    } catch (error) {
      console.error('Failed to handle callback:', error);
      res.status(500).json({ 
        message: 'Failed to sync accounts',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getAccounts(req: Request, res: Response) {
    try {
      const accounts = await AccountModel.find({ userId: req.user!._id });
      res.json(accounts);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      res.status(500).json({ 
        message: 'Failed to fetch accounts',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async fetchTransactions(req: Request, res: Response) {
    try {
      const { accountId } = req.params;
      const { consentToken } = req.body;

      if (!consentToken) {
        return res.status(400).json({ message: 'Consent token is required' });
      }

      // Verify account belongs to user
      const account = await AccountModel.findOne({ 
        id: accountId, 
        userId: req.user!._id 
      });

      if (!account) {
        return res.status(404).json({ message: 'Account not found' });
      }

      const syncStatus = await SyncStatusModel.create({
        accountId,
        userId: req.user!._id,
        status: 'pending',
        progress: 0
      });

      // Start sync process
      syncTransactions(accountId, consentToken, syncStatus._id.toString(), req.user!._id)
        .catch(console.error);

      res.json({ 
        message: 'Transaction sync started',
        syncId: syncStatus._id,
        statusUrl: `/api/monitor/sync/${syncStatus._id}`
      });
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      res.status(500).json({ 
        message: 'Failed to start transaction sync',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getTransactions(req: Request, res: Response) {
    try {
      const { accountId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // Verify account belongs to user
      const account = await AccountModel.findOne({ 
        id: accountId, 
        userId: req.user!._id 
      });

      if (!account) {
        return res.status(404).json({ message: 'Account not found' });
      }

      const total = await TransactionModel.countDocuments({ 
        accountId,
        userId: req.user!._id 
      });

      const transactions = await TransactionModel
        .find({ accountId, userId: req.user!._id })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      res.json({
        data: transactions.map(t => ({
          ...t,
          amount: parseFloat(t.amount.toString())
        })),
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Failed to get transactions:', error);
      res.status(500).json({ 
        message: 'Failed to fetch transactions',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getSyncStatus(req: Request, res: Response) {
    try {
      const { syncId } = req.params;
      const status = await SyncStatusModel.findById(syncId);
      
      if (!status) {
        return res.status(404).json({ error: 'Sync status not found' });
      }

      res.json({
        status: status.status,
        progress: status.progress,
        total: status.total,
        error: status.error,
        startedAt: status.startedAt,
        completedAt: status.completedAt
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }
} 