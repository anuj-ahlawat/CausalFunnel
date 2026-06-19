import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchHeatmapData, fetchPages } from '../api/eventApi';
import ErrorAlert from '../components/ErrorAlert';
import HeatmapCanvas from '../components/HeatmapCanvas';
import LoadingSpinner from '../components/LoadingSpinner';
import { stripUrlHash } from '../utils/heatmap';

function formatPageLabel(url) {
  if (!url) {
    return '';
  }

  try {
    const parsed = new URL(url);
    const path = parsed.pathname === '/' ? parsed.host : `${parsed.host}${parsed.pathname}`;
    return path;
  } catch {
    return stripUrlHash(url);
  }
}

const EMPTY_HEATMAP = {
  pageWidth: 1280,
  pageHeight: 900,
  viewportWidth: 1280,
  viewportHeight: 900,
  previewUrl: '',
  clicks: [],
};

export default function HeatmapPage() {
  const [pages, setPages] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState('');
  const [heatmap, setHeatmap] = useState(EMPTY_HEATMAP);
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
      setHeatmap(EMPTY_HEATMAP);
      return;
    }

    try {
      setLoadingHeatmap(true);
      setError(null);
      const data = await fetchHeatmapData(pageUrl);
      setHeatmap({ ...EMPTY_HEATMAP, ...data });
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

  const selectedLabel = useMemo(() => formatPageLabel(selectedUrl), [selectedUrl]);
  const canvasSize = `${heatmap.pageWidth}×${heatmap.pageHeight}px`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Heatmaps</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Click positions use pageX/pageY normalized against document scrollWidth/scrollHeight.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            loadPages();
            if (selectedUrl) {
              loadHeatmap(selectedUrl);
            }
          }}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Refresh
        </button>
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
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <label htmlFor="page-select" className="block text-sm font-semibold text-slate-900">
                Tracked page
              </label>
              <p className="mt-1 text-xs text-slate-500">
                Fragment identifiers (#) are ignored when grouping.
              </p>

              {pages.length ? (
                <select
                  id="page-select"
                  value={selectedUrl}
                  onChange={(event) => setSelectedUrl(event.target.value)}
                  className="mt-4 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  {pages.map((page) => (
                    <option key={page} value={page}>
                      {formatPageLabel(page)}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="mt-4 text-sm text-slate-500">No tracked pages available yet.</p>
              )}

              {selectedUrl && (
                <p className="mt-3 break-all font-mono text-[11px] leading-relaxed text-slate-400">
                  {stripUrlHash(selectedUrl)}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Summary</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-500">Page</dt>
                  <dd className="text-right font-medium text-slate-800">{selectedLabel || '—'}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-500">Total clicks</dt>
                  <dd className="font-medium text-slate-800">
                    {loadingHeatmap ? '…' : heatmap.clicks.length}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-500">Document canvas</dt>
                  <dd className="font-medium text-slate-800">
                    {loadingHeatmap ? '…' : canvasSize}
                  </dd>
                </div>
              </dl>
            </div>
          </aside>

          <section>
            {loadingHeatmap ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
                <LoadingSpinner label="Loading heatmap..." />
              </div>
            ) : (
              <HeatmapCanvas
                clicks={heatmap.clicks}
                pageUrl={heatmap.previewUrl || selectedUrl}
                pageWidth={heatmap.pageWidth}
                pageHeight={heatmap.pageHeight}
                viewportWidth={heatmap.viewportWidth}
              />
            )}
          </section>
        </div>
      )}
    </div>
  );
}
