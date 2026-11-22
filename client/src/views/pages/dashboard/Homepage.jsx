/* eslint-disable no-unused-vars */
// import React from 'react';
import React, { useState, useRef, useEffect } from 'react';
import { useExpense } from '../../../controllers/ExpenseContext';
import { getBudgetHealth } from '../../../models/constants';
import {
  WalletIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
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
  ChevronDownIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import styles from './HomePage.module.css';

export default function HomePage() {
  const { transactions, monthlyBudget } = useExpense();

  // Filter state for the table header: 'all' | 'income' | 'expense'
  const [filterType, setFilterType] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  // Close filter dropdown when clicking outside
  useEffect(function() {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return function() {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter valid transactions
  const validTransactions = transactions.filter(function(item) {
    return item && item.amount !== undefined && item.type !== undefined;
  });

  // Calculate totals
  let totalIncome = 0;
  for (let i = 0; i < validTransactions.length; i++) {
    if (validTransactions[i].type === 'income') {
      totalIncome = totalIncome + (Number(validTransactions[i].amount) || 0);
    }
  }

  let totalExpenses = 0;
  for (let i = 0; i < validTransactions.length; i++) {
    if (validTransactions[i].type === 'expense') {
      totalExpenses = totalExpenses + (Number(validTransactions[i].amount) || 0);
    }
  }

  let balance = totalIncome - totalExpenses;
  let health = getBudgetHealth(totalExpenses, monthlyBudget);

  // Apply the selected filter from the table column header
  let filteredTransactions = validTransactions.filter(function(item) {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  // Show up to 8 most recent transactions in the table
  let displayTransactions = filteredTransactions.slice(0, 8);

  function getTransactionIcon(item) {
    const isIncome = item.type === 'income';
    const cat = item.category ? item.category.toLowerCase() : '';

    let IconComponent = isIncome ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;

    if (cat === 'food') IconComponent = CakeIcon;
    else if (cat === 'transport') IconComponent = TruckIcon;
    else if (cat === 'rent') IconComponent = HomeIcon;
    else if (cat === 'utilities') IconComponent = BoltIcon;
    else if (cat === 'health') IconComponent = HeartIcon;
    else if (cat === 'grocery') IconComponent = ShoppingCartIcon;
    else if (cat === 'entertainment') IconComponent = FilmIcon;
    else if (cat === 'clothing') IconComponent = TagIcon;
    else if (cat === 'education') IconComponent = AcademicCapIcon;
    else if (cat === 'subscriptions') IconComponent = ArrowPathIcon;
    else if (cat === 'salary') IconComponent = BriefcaseIcon;

    const badgeClass = isIncome ? styles.badgeIncome : styles.badgeExpense;

    return (
      <div className={`${styles.iconBadge} ${badgeClass}`}>
        <IconComponent className={styles.txSvg} />
      </div>
    );
  }

  function handleFilterSelect(type) {
    setFilterType(type);
    setIsFilterOpen(false);
  }

  return (
    <div className={styles.page}>

      {/* Summary Cards */}
      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.cardLabel}>Total Balance</p>
            <WalletIcon className={styles.cardTopIcon} />
          </div>
          <p className={styles.cardAmount}>₹{balance.toLocaleString()}</p>
        </div>

        <div className={`${styles.card} ${styles.incomeCard}`}>
          <div className={styles.cardHeader}>
            <p className={styles.cardLabel}>Total Income</p>
            <ArrowTrendingUpIcon className={`${styles.cardTopIcon} ${styles.greenIcon}`} />
          </div>
          <p className={styles.cardAmount}>₹{totalIncome.toLocaleString()}</p>
        </div>

        <div className={`${styles.card} ${styles.expenseCard}`}>
          <div className={styles.cardHeader}>
            <p className={styles.cardLabel}>Total Expenses</p>
            <ArrowTrendingDownIcon className={`${styles.cardTopIcon} ${styles.redIcon}`} />
          </div>
          <p className={styles.cardAmount}>₹{totalExpenses.toLocaleString()}</p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.cardLabel}>Budget Health</p>
            {health.id === 'good' && <CheckCircleIcon className={`${styles.cardTopIcon} ${styles.greenIcon}`} />}
            {health.id === 'warning' && <ExclamationTriangleIcon className={`${styles.cardTopIcon} ${styles.amberIcon}`} />}
            {health.id === 'critical' && <XCircleIcon className={`${styles.cardTopIcon} ${styles.redIcon}`} />}
          </div>
          <p className={styles.cardAmount}>{health.label}</p>
          {monthlyBudget > 0 && (
            <p className={styles.budgetSub}>
              ₹{totalExpenses.toLocaleString()} of ₹{monthlyBudget.toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* 3-Column Transactions Table */}
      <div className={styles.section}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                {/* Column 1: Filter Dropdown in the header */}
                <th className={styles.thTransaction}>
                  <div className={styles.filterWrapper} ref={filterRef}>
                    <button
                      type="button"
                      className={styles.filterTrigger}
                      onClick={function() { setIsFilterOpen(!isFilterOpen); }}
                    >
                      <span>
                        {filterType === 'all' && 'All Transactions'}
                        {filterType === 'income' && 'Income Only'}
                        {filterType === 'expense' && 'Expenses Only'}
                      </span>
                      <ChevronDownIcon className={`${styles.chevron} ${isFilterOpen ? styles.chevronOpen : ''}`} />
                    </button>

                    {isFilterOpen && (
                      <div className={styles.filterMenu}>
                        <div
                          className={`${styles.filterItem} ${filterType === 'all' ? styles.filterActive : ''}`}
                          onClick={function() { handleFilterSelect('all'); }}
                        >
                          <span>All Transactions</span>
                          {filterType === 'all' && <CheckIcon className={styles.checkSvg} />}
                        </div>
                        <div
                          className={`${styles.filterItem} ${filterType === 'income' ? styles.filterActive : ''}`}
                          onClick={function() { handleFilterSelect('income'); }}
                        >
                          <span>Income Only</span>
                          {filterType === 'income' && <CheckIcon className={styles.checkSvg} />}
                        </div>
                        <div
                          className={`${styles.filterItem} ${filterType === 'expense' ? styles.filterActive : ''}`}
                          onClick={function() { handleFilterSelect('expense'); }}
                        >
                          <span>Expenses Only</span>
                          {filterType === 'expense' && <CheckIcon className={styles.checkSvg} />}
                        </div>
                      </div>
                    )}
                  </div>
                </th>

                {/* Column 2: Date */}
                <th className={styles.thDate}>Date</th>

                {/* Column 3: Amount */}
                <th className={styles.thAmount}>Amount</th>
              </tr>
            </thead>

            <tbody>
              {displayTransactions.length === 0 ? (
                <tr>
                  <td colSpan="3" className={styles.emptyTd}>
                    No transactions found for this filter.
                  </td>
                </tr>
              ) : (
                displayTransactions.map(function(item, index) {
                  const isIncome = item.type === 'income';
                  const amountClass = isIncome ? styles.amountIncome : styles.amountExpense;
                  const amountValue = Number(item.amount) || 0;
                  const amountText = isIncome ? `+₹${amountValue.toLocaleString()}` : `-₹${amountValue.toLocaleString()}`;

                  return (
                    <tr key={item.id || item._id || index} className={styles.tableRow}>
                      {/* Left: Icon + Category/Note */}
                      <td className={styles.tdTransaction}>
                        <div className={styles.itemMetaLeft}>
                          {getTransactionIcon(item)}
                          <div>
                            <p className={styles.itemTitle}>{item.note || item.category || 'Transaction'}</p>
                            <p className={styles.itemCategorySub}>{item.category}</p>
                          </div>
                        </div>
                      </td>

                      {/* Center: Date */}
                      <td className={styles.tdDate}>
                        <span className={styles.dateText}>{item.date || '—'}</span>
                      </td>

                      {/* Right: Amount */}
                      <td className={styles.tdAmount}>
                        <span className={amountClass}>{amountText}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}