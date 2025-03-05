import mongoose, { Schema, Document } from 'mongoose';

export interface ISyncStatus extends Document {
  _id: mongoose.Types.ObjectId;
  accountId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  total: number;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}

const syncStatusSchema = new Schema({
  accountId: { type: String, required: true },
  status: { type: String, required: true },
  progress: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  error: String,
  startedAt: { type: Date, default: Date.now },
  completedAt: Date
});

export default mongoose.model<ISyncStatus>('SyncStatus', syncStatusSchema); 