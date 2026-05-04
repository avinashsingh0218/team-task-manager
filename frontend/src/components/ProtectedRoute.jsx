import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

// Wraps routes that need the user to be logged in
// If not logged in → redirect to /login
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;       // still checking token
  if (!user)   return <Navigate to="/login" replace />;

  return children;
}
