function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #6366f1, #a855f7)',
  'linear-gradient(135deg, #3b82f6, #06b6d4)',
  'linear-gradient(135deg, #10b981, #14b8a6)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #ec4899, #8b5cf6)',
];

function getAvatarGradient(name) {
  if (!name) return 'linear-gradient(135deg, #475569, #334155)';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
}

export default function TaskTable({ tasks, loading, error, onResetFilters }) {
  if (loading) {
    return (
      <div className="table-wrapper">
        <table className="task-table skeleton-table">
          <thead>
            <tr>
              <th style={{ width: '110px' }}>Issue ID</th>
              <th>Task Summary</th>
              <th style={{ width: '150px' }}>Status</th>
              <th style={{ width: '130px' }}>Priority</th>
              <th style={{ width: '170px' }}>Assignee</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="skeleton-row">
                <td><div className="skeleton-bar" style={{ width: '70px' }}></div></td>
                <td>
                  <div className="skeleton-bar" style={{ width: '60%', marginBottom: '6px' }}></div>
                  <div className="skeleton-bar" style={{ width: '85%' }}></div>
                </td>
                <td><div className="skeleton-bar pill" style={{ width: '90px' }}></div></td>
                <td><div className="skeleton-bar pill" style={{ width: '75px' }}></div></td>
                <td><div className="skeleton-bar" style={{ width: '110px' }}></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-card error-card">
        <div className="state-icon error-icon">⚠️</div>
        <h3>Failed to load tasks</h3>
        <p className="state-desc">{error}</p>
        <p className="state-hint">Make sure the Spring Boot backend server is running on port 8081.</p>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="state-card empty-card">
        <div className="state-icon empty-icon">🔍</div>
        <h3>No matching engineering tasks</h3>
        <p className="state-desc">No tasks match your current search criteria or status filter.</p>
        {onResetFilters && (
          <button type="button" className="btn-secondary" onClick={onResetFilters}>
            Clear All Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="task-table">
        <thead>
          <tr>
            <th style={{ width: '110px' }}>Issue ID</th>
            <th>Task Summary</th>
            <th style={{ width: '150px' }}>Status</th>
            <th style={{ width: '130px' }}>Priority</th>
            <th style={{ width: '170px' }}>Assignee</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const statusKey = (task.status || '').toLowerCase().replace('-', '_');
            const priorityKey = (task.priority || 'MEDIUM').toLowerCase();
            const formattedId = `DEV-${String(task.id).padStart(3, '0')}`;

            return (
              <tr key={task.id} className="task-row">
                <td className="cell-id">
                  <span className="task-id-badge" title={`Internal ID: ${task.id}`}>
                    {formattedId}
                  </span>
                </td>
                <td className="cell-title">
                  <div className="task-title-row">
                    <span className="task-title-text">{task.title}</span>
                  </div>
                  {task.description && (
                    <div className="task-desc-text">{task.description}</div>
                  )}
                </td>
                <td className="cell-status">
                  <span className={`status-badge ${statusKey}`}>
                    <span className="badge-glow-dot"></span>
                    {task.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="cell-priority">
                  <span className={`priority-badge priority-${priorityKey}`}>
                    <span className="priority-symbol">
                      {priorityKey === 'high' ? '▲' : priorityKey === 'medium' ? '■' : '▼'}
                    </span>
                    {task.priority || 'MEDIUM'}
                  </span>
                </td>
                <td className="cell-assignee">
                  {task.assignee ? (
                    <div className="assignee-box" title={`Assigned to ${task.assignee}`}>
                      <div
                        className="assignee-avatar"
                        style={{ background: getAvatarGradient(task.assignee) }}
                      >
                        {getInitials(task.assignee)}
                      </div>
                      <span className="assignee-name">{task.assignee}</span>
                    </div>
                  ) : (
                    <div className="assignee-box unassigned">
                      <div className="assignee-avatar avatar-unassigned">?</div>
                      <span className="assignee-name">Unassigned</span>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
