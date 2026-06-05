import { useMemo, useState } from 'react'
import { X, Printer } from 'lucide-react'
import type { Affaire } from '@/types'
import { calculerAffaire, formaterEuros } from '@/utils/calculs'

interface Props {
  affaires: Affaire[]
  onClose: () => void
}

export function ResumeMois({ affaires, onClose }: Props) {
  const now = new Date()
  const [mois, setMois] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  )

  const data = useMemo(() => {
    const [annee, m] = mois.split('-').map(Number)
    const encaissees = affaires.filter(a => {
      if (a.statut === 'ANNULE' || !a.datePaiementClient) return false
      const d = new Date(a.datePaiementClient)
      return d.getFullYear() === annee && d.getMonth() + 1 === m
    })

    const acc = encaissees.reduce((a, af) => {
      const c = calculerAffaire(af)
      a.bien += (af.type === 'BIEN' ? (af.prixVenteHT ?? 0) : af.type === 'MIXTE' ? (af.montantBienHT ?? 0) : 0)
      a.service += (af.type === 'SERVICE' ? (af.prixVenteHT ?? 0) : af.type === 'MIXTE' ? (af.montantServiceHT ?? 0) : 0)
      a.chargeBien += c.chargeBien
      a.chargeService += c.chargeService
      a.net += c.netEnPoche
      return a
    }, { bien: 0, service: 0, chargeBien: 0, chargeService: 0, net: 0 })

    return {
      totaux: { ...acc, total: acc.bien + acc.service, chargesTotal: acc.chargeBien + acc.chargeService },
      affaires: encaissees,
    }
  }, [affaires, mois])

  const labelMois = new Date(mois + '-01').toLocaleString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-modal w-full max-w-xl mx-4 overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-medium text-text-main">Résumé du mois</h2>
            <p className="text-xs text-text-muted">Basé sur les encaissements réels</p>
          </div>
          <div className="flex items-center gap-2">
            <input type="month" value={mois} onChange={e => setMois(e.target.value)}
              className="px-2 py-1 text-sm border border-border rounded focus:outline-none focus:border-lavender-400" />
            <button onClick={onClose} className="text-text-muted hover:text-text-main">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5" id="resume-print">
          <div className="text-center">
            <h3 className="text-lg font-medium text-text-main capitalize">{labelMois}</h3>
            <p className="text-xs text-text-muted">{data.affaires.length} affaire{data.affaires.length !== 1 ? 's' : ''} encaissée{data.affaires.length !== 1 ? 's' : ''}</p>
          </div>

          {/* CA */}
          <div className="bg-surface rounded-lg p-4 space-y-2">
            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide">Chiffre d'affaires encaissé</h4>
            <div className="grid grid-cols-3 gap-3 mt-2">
              <div className="text-center">
                <p className="text-2xs text-text-muted">Biens HT</p>
                <p className="text-base font-medium text-text-main">{formaterEuros(data.totaux.bien)}</p>
              </div>
              <div className="text-center">
                <p className="text-2xs text-text-muted">Services HT</p>
                <p className="text-base font-medium text-text-main">{formaterEuros(data.totaux.service)}</p>
              </div>
              <div className="text-center">
                <p className="text-2xs text-text-muted font-semibold">TOTAL HT</p>
                <p className="text-lg font-semibold text-text-main">{formaterEuros(data.totaux.total)}</p>
              </div>
            </div>
          </div>

          {/* Charges */}
          <div className="bg-surface rounded-lg p-4 space-y-2">
            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide">Charges URSSAF + IR</h4>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">Biens (13,3%)</span>
                <span>{formaterEuros(data.totaux.chargeBien)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">Services (27,8%)</span>
                <span>{formaterEuros(data.totaux.chargeService)}</span>
              </div>
              <div className="flex justify-between text-xs font-medium border-t border-border pt-1">
                <span>Total charges</span>
                <span>{formaterEuros(data.totaux.chargesTotal)}</span>
              </div>
            </div>
          </div>

          {/* Net */}
          <div className="bg-mint-50 border border-mint-100 rounded-lg p-4 flex items-center justify-between">
            <span className="text-sm font-medium text-text-main">Net en poche</span>
            <span className="text-xl font-semibold text-mint-600">{formaterEuros(data.totaux.net)}</span>
          </div>

          {/* Liste affaires */}
          {data.affaires.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Détail des affaires</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {data.affaires.map(a => {
                  const c = calculerAffaire(a)
                  return (
                    <div key={a.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                      <div>
                        <p className="text-xs font-medium text-text-main">{a.societe}</p>
                        <p className="text-2xs text-text-muted truncate max-w-[260px]">{a.designation}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-text-main">{formaterEuros(c.prixVenteTotalHT)}</p>
                        <p className="text-2xs text-text-muted">
                          {a.datePaiementClient
                            ? new Date(a.datePaiementClient).toLocaleDateString('fr-FR')
                            : ''}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <p className="text-2xs text-text-muted text-center">
            À utiliser pour remplir la déclaration sur autoentrepreneur.urssaf.fr
          </p>
        </div>

        <div className="px-6 py-3 border-t border-border flex justify-end gap-2">
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
