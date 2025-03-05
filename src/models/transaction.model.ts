import mongoose, { Schema, Document } from 'mongoose';
import { Transaction } from '../interfaces/yapily.interface';

export interface ITransactionDocument extends Omit<Transaction, 'id'>, Document {}

const transactionSchema = new Schema({
  id: { type: String, required: true, unique: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  amount: { type: mongoose.Types.Decimal128, required: true },
  currency: { type: String, required: true },
  accountId: { type: String, required: true },
  status: { type: String, required: true },
  reference: { type: String }
}, { timestamps: true });

transactionSchema.index({ accountId: 1, date: -1 });

export default mongoose.model<ITransactionDocument>('Transaction', transactionSchema); 