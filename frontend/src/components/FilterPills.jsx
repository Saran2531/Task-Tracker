export default function FilterPills({ value, onChange, counts = {} }) {
  const filters = [
    { id: '', label: 'All', icon: null },
    { id: 'OPEN', label: 'To Do', icon: '○' },
    { id: 'IN_PROGRESS', label: 'In Progress', icon: '🟡' },
    { id: 'DONE', label: 'Completed', icon: '🟢' },
  ];

  return (
    <div className="filter-pills-bar" role="tablist">
      {filters.map((f) => {
        const isActive = value === f.id;
        const count = counts[f.id];
        return (
          <button
            key={f.id}
            type="button"
            className={`filter-pill-btn ${isActive ? 'pill-active' : ''}`}
            onClick={() => onChange(f.id)}
            role="tab"
            aria-selected={isActive}
          >
            {f.icon && <span className="pill-icon">{f.icon}</span>}
            <span className="pill-text">{f.label}</span>
            {count !== undefined && count !== null && (
              <span className="pill-count">{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
