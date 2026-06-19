import { useNavigate } from 'react-router-dom';
import { truncateText } from '../utils/format';

export default function SessionTable({ sessions }) {
  const navigate = useNavigate();

  if (!sessions.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
        <p className="text-lg font-medium text-slate-700">No sessions yet</p>
        <p className="mt-2 text-sm text-slate-500">
          Open the demo site and interact with it to generate tracking data.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Session ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Event Count
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sessions.map((session) => (
              <tr
                key={session.sessionId}
                onClick={() => navigate(`/session/${session.sessionId}`)}
                className="cursor-pointer transition hover:bg-indigo-50"
              >
                <td className="px-6 py-4 font-mono text-sm text-slate-800">
                  {truncateText(session.sessionId, 36)}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-700">
                  {session.eventCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
