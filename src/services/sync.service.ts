import { Transaction } from '../interfaces/yapily.interface';
import TransactionModel from '../models/transaction.model';
import SyncStatusModel from '../models/sync-status.model';
import YapilyService from './yapily.service';
import mongoose from 'mongoose';

export const syncTransactions = async (
  accountId: string, 
  consentToken: string, 
  syncId: string,
  userId: mongoose.Types.ObjectId
) => {
  const BATCH_SIZE = 100;
  const syncStatus = await SyncStatusModel.findById(syncId);
  
  if (!syncStatus) {
    console.error(`Sync status not found for ID: ${syncId}`);
    return;
  }

  try {
    syncStatus.status = 'processing';
    await syncStatus.save();

    const response = await YapilyService.getTransactions(accountId, consentToken);
    
    if (response?.data) {
      const transactions = response.data;
      syncStatus.total = transactions.length;
      await syncStatus.save();

      for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
        const chunk = transactions.slice(i, i + BATCH_SIZE);
        const bulkOps = chunk.map((transaction: Transaction) => ({
          updateOne: {
            filter: { id: transaction.id },
            update: { $set: { ...transaction, accountId, userId } },
            upsert: true
          }
        }));

        await TransactionModel.bulkWrite(bulkOps);
        
        syncStatus.progress = Math.min(i + BATCH_SIZE, transactions.length);
        await syncStatus.save();
      }

      syncStatus.status = 'completed';
      syncStatus.completedAt = new Date();
      await syncStatus.save();
    }
  } catch (error) {
    syncStatus.status = 'failed';
    syncStatus.error = error instanceof Error ? error.message : 'Unknown error';
    await syncStatus.save();
  }
}; 