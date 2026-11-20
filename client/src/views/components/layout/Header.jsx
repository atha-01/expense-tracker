/* eslint-disable no-unused-vars */
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../../controllers/ThemeContext';
import { useAuth } from '../../../controllers/AuthContext';
import styles from './Header.module.css';

const pageTitles = {
  home:     'Dashboard',
  income:   'Income',
  expenses: 'Expenses',
  bills:    'Bills',
  accounts: 'Accounts',
  budget:   'Budget',
};

export default function Header({ onMenuOpen }) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();

  const currentPage = location.pathname.split('/').pop();
  const title = pageTitles[currentPage] || 'Dashboard';

  // Safely get user initial and name (won't crash if user or user.name is missing)
  const userInitial = user && user.name ? user.name.charAt(0).toUpperCase() : '?';
  const userName = user && user.name ? user.name : 'User';

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button className={styles.hamburger} onClick={onMenuOpen}>
          ☰
        </button>
        <h1 className={styles.title}>{title}</h1>
      </div>

      <div className={styles.right}>
        <button className={styles.themeBtn} onClick={toggleTheme}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {user && (
          <div className={styles.userBadge}>
            <div className={styles.avatar}>
              {userInitial}
            </div>
            <span className={styles.userName}>{userName}</span>
          </div>
        )}
      </div>
    </header>
  );
}
