/*
  constants.js
  This is the MODEL layer.
  It defines the "shape" of all data in the app.
  Think of it like a dictionary — it tells the rest of the app
  what types of things exist and what values are allowed.

  RULE: No logic here. Only data definitions.
*/


/* ─── TRANSACTION TYPES ───────────────────────────────────────────────────── */
/*
  Every transaction is either money coming IN or money going OUT.
*/
export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
};


/* ─── INCOME CATEGORIES ───────────────────────────────────────────────────── */
/*
  When adding income, the user picks one of these categories.
  "id" is what we store in the database. "label" is what we show on screen.
*/
export const INCOME_CATEGORIES = [
  { id: 'salary',      label: 'Salary',      icon: '💼' },
  { id: 'freelance',   label: 'Freelance',   icon: '💻' },
  { id: 'business',    label: 'Business',    icon: '🏢' },
  { id: 'investment',  label: 'Investment',  icon: '📈' },
  { id: 'gift',        label: 'Gift',        icon: '🎁' },
  { id: 'other',       label: 'Other',       icon: '➕' },
];


/* ─── EXPENSE CATEGORIES ──────────────────────────────────────────────────── */
/*
  When adding an expense, the user picks one of these.
*/
export const EXPENSE_CATEGORIES = [
  { id: 'food',          label: 'Food & Dining',    icon: '🍽️' },
  { id: 'transport',     label: 'Transport',        icon: '🚗' },
  { id: 'rent',          label: 'Rent & Housing',   icon: '🏠' },
  { id: 'utilities',     label: 'Utilities',        icon: '⚡' },
  { id: 'health',        label: 'Health',           icon: '🏥' },
  { id: 'grocery',       label: 'Grocery',          icon: '🛒' },
  { id: 'entertainment', label: 'Entertainment',    icon: '🎬' },
  { id: 'clothing',      label: 'Clothing',         icon: '👕' },
  { id: 'education',     label: 'Education',        icon: '📚' },
  { id: 'subscriptions', label: 'Subscriptions',    icon: '🔄' },
  { id: 'other',         label: 'Other',            icon: '➕' },
];


/* ─── ACCOUNT TYPES ───────────────────────────────────────────────────────── */
/*
  Where the money lives. A user might have multiple accounts.
*/
export const ACCOUNT_TYPES = [
  { id: 'cash',   label: 'Cash',          icon: '💵' },
  { id: 'bank',   label: 'Bank Account',  icon: '🏦' },
  { id: 'card',   label: 'Credit Card',   icon: '💳' },
  { id: 'upi',    label: 'UPI / Wallet',  icon: '📱' },
];


/* ─── BILL STATUS ─────────────────────────────────────────────────────────── */
/*
  Bills (like rent, Netflix, electricity) have a status.
  This tells the user whether they've paid it or not.
*/
export const BILL_STATUS = {
  PAID:     'paid',
  UNPAID:   'unpaid',
  OVERDUE:  'overdue',   // unpaid AND past due date
};


/* ─── BUDGET HEALTH ───────────────────────────────────────────────────────── */
/*
  At the end of each month, we calculate how close the user is
  to their spending limit and assign a health status.

  Example: if they spent 90% of budget → status is CRITICAL
*/
export const BUDGET_HEALTH = {
  GOOD:     { id: 'good',     label: 'On Track',   color: '#10b981', emoji: '✅' }, // spent < 70%
  WARNING:  { id: 'warning',  label: 'At Risk',    color: '#f59e0b', emoji: '⚠️' }, // spent 70–90%
  CRITICAL: { id: 'critical', label: 'Exceeded',   color: '#ef4444', emoji: '🔴' }, // spent > 90%
};


/* ─── HELPER: GET BUDGET HEALTH STATUS ───────────────────────────────────── */
/*
  This function takes in how much was spent and what the total budget is,
  then returns whether the user is GOOD, WARNING, or CRITICAL.

  Example:
    getBudgetHealth(8000, 10000) → returns BUDGET_HEALTH.WARNING
    because 8000/10000 = 80% which is between 70 and 90
*/
export function getBudgetHealth(spent, budget) {
  if (budget <= 0) return BUDGET_HEALTH.GOOD; // avoid divide by zero

  const percentage = (spent / budget) * 100;

  if (percentage >= 90) {
    return BUDGET_HEALTH.CRITICAL;
  } else if (percentage >= 70) {
    return BUDGET_HEALTH.WARNING;
  } else {
    return BUDGET_HEALTH.GOOD;
  }
}   