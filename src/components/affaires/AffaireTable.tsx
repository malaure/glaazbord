import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, AlertCircle, Trash2, Search, X } from 'lucide-react'
import type { Affaire, StatutAffaire, TypeAffaire } from '@/types'
import { calculerAffaire, formaterEuros, estEnRetard, sansParents } from '@/utils/calculs'
import { BadgeStatut, BadgeType } from '@/components/ui/Badge'
import { Toggle } from '@/components/ui/Toggle'
import clsx from 'clsx'

type SortKey =
  | 'dateDevis' | 'dateFacture' | 'dateEcheance'
  | 'societe' | 'designation' | 'interlocuteur' | 'fournisseur'
  | 'refDevis' | 'refFacture'
  | 'statut' | 'type'
  | 'prixVenteTotalHT' | 'netEnPoche' | 'margeBrute' | 'chargesTotal' | 'coutAchatTTC'
  | 'clientPaye' | 'fournisseurPaye'

interface Filtres {
  statuts: StatutAffaire[]
  types: TypeAffaire[]
  societe: string
  moisPaiement: string
  showAnnules: boolean
  recherche: string
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
    recherche: '',
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

    if (filtres.recherche) {
      const q = filtres.recherche.toLowerCase()
      list = list.filter(a => {
        const haystack = [
          a.societe, a.designation, a.refDevis, a.refFacture,
          a.interlocuteur, a.fournisseur, a.notes,
          a.prixVenteHT?.toString(), a.coutAchatTTC?.toString(),
          a.montantBienHT?.toString(), a.montantServiceHT?.toString(),
        ].join(' ').toLowerCase()
        return haystack.includes(q)
      })
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
        } else if (sortKey === 'margeBrute') {
          va = calculerAffaire(a).margeBrute
          vb = calculerAffaire(b).margeBrute
        } else if (sortKey === 'chargesTotal') {
          va = calculerAffaire(a).chargesTotal
          vb = calculerAffaire(b).chargesTotal
        } else if (sortKey === 'clientPaye') {
          va = a.clientPaye ? 1 : 0
          vb = b.clientPaye ? 1 : 0
        } else if (sortKey === 'fournisseurPaye') {
          va = a.fournisseurPaye ? 1 : 0
          vb = b.fournisseurPaye ? 1 : 0
        } else {
          va = (a[sortKey as keyof Affaire] ?? '') as string
          vb = (b[sortKey as keyof Affaire] ?? '') as string
        }
        if (va < vb) return sortDir === 'asc' ? -1 : 1
        if (va > vb) return sortDir === 'asc' ? 1 : -1
        return 0
      })
    }

    return list
  }, [affaires, filtres, sortKey, sortDir]) // filtres inclut recherche

  const totauxFiltres = useMemo(() => {
    if (!filtres.societe && !filtres.statuts.length) return null
    return sansParents(affairesFiltrees).reduce((acc, a) => {
      if (a.statut === 'ANNULE') return acc
      const c = calculerAffaire(a)
      return {
        prixVente: acc.prixVente + c.prixVenteTotalHT,
        marge: acc.marge + c.margeBrute,
        net: acc.net + c.netEnPoche,
      }
    }, { prixVente: 0, marge: 0, net: 0 })
  }, [affairesFiltrees, filtres.societe, filtres.statuts])

  const toggleStatut = (s: StatutAffaire) => setFiltres(f => ({
    ...f,
    statuts: f.statuts.includes(s) ? f.statuts.filter(x => x !== s) : [...f.statuts, s]
  }))

  return (
    <div className="flex flex-col gap-3">
      {/* Barre de filtres */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Recherche globale */}
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher…"
            value={filtres.recherche}
            onChange={e => setFiltres(f => ({ ...f, recherche: e.target.value }))}
            className="pl-7 pr-7 py-1 rounded border border-border text-xs text-text-main bg-white focus:outline-none focus:border-lavender-400 w-44"
          />
          {filtres.recherche && (
            <button
              onClick={() => setFiltres(f => ({ ...f, recherche: '' }))}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
            >
              <X size={12} />
            </button>
          )}
        </div>

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

      {/* Totaux client filtré */}
      {totauxFiltres && (() => {
        const STATUT_LABELS: Record<StatutAffaire, string> = { DEVIS: 'Devis', FACTURE: 'Facturé', PAYE: 'Payé', ANNULE: 'Annulé' }
        const parts = [
          ...(filtres.statuts.length ? [filtres.statuts.map(s => STATUT_LABELS[s]).join(' + ')] : []),
          ...(filtres.societe ? [filtres.societe] : []),
        ]
        const nbActives = sansParents(affairesFiltrees).filter(a => a.statut !== 'ANNULE').length
        return (
          <div className="flex items-center gap-5 px-4 py-2.5 rounded-lg bg-lavender-50 border border-lavender-100 text-sm">
            <span className="font-medium text-lavender-700">{parts.join(' — ')}</span>
            <span className="text-text-muted text-xs">{nbActives} affaire{nbActives !== 1 ? 's' : ''}</span>
            <span className="ml-auto text-xs text-text-muted">CA HT <span className="font-semibold text-text-main">{formaterEuros(totauxFiltres.prixVente)}</span></span>
            <span className="text-xs text-text-muted">Marge <span className="font-semibold text-text-main">{formaterEuros(totauxFiltres.marge)}</span></span>
            <span className="text-xs text-text-muted">Net en poche <span className="font-semibold text-mint-600">{formaterEuros(totauxFiltres.net)}</span></span>
          </div>
        )
      })()}

      {/* Tableau */}
      <div className="overflow-x-auto rounded-lg border border-border bg-white shadow-card">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-surface border-b border-border">
              <Th label="Statut" sortKey="statut" current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Réf devis" sortKey="refDevis" current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Réf facture" sortKey="refFacture" current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Date devis" sortKey="dateDevis" current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Date facture" sortKey="dateFacture" current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Société" sortKey="societe" current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Interlocuteur" sortKey="interlocuteur" current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Désignation" sortKey="designation" current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Type" sortKey="type" current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Coût achat TTC" sortKey="coutAchatTTC" current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Prix vente HT" sortKey="prixVenteTotalHT" current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Marge brute" sortKey="margeBrute" current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Charges" sortKey="chargesTotal" current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Net en poche" sortKey="netEnPoche" current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Échéance" sortKey="dateEcheance" current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Fournisseur" sortKey="fournisseur" current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Fourn. payé" sortKey="fournisseurPaye" current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Client payé" sortKey="clientPaye" current={sortKey} dir={sortDir} onSort={handleSort} />
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
