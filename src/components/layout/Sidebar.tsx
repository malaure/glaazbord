import { NavLink } from 'react-router-dom'
import { LayoutList, Users, Truck, BarChart3, FileText, Zap } from 'lucide-react'
import clsx from 'clsx'

const nav = [
  { to: '/', icon: LayoutList, label: 'Affaires' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/fournisseurs', icon: Truck, label: 'Fournisseurs' },
  { to: '/statistiques', icon: BarChart3, label: 'Statistiques' },
  { to: '/export', icon: FileText, label: 'Export URSSAF' },
  { to: '/laser', icon: Zap, label: 'Devis Laser' },
]

export function Sidebar() {
  return (
    <aside className="w-[52px] sm:w-[220px] flex-shrink-0 bg-white border-r border-border flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-2 sm:px-5 py-5 border-b border-border">
        <div className="flex items-center justify-center sm:justify-start gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-lavender-500 to-powder-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">G</span>
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold text-text-main leading-none">GlaazBoard</div>
            <div className="text-2xs text-text-muted mt-0.5">GLAAZ</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-1.5 sm:px-3 py-4 space-y-0.5">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            title={label}
            className={({ isActive }) => clsx(
              'flex items-center justify-center sm:justify-start gap-3 px-2 sm:px-3 py-2 rounded text-sm transition-colors',
              isActive
                ? 'bg-lavender-50 text-lavender-600 font-medium'
                : 'text-text-muted hover:bg-surface hover:text-text-main'
            )}
          >
            <Icon size={16} strokeWidth={1.75} />
            <span className="hidden sm:inline">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="hidden sm:block px-5 py-4 border-t border-border">
        <p className="text-2xs text-text-muted">Luis De Carvalho</p>
        <p className="text-2xs text-text-muted">Auto-entrepreneur BNC</p>
      </div>
    </aside>
  )
}
