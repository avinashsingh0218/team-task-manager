import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

// Wraps admin-only routes (like Users management)
// If not admin → redirect back to dashboard
export default function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading)  return <Loader />;
  if (!user)    return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
}
