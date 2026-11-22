// import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../../controllers/ThemeContext';
import { useAuth } from '../../../controllers/AuthContext';
import { Bars3Icon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
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

  const userInitial = user && user.name ? user.name.charAt(0).toUpperCase() : '?';
  const userName = user && user.name ? user.name : 'User';

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button className={styles.hamburger} onClick={onMenuOpen} title="Open Menu">
          <Bars3Icon className={styles.headerIcon} />
        </button>
        <h1 className={styles.title}>{title}</h1>
      </div>

      <div className={styles.right}>
        <button
          className={styles.themeBtn}
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? (
            <MoonIcon className={styles.headerIcon} />
          ) : (
            <SunIcon className={styles.headerIcon} />
          )}
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