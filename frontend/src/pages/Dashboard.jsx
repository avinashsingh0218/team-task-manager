import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Loader from '../components/Loader';
import { isOverdue } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats]     = useState(null);
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    Promise.all([
      api.get('/api/dashboard/stats'),
      api.get('/api/tasks/')
    ])
      .then(([statsRes, tasksRes]) => {
        setStats(statsRes.data);
        setTasks(tasksRes.data.slice(0, 5));  // show only 5 recent tasks
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/api/tasks/${taskId}/status`, { status: newStatus });
      toast.success('Status updated');
      fetchData(); // refresh data so stats update too
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update status');
    }
  };

  if (loading) return <Loader />;

  const statCards = [
    { label: 'Total Tasks',  value: stats?.total_tasks || 0,  color: 'indigo', icon: '📋' },
    { label: 'To Do',        value: stats?.todo || 0,         color: 'blue',   icon: '📝' },
    { label: 'In Progress',  value: stats?.in_progress || 0,  color: 'yellow', icon: '⏳' },
    { label: 'Done',         value: stats?.done || 0,         color: 'green',  icon: '✅' },
    { label: 'Overdue',      value: stats?.overdue || 0,      color: 'red',    icon: '⚠️' },
  ];

  return (
    <div>
      {/* Stat Cards */}
      <div className="stat-cards">
        {statCards.map((card) => (
          <div key={card.label} className={`stat-card ${card.color}`}>
            <div>
              <div className="stat-value">{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </div>
            <div className="stat-icon">{card.icon}</div>
          </div>
        ))}
      </div>

      {/* Admin-only: Projects and Users counts */}
      {isAdmin && stats?.total_projects !== null && (
        <div className="stat-cards" style={{ marginBottom: 32 }}>
          <div className="stat-card indigo">
            <div>
              <div className="stat-value">{stats.total_projects}</div>
              <div className="stat-label">Total Projects</div>
            </div>
            <div className="stat-icon">📁</div>
          </div>
          <div className="stat-card blue">
            <div>
              <div className="stat-value">{stats.total_users}</div>
              <div className="stat-label">Team Members</div>
            </div>
            <div className="stat-icon">👥</div>
          </div>
        </div>
      )}

      {/* Recent Tasks Table */}
      <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: 16 }}>Recent Tasks</h2>
      {tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No tasks yet</h3>
          <p>Create a project and add tasks to see them here.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {task.title}
                  </td>
                  <td>
                    <select
                      className="form-select"
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      style={{ width: 'auto', minWidth: 130, padding: '6px 30px 6px 10px', fontSize: '0.8rem' }}
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </td>
                  <td>
                    <span className={`badge badge-${task.priority}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td style={isOverdue(task.due_date, task.status) ? { color: '#ff4d4f', fontWeight: 'bold' } : {}}>
                    {task.due_date || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
