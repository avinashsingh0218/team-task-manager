import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Loader from '../components/Loader';
import { isOverdue } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Tasks() {
  const { isAdmin } = useAuth();
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('');

  const fetchTasks = () => {
    const params = filter ? { status: filter } : {};
    api.get('/api/tasks/', { params })
      .then(res => setTasks(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTasks(); }, [filter]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/api/tasks/${taskId}/status`, { status: newStatus });
      toast.success('Status updated');
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update');
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="page-header">
        <h1>{isAdmin ? 'All Tasks' : 'My Tasks'}</h1>
      </div>

      <div className="filter-bar">
        <select className="form-select" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <span className="text-muted text-sm">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <h3>No tasks found</h3>
          <p>{isAdmin ? 'Create tasks from a project page.' : 'No tasks have been assigned to you yet.'}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{task.title}</td>
                  <td><span className={`badge badge-${task.priority}`}>{task.priority}</span></td>
                  <td>
                    <select
                      className="form-select"
                      value={task.status}
                      onChange={e => handleStatusChange(task.id, e.target.value)}
                      style={{ width: 'auto', minWidth: 130, padding: '6px 30px 6px 10px', fontSize: '0.8rem' }}
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </td>
                  <td>{task.assignee?.name || '—'}</td>
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
