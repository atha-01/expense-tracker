import { useState } from 'react';
import { useExpense } from '../../../controllers/ExpenseContext';
import styles from './BillsPage.module.css';

export default function BillsPage() {
  const { bills, addBill, deleteBill, updateBillStatus } = useExpense();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [repeat, setRepeat] = useState('monthly');
  const [error, setError] = useState('');

  // Work out today's date in YYYY-MM-DD format for comparison
  const todayDate = new Date();
  const todayString = todayDate.toISOString().split('T')[0];

  // For each bill, figure out the real display status
  // If the bill is unpaid AND the due date has already passed, show it as overdue
  function getDisplayStatus(bill) {
    if (bill.status === 'paid') {
      return 'paid';
    }
    if (bill.dueDate < todayString) {
      return 'overdue';
    }
    return 'unpaid';
  }

  // Count bills by status for the summary at the top
  let paidCount = 0;
  let unpaidCount = 0;
  let overdueCount = 0;

  for (let i = 0; i < bills.length; i++) {
    const displayStatus = getDisplayStatus(bills[i]);
    if (displayStatus === 'paid') {
      paidCount = paidCount + 1;
    } else if (displayStatus === 'overdue') {
      overdueCount = overdueCount + 1;
    } else {
      unpaidCount = unpaidCount + 1;
    }
  }

  // Total amount of unpaid + overdue bills
  let amountDue = 0;
  for (let i = 0; i < bills.length; i++) {
    const displayStatus = getDisplayStatus(bills[i]);
    if (displayStatus !== 'paid') {
      amountDue = amountDue + bills[i].amount;
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!name || !amount || !dueDate) {
      setError('Please fill in name, amount and due date.');
      return;
    }

    if (Number(amount) <= 0) {
      setError('Amount must be greater than 0.');
      return;
    }

    const newBill = {
      id: String(Date.now()),
      name: name,
      amount: Number(amount),
      dueDate: dueDate,
      repeat: repeat,
      status: 'unpaid',
    };

    addBill(newBill);

    setName('');
    setAmount('');
    setDueDate('');
    setRepeat('monthly');
  }

  // Toggle between paid and unpaid when user clicks the button
  function handleTogglePaid(bill) {
    if (bill.status === 'paid') {
      updateBillStatus(bill.id, 'unpaid');
    } else {
      updateBillStatus(bill.id, 'paid');
    }
  }

  // Return the right CSS class for a status badge
  function getStatusClass(status) {
    if (status === 'paid') {
      return styles.badgePaid;
    }
    if (status === 'overdue') {
      return styles.badgeOverdue;
    }
    return styles.badgeUnpaid;
  }

  // Return the label text for a status
  function getStatusLabel(status) {
    if (status === 'paid') {
      return '✅ Paid';
    }
    if (status === 'overdue') {
      return '🔴 Overdue';
    }
    return '⏳ Unpaid';
  }

  return (
    <div className={styles.page}>

      {/* Summary row at top */}
      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>Amount Due</p>
          <p className={styles.summaryAmount}>₹{amountDue.toLocaleString()}</p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>Paid</p>
          <p className={`${styles.summaryCount} ${styles.green}`}>{paidCount}</p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>Unpaid</p>
          <p className={`${styles.summaryCount} ${styles.amber}`}>{unpaidCount}</p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>Overdue</p>
          <p className={`${styles.summaryCount} ${styles.red}`}>{overdueCount}</p>
        </div>
      </div>

      {/* Add Bill Form */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Add Bill</h2>

        <form onSubmit={handleSubmit} className={styles.form}>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Bill Name</label>
              <input
                type="text"
                placeholder="e.g. Netflix, Electricity"
                value={name}
                onChange={function(e) { setName(e.target.value); }}
              />
            </div>

            <div className={styles.field}>
              <label>Amount (₹)</label>
              <input
                type="number"
                placeholder="e.g. 199"
                value={amount}
                onChange={function(e) { setAmount(e.target.value); }}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={function(e) { setDueDate(e.target.value); }}
              />
            </div>

            <div className={styles.field}>
              <label>Repeats</label>
              <select
                value={repeat}
                onChange={function(e) { setRepeat(e.target.value); }}
              >
                <option value="once">One Time</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitBtn}>
            + Add Bill
          </button>
        </form>
      </div>

      {/* Bills List */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>All Bills ({bills.length})</h2>

        {bills.length === 0 && (
          <p className={styles.empty}>No bills added yet.</p>
        )}

        {bills.map(function(bill) {
          const displayStatus = getDisplayStatus(bill);
          const statusClass = getStatusClass(displayStatus);
          const statusLabel = getStatusLabel(displayStatus);
          const toggleLabel = bill.status === 'paid' ? 'Mark Unpaid' : 'Mark Paid';

          return (
            <div key={bill.id} className={styles.billRow}>

              <div className={styles.billLeft}>
                <div>
                  <p className={styles.billName}>{bill.name}</p>
                  <p className={styles.billMeta}>Due: {bill.dueDate} · {bill.repeat}</p>
                </div>
              </div>

              <div className={styles.billRight}>
                <span className={`${styles.badge} ${statusClass}`}>
                  {statusLabel}
                </span>
                <p className={styles.billAmount}>₹{bill.amount.toLocaleString()}</p>
                <button
                  className={styles.toggleBtn}
                  onClick={function() { handleTogglePaid(bill); }}
                >
                  {toggleLabel}
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={function() { deleteBill(bill.id); }}
                >
                  🗑
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}