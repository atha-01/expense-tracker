import { useState } from 'react';
import { useExpense } from '../../../controllers/ExpenseContext';
import { EXPENSE_CATEGORIES, ACCOUNT_TYPES } from '../../../models/constants';
import styles from './ExpensesPage.module.css';

export default function ExpensesPage() {
  const { transactions, addTransaction, deleteTransaction } = useExpense();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [account, setAccount] = useState('cash');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  // Filter only expense transactions from the full list
  let expenseList = [];
  for (let i = 0; i < transactions.length; i++) {
    if (transactions[i].type === 'expense') {
      expenseList.push(transactions[i]);
    }
  }

  // Calculate total expenses
  let totalExpenses = 0;
  for (let i = 0; i < expenseList.length; i++) {
    totalExpenses = totalExpenses + expenseList[i].amount;
  }

  function getCategoryIcon(categoryId) {
    for (let i = 0; i < EXPENSE_CATEGORIES.length; i++) {
      if (EXPENSE_CATEGORIES[i].id === categoryId) {
        return EXPENSE_CATEGORIES[i].icon;
      }
    }
    return '💸';
  }

  function getCategoryLabel(categoryId) {
    for (let i = 0; i < EXPENSE_CATEGORIES.length; i++) {
      if (EXPENSE_CATEGORIES[i].id === categoryId) {
        return EXPENSE_CATEGORIES[i].label;
      }
    }
    return categoryId;
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!amount || !date) {
      setError('Please enter an amount and date.');
      return;
    }

    if (Number(amount) <= 0) {
      setError('Amount must be greater than 0.');
      return;
    }

    const newTransaction = {
      id: String(Date.now()),
      type: 'expense',
      amount: Number(amount),
      category: category,
      account: account,
      date: date,
      note: note,
      icon: getCategoryIcon(category),
    };

    addTransaction(newTransaction);

    setAmount('');
    setCategory('food');
    setAccount('cash');
    setDate('');
    setNote('');
  }

  return (
    <div className={styles.page}>

      {/* Total expenses banner */}
      <div className={styles.banner}>
        <p className={styles.bannerLabel}>Total Expenses</p>
        <p className={styles.bannerAmount}>₹{totalExpenses.toLocaleString()}</p>
      </div>

      {/* Add Expense Form */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Add Expense</h2>

        <form onSubmit={handleSubmit} className={styles.form}>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Amount (₹)</label>
              <input
                type="number"
                placeholder="e.g. 150"
                value={amount}
                onChange={function(e) { setAmount(e.target.value); }}
              />
            </div>

            <div className={styles.field}>
              <label>Date</label>
              <input
                type="date"
                value={date}
                onChange={function(e) { setDate(e.target.value); }}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Category</label>
              <select
                value={category}
                onChange={function(e) { setCategory(e.target.value); }}
              >
                {EXPENSE_CATEGORIES.map(function(cat) {
                  return (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.label}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className={styles.field}>
              <label>Account</label>
              <select
                value={account}
                onChange={function(e) { setAccount(e.target.value); }}
              >
                {ACCOUNT_TYPES.map(function(acc) {
                  return (
                    <option key={acc.id} value={acc.id}>
                      {acc.icon} {acc.label}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label>Note (optional)</label>
            <input
              type="text"
              placeholder="e.g. Lunch at cafe"
              value={note}
              onChange={function(e) { setNote(e.target.value); }}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitBtn}>
            + Add Expense
          </button>
        </form>
      </div>

      {/* Expense List */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>All Expenses ({expenseList.length})</h2>

        {expenseList.length === 0 && (
          <p className={styles.empty}>No expenses added yet.</p>
        )}

        {expenseList.map(function(item) {
          return (
            <div key={item.id} className={styles.listRow}>
              <div className={styles.itemLeft}>
                <span className={styles.itemIcon}>{item.icon}</span>
                <div>
                  <p className={styles.itemCategory}>{getCategoryLabel(item.category)}</p>
                  <p className={styles.itemMeta}>{item.date} · {item.note}</p>
                </div>
              </div>
              <div className={styles.itemRight}>
                <p className={styles.itemAmount}>-₹{item.amount.toLocaleString()}</p>
                <button
                  className={styles.deleteBtn}
                  onClick={function() { deleteTransaction(item.id); }}
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