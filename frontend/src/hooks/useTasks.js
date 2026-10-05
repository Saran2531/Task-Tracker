import { useState, useEffect, useCallback } from 'react';
import { fetchTasks } from '../api';

export function useTasks(query, status, page, pageSize) {
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  const refetch = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    // FIX Bug 3: Added 300ms debounce — without this, every single keystroke
    // fired a new API request. This reduces unnecessary network calls.
    const debounceTimer = setTimeout(() => {
      setLoading(true);
      setError(null);

      fetchTasks({ query, status, page, pageSize })
        .then((data) => {
          setTasks(data.items);
          setTotal(data.total);
          setLoading(false);
        })
        .catch((err) => {
          // FIX Bug 4: setLoading(false) was missing in the catch block.
          // Without this, the loading spinner showed forever after any error.
          setError(err.message);
          setLoading(false);
        });
    }, 300);

    // Cleanup: cancel the pending timer if inputs change before it fires
    return () => clearTimeout(debounceTimer);
  }, [query, status, page, pageSize, version]);

  return { tasks, total, loading, error, refetch, setTasks };
}
