/* eslint-disable no-unused-vars */
import React, { createContext, useContext, useState } from 'react';

const ExpenseContext = createContext();

export function ExpenseProvider({ children }) {

  // Load transactions from browser memory, or start with empty list
  const [transactions, setTransactions] = useState(function() {
    const saved = localStorage.getItem('transactions');
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  });

  // Load bills from browser memory, or start with empty list
  const [bills, setBills] = useState(function() {
    const saved = localStorage.getItem('bills');
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  });

  // Load accounts from browser memory, or start with empty list
  const [accounts, setAccounts] = useState(function() {
    const saved = localStorage.getItem('accounts');
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  });

  // Load monthly budget limit from browser memory, or default to 0
  const [monthlyBudget, setMonthlyBudget] = useState(function() {
    const saved = localStorage.getItem('budget');
    if (saved) {
      return Number(saved);
    }
    return 0;
  });

  // Add a new income or expense transaction
  function addTransaction(newTransaction) {
    // NOTE: [...transactions] means "copy all old items into a new list"
    // then add the new one at the front
    const updatedList = [newTransaction, ...transactions];
    setTransactions(updatedList);
    localStorage.setItem('transactions', JSON.stringify(updatedList));
  }

  // Remove a transaction by matching its id
  function deleteTransaction(id) {
    const updatedList = transactions.filter(function(item) {
      return item.id !== id;
    });
    setTransactions(updatedList);
    localStorage.setItem('transactions', JSON.stringify(updatedList));
  }

  // Add a new bill
  function addBill(newBill) {
    const updatedList = [newBill, ...bills];
    setBills(updatedList);
    localStorage.setItem('bills', JSON.stringify(updatedList));
  }

  // Delete a bill by its id
  function deleteBill(id) {
    const updatedList = bills.filter(function(item) {
      return item.id !== id;
    });
    setBills(updatedList);
    localStorage.setItem('bills', JSON.stringify(updatedList));
  }

  // Change the status of a bill (e.g. from 'unpaid' to 'paid')
  function updateBillStatus(id, newStatus) {
    const updatedList = bills.map(function(bill) {
      if (bill.id === id) {
        // NOTE: {...bill, status: newStatus} means "copy all bill fields,
        // but replace only the status field with the new value"
        return { ...bill, status: newStatus };
      }
      return bill;
    });
    setBills(updatedList);
    localStorage.setItem('bills', JSON.stringify(updatedList));
  }

  // Add a new account (cash, bank, etc.)
  function addAccount(newAccount) {
    const updatedList = [newAccount, ...accounts];
    setAccounts(updatedList);
    localStorage.setItem('accounts', JSON.stringify(updatedList));
  }

  // Delete an account by its id
  function deleteAccount(id) {
    const updatedList = accounts.filter(function(item) {
      return item.id !== id;
    });
    setAccounts(updatedList);
    localStorage.setItem('accounts', JSON.stringify(updatedList));
  }

  // Save the monthly spending limit
  function saveBudget(amount) {
    setMonthlyBudget(amount);
    localStorage.setItem('budget', amount);
  }

  return (
    <ExpenseContext.Provider value={{
      transactions,
      bills,
      accounts,
      monthlyBudget,
      addTransaction,
      deleteTransaction,
      addBill,
      deleteBill,
      updateBillStatus,
      addAccount,
      deleteAccount,
      saveBudget,
    }}>
      {children}
    </ExpenseContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useExpense() {
  return useContext(ExpenseContext);
}