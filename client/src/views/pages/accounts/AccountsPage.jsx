import { useState } from 'react';
import { useExpense } from '../../../controllers/ExpenseContext';
import { ACCOUNT_TYPES } from '../../../models/constants';
import styles from './AccountsPage.module.css';

export default function AccountsPage() {
  const { accounts, transactions, addAccount, deleteAccount } = useExpense();

  const [name, setName] = useState('');
  const [type, setType] = useState('bank');
  const [openingBalance, setOpeningBalance] = useState('');
  const [error, setError] = useState('');

  // Calculate the current balance of one account
  // Formula: opening balance + all income into it - all expenses from it
  function getCurrentBalance(account) {
    let balance = account.openingBalance;

    for (let i = 0; i < transactions.length; i++) {
      const transaction = transactions[i];

      if (transaction.account === account.id) {
        if (transaction.type === 'income') {
          balance = balance + transaction.amount;
        } else {
          balance = balance - transaction.amount;
        }
      }
    }

    return balance;
  }

  // Find the icon for an account type
  function getTypeIcon(typeId) {
    for (let i = 0; i < ACCOUNT_TYPES.length; i++) {
      if (ACCOUNT_TYPES[i].id === typeId) {
        return ACCOUNT_TYPES[i].icon;
      }
    }
    return '💵';
  }

  // Find the label for an account type
  function getTypeLabel(typeId) {
    for (let i = 0; i < ACCOUNT_TYPES.length; i++) {
      if (ACCOUNT_TYPES[i].id === typeId) {
        return ACCOUNT_TYPES[i].label;
      }
    }
    return typeId;
  }

  // Calculate total balance across all accounts
  function getTotalBalance() {
    let total = 0;
    for (let i = 0; i < accounts.length; i++) {
      total = total + getCurrentBalance(accounts[i]);
    }
    return total;
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!name) {
      setError('Please enter an account name.');
      return;
    }

    if (openingBalance === '') {
      setError('Please enter an opening balance (use 0 if none).');
      return;
    }

    // Use timestamp + type to make a unique id for matching transactions
    const newAccount = {
      id: type + '_' + String(Date.now()),
      name: name,
      type: type,
      openingBalance: Number(openingBalance),
    };

    addAccount(newAccount);

    setName('');
    setType('bank');
    setOpeningBalance('');
  }

  const totalBalance = getTotalBalance();

  return (
    <div className={styles.page}>

      {/* Total balance across all accounts */}
      <div className={styles.banner}>
        <p className={styles.bannerLabel}>Net Worth Across All Accounts</p>
        <p className={styles.bannerAmount}>₹{totalBalance.toLocaleString()}</p>
      </div>

      {/* Add Account Form */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Add Account</h2>

        <form onSubmit={handleSubmit} className={styles.form}>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Account Name</label>
              <input
                type="text"
                placeholder="e.g. HDFC Savings, Wallet"
                value={name}
                onChange={function(e) { setName(e.target.value); }}
              />
            </div>

            <div className={styles.field}>
              <label>Account Type</label>
              <select
                value={type}
                onChange={function(e) { setType(e.target.value); }}
              >
                {ACCOUNT_TYPES.map(function(acc) {
                  return (
                    <option key={acc.id} value={acc.id}>
                      {acc.icon} {acc.label}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label>Opening Balance (₹)</label>
            <input
              type="number"
              placeholder="Enter current balance in this account (or 0)"
              value={openingBalance}
              onChange={function(e) { setOpeningBalance(e.target.value); }}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitBtn}>
            + Add Account
          </button>
        </form>
      </div>

      {/* Accounts List */}
      <div className={styles.accountsGrid}>

        {accounts.length === 0 && (
          <div className={styles.emptyCard}>
            <p className={styles.empty}>No accounts yet. Add one above!</p>
          </div>
        )}

        {accounts.map(function(account) {
          const currentBalance = getCurrentBalance(account);
          const typeIcon = getTypeIcon(account.type);
          const typeLabel = getTypeLabel(account.type);

          let balanceClass = styles.balancePositive;
          if (currentBalance < 0) {
            balanceClass = styles.balanceNegative;
          }

          return (
            <div key={account.id} className={styles.accountCard}>

              <div className={styles.accountTop}>
                <div className={styles.accountIcon}>{typeIcon}</div>
                <button
                  className={styles.deleteBtn}
                  onClick={function() { deleteAccount(account.id); }}
                >
                  🗑
                </button>
              </div>

              <p className={styles.accountName}>{account.name}</p>
              <p className={styles.accountType}>{typeLabel}</p>

              <p className={`${styles.accountBalance} ${balanceClass}`}>
                ₹{currentBalance.toLocaleString()}
              </p>

              <p className={styles.openingNote}>
                Opening: ₹{account.openingBalance.toLocaleString()}
              </p>

            </div>
          );
        })}

      </div>

    </div>
  );
}