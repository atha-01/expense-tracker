/* eslint-disable no-unused-vars */
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from '../../components/layout/Header.jsx';
import ExpensesPage from '../expenses/ExpensesPage.jsx';
import BillsPage from '../bills/BillsPage.jsx';
import HomePage from './Homepage.jsx';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  return (
    <div className={styles.layout}>
      {/* Top Floating Navbar (HeroUI Pro Style) */}
      <Header />

      {/* Main Full-Width Content Container */}
      <main className={styles.main}>
        <div className={styles.content}>
          <Routes>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<HomePage />} />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="bills" element={<BillsPage />} />
            {/* Redirect old tabs back to home dashboard */}
            <Route path="income" element={<Navigate to="../home" replace />} />
            <Route path="accounts" element={<Navigate to="../home" replace />} />
            <Route path="budget" element={<Navigate to="../home" replace />} />
            <Route path="*" element={<Navigate to="../home" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}