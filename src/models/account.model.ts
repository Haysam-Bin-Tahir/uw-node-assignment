import mongoose, { Schema, Document } from 'mongoose';
import { Account } from '../interfaces/yapily.interface';

export interface IAccountDocument extends Omit<Account, 'id'>, Document {
  userId: mongoose.Types.ObjectId;
}

const accountSchema = new Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountType: { type: String, required: true },
  accountNumber: { type: String, required: true },
  balance: { type: mongoose.Types.Decimal128, required: true },
  currency: { type: String, required: true },
  institutionId: { type: String, required: true }
}, { timestamps: true });

accountSchema.index({ userId: 1, id: 1 }, { unique: true });

export default mongoose.model<IAccountDocument>('Account', accountSchema); 