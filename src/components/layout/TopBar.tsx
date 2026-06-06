import { Plus, LogOut } from 'lucide-react'

interface TopBarProps {
  onNouvelleAffaire: () => void
}

export function TopBar({ onNouvelleAffaire }: TopBarProps) {
  return (
    <div className="h-14 bg-white border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
      <div>
        <h1 className="text-base font-medium text-text-main">Affaires</h1>
        <p className="text-xs text-text-muted">Suivi de rentabilité</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onNouvelleAffaire}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white
            bg-gradient-to-r from-lavender-500 to-powder-500
            hover:from-lavender-600 hover:to-powder-600
            transition-all shadow-sm"
        >
          <Plus size={15} strokeWidth={2.5} />
          Nouvelle affaire
        </button>

        <a
          href="/__logout"
          title="Se déconnecter"
          className="p-2 rounded-lg text-text-muted hover:bg-surface hover:text-text-main transition-colors"
        >
          <LogOut size={16} />
        </a>
      </div>
    </div>
  )
}
