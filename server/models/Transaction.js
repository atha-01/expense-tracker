import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type:     { type: String, enum: ['income', 'expense'], required: true },
    amount:   { type: Number, required: true },
    category: { type: String, required: true },
    account:  { type: String, required: true },
    date:     { type: String, required: true },
    note:     { type: String, default: '' },
    icon:     { type: String, default: '💸' },
  },
  { timestamps: true }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;