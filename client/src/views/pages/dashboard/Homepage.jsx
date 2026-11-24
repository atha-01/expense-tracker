/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import { useExpense } from '../../../controllers/ExpenseContext';
import { getBudgetHealth } from '../../../models/constants';
import {
  WalletIcon,
  BuildingLibraryIcon,
  BanknotesIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  PlusIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  PencilSquareIcon,
  TrashIcon,
  ShoppingCartIcon,
  HomeIcon,
  BoltIcon,
  HeartIcon,
  FilmIcon,
  TagIcon,
  AcademicCapIcon,
  ArrowPathIcon,
  BriefcaseIcon,
  TruckIcon,
  CakeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import styles from './HomePage.module.css';

// Distinct modern fintech colors for the spending pie chart
const CATEGORY_COLORS = {
  food: '#f59e0b',
  transport: '#8b5cf6',
  rent: '#3b82f6',
  utilities: '#06b6d4',
  health: '#ef4444',
  grocery: '#10b981',
  entertainment: '#ec4899',
  clothing: '#f97316',
  education: '#6366f1',
  subscriptions: '#14b8a6',
  other: '#64748b',
};

export default function HomePage() {
  const {
    transactions,
    accounts,
    addAccount,
    editAccount,
    deleteAccount,
    addTransaction,
    deleteTransaction,
    monthlyBudget,
    saveBudget,
  } = useExpense();

  // --------------------------------------------------------------------------
  // Month Switcher for Budget & Spending Pie Chart
  // --------------------------------------------------------------------------
  const [activeDate, setActiveDate] = useState(new Date());
  const activeYear = activeDate.getFullYear();
  const activeMonthNumber = activeDate.getMonth() + 1;
  const currentMonthString = `${activeYear}-${String(activeMonthNumber).padStart(2, '0')}`;
  const monthName = activeDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  function goToPreviousMonth() {
    setActiveDate(new Date(activeYear, activeDate.getMonth() - 1, 1));
  }

  function goToNextMonth() {
    setActiveDate(new Date(activeYear, activeDate.getMonth() + 1, 1));
  }

  // --------------------------------------------------------------------------
  // Transactions Filter
  // --------------------------------------------------------------------------
  const [filterType, setFilterType] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validTransactions = transactions.filter(
    (item) => item && item.amount !== undefined && item.type !== undefined
  );

  // --------------------------------------------------------------------------
  // Accounts Calculations
  // --------------------------------------------------------------------------
  function getAccountBalance(account) {
    let balance = Number(account.openingBalance) || 0;
    for (let i = 0; i < validTransactions.length; i++) {
      const t = validTransactions[i];
      // STRICT MATCHING: Only match by exact name or ID (no generic type bleed)
      if (t.account === account.id || t.account === account.name) {
        if (t.type === 'income') {
          balance += Number(t.amount) || 0;
        } else {
          balance -= Number(t.amount) || 0;
        }
      }
    }
    return Math.max(0, balance);
  }

  let totalNetWorth = 0;
  for (let i = 0; i < accounts.length; i++) {
    totalNetWorth += getAccountBalance(accounts[i]);
  }
  totalNetWorth = Math.max(0, totalNetWorth);

  function renderAccountTypeIcon(type) {
    const t = (type || '').toLowerCase();
    if (t === 'bank') return <BuildingLibraryIcon className={styles.accSvg} />;
    if (t === 'card') return <CreditCardIcon className={styles.accSvg} />;
    if (t === 'upi') return <DevicePhoneMobileIcon className={styles.accSvg} />;
    return <BanknotesIcon className={styles.accSvg} />;
  }

  // --------------------------------------------------------------------------
  // Add Money / Account Dynamic Modal State
  // --------------------------------------------------------------------------
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [accountCategory, setAccountCategory] = useState('bank');
  const [accName, setAccName] = useState('');
  const [bankSubtype, setBankSubtype] = useState('Savings Account');
  const [accBalance, setAccBalance] = useState('');
  const [accDate, setAccDate] = useState(new Date().toISOString().split('T')[0]); // <--- Defaults to today
  const [accNote, setAccNote] = useState('');

  // Auto-fill sensible default name when switching tab
  function handleCategorySwitch(cat) {
    setAccountCategory(cat);
    if (cat === 'bank') setAccName('HDFC Bank');
    else if (cat === 'cash') setAccName('Physical Cash');
    else if (cat === 'upi') setAccName('Google Pay');
    else if (cat === 'card') setAccName('Credit Card');
  }

  function openAddModal() {
    setAccountCategory('bank');
    setAccName('HDFC Bank');
    setBankSubtype('Savings Account');
    setAccBalance('');
    setAccDate(new Date().toISOString().split('T')[0]);
    setAccNote('');
    setShowAddAccountModal(true);
  }

  async function handleCreateAccount(e) {
    e.preventDefault();
    if (!accName.trim() || accBalance === '') return;
    
    let finalName = accName.trim();
    if (accountCategory === 'bank' && bankSubtype) {
      finalName = `${finalName} (${bankSubtype})`;
    }
    
    const amountNum = Number(accBalance) || 0;
    const selectedDate = accDate || new Date().toISOString().split('T')[0];

    // Check if an account with this name ALREADY exists
    const existing = accounts.find(
      (a) => a.name.trim().toLowerCase() === finalName.toLowerCase()
    );

    // 1. Only create a NEW card if it doesn't already exist!
    if (!existing) {
      await addAccount({
        name: finalName,
        type: accountCategory,
        openingBalance: 0,
      });
    }

    // 2. Deposit the money into that account (whether existing or new)
    if (amountNum > 0) {
      await addTransaction({
        type: 'income',
        amount: amountNum,
        category: 'salary',
        account: existing ? existing.name : finalName,
        date: selectedDate,
        note: accNote.trim() || `Deposit to ${finalName}`,
      });
    }

    setShowAddAccountModal(false);
  }

  // --------------------------------------------------------------------------
  // Edit Account Modal State
  // --------------------------------------------------------------------------
  const [editingAccount, setEditingAccount] = useState(null);
  const [editName, setEditName] = useState('');
  const [editBalance, setEditBalance] = useState('');

  // Calculate net transactions specifically belonging to this account
  function getAccountNetTransactions(account) {
    let net = 0;
    for (let i = 0; i < validTransactions.length; i++) {
      const t = validTransactions[i];
      if (t.account === account.id || t.account === account.name) {
        if (t.type === 'income') net += Number(t.amount) || 0;
        else if (t.type === 'expense') net -= Number(t.amount) || 0;
      }
    }
    return net;
  }

  function openEditModal(account) {
    setEditingAccount(account);
    setEditName(account.name);
    // Pre-fill the edit box with the ACTUAL current balance
    setEditBalance(getAccountBalance(account));
  }

  async function handleSaveEditAccount(e) {
    e.preventDefault();
    if (!editingAccount || !editName.trim() || editBalance === '') return;

    const targetBalance = Number(editBalance) || 0;
    const netTxs = getAccountNetTransactions(editingAccount);
    // Setting openingBalance = targetBalance - netTxs guarantees the card shows EXACTLY targetBalance!
    const newOpening = targetBalance - netTxs;

    await editAccount(editingAccount.id, {
      name: editName.trim(),
      type: editingAccount.type,
      openingBalance: newOpening,
    });

    setEditingAccount(null);
  }

  async function handleDeleteTransaction(id, note) {
    if (window.confirm(`Delete transaction "${note || 'Transaction'}"?`)) {
      await deleteTransaction(id);
    }
  }

  async function handleDeleteAccount(id, name) {
    if (window.confirm(`Are you sure you want to remove "${name}" and clean up its recorded transactions?`)) {
      // Clean up any transactions linked to this deleted account
      const linkedTxs = validTransactions.filter((t) => t.account === id || t.account === name);
      for (let i = 0; i < linkedTxs.length; i++) {
        await deleteTransaction(linkedTxs[i].id || linkedTxs[i]._id);
      }
      await deleteAccount(id);
    }
  }

  // --------------------------------------------------------------------------
  // Edit Budget Modal State
  // --------------------------------------------------------------------------
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');

  async function handleSaveBudget(e) {
    e.preventDefault();
    if (budgetInput === '') return;
    await saveBudget(Number(budgetInput));
    setShowBudgetModal(false);
  }

  // --------------------------------------------------------------------------
  // Monthly Budget & Category Spending for Pie Chart
  // --------------------------------------------------------------------------
  const thisMonthExpenses = validTransactions.filter(
    (t) => t.type === 'expense' && t.date && t.date.startsWith(currentMonthString)
  );

  let totalSpentThisMonth = 0;
  const categoryTotals = {};

  for (let i = 0; i < thisMonthExpenses.length; i++) {
    const t = thisMonthExpenses[i];
    const amount = Number(t.amount) || 0;
    totalSpentThisMonth += amount;
    const cat = (t.category || 'other').toLowerCase();
    categoryTotals[cat] = (categoryTotals[cat] || 0) + amount;
  }

  const categorySlices = [];
  for (let cat in categoryTotals) {
    const amt = categoryTotals[cat];
    const percentage = totalSpentThisMonth > 0 ? (amt / totalSpentThisMonth) * 100 : 0;
    categorySlices.push({
      category: cat,
      amount: amt,
      percentage: percentage,
      color: CATEGORY_COLORS[cat] || CATEGORY_COLORS.other,
    });
  }
  categorySlices.sort((a, b) => b.amount - a.amount);

  const budgetHealth = getBudgetHealth(totalSpentThisMonth, monthlyBudget);

  // SVG Pie Chart Math
  const RADIUS = 65;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  let accumulatedOffset = 0;

  // --------------------------------------------------------------------------
  // Transaction Table Helpers
  // --------------------------------------------------------------------------
  const filteredTransactions = validTransactions.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });
  const displayTransactions = filteredTransactions.slice(0, 8);

  function getTransactionIcon(item) {
    const isIncome = item.type === 'income';
    const cat = (item.category || '').toLowerCase();
    let IconComp = isIncome ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;

    if (cat === 'food') IconComp = CakeIcon;
    else if (cat === 'transport') IconComp = TruckIcon;
    else if (cat === 'rent') IconComp = HomeIcon;
    else if (cat === 'utilities') IconComp = BoltIcon;
    else if (cat === 'health') IconComp = HeartIcon;
    else if (cat === 'grocery') IconComp = ShoppingCartIcon;
    else if (cat === 'entertainment') IconComp = FilmIcon;
    else if (cat === 'clothing') IconComp = TagIcon;
    else if (cat === 'education') IconComp = AcademicCapIcon;
    else if (cat === 'subscriptions') IconComp = ArrowPathIcon;
    else if (cat === 'salary') IconComp = BriefcaseIcon;

    return (
      <div className={`${styles.iconBadge} ${isIncome ? styles.badgeIncome : styles.badgeExpense}`}>
        <IconComp className={styles.txSvg} />
      </div>
    );
  }

  return (
    <div className={styles.page}>

      {/* ==================================================================== */}
      {/* 1. ACCOUNTS & NET WORTH STRIP (PINNED NET WORTH + HORIZONTAL SCROLL)   */}
      {/* ==================================================================== */}
      <section className={styles.accountsSection}>
        <div className={styles.sectionHeaderRow}>
          <div>
            <h2 className={styles.sectionTitle}>Accounts & Balances</h2>
            <p className={styles.sectionSub}>Live consolidated balances across your accounts and wallets</p>
          </div>
          <button
            type="button"
            className={styles.addAccountPillBtn}
            onClick={openAddModal}
          >
            <PlusIcon className={styles.plusIcon} />
            <span>Add Money / Account</span>
          </button>
        </div>

<div className={styles.accountsRowContainer}>
          {/* Pinned Total Net Worth Card (Casts a shadow over sliding cards) */}
          <div className={styles.netWorthCard}>
            <div className={styles.netWorthTop}>
              <span className={styles.netWorthLabel}>Total Net Worth</span>
              <WalletIcon className={styles.netWorthIcon} />
            </div>
            <p className={styles.netWorthValue}>₹{totalNetWorth.toLocaleString()}</p>
            <span className={styles.netWorthAccountsCount}>
              {accounts.length} {accounts.length === 1 ? 'Account' : 'Accounts'} Active
            </span>
          </div>
          {/* Horizontally Scrollable Track with Edge Fade Shadows */}
          <div className={styles.scrollWrapper}>
            {/* Left fade shadow (under the Net Worth card) */}
            <div className={styles.leftFadeOverlay} />
            <div className={styles.accountsScrollTrack}>
              {accounts.length === 0 ? (
                <div className={styles.emptyAccountsPrompt}>
                  <span>No accounts yet. Click <strong>"Add Money / Account"</strong> to get started!</span>
                </div>
              ) : (
                accounts.map((acc) => {
                  const bal = getAccountBalance(acc);
                  return (
                    <div key={acc.id || acc._id} className={styles.accountCard}>
                      <div className={styles.accCardTop}>
                        <div className={styles.accTypeBadge}>
                          {renderAccountTypeIcon(acc.type)}
                        </div>
                        
                        <div className={styles.accActions}>
                          <button
                            type="button"
                            className={styles.accActionBtn}
                            onClick={() => openEditModal(acc)}
                            title="Edit Account"
                          >
                            <PencilSquareIcon className={styles.actionSvg} />
                          </button>
                          <button
                            type="button"
                            className={styles.accActionBtnDanger}
                            onClick={() => handleDeleteAccount(acc.id || acc._id, acc.name)}
                            title="Delete Account"
                          >
                            <TrashIcon className={styles.actionSvg} />
                          </button>
                        </div>
                      </div>
                      <h4 className={styles.accName} title={acc.name}>{acc.name}</h4>
                      <p className={`${styles.accBalance} ${bal < 0 ? styles.negativeBal : ''}`}>
                        ₹{bal.toLocaleString()}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
            {/* Right fade shadow (indicates more scrollable content) */}
            <div className={styles.rightFadeOverlay} />
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 2. TWO-COLUMN SPLIT: BUDGET PIE CHART & RECENT TRANSACTIONS         */}
      {/* ==================================================================== */}
      <div className={styles.twoColumnGrid}>

        {/* LEFT COLUMN: BUDGET HEALTH & SVG PIE CHART */}
        <section className={styles.budgetCard}>
          <div className={styles.cardHeaderWithAction}>
            <div>
              <h3 className={styles.cardHeading}>Monthly Spending & Budget</h3>
              {/* Month Switcher */}
              <div className={styles.monthSwitcher}>
                <button type="button" onClick={goToPreviousMonth} className={styles.arrowBtn}>
                  <ChevronLeftIcon className={styles.arrowSvg} />
                </button>
                <span className={styles.currentMonthText}>{monthName}</span>
                <button type="button" onClick={goToNextMonth} className={styles.arrowBtn}>
                  <ChevronRightIcon className={styles.arrowSvg} />
                </button>
              </div>
            </div>

            <button
              type="button"
              className={styles.editBudgetBtn}
              onClick={() => {
                setBudgetInput(monthlyBudget || '');
                setShowBudgetModal(true);
              }}
              title="Set Monthly Budget"
            >
              <PencilSquareIcon className={styles.editBudgetSvg} />
              <span>Set Cap</span>
            </button>
          </div>

          {/* SVG Donut / Pie Chart Visual */}
          <div className={styles.pieContainer}>
            <div className={styles.svgWrapper}>
              <svg viewBox="0 0 160 160" className={styles.donutSvg}>
                <circle cx="80" cy="80" r={RADIUS} className={styles.donutBgRing} />

                {categorySlices.length === 0 && (
                  <circle cx="80" cy="80" r={RADIUS} className={styles.donutEmptyRing} />
                )}

                {categorySlices.map((slice) => {
                  const strokeDash = (slice.percentage / 100) * CIRCUMFERENCE;
                  const strokeOffset = accumulatedOffset;
                  accumulatedOffset += strokeDash;

                  return (
                    <circle
                      key={slice.category}
                      cx="80"
                      cy="80"
                      r={RADIUS}
                      fill="none"
                      stroke={slice.color}
                      strokeWidth="18"
                      strokeDasharray={`${strokeDash} ${CIRCUMFERENCE - strokeDash}`}
                      strokeDashoffset={-strokeOffset}
                      className={styles.donutSlice}
                    />
                  );
                })}
              </svg>

              <div className={styles.donutCenterContent}>
                <span className={styles.centerLabel}>Spent</span>
                <span className={styles.centerAmount}>₹{totalSpentThisMonth.toLocaleString()}</span>
                <span className={`${styles.healthBadge} ${
                  budgetHealth.id === 'good' ? styles.healthGood :
                  budgetHealth.id === 'warning' ? styles.healthWarning : styles.healthDanger
                }`}>
                  {budgetHealth.label}
                </span>
              </div>
            </div>

            <div className={styles.budgetComparison}>
              <span>Limit: <strong>₹{(monthlyBudget || 0).toLocaleString()}</strong></span>
              <span>
                Remaining: <strong>₹{Math.max(0, (monthlyBudget || 0) - totalSpentThisMonth).toLocaleString()}</strong>
              </span>
            </div>
          </div>

          {/* Category Legends Breakdown */}
          <div className={styles.categoryList}>
            {categorySlices.length === 0 ? (
              <p className={styles.noExpensesText}>No expenses logged for {monthName}.</p>
            ) : (
              categorySlices.map((slice) => (
                <div key={slice.category} className={styles.categoryRow}>
                  <div className={styles.catLeft}>
                    <span className={styles.colorDot} style={{ backgroundColor: slice.color }} />
                    <span className={styles.catName}>
                      {slice.category.charAt(0).toUpperCase() + slice.category.slice(1)}
                    </span>
                  </div>
                  <div className={styles.catRight}>
                    <span className={styles.catPercentage}>{slice.percentage.toFixed(0)}%</span>
                    <span className={styles.catAmount}>₹{slice.amount.toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* RIGHT COLUMN: 3-COLUMN RECENT TRANSACTIONS TABLE */}
        <section className={styles.transactionsCard}>
          <div className={styles.cardHeaderRow}>
            <h3 className={styles.cardHeading}>Recent Activity</h3>
            
            <div className={styles.filterWrapper} ref={filterRef}>
              <button
                type="button"
                className={styles.filterTrigger}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <span>
                  {filterType === 'all' && 'All Activity'}
                  {filterType === 'income' && 'Income Only'}
                  {filterType === 'expense' && 'Expenses Only'}
                </span>
                <ChevronDownIcon className={`${styles.chevron} ${isFilterOpen ? styles.chevronOpen : ''}`} />
              </button>

              {isFilterOpen && (
                <div className={styles.filterMenu}>
                  <div
                    className={`${styles.filterItem} ${filterType === 'all' ? styles.filterActive : ''}`}
                    onClick={() => { setFilterType('all'); setIsFilterOpen(false); }}
                  >
                    <span>All Activity</span>
                    {filterType === 'all' && <CheckIcon className={styles.checkSvg} />}
                  </div>
                  <div
                    className={`${styles.filterItem} ${filterType === 'income' ? styles.filterActive : ''}`}
                    onClick={() => { setFilterType('income'); setIsFilterOpen(false); }}
                  >
                    <span>Income Only</span>
                    {filterType === 'income' && <CheckIcon className={styles.checkSvg} />}
                  </div>
                  <div
                    className={`${styles.filterItem} ${filterType === 'expense' ? styles.filterActive : ''}`}
                    onClick={() => { setFilterType('expense'); setIsFilterOpen(false); }}
                  >
                    <span>Expenses Only</span>
                    {filterType === 'expense' && <CheckIcon className={styles.checkSvg} />}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.thTransaction}>Transaction</th>
                  <th className={styles.thDate}>Date</th>
                  <th className={styles.thAmount}>Amount</th>
                  <th className={styles.thAction}></th>
                </tr>
              </thead>
              <tbody>
                {displayTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className={styles.emptyTd}>No transactions recorded.</td>
                  </tr>
                ) : (
                  displayTransactions.map((item, index) => {
                    const isIncome = item.type === 'income';
                    const amountValue = Number(item.amount) || 0;
                    return (
                      <tr key={item.id || item._id || index} className={styles.tableRow}>
                        <td className={styles.tdTransaction}>
                          <div className={styles.itemMetaLeft}>
                            {getTransactionIcon(item)}
                            <div>
                              <p className={styles.itemTitle}>{item.note || item.category || 'Transaction'}</p>
                              <p className={styles.itemCategorySub}>{item.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className={styles.tdDate}>
                          <span className={styles.dateText}>{item.date || '—'}</span>
                        </td>
                        <td className={styles.tdAmount}>
                          <span className={isIncome ? styles.amountIncome : styles.amountExpense}>
                            {isIncome ? `+₹${amountValue.toLocaleString()}` : `-₹${amountValue.toLocaleString()}`}
                          </span>
                        </td>
                        <td className={styles.tdAction}>
                          <button
                            type="button"
                            className={styles.deleteTxBtn}
                            onClick={() => handleDeleteTransaction(item.id || item._id, item.note || item.category)}
                            title="Delete transaction"
                          >
                            <TrashIcon className={styles.trashSvg} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>

      {/* ==================================================================== */}
      {/* 3. DYNAMIC MODAL: ADD MONEY / ACCOUNT (AUTO-SELECTED BANK OPTION)     */}
      {/* ==================================================================== */}
      {showAddAccountModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddAccountModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Add Money / Account</h3>
                <p className={styles.modalSub}>Select how you want to add funds or link a new wallet</p>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setShowAddAccountModal(false)}
              >
                <XMarkIcon className={styles.closeIcon} />
              </button>
            </div>

            {/* Type Selector Tabs (Bank auto-selected) */}
            <div className={styles.methodSelector}>
              <button
                type="button"
                className={`${styles.methodTab} ${accountCategory === 'bank' ? styles.methodActive : ''}`}
                onClick={() => handleCategorySwitch('bank')}
              >
                <BuildingLibraryIcon className={styles.methodTabSvg} />
                <span>Bank Account</span>
              </button>

              <button
                type="button"
                className={`${styles.methodTab} ${accountCategory === 'cash' ? styles.methodActive : ''}`}
                onClick={() => handleCategorySwitch('cash')}
              >
                <BanknotesIcon className={styles.methodTabSvg} />
                <span>Cash in Hand</span>
              </button>

              <button
                type="button"
                className={`${styles.methodTab} ${accountCategory === 'upi' ? styles.methodActive : ''}`}
                onClick={() => handleCategorySwitch('upi')}
              >
                <DevicePhoneMobileIcon className={styles.methodTabSvg} />
                <span>UPI / Wallet</span>
              </button>

              <button
                type="button"
                className={`${styles.methodTab} ${accountCategory === 'card' ? styles.methodActive : ''}`}
                onClick={() => handleCategorySwitch('card')}
              >
                <CreditCardIcon className={styles.methodTabSvg} />
                <span>Credit Card</span>
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className={styles.modalForm}>
              {/* Dynamic Fields: BANK ACCOUNT */}
              {accountCategory === 'bank' && (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC Bank, SBI, ICICI"
                      value={accName}
                      onChange={(e) => setAccName(e.target.value)}
                      className={styles.formInput}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Account Type</label>
                    <select
                      value={bankSubtype}
                      onChange={(e) => setBankSubtype(e.target.value)}
                      className={styles.formSelect}
                    >
                      <option value="Savings Account">Savings Account</option>
                      <option value="Salary Account">Salary Account</option>
                      <option value="Current Account">Current Account</option>
                      <option value="Fixed Deposit">Fixed Deposit</option>
                    </select>
                  </div>
                </>
              )}

              {/* Dynamic Fields: CASH */}
              {accountCategory === 'cash' && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Cash Label / Stash</label>
                  <input
                    type="text"
                    placeholder="e.g. Physical Cash, Wallet, Locker"
                    value={accName}
                    onChange={(e) => setAccName(e.target.value)}
                    className={styles.formInput}
                    required
                  />
                </div>
              )}

              {/* Dynamic Fields: UPI / WALLET */}
              {accountCategory === 'upi' && (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>App / Wallet Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Google Pay, PhonePe, Paytm"
                      value={accName}
                      onChange={(e) => setAccName(e.target.value)}
                      className={styles.formInput}
                      required
                    />
                  </div>
                </>
              )}

              {/* Dynamic Fields: CREDIT CARD */}
              {accountCategory === 'card' && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Card Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Amazon Pay ICICI, HDFC Regalia"
                    value={accName}
                    onChange={(e) => setAccName(e.target.value)}
                    className={styles.formInput}
                    required
                  />
                </div>
              )}

              {/* Amount Field (Universal) */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {accountCategory === 'card' ? 'Initial Outstanding / Balance (₹)' : 'Opening Balance / Amount to Add (₹)'}
                </label>
                <input
                  type="number"
                  placeholder="e.g. 10000"
                  value={accBalance}
                  onChange={(e) => setAccBalance(e.target.value)}
                  className={styles.formInput}
                  required
                />
              </div>
              
                            {/* Date Field */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Date</label>
                <input
                  type="date"
                  value={accDate}
                  onChange={(e) => setAccDate(e.target.value)}
                  className={styles.formInput}
                  required
                />
              </div>

              {/* Note / Description (Optional) */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. November salary, Cash in hand, Savings"
                  value={accNote}
                  onChange={(e) => setAccNote(e.target.value)}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setShowAddAccountModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Confirm & Add Amount
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. MODAL: EDIT ACCOUNT                                               */}
      {/* ==================================================================== */}
      {editingAccount && (
        <div className={styles.modalOverlay} onClick={() => setEditingAccount(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Edit Account Card</h3>
                <p className={styles.modalSub}>Update the name or opening balance</p>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setEditingAccount(null)}
              >
                <XMarkIcon className={styles.closeIcon} />
              </button>
            </div>

            <form onSubmit={handleSaveEditAccount} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Account Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Current Balance (₹)</label>
                <input
                  type="number"
                  value={editBalance}
                  onChange={(e) => setEditBalance(e.target.value)}
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setEditingAccount(null)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. MODAL: SET BUDGET CAP                                            */}
      {/* ==================================================================== */}
      {showBudgetModal && (
        <div className={styles.modalOverlay} onClick={() => setShowBudgetModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Set Monthly Budget Cap</h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setShowBudgetModal(false)}
              >
                <XMarkIcon className={styles.closeIcon} />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Monthly Target Limit (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 15000"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setShowBudgetModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Save Budget Cap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}