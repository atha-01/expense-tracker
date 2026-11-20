import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema(
  {
    userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name:           { type: String, required: true },
    type:           { type: String, enum: ['cash', 'bank', 'card', 'upi'], required: true },
    openingBalance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Account = mongoose.model('Account', accountSchema);

export default Account;