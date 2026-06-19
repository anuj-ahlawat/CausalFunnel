import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchSessionEvents } from '../api/eventApi';
import ErrorAlert from '../components/ErrorAlert';
import EventTimeline from '../components/EventTimeline';
import LoadingSpinner from '../components/LoadingSpinner';

export default function SessionDetailPage() {
  const { sessionId } = useParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSessionEvents(sessionId);
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/"
          className="text-sm font-medium text-indigo-600 transition hover:text-indigo-800"
        >
          ← Back to sessions
        </Link>
        <h2 className="mt-3 text-2xl font-semibold text-slate-900">Session Timeline</h2>
        <p className="mt-1 break-all font-mono text-sm text-slate-500">{sessionId}</p>
      </div>

      {loading && <LoadingSpinner label="Loading session events..." />}
      {!loading && error && <ErrorAlert message={error} onRetry={loadEvents} />}
      {!loading && !error && <EventTimeline events={events} />}
    </div>
  );
}
