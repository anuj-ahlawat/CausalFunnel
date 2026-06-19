function chooseDimension(clicks, field, fallback) {
  const values = clicks
    .map((c) => c?.[field])
    .filter((value) => typeof value === 'number' && Number.isFinite(value) && value > 0);

  if (!values.length) {
    return fallback;
  }

  // Prefer the most common value (stable across events).
  const counts = new Map();
  values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));

  let bestValue = values[0];
  let bestCount = 0;
  counts.forEach((count, value) => {
    if (count > bestCount) {
      bestCount = count;
      bestValue = value;
    }
  });

  return bestValue;
}

export default function HeatmapCanvas({ clicks, pageUrl }) {
  if (!clicks.length) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
        <p className="text-sm text-slate-500">No click data for this page yet.</p>
      </div>
    );
  }

  const fallbackWidth = Math.max(...clicks.map((c) => c.clickX || 0), 1);
  const fallbackHeight = Math.max(...clicks.map((c) => c.clickY || 0), 1);

  const pageWidth = chooseDimension(clicks, 'pageWidth', fallbackWidth);
  const pageHeight = chooseDimension(clicks, 'pageHeight', fallbackHeight);

  const canIframe =
    typeof pageUrl === 'string' &&
    (pageUrl.startsWith('http://') || pageUrl.startsWith('https://'));

  return (
    <div className="relative h-[650px] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner">
      {canIframe ? (
        <iframe
          title="Tracked page preview"
          src={pageUrl}
          className="absolute inset-0 h-full w-full"
          style={{
            border: 0,
            pointerEvents: 'none',
            opacity: 0.95,
          }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
          <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <p className="text-sm font-medium text-slate-800">Page preview unavailable</p>
            <p className="mt-2 text-sm text-slate-500">
              To render the page under the heatmap, select a tracked URL that starts with
              <span className="font-mono"> http://</span> or <span className="font-mono">https://</span>.
            </p>
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.035)_1px,transparent_1px)] bg-[size:24px_24px]" />

      {clicks.map((click, index) => {
        const left = (click.clickX / pageWidth) * 100;
        const top = (click.clickY / pageHeight) * 100;

        return (
          <span
            key={`${click.clickX}-${click.clickY}-${index}`}
            className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 opacity-70 shadow-md ring-2 ring-red-300"
            style={{ left: `${left}%`, top: `${top}%` }}
            title={`(${click.clickX}, ${click.clickY})`}
          />
        );
      })}

      <div className="absolute bottom-4 left-4 rounded-lg bg-white/90 px-3 py-2 text-xs text-slate-600 shadow">
        {clicks.length} click{clicks.length === 1 ? '' : 's'} recorded
      </div>
    </div>
  );
}
