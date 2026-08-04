export type TypeAffaire = 'BIEN' | 'SERVICE' | 'MIXTE'
export type StatutProd =
  | 'COMMANDE_RECUE'
  | 'CREATION_A_FAIRE'
  | 'ATTENTE_BAT'
  | 'EN_IMPRESSION'
  | 'EN_LIVRAISON'
  | 'ATTENTE_FACTURATION'
  | 'PROD_FACTURE'
  | 'PAYE'
  | 'ANNULE'

export interface Client {
  id: string
  societe: string
  interlocuteurs: string[]
  delaiPaiementJours: number
  notes?: string
  createdAt: string
}

export interface Fournisseur {
  id: string
  nom: string
  notes?: string
  createdAt: string
}

export interface Affaire {
  id: string
  // Identification
  refDevis: string
  refFacture?: string
  dateDevis?: string
  dateFacture?: string
  // Client
  societe: string
  interlocuteur?: string
  // Projet
  designation: string
  notes?: string
  // Type et montants
  type: TypeAffaire
  prixVenteHT?: number        // BIEN ou SERVICE
  montantBienHT?: number      // MIXTE
  montantServiceHT?: number   // MIXTE
  coutAchatTTC?: number       // BIEN ou MIXTE
  // Fournisseur
  fournisseur?: string
  notesFournisseur?: string
  // Paiements
  delaiPaiementJours?: number
  dateEcheance?: string       // calculée
  fournisseurPaye: boolean
  datePaiementFournisseur?: string
  clientPaye: boolean
  datePaiementClient?: string
  // Production / statut
  statutProd: StatutProd
  // Acomptes
  affaireParentId?: string    // si c'est un acompte lié à une affaire
  // Méta
  createdAt: string
  updatedAt: string
}

export interface CalcResult {
  chargeBien: number
  chargeService: number
  chargesTotal: number
  margeBrute: number
  netEnPoche: number
  prixVenteTotalHT: number
}
