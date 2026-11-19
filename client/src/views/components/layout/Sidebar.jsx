import { useState } from 'react';
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

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.top}>
        <div className={styles.logo}>
          {collapsed ? '💰' : '💰 SpendWise'}
        </div>
        <button className={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav className={styles.nav}>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.icon}>{item.icon}</span>
            {!collapsed && <span className={styles.label}>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <button className={styles.logoutBtn} onClick={handleLogout}>
        <span>🚪</span>
        {!collapsed && <span>Logout</span>}
      </button>
    </aside>
  );
}