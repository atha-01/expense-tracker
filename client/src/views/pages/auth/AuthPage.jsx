import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../controllers/AuthContext';
import styles from './AuthPage.module.css';

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  function handleChange(e) {      // e is short for event
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }

    if (!isLogin && !formData.name) {
      setError('Please enter your name.');
      return;
    }

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
      setError(err.message);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>💰 SpendWise</div>
        <h2 className={styles.title}>
          {isLogin ? 'Welcome back' : 'Create your account'}
        </h2>
        <p className={styles.subtitle}>
          {isLogin ? 'Log in to manage your finances' : 'Start tracking your money today'}
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <div className={styles.field}>
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          )}

          <div className={styles.field}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className={styles.field}>
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitBtn}>
            {isLogin ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <p className={styles.toggle}>
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? ' Sign up' : ' Log in'}
          </span>
        </p>
      </div>
    </div>
  );
}