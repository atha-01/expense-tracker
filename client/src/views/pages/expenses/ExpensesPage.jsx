/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useExpense } from '../../../controllers/ExpenseContext';
import { EXPENSE_CATEGORIES } from '../../../models/constants';
import IconSelect from '../../components/common/IconSelect';
import {
  CakeIcon,
  TruckIcon,
  HomeIcon,
  BoltIcon,
  HeartIcon,
  ShoppingCartIcon,
  FilmIcon,
  TagIcon,
  AcademicCapIcon,
  ArrowPathIcon,
  ArrowTrendingDownIcon,
  BuildingLibraryIcon,
  BanknotesIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import styles from './ExpensesPage.module.css';

// Category options paired with Heroicons
const expenseCategoryOptions = [
  { id: 'food',          label: 'Food & Dining',    Icon: CakeIcon },
  { id: 'transport',     label: 'Transport',        Icon: TruckIcon },
  { id: 'rent',          label: 'Rent & Housing',   Icon: HomeIcon },
  { id: 'utilities',     label: 'Utilities',        Icon: BoltIcon },
  { id: 'health',        label: 'Health',           Icon: HeartIcon },
  { id: 'grocery',       label: 'Grocery',          Icon: ShoppingCartIcon },
  { id: 'entertainment', label: 'Entertainment',    Icon: FilmIcon },
  { id: 'clothing',      label: 'Clothing',         Icon: TagIcon },
  { id: 'education',     label: 'Education',        Icon: AcademicCapIcon },
  { id: 'subscriptions', label: 'Subscriptions',    Icon: ArrowPathIcon },
  { id: 'other',         label: 'Other',            Icon: ArrowTrendingDownIcon },
];

// Account options paired with Heroicons
const accountOptions = [
  { id: 'cash', label: 'Cash',         Icon: BanknotesIcon },
  { id: 'bank', label: 'Bank Account', Icon: BuildingLibraryIcon },
  { id: 'card', label: 'Credit Card',  Icon: CreditCardIcon },
  { id: 'upi',  label: 'UPI / Wallet', Icon: DevicePhoneMobileIcon },
];

export default function ExpensesPage() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useExpense();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [account, setAccount] = useState('cash');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState(null);

  // Filter only expense transactions
  let expenseList = [];
  for (let i = 0; i < transactions.length; i++) {
    if (transactions[i].type === 'expense') {
      expenseList.push(transactions[i]);
    }
  }

  // Calculate total expenses
  let totalExpenses = 0;
  for (let i = 0; i < expenseList.length; i++) {
    totalExpenses = totalExpenses + (Number(expenseList[i].amount) || 0);
  }

  // Returns the category Heroicon inside a red badge
  function renderCategoryIcon(catId) {
    const id = catId ? catId.toLowerCase() : '';
    let IconComp = ArrowTrendingDownIcon;

    if (id === 'food') IconComp = CakeIcon;
    else if (id === 'transport') IconComp = TruckIcon;
    else if (id === 'rent') IconComp = HomeIcon;
    else if (id === 'utilities') IconComp = BoltIcon;
    else if (id === 'health') IconComp = HeartIcon;
    else if (id === 'grocery') IconComp = ShoppingCartIcon;
    else if (id === 'entertainment') IconComp = FilmIcon;
    else if (id === 'clothing') IconComp = TagIcon;
    else if (id === 'education') IconComp = AcademicCapIcon;
    else if (id === 'subscriptions') IconComp = ArrowPathIcon;

    return (
      <div className={styles.categoryBadge}>
        <IconComp className={styles.badgeSvg} />
      </div>
    );
  }

  // Returns the account pill badge
  function renderAccountBadge(accountId) {
    const id = accountId ? accountId.toLowerCase() : '';
    let IconComp = BanknotesIcon;
    let label = 'Cash';

    if (id === 'bank') {
      IconComp = BuildingLibraryIcon;
      label = 'Bank';
    } else if (id === 'card') {
      IconComp = CreditCardIcon;
      label = 'Card';
    } else if (id === 'upi') {
      IconComp = DevicePhoneMobileIcon;
      label = 'UPI';
    }

    return (
      <span className={styles.accountPill}>
        <IconComp className={styles.pillSvg} />
        {label}
      </span>
    );
  }

  function getCategoryLabel(categoryId) {
    for (let i = 0; i < EXPENSE_CATEGORIES.length; i++) {
      if (EXPENSE_CATEGORIES[i].id === categoryId) {
        return EXPENSE_CATEGORIES[i].label;
      }
    }
    return categoryId || 'Expense';
  }

  function startEdit(item) {
    setEditingId(item.id);
    setAmount(item.amount);
    setCategory(item.category);
    setAccount(item.account || 'cash');
    setDate(item.date);
    setNote(item.note || '');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setAmount('');
    setCategory('food');
    setAccount('cash');
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
      type: 'expense',
      amount: Number(amount),
      category: category,
      account: account,
      date: date,
      note: note,
    };

    if (editingId) {
      updateTransaction(editingId, transactionData);
      setEditingId(null);
    } else {
      addTransaction(transactionData);
    }

    setAmount('');
    setCategory('food');
    setAccount('cash');
    setDate('');
    setNote('');
  }

  return (
    <div className={styles.page}>

      {/* Banner */}
      <div className={styles.banner}>
        <div className={styles.bannerHeader}>
          <p className={styles.bannerLabel}>Total Expenses</p>
          <ArrowTrendingDownIcon className={styles.bannerIcon} />
        </div>
        <p className={styles.bannerAmount}>₹{totalExpenses.toLocaleString()}</p>
      </div>

      {/* Add / Edit Form */}
      <div className={styles.card}>
        <div className={styles.formHeader}>
          <h2 className={styles.cardTitle}>
            {editingId ? 'Edit Expense' : 'Add Expense'}
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

          {/* Custom Heroicon Dropdowns */}
          <div className={styles.row}>
            <IconSelect
              label="Category"
              options={expenseCategoryOptions}
              value={category}
              onChange={setCategory}
            />

            <IconSelect
              label="Account"
              options={accountOptions}
              value={account}
              onChange={setAccount}
            />
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
            {editingId ? 'Save Changes' : '+ Add Expense'}
          </button>
        </form>
      </div>

      {/* Expense History List */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>All Expenses ({expenseList.length})</h2>

        {expenseList.length === 0 && (
          <p className={styles.empty}>No expenses added yet.</p>
        )}

        {expenseList.map(function(item) {
          return (
            <div key={item.id} className={styles.listRow}>
              <div className={styles.itemLeft}>
                {renderCategoryIcon(item.category)}
                <div>
                  <div className={styles.titleRow}>
                    <p className={styles.itemCategory}>{getCategoryLabel(item.category)}</p>
                    {renderAccountBadge(item.account)}
                  </div>
                  <p className={styles.itemMeta}>
                    {item.date} {item.note && `· ${item.note}`}
                  </p>
                </div>
              </div>

              <div className={styles.itemRight}>
                <p className={styles.itemAmount}>-₹{Number(item.amount).toLocaleString()}</p>
                <button
                  className={styles.actionBtn}
                  onClick={function() { startEdit(item); }}
                  title="Edit"
                >
                  <PencilSquareIcon className={styles.actionSvg} />
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.deleteHover}`}
                  onClick={function() { deleteTransaction(item.id); }}
                  title="Delete"
                >
                  <TrashIcon className={styles.actionSvg} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}