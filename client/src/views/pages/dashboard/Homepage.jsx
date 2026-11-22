/* eslint-disable no-unused-vars */
// import React from 'react';
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
} from '@heroicons/react/24/outline';
import { useExpense } from '../../../controllers/ExpenseContext';
import { getBudgetHealth } from '../../../models/constants';
import styles from './HomePage.module.css';

export default function HomePage() {
  const { transactions, monthlyBudget } = useExpense();

  // Filter out any corrupted items that don't have amount or type
  const validTransactions = transactions.filter(function(item) {
    return item && item.amount !== undefined && item.type !== undefined;
  });

  // Step 1: Calculate total income safely
  let totalIncome = 0;
  for (let i = 0; i < validTransactions.length; i++) {
    if (validTransactions[i].type === 'income') {
      totalIncome = totalIncome + (Number(validTransactions[i].amount) || 0);
    }
  }

  // Step 2: Calculate total expenses safely
  let totalExpenses = 0;
  for (let i = 0; i < validTransactions.length; i++) {
    if (validTransactions[i].type === 'expense') {
      totalExpenses = totalExpenses + (Number(validTransactions[i].amount) || 0);
    }
  }

  // Step 3: Balance = what came in minus what went out
  let balance = totalIncome - totalExpenses;

  // Step 4: Get budget health (Good / At Risk / Exceeded)
  let health = getBudgetHealth(totalExpenses, monthlyBudget);

  // Step 5: Get the 5 most recent valid transactions
  let recentTransactions = validTransactions.slice(0, 5);


      // Returns a styled Heroicon based on the transaction category and type
  function getTransactionIcon(item) {
    const isIncome = item.type === 'income';
    const cat = item.category ? item.category.toLowerCase() : '';

    // Pick the icon component based on category
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

    // Badge color: green background for income, red for expense
    const badgeClass = isIncome ? styles.badgeIncome : styles.badgeExpense;

    return (
      <div className={`${styles.iconBadge} ${badgeClass}`}>
        <IconComponent className={styles.txSvg} />
      </div>
    );
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

      {/* Recent Transactions */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent Transactions</h2>

        {recentTransactions.length === 0 && (
          <p className={styles.empty}>No transactions yet. Add your first one!</p>
        )}

        {recentTransactions.map(function(item, index) {
          let isIncome = item.type === 'income';
          let amountClass = isIncome ? styles.amountIncome : styles.amountExpense;
          let amountValue = Number(item.amount) || 0;
          let amountText = isIncome ? '+₹' + amountValue.toLocaleString() : '-₹' + amountValue.toLocaleString();

          return (
            <div key={item.id || item._id || index} className={styles.txRow}>
              <div className= {styles.txLeft}>
                {/* <span className={styles.txIcon}>{item.icon || '💸'}</span> */}
                {/* using (Heroicons): */}
                        {getTransactionIcon(item)}
                <div>
                  <p className={styles.txNote}>{item.note || item.category || 'Transaction'}</p>
                  <p className={styles.txDate}>{item.date || 'No date'}</p>
                </div>
              </div>
              <p className={amountClass}>{amountText}</p>
            </div>
          );
          })}
      </div>

    </div>
  );
}
