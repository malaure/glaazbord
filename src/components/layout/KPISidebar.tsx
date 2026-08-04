import { useMemo } from 'react'
import type { Affaire } from '@/types'
import { calculerAffaire, formaterEuros, sansParents } from '@/utils/calculs'

interface Props {
  affaires: Affaire[]
}

function kpiAnnee(affaires: Affaire[]) {
  const actives = affaires.filter(a => a.statutProd !== 'ANNULE')
  return actives.reduce((acc, a) => {
    const c = calculerAffaire(a)
    acc.caHT += c.prixVenteTotalHT
    acc.achats += a.coutAchatTTC ?? 0
    acc.marge += c.margeBrute
    acc.charges += c.chargesTotal
    acc.net += c.netEnPoche
    return acc
  }, { caHT: 0, achats: 0, marge: 0, charges: 0, net: 0 })
}

function kpiMois(affaires: Affaire[], annee: number, mois: number) {
  const payeesDuMois = affaires.filter(a => {
    if (a.statutProd === 'ANNULE' || !a.datePaiementClient) return false
    const d = new Date(a.datePaiementClient)
    return d.getFullYear() === annee && d.getMonth() + 1 === mois
  })
  return payeesDuMois.reduce((acc, a) => {
    const c = calculerAffaire(a)
    acc.caHT += c.prixVenteTotalHT
    acc.bien += (a.type === 'BIEN' ? a.prixVenteHT : a.montantBienHT) ?? 0
    acc.service += (a.type === 'SERVICE' ? a.prixVenteHT : a.montantServiceHT) ?? 0
    acc.charges += c.chargesTotal
    acc.net += c.netEnPoche
    return acc
  }, { caHT: 0, bien: 0, service: 0, charges: 0, net: 0 })
}

function soldeCompte(affaires: Affaire[]) {
  const encaissees = affaires.filter(a => a.statutProd !== 'ANNULE' && a.clientPaye)
  const { encaisse, urssaf } = encaissees.reduce((acc, a) => {
    const c = calculerAffaire(a)
    acc.encaisse += c.prixVenteTotalHT
    acc.urssaf += c.chargesTotal
    return acc
  }, { encaisse: 0, urssaf: 0 })

  const fournisseursPayes = affaires
    .filter(a => a.statutProd !== 'ANNULE' && a.fournisseurPaye)
    .reduce((acc, a) => acc + (a.coutAchatTTC ?? 0), 0)

  return { encaisse, urssaf, fournisseursPayes, solde: encaisse - urssaf - fournisseursPayes }
}

function tresorerie(affaires: Affaire[]) {
  const actives = affaires.filter(a => a.statutProd !== 'ANNULE')
  return actives.reduce((acc, a) => {
    const c = calculerAffaire(a)
    if (a.clientPaye) acc.encaisse += c.prixVenteTotalHT
    else if (a.refFacture) acc.aEncaisser += c.prixVenteTotalHT
    else acc.enAttente += c.prixVenteTotalHT
    if (a.fournisseurPaye) acc.fournisseursPaie += a.coutAchatTTC ?? 0
    else acc.fournisseursRestant += a.coutAchatTTC ?? 0
    return acc
  }, { encaisse: 0, aEncaisser: 0, enAttente: 0, fournisseursPaie: 0, fournisseursRestant: 0 })
}

function KPIRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-text-muted">{label}</span>
      <span className={`text-xs font-medium ${highlight ? 'text-mint-600' : 'text-text-main'}`}>{value}</span>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-border p-4 shadow-card">
      <h3 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-3">{title}</h3>
      {children}
    </div>
  )
}

export function KPISidebar({ affaires }: Props) {
  const now = new Date()
  const annee = now.getFullYear()
  const moisCourant = now.getMonth() + 1
  const moisPrecedent = moisCourant === 1 ? 12 : moisCourant - 1
  const anneePrecedente = moisCourant === 1 ? annee - 1 : annee

  const af = useMemo(() => sansParents(affaires), [affaires])
  const anneeData = useMemo(() => kpiAnnee(af), [af])
  const moisData = useMemo(() => kpiMois(af, annee, moisCourant), [af, annee, moisCourant])
  const moisPrecData = useMemo(() => kpiMois(af, anneePrecedente, moisPrecedent), [af, anneePrecedente, moisPrecedent])
  const tresoData = useMemo(() => tresorerie(af), [af])
  const soldeData = useMemo(() => soldeCompte(af), [af])

  const nomMois = (m: number) => new Date(2024, m - 1).toLocaleString('fr-FR', { month: 'long' })

  return (
    <aside className="w-[280px] flex-shrink-0 bg-surface border-l border-border h-[calc(100vh-56px)] sticky top-14 overflow-y-auto p-4 space-y-3">

      <Card title={`Année ${annee}`}>
        <KPIRow label="CA HT facturé" value={formaterEuros(anneeData.caHT)} />
        <KPIRow label="Achats fournisseurs" value={formaterEuros(anneeData.achats)} />
        <KPIRow label="Marge brute" value={formaterEuros(anneeData.marge)} />
        <KPIRow label="Charges URSSAF+IR" value={formaterEuros(anneeData.charges)} />
        <div className="mt-2 pt-2 border-t border-border">
          <KPIRow label="Net en poche" value={formaterEuros(anneeData.net)} highlight />
        </div>
      </Card>

      <Card title={`${nomMois(moisCourant)} (M en cours)`}>
        <KPIRow label="CA Biens HT" value={formaterEuros(moisData.bien)} />
        <KPIRow label="CA Services HT" value={formaterEuros(moisData.service)} />
        <KPIRow label="Total HT encaissé" value={formaterEuros(moisData.caHT)} />
        <KPIRow label="Charges" value={formaterEuros(moisData.charges)} />
        <div className="mt-2 pt-2 border-t border-border">
          <KPIRow label="Net en poche" value={formaterEuros(moisData.net)} highlight />
        </div>
      </Card>

      <Card title={`${nomMois(moisPrecedent)} (M-1)`}>
        <KPIRow label="CA HT encaissé" value={formaterEuros(moisPrecData.caHT)} />
        <KPIRow label="Charges" value={formaterEuros(moisPrecData.charges)} />
        <KPIRow label="Net en poche" value={formaterEuros(moisPrecData.net)} highlight />
      </Card>

      <Card title="Sur mon compte">
        <KPIRow label="Encaissé clients" value={formaterEuros(soldeData.encaisse)} />
        <KPIRow label="− URSSAF réglée" value={formaterEuros(soldeData.urssaf)} />
        <KPIRow label="− Fournisseurs réglés" value={formaterEuros(soldeData.fournisseursPayes)} />
        <div className="mt-2 pt-2 border-t border-border">
          <KPIRow label="Solde estimé" value={formaterEuros(soldeData.solde)} highlight />
        </div>
        <p className="text-2xs text-text-muted mt-2 leading-relaxed">
          URSSAF calculée sur tous les encaissements — à ajuster si une déclaration est encore en attente.
        </p>
      </Card>

      <Card title="Trésorerie & En-cours">
        <KPIRow label="Encaissé clients" value={formaterEuros(tresoData.encaisse)} />
        <KPIRow label="À encaisser (facturé)" value={formaterEuros(tresoData.aEncaisser)} />
        <KPIRow label="En attente (devis)" value={formaterEuros(tresoData.enAttente)} />
        <div className="mt-2 pt-2 border-t border-border">
          <KPIRow label="Fournisseurs payés" value={formaterEuros(tresoData.fournisseursPaie)} />
          <KPIRow label="Fournisseurs à payer" value={formaterEuros(tresoData.fournisseursRestant)} />
        </div>
      </Card>

    </aside>
  )
}
