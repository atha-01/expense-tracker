/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import { useExpense } from '../../../controllers/ExpenseContext';
import { EXPENSE_CATEGORIES } from '../../../models/constants';
import {
  PlusIcon,
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronDownIcon,
  ArrowsUpDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckIcon,
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
} from '@heroicons/react/24/outline';
import styles from './ExpensesPage.module.css';

const expenseCategoryOptions = [
  { id: 'all',           label: 'All Categories' },
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

export default function ExpensesPage() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useExpense();

  // --------------------------------------------------------------------------
  // Filter & Sort State
  // --------------------------------------------------------------------------
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [dateSortOrder, setDateSortOrder] = useState('desc'); // 'desc' (newest first) | 'asc' (oldest first)
  const categoryFilterRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (categoryFilterRef.current && !categoryFilterRef.current.contains(event.target)) {
        setIsCategoryMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --------------------------------------------------------------------------
  // Modal Form State (Log & Edit)
  // --------------------------------------------------------------------------
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [account, setAccount] = useState('cash');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  // Filter only expenses
  const expenseList = transactions.filter((t) => t && t.type === 'expense');

  // Calculate total expenses
  let totalExpenses = 0;
  for (let i = 0; i < expenseList.length; i++) {
    totalExpenses += Number(expenseList[i].amount) || 0;
  }

  // Filter by category
  let filteredList = expenseList.filter((item) => {
    if (selectedCategory === 'all') return true;
    return (item.category || '').toLowerCase() === selectedCategory.toLowerCase();
  });

  // Sort by date
  filteredList.sort((a, b) => {
    const timeA = new Date(a.date || 0).getTime();
    const timeB = new Date(b.date || 0).getTime();
    return dateSortOrder === 'desc' ? timeB - timeA : timeA - timeB;
  });

  function toggleDateSort() {
    setDateSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  }

  // --------------------------------------------------------------------------
  // Modal Actions
  // --------------------------------------------------------------------------
  function openAddModal() {
    setEditingId(null);
    setAmount('');
    setCategory('food');
    setAccount('cash');
    setDate(new Date().toISOString().split('T')[0]);
    setNote('');
    setError('');
    setShowModal(true);
  }

  function openEditModal(item) {
    setEditingId(item.id || item._id);
    setAmount(item.amount);
    setCategory(item.category || 'food');
    setAccount(item.account || 'cash');
    setDate(item.date || new Date().toISOString().split('T')[0]);
    setNote(item.note || '');
    setError('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!amount || !date) {
      setError('Please provide an amount and a date.');
      return;
    }

    if (Number(amount) <= 0) {
      setError('Amount must be greater than ₹0.');
      return;
    }

    const payload = {
      type: 'expense',
      amount: Number(amount),
      category: category,
      account: account,
      date: date,
      note: note.trim(),
    };

    if (editingId) {
      await updateTransaction(editingId, payload);
    } else {
      await addTransaction(payload);
    }

    setShowModal(false);
  }

  async function handleDelete(id, label) {
    if (window.confirm(`Are you sure you want to delete this expense?`)) {
      await deleteTransaction(id);
    }
  }

  // --------------------------------------------------------------------------
  // Icon Helpers
  // --------------------------------------------------------------------------
  function renderCategoryIcon(catId) {
    const id = (catId || '').toLowerCase();
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

  function renderAccountBadge(accountId) {
    const id = (accountId || '').toLowerCase();
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

  function getCategoryLabel(catId) {
    const found = expenseCategoryOptions.find((opt) => opt.id === catId);
    return found ? found.label : (catId ? catId.charAt(0).toUpperCase() + catId.slice(1) : 'Expense');
  }

  return (
    <div className={styles.page}>

      {/* Modern Header Row: Title, Quick Stats, & Log Expense Pill Button */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>Expenses</h1>
          <p className={styles.pageSub}>
            Total: <strong>₹{totalExpenses.toLocaleString()}</strong> across {expenseList.length} expenses
          </p>
        </div>

        <button type="button" className={styles.logExpenseBtn} onClick={openAddModal}>
          <PlusIcon className={styles.plusSvg} />
          <span>Log Expense</span>
        </button>
      </div>

      {/* Main Expenses Table Card */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                {/* Column 1: Category Filter Dropdown */}
                <th className={styles.thCategory}>
                  <div className={styles.filterWrapper} ref={categoryFilterRef}>
                    <button
                      type="button"
                      className={styles.filterTrigger}
                      onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                    >
                      <span>
                        {selectedCategory === 'all'
                          ? 'All Categories'
                          : getCategoryLabel(selectedCategory)}
                      </span>
                      <ChevronDownIcon
                        className={`${styles.chevron} ${isCategoryMenuOpen ? styles.chevronOpen : ''}`}
                      />
                    </button>

                    {isCategoryMenuOpen && (
                      <div className={styles.filterMenu}>
                        {expenseCategoryOptions.map((opt) => (
                          <div
                            key={opt.id}
                            className={`${styles.filterItem} ${
                              selectedCategory === opt.id ? styles.filterActive : ''
                            }`}
                            onClick={() => {
                              setSelectedCategory(opt.id);
                              setIsCategoryMenuOpen(false);
                            }}
                          >
                            <span>{opt.label}</span>
                            {selectedCategory === opt.id && <CheckIcon className={styles.checkSvg} />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </th>

                {/* Column 2: Account Badge */}
                <th className={styles.thAccount}>Paid Via</th>

                {/* Column 3: Sortable Date Column */}
                <th className={styles.thDate}>
                  <button type="button" className={styles.sortableHeaderBtn} onClick={toggleDateSort}>
                    <span>Date</span>
                    {dateSortOrder === 'desc' ? (
                      <ArrowDownIcon className={styles.sortSvg} title="Newest First" />
                    ) : (
                      <ArrowUpIcon className={styles.sortSvg} title="Oldest First" />
                    )}
                  </button>
                </th>

                {/* Column 4: Amount */}
                <th className={styles.thAmount}>Amount</th>

                {/* Column 5: Edit & Delete Actions */}
                <th className={styles.thActions}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="5" className={styles.emptyTd}>
                    No expenses found {selectedCategory !== 'all' ? `for "${getCategoryLabel(selectedCategory)}"` : ''}.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id || item._id} className={styles.tableRow}>
                    
                    {/* Category & Note */}
                    <td className={styles.tdCategory}>
                      <div className={styles.categoryCell}>
                        {renderCategoryIcon(item.category)}
                        <div>
                          <p className={styles.itemTitle}>{item.note || getCategoryLabel(item.category)}</p>
                          <p className={styles.itemCategorySub}>{getCategoryLabel(item.category)}</p>
                        </div>
                      </div>
                    </td>

                    {/* Paid Via (Account) */}
                    <td className={styles.tdAccount}>
                      {renderAccountBadge(item.account)}
                    </td>

                    {/* Date */}
                    <td className={styles.tdDate}>
                      <span className={styles.dateText}>{item.date || '—'}</span>
                    </td>

                    {/* Amount */}
                    <td className={styles.tdAmount}>
                      <span className={styles.amountText}>
                        -₹{Number(item.amount).toLocaleString()}
                      </span>
                    </td>

                    {/* Actions: Edit & Delete */}
                    <td className={styles.tdActions}>
                      <div className={styles.actionGroup}>
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => openEditModal(item)}
                          title="Edit Expense"
                        >
                          <PencilSquareIcon className={styles.actionSvg} />
                        </button>
                        <button
                          type="button"
                          className={styles.actionBtnDanger}
                          onClick={() => handleDelete(item.id || item._id, item.note)}
                          title="Delete Expense"
                        >
                          <TrashIcon className={styles.actionSvg} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* Translucent Frosted Glass Modal for Add & Edit Expense               */}
      {/* ==================================================================== */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>{editingId ? 'Edit Expense' : 'Log Expense'}</h3>
                <p className={styles.modalSub}>Track where your money went</p>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setShowModal(false)}
              >
                <XMarkIcon className={styles.closeIcon} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              {/* Amount */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 450"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={styles.formInput}
                  required
                />
              </div>

              {/* Date */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={styles.formInput}
                  required
                />
              </div>

              {/* Category */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={styles.formSelect}
                >
                  {expenseCategoryOptions
                    .filter((opt) => opt.id !== 'all')
                    .map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                </select>
              </div>

              {/* Paid Via Account */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Paid Via (Account)</label>
                <select
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className={styles.formSelect}
                >
                  <option value="cash">Cash in Hand</option>
                  <option value="bank">Bank Account</option>
                  <option value="card">Credit Card</option>
                  <option value="upi">UPI / Wallet</option>
                </select>
              </div>

              {/* Note */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Groceries at supermarket"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className={styles.formInput}
                />
              </div>

              {error && <p className={styles.formError}>{error}</p>}

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn}>
                  {editingId ? 'Save Changes' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}