/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import heroBg from '../../../assets/fintech_hero_clean.jpg';
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
  MagnifyingGlassIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [activeNav, setActiveNav] = useState('features');

  function goToAuth(mode) {
    navigate('/login', { state: { mode: mode } });
  }

  function handleNavClick(sectionId) {
    setActiveNav(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <div className={styles.landingContainer}>

      {/* Subtle Ambient Tech Spotlight & Grid (Clean, Modern, No Blobs) */}
      <div className={styles.ambientGlow} />
      <div className={styles.gridOverlay} />

            {/* Balanced Background Image Layer */}
      <div className={styles.bgImageWrapper}>
        <img src={heroBg} alt="Finance Background" className={styles.bgImage} />
        <div className={styles.bgOverlay} />
      </div>

      {/* HeroUI Pro Floating Pill Navbar */}
      <header className={styles.headerWrapper}>
        <nav className={styles.floatingNavbar}>
          
          {/* Left: Brand Identity */}
          <div className={styles.brand} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className={styles.brandLogoBox}>
              <WalletIcon className={styles.brandIcon} />
            </div>
            <span className={styles.brandName}>SpendWise</span>
          </div>

          {/* Center: Navigation Links */}
          <div className={styles.navLinks}>
            <button
              className={`${styles.navLink} ${activeNav === 'features' ? styles.activeNavLink : ''}`}
              onClick={() => handleNavClick('features')}
            >
              Features
            </button>
            <button
              className={`${styles.navLink} ${activeNav === 'budgeting' ? styles.activeNavLink : ''}`}
              onClick={() => handleNavClick('budgeting')}
            >
              Budgeting
            </button>
            <button
              className={`${styles.navLink} ${activeNav === 'bills' ? styles.activeNavLink : ''}`}
              onClick={() => handleNavClick('bills')}
            >
              Track Bills
            </button>
            <button
              className={`${styles.navLink} ${activeNav === 'accounts' ? styles.activeNavLink : ''}`}
              onClick={() => handleNavClick('accounts')}
            >
              Accounts
            </button>
          </div>

          {/* Right: Search, Notifications, Theme & Auth */}
          <div className={styles.navRight}>
            
            {/* <button
              className={styles.iconActionBtn}
              title="Search"
              onClick={() => goToAuth('login')}
            >
              <MagnifyingGlassIcon className={styles.navIcon} />
            </button> */}

            {/* <button
              className={styles.iconActionBtn}
              title="Notifications"
              onClick={() => goToAuth('login')}
            >
              <BellIcon className={styles.navIcon} />
              <span className={styles.notificationDot} />
            </button> */}

            <button
              className={styles.iconActionBtn}
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

      {/* Main Hero Section */}
      <main className={styles.heroSection}>

        {/* HeroUI Pill Chip */}
        <div className={styles.heroChip}>
          <SparklesIcon className={styles.chipSparkle} />
          <span>Personal Finance, Simplified</span>
        </div>

        {/* High-Impact Punchline */}
        <h1 className={styles.headline}>
          Managing expenses can be troublesome.
          <br />
          <span className={styles.gradientHeading}>Let's change that.</span>
        </h1>

        <p className={styles.subheadline}>
          Take full control of every rupee. Track daily spending, anticipate upcoming bills before they're overdue, and protect your budget with confidence — all in one modern dashboard.
        </p>

        {/* Action Buttons */}
        <div className={styles.ctaGroup}>
          <button className={styles.primaryPillBtn} onClick={() => goToAuth('register')}>
            <span>Create Account — It's Free</span>
            <ArrowRightIcon className={styles.btnArrow} />
          </button>

          <button className={styles.secondaryPillBtn} onClick={() => goToAuth('login')}>
            Already have an account? <strong>Log in</strong>
          </button>
        </div>

        {/* HeroUI Frosted Glass Feature Cards Grid */}
        <div id="features" className={styles.featureGrid}>

          <div className={styles.heroCard} id="budgeting">
            <div className={`${styles.cardIconWrap} ${styles.greenGlow}`}>
              <ShieldCheckIcon className={styles.cardSvg} />
            </div>
            <h3 className={styles.cardTitle}>Budget with Precision</h3>
            <p className={styles.cardDescription}>
              Know exactly how much you can safely spend each day without accidentally blowing your monthly limit.
            </p>
          </div>

          <div className={styles.heroCard} id="bills">
            <div className={`${styles.cardIconWrap} ${styles.blueGlow}`}>
              <ClockIcon className={styles.cardSvg} />
            </div>
            <h3 className={styles.cardTitle}>Never Miss a Due Date</h3>
            <p className={styles.cardDescription}>
              Track every recurring bill and subscription in one spot with automatic alerts before late fees hit.
            </p>
          </div>

          <div className={styles.heroCard} id="accounts">
            <div className={`${styles.cardIconWrap} ${styles.amberGlow}`}>
              <BuildingLibraryIcon className={styles.cardSvg} />
            </div>
            <h3 className={styles.cardTitle}>All Accounts, One Balance</h3>
            <p className={styles.cardDescription}>
              Combine your Cash, Bank accounts, Credit Cards, and UPI into a single real-time net worth total
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
          <p>© 2026 SpendWise. Modern full-stack expense tracking App.</p>
        </div>
      </footer>

    </div>
  );
}
