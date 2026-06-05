import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import type { Client } from '@/types'
import { useClients } from '@/store/useStore'

function ClientModal({
  client,
  onSave,
  onClose,
}: {
  client?: Client
  onSave: (data: Omit<Client, 'id' | 'createdAt'>) => Promise<void>
  onClose: () => void
}) {
  const [societe, setSociete] = useState(client?.societe ?? '')
  const [interlos, setInterlos] = useState<string[]>(client?.interlocuteurs ?? [])
  const [newInterlo, setNewInterlo] = useState('')
  const [delai, setDelai] = useState(client?.delaiPaiementJours?.toString() ?? '30')
  const [notes, setNotes] = useState(client?.notes ?? '')
  const [saving, setSaving] = useState(false)

  const inputCls = 'w-full px-3 py-1.5 text-sm rounded border border-border bg-white focus:outline-none focus:ring-2 focus:ring-lavender-200 focus:border-lavender-500'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSave({ societe, interlocuteurs: interlos, delaiPaiementJours: parseInt(delai) || 30, notes: notes || undefined })
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-modal w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-medium text-text-main">
            {client ? 'Modifier le client' : 'Nouveau client'}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-main"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-muted">Société *</label>
            <input required className={inputCls} value={societe} onChange={e => setSociete(e.target.value)}
              placeholder="PPG France Manufacturing" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-text-muted">Interlocuteurs</label>
            <div className="flex flex-wrap gap-1.5">
              {interlos.map(i => (
                <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-lavender-50 text-lavender-600 rounded-full text-xs">
                  {i}
                  <button type="button" onClick={() => setInterlos(prev => prev.filter(x => x !== i))}>
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input className={inputCls} value={newInterlo} onChange={e => setNewInterlo(e.target.value)}
                placeholder="Ajouter un interlocuteur"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (newInterlo.trim()) { setInterlos(prev => [...prev, newInterlo.trim()]); setNewInterlo('') }
                  }
                }} />
              <button type="button"
                onClick={() => { if (newInterlo.trim()) { setInterlos(prev => [...prev, newInterlo.trim()]); setNewInterlo('') } }}
                className="px-3 py-1.5 rounded border border-border text-text-muted hover:bg-surface">
                <Check size={14} />
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-muted">Délai de paiement habituel (jours)</label>
            <input type="number" min="0" className={inputCls} value={delai} onChange={e => setDelai(e.target.value)} placeholder="30" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-muted">Notes</label>
            <textarea rows={2} className={`${inputCls} resize-none`} value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-text-muted hover:text-text-main">Annuler</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-lavender-500 to-powder-500 disabled:opacity-50">
              {client ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function Clients() {
  const { clients, creer, modifier, supprimer } = useClients()
  const [modal, setModal] = useState<{ open: boolean; client?: Client }>({ open: false })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-text-main">Clients</h1>
          <p className="text-sm text-text-muted">{clients.length} client{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setModal({ open: true })}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-lavender-500 to-powder-500">
          <Plus size={15} /> Nouveau client
        </button>
      </div>

      <div className="bg-white rounded-lg border border-border shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface border-b border-border">
              <th className="px-4 py-2.5 text-left text-xs font-medium text-text-muted">Société</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-text-muted">Interlocuteurs</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-text-muted">Délai paiement</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-text-muted">Notes</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {clients.map(c => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface">
                <td className="px-4 py-3 font-medium text-text-main">{c.societe}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {c.interlocuteurs.map(i => (
                      <span key={i} className="px-2 py-0.5 bg-lavender-50 text-lavender-600 rounded-full text-xs">{i}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-text-muted">{c.delaiPaiementJours} jours</td>
                <td className="px-4 py-3 text-xs text-text-muted max-w-[200px]">
                  <span className="truncate block">{c.notes ?? '—'}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => setModal({ open: true, client: c })}
                      className="p-1.5 rounded text-text-muted hover:bg-surface hover:text-text-main">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => { if (confirm('Supprimer ce client ?')) supprimer(c.id) }}
                      className="p-1.5 rounded text-text-muted hover:bg-peach-50 hover:text-peach-600">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-text-muted">Aucun client</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal.open && (
        <ClientModal
          client={modal.client}
          onSave={async data => { if (modal.client) { await modifier(modal.client.id, data) } else { await creer(data) } }}
          onClose={() => setModal({ open: false })}
        />
      )}
    </div>
  )
}
