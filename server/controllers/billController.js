import Bill from '../models/Bill.js';

export async function getBills(req, res) {
  const bills = await Bill.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(bills);
}

export async function addBill(req, res) {
  const { name, amount, dueDate, repeat } = req.body;

  if (!name || !amount || !dueDate) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }

  const bill = await Bill.create({
    userId: req.userId,
    name,
    amount,
    dueDate,
    repeat,
    status: 'unpaid',
  });

  res.status(201).json(bill);
}

export async function updateBillStatus(req, res) {
  const bill = await Bill.findById(req.params.id);

  if (!bill) {
    return res.status(404).json({ message: 'Bill not found' });
  }

  if (bill.userId.toString() !== req.userId) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  bill.status = req.body.status;
  await bill.save();

  res.json(bill);
}

export async function deleteBill(req, res) {
  const bill = await Bill.findById(req.params.id);

  if (!bill) {
    return res.status(404).json({ message: 'Bill not found' });
  }

  if (bill.userId.toString() !== req.userId) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  await bill.deleteOne();
  res.json({ message: 'Bill deleted' });
}