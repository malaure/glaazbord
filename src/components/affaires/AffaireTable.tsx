import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, AlertCircle, Trash2 } from 'lucide-react'
import type { Affaire, StatutAffaire, TypeAffaire } from '@/types'
import { calculerAffaire, formaterEuros, estEnRetard } from '@/utils/calculs'
import { BadgeStatut, BadgeType } from '@/components/ui/Badge'
import { Toggle } from '@/components/ui/Toggle'
import clsx from 'clsx'

type SortKey = 'dateDevis' | 'dateFacture' | 'societe' | 'designation' | 'prixVenteTotalHT' | 'netEnPoche' | 'statut'

interface Filtres {
  statuts: StatutAffaire[]
  types: TypeAffaire[]
  societe: string
  moisPaiement: string
  showAnnules: boolean
}

interface Props {
  affaires: Affaire[]
  onEdit: (a: Affaire) => void
  onSupprimer: (id: string) => void
  onTogglePaiementClient: (id: string, paye: boolean) => void
  onTogglePaiementFournisseur: (id: string, paye: boolean) => void
}

function Th({ label, sortKey, current, dir, onSort }: {
  label: string
  sortKey?: SortKey
  current: SortKey | null
  dir: 'asc' | 'desc'
  onSort: (k: SortKey) => void
}) {
  return (
    <th
      className={clsx(
        'px-3 py-2.5 text-left text-2xs font-medium text-text-muted uppercase tracking-wide whitespace-nowrap select-none',
        sortKey && 'cursor-pointer hover:text-text-main'
      )}
      onClick={() => sortKey && onSort(sortKey)}
    >
      <span className="flex items-center gap-1">
        {label}
        {sortKey && current === sortKey && (
          dir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />
        )}
      </span>
    </th>
  )
}

export function AffaireTable({ affaires, onEdit, onSupprimer, onTogglePaiementClient, onTogglePaiementFournisseur }: Props) {
  const [sortKey, setSortKey] = useState<SortKey | null>('dateDevis')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [filtres, setFiltres] = useState<Filtres>({
    statuts: [],
    types: [],
    societe: '',
    moisPaiement: '',
    showAnnules: false,
  })

  const handleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(k); setSortDir('asc') }
  }

  const societes = useMemo(() =>
    [...new Set(affaires.map(a => a.societe))].sort(), [affaires])

  const affairesFiltrees = useMemo(() => {
    let list = affaires

    if (!filtres.showAnnules) list = list.filter(a => a.statut !== 'ANNULE')
    if (filtres.statuts.length) list = list.filter(a => filtres.statuts.includes(a.statut))
    if (filtres.types.length) list = list.filter(a => filtres.types.includes(a.type))
    if (filtres.societe) list = list.filter(a => a.societe === filtres.societe)
    if (filtres.moisPaiement) {
      list = list.filter(a => a.datePaiementClient?.startsWith(filtres.moisPaiement))
    }

    if (sortKey) {
      list = [...list].sort((a, b) => {
        let va: string | number = ''
        let vb: string | number = ''
        if (sortKey === 'prixVenteTotalHT') {
          va = calculerAffaire(a).prixVenteTotalHT
          vb = calculerAffaire(b).prixVenteTotalHT
        } else if (sortKey === 'netEnPoche') {
          va = calculerAffaire(a).netEnPoche
          vb = calculerAffaire(b).netEnPoche
        } else {
          va = (a[sortKey] ?? '') as string
          vb = (b[sortKey] ?? '') as string
        }
        if (va < vb) return sortDir === 'asc' ? -1 : 1
        if (va > vb) return sortDir === 'asc' ? 1 : -1
        return 0
      })
    }

    return list
  }, [affaires, filtres, sortKey, sortDir])

  const toggleStatut = (s: StatutAffaire) => setFiltres(f => ({
    ...f,
    statuts: f.statuts.includes(s) ? f.statuts.filter(x => x !== s) : [...f.statuts, s]
  }))

  return (
    <div className="flex flex-col gap-3">
      {/* Barre de filtres */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['DEVIS', 'FACTURE', 'PAYE'] as StatutAffaire[]).map(s => (
          <button
            key={s}
            onClick={() => toggleStatut(s)}
            className={clsx(
              'px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
              filtres.statuts.includes(s)
                ? 'bg-lavender-100 text-lavender-600 border-lavender-200'
                : 'bg-white text-text-muted border-border hover:border-lavender-200'
            )}
          >
            {s === 'FACTURE' ? 'Facturé' : s === 'PAYE' ? 'Payé' : 'Devis'}
          </button>
        ))}

        <select
          value={filtres.societe}
          onChange={e => setFiltres(f => ({ ...f, societe: e.target.value }))}
          className="px-2.5 py-1 rounded border border-border text-xs text-text-muted bg-white focus:outline-none focus:border-lavender-400"
        >
          <option value="">Toutes les sociétés</option>
          {societes.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <input
          type="month"
          value={filtres.moisPaiement}
          onChange={e => setFiltres(f => ({ ...f, moisPaiement: e.target.value }))}
          className="px-2.5 py-1 rounded border border-border text-xs text-text-muted bg-white focus:outline-none focus:border-lavender-400"
        />

        <label className="flex items-center gap-1.5 text-xs text-text-muted cursor-pointer ml-auto">
          <input
            type="checkbox"
            checked={filtres.showAnnules}
            onChange={e => setFiltres(f => ({ ...f, showAnnules: e.target.checked }))}
            className="rounded"
          />
          Afficher annulées
        </label>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto rounded-lg border border-border bg-white shadow-card">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-surface border-b border-border">
              <Th label="Statut" sortKey="statut" current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Réf devis" current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Réf facture" current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Date devis" sortKey="dateDevis" current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Date facture" sortKey="dateFacture" current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Société" sortKey="societe" current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Interlocuteur" current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Désignation" sortKey="designation" current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Type" current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Coût achat TTC" current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Prix vente HT" sortKey="prixVenteTotalHT" current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Marge brute" current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Charges" current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Net en poche" sortKey="netEnPoche" current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Échéance" current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Fournisseur" current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Fourn. payé" current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Client payé" current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Notes" current={sortKey} dir={sortDir} onSort={handleSort} />
              <th className="px-3 py-2.5 w-8" />
            </tr>
          </thead>
          <tbody>
            {affairesFiltrees.length === 0 && (
              <tr>
                <td colSpan={19} className="px-4 py-10 text-center text-sm text-text-muted">
                  Aucune affaire
                </td>
              </tr>
            )}
            {affairesFiltrees.map(a => {
              const calc = calculerAffaire(a)
              const retard = estEnRetard(a)
              const isParent = affairesFiltrees.some(x => x.affaireParentId === a.id)
              const isChild = !!a.affaireParentId

              return (
                <tr
                  key={a.id}
                  onClick={() => onEdit(a)}
                  className={clsx(
                    'border-b border-border cursor-pointer transition-colors',
                    'group',
                  retard ? 'bg-peach-50 hover:bg-peach-100' : 'hover:bg-surface',
                    isChild && 'border-l-2 border-l-lavender-200',
                    a.statut === 'ANNULE' && 'opacity-50'
                  )}
                >
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <BadgeStatut statut={a.statut} />
                      {retard && <AlertCircle size={12} className="text-peach-500" />}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs font-mono text-text-muted whitespace-nowrap">
                    {isChild && <span className="mr-1 text-lavender-400">↳</span>}
                    {a.refDevis}
                  </td>
                  <td className="px-3 py-2 text-xs font-mono text-text-muted whitespace-nowrap">
                    {a.refFacture ?? '—'}
                  </td>
                  <td className="px-3 py-2 text-xs text-text-muted whitespace-nowrap">
                    {a.dateDevis ? new Date(a.dateDevis).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td className="px-3 py-2 text-xs text-text-muted whitespace-nowrap">
                    {a.dateFacture ? new Date(a.dateFacture).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td className="px-3 py-2 text-sm font-medium text-text-main whitespace-nowrap">
                    {a.societe}
                  </td>
                  <td className="px-3 py-2 text-xs text-text-muted whitespace-nowrap">
                    {a.interlocuteur ?? '—'}
                  </td>
                  <td className="px-3 py-2 text-xs text-text-main max-w-[180px]">
                    <span title={a.designation} className="block truncate">{a.designation}</span>
                    {isParent && (
                      <span className="text-2xs text-lavender-400">acomptes liés</span>
                    )}
                  </td>
                  <td className="px-3 py-2"><BadgeType type={a.type} /></td>
                  <td className="px-3 py-2 text-xs text-text-muted text-right whitespace-nowrap">
                    {formaterEuros(a.coutAchatTTC)}
                  </td>
                  <td className="px-3 py-2 text-xs font-medium text-text-main text-right whitespace-nowrap">
                    {a.type === 'MIXTE' ? (
                      <div className="text-right">
                        <div className="text-2xs text-text-muted">B: {formaterEuros(a.montantBienHT)}</div>
                        <div className="text-2xs text-text-muted">S: {formaterEuros(a.montantServiceHT)}</div>
                        <div className="font-medium">{formaterEuros(calc.prixVenteTotalHT)}</div>
                      </div>
                    ) : formaterEuros(calc.prixVenteTotalHT)}
                  </td>
                  <td className="px-3 py-2 text-xs text-text-main text-right whitespace-nowrap">
                    {formaterEuros(calc.margeBrute)}
                  </td>
                  <td className="px-3 py-2 text-xs text-text-muted text-right whitespace-nowrap">
                    {formaterEuros(calc.chargesTotal)}
                  </td>
                  <td className="px-3 py-2 text-xs font-semibold text-mint-600 text-right whitespace-nowrap">
                    {formaterEuros(calc.netEnPoche)}
                  </td>
                  <td className={clsx(
                    'px-3 py-2 text-xs whitespace-nowrap',
                    retard ? 'text-peach-600 font-medium' : 'text-text-muted'
                  )}>
                    {a.dateEcheance
                      ? new Date(a.dateEcheance).toLocaleDateString('fr-FR')
                      : '—'}
                  </td>
                  <td className="px-3 py-2 text-xs text-text-muted whitespace-nowrap">
                    {a.fournisseur ?? '—'}
                  </td>
                  <td className="px-3 py-2" onClick={e => e.stopPropagation()}>
                    <Toggle
                      checked={a.fournisseurPaye}
                      date={a.datePaiementFournisseur}
                      onChange={v => onTogglePaiementFournisseur(a.id, v)}
                    />
                  </td>
                  <td className="px-3 py-2" onClick={e => e.stopPropagation()}>
                    <Toggle
                      checked={a.clientPaye}
                      date={a.datePaiementClient}
                      onChange={v => onTogglePaiementClient(a.id, v)}
                    />
                  </td>
                  <td className="px-3 py-2 text-xs text-text-muted max-w-[120px]">
                    <span title={a.notes ?? ''} className="block truncate">{a.notes ?? '—'}</span>
                  </td>
                  <td className="px-2 py-2" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        if (confirm(`Supprimer "${a.refDevis}" ?`)) onSupprimer(a.id)
                      }}
                      className="p-1.5 rounded text-text-muted hover:bg-peach-50 hover:text-peach-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-text-muted text-right">
        {affairesFiltrees.length} affaire{affairesFiltrees.length !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
