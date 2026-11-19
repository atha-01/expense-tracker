/* eslint-disable no-unused-vars */
// this is the dashboard homepage or dashboard main page
import React from 'react';
import { useExpense } from '../../../controllers/ExpenseContext';
import { getBudgetHealth } from '../../../models/constants';
import styles from './HomePage.module.css';

export default function HomePage() {
  const { transactions, monthlyBudget } = useExpense();

  // Step 1: Calculate total income by looping through all transactions
  let totalIncome = 0;
  for (let i = 0; i < transactions.length; i++) {
    if (transactions[i].type === 'income') {
      totalIncome = totalIncome + transactions[i].amount;
    }
  }

  // Step 2: Calculate total expenses
  let totalExpenses = 0;
  for (let i = 0; i < transactions.length; i++) {
    if (transactions[i].type === 'expense') {
      totalExpenses = totalExpenses + transactions[i].amount;
    }
  }

  // Step 3: Balance = what came in minus what went out
  let balance = totalIncome - totalExpenses;

  // Step 4: Get budget health (Good / At Risk / Exceeded)
  let health = getBudgetHealth(totalExpenses, monthlyBudget);

  // Step 5: Get the 5 most recent transactions to show in the list
  let recentTransactions = transactions.slice(0, 5);

  return (
    <div className={styles.page}>

      {/* Summary Cards */}
      <div className={styles.cards}>

        <div className={styles.card}>
          <p className={styles.cardLabel}>Total Balance</p>
          <p className={styles.cardAmount}>₹{balance.toLocaleString()}</p>
        </div>

        <div className={`${styles.card} ${styles.incomeCard}`}>
          <p className={styles.cardLabel}>Total Income</p>
          <p className={styles.cardAmount}>₹{totalIncome.toLocaleString()}</p>
        </div>

        <div className={`${styles.card} ${styles.expenseCard}`}>
          <p className={styles.cardLabel}>Total Expenses</p>
          <p className={styles.cardAmount}>₹{totalExpenses.toLocaleString()}</p>
        </div>

        <div className={styles.card}>
          <p className={styles.cardLabel}>Budget Health</p>
          <p className={styles.cardAmount}>{health.emoji} {health.label}</p>
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

        {recentTransactions.map(function(item) {
          let isIncome = item.type === 'income';
          let amountClass = isIncome ? styles.amountIncome : styles.amountExpense;
          let amountText = isIncome ? '+₹' + item.amount : '-₹' + item.amount;

          return (
            <div key={item.id} className={styles.txRow}>
              <div className={styles.txLeft}>
                <span className={styles.txIcon}>{item.icon}</span>
                <div>
                  <p className={styles.txNote}>{item.note || item.category}</p>
                  <p className={styles.txDate}>{item.date}</p>
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