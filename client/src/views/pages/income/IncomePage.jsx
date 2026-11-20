import { useState } from 'react';
import { useExpense } from '../../../controllers/ExpenseContext';
import { INCOME_CATEGORIES, ACCOUNT_TYPES } from '../../../models/constants';
import styles from './IncomePage.module.css';

export default function IncomePage() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useExpense();

  // Form field values
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('salary');
  const [account, setAccount] = useState('bank');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  // Editing state: holds the id of the transaction currently being edited, or null
  const [editingId, setEditingId] = useState(null);

  // Filter only income transactions
  let incomeList = [];
  for (let i = 0; i < transactions.length; i++) {
    if (transactions[i].type === 'income') {
      incomeList.push(transactions[i]);
    }
  }

  // Calculate total income
  let totalIncome = 0;
  for (let i = 0; i < incomeList.length; i++) {
    totalIncome = totalIncome + incomeList[i].amount;
  }

  function getCategoryIcon(categoryId) {
    for (let i = 0; i < INCOME_CATEGORIES.length; i++) {
      if (INCOME_CATEGORIES[i].id === categoryId) {
        return INCOME_CATEGORIES[i].icon;
      }
    }
    return '💰';
  }

  function getCategoryLabel(categoryId) {
    for (let i = 0; i < INCOME_CATEGORIES.length; i++) {
      if (INCOME_CATEGORIES[i].id === categoryId) {
        return INCOME_CATEGORIES[i].label;
      }
    }
    return categoryId;
  }

  // Start editing: fill the form with this item's data
  function startEdit(item) {
    setEditingId(item.id);
    setAmount(item.amount);
    setCategory(item.category);
    setAccount(item.account);
    setDate(item.date);
    setNote(item.note || '');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Cancel edit mode and reset the form
  function cancelEdit() {
    setEditingId(null);
    setAmount('');
    setCategory('salary');
    setAccount('bank');
    setDate('');
    setNote('');
    setError('');
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

    const transactionData = {
      type: 'income',
      amount: Number(amount),
      category: category,
      account: account,
      date: date,
      note: note,
      icon: getCategoryIcon(category),
    };

    if (editingId) {
      // Update existing item
      updateTransaction(editingId, transactionData);
      setEditingId(null);
    } else {
      // Add new item
      addTransaction(transactionData);
    }

    // Reset form
    setAmount('');
    setCategory('salary');
    setAccount('bank');
    setDate('');
    setNote('');
  }

  return (
    <div className={styles.page}>

      {/* Total income banner */}
      <div className={styles.banner}>
        <p className={styles.bannerLabel}>Total Income</p>
        <p className={styles.bannerAmount}>₹{totalIncome.toLocaleString()}</p>
      </div>

      {/* Add / Edit Income Form */}
      <div className={styles.card}>
        <div className={styles.formHeader}>
          <h2 className={styles.cardTitle}>
            {editingId ? 'Edit Income' : 'Add Income'}
          </h2>
          {editingId && (
            <button className={styles.cancelBtn} onClick={cancelEdit}>
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Amount (₹)</label>
              <input
                type="number"
                placeholder="e.g. 5000"
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
                {INCOME_CATEGORIES.map(function(cat) {
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
              placeholder="e.g. November salary"
              value={note}
              onChange={function(e) { setNote(e.target.value); }}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitBtn}>
            {editingId ? 'Save Changes' : '+ Add Income'}
          </button>
        </form>
      </div>

      {/* Income List */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>All Income ({incomeList.length})</h2>

        {incomeList.length === 0 && (
          <p className={styles.empty}>No income added yet.</p>
        )}

        {incomeList.map(function(item) {
          return (
            <div key={item.id} className={styles.row2}>
              <div className={styles.itemLeft}>
                <span className={styles.itemIcon}>{item.icon}</span>
                <div>
                  <p className={styles.itemCategory}>{getCategoryLabel(item.category)}</p>
                  <p className={styles.itemMeta}>{item.date} · {item.note || 'No note'}</p>
                </div>
              </div>
              <div className={styles.itemRight}>
                <p className={styles.itemAmount}>+₹{item.amount.toLocaleString()}</p>
                <button
                  className={styles.editBtn}
                  onClick={function() { startEdit(item); }}
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={function() { deleteTransaction(item.id); }}
                  title="Delete"
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