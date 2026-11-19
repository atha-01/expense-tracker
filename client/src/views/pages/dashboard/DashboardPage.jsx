import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
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
            <Route path="home"      element={<Placeholder page="Dashboard" />} />
            <Route path="income"    element={<Placeholder page="Income" />} />
            <Route path="expenses"  element={<Placeholder page="Expenses" />} />
            <Route path="bills"     element={<Placeholder page="Bills" />} />
            <Route path="accounts"  element={<Placeholder page="Accounts" />} />
            <Route path="budget"    element={<Placeholder page="Budget" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}