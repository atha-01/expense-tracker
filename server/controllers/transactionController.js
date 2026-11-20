import Transaction from '../models/Transaction.js';

export async function getTransactions(req, res) {
  const transactions = await Transaction.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(transactions);
}

export async function addTransaction(req, res) {
  const { type, amount, category, account, date, note, icon } = req.body;

  if (!type || !amount || !category || !account || !date) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }

  const transaction = await Transaction.create({
    userId: req.userId,
    type,
    amount,
    category,
    account,
    date,
    note,
    icon,
  });

  res.status(201).json(transaction);
}

export async function deleteTransaction(req, res) {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    return res.status(404).json({ message: 'Transaction not found' });
  }

  if (transaction.userId.toString() !== req.userId) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  await transaction.deleteOne();
  res.json({ message: 'Transaction deleted' });
}