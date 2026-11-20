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


export async function updateTransaction(req, res) {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Ensure the user updating it is the owner
    if (transaction.userId.toString() !== req.userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { type, amount, category, account, date, note, icon } = req.body;

    transaction.type = type || transaction.type;
    transaction.amount = amount !== undefined ? Number(amount) : transaction.amount;
    transaction.category = category || transaction.category;
    transaction.account = account || transaction.account;
    transaction.date = date || transaction.date;
    transaction.note = note !== undefined ? note : transaction.note;
    transaction.icon = icon || transaction.icon;

    const updatedTransaction = await transaction.save();
    res.json(updatedTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ message: 'Failed to update transaction' });
  }
}