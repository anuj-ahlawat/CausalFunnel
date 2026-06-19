import { formatTimestamp } from '../utils/format';
import { debugLog } from '../utils/coordinates';

function EventItem({ event }) {
  const isClick = event.eventType === 'click';

  if (isClick) {
    debugLog('frontend:session-click', {
      pageX: event.pageX ?? event.clickX,
      pageY: event.pageY ?? event.clickY,
      normalizedX: event.normalizedX,
      normalizedY: event.normalizedY,
      displayX: event.displayX,
      displayY: event.displayY,
      pageWidth: event.pageWidth,
      pageHeight: event.pageHeight,
      scrollX: event.scrollX,
      scrollY: event.scrollY,
    });
  }

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
        <dl className="mt-3 space-y-1 font-mono text-xs text-slate-700">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">pageX / pageY</dt>
            <dd>
              ({event.pageX ?? event.clickX}, {event.pageY ?? event.clickY})
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">normalized</dt>
            <dd>
              ({event.normalizedX?.toFixed(4)}, {event.normalizedY?.toFixed(4)})
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">display</dt>
            <dd>
              ({Math.round(event.displayX ?? 0)}, {Math.round(event.displayY ?? 0)})
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">page size</dt>
            <dd>
              {event.pageWidth}×{event.pageHeight}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">scroll</dt>
            <dd>
              ({event.scrollX ?? 0}, {event.scrollY ?? 0})
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">viewport</dt>
            <dd>
              {event.viewportWidth}×{event.viewportHeight}
            </dd>
          </div>
        </dl>
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
