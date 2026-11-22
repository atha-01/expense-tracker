/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useExpense } from '../../../controllers/ExpenseContext';
import { INCOME_CATEGORIES, ACCOUNT_TYPES } from '../../../models/constants';
import IconSelect from '../../components/common/IconSelect';  
import {
  BriefcaseIcon,
  ComputerDesktopIcon,
  BuildingOffice2Icon,
  ChartBarSquareIcon,
  GiftIcon,
  ArrowTrendingUpIcon,
  BuildingLibraryIcon,
  BanknotesIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import styles from './IncomePage.module.css';

const incomeCategoryOptions = [
  { id: 'salary',     label: 'Salary',     Icon: BriefcaseIcon },
  { id: 'freelance',  label: 'Freelance',  Icon: ComputerDesktopIcon },
  { id: 'business',   label: 'Business',   Icon: BuildingOffice2Icon },
  { id: 'investment', label: 'Investment', Icon: ChartBarSquareIcon },
  { id: 'gift',       label: 'Gift',       Icon: GiftIcon },
  { id: 'other',      label: 'Other',      Icon: ArrowTrendingUpIcon },
];

const accountOptions = [
  { id: 'bank', label: 'Bank Account', Icon: BuildingLibraryIcon },
  { id: 'cash', label: 'Cash',         Icon: BanknotesIcon },
  { id: 'card', label: 'Credit Card',  Icon: CreditCardIcon },
  { id: 'upi',  label: 'UPI / Wallet', Icon: DevicePhoneMobileIcon },
];

export default function IncomePage() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useExpense();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('salary');
  const [account, setAccount] = useState('bank');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

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
    totalIncome = totalIncome + (Number(incomeList[i].amount) || 0);
  }

  // Returns the right Heroicon for a category
  function renderCategoryIcon(catId) {
    const id = catId ? catId.toLowerCase() : '';
    let IconComp = ArrowTrendingUpIcon;

    if (id === 'salary') IconComp = BriefcaseIcon;
    else if (id === 'freelance') IconComp = ComputerDesktopIcon;
    else if (id === 'business') IconComp = BuildingOffice2Icon;
    else if (id === 'investment') IconComp = ChartBarSquareIcon;
    else if (id === 'gift') IconComp = GiftIcon;

    return (
      <div className={styles.categoryBadge}>
        <IconComp className={styles.badgeSvg} />
      </div>
    );
  }

  // Returns the right Heroicon and label for an account
  function renderAccountBadge(accountId) {
    const id = accountId ? accountId.toLowerCase() : '';
    let IconComp = BuildingLibraryIcon;
    let label = 'Bank';

    if (id === 'cash') {
      IconComp = BanknotesIcon;
      label = 'Cash';
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
    for (let i = 0; i < INCOME_CATEGORIES.length; i++) {
      if (INCOME_CATEGORIES[i].id === categoryId) {
        return INCOME_CATEGORIES[i].label;
      }
    }
    return categoryId || 'Income';
  }

  function startEdit(item) {
    setEditingId(item.id);
    setAmount(item.amount);
    setCategory(item.category);
    setAccount(item.account || 'bank');
    setDate(item.date);
    setNote(item.note || '');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

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
    };

    if (editingId) {
      updateTransaction(editingId, transactionData);
      setEditingId(null);
    } else {
      addTransaction(transactionData);
    }

    setAmount('');
    setCategory('salary');
    setAccount('bank');
    setDate('');
    setNote('');
  }

  return (
    <div className={styles.page}>

      {/* Banner */}
      <div className={styles.banner}>
        <div className={styles.bannerHeader}>
          <p className={styles.bannerLabel}>Total Income</p>
          <ArrowTrendingUpIcon className={styles.bannerIcon} />
        </div>
        <p className={styles.bannerAmount}>₹{totalIncome.toLocaleString()}</p>
      </div>

      {/* Add / Edit Form */}
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
                <IconSelect
                  label="Category"
                  options={incomeCategoryOptions}
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

      {/* Income History List */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Income History ({incomeList.length})</h2>

        {incomeList.length === 0 && (
          <p className={styles.empty}>No income recorded yet.</p>
        )}

        {incomeList.map(function(item) {
          return (
            <div key={item.id} className={styles.row2}>
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
                <p className={styles.itemAmount}>+₹{Number(item.amount).toLocaleString()}</p>
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