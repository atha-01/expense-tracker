// eslint-disable-next-line no-unused-vars
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
  food: '#f59e0b',          // Amber
  transport: '#8b5cf6',     // Violet
  rent: '#3b82f6',          // Blue
  utilities: '#06b6d4',     // Cyan
  health: '#ef4444',        // Red
  grocery: '#10b981',       // Emerald
  entertainment: '#ec4899',  // Pink
  clothing: '#f97316',      // Orange
  education: '#6366f1',     // Indigo
  subscriptions: '#14b8a6', // Teal
  other: '#64748b',         // Slate
};

export default function HomePage() {
  const {
    transactions,
    accounts,
    addAccount,
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

  // Filter valid transactions
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
      if (t.account === account.id || t.account === account.type || t.account === account.name) {
        if (t.type === 'income') {
          balance += Number(t.amount) || 0;
        } else {
          balance -= Number(t.amount) || 0;
        }
      }
    }
    return balance;
  }

  let totalNetWorth = 0;
  for (let i = 0; i < accounts.length; i++) {
    totalNetWorth += getAccountBalance(accounts[i]);
  }

  function renderAccountTypeIcon(type) {
    const t = (type || '').toLowerCase();
    if (t === 'bank') return <BuildingLibraryIcon className={styles.accSvg} />;
    if (t === 'card') return <CreditCardIcon className={styles.accSvg} />;
    if (t === 'upi') return <DevicePhoneMobileIcon className={styles.accSvg} />;
    return <BanknotesIcon className={styles.accSvg} />;
  }

  // --------------------------------------------------------------------------
  // Quick Add Account Modal State
  // --------------------------------------------------------------------------
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState('bank');
  const [newAccBalance, setNewAccBalance] = useState('');

  async function handleCreateAccount(e) {
    e.preventDefault();
    if (!newAccName.trim() || newAccBalance === '') return;
    await addAccount({
      name: newAccName.trim(),
      type: newAccType,
      openingBalance: Number(newAccBalance) || 0,
    });
    setNewAccName('');
    setNewAccBalance('');
    setShowAddAccountModal(false);
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

  // --------------------------------------------------------------------------
  // SVG Donut Pie Chart Arc Generation
  // --------------------------------------------------------------------------
  const RADIUS = 65;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ~408.4
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
      {/* 1. ACCOUNTS & NET WORTH STRIP                                       */}
      {/* ==================================================================== */}
      <section className={styles.accountsSection}>
        <div className={styles.sectionHeaderRow}>
          <div>
            <h2 className={styles.sectionTitle}>Accounts & Net Worth</h2>
            <p className={styles.sectionSub}>Live consolidated balances across all your wallets & cards</p>
          </div>
          <button
            type="button"
            className={styles.addAccountPillBtn}
            onClick={() => setShowAddAccountModal(true)}
          >
            <PlusIcon className={styles.plusIcon} />
            <span>Add Account</span>
          </button>
        </div>

        <div className={styles.accountsGrid}>
          {/* Main Net Worth Card */}
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

          {/* Account Cards */}
          {accounts.map((acc) => {
            const bal = getAccountBalance(acc);
            return (
              <div key={acc.id || acc._id} className={styles.accountCard}>
                <div className={styles.accCardTop}>
                  <div className={styles.accTypeBadge}>
                    {renderAccountTypeIcon(acc.type)}
                  </div>
                  <span className={styles.accTypeName}>
                    {acc.type ? acc.type.toUpperCase() : 'BANK'}
                  </span>
                </div>
                <h4 className={styles.accName}>{acc.name}</h4>
                <p className={`${styles.accBalance} ${bal < 0 ? styles.negativeBal : ''}`}>
                  ₹{bal.toLocaleString()}
                </p>
              </div>
            );
          })}
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
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r={RADIUS}
                  className={styles.donutBgRing}
                />

                {/* Empty State Ring if zero spending */}
                {categorySlices.length === 0 && (
                  <circle
                    cx="80"
                    cy="80"
                    r={RADIUS}
                    className={styles.donutEmptyRing}
                  />
                )}

                {/* Slices for Each Category */}
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

              {/* Center Donut Text */}
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

            {/* Target Budget Comparison Subtitle */}
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
            
            {/* Filter Dropdown */}
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
                </tr>
              </thead>
              <tbody>
                {displayTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="3" className={styles.emptyTd}>No transactions recorded.</td>
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
      {/* 3. MODAL: ADD ACCOUNT                                                */}
      {/* ==================================================================== */}
      {showAddAccountModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddAccountModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Add New Account</h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setShowAddAccountModal(false)}
              >
                <XMarkIcon className={styles.closeIcon} />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Account Name</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Salary, Cash Wallet"
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Account Type</label>
                <select
                  value={newAccType}
                  onChange={(e) => setNewAccType(e.target.value)}
                  className={styles.formSelect}
                >
                  <option value="bank">Bank Account</option>
                  <option value="cash">Cash in Hand</option>
                  <option value="card">Credit Card</option>
                  <option value="upi">UPI / Digital Wallet</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Opening Balance (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={newAccBalance}
                  onChange={(e) => setNewAccBalance(e.target.value)}
                  className={styles.formInput}
                  required
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
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. MODAL: SET BUDGET CAP                                            */}
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