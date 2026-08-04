import clsx from 'clsx'
import type { StatutProd, TypeAffaire } from '@/types'

const typeStyles: Record<TypeAffaire, string> = {
  BIEN: 'bg-amber-50 text-amber-600',
  SERVICE: 'bg-violet-50 text-violet-500',
  MIXTE: 'bg-teal-50 text-teal-600',
}

const statutProdStyles: Record<StatutProd, string> = {
  COMMANDE_RECUE:       'bg-sky-100 text-sky-700 border-sky-200',
  CREATION_A_FAIRE:     'bg-indigo-100 text-indigo-700 border-indigo-200',
  ATTENTE_BAT:          'bg-orange-100 text-orange-700 border-orange-200',
  EN_IMPRESSION:        'bg-purple-100 text-purple-700 border-purple-200',
  EN_LIVRAISON:         'bg-teal-100 text-teal-700 border-teal-200',
  ATTENTE_FACTURATION:  'bg-amber-100 text-amber-700 border-amber-200',
  PROD_FACTURE:         'bg-green-100 text-green-700 border-green-200',
  PAYE:                 'bg-mint-50 text-mint-600 border-mint-100',
  ANNULE:               'bg-gray-50 text-gray-400 border-gray-100',
}

const statutProdLabels: Record<StatutProd, string> = {
  COMMANDE_RECUE:       'Commande reçue',
  CREATION_A_FAIRE:     'Création à faire',
  ATTENTE_BAT:          'Attente BAT',
  EN_IMPRESSION:        'En impression',
  EN_LIVRAISON:         'En livraison',
  ATTENTE_FACTURATION:  'Attente facturation',
  PROD_FACTURE:         'Facturé',
  PAYE:                 'Payé',
  ANNULE:               'Annulé',
}

export function BadgeStatutProd({ statut }: { statut: StatutProd }) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap',
      statutProdStyles[statut]
    )}>
      {statutProdLabels[statut]}
    </span>
  )
}

export { statutProdLabels }

export function BadgeType({ type }: { type: TypeAffaire }) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      typeStyles[type]
    )}>
      {type}
    </span>
  )
}
