/**
 * Monitor Controller
 * Handles sync status monitoring.
 */
import { Request, Response } from 'express';
import SyncStatusModel from '../models/sync-status.model';

export default class MonitorController {
  async getSyncStatus(req: Request, res: Response) {
    try {
      const { syncId } = req.params;
      
      // Find sync status for specific user
      const status = await SyncStatusModel.findOne({
        _id: syncId,
        userId: req.user!._id
      });
      
      if (!status) {
        return res.status(404).json({ message: 'Sync status not found' });
      }

      res.json({
        status: status.status,
        progress: status.progress,
        total: status.total,
        error: status.error,
        startedAt: status.startedAt,
        completedAt: status.completedAt
      });
    } catch (error) {
      console.error('Failed to get sync status:', error);
      res.status(500).json({ 
        message: 'Failed to fetch sync status',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
} 