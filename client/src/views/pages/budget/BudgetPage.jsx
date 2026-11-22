import { useState } from 'react';
import { useExpense } from '../../../controllers/ExpenseContext';
import { getBudgetHealth, EXPENSE_CATEGORIES } from '../../../models/constants';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
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
} from '@heroicons/react/24/outline';
import styles from './BudgetPage.module.css';

export default function BudgetPage() {
  const { transactions, monthlyBudget, saveBudget } = useExpense();

  const [budgetInput, setBudgetInput] = useState('');
  const [error, setError] = useState('');

  const [activeDate, setActiveDate] = useState(new Date());

  const activeYear = activeDate.getFullYear();
  const activeMonthNumber = activeDate.getMonth() + 1;
  const currentMonthString = activeYear + '-' + String(activeMonthNumber).padStart(2, '0');

  function goToPreviousMonth() {
    setActiveDate(new Date(activeYear, activeDate.getMonth() - 1, 1));
  }

  function goToNextMonth() {
    setActiveDate(new Date(activeYear, activeDate.getMonth() + 1, 1));
  }

  let thisMonthExpenses = [];
  for (let i = 0; i < transactions.length; i++) {
    const transaction = transactions[i];
    if (transaction.type === 'expense' && transaction.date && transaction.date.startsWith(currentMonthString)) {
      thisMonthExpenses.push(transaction);
    }
  }

  let totalSpent = 0;
  for (let i = 0; i < thisMonthExpenses.length; i++) {
    totalSpent = totalSpent + (Number(thisMonthExpenses[i].amount) || 0);
  }

  let remaining = monthlyBudget - totalSpent;
  const health = getBudgetHealth(totalSpent, monthlyBudget);

  let rawPercentage = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;
  let spentPercentage = rawPercentage > 100 ? 100 : rawPercentage;

  const spendingByCategory = {};
  for (let i = 0; i < thisMonthExpenses.length; i++) {
    const transaction = thisMonthExpenses[i];
    const cat = transaction.category;

    if (spendingByCategory[cat] === undefined) {
      spendingByCategory[cat] = 0;
    }
    spendingByCategory[cat] = spendingByCategory[cat] + Number(transaction.amount);
  }

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

  // Category Heroicon renderer
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

    return <IconComp className={styles.catSvg} />;
  }

  function getCategoryLabel(categoryId) {
    for (let i = 0; i < EXPENSE_CATEGORIES.length; i++) {
      if (EXPENSE_CATEGORIES[i].id === categoryId) {
        return EXPENSE_CATEGORIES[i].label;
      }
    }
    return categoryId || 'Expense';
  }

  function getCategoryPercent(amount) {
    if (totalSpent === 0) return 0;
    return Math.round((amount / totalSpent) * 100);
  }

  function getBarGradientClass() {
    if (health.id === 'critical') return styles.barGradientRed;
    if (health.id === 'warning') return styles.barGradientAmber;
    return styles.barGradientGreen;
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

      {/* Month Navigator & HeroUI Budget Overview */}
      {monthlyBudget > 0 && (
        <div className={styles.card}>
          <div className={styles.monthNavigator}>
            <button className={styles.navArrow} onClick={goToPreviousMonth} title="Previous Month">
              ←
            </button>
            <span className={styles.monthTitle}>
              {activeDate.toLocaleString('default', { month: 'long' }).toUpperCase()} {activeYear}
            </span>
            <button className={styles.navArrow} onClick={goToNextMonth} title="Next Month">
              →
            </button>
          </div>

          <div className={styles.overviewTop}>
            {/* Sleek HeroUI Status Pill Badge */}
            <div className={`${styles.statusPill} ${
              health.id === 'good' ? styles.pillGood :
              health.id === 'warning' ? styles.pillWarning : styles.pillCritical
            }`}>
              {health.id === 'good' && <CheckCircleIcon className={styles.statusSvg} />}
              {health.id === 'warning' && <ExclamationTriangleIcon className={styles.statusSvg} />}
              {health.id === 'critical' && <XCircleIcon className={styles.statusSvg} />}
              <span>{health.label}</span>
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

          {/* Sleek HeroUI Progress Bar Track */}
          <div className={styles.progressTrack}>
            <div
              className={`${styles.progressBar} ${getBarGradientClass()}`}
              style={{ width: spentPercentage + '%' }}
            />
          </div>

          {/* Under Progress Bar Meta */}
          <div className={styles.progressMeta}>
            <span className={styles.progressPercentage}>
              {Math.round(rawPercentage)}% used
            </span>
            <span className={styles.progressStatusText}>
              {remaining >= 0 ? `₹${remaining.toLocaleString()} safe to spend` : `Exceeded by ₹${Math.abs(remaining).toLocaleString()}`}
            </span>
          </div>
        </div>
      )}

      {/* Spending by Category */}
      {categoryRows.length > 0 && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            Spending by Category — {activeDate.toLocaleString('default', { month: 'long' })} {activeYear}
          </h2>

          {categoryRows.map(function(row) {
            const catPercent = getCategoryPercent(row.amount);

            return (
              <div key={row.id} className={styles.catRow}>
                <div className={styles.catLeft}>
                  <div className={styles.catIconWrap}>
                    {renderCategoryIcon(row.id)}
                  </div>
                  <span className={styles.catLabel}>{getCategoryLabel(row.id)}</span>
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

      {monthlyBudget > 0 && categoryRows.length === 0 && (
        <div className={styles.emptyCard}>
          <p className={styles.emptyText}>
            No expenses logged for {activeDate.toLocaleString('default', { month: 'long' })} {activeYear}.
          </p>
        </div>
      )}

    </div>
  );
}