import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './controllers/AuthContext.jsx';
import ProtectedRoute from './controllers/ProtectedRoute.jsx';
import LandingPage from './views/pages/landing/LandingPage.jsx';
import AuthPage from './views/pages/auth/AuthPage.jsx';
import DashboardPage from './views/pages/dashboard/DashboardPage.jsx';

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Starting URL shows the Landing Page */}
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />}
      />

      {/* Login & Register Page */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />}
      />

      {/* Protected Dashboard */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all sends visitors to the home landing page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}