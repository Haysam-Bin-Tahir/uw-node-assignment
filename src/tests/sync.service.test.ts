import { syncTransactions } from '../services/sync.service';
import YapilyService from '../services/yapily.service';
import TransactionModel from '../models/transaction.model';
import SyncStatusModel from '../models/sync-status.model';
import mongoose from 'mongoose';

jest.mock('../services/yapily.service');
jest.mock('../models/transaction.model');
jest.mock('../models/sync-status.model');

interface MockSyncStatus {
  status: string;
  progress: number;
  total: number;
  error: string | null;
  save: jest.Mock;
}

describe('SyncService', () => {
  const mockAccountId = 'test-account';
  const mockConsentToken = 'test-token';
  const mockSyncId = new mongoose.Types.ObjectId().toString();
  const mockUserId = new mongoose.Types.ObjectId();

  let mockSyncStatus: MockSyncStatus;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock sync status with all required properties
    mockSyncStatus = {
      status: 'pending',
      progress: 0,
      total: 0,
      error: null,
      save: jest.fn().mockImplementation(function(this: MockSyncStatus) {
        return Promise.resolve(this);
      })
    };
    (SyncStatusModel.findById as jest.Mock).mockResolvedValue(mockSyncStatus);
  });

  it('should sync transactions successfully', async () => {
    const mockTransactions = [
      { id: 'tx1', amount: 100 },
      { id: 'tx2', amount: 200 }
    ];

    (YapilyService.getTransactions as jest.Mock).mockResolvedValue({
      data: mockTransactions
    });

    await syncTransactions(mockAccountId, mockConsentToken, mockSyncId, mockUserId);

    // Verify sync status updates
    expect(mockSyncStatus.status).toBe('completed');
    expect(mockSyncStatus.save).toHaveBeenCalled();

    // Verify transactions were saved
    expect(TransactionModel.bulkWrite).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          updateOne: {
            filter: { id: 'tx1' },
            update: expect.objectContaining({
              $set: expect.objectContaining({
                accountId: mockAccountId,
                userId: mockUserId
              })
            }),
            upsert: true
          }
        })
      ])
    );
  });

  it('should handle empty transaction response', async () => {
    (YapilyService.getTransactions as jest.Mock).mockResolvedValue({
      data: []
    });

    await syncTransactions(mockAccountId, mockConsentToken, mockSyncId, mockUserId);

    expect(mockSyncStatus.status).toBe('completed');
    expect(mockSyncStatus.save).toHaveBeenCalled();
  });

  it('should handle missing transaction data', async () => {
    (YapilyService.getTransactions as jest.Mock).mockResolvedValue({});

    // Mock save to track status changes
    mockSyncStatus.save.mockImplementation(function(this: MockSyncStatus) {
      if (this.status === 'processing') {
        this.status = 'failed';
        this.error = 'No transaction data received';
      }
      return Promise.resolve(this);
    });

    await syncTransactions(mockAccountId, mockConsentToken, mockSyncId, mockUserId);

    expect(mockSyncStatus.status).toBe('failed');
    expect(mockSyncStatus.error).toBe('No transaction data received');
    expect(mockSyncStatus.save).toHaveBeenCalled();
  });

  it('should handle API errors', async () => {
    const error = new Error('API Error');
    (YapilyService.getTransactions as jest.Mock).mockRejectedValue(error);

    await syncTransactions(mockAccountId, mockConsentToken, mockSyncId, mockUserId);

    expect(mockSyncStatus.status).toBe('failed');
    expect(mockSyncStatus.error).toBe('API Error');
    expect(mockSyncStatus.save).toHaveBeenCalled();
  });

  it('should handle database errors during sync', async () => {
    const mockTransactions = [{ id: 'tx1', amount: 100 }];
    (YapilyService.getTransactions as jest.Mock).mockResolvedValue({
      data: mockTransactions
    });

    const dbError = new Error('Database Error');
    (TransactionModel.bulkWrite as jest.Mock).mockRejectedValue(dbError);

    await syncTransactions(mockAccountId, mockConsentToken, mockSyncId, mockUserId);

    expect(mockSyncStatus.status).toBe('failed');
    expect(mockSyncStatus.error).toBe('Database Error');
    expect(mockSyncStatus.save).toHaveBeenCalled();
  });
}); 