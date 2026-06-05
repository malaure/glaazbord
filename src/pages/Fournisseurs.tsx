import { useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import type { Fournisseur } from '@/types'
import { useFournisseurs } from '@/store/useStore'

function FournisseurModal({
  fournisseur,
  onSave,
  onClose,
}: {
  fournisseur?: Fournisseur
  onSave: (data: Omit<Fournisseur, 'id' | 'createdAt'>) => Promise<void>
  onClose: () => void
}) {
  const [nom, setNom] = useState(fournisseur?.nom ?? '')
  const [notes, setNotes] = useState(fournisseur?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const inputCls = 'w-full px-3 py-1.5 text-sm rounded border border-border bg-white focus:outline-none focus:ring-2 focus:ring-lavender-200 focus:border-lavender-500'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSave({ nom, notes: notes || undefined })
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-modal w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-medium text-text-main">
            {fournisseur ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-main"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-muted">Nom *</label>
            <input required className={inputCls} value={nom} onChange={e => setNom(e.target.value)} placeholder="Nom du fournisseur" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-muted">Notes (site, contact, délai…)</label>
            <textarea rows={3} className={`${inputCls} resize-none`} value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="https://... | contact@... | délai 5 jours" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-text-muted hover:text-text-main">Annuler</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-lavender-500 to-powder-500 disabled:opacity-50">
              {fournisseur ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function Fournisseurs() {
  const { fournisseurs, creer, modifier, supprimer } = useFournisseurs()
  const [modal, setModal] = useState<{ open: boolean; fournisseur?: Fournisseur }>({ open: false })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-text-main">Fournisseurs</h1>
          <p className="text-sm text-text-muted">{fournisseurs.length} fournisseur{fournisseurs.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setModal({ open: true })}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-lavender-500 to-powder-500">
          <Plus size={15} /> Nouveau fournisseur
        </button>
      </div>

      <div className="bg-white rounded-lg border border-border shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface border-b border-border">
              <th className="px-4 py-2.5 text-left text-xs font-medium text-text-muted">Nom</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-text-muted">Notes</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {fournisseurs.map(f => (
              <tr key={f.id} className="border-b border-border last:border-0 hover:bg-surface">
                <td className="px-4 py-3 font-medium text-text-main">{f.nom}</td>
                <td className="px-4 py-3 text-xs text-text-muted">
                  <span className="truncate block max-w-xs">{f.notes ?? '—'}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => setModal({ open: true, fournisseur: f })}
                      className="p-1.5 rounded text-text-muted hover:bg-surface hover:text-text-main">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => { if (confirm('Supprimer ce fournisseur ?')) supprimer(f.id) }}
                      className="p-1.5 rounded text-text-muted hover:bg-peach-50 hover:text-peach-600">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {fournisseurs.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-10 text-center text-sm text-text-muted">Aucun fournisseur</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal.open && (
        <FournisseurModal
          fournisseur={modal.fournisseur}
          onSave={async data => { if (modal.fournisseur) { await modifier(modal.fournisseur.id, data) } else { await creer(data) } }}
          onClose={() => setModal({ open: false })}
        />
      )}
    </div>
  )
}
