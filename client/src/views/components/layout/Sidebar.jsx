import  { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../controllers/AuthContext';
import styles from './Sidebar.module.css';

const navItems = [
  { path: '/dashboard/home',     label: 'Dashboard',  icon: '🏠' },
  { path: '/dashboard/income',   label: 'Income',     icon: '💰' },
  { path: '/dashboard/expenses', label: 'Expenses',   icon: '💸' },
  { path: '/dashboard/bills',    label: 'Bills',      icon: '🧾' },
  { path: '/dashboard/accounts', label: 'Accounts',   icon: '🏦' },
  { path: '/dashboard/budget',   label: 'Budget',     icon: '📊' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  // When a nav link is clicked on mobile, close the drawer
  function handleNavClick() {
    if (onClose) {
      onClose();
    }
  }

  // Build the sidebar class — add 'open' class on mobile when isOpen is true
  let sidebarClass = styles.sidebar;
  if (collapsed) {
    sidebarClass = sidebarClass + ' ' + styles.collapsed;
  }
  if (isOpen) {
    sidebarClass = sidebarClass + ' ' + styles.mobileOpen;
  }

  return (
    <aside className={sidebarClass}>
      <div className={styles.top}>
        <div className={styles.logo}>
          {collapsed ? '💰' : '💰 SpendWise'}
        </div>
        <button className={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav className={styles.nav}>
        {navItems.map(function(item) {
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={function({ isActive }) {
                if (isActive) {
                  return styles.navItem + ' ' + styles.active;
                }
                return styles.navItem;
              }}
            >
              <span className={styles.icon}>{item.icon}</span>
              {!collapsed && <span className={styles.label}>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <button className={styles.logoutBtn} onClick={handleLogout}>
        <span>🚪</span>
        {!collapsed && <span>Logout</span>}
      </button>
    </aside>
  );
}