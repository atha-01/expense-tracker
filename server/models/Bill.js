import mongoose from 'mongoose';

const billSchema = new mongoose.Schema(
  {
    userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name:    { type: String, required: true },
    amount:  { type: Number, required: true },
    dueDate: { type: String, required: true },
    repeat:  { type: String, enum: ['once', 'monthly', 'yearly'], default: 'monthly' },
    status:  { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
  },
  { timestamps: true }
);

const Bill = mongoose.model('Bill', billSchema);

export default Bill;