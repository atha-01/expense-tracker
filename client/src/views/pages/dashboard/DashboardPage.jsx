import   { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar.jsx';
import Header from '../../components/layout/Header.jsx';
import IncomePage from '../income/IncomePage.jsx';
import ExpensesPage from '../expenses/ExpensesPage.jsx';
import BillsPage from '../bills/BillsPage.jsx';
import AccountsPage from '../accounts/AccountsPage.jsx';
import BudgetPage from '../budget/BudgetPage';
import HomePage from './Homepage.jsx';
import styles from './DashboardPage.module.css';

// function Placeholder({ page }) {
//   return (
//     <div>
//       <p>You are on: <strong>{page}</strong></p>
//       <p>Content coming next...</p>
//     </div>
//   );
// }

export default function DashboardPage() {

      const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  function openSidebar() {
    setIsSidebarOpen(true);
  }
  function closeSidebar() {
    setIsSidebarOpen(false);
  }



  return (
    
    <div className={styles.layout}>
      {/* Dark overlay — only visible on mobile when sidebar is open */}
      {isSidebarOpen && (
        <div className={styles.overlay} onClick={closeSidebar} />
      )}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className={styles.main}>
        <Header onMenuOpen={openSidebar} />
        <div className={styles.content}>
          <Routes>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<HomePage />} />
            <Route path="income" element={<IncomePage />} />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="bills" element={<BillsPage />} />
            <Route path="accounts" element={<AccountsPage />} />
            <Route path="budget" element={<BudgetPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}