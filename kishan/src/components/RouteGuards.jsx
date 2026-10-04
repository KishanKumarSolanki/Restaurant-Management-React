import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from './Spinner.jsx';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner className="py-40" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

// login ho chuke user ko login/register nahi dikhana
export function GuestRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner className="py-40" />;
  if (user) return <Navigate to="/home" replace />;
  return <Outlet />;
}
