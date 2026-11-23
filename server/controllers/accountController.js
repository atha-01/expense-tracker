import Account from '../models/Account.js';

export async function getAccounts(req, res) {
  const accounts = await Account.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(accounts);
}

export async function addAccount(req, res) {
  const { name, type, openingBalance } = req.body;

  if (!name || !type) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }

  const account = await Account.create({
    userId: req.userId,
    name,
    type,
    openingBalance: openingBalance || 0,
  });

  res.status(201).json(account);
}

export async function deleteAccount(req, res) {
  const account = await Account.findById(req.params.id);

  if (!account) {
    return res.status(404).json({ message: 'Account not found' });
  }

  if (account.userId.toString() !== req.userId) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  await account.deleteOne();
  res.json({ message: 'Account deleted' });
}
export async function updateAccount(req, res) {
  const account = await Account.findById(req.params.id);

  if (!account) {
    return res.status(404).json({ message: 'Account not found' });
  }

  if (account.userId.toString() !== req.userId) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  account.name = req.body.name !== undefined ? req.body.name : account.name;
  account.type = req.body.type !== undefined ? req.body.type : account.type;
  account.openingBalance = req.body.openingBalance !== undefined ? req.body.openingBalance : account.openingBalance;

  const updatedAccount = await account.save();
  res.json(updatedAccount);
}