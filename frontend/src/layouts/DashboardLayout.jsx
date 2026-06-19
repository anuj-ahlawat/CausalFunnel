import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Sessions', end: true },
  { to: '/heatmap', label: 'Heatmap' },
];

function NavItem({ to, label, end, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `block rounded-lg px-4 py-2.5 text-sm font-medium transition ${
          isActive
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm">
        <div className="flex h-16 items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={() => setSidebarOpen((open) => !open)}
              aria-label="Toggle navigation"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                User Analytics
              </p>
              <h1 className="text-lg font-semibold text-slate-900">CausalFunnel Dashboard</h1>
            </div>
          </div>

          <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            Live tracking enabled
          </div>
        </div>
      </header>

      <div className="flex">
        {sidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-20 bg-black/30 lg:hidden"
            onClick={closeSidebar}
            aria-label="Close navigation"
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-20 mt-16 w-64 transform border-r border-slate-200 bg-white p-4 transition-transform lg:static lg:mt-0 lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavItem key={item.to} {...item} onNavigate={closeSidebar} />
            ))}
          </nav>

          <div className="mt-8 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-medium text-slate-800">Demo tip</p>
            <p className="mt-1">
              Run <code className="rounded bg-white px-1 py-0.5 text-xs">npx serve .</code>{' '}
              and open <code className="rounded bg-white px-1 py-0.5 text-xs">/demo-site/</code>{' '}
              to generate sample events.
            </p>
          </div>
        </aside>

        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
