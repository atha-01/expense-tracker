import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './controllers/AuthContext.jsx';
import ProtectedRoute from './controllers/ProtectedRoute.jsx';
import AuthPage from './views/pages/auth/AuthPage.jsx';
import DashboardPage from './views/pages/dashboard/DashboardPage.jsx';

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />}
      />

      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}