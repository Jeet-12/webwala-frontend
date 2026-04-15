import { useState } from 'react';
import { Trash2, Pencil, Check, Clock, Flag, Calendar } from 'lucide-react';

const PRIORITY_META = {
  high:   { label: 'High',   color: 'priority-high'   },
  medium: { label: 'Medium', color: 'priority-medium' },
  low:    { label: 'Low',    color: 'priority-low'    },
};

const TaskCard = ({ task, onToggle, onDelete, onEdit }) => {
  const [deleting, setDeleting] = useState(false);
  const isCompleted = task.status === 'completed';
  const due = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = due && !isCompleted && due < new Date();
  const priority = PRIORITY_META[task.priority] || PRIORITY_META.medium;

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(task._id);
    setDeleting(false);
  };

  return (
    <div className={`task-card ${isCompleted ? 'task-completed' : ''} ${isOverdue ? 'task-overdue' : ''}`}>
      {/* Left accent bar */}
      <span className={`accent-bar ${priority.color}`} />

      {/* Checkbox */}
      <button
        className={`task-checkbox ${isCompleted ? 'checked' : ''}`}
        onClick={() => onToggle(task._id)}
        title={isCompleted ? 'Mark as pending' : 'Mark as completed'}
      >
        {isCompleted && <Check size={13} strokeWidth={3} />}
      </button>

      {/* Content */}
      <div className="task-body">
        <p className={`task-title ${isCompleted ? 'line-through' : ''}`}>{task.title}</p>
        {task.description && (
          <p className="task-desc">{task.description}</p>
        )}
        <div className="task-meta">
          <span className={`badge ${priority.color}`}>
            <Flag size={11} /> {priority.label}
          </span>
          {due && (
            <span className={`badge ${isOverdue ? 'badge-overdue' : 'badge-due'}`}>
              <Calendar size={11} />
              {due.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
          <span className={`badge ${isCompleted ? 'badge-done' : 'badge-pending'}`}>
            {isCompleted ? <Check size={11} /> : <Clock size={11} />}
            {isCompleted ? 'Completed' : 'Pending'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="task-actions">
        <button className="icon-btn edit-btn" onClick={() => onEdit(task)} title="Edit task">
          <Pencil size={15} />
        </button>
        <button
          className={`icon-btn delete-btn ${deleting ? 'loading' : ''}`}
          onClick={handleDelete}
          disabled={deleting}
          title="Delete task"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
