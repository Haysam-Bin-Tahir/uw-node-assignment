import mongoose, { Schema, Document } from 'mongoose';

export interface ISyncStatus extends Document {
  _id: mongoose.Types.ObjectId;
  accountId: string;
  userId: mongoose.Types.ObjectId;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  total: number;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}

const syncStatusSchema = new Schema({
  accountId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, required: true },
  progress: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  error: String,
  startedAt: { type: Date, default: Date.now },
  completedAt: Date
});

syncStatusSchema.index({ userId: 1, accountId: 1 });

export default mongoose.model<ISyncStatus>('SyncStatus', syncStatusSchema); 