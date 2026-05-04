import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Left sidebar with navigation links
export default function Sidebar() {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();

  // Navigation items — "Users" only shows for admins
  const navItems = [
    { path: '/',         label: 'Dashboard', icon: '📊' },
    { path: '/projects', label: 'Projects',  icon: '📁' },
    { path: '/tasks',    label: 'My Tasks',  icon: '✅' },
    ...(isAdmin ? [{ path: '/users', label: 'Users', icon: '👥' }] : []),
  ];

  // Get user initials for avatar (e.g., "John Doe" → "JD")
  const initials = user?.name
    ?.split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">✓</div>
        <h2>TaskManager</h2>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User info + Logout */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
        </div>
        <button className="btn btn-ghost" onClick={logout} style={{width: '100%', marginTop: '8px'}}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
