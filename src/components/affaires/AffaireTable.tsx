import { useState, useMemo, useCallback, useRef } from 'react'
import { ChevronUp, ChevronDown, AlertCircle, Trash2, Search, X, Printer } from 'lucide-react'
import type { Affaire, StatutProd, TypeAffaire } from '@/types'
import { calculerAffaire, formaterEuros, estEnRetard, sansParents } from '@/utils/calculs'
import { BadgeStatutProd, BadgeType } from '@/components/ui/Badge'
import { Toggle } from '@/components/ui/Toggle'
import clsx from 'clsx'

type SortKey =
  | 'dateDevis' | 'dateFacture' | 'dateEcheance'
  | 'societe' | 'designation' | 'interlocuteur' | 'fournisseur'
  | 'refDevis' | 'refFacture' | 'refCommandeClient'
  | 'statutProd' | 'type'
  | 'prixVenteTotalHT' | 'netEnPoche' | 'margeBrute' | 'chargesTotal' | 'coutAchatTTC'
  | 'clientPaye' | 'fournisseurPaye'

const STATUT_PROD_ORDER: Record<StatutProd, number> = {
  COMMANDE_RECUE: 1, CREATION_A_FAIRE: 2, ATTENTE_BAT: 3,
  EN_IMPRESSION: 4, EN_LIVRAISON: 5, ATTENTE_FACTURATION: 6, PROD_FACTURE: 7,
  PAYE: 8, ANNULE: 9,
}

const STATUT_PROD_LABELS: Record<StatutProd, string> = {
  COMMANDE_RECUE: 'Commande reçue', CREATION_A_FAIRE: 'Création à faire',
  ATTENTE_BAT: 'Attente BAT', EN_IMPRESSION: 'En impression',
  EN_LIVRAISON: 'En livraison', ATTENTE_FACTURATION: 'Attente facturation',
  PROD_FACTURE: 'Facturé', PAYE: 'Payé', ANNULE: 'Annulé',
}

const INPUT_CLS = 'text-xs border border-lavender-300 rounded px-1.5 py-0.5 bg-white focus:outline-none focus:border-lavender-500 w-full'
const SELECT_CLS = 'text-xs border border-lavender-300 rounded px-1 py-0.5 bg-white focus:outline-none focus:border-lavender-500'

interface Filtres {
  statutProd: StatutProd | ''
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
  onPatchAffaire: (id: string, patch: Partial<Affaire>) => void
  onImprimerEtiquette: (a: Affaire) => void
}

const DEFAULT_COL_WIDTHS: Record<string, number> = {
  prod: 148, refDevis: 112, refFacture: 112, refCommandeClient: 128,
  dateDevis: 90, dateFacture: 90, societe: 150, interlocuteur: 116,
  designation: 240, type: 72, coutAchat: 104, prixVente: 104,
  marge: 92, charges: 84, net: 92, echeance: 90,
  fournisseur: 112, fournPaye: 90, clientPaye: 82, notes: 160, actions: 64,
}

function Th({ label, sortKey, current, dir, onSort, colId, width, onResizeStart }: {
  label: string
  sortKey?: SortKey
  current: SortKey | null
  dir: 'asc' | 'desc'
  onSort: (k: SortKey) => void
  colId?: string
  width?: number
  onResizeStart?: (colId: string, e: React.MouseEvent<HTMLDivElement>) => void
}) {
  return (
    <th
      style={width !== undefined ? { width } : undefined}
      className="relative px-3 py-2.5 text-left text-2xs font-medium text-text-muted uppercase tracking-wide whitespace-nowrap select-none"
      onClick={() => sortKey && onSort(sortKey)}
    >
      <span className={clsx('flex items-center gap-1', sortKey && 'cursor-pointer hover:text-text-main')}>
        {label}
        {sortKey && current === sortKey && (
          dir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />
        )}
      </span>
      {colId && onResizeStart && (
        <div
          className="absolute right-0 top-1 bottom-1 w-1.5 cursor-col-resize rounded opacity-0 hover:opacity-100 hover:bg-lavender-300 transition-opacity"
          onMouseDown={e => onResizeStart(colId, e)}
          onClick={e => e.stopPropagation()}
        />
      )}
    </th>
  )
}

export function AffaireTable({ affaires, onEdit, onSupprimer, onTogglePaiementClient, onTogglePaiementFournisseur, onPatchAffaire, onImprimerEtiquette }: Props) {
  const [sortKey, setSortKey] = useState<SortKey | null>('dateDevis')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [editingCell, setEditingCell] = useState<{ id: string; col: string } | null>(null)

  const [colWidths, setColWidths] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('glaazboard-col-widths')
      return saved ? { ...DEFAULT_COL_WIDTHS, ...JSON.parse(saved) } : DEFAULT_COL_WIDTHS
    } catch { return DEFAULT_COL_WIDTHS }
  })

  const resizingRef = useRef(false)

  const startResize = useCallback((colId: string, e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const th = e.currentTarget.parentElement as HTMLTableCellElement
    const startX = e.clientX
    const startW = th.getBoundingClientRect().width
    resizingRef.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    const onMove = (ev: MouseEvent) => {
      const newW = Math.max(48, startW + ev.clientX - startX)
      th.style.width = newW + 'px'
    }
    const onUp = (ev: MouseEvent) => {
      const newW = Math.max(48, startW + ev.clientX - startX)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      resizingRef.current = false
      setColWidths(prev => {
        const updated = { ...prev, [colId]: newW }
        localStorage.setItem('glaazboard-col-widths', JSON.stringify(updated))
        return updated
      })
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [])

  const [filtres, setFiltres] = useState<Filtres>({
    statutProd: '',
    types: [],
    societe: '',
    moisPaiement: '',
    showAnnules: false,
    recherche: '',
  })

  const isEditing = (id: string, col: string) => editingCell?.id === id && editingCell?.col === col

  const startEdit = useCallback((id: string, col: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingCell({ id, col })
  }, [])

  const commitText = useCallback((id: string, field: keyof Affaire, value: string) => {
    onPatchAffaire(id, { [field]: value || undefined } as Partial<Affaire>)
    setEditingCell(null)
  }, [onPatchAffaire])

  const handleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(k); setSortDir('asc') }
  }

  const societes = useMemo(() =>
    [...new Set(affaires.map(a => a.societe))].sort(), [affaires])

  const affairesFiltrees = useMemo(() => {
    let list = affaires

    if (!filtres.showAnnules) list = list.filter(a => a.statutProd !== 'ANNULE')
    if (filtres.types.length) list = list.filter(a => filtres.types.includes(a.type))
    if (filtres.societe) list = list.filter(a => a.societe === filtres.societe)
    if (filtres.moisPaiement) {
      list = list.filter(a =>
        a.datePaiementClient?.startsWith(filtres.moisPaiement) ||
        a.dateFacture?.startsWith(filtres.moisPaiement) ||
        a.dateDevis?.startsWith(filtres.moisPaiement)
      )
    }
    if (filtres.statutProd) {
      list = list.filter(a => a.statutProd === filtres.statutProd)
    }

    if (filtres.recherche) {
      const q = filtres.recherche.toLowerCase()
      list = list.filter(a => {
        const haystack = [
          a.societe, a.designation, a.refDevis, a.refFacture, a.refCommandeClient,
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
        } else if (sortKey === 'statutProd') {
          va = a.statutProd ? STATUT_PROD_ORDER[a.statutProd] : 0
          vb = b.statutProd ? STATUT_PROD_ORDER[b.statutProd] : 0
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
  }, [affaires, filtres, sortKey, sortDir])

  const totauxFiltres = useMemo(() => {
    if (!filtres.societe && !filtres.statutProd) return null
    return sansParents(affairesFiltrees).reduce((acc, a) => {
      if (a.statutProd === 'ANNULE') return acc
      const c = calculerAffaire(a)
      return {
        prixVente: acc.prixVente + c.prixVenteTotalHT,
        marge: acc.marge + c.margeBrute,
        net: acc.net + c.netEnPoche,
      }
    }, { prixVente: 0, marge: 0, net: 0 })
  }, [affairesFiltrees, filtres.societe, filtres.statutProd])

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

        <select
          value={filtres.societe}
          onChange={e => setFiltres(f => ({ ...f, societe: e.target.value }))}
          className="px-2.5 py-1 rounded border border-border text-xs text-text-muted bg-white focus:outline-none focus:border-lavender-400"
        >
          <option value="">Toutes les sociétés</option>
          {societes.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          value={filtres.statutProd}
          onChange={e => setFiltres(f => ({ ...f, statutProd: e.target.value as StatutProd | '' }))}
          className="px-2.5 py-1 rounded border border-border text-xs text-text-muted bg-white focus:outline-none focus:border-lavender-400"
        >
          <option value="">Tous statuts prod.</option>
          {(Object.keys(STATUT_PROD_LABELS) as StatutProd[]).map(s => (
            <option key={s} value={s}>{STATUT_PROD_LABELS[s]}</option>
          ))}
        </select>

        <input
          type="month"
          title="Filtre par mois (devis, facture ou paiement)"
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
        const parts = [
          ...(filtres.statutProd ? [STATUT_PROD_LABELS[filtres.statutProd]] : []),
          ...(filtres.societe ? [filtres.societe] : []),
        ]
        const nbActives = sansParents(affairesFiltrees).filter(a => a.statutProd !== 'ANNULE').length
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
        <table className="border-collapse text-sm" style={{ tableLayout: 'fixed', width: 'max-content', minWidth: '100%' }}>
          <thead>
            <tr className="bg-surface border-b border-border">
              <Th label="Statut"         sortKey="statutProd"       current={sortKey} dir={sortDir} onSort={handleSort} colId="prod"          width={colWidths.prod}          onResizeStart={startResize} />
              <Th label="Réf devis"      sortKey="refDevis"        current={sortKey} dir={sortDir} onSort={handleSort} colId="refDevis"      width={colWidths.refDevis}      onResizeStart={startResize} />
              <Th label="Réf facture"    sortKey="refFacture"      current={sortKey} dir={sortDir} onSort={handleSort} colId="refFacture"    width={colWidths.refFacture}    onResizeStart={startResize} />
              <Th label="Réf. cde client" sortKey="refCommandeClient" current={sortKey} dir={sortDir} onSort={handleSort} colId="refCommandeClient" width={colWidths.refCommandeClient} onResizeStart={startResize} />
              <Th label="Date devis"     sortKey="dateDevis"       current={sortKey} dir={sortDir} onSort={handleSort} colId="dateDevis"     width={colWidths.dateDevis}     onResizeStart={startResize} />
              <Th label="Date facture"   sortKey="dateFacture"     current={sortKey} dir={sortDir} onSort={handleSort} colId="dateFacture"   width={colWidths.dateFacture}   onResizeStart={startResize} />
              <Th label="Société"        sortKey="societe"         current={sortKey} dir={sortDir} onSort={handleSort} colId="societe"       width={colWidths.societe}       onResizeStart={startResize} />
              <Th label="Interlocuteur"  sortKey="interlocuteur"   current={sortKey} dir={sortDir} onSort={handleSort} colId="interlocuteur" width={colWidths.interlocuteur} onResizeStart={startResize} />
              <Th label="Désignation"    sortKey="designation"     current={sortKey} dir={sortDir} onSort={handleSort} colId="designation"   width={colWidths.designation}   onResizeStart={startResize} />
              <Th label="Type"           sortKey="type"            current={sortKey} dir={sortDir} onSort={handleSort} colId="type"          width={colWidths.type}          onResizeStart={startResize} />
              <Th label="Coût achat TTC" sortKey="coutAchatTTC"    current={sortKey} dir={sortDir} onSort={handleSort} colId="coutAchat"     width={colWidths.coutAchat}     onResizeStart={startResize} />
              <Th label="Prix vente HT"  sortKey="prixVenteTotalHT" current={sortKey} dir={sortDir} onSort={handleSort} colId="prixVente"    width={colWidths.prixVente}     onResizeStart={startResize} />
              <Th label="Marge brute"    sortKey="margeBrute"      current={sortKey} dir={sortDir} onSort={handleSort} colId="marge"         width={colWidths.marge}         onResizeStart={startResize} />
              <Th label="Charges"        sortKey="chargesTotal"    current={sortKey} dir={sortDir} onSort={handleSort} colId="charges"       width={colWidths.charges}       onResizeStart={startResize} />
              <Th label="Net en poche"   sortKey="netEnPoche"      current={sortKey} dir={sortDir} onSort={handleSort} colId="net"           width={colWidths.net}           onResizeStart={startResize} />
              <Th label="Échéance"       sortKey="dateEcheance"    current={sortKey} dir={sortDir} onSort={handleSort} colId="echeance"      width={colWidths.echeance}      onResizeStart={startResize} />
              <Th label="Fournisseur"    sortKey="fournisseur"     current={sortKey} dir={sortDir} onSort={handleSort} colId="fournisseur"   width={colWidths.fournisseur}   onResizeStart={startResize} />
              <Th label="Fourn. payé"    sortKey="fournisseurPaye" current={sortKey} dir={sortDir} onSort={handleSort} colId="fournPaye"     width={colWidths.fournPaye}     onResizeStart={startResize} />
              <Th label="Client payé"    sortKey="clientPaye"      current={sortKey} dir={sortDir} onSort={handleSort} colId="clientPaye"    width={colWidths.clientPaye}    onResizeStart={startResize} />
              <Th label="Notes"                                     current={sortKey} dir={sortDir} onSort={handleSort} colId="notes"         width={colWidths.notes}         onResizeStart={startResize} />
              <th style={{ width: colWidths.actions }} className="sticky right-0 z-10 bg-surface px-3 py-2.5 border-l border-border" />
            </tr>
          </thead>
          <tbody>
            {affairesFiltrees.length === 0 && (
              <tr>
                <td colSpan={20} className="px-4 py-10 text-center text-sm text-text-muted">
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
                  onClick={() => !editingCell && onEdit(a)}
                  className={clsx(
                    'border-b border-border transition-colors',
                    'group',
                    !editingCell && 'cursor-pointer',
                    retard ? 'bg-peach-50 hover:bg-peach-100' : 'hover:bg-surface',
                    isChild && 'border-l-2 border-l-lavender-200',
                    a.statutProd === 'ANNULE' && 'opacity-50'
                  )}
                >
                  {/* Statut */}
                  <td
                    className="px-3 py-2 whitespace-nowrap cursor-pointer hover:bg-lavender-50"
                    onClick={e => startEdit(a.id, 'statutProd', e)}
                  >
                    {isEditing(a.id, 'statutProd') ? (
                      <select
                        autoFocus
                        defaultValue={a.statutProd}
                        className={SELECT_CLS}
                        onChange={e => {
                          const newStatutProd = e.target.value as StatutProd
                          const patch: Partial<Affaire> = { statutProd: newStatutProd }
                          if (newStatutProd === 'PAYE') {
                            patch.clientPaye = true
                            patch.datePaiementClient = a.datePaiementClient ?? new Date().toISOString().split('T')[0]
                          } else if (a.statutProd === 'PAYE') {
                            patch.clientPaye = false
                            patch.datePaiementClient = undefined
                          }
                          onPatchAffaire(a.id, patch)
                          setEditingCell(null)
                        }}
                        onBlur={() => setEditingCell(null)}
                        onClick={e => e.stopPropagation()}
                      >
                        {(Object.keys(STATUT_PROD_LABELS) as StatutProd[]).map(s => (
                          <option key={s} value={s}>{STATUT_PROD_LABELS[s]}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center gap-1">
                        <BadgeStatutProd statut={a.statutProd} />
                        {retard && <AlertCircle size={12} className="text-peach-500" />}
                      </div>
                    )}
                  </td>

                  {/* Réf devis */}
                  <td
                    className="px-3 py-2 text-xs font-mono text-text-muted whitespace-nowrap cursor-text hover:bg-lavender-50"
                    onClick={e => startEdit(a.id, 'refDevis', e)}
                  >
                    {isEditing(a.id, 'refDevis') ? (
                      <input
                        autoFocus
                        type="text"
                        defaultValue={a.refDevis}
                        className={INPUT_CLS + ' font-mono'}
                        onBlur={e => { onPatchAffaire(a.id, { refDevis: e.target.value }); setEditingCell(null) }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') { onPatchAffaire(a.id, { refDevis: e.currentTarget.value }); setEditingCell(null) }
                          if (e.key === 'Escape') setEditingCell(null)
                        }}
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <>
                        {isChild && <span className="mr-1 text-lavender-400">↳</span>}
                        {a.refDevis}
                      </>
                    )}
                  </td>

                  {/* Réf facture */}
                  <td
                    className="px-3 py-2 text-xs font-mono text-text-muted whitespace-nowrap cursor-text hover:bg-lavender-50"
                    onClick={e => startEdit(a.id, 'refFacture', e)}
                  >
                    {isEditing(a.id, 'refFacture') ? (
                      <input
                        autoFocus
                        type="text"
                        defaultValue={a.refFacture ?? ''}
                        className={INPUT_CLS + ' font-mono'}
                        onBlur={e => { commitText(a.id, 'refFacture', e.target.value) }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') { commitText(a.id, 'refFacture', e.currentTarget.value) }
                          if (e.key === 'Escape') setEditingCell(null)
                        }}
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <span>{a.refFacture ?? '—'}</span>
                    )}
                  </td>

                  {/* Réf. commande client */}
                  <td
                    className="px-3 py-2 text-xs font-mono text-text-muted whitespace-nowrap cursor-text hover:bg-lavender-50"
                    onClick={e => startEdit(a.id, 'refCommandeClient', e)}
                  >
                    {isEditing(a.id, 'refCommandeClient') ? (
                      <input
                        autoFocus
                        type="text"
                        defaultValue={a.refCommandeClient ?? ''}
                        className={INPUT_CLS + ' font-mono'}
                        onBlur={e => { commitText(a.id, 'refCommandeClient', e.target.value) }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') { commitText(a.id, 'refCommandeClient', e.currentTarget.value) }
                          if (e.key === 'Escape') setEditingCell(null)
                        }}
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <span>{a.refCommandeClient ?? '—'}</span>
                    )}
                  </td>

                  {/* Date devis */}
                  <td
                    className="px-3 py-2 text-xs text-text-muted whitespace-nowrap cursor-text hover:bg-lavender-50"
                    onClick={e => startEdit(a.id, 'dateDevis', e)}
                  >
                    {isEditing(a.id, 'dateDevis') ? (
                      <input
                        autoFocus
                        type="date"
                        defaultValue={a.dateDevis ?? ''}
                        className={SELECT_CLS}
                        onBlur={e => { commitText(a.id, 'dateDevis', e.target.value) }}
                        onKeyDown={e => { if (e.key === 'Escape') setEditingCell(null) }}
                        onChange={e => { if (e.target.value) { commitText(a.id, 'dateDevis', e.target.value) } }}
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <span>{a.dateDevis ? new Date(a.dateDevis).toLocaleDateString('fr-FR') : '—'}</span>
                    )}
                  </td>

                  {/* Date facture */}
                  <td
                    className="px-3 py-2 text-xs text-text-muted whitespace-nowrap cursor-text hover:bg-lavender-50"
                    onClick={e => startEdit(a.id, 'dateFacture', e)}
                  >
                    {isEditing(a.id, 'dateFacture') ? (
                      <input
                        autoFocus
                        type="date"
                        defaultValue={a.dateFacture ?? ''}
                        className={SELECT_CLS}
                        onBlur={e => { commitText(a.id, 'dateFacture', e.target.value) }}
                        onKeyDown={e => { if (e.key === 'Escape') setEditingCell(null) }}
                        onChange={e => { if (e.target.value) { commitText(a.id, 'dateFacture', e.target.value) } }}
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <span>{a.dateFacture ? new Date(a.dateFacture).toLocaleDateString('fr-FR') : '—'}</span>
                    )}
                  </td>

                  {/* Société — non éditable inline (gestion client liée) */}
                  <td className="px-3 py-2 text-sm font-medium text-text-main max-w-0">
                    <span className="block truncate" title={a.societe}>{a.societe}</span>
                  </td>

                  {/* Interlocuteur — non éditable inline (liste liée au client) */}
                  <td className="px-3 py-2 text-xs text-text-muted max-w-0">
                    <span className="block truncate">{a.interlocuteur ?? '—'}</span>
                  </td>

                  {/* Désignation */}
                  <td
                    className="px-3 py-2 text-xs text-text-main max-w-0 cursor-text hover:bg-lavender-50"
                    onClick={e => startEdit(a.id, 'designation', e)}
                  >
                    {isEditing(a.id, 'designation') ? (
                      <input
                        autoFocus
                        type="text"
                        defaultValue={a.designation}
                        className={INPUT_CLS}
                        onBlur={e => { onPatchAffaire(a.id, { designation: e.target.value }); setEditingCell(null) }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') { onPatchAffaire(a.id, { designation: e.currentTarget.value }); setEditingCell(null) }
                          if (e.key === 'Escape') setEditingCell(null)
                        }}
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <>
                        <span title={a.designation} className="block truncate">{a.designation}</span>
                        {isParent && <span className="text-2xs text-lavender-400">acomptes liés</span>}
                      </>
                    )}
                  </td>

                  {/* Type — non éditable inline (change la structure des montants) */}
                  <td className="px-3 py-2"><BadgeType type={a.type} /></td>

                  {/* Coût achat — non éditable inline (logique métier complexe) */}
                  <td className="px-3 py-2 text-xs text-text-muted text-right whitespace-nowrap">
                    {formaterEuros(a.coutAchatTTC)}
                  </td>

                  {/* Prix vente — calculé, non éditable inline */}
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

                  {/* Échéance */}
                  <td
                    className={clsx(
                      'px-3 py-2 text-xs whitespace-nowrap cursor-text hover:bg-lavender-50',
                      retard ? 'text-peach-600 font-medium' : 'text-text-muted'
                    )}
                    onClick={e => startEdit(a.id, 'dateEcheance', e)}
                  >
                    {isEditing(a.id, 'dateEcheance') ? (
                      <input
                        autoFocus
                        type="date"
                        defaultValue={a.dateEcheance ?? ''}
                        className={SELECT_CLS}
                        onBlur={e => { commitText(a.id, 'dateEcheance', e.target.value) }}
                        onKeyDown={e => { if (e.key === 'Escape') setEditingCell(null) }}
                        onChange={e => { if (e.target.value) { commitText(a.id, 'dateEcheance', e.target.value) } }}
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <span>
                        {a.dateEcheance ? new Date(a.dateEcheance).toLocaleDateString('fr-FR') : '—'}
                      </span>
                    )}
                  </td>

                  {/* Fournisseur */}
                  <td
                    className="px-3 py-2 text-xs text-text-muted whitespace-nowrap cursor-text hover:bg-lavender-50"
                    onClick={e => startEdit(a.id, 'fournisseur', e)}
                  >
                    {isEditing(a.id, 'fournisseur') ? (
                      <input
                        autoFocus
                        type="text"
                        defaultValue={a.fournisseur ?? ''}
                        className={INPUT_CLS}
                        onBlur={e => { commitText(a.id, 'fournisseur', e.target.value) }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') { commitText(a.id, 'fournisseur', e.currentTarget.value) }
                          if (e.key === 'Escape') setEditingCell(null)
                        }}
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <span>{a.fournisseur ?? '—'}</span>
                    )}
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

                  {/* Notes */}
                  <td
                    className="px-3 py-2 text-xs text-text-muted max-w-0 cursor-text hover:bg-lavender-50"
                    onClick={e => startEdit(a.id, 'notes', e)}
                  >
                    {isEditing(a.id, 'notes') ? (
                      <input
                        autoFocus
                        type="text"
                        defaultValue={a.notes ?? ''}
                        className={INPUT_CLS}
                        onBlur={e => { commitText(a.id, 'notes', e.target.value) }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') { commitText(a.id, 'notes', e.currentTarget.value) }
                          if (e.key === 'Escape') setEditingCell(null)
                        }}
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <span title={a.notes ?? ''} className="block truncate">{a.notes ?? '—'}</span>
                    )}
                  </td>

                  <td
                    className={clsx(
                      'sticky right-0 z-10 px-2 py-2 border-l border-border',
                      retard ? 'bg-peach-50 group-hover:bg-peach-100' : 'bg-white group-hover:bg-surface'
                    )}
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => onImprimerEtiquette(a)}
                        title="Imprimer étiquette de livraison"
                        className="p-1.5 rounded text-text-muted hover:bg-lavender-50 hover:text-lavender-600 transition-colors"
                      >
                        <Printer size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Supprimer "${a.refDevis}" ?`)) onSupprimer(a.id)
                        }}
                        className="p-1.5 rounded text-text-muted hover:bg-peach-50 hover:text-peach-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
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
