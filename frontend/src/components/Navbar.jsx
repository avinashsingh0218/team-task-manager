import { useAuth } from '../context/AuthContext';

// Top navigation bar — shows greeting and role badge
export default function Navbar() {
  const { user, isAdmin } = useAuth();

  // Get current time greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="navbar-greeting">
          {greeting}, <strong>{user?.name}</strong> 👋
        </span>
      </div>
      <div className="navbar-right">
        <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-member'}`}>
          {user?.role}
        </span>
      </div>
    </nav>
  );
}
