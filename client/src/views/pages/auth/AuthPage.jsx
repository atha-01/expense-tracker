/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../controllers/AuthContext';
import { useTheme } from '../../../controllers/ThemeContext';
import heroBg from '../../../assets/fintech_hero_clean.jpg';
import {
  WalletIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  SunIcon,
  MoonIcon,
  ExclamationCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import styles from './AuthPage.module.css';

export default function AuthPage() {
  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if routed with 'register' or default to login
  const startAsLogin = !(location.state && location.state.mode === 'register');
  const [isLogin, setIsLogin] = useState(startAsLogin);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!isLogin && !formData.name) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login({
          email: formData.email,
          password: formData.password,
        });
      } else {
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.authContainer}>
      {/* Background Image Layer (Matching Landing Page) */}
      <div className={styles.bgImageWrapper}>
        <img src={heroBg} alt="Finance Background" className={styles.bgImage} />
        <div className={styles.bgOverlay} />
      </div>
      <div className={styles.gridOverlay} />

      {/* Floating Top Corner Controls (No Navbar) */}
      <div className={styles.topBar}>
        <button
          className={styles.backBtn}
          onClick={() => navigate('/')}
          title="Back to Landing Page"
        >
          <ArrowLeftIcon className={styles.cornerIcon} />
          <span>Back to Home</span>
        </button>

        <button
          className={styles.themeToggleBtn}
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? (
            <MoonIcon className={styles.cornerIcon} />
          ) : (
            <SunIcon className={styles.cornerIcon} />
          )}
        </button>
      </div>

      {/* HeroUI Frosted Glass Authentication Card */}
      <main className={styles.cardWrapper}>
        <div className={styles.authCard}>

          {/* Brand Identity */}
          <div className={styles.brandHeader} onClick={() => navigate('/')}>
            <div className={styles.brandLogoBox}>
              <WalletIcon className={styles.brandIcon} />
            </div>
            <span className={styles.brandName}>SpendWise</span>
          </div>

          {/* Pill Segment Mode Switcher */}
          <div className={styles.modePillGroup}>
            <button
              type="button"
              className={`${styles.modePill} ${isLogin ? styles.activePill : ''}`}
              onClick={() => { setIsLogin(true); setError(''); }}
            >
              Log In
            </button>
            <button
              type="button"
              className={`${styles.modePill} ${!isLogin ? styles.activePill : ''}`}
              onClick={() => { setIsLogin(false); setError(''); }}
            >
              Create Account
            </button>
          </div>

          {/* Header Typography */}
          <div className={styles.cardHeader}>
            <h1 className={styles.title}>
              {isLogin ? 'Welcome back' : 'Get started free'}
            </h1>
            <p className={styles.subtitle}>
              {isLogin
                ? 'Enter your credentials to access your dashboard'
                : 'Join SpendWise and take full control of your finances'}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className={styles.errorAlert}>
              <ExclamationCircleIcon className={styles.alertIcon} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className={styles.form}>
            {!isLogin && (
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Full Name</label>
                <div className={styles.inputWrapper}>
                  <UserIcon className={styles.inputIcon} />
                  <input
                    type="text"
                    name="name"
                    className={styles.textInput}
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Email Address</label>
              <div className={styles.inputWrapper}>
                <EnvelopeIcon className={styles.inputIcon} />
                <input
                  type="email"
                  name="email"
                  className={styles.textInput}
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <div className={styles.labelRow}>
                <label className={styles.fieldLabel}>Password</label>
              </div>
              <div className={styles.inputWrapper}>
                <LockClosedIcon className={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`${styles.textInput} ${styles.passwordInput}`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeSlashIcon className={styles.eyeIcon} />
                  ) : (
                    <EyeIcon className={styles.eyeIcon} />
                  )}
                </button>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              <span>{loading ? 'Please wait...' : isLogin ? 'Log In to Dashboard' : 'Create My Account'}</span>
              <ArrowRightIcon className={styles.btnArrow} />
            </button>
          </form>

          {/* Bottom Switch Link */}
          <div className={styles.bottomSwitch}>
            <p>
              {isLogin ? "Don't have an account yet?" : 'Already registered with us?'}
              <button
                type="button"
                className={styles.switchLink}
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
              >
                {isLogin ? 'Sign up for free' : 'Log in here'}
              </button>
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}