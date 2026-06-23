import { useMemo, useState } from 'react'
import { X, Printer } from 'lucide-react'
import type { Affaire } from '@/types'
import { calculerAffaire, formaterEuros, sansParents } from '@/utils/calculs'

interface Props {
  affaires: Affaire[]
  onClose: () => void
}

function dansLeMois(date: string | undefined | null, annee: number, mois: number) {
  if (!date) return false
  const d = new Date(date)
  return d.getFullYear() === annee && d.getMonth() + 1 === mois
}

export function ResumeMois({ affaires, onClose }: Props) {
  const now = new Date()
  const [mois, setMois] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  )

  const data = useMemo(() => {
    const [annee, m] = mois.split('-').map(Number)
    const base = sansParents(affaires).filter(a => a.statut !== 'ANNULE')

    const encaissees = base.filter(a =>
      a.statut === 'PAYE' && dansLeMois(a.datePaiementClient, annee, m)
    )
    const facturees = base.filter(a =>
      a.statut === 'FACTURE' && dansLeMois(a.dateFacture, annee, m)
    )
    const devis = base.filter(a =>
      a.statut === 'DEVIS' && dansLeMois(a.dateDevis, annee, m)
    )

    const sumCA = (list: Affaire[]) =>
      list.reduce((s, a) => {
        const c = calculerAffaire(a)
        return s + c.prixVenteTotalHT
      }, 0)

    const accUrsaff = encaissees.reduce((a, af) => {
      const c = calculerAffaire(af)
      a.bien    += af.type === 'BIEN'    ? (af.prixVenteHT ?? 0) : af.type === 'MIXTE' ? (af.montantBienHT ?? 0) : 0
      a.service += af.type === 'SERVICE' ? (af.prixVenteHT ?? 0) : af.type === 'MIXTE' ? (af.montantServiceHT ?? 0) : 0
      a.chargeBien    += c.chargeBien
      a.chargeService += c.chargeService
      a.net           += c.netEnPoche
      return a
    }, { bien: 0, service: 0, chargeBien: 0, chargeService: 0, net: 0 })

    return {
      encaissees,
      facturees,
      devis,
      caEncaisse:  sumCA(encaissees),
      caFacture:   sumCA(facturees),
      caDevis:     sumCA(devis),
      urssaf: { ...accUrsaff, chargesTotal: accUrsaff.chargeBien + accUrsaff.chargeService },
    }
  }, [affaires, mois])

  const labelMois = new Date(mois + '-01').toLocaleString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-modal w-full max-w-xl mx-4 overflow-hidden max-h-[90vh] flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-base font-medium text-text-main">Résumé du mois</h2>
            <p className="text-xs text-text-muted">Toutes affaires du mois</p>
          </div>
          <div className="flex items-center gap-2">
            <input type="month" value={mois} onChange={e => setMois(e.target.value)}
              className="px-2 py-1 text-sm border border-border rounded focus:outline-none focus:border-lavender-400" />
            <button onClick={onClose} className="text-text-muted hover:text-text-main">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto" id="resume-print">
          <div className="text-center">
            <h3 className="text-lg font-medium text-text-main capitalize">{labelMois}</h3>
          </div>

          {/* Vue d'ensemble */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surface rounded-lg p-3 text-center">
              <p className="text-2xs text-text-muted uppercase tracking-wide mb-1">Encaissé</p>
              <p className="text-base font-semibold text-mint-600">{formaterEuros(data.caEncaisse)}</p>
              <p className="text-2xs text-text-muted">{data.encaissees.length} affaire{data.encaissees.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="bg-surface rounded-lg p-3 text-center">
              <p className="text-2xs text-text-muted uppercase tracking-wide mb-1">Facturé</p>
              <p className="text-base font-semibold text-lavender-600">{formaterEuros(data.caFacture)}</p>
              <p className="text-2xs text-text-muted">{data.facturees.length} affaire{data.facturees.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="bg-surface rounded-lg p-3 text-center">
              <p className="text-2xs text-text-muted uppercase tracking-wide mb-1">Devis</p>
              <p className="text-base font-semibold text-powder-600">{formaterEuros(data.caDevis)}</p>
              <p className="text-2xs text-text-muted">{data.devis.length} affaire{data.devis.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Section URSSAF — uniquement si des encaissements */}
          {data.encaissees.length > 0 && (
            <>
              <div className="bg-surface rounded-lg p-4 space-y-2">
                <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide">Charges URSSAF + IR (sur encaissé)</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Biens (13,3%)</span>
                    <span>{formaterEuros(data.urssaf.chargeBien)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Services (27,8%)</span>
                    <span>{formaterEuros(data.urssaf.chargeService)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium border-t border-border pt-1">
                    <span>Total charges</span>
                    <span>{formaterEuros(data.urssaf.chargesTotal)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-mint-50 border border-mint-100 rounded-lg p-4 flex items-center justify-between">
                <span className="text-sm font-medium text-text-main">Net en poche</span>
                <span className="text-xl font-semibold text-mint-600">{formaterEuros(data.urssaf.net)}</span>
              </div>
            </>
          )}

          {/* Listes */}
          {[
            { label: 'Encaissées', list: data.encaissees, dateFn: (a: Affaire) => a.datePaiementClient, color: 'text-mint-600' },
            { label: 'Facturées (non encore payées)', list: data.facturees, dateFn: (a: Affaire) => a.dateFacture, color: 'text-lavender-600' },
            { label: 'Devis', list: data.devis, dateFn: (a: Affaire) => a.dateDevis, color: 'text-powder-600' },
          ].map(({ label, list, dateFn, color }) => list.length > 0 && (
            <div key={label}>
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">{label}</h4>
              <div className="space-y-1">
                {list.map(a => {
                  const c = calculerAffaire(a)
                  const d = dateFn(a)
                  return (
                    <div key={a.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                      <div>
                        <p className="text-xs font-medium text-text-main">{a.societe}</p>
                        <p className="text-2xs text-text-muted truncate max-w-[260px]">{a.designation}</p>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <p className={`text-xs font-medium ${color}`}>{formaterEuros(c.prixVenteTotalHT)}</p>
                        <p className="text-2xs text-text-muted">
                          {d ? new Date(d).toLocaleDateString('fr-FR') : ''}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          <p className="text-2xs text-text-muted text-center">
            Encaissé = base de la déclaration URSSAF sur autoentrepreneur.urssaf.fr
          </p>
        </div>

        <div className="px-6 py-3 border-t border-border flex justify-end gap-2 shrink-0">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border text-text-main hover:bg-surface"
          >
            <Printer size={14} />
            Imprimer / PDF
          </button>
          <button onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-lavender-500 to-powder-500">
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
