import  { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../controllers/AuthContext';
import {
  HomeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  WalletIcon,
} from '@heroicons/react/24/outline';
import styles from './Sidebar.module.css';

const navItems = [
  { path: '/dashboard/home',     label: 'Dashboard', Icon: HomeIcon },
  { path: '/dashboard/income',   label: 'Income',    Icon: ArrowTrendingUpIcon },
  { path: '/dashboard/expenses', label: 'Expenses',  Icon: ArrowTrendingDownIcon },
  { path: '/dashboard/bills',    label: 'Bills',     Icon: DocumentTextIcon },
];

export default function Sidebar({ isOpen, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function handleNavClick() {
    if (onClose) {
      onClose();
    }
  }

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
          <WalletIcon className={styles.logoIcon} />
          {!collapsed && <span className={styles.logoText}>SpendWise</span>}
        </div>
        <button
          className={styles.collapseBtn}
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRightIcon className={styles.btnIcon} /> : <ChevronLeftIcon className={styles.btnIcon} />}
        </button>
      </div>

      <nav className={styles.nav}>
        {navItems.map(function(item) {
          const ItemIcon = item.Icon;
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
              <ItemIcon className={styles.icon} />
              {!collapsed && <span className={styles.label}>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
        <ArrowRightOnRectangleIcon className={styles.icon} />
        {!collapsed && <span>Logout</span>}
      </button>
    </aside>
  );
}