import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar.jsx';
import Header from '../../components/layout/Header.jsx';
import IncomePage from '../income/IncomePage.jsx';
import ExpensesPage from '../expenses/ExpensesPage.jsx';
import BillsPage from '../bills/BillsPage.jsx';
import HomePage from './HomePage.jsx';
import styles from './DashboardPage.module.css';

function Placeholder({ page }) {
  return (
    <div>
      <p>You are on: <strong>{page}</strong></p>
      <p>Content coming next...</p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className={styles.layout}>
      <Sidebar />

      <div className={styles.main}>
        <Header />

        <div className={styles.content}>
          <Routes>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<HomePage />} />
            <Route path="income" element={<IncomePage />} />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="bills" element={<BillsPage />} />
            <Route path="accounts"  element={<Placeholder page="Accounts" />} />
            <Route path="budget"    element={<Placeholder page="Budget" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}