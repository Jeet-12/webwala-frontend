import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  Plus, X, Search, ListTodo, CheckCheck, Clock,
  ChevronDown, SlidersHorizontal, Loader2, CalendarDays,
} from 'lucide-react';

const PRIORITIES = ['low', 'medium', 'high'];

const emptyForm = { title: '', description: '', priority: 'medium', dueDate: '' };

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [filter, setFilter] = useState('all'); // all | pending | completed
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null); // null = create mode

  // Form
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  // ── Fetch tasks ─────────────────────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter !== 'all') params.status = filter;
      if (sortBy === 'oldest') params.sort = 'oldest';
      else if (sortBy === 'priority') params.sort = 'priority';
      else if (sortBy === 'dueDate') params.sort = 'dueDate';
      const { data } = await api.get('/tasks', { params });
      setTasks(data.tasks);
    } catch {
      toast.error('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [filter, sortBy]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // ── Stats ───────────────────────────────────────────────────────────────────
  const totalCount     = tasks.length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const pendingCount   = tasks.filter((t) => t.status === 'pending').length;

  // ── Filtered (client-side search) ──────────────────────────────────────────
  const filtered = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Form helpers ────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditTask(null);
    setForm(emptyForm);
    setFormErrors({});
    setShowForm(true);
  };

  const openEdit = (task) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
    });
    setFormErrors({});
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditTask(null); };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Task title is required.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        dueDate: form.dueDate ? form.dueDate.toISOString().split('T')[0] : null,
      };

      if (editTask) {
        await api.put(`/tasks/${editTask._id}`, payload);
        toast.success('Task updated! ✏️');
      } else {
        await api.post('/tasks', payload);
        toast.success('Task added! 🎯');
      }

      closeForm();
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Toggle ──────────────────────────────────────────────────────────────────
  const handleToggle = async (id) => {
    try {
      const { data } = await api.patch(`/tasks/${id}/toggle`);
      setTasks((prev) => prev.map((t) => (t._id === id ? data.task : t)));
      toast.success(data.task.status === 'completed' ? 'Task completed! ✅' : 'Task marked pending.');
    } catch {
      toast.error('Failed to update task.');
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      toast.success('Task deleted.');
    } catch {
      toast.error('Failed to delete task.');
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-main">
        {/* ── Header ── */}
        <section className="dash-header">
          <div>
            <h1>Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
            <p>Here&apos;s what&apos;s on your plate today.</p>
          </div>
          <button className="btn-primary" onClick={openCreate} id="add-task-btn">
            <Plus size={18} /> Add Task
          </button>
        </section>

        {/* ── Stats ── */}
        <section className="stats-row">
          <div className="stat-card total">
            <ListTodo size={22} />
            <div>
              <span className="stat-num">{totalCount}</span>
              <span className="stat-label">Total Tasks</span>
            </div>
          </div>
          <div className="stat-card pending">
            <Clock size={22} />
            <div>
              <span className="stat-num">{pendingCount}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
          <div className="stat-card completed">
            <CheckCheck size={22} />
            <div>
              <span className="stat-num">{completedCount}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
          {totalCount > 0 && (
            <div className="stat-card progress-card">
              <div className="progress-label">
                <span>Progress</span>
                <strong>{Math.round((completedCount / totalCount) * 100)}%</strong>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${Math.round((completedCount / totalCount) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </section>

        {/* ── Filters & Search ── */}
        <section className="filter-bar">
          <div className="search-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
              id="task-search"
            />
            {search && (
              <button className="clear-search" onClick={() => setSearch('')}>
                <X size={14} />
              </button>
            )}
          </div>

          <div className="filter-pills">
            {['all', 'pending', 'completed'].map((f) => (
              <button
                key={f}
                className={`pill ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
                id={`filter-${f}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="sort-wrap">
            <SlidersHorizontal size={15} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
              id="sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">By Priority</option>
              <option value="dueDate">By Due Date</option>
            </select>
            <ChevronDown size={14} className="select-arrow" />
          </div>
        </section>

        {/* ── Task List ── */}
        <section className="task-list">
          {loading ? (
            <div className="empty-state">
              <Loader2 size={40} className="spin" />
              <p>Loading your tasks...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <ListTodo size={52} opacity={0.3} />
              <h3>{search ? 'No tasks match your search.' : 'No tasks yet!'}</h3>
              {!search && (
                <p>Click <strong>Add Task</strong> to create your first task.</p>
              )}
            </div>
          ) : (
            filtered.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onEdit={openEdit}
              />
            ))
          )}
        </section>
      </main>

      {/* ── Task Modal ── */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeForm()}>
          <div className="modal-card">
            <div className="modal-header">
              <h3>{editTask ? 'Edit Task' : 'New Task'}</h3>
              <button className="modal-close" onClick={closeForm}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form" noValidate>
              {/* Title */}
              <div className={`form-group ${formErrors.title ? 'has-error' : ''}`}>
                <label htmlFor="task-title">Title <span className="required">*</span></label>
                <input
                  id="task-title"
                  name="title"
                  type="text"
                  placeholder="What needs to be done?"
                  value={form.title}
                  onChange={handleFormChange}
                  autoFocus
                />
                {formErrors.title && <span className="field-error">{formErrors.title}</span>}
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="task-desc">Description <span className="optional">(optional)</span></label>
                <textarea
                  id="task-desc"
                  name="description"
                  placeholder="Add more details about this task..."
                  rows={3}
                  value={form.description}
                  onChange={handleFormChange}
                />
              </div>

              {/* Priority & Due Date */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="task-priority">Priority</label>
                  <select id="task-priority" name="priority" value={form.priority} onChange={handleFormChange}>
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group datepicker-group">
                  <label htmlFor="task-due">Due Date</label>
                  <div className="datepicker-wrap">
                    <CalendarDays size={15} className="datepicker-icon" />
                    <DatePicker
                      id="task-due"
                      selected={form.dueDate}
                      onChange={(date) => setForm((prev) => ({ ...prev, dueDate: date }))}
                      minDate={new Date()}
                      placeholderText="Pick a date…"
                      dateFormat="dd MMM yyyy"
                      isClearable
                      showPopperArrow={false}
                      calendarClassName="dp-calendar"
                      className="dp-input"
                      popperPlacement="bottom-start"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeForm}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? <span className="btn-spinner" /> : null}
                  {submitting ? 'Saving...' : editTask ? 'Save Changes' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

export default Dashboard;
