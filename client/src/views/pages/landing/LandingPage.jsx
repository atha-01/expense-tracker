/* eslint-disable no-unused-vars */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../controllers/ThemeContext';
import {
  WalletIcon,
  SunIcon,
  MoonIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  ClockIcon,
  BuildingLibraryIcon,
  SparklesIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  function goToAuth(mode) {
    navigate('/login', { state: { mode: mode } });
  }

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <div className={styles.landingContainer}>

      {/* Ambient Animated Cash / Finance Backdrop */}
      <div className={styles.bgOverlay} />

      {/* HeroUI Pro Floating Pill Navbar */}
      <header className={styles.headerWrapper}>
        <nav className={styles.floatingNavbar}>
          
          {/* Left: Brand */}
          <div className={styles.brand}>
            <div className={styles.brandLogoBox}>
              <WalletIcon className={styles.brandIcon} />
            </div>
            <span className={styles.brandName}>SpendWise</span>
          </div>

          {/* Center: Navigation Links */}
          <div className={styles.navLinks}>
            <button className={styles.navLink} onClick={() => scrollToSection('features')}>
              Features
            </button>
            <button className={styles.navLink} onClick={() => scrollToSection('budgeting')}>
              Budgeting
            </button>
            <button className={styles.navLink} onClick={() => scrollToSection('bills')}>
              Bills Radar
            </button>
            <button className={styles.navLink} onClick={() => scrollToSection('accounts')}>
              Accounts
            </button>
          </div>

          {/* Right: Theme Toggle & Auth Buttons */}
          <div className={styles.navRight}>
            <button
              className={styles.themeToggleBtn}
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? (
                <MoonIcon className={styles.navIcon} />
              ) : (
                <SunIcon className={styles.navIcon} />
              )}
            </button>

            <button className={styles.loginBtn} onClick={() => goToAuth('login')}>
              Log In
            </button>

            <button className={styles.signUpPill} onClick={() => goToAuth('register')}>
              Sign Up
            </button>
          </div>

        </nav>
      </header>

      {/* Hero Section */}
      <main className={styles.heroSection}>

        {/* HeroUI Chip Badge */}
        <div className={styles.heroChip}>
          <SparklesIcon className={styles.chipSparkle} />
          <span>Personal Finance, Simplified</span>
        </div>

        {/* Punchline Headline */}
        <h1 className={styles.headline}>
          Managing expenses can be troublesome.
          <br />
          <span className={styles.gradientHeading}>Let's change that.</span>
        </h1>

        <p className={styles.subheadline}>
          Take full control of every rupee. Track daily spending, anticipate upcoming bills before they’re overdue, and protect your budget with confidence — all in one modern dashboard.
        </p>

        {/* Call-to-Action Group */}
        <div className={styles.ctaGroup}>
          <button className={styles.primaryPillBtn} onClick={() => goToAuth('register')}>
            <span>Create Account — It's Free</span>
            <ArrowRightIcon className={styles.btnArrow} />
          </button>

          <button className={styles.secondaryPillBtn} onClick={() => goToAuth('login')}>
            Already have an account? <strong>Log in</strong>
          </button>
        </div>

        {/* HeroUI Glassmorphic Feature Cards Grid */}
        <div id="features" className={styles.featureGrid}>

          <div className={styles.heroCard} id="budgeting">
            <div className={`${styles.cardIconWrap} ${styles.greenGlow}`}>
              <ShieldCheckIcon className={styles.cardSvg} />
            </div>
            <h3 className={styles.cardTitle}>Smart Budget Health</h3>
            <p className={styles.cardDescription}>
              Real-time financial speedometer calculates your safe daily burn rate and alerts you before you exceed your target.
            </p>
          </div>

          <div className={styles.heroCard} id="bills">
            <div className={`${styles.cardIconWrap} ${styles.blueGlow}`}>
              <ClockIcon className={styles.cardSvg} />
            </div>
            <h3 className={styles.cardTitle}>Upcoming Bills Radar</h3>
            <p className={styles.cardDescription}>
              Track paid and unpaid subscriptions with automatic overdue detection so late penalties never catch you off guard.
            </p>
          </div>

          <div className={styles.heroCard} id="accounts">
            <div className={`${styles.cardIconWrap} ${styles.amberGlow}`}>
              <BuildingLibraryIcon className={styles.cardSvg} />
            </div>
            <h3 className={styles.cardTitle}>Net Worth Ledger</h3>
            <p className={styles.cardDescription}>
              Unify Cash, Bank accounts, Credit Cards, and UPI in one live balance ledger with automatic transaction math.
            </p>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.brandSmall}>
            <WalletIcon className={styles.footerIcon} />
            <span>SpendWise</span>
          </div>
          <p>© 2026 SpendWise. Modern full-stack expense tracking built on MERN.</p>
        </div>
      </footer>

    </div>
  );
}