import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    api.get('/api/users/')
      .then(res => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  // Toggle role: admin ↔ member
  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    if (!confirm(`Change this user's role to ${newRole}?`)) return;
    try {
      await api.patch(`/api/users/${userId}/role`, { role: newRole });
      toast.success(`Role changed to ${newRole}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to change role');
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="page-header">
        <h1>Users</h1>
        <span className="text-muted text-sm">{users.length} member{users.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  {u.name}
                  {u.id === currentUser?.id && (
                    <span className="text-muted text-sm" style={{ marginLeft: 8 }}>(you)</span>
                  )}
                </td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge badge-${u.role}`}>{u.role}</span>
                </td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    className={`btn btn-sm ${u.role === 'admin' ? 'btn-danger' : 'btn-primary'}`}
                    onClick={() => handleToggleRole(u.id, u.role)}
                    disabled={u.id === currentUser?.id}
                    title={u.id === currentUser?.id ? 'Cannot change your own role' : ''}
                  >
                    {u.role === 'admin' ? 'Demote to Member' : 'Promote to Admin'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
