/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import{ createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ExpenseContext = createContext();

export function ExpenseProvider({ children }) {
  const { user } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [bills, setBills] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState(0);

  // Helper to create the Authorization header with the user's JWT token

  
  function getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (user && user.token) {
      headers['Authorization'] = 'Bearer ' + user.token;
    }
    return headers;
  }

  // Load all user data from the database whenever the user logs in



  useEffect(function() {
    if (!user || !user.token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTransactions([]);
      setBills([]);
      setAccounts([]);
      setMonthlyBudget(0);
      return;
    }

    const headers = getAuthHeaders();

    // 1. Fetch transactions
    fetch('http://localhost:5000/api/transactions', { headers: headers })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (Array.isArray(data)) {
          const formatted = data.map(function(item) {
            return { ...item, id: item._id };
          });
          setTransactions(formatted);
        }
      })
      .catch(function(err) { console.error('Error fetching transactions:', err); });

    // 2. Fetch bills
    fetch('http://localhost:5000/api/bills', { headers: headers })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (Array.isArray(data)) {
          const formatted = data.map(function(item) {
            return { ...item, id: item._id };
          });
          setBills(formatted);
        }
      })
      .catch(function(err) { console.error('Error fetching bills:', err); });

    // 3. Fetch accounts
    fetch('http://localhost:5000/api/accounts', { headers: headers })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (Array.isArray(data)) {
          const formatted = data.map(function(item) {
            return { ...item, id: item._id };
          });
          setAccounts(formatted);
        }
      })
      .catch(function(err) { console.error('Error fetching accounts:', err); });

    // 4. Fetch budget
    fetch('http://localhost:5000/api/budget', { headers: headers })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data && data.monthlyLimit !== undefined) {
          setMonthlyBudget(data.monthlyLimit);
        }
      })
      .catch(function(err) { console.error('Error fetching budget:', err); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);



  // Transactions (Income / Expense)



  async function addTransaction(newTransaction) {
    try {
      const response = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newTransaction),
      });
      const savedData = await response.json();
      const itemWithId = { ...savedData, id: savedData._id };

      setTransactions(function(prev) {
        return [itemWithId, ...prev];
      });
    } catch (err) {
      console.error('Error adding transaction:', err);
    }
  }
  async function updateTransaction(id, updatedFields) {
    try {
      const response = await fetch('http://localhost:5000/api/transactions/' + id, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedFields),
      });

      // If the server returned an error, DO NOT overwrite the transaction with error text!
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Update failed:', errorData.message);
        return;
      }

      const savedData = await response.json();
      const itemWithId = { ...savedData, id: savedData._id };

      setTransactions(function(prev) {
        return prev.map(function(item) {
          if (item.id === id) {
            return itemWithId;
          }
          return item;
        });
      });
    } catch (err) {
      console.error('Error updating transaction:', err);
    }
  }

  async function deleteTransaction(id) {
    try {
      await fetch('http://localhost:5000/api/transactions/' + id, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      setTransactions(function(prev) {
        return prev.filter(function(item) {
          return item.id !== id;
        });
      });
    } catch (err) {
      console.error('Error deleting transaction:', err);
    }
  }

  // --------------------------------------------------------------------------
  // Bills
  // --------------------------------------------------------------------------
  async function addBill(newBill) {
    try {
      const response = await fetch('http://localhost:5000/api/bills', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newBill),
      });
      const savedData = await response.json();
      const itemWithId = { ...savedData, id: savedData._id };

      setBills(function(prev) {
        return [itemWithId, ...prev];
      });
    } catch (err) {
      console.error('Error adding bill:', err);
    }
  }

  async function updateBillStatus(id, newStatus) {
    try {
      const response = await fetch('http://localhost:5000/api/bills/' + id, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      const updatedData = await response.json();

      setBills(function(prev) {
        return prev.map(function(bill) {
          if (bill.id === id) {
            return { ...updatedData, id: updatedData._id };
          }
          return bill;
        });
      });
    } catch (err) {
      console.error('Error updating bill:', err);
    }
  }

  async function deleteBill(id) {
    try {
      await fetch('http://localhost:5000/api/bills/' + id, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      setBills(function(prev) {
        return prev.filter(function(bill) {
          return bill.id !== id;
        });
      });
    } catch (err) {
      console.error('Error deleting bill:', err);
    }
  }

  // --------------------------------------------------------------------------
  // Accounts
  // --------------------------------------------------------------------------
  async function addAccount(newAccount) {
    try {
      const response = await fetch('http://localhost:5000/api/accounts', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newAccount),
      });
      const savedData = await response.json();
      const itemWithId = { ...savedData, id: savedData._id };

      setAccounts(function(prev) {
        return [itemWithId, ...prev];
      });
    } catch (err) {
      console.error('Error adding account:', err);
    }
  }

  async function deleteAccount(id) {
    try {
      await fetch('http://localhost:5000/api/accounts/' + id, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      setAccounts(function(prev) {
        return prev.filter(function(account) {
          return account.id !== id;
        });
      });
    } catch (err) {
      console.error('Error deleting account:', err);
    }
  }
    async function editAccount(id, updatedData) {
    try {
      const response = await fetch('http://localhost:5000/api/accounts/' + id, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedData),
      });
      const savedData = await response.json();
      const itemWithId = { ...savedData, id: savedData._id };

      setAccounts(function(prev) {
        return prev.map(function(acc) {
          if (acc.id === id) {
            return itemWithId;
          }
          return acc;
        });
      });
    } catch (err) {
      console.error('Error updating account:', err);
    }
  }


  // --------------------------------------------------------------------------
  // Budget
  // --------------------------------------------------------------------------
  async function saveBudget(amount) {
    try {
      const response = await fetch('http://localhost:5000/api/budget', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ monthlyLimit: amount }),
      });
      const savedData = await response.json();
      setMonthlyBudget(savedData.monthlyLimit);
    } catch (err) {
      console.error('Error saving budget:', err);
    }
  }

     return (
    <ExpenseContext.Provider
      value={{
        transactions,
        bills,
        accounts,
        monthlyBudget,
        addTransaction,
        updateTransaction,
        editTransaction: updateTransaction,
        deleteTransaction,
        addBill,
        updateBillStatus,
        deleteBill,
        addAccount,
        editAccount,
        deleteAccount,
        saveBudget,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useExpense() {
  return useContext(ExpenseContext);
}