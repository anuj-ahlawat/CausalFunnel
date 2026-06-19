import { formatTimestamp } from '../utils/format';

function EventItem({ event }) {
  const isClick = event.eventType === 'click';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
            isClick
              ? 'bg-orange-100 text-orange-700'
              : 'bg-indigo-100 text-indigo-700'
          }`}
        >
          {isClick ? 'Click' : 'Page View'}
        </span>
        <time className="text-xs text-slate-500">{formatTimestamp(event.timestamp)}</time>
      </div>

      <p className="mt-3 break-all text-sm text-slate-600">{event.pageUrl}</p>

      {isClick && (
        <p className="mt-2 font-mono text-sm text-slate-800">
          Position: ({event.clickX}, {event.clickY})
        </p>
      )}
    </div>
  );
}

export default function EventTimeline({ events }) {
  if (!events.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
        <p className="text-lg font-medium text-slate-700">No events in this session</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {events.map((event, index) => (
        <div key={event._id || `${event.timestamp}-${index}`}>
          <EventItem event={event} />
          {index < events.length - 1 && (
            <div className="flex justify-center py-2 text-slate-400" aria-hidden="true">
              ↓
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
