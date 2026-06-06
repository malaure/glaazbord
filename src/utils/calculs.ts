import type { Affaire, CalcResult } from '@/types'

const TAUX_BIEN = 0.133     // URSSAF 12.3% + IR 1%
const TAUX_SERVICE = 0.278  // URSSAF 25.6% + IR 2.2%

export function calculerAffaire(a: Affaire): CalcResult {
  if (a.type === 'BIEN') {
    const pv = a.prixVenteHT ?? 0
    const ca = a.coutAchatTTC ?? 0
    const charge = pv * TAUX_BIEN
    const marge = pv - ca
    return {
      chargeBien: charge,
      chargeService: 0,
      chargesTotal: charge,
      margeBrute: marge,
      netEnPoche: marge - charge,
      prixVenteTotalHT: pv,
    }
  }

  if (a.type === 'SERVICE') {
    const pv = a.prixVenteHT ?? 0
    const charge = pv * TAUX_SERVICE
    return {
      chargeBien: 0,
      chargeService: charge,
      chargesTotal: charge,
      margeBrute: pv,
      netEnPoche: pv - charge,
      prixVenteTotalHT: pv,
    }
  }

  // MIXTE
  const bien = a.montantBienHT ?? 0
  const service = a.montantServiceHT ?? 0
  const ca = a.coutAchatTTC ?? 0
  const chargeBien = bien * TAUX_BIEN
  const chargeService = service * TAUX_SERVICE
  const chargesTotal = chargeBien + chargeService
  const marge = (bien - ca) + service
  return {
    chargeBien,
    chargeService,
    chargesTotal,
    margeBrute: marge,
    netEnPoche: marge - chargesTotal,
    prixVenteTotalHT: bien + service,
  }
}

export function formaterEuros(n: number | undefined): string {
  if (n === undefined || n === null) return '—'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

export function calculerDateEcheance(dateFacture: string, delaiJours: number): string {
  const d = new Date(dateFacture)
  d.setDate(d.getDate() + delaiJours)
  return d.toISOString().split('T')[0]
}

// Exclut les affaires "conteneur" (qui ont des enfants) des calculs financiers
// pour éviter le double comptage avec leurs acomptes/soldes
export function sansParents(affaires: Affaire[]): Affaire[] {
  const parentIds = new Set(
    affaires.map(a => a.affaireParentId).filter((id): id is string => !!id)
  )
  return affaires.filter(a => !parentIds.has(a.id))
}

export function estEnRetard(affaire: Affaire): boolean {
  if (affaire.clientPaye || affaire.statut === 'ANNULE' || affaire.statut === 'DEVIS') return false
  if (!affaire.dateEcheance) return false
  return new Date(affaire.dateEcheance) < new Date()
}
