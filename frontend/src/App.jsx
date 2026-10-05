import { useState, useMemo } from 'react';
import AddTaskBar from './components/AddTaskBar';
import FilterPills from './components/FilterPills';
import TaskCardList from './components/TaskCardList';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { useTasks } from './hooks/useTasks';

export default function App() {
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' or 'dashboard'
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const pageSize = 10;
  const { tasks, total, loading, error, refetch, setTasks } = useTasks(query, status, page, pageSize);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Compute status counts for filter pills
  const counts = useMemo(() => {
    let todo = 0;
    let inProgress = 0;
    let done = 0;

    tasks.forEach((t) => {
      const s = (t.status || '').toUpperCase();
      if (s === 'OPEN') todo++;
      else if (s === 'IN_PROGRESS') inProgress++;
      else if (s === 'DONE') done++;
    });

    return {
      '': total,
      OPEN: status === 'OPEN' ? total : todo,
      IN_PROGRESS: status === 'IN_PROGRESS' ? total : inProgress,
      DONE: status === 'DONE' ? total : done,
    };
  }, [tasks, total, status]);

  const handleTaskCreated = (newTask) => {
    // If user has a status filter that would hide the newly added task, reset to All
    if (status && status !== newTask.status) {
      setStatus('');
    }
    setPage(1);

    // Prepend new task immediately to the list so user sees it instantly
    setTasks((prev) => [newTask, ...prev.filter((t) => t.id !== newTask.id)]);

    // Trigger background sync
    setTimeout(() => refetch(), 300);
  };

  const handleStatusChange = (taskId, newStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    setTimeout(() => refetch(), 300);
  };

  const handleResetFilters = () => {
    setQuery('');
    setStatus('');
    setPage(1);
  };

  return (
    <div className="tracker-app-root">
      {/* Background ambient lighting effects (Clean, smooth gradient - no harsh grid lines) */}
      <div className="ambient-blob blob-top-left"></div>
      <div className="ambient-blob blob-bottom-right"></div>
      <div className="ambient-blob blob-center-accent"></div>

      <div className="tracker-container">
        {/* Top View Mode Switcher (Centered & Clean - Search and API:8081 removed) */}
        <div className="top-navigation-row centered-nav">
          <div className="view-mode-tabs">
            <button
              type="button"
              className={`view-tab-btn ${activeTab === 'tasks' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('tasks')}
            >
              <span className="tab-icon">📋</span>
              <span>Task Board</span>
            </button>
            <button
              type="button"
              className={`view-tab-btn ${activeTab === 'dashboard' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <span className="tab-icon">📊</span>
              <span>Analytics Dashboard</span>
              <span className="tab-live-badge">Live</span>
            </button>
          </div>
        </div>

        {/* Hero Title Section (From Reference Screenshot) */}
        <header className="hero-header">
          <h1 className="hero-title">
            Task <span className="title-highlight">Tracker</span>
          </h1>
          <div className="title-accent-bar"></div>
          <p className="hero-subtitle">Organize your tasks. Stay productive.</p>
        </header>

        {/* View 1: Task Board (Matching Screenshot) */}
        {activeTab === 'tasks' && (
          <div className="tasks-view-content">
            {/* Add Task Input Bar */}
            <AddTaskBar onTaskCreated={handleTaskCreated} />

            {/* Filter Pills Bar */}
            <div className="filter-pills-wrapper">
              <FilterPills
                value={status}
                onChange={(newStatus) => {
                  setStatus(newStatus);
                  setPage(1);
                }}
                counts={counts}
              />
            </div>

            {/* Task Cards List */}
            <TaskCardList
              tasks={tasks}
              loading={loading}
              error={error}
              onStatusChange={handleStatusChange}
              onResetFilters={handleResetFilters}
            />

            {/* Pagination */}
            {total > pageSize && (
              <div className="pagination-wrapper">
                <button
                  type="button"
                  className="page-nav-btn"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  &larr; Previous
                </button>
                <span className="page-count-text">
                  Page <span className="highlight-txt">{page}</span> of{' '}
                  <span className="highlight-txt">{totalPages}</span> ({total} tasks)
                </span>
                <button
                  type="button"
                  className="page-nav-btn"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </div>
        )}

        {/* View 2: Analytics Dashboard with Real Graph Representations */}
        {activeTab === 'dashboard' && (
          <AnalyticsDashboard tasks={tasks} total={total} />
        )}
      </div>
    </div>
  );
}
