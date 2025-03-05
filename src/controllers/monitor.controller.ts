import { Request, Response } from 'express';
import SyncStatusModel from '../models/sync-status.model';

export default class MonitorController {
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