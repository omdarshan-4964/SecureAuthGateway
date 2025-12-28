/**
 * TRANSACTION MODEL
 * MongoDB schema for transaction persistence
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  merchantId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: 'COMPLETED' | 'FAILED' | 'PENDING';
  customerEmail: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    merchantId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Merchant ID is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive'],
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['COMPLETED', 'FAILED', 'PENDING'],
        message: 'Status must be COMPLETED, FAILED, or PENDING',
      },
      default: 'COMPLETED',
      uppercase: true,
    },
    customerEmail: {
      type: String,
      required: [true, 'Customer email is required'],
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret) {
        ret.id = ret._id;
        delete (ret as any)._id;
        delete (ret as any).__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Indexes for performance
TransactionSchema.index({ merchantId: 1, createdAt: -1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ createdAt: -1 });

const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
