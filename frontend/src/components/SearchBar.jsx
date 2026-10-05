import { useRef } from 'react';

export default function SearchBar({ value, onChange }) {
  const inputRef = useRef(null);

  return (
    <div className="search-container">
      <span className="search-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </span>
      <input
        ref={inputRef}
        type="text"
        className="search-input"
        placeholder="Filter by title, description or assignee..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value ? (
        <button
          type="button"
          className="search-clear-btn"
          onClick={() => {
            onChange('');
            inputRef.current?.focus();
          }}
          title="Clear search"
        >
          ✕
        </button>
      ) : (
        <span className="search-kbd-hint">⌘K</span>
      )}
    </div>
  );
}
