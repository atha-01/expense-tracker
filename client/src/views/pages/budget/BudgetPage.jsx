import { useState } from 'react';
import { useExpense } from '../../../controllers/ExpenseContext';
import { getBudgetHealth, EXPENSE_CATEGORIES } from '../../../models/constants';
import styles from './BudgetPage.module.css';

export default function BudgetPage() {
  const { transactions, monthlyBudget, saveBudget } = useExpense();

  const [budgetInput, setBudgetInput] = useState('');
  const [error, setError] = useState('');

  // Get the current month as a string like "2026-11"
  // We use this to filter only this month's expenses
  const today = new Date();
  const currentMonth = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');

  // Filter only expense transactions from the current month
  let thisMonthExpenses = [];
  for (let i = 0; i < transactions.length; i++) {
    const transaction = transactions[i];
    if (transaction.type === 'expense' && transaction.date.startsWith(currentMonth)) {
      thisMonthExpenses.push(transaction);
    }
  }

  // Add up total spent this month
  let totalSpent = 0;
  for (let i = 0; i < thisMonthExpenses.length; i++) {
    totalSpent = totalSpent + thisMonthExpenses[i].amount;
  }

  // How much is left in the budget
  let remaining = monthlyBudget - totalSpent;

  // Get budget health status object from constants
  const health = getBudgetHealth(totalSpent, monthlyBudget);

  // Calculate what percentage of budget is spent (for the main progress bar)
  let spentPercentage = 0;
  if (monthlyBudget > 0) {
    spentPercentage = (totalSpent / monthlyBudget) * 100;
    if (spentPercentage > 100) {
      spentPercentage = 100;
    }
  }

  // Group spending by category
  // Result will look like: { food: 500, transport: 200, ... }
  const spendingByCategory = {};
  for (let i = 0; i < thisMonthExpenses.length; i++) {
    const transaction = thisMonthExpenses[i];
    const cat = transaction.category;

    if (spendingByCategory[cat] === undefined) {
      spendingByCategory[cat] = 0;
    }
    spendingByCategory[cat] = spendingByCategory[cat] + transaction.amount;
  }

  // Turn the grouped object into a sorted array (highest spending first)
  const categoryRows = [];
  for (let catId in spendingByCategory) {
    categoryRows.push({
      id: catId,
      amount: spendingByCategory[catId],
    });
  }
  categoryRows.sort(function(a, b) {
    return b.amount - a.amount;
  });

  // Find icon and label for a category id
  function getCategoryInfo(categoryId) {
    for (let i = 0; i < EXPENSE_CATEGORIES.length; i++) {
      if (EXPENSE_CATEGORIES[i].id === categoryId) {
        return EXPENSE_CATEGORIES[i];
      }
    }
    return { icon: '💸', label: categoryId };
  }

  // Calculate what % of total spending this category takes up
  function getCategoryPercent(amount) {
    if (totalSpent === 0) {
      return 0;
    }
    return Math.round((amount / totalSpent) * 100);
  }

  // Pick the right color for the main progress bar based on health
  function getBarColor() {
    if (health.id === 'critical') {
      return styles.barRed;
    }
    if (health.id === 'warning') {
      return styles.barAmber;
    }
    return styles.barGreen;
  }

  function handleSaveBudget(e) {
    e.preventDefault();
    setError('');

    if (!budgetInput || Number(budgetInput) <= 0) {
      setError('Please enter a valid budget amount.');
      return;
    }

    saveBudget(Number(budgetInput));
    setBudgetInput('');
  }

  return (
    <div className={styles.page}>

      {/* Set Budget Form */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Monthly Budget Limit</h2>

        <form onSubmit={handleSaveBudget} className={styles.form}>
          <div className={styles.inlineRow}>
            <div className={styles.field}>
              <label>Set your monthly spending limit (₹)</label>
              <input
                type="number"
                placeholder={monthlyBudget > 0 ? 'Current: ₹' + monthlyBudget.toLocaleString() : 'e.g. 15000'}
                value={budgetInput}
                onChange={function(e) { setBudgetInput(e.target.value); }}
              />
            </div>
            <button type="submit" className={styles.submitBtn}>
              Save Budget
            </button>
          </div>
          {error && <p className={styles.error}>{error}</p>}
        </form>
      </div>

      {/* Budget Overview */}
      {monthlyBudget > 0 && (
        <div className={styles.card}>
          <div className={styles.overviewTop}>
            <div>
              <p className={styles.overviewMonth}>
                {today.toLocaleString('default', { month: 'long' })} {today.getFullYear()}
              </p>
              <p className={styles.overviewHealth}>
                {health.emoji} {health.label}
              </p>
            </div>
            <div className={styles.overviewNumbers}>
              <div className={styles.overviewStat}>
                <p className={styles.statLabel}>Spent</p>
                <p className={styles.statValue} style={{ color: health.color }}>
                  ₹{totalSpent.toLocaleString()}
                </p>
              </div>
              <div className={styles.overviewStat}>
                <p className={styles.statLabel}>Budget</p>
                <p className={styles.statValue}>₹{monthlyBudget.toLocaleString()}</p>
              </div>
              <div className={styles.overviewStat}>
                <p className={styles.statLabel}>Remaining</p>
                <p className={`${styles.statValue} ${remaining < 0 ? styles.negative : styles.positive}`}>
                  ₹{remaining.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Main progress bar */}
          <div className={styles.progressTrack}>
            <div
              className={`${styles.progressBar} ${getBarColor()}`}
              style={{ width: spentPercentage + '%' }}
            />
          </div>
          <p className={styles.progressLabel}>
            {Math.round(spentPercentage)}% of budget used
          </p>
        </div>
      )}

      {/* Spending by Category */}
      {categoryRows.length > 0 && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Spending by Category — This Month</h2>

          {categoryRows.map(function(row) {
            const catInfo = getCategoryInfo(row.id);
            const catPercent = getCategoryPercent(row.amount);

            return (
              <div key={row.id} className={styles.catRow}>
                <div className={styles.catLeft}>
                  <span className={styles.catIcon}>{catInfo.icon}</span>
                  <span className={styles.catLabel}>{catInfo.label}</span>
                </div>
                <div className={styles.catRight}>
                  <div className={styles.catTrack}>
                    <div
                      className={styles.catBar}
                      style={{ width: catPercent + '%' }}
                    />
                  </div>
                  <span className={styles.catAmount}>₹{row.amount.toLocaleString()}</span>
                  <span className={styles.catPercent}>{catPercent}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state when no budget and no expenses */}
      {monthlyBudget === 0 && categoryRows.length === 0 && (
        <div className={styles.emptyCard}>
          <p className={styles.emptyIcon}>📊</p>
          <p className={styles.emptyText}>Set a monthly budget above to start tracking your spending health.</p>
        </div>
      )}

    </div>
  );
}