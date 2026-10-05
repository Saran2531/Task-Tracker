export default function StatusFilter({ value, onChange }) {
  const options = [
    { id: '', label: 'All Tasks', iconDot: 'dot-all' },
    { id: 'OPEN', label: 'Open', iconDot: 'dot-open' },
    { id: 'IN_PROGRESS', label: 'In Progress', iconDot: 'dot-progress' },
    { id: 'DONE', label: 'Completed', iconDot: 'dot-done' },
  ];

  return (
    <div className="status-filter-group" role="tablist" aria-label="Filter tasks by status">
      {options.map((opt) => {
        const isActive = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            className={`status-filter-pill ${isActive ? 'active' : ''}`}
            onClick={() => onChange(opt.id)}
            role="tab"
            aria-selected={isActive}
          >
            <span className={`status-filter-dot ${opt.iconDot}`}></span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
