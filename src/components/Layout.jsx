import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { BarChart3, FlaskConical, GitCompareArrows, Info, LayoutDashboard, Menu, X } from 'lucide-react';
import { Brand, cx } from './ui.jsx';
import EngineSwitch from './EngineSwitch.jsx';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/lab', label: 'Processing lab', icon: FlaskConical },
  { to: '/compare', label: 'Precision comparison', icon: GitCompareArrows },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/about', label: 'About project', icon: Info },
];

function SidebarBody({ onNavigate }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-6 pt-6">
        <Brand />
      </div>
      <nav className="flex-1 space-y-1 px-3" aria-label="Main">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cx(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-blue/15 text-white shadow-[inset_2px_0_0_0_#8B6CFF]'
                  : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-100'
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4">
        <EngineSwitch />
      </div>
    </div>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-ink-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/[0.06] bg-ink-900 lg:block">
        <SidebarBody />
      </aside>

      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-white/[0.06] bg-ink-900/95 px-4 backdrop-blur lg:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid h-9 w-9 place-items-center rounded-lg text-slate-300 hover:bg-white/[0.06]"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button type="button" className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} aria-label="Close navigation" />
          <div className="absolute inset-y-0 left-0 w-72 bg-ink-900">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4 grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-white/[0.06]"
              aria-label="Close navigation"
            >
              <X size={18} />
            </button>
            <SidebarBody onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <main className="lg:pl-64" key={pathname}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
