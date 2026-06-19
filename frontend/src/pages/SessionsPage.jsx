import { useCallback, useEffect, useState } from 'react';
import { fetchSessions } from '../api/eventApi';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import SessionTable from '../components/SessionTable';

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSessions();
      setSessions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Sessions</h2>
          <p className="mt-1 text-sm text-slate-500">
            Browse tracked user sessions and drill into event timelines.
          </p>
        </div>
        <button
          type="button"
          onClick={loadSessions}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {loading && <LoadingSpinner label="Loading sessions..." />}
      {!loading && error && <ErrorAlert message={error} onRetry={loadSessions} />}
      {!loading && !error && <SessionTable sessions={sessions} />}
    </div>
  );
}
