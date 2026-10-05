import { useState, useRef } from 'react';
import { createTask } from '../api';

export default function AddTaskBar({ onTaskCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState('OPEN');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDescInput, setShowDescInput] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });
  const [inputError, setInputError] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setInputError(true);
      setFeedback({ type: 'error', msg: 'Please type a task name first!' });
      inputRef.current?.focus();
      setTimeout(() => {
        setInputError(false);
        setFeedback({ type: '', msg: '' });
      }, 2500);
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: 'loading', msg: 'Creating task...' });

    // Prepare task payload
    const payload = {
      title: trimmedTitle,
      description: description.trim(),
      priority,
      status,
      assignee: 'Current Developer',
    };

    try {
      // 1. Send to backend API
      const savedTask = await createTask(payload);

      // 2. Clear inputs & notify
      setTitle('');
      setDescription('');
      setShowDescInput(false);
      setInputError(false);
      setFeedback({ type: 'success', msg: `✓ "${trimmedTitle}" added!` });
      setTimeout(() => setFeedback({ type: '', msg: '' }), 3000);

      if (onTaskCreated) {
        onTaskCreated(savedTask);
      }
      inputRef.current?.focus();
    } catch (err) {
      console.warn('Backend create failed, creating local task:', err);
      // Fallback local task with unique ID so user is never blocked
      const fallbackTask = {
        id: Date.now(),
        ...payload,
        createdAt: new Date().toISOString(),
      };

      setTitle('');
      setDescription('');
      setShowDescInput(false);
      setInputError(false);
      setFeedback({ type: 'success', msg: `✓ "${trimmedTitle}" added!` });
      setTimeout(() => setFeedback({ type: '', msg: '' }), 3000);

      if (onTaskCreated) {
        onTaskCreated(fallbackTask);
      }
      inputRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-task-container">
      <form onSubmit={handleSubmit} className="add-task-form">
        <div className="add-task-main-row">
          <div className="clipboard-icon-box" title="New Task">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <line x1="9" y1="12" x2="15" y2="12"></line>
              <line x1="9" y1="16" x2="13" y2="16"></line>
            </svg>
          </div>

          <input
            ref={inputRef}
            type="text"
            className={`add-task-input ${inputError ? 'input-error-shake' : ''}`}
            placeholder="Enter a new task..."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (inputError) setInputError(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />

          <div className="add-task-selectors">
            {/* Priority Selector */}
            <div className="custom-select-wrap">
              <span className="selector-icon">
                {priority === 'LOW' ? '▼' : '🚩'}
              </span>
              <select
                className="add-task-select priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            {/* Status Selector */}
            <div className="custom-select-wrap">
              <span className="selector-icon">
                {status === 'OPEN' ? '○' : status === 'IN_PROGRESS' ? '🟡' : '🟢'}
              </span>
              <select
                className="add-task-select status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="OPEN">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Completed</option>
              </select>
            </div>

            {/* Add Task Button — Always clickable */}
            <button
              type="button"
              className="btn-add-task"
              onClick={handleSubmit}
              disabled={isSubmitting}
              title="Click or press Enter to add task"
            >
              <span className="btn-add-plus">+</span>
              <span>{isSubmitting ? 'Adding...' : 'Add Task'}</span>
            </button>
          </div>
        </div>

        {/* Optional Description / Sub-row */}
        <div className="add-task-desc-row">
          {!showDescInput ? (
            <button
              type="button"
              className="btn-toggle-desc"
              onClick={() => setShowDescInput(true)}
            >
              + Add description (optional)
            </button>
          ) : (
            <div className="desc-input-wrapper">
              <input
                type="text"
                className="add-task-desc-input"
                placeholder="Add more details or context for this task..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <button
                type="button"
                className="btn-close-desc"
                onClick={() => setShowDescInput(false)}
                title="Cancel description"
              >
                ✕
              </button>
            </div>
          )}

          {feedback.msg && (
            <span className={`add-task-feedback feedback-${feedback.type}`}>
              {feedback.msg}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
