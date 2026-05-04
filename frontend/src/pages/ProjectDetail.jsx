import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import { isOverdue } from '../utils/helpers';

export default function ProjectDetail() {
  const { id } = useParams();  // project ID from URL
  const { isAdmin } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks]     = useState([]);
  const [users, setUsers]     = useState([]);    // for assignee dropdown
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('');     // status filter
  const [showModal, setShowModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');

  const [taskForm, setTaskForm] = useState({
    title: '', description: '', priority: 'medium',
    due_date: '', assigned_to: '',
  });

  // Fetch project details + tasks + users
  const fetchData = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/api/projects/${id}`),
        api.get(`/api/tasks/`, { params: { project_id: id, ...(filter && { status: filter }) } }),
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);

      // Fetch users only for admins (for the assignee dropdown)
      if (isAdmin) {
        const usersRes = await api.get('/api/users/');
        setUsers(usersRes.data);
      }
    } catch (err) {
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id, filter]);

  // Create a new task (Admin only)
  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/tasks/', {
        ...taskForm,
        project_id: parseInt(id),
        assigned_to: taskForm.assigned_to ? parseInt(taskForm.assigned_to) : null,
        due_date: taskForm.due_date || null,
      });
      toast.success('Task created!');
      setShowModal(false);
      setTaskForm({ title: '', description: '', priority: 'medium', due_date: '', assigned_to: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  // Update task status (any user for their own tasks)
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/api/tasks/${taskId}/status`, { status: newStatus });
      toast.success('Status updated');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update status');
    }
  };

  // Delete task (Admin only)
  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/api/tasks/${taskId}`);
      toast.success('Task deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  // Add member to project
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    try {
      await api.post(`/api/projects/${id}/members`, { user_id: parseInt(selectedUserId) });
      toast.success('Member added to project');
      setSelectedUserId('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add member');
    }
  };

  // Remove member from project
  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member from the project?')) return;
    try {
      await api.delete(`/api/projects/${id}/members/${userId}`);
      toast.success('Member removed');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to remove member');
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 8, fontSize: '0.85rem' }}>
        <Link to="/projects" style={{ color: 'var(--text-muted)' }}>Projects</Link>
        <span style={{ color: 'var(--text-muted)', margin: '0 8px' }}>›</span>
        <span style={{ color: 'var(--text-primary)' }}>{project?.name}</span>
      </div>

      <div className="page-header">
        <h1>{project?.name}</h1>
        <div className="flex gap-12">
          {isAdmin && (
            <button className="btn btn-secondary" onClick={() => setShowMembersModal(true)}>
              👥 Manage Members
            </button>
          )}
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              + Add Task
            </button>
          )}
        </div>
      </div>

      {project?.description && (
        <p className="text-muted text-sm" style={{ marginBottom: 24 }}>{project.description}</p>
      )}

      {/* Filter Bar */}
      <div className="filter-bar">
        <select
          className="form-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <span className="text-muted text-sm">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Tasks Table */}
      {tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <h3>No tasks found</h3>
          <p>{filter ? 'Try a different filter.' : 'Add your first task to this project.'}</p>
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
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {task.title}
                  </td>
                  <td>
                    <span className={`badge badge-${task.priority}`}>{task.priority}</span>
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
                  <td>{task.assignee?.name || '—'}</td>
                  <td style={isOverdue(task.due_date, task.status) ? { color: '#ff4d4f', fontWeight: 'bold' } : {}}>
                    {task.due_date || '—'}
                  </td>
                  {isAdmin && (
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Task Modal */}
      {showModal && (
        <Modal title="Add New Task" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreateTask}>
            <div className="form-group">
              <label className="form-label">Task Title</label>
              <input className="form-input" placeholder="e.g., Design landing page"
                value={taskForm.title}
                onChange={e => setTaskForm({...taskForm, title: e.target.value})}
                required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" placeholder="Task details..."
                value={taskForm.description}
                onChange={e => setTaskForm({...taskForm, description: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={taskForm.priority}
                onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input className="form-input" type="date" value={taskForm.due_date}
                onChange={e => setTaskForm({...taskForm, due_date: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Assign To</label>
              <select className="form-select" value={taskForm.assigned_to}
                onChange={e => setTaskForm({...taskForm, assigned_to: e.target.value})}>
                <option value="">Unassigned</option>
                {project?.members?.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Manage Members Modal */}
      {showMembersModal && (
        <Modal title="Manage Project Members" onClose={() => setShowMembersModal(false)}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '12px' }}>Current Members</h3>
            {project?.members?.length === 0 ? (
              <p className="text-muted text-sm">No members added yet.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {project?.members?.map(member => (
                  <li key={member.id} className="flex items-center" style={{ justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span>{member.name} <span className="text-muted text-sm">({member.email})</span></span>
                    <button className="btn btn-sm btn-ghost text-muted" onClick={() => handleRemoveMember(member.id)} title="Remove">✕</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <form onSubmit={handleAddMember}>
            <div className="form-group">
              <label className="form-label">Add New Member</label>
              <div className="flex gap-8">
                <select 
                  className="form-select" 
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                >
                  <option value="">Select a user...</option>
                  {users.filter(u => !project?.members?.some(m => m.id === u.id)).map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
                <button type="submit" className="btn btn-primary">Add</button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
