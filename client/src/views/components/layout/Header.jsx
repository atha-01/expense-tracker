import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../controllers/ThemeContext';
import { useAuth } from '../../../controllers/AuthContext';
import {
  WalletIcon,
  HomeIcon,
  ReceiptPercentIcon,
  DocumentTextIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import styles from './Header.module.css';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Logout modal state
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  function handleConfirmLogout() {
    setShowLogoutModal(false);
    logout();
    navigate('/login');
  }

  const userInitial = user && user.name ? user.name.charAt(0).toUpperCase() : 'U';
  const userName = user && user.name ? user.name : 'Account';

  return (
    <>
      <header className={styles.headerWrapper}>
        <nav className={styles.floatingNavbar}>
          
          {/* Left: SpendWise Brand */}
          <div className={styles.brand} onClick={() => navigate('/dashboard/home')}>
            <div className={styles.brandLogoBox}>
              <WalletIcon className={styles.brandIcon} />
            </div>
            <span className={styles.brandName}>SpendWise</span>
          </div>

          {/* Center: Main Navigation Tabs (Dashboard, Expenses, Bills) */}
          <div className={styles.navLinks}>
            <NavLink
              to="/dashboard/home"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`
              }
            >
              <HomeIcon className={styles.navLinkSvg} />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/dashboard/expenses"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`
              }
            >
              <ReceiptPercentIcon className={styles.navLinkSvg} />
              <span>Expenses</span>
            </NavLink>

            <NavLink
              to="/dashboard/bills"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`
              }
            >
              <DocumentTextIcon className={styles.navLinkSvg} />
              <span>Bills</span>
            </NavLink>
          </div>

          {/* Right: Theme Toggle, User Profile & Logout */}
          <div className={styles.navRight}>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? (
                <MoonIcon className={styles.actionSvg} />
              ) : (
                <SunIcon className={styles.actionSvg} />
              )}
            </button>

            {user && (
              <div className={styles.userBadge} title={`Signed in as ${userName}`}>
                <div className={styles.avatar}>{userInitial}</div>
                <span className={styles.userName}>{userName}</span>
              </div>
            )}

            {/* Opens the translucent confirmation modal */}
            <button
              type="button"
              className={styles.logoutBtn}
              onClick={() => setShowLogoutModal(true)}
              title="Log Out"
            >
              <ArrowRightOnRectangleIcon className={styles.actionSvg} />
              <span className={styles.logoutText}>Logout</span>
            </button>
          </div>

        </nav>
      </header>

      {/* Translucent Frosted Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className={styles.modalOverlay} onClick={() => setShowLogoutModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIconWrap}>
              <ExclamationTriangleIcon className={styles.modalAlertIcon} />
            </div>

            <h3 className={styles.modalHeading}>Log Out of SpendWise?</h3>
            <p className={styles.modalText}>
              Are you sure you want to log out? You will need to sign back in with your password to view your accounts and budgets.
            </p>

            <div className={styles.modalBtnGroup}>
              <button
                type="button"
                className={styles.modalCancelBtn}
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalConfirmBtn}
                onClick={handleConfirmLogout}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}