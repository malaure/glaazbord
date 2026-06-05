import { useState, useMemo } from 'react'
import { Printer, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Affaire } from '@/types'
import { calculerAffaire, formaterEuros } from '@/utils/calculs'

interface Props {
  affaires: Affaire[]
}

export function ExportURSSAF({ affaires }: Props) {
  const now = new Date()
  const [mode, setMode] = useState<'mois' | 'trimestre'>('mois')
  const [mois, setMois] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  )
  const [trimestre, setTrimestre] = useState(Math.ceil((now.getMonth() + 1) / 3))
  const [annee, setAnnee] = useState(now.getFullYear())

  const data = useMemo(() => {
    let encaissees: Affaire[]

    if (mode === 'mois') {
      const [a, m] = mois.split('-').map(Number)
      encaissees = affaires.filter(af => {
        if (af.statut === 'ANNULE' || !af.datePaiementClient) return false
        const d = new Date(af.datePaiementClient)
        return d.getFullYear() === a && d.getMonth() + 1 === m
      })
    } else {
      const moisDebut = (trimestre - 1) * 3 + 1
      const moisFin = trimestre * 3
      encaissees = affaires.filter(af => {
        if (af.statut === 'ANNULE' || !af.datePaiementClient) return false
        const d = new Date(af.datePaiementClient)
        return d.getFullYear() === annee && d.getMonth() + 1 >= moisDebut && d.getMonth() + 1 <= moisFin
      })
    }

    const totaux = encaissees.reduce((acc, a) => {
      const c = calculerAffaire(a)
      acc.bien += (a.type === 'BIEN' ? (a.prixVenteHT ?? 0) : a.type === 'MIXTE' ? (a.montantBienHT ?? 0) : 0)
      acc.service += (a.type === 'SERVICE' ? (a.prixVenteHT ?? 0) : a.type === 'MIXTE' ? (a.montantServiceHT ?? 0) : 0)
      acc.chargeBien += c.chargeBien
      acc.chargeService += c.chargeService
      acc.net += c.netEnPoche
      return acc
    }, { bien: 0, service: 0, chargeBien: 0, chargeService: 0, net: 0 })

    return {
      affaires: encaissees,
      totaux: {
        ...totaux,
        total: totaux.bien + totaux.service,
        chargesTotal: totaux.chargeBien + totaux.chargeService,
      }
    }
  }, [affaires, mode, mois, trimestre, annee])

  const naviguerMois = (delta: number) => {
    const [y, m] = mois.split('-').map(Number)
    const d = new Date(y, m - 1 + delta, 1)
    setMois(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const periodeLabel = mode === 'mois'
    ? new Date(mois + '-01').toLocaleString('fr-FR', { month: 'long', year: 'numeric' })
    : `T${trimestre} ${annee}`

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-text-main">Export déclaration URSSAF</h1>
          <p className="text-sm text-text-muted">Encaissements réels par période</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border text-text-main hover:bg-surface"
        >
          <Printer size={14} />
          Imprimer / PDF
        </button>
      </div>

      {/* Sélecteur de période */}
      <div className="bg-white rounded-lg border border-border p-4 mb-6 flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          {(['mois', 'trimestre'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                mode === m ? 'bg-lavender-50 border-lavender-300 text-lavender-600' : 'border-border text-text-muted hover:border-lavender-200'
              }`}>
              {m === 'mois' ? 'Mensuel' : 'Trimestriel'}
            </button>
          ))}
        </div>
        {mode === 'mois' ? (
          <div className="flex items-center gap-1">
            <button onClick={() => naviguerMois(-1)}
              className="p-1.5 rounded border border-border text-text-muted hover:bg-surface hover:text-text-main transition-colors">
              <ChevronLeft size={14} />
            </button>
            <input type="month" value={mois} onChange={e => setMois(e.target.value)}
              className="px-2.5 py-1.5 text-sm border border-border rounded focus:outline-none focus:border-lavender-400" />
            <button onClick={() => naviguerMois(1)}
              className="p-1.5 rounded border border-border text-text-muted hover:bg-surface hover:text-text-main transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <select value={trimestre} onChange={e => setTrimestre(Number(e.target.value))}
              className="px-2.5 py-1.5 text-sm border border-border rounded focus:outline-none focus:border-lavender-400">
              <option value={1}>T1 (Jan–Mars)</option>
              <option value={2}>T2 (Avr–Juin)</option>
              <option value={3}>T3 (Juil–Sep)</option>
              <option value={4}>T4 (Oct–Déc)</option>
            </select>
            <input type="number" value={annee} onChange={e => setAnnee(Number(e.target.value))}
              className="w-20 px-2.5 py-1.5 text-sm border border-border rounded focus:outline-none focus:border-lavender-400" />
          </div>
        )}
      </div>

      {/* Document export */}
      <div className="bg-white rounded-lg border border-border overflow-hidden print:border-0">
        {/* En-tête */}
        <div className="px-6 py-5 border-b border-border bg-surface">
          <h2 className="text-base font-medium text-text-main">Déclaration URSSAF — GLAAZ</h2>
          <p className="text-sm text-text-muted capitalize">{periodeLabel}</p>
          <p className="text-xs text-text-muted mt-1">Luis De Carvalho — Auto-entrepreneur BNC</p>
        </div>

        {/* Tableau des affaires */}
        <div className="px-6 py-4">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
            Affaires encaissées ({data.affaires.length})
          </h3>

          {data.affaires.length === 0 ? (
            <p className="text-sm text-text-muted py-4 text-center">Aucun encaissement sur cette période</p>
          ) : (
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-text-muted font-medium">Société</th>
                  <th className="text-left py-2 text-text-muted font-medium">Désignation</th>
                  <th className="text-right py-2 text-text-muted font-medium">Biens HT</th>
                  <th className="text-right py-2 text-text-muted font-medium">Services HT</th>
                  <th className="text-right py-2 text-text-muted font-medium">Date paiement</th>
                </tr>
              </thead>
              <tbody>
                {data.affaires.map(a => (
                  <tr key={a.id} className="border-b border-border last:border-0">
                    <td className="py-2 font-medium text-text-main">{a.societe}</td>
                    <td className="py-2 text-text-muted max-w-[200px]">
                      <span title={a.designation} className="block truncate">{a.designation}</span>
                    </td>
                    <td className="py-2 text-right text-text-main">
                      {formaterEuros(a.type === 'BIEN' ? a.prixVenteHT : a.type === 'MIXTE' ? a.montantBienHT : undefined)}
                    </td>
                    <td className="py-2 text-right text-text-main">
                      {formaterEuros(a.type === 'SERVICE' ? a.prixVenteHT : a.type === 'MIXTE' ? a.montantServiceHT : undefined)}
                    </td>
                    <td className="py-2 text-right text-text-muted">
                      {a.datePaiementClient ? new Date(a.datePaiementClient).toLocaleDateString('fr-FR') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Totaux */}
        <div className="px-6 py-4 border-t border-border bg-surface space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Récapitulatif</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">CA Biens HT</span>
                  <span className="font-medium">{formaterEuros(data.totaux.bien)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">CA Services HT</span>
                  <span className="font-medium">{formaterEuros(data.totaux.service)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-border pt-1.5">
                  <span>CA Total HT</span>
                  <span>{formaterEuros(data.totaux.total)}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Charges Biens (13,3%)</span>
                  <span>{formaterEuros(data.totaux.chargeBien)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Charges Services (27,8%)</span>
                  <span>{formaterEuros(data.totaux.chargeService)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-border pt-1.5">
                  <span>Total charges</span>
                  <span>{formaterEuros(data.totaux.chargesTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-mint-50 border border-mint-100 rounded-lg px-4 py-3 flex justify-between items-center">
            <span className="font-medium text-text-main">Net en poche</span>
            <span className="text-xl font-semibold text-mint-600">{formaterEuros(data.totaux.net)}</span>
          </div>

          <p className="text-2xs text-text-muted">
            Déclaration à saisir sur autoentrepreneur.urssaf.fr — les montants Biens et Services sont déclarés séparément
          </p>
        </div>
      </div>
    </div>
  )
}
