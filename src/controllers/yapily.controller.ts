import { Request, Response } from 'express';
import YapilyService from '../services/yapily.service';
import AccountModel from '../models/account.model';
import TransactionModel from '../models/transaction.model';
import { Transaction } from '../interfaces/yapily.interface';
import SyncStatusModel from '../models/sync-status.model';
import { syncTransactions } from '../services/sync.service';

export default class YapilyController {

  async getInstitutions(req: Request, res: Response) {
    try {
      const institutions = await YapilyService.getInstitutions();
      res.json(institutions);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'status' in error) {
        const apiError = error as { status: number; message: string; details?: any };
        res.status(apiError.status).json({
          error: apiError.message,
          details: process.env.NODE_ENV === 'development' ? apiError.details : undefined
        });
      } else {
        res.status(500).json({ 
          error: 'Internal server error'
        });
      }
    }
  }

  async initiateConsent(req: Request, res: Response) {
    try {
      const { institutionId } = req.body;
      if (!institutionId) {
        return res.status(400).json({ error: 'Institution ID is required' });
      }

      const consent = await YapilyService.createConsent(institutionId);
      res.json(consent);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }

  async handleCallback(req: Request, res: Response) {
    try {
      const { consent } = req.query;
      if (!consent) {
        return res.status(400).json({ error: 'Consent token is required' });
      }

      const response = await YapilyService.getAccounts(consent as string);

      // The accounts are in the response.data array
      if (response?.data) {
        // Store accounts in database
        for (const account of response.data) {
          await AccountModel.findOneAndUpdate(
            { id: account.id },
            account,
            { upsert: true, new: true }
          );
        }
        res.json({ 
          message: 'Accounts synced successfully',
          accounts: response.data 
        });
      } else {
        res.status(400).json({ 
          error: 'No accounts data received',
          response 
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }

  async getAccounts(req: Request, res: Response) {
    try {
      const accounts = await AccountModel.find();
      res.json(accounts);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }

  async fetchTransactions(req: Request, res: Response) {
    try {
      const { accountId } = req.params;
      const { consentToken } = req.body;

      if (!consentToken) {
        return res.status(400).json({ error: 'Consent token is required' });
      }

      const syncStatus = await SyncStatusModel.create({
        accountId,
        status: 'pending',
        progress: 0
      });

      // Use the service function directly
      syncTransactions(accountId, consentToken, syncStatus._id.toString()).catch(console.error);

      res.json({ 
        message: 'Transaction sync started',
        syncId: syncStatus._id,
        statusUrl: `/api/monitor/sync/${syncStatus._id}`
      });

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }

  async getTransactions(req: Request, res: Response) {
    try {
      const { accountId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // Get total count for pagination
      const total = await TransactionModel.countDocuments({ accountId });

      // Get paginated transactions
      const transactions = await TransactionModel.find({ accountId })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      // Transform the amount field
      const transformedTransactions = transactions.map(transaction => ({
        ...transaction,
        amount: parseFloat(transaction.amount.toString())
      }));

      res.json({
        data: transformedTransactions,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: errorMessage });
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