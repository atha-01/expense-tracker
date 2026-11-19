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

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();

  const currentPage = location.pathname.split('/').pop();
  const title = pageTitles[currentPage] || 'Dashboard';

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>

      <div className={styles.right}>
        <button className={styles.themeBtn} onClick={toggleTheme}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        <div className={styles.userBadge}>
          <div className={styles.avatar}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span className={styles.userName}>{user.name}</span>
        </div>
      </div>
    </header>
  );
}