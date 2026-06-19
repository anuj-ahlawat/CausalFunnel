import { useCallback, useEffect, useState } from 'react';
import { fetchHeatmapData, fetchPages } from '../api/eventApi';
import ErrorAlert from '../components/ErrorAlert';
import HeatmapCanvas from '../components/HeatmapCanvas';
import LoadingSpinner from '../components/LoadingSpinner';

export default function HeatmapPage() {
  const [pages, setPages] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState('');
  const [clicks, setClicks] = useState([]);
  const [loadingPages, setLoadingPages] = useState(true);
  const [loadingHeatmap, setLoadingHeatmap] = useState(false);
  const [error, setError] = useState(null);

  const loadPages = useCallback(async () => {
    try {
      setLoadingPages(true);
      setError(null);
      const data = await fetchPages();
      setPages(data);
      setSelectedUrl((current) => current || data[0] || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingPages(false);
    }
  }, []);

  const loadHeatmap = useCallback(async (pageUrl) => {
    if (!pageUrl) {
      setClicks([]);
      return;
    }

    try {
      setLoadingHeatmap(true);
      setError(null);
      const data = await fetchHeatmapData(pageUrl);
      setClicks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingHeatmap(false);
    }
  }, []);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  useEffect(() => {
    if (selectedUrl) {
      loadHeatmap(selectedUrl);
    }
  }, [selectedUrl, loadHeatmap]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Click Heatmap</h2>
        <p className="mt-1 text-sm text-slate-500">
          Visualize where users click on each tracked page.
        </p>
      </div>

      {loadingPages && <LoadingSpinner label="Loading pages..." />}

      {!loadingPages && error && (
        <ErrorAlert
          message={error}
          onRetry={() => {
            loadPages();
            if (selectedUrl) {
              loadHeatmap(selectedUrl);
            }
          }}
        />
      )}

      {!loadingPages && !error && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <label htmlFor="page-select" className="block text-sm font-medium text-slate-700">
            Select page URL
          </label>
          {pages.length ? (
            <select
              id="page-select"
              value={selectedUrl}
              onChange={(event) => setSelectedUrl(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              {pages.map((page) => (
                <option key={page} value={page}>
                  {page}
                </option>
              ))}
            </select>
          ) : (
            <p className="mt-3 text-sm text-slate-500">No tracked pages available yet.</p>
          )}

          <div className="mt-6">
            {loadingHeatmap ? (
              <LoadingSpinner label="Loading heatmap..." />
            ) : (
              <HeatmapCanvas clicks={clicks} pageUrl={selectedUrl} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
