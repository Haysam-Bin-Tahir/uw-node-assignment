import { Request, Response } from 'express';
import SyncStatusModel from '../models/sync-status.model';

/**
 * @swagger
 * /api/monitor/sync/{syncId}:
 *   get:
 *     summary: Get sync status for a transaction sync operation
 *     tags: [Monitor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: syncId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sync status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SyncStatus'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Sync status not found
 *       500:
 *         description: Server error
 */
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