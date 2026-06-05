import { useState } from 'react'
import { BarChart2 } from 'lucide-react'
import type { Affaire } from '@/types'
import { useAffaires, useClients, useFournisseurs } from '@/store/useStore'
import { AffaireTable } from '@/components/affaires/AffaireTable'
import { AffaireForm } from '@/components/affaires/AffaireForm'
import { KPISidebar } from '@/components/layout/KPISidebar'
import { TopBar } from '@/components/layout/TopBar'
import { ResumeMois } from '@/components/dashboard/ResumeMois'

export function Affaires() {
  const { affaires, loading, creer, modifier, supprimer } = useAffaires()
  const { clients, creer: creerClient, modifier: modifierClient } = useClients()
  const { fournisseurs, creer: creerFournisseur } = useFournisseurs()
  const [formModal, setFormModal] = useState<{ open: boolean; affaire?: Affaire }>({ open: false })
  const [resumeOpen, setResumeOpen] = useState(false)

  const handleTogglePaiementClient = async (id: string, paye: boolean) => {
    await modifier(id, {
      clientPaye: paye,
      statut: paye ? 'PAYE' : 'FACTURE',
      datePaiementClient: paye ? new Date().toISOString().split('T')[0] : undefined,
    })
  }

  const handleTogglePaiementFournisseur = async (id: string, paye: boolean) => {
    await modifier(id, {
      fournisseurPaye: paye,
      datePaiementFournisseur: paye ? new Date().toISOString().split('T')[0] : undefined,
    })
  }

  const handleSave = async (data: Partial<Affaire>) => {
    // Auto-création client si inconnu
    if (data.societe) {
      const existing = clients.find(c => c.societe === data.societe)
      if (!existing) {
        await creerClient({
          societe: data.societe,
          interlocuteurs: data.interlocuteur ? [data.interlocuteur] : [],
          delaiPaiementJours: data.delaiPaiementJours ?? 30,
        })
      } else if (data.interlocuteur && !existing.interlocuteurs.includes(data.interlocuteur)) {
        await modifierClient(existing.id, {
          ...existing,
          interlocuteurs: [...existing.interlocuteurs, data.interlocuteur],
        })
      }
    }
    // Auto-création fournisseur si inconnu
    if (data.fournisseur && !fournisseurs.find(f => f.nom === data.fournisseur)) {
      await creerFournisseur({ nom: data.fournisseur })
    }

    if (formModal.affaire) {
      await modifier(formModal.affaire.id, data)
    } else {
      await creer(data as Omit<Affaire, 'id' | 'createdAt' | 'updatedAt'>)
    }
  }

  const affairesRef = affaires.map(a => ({ id: a.id, refDevis: a.refDevis, designation: a.designation }))

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <TopBar onNouvelleAffaire={() => setFormModal({ open: true })} />

      <div className="flex flex-1 overflow-hidden">
        {/* Zone principale */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5">
            {/* Bouton résumé du mois */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setResumeOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm text-text-muted hover:bg-surface hover:text-text-main transition-colors"
              >
                <BarChart2 size={14} />
                Résumé du mois
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20 text-text-muted text-sm">
                Chargement…
              </div>
            ) : (
              <AffaireTable
                affaires={affaires}
                onEdit={a => setFormModal({ open: true, affaire: a })}
                onSupprimer={supprimer}
                onTogglePaiementClient={handleTogglePaiementClient}
                onTogglePaiementFournisseur={handleTogglePaiementFournisseur}
              />
            )}
          </div>
        </div>

        {/* Sidebar KPI */}
        <KPISidebar affaires={affaires} />
      </div>

      {formModal.open && (
        <AffaireForm
          affaire={formModal.affaire}
          clients={clients}
          fournisseurs={fournisseurs}
          affairesExistantes={affairesRef}
          onSave={handleSave}
          onClose={() => setFormModal({ open: false })}
        />
      )}

      {resumeOpen && (
        <ResumeMois affaires={affaires} onClose={() => setResumeOpen(false)} />
      )}
    </div>
  )
}
