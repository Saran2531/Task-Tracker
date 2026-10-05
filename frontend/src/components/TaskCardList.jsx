import { useState } from 'react';
import { updateTask } from '../api';

const BADGE_GRADIENTS = [
  'linear-gradient(135deg, #1d4ed8, #3b82f6)', // 01 Blue
  'linear-gradient(135deg, #6d28d9, #8b5cf6)', // 02 Purple
  'linear-gradient(135deg, #047857, #10b981)', // 03 Teal/Emerald
  'linear-gradient(135deg, #be185d, #ec4899)', // 04 Magenta
  'linear-gradient(135deg, #b45309, #f59e0b)', // 05 Amber/Gold
  'linear-gradient(135deg, #0f766e, #14b8a6)', // 06 Cyan/Teal
  'linear-gradient(135deg, #4338ca, #6366f1)', // 07 Indigo
];

export default function TaskCardList({ tasks, loading, error, onStatusChange, onResetFilters }) {
  const [updatingId, setUpdatingId] = useState(null);

  const cycleStatus = async (task) => {
    const statusCycle = {
      OPEN: 'IN_PROGRESS',
      IN_PROGRESS: 'DONE',
      DONE: 'OPEN',
    };

    const nextStatus = statusCycle[task.status] || 'OPEN';
    setUpdatingId(task.id);

    try {
      await updateTask(task.id, { status: nextStatus });
      if (onStatusChange) {
        onStatusChange(task.id, nextStatus);
      }
    } catch (err) {
      console.error('Failed to update status on server:', err);
      // Still update UI optimistically
      if (onStatusChange) {
        onStatusChange(task.id, nextStatus);
      }
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="task-cards-list">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="task-card task-card-skeleton">
            <div className="skeleton-number"></div>
            <div className="skeleton-content">
              <div className="skeleton-line title-line"></div>
              <div className="skeleton-line desc-line"></div>
            </div>
            <div className="skeleton-badge"></div>
            <div className="skeleton-badge"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="cards-state-card state-error">
        <div className="state-icon">⚠️</div>
        <h3>Failed to load tasks</h3>
        <p>{error}</p>
        <p className="state-sub">Backend server check: http://localhost:8081</p>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="cards-state-card state-empty">
        <div className="state-icon">📝</div>
        <h3>No tasks found</h3>
        <p>No tasks match your current view. Create one above or clear filters.</p>
        {onResetFilters && (
          <button type="button" className="btn-clear-filter" onClick={onResetFilters}>
            View All Tasks
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="task-cards-list">
      {tasks.map((task, index) => {
        const numStr = String(index + 1).padStart(2, '0');
        const gradient = BADGE_GRADIENTS[index % BADGE_GRADIENTS.length];
        const status = (task.status || 'OPEN').toUpperCase();
        const priority = (task.priority || 'MEDIUM').toUpperCase();
        const isUpdating = updatingId === task.id;

        return (
          <div key={task.id} className={`task-card ${status === 'DONE' ? 'card-completed' : ''}`}>
            {/* Number Badge */}
            <div className="card-number-badge" style={{ background: gradient }}>
              {numStr}
            </div>

            {/* Task Info */}
            <div className="card-info">
              <div className="card-title-row">
                <span className="card-title">{task.title}</span>
              </div>
              <p className="card-desc">
                {task.description || 'No description provided'}
              </p>
            </div>

            {/* Status Pill (Interactive Click to Cycle) */}
            <div className="card-actions">
              <button
                type="button"
                className={`card-status-pill status-${status.toLowerCase()}`}
                onClick={() => cycleStatus(task)}
                disabled={isUpdating}
                title="Click to cycle status (To Do → In Progress → Completed)"
              >
                {status === 'OPEN' && (
                  <>
                    <span className="status-icon-circle">○</span>
                    <span>To Do</span>
                  </>
                )}
                {status === 'IN_PROGRESS' && (
                  <>
                    <span className="status-icon-dot pulse-yellow"></span>
                    <span>In Progress</span>
                  </>
                )}
                {status === 'DONE' && (
                  <>
                    <span className="status-icon-check">✓</span>
                    <span>Completed</span>
                  </>
                )}
              </button>

              {/* Priority Pill */}
              <div className={`card-priority-pill priority-${priority.toLowerCase()}`}>
                {priority === 'HIGH' && (
                  <>
                    <span className="priority-flag">🚩</span>
                    <span>High</span>
                  </>
                )}
                {priority === 'MEDIUM' && (
                  <>
                    <span className="priority-flag">🚩</span>
                    <span>Medium</span>
                  </>
                )}
                {priority === 'LOW' && (
                  <>
                    <span className="priority-arrow">▼</span>
                    <span>Low</span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
