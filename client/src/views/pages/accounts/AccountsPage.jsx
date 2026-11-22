/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useExpense } from '../../../controllers/ExpenseContext';
import IconSelect from '../../components/common/IconSelect';
import {
  BuildingLibraryIcon,
  BanknotesIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  ScaleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import styles from './AccountsPage.module.css';

// Account types paired with Heroicons
const accountTypeOptions = [
  { id: 'bank', label: 'Bank Account', Icon: BuildingLibraryIcon },
  { id: 'cash', label: 'Cash',         Icon: BanknotesIcon },
  { id: 'card', label: 'Credit Card',  Icon: CreditCardIcon },
  { id: 'upi',  label: 'UPI / Wallet', Icon: DevicePhoneMobileIcon },
];

export default function AccountsPage() {
  const { accounts, transactions, addAccount, deleteAccount } = useExpense();

  const [name, setName] = useState('');
  const [type, setType] = useState('bank');
  const [openingBalance, setOpeningBalance] = useState('');
  const [error, setError] = useState('');

  // Calculate live balance for an account
  function getCurrentBalance(account) {
    let balance = account.openingBalance;

    for (let i = 0; i < transactions.length; i++) {
      const transaction = transactions[i];

      if (transaction.account === account.id || transaction.account === account.type) {
        if (transaction.type === 'income') {
          balance = balance + Number(transaction.amount);
        } else {
          balance = balance - Number(transaction.amount);
        }
      }
    }

    return balance;
  }

  // Returns the Heroicon for an account type
  function renderTypeIcon(typeId) {
    const id = typeId ? typeId.toLowerCase() : '';
    let IconComp = BanknotesIcon;

    if (id === 'bank') IconComp = BuildingLibraryIcon;
    else if (id === 'card') IconComp = CreditCardIcon;
    else if (id === 'upi') IconComp = DevicePhoneMobileIcon;

    return (
      <div className={styles.accountIconBadge}>
        <IconComp className={styles.accountSvg} />
      </div>
    );
  }

  function getTypeLabel(typeId) {
    const found = accountTypeOptions.find(function(opt) { return opt.id === typeId; });
    return found ? found.label : typeId;
  }

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

      {/* Net Worth Banner */}
      <div className={styles.banner}>
        <div className={styles.bannerHeader}>
          <p className={styles.bannerLabel}>Net Worth Across All Accounts</p>
          <ScaleIcon className={styles.bannerIcon} />
        </div>
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

            {/* Custom Heroicon Account Dropdown */}
            <IconSelect
              label="Account Type"
              options={accountTypeOptions}
              value={type}
              onChange={setType}
            />
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

      {/* Accounts Grid */}
      <div className={styles.accountsGrid}>
        {accounts.length === 0 && (
          <div className={styles.emptyCard}>
            <p className={styles.empty}>No accounts yet. Add one above!</p>
          </div>
        )}

        {accounts.map(function(account) {
          const currentBalance = getCurrentBalance(account);
          const typeLabel = getTypeLabel(account.type);

          let balanceClass = styles.balancePositive;
          if (currentBalance < 0) {
            balanceClass = styles.balanceNegative;
          }

          return (
            <div key={account.id} className={styles.accountCard}>
              <div className={styles.accountTop}>
                {renderTypeIcon(account.type)}
                <button
                  className={styles.deleteBtn}
                  onClick={function() { deleteAccount(account.id); }}
                  title="Delete Account"
                >
                  <TrashIcon className={styles.trashSvg} />
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