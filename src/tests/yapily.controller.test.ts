import { Request, Response } from 'express';
import YapilyController from '../controllers/yapily.controller';
import YapilyService from '../services/yapily.service';
import AccountModel from '../models/account.model';
import mongoose from 'mongoose';
import SyncStatusModel from '../models/sync-status.model';
import TransactionModel from '../models/transaction.model';

jest.mock('../services/yapily.service');
jest.mock('../models/account.model');
jest.mock('../models/sync-status.model');
jest.mock('../models/transaction.model');

// For the error test, we should expect the console.error
// Add this before the test suite
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('YapilyController', () => {
  let controller: YapilyController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    controller = new YapilyController();
    mockRequest = {
      params: {},
      query: {},
      body: {},
      user: {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        email: 'test@example.com',
        password: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date()
      } as any // Type assertion to avoid implementing all 55+ properties
    };
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe('getInstitutions', () => {
    it('should return list of institutions', async () => {
      const mockInstitutions = [
        { id: 'bank-1', name: 'Bank One' }
      ];
      
      (YapilyService.getInstitutions as jest.Mock).mockResolvedValue(mockInstitutions);

      await controller.getInstitutions(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(mockInstitutions);
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      (YapilyService.getInstitutions as jest.Mock).mockRejectedValue(error);

      await controller.getInstitutions(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch institutions:', error);
    });
  });

  describe('handleCallback', () => {
    it('should sync accounts successfully', async () => {
      mockRequest.query = {
        consent: 'consent-token',
        'application-user-id': '507f1f77bcf86cd799439011'
      };

      const mockAccounts = [
        { id: 'acc-1', balance: 1000 }
      ];
      
      (YapilyService.getAccounts as jest.Mock).mockResolvedValue({
        data: mockAccounts
      });

      await controller.handleCallback(mockRequest as Request, mockResponse as Response);

      expect(AccountModel.findOneAndUpdate).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Accounts synced successfully'
      }));
    });

    it('should return 400 if consent is missing', async () => {
      mockRequest.query = {};

      await controller.handleCallback(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Consent token is required'
      });
    });

    it('should handle API errors', async () => {
      mockRequest.query = {
        consent: 'consent-token',
        'application-user-id': '507f1f77bcf86cd799439011'
      };

      const error = new Error('API Error');
      (YapilyService.getAccounts as jest.Mock).mockRejectedValue(error);

      await controller.handleCallback(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to handle callback:', error);
    });

    it('should handle empty response data', async () => {
      mockRequest.query = {
        consent: 'consent-token',
        'application-user-id': '507f1f77bcf86cd799439011'
      };

      (YapilyService.getAccounts as jest.Mock).mockResolvedValue({});

      await controller.handleCallback(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'No accounts data received'
      });
    });
  });

  describe('getAccounts', () => {
    it('should return user accounts', async () => {
      const mockAccounts = [
        { id: 'acc-1', balance: 1000 },
        { id: 'acc-2', balance: 2000 }
      ];
      
      (AccountModel.find as jest.Mock).mockResolvedValue(mockAccounts);

      await controller.getAccounts(mockRequest as Request, mockResponse as Response);

      expect(AccountModel.find).toHaveBeenCalledWith({ 
        userId: mockRequest.user!._id 
      });
      expect(mockResponse.json).toHaveBeenCalledWith(mockAccounts);
    });

    it('should handle errors', async () => {
      const error = new Error('DB Error');
      (AccountModel.find as jest.Mock).mockRejectedValue(error);

      await controller.getAccounts(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch accounts:', error);
    });
  });

  describe('fetchTransactions', () => {
    beforeEach(() => {
      mockRequest.params = { accountId: 'acc-1' };
      mockRequest.body = { consentToken: 'valid-token' };
    });

    it('should start transaction sync', async () => {
      (AccountModel.findOne as jest.Mock).mockResolvedValue({
        id: 'acc-1',
        userId: mockRequest.user!._id
      });

      const mockId = new mongoose.Types.ObjectId();
      const mockSyncStatus = {
        _id: mockId,
        accountId: 'acc-1',
        userId: mockRequest.user!._id,
        status: 'pending',
        progress: 0
      };

      (SyncStatusModel.create as jest.Mock).mockResolvedValue(mockSyncStatus);

      await controller.fetchTransactions(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Transaction sync started',
        syncId: mockId,
        statusUrl: `/api/monitor/sync/${mockId}`
      });
    });

    it('should return 400 if consent token missing', async () => {
      mockRequest.body = {};

      await controller.fetchTransactions(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if account not found', async () => {
      (AccountModel.findOne as jest.Mock).mockResolvedValue(null);

      await controller.fetchTransactions(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it('should handle database errors', async () => {
      (AccountModel.findOne as jest.Mock).mockResolvedValue({
        id: 'acc-1',
        userId: mockRequest.user!._id
      });

      const error = new Error('DB Error');
      (SyncStatusModel.create as jest.Mock).mockRejectedValue(error);

      await controller.fetchTransactions(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch transactions:', error);
    });
  });

  describe('getTransactions', () => {
    beforeEach(() => {
      mockRequest.params = { accountId: 'acc-1' };
      mockRequest.query = { page: '1', limit: '10' };
    });

    it('should return paginated transactions', async () => {
      const mockAccount = {
        id: 'acc-1',
        userId: mockRequest.user!._id
      };

      const mockTransactions = [
        { id: 'tx-1', amount: new mongoose.Types.Decimal128('100.50') },
        { id: 'tx-2', amount: new mongoose.Types.Decimal128('200.75') }
      ];

      (AccountModel.findOne as jest.Mock).mockResolvedValue(mockAccount);
      (TransactionModel.countDocuments as jest.Mock).mockResolvedValue(2);
      
      const mockFind = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockTransactions)
      };
      
      (TransactionModel.find as jest.Mock).mockReturnValue(mockFind);

      await controller.getTransactions(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        data: mockTransactions.map(t => ({
          ...t,
          amount: parseFloat(t.amount.toString())
        })),
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          pages: 1
        }
      });
    });

    it('should return 404 if account not found', async () => {
      (AccountModel.findOne as jest.Mock).mockResolvedValue(null);

      await controller.getTransactions(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it('should handle invalid pagination parameters', async () => {
      mockRequest.query = { page: 'invalid', limit: 'invalid' };
      mockRequest.params = { accountId: 'acc-1' };

      const mockAccount = {
        id: 'acc-1',
        userId: mockRequest.user!._id
      };

      (AccountModel.findOne as jest.Mock).mockResolvedValue(mockAccount);

      await controller.getTransactions(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        pagination: expect.objectContaining({
          page: 1,  // Should default to 1
          limit: 10 // Should default to 10
        })
      }));
    });

    it('should handle database errors', async () => {
      mockRequest.params = { accountId: 'acc-1' };
      
      const error = new Error('DB Error');
      (AccountModel.findOne as jest.Mock).mockRejectedValue(error);

      await controller.getTransactions(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to get transactions:', error);
    });
  });

  describe('initiateConsent', () => {
    it('should initiate consent successfully', async () => {
      mockRequest.body = {
        institutionId: 'test-bank'
      };

      const mockConsent = {
        id: 'consent-123',
        status: 'AWAITING_AUTHORIZATION'
      };

      (YapilyService.createConsent as jest.Mock).mockResolvedValue(mockConsent);

      await controller.initiateConsent(mockRequest as Request, mockResponse as Response);

      expect(YapilyService.createConsent).toHaveBeenCalledWith(
        'test-bank',
        mockRequest.user!._id.toString()
      );
      expect(mockResponse.json).toHaveBeenCalledWith(mockConsent);
    });

    it('should return 400 if institutionId is missing', async () => {
      mockRequest.body = {};

      await controller.initiateConsent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Institution ID is required'
      });
    });

    it('should handle API errors', async () => {
      mockRequest.body = {
        institutionId: 'test-bank'
      };

      const error = new Error('API Error');
      (YapilyService.createConsent as jest.Mock).mockRejectedValue(error);

      await controller.initiateConsent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: error.message
      });
    });
  });

  describe('getSyncStatus', () => {
    it('should return sync status successfully', async () => {
      const mockSyncId = new mongoose.Types.ObjectId();
      mockRequest.params = { syncId: mockSyncId.toString() };

      const mockStatus = {
        _id: mockSyncId,
        status: 'completed',
        progress: 100,
        total: 100,
        startedAt: new Date(),
        completedAt: new Date()
      };

      (SyncStatusModel.findById as jest.Mock).mockResolvedValue(mockStatus);

      await controller.getSyncStatus(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        status: mockStatus.status,
        progress: mockStatus.progress,
        total: mockStatus.total,
        startedAt: mockStatus.startedAt,
        completedAt: mockStatus.completedAt
      });
    });

    it('should return 404 if sync status not found', async () => {
      mockRequest.params = { syncId: 'non-existent-id' };

      (SyncStatusModel.findById as jest.Mock).mockResolvedValue(null);

      await controller.getSyncStatus(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Sync status not found'
      });
    });

    it('should handle database errors', async () => {
      mockRequest.params = { syncId: 'test-id' };

      const error = new Error('DB Error');
      (SyncStatusModel.findById as jest.Mock).mockRejectedValue(error);

      await controller.getSyncStatus(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: error.message
      });
    });
  });
}); 