import Budget from '../models/Budget.js';

export async function getBudget(req, res) {
  const budget = await Budget.findOne({ userId: req.userId });

  if (!budget) {
    return res.json({ monthlyLimit: 0 });
  }

  res.json(budget);
}

export async function saveBudget(req, res) {
  const { monthlyLimit } = req.body;

  if (!monthlyLimit || monthlyLimit <= 0) {
    return res.status(400).json({ message: 'Please enter a valid budget amount' });
  }

  const existing = await Budget.findOne({ userId: req.userId });

  if (existing) {
    existing.monthlyLimit = monthlyLimit;
    await existing.save();
    return res.json(existing);
  }

  const budget = await Budget.create({
    userId: req.userId,
    monthlyLimit,
  });

  res.status(201).json(budget);
}